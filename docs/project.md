# WristOps — compagnon de monitoring pour Amazfit Bip 5

> Nom de travail. Mini Program Zepp OS qui affiche l'état de la CI, des API et des sites surveillés, et permet quelques actions rapides (relancer un workflow, approuver un déploiement) depuis la montre.

## 1. Objectif

Avoir au poignet une réponse immédiate à la question « est-ce que tout va bien ? » sans sortir le téléphone ni ouvrir GitHub : un écran vert/orange/rouge, le détail de ce qui casse en un tap, et les deux ou trois actions les plus courantes accessibles en deux taps.

Hors périmètre : lire des logs, consulter des diffs, gérer des issues. La montre sert à savoir et à déclencher, pas à investiguer.

## 2. Contraintes de la cible

| Élément | Valeur Bip 5 | Conséquence |
|---|---|---|
| Zepp OS / API_LEVEL | 2.1 / 2.1 | `minVersion: "2.1"` dans `app.json`, ne pas utiliser les API marquées ≥ 3.0 |
| Écran | 320 × 380, carré | UI conçue pour une liste verticale courte, gros éléments tactiles |
| Boutons physiques | 1 | Navigation essentiellement tactile + swipe |
| Réseau | Aucun accès direct depuis la montre | Tout appel HTTP passe par le side service (app Zepp sur le téléphone) |

**Point bloquant à intégrer dès la conception :** les services d'arrière-plan (`@zos/app-service`) et le centre de notifications (`@zos/notification`) n'existent qu'à partir de l'API_LEVEL 3.0. Sur la Bip 5, le Mini Program ne peut donc pas tourner en tâche de fond ni pousser lui-même une alerte quand il est fermé.

Conséquence sur le design (voir §5) : l'app sert de **tableau de bord consulté à la demande**, et les **alertes proactives** passent par une notification téléphone, que la montre relaie déjà nativement avec vibration.

## 3. Fonctionnalités

### V1 — lecture seule

- **Écran synthèse** : un indicateur global (vert = tout OK, orange = en cours / dégradé, rouge = au moins un échec) + l'heure du dernier rafraîchissement.
- **Liste des sondes** : une ligne par élément surveillé, pastille de couleur + nom court.
  - Workflows GitHub Actions : statut du dernier run sur la branche suivie (`success`, `failure`, `in_progress`, `cancelled`).
  - Healthchecks d'API : code HTTP attendu + temps de réponse max.
  - Sites : disponibilité simple (2xx/3xx).
- **Écran détail** : pour une sonde, dernier statut, durée, horodatage, branche/commit court pour la CI, latence pour une URL.
- **Rafraîchissement** : à l'ouverture de l'app, puis toutes les 60 s tant qu'elle est au premier plan, + bouton « rafraîchir ».
- **Vibration** à l'ouverture ou au rafraîchissement si une sonde est passée au rouge depuis le dernier état connu (état précédent conservé en stockage local).
- **Cache** : dernier état stocké sur la montre pour afficher quelque chose instantanément, même si le téléphone n'est pas joignable (avec mention « hors ligne »).

### V2 — actions

- **Relancer un workflow** échoué (`rerun` ou `rerun-failed-jobs`).
- **Approuver ou rejeter un déploiement** en attente sur un environnement protégé.
- Confirmation obligatoire avant chaque action (écran « Relancer *build* sur *main* ? Oui / Non »), retour visuel du résultat.

### V3 — pistes

- Widget secondaire / carte raccourci affichant uniquement l'indicateur global.
- Mise en sourdine d'une sonde pendant X heures.
- Historique sur 24 h (sparkline de disponibilité) si l'agrégateur le fournit.

## 4. Architecture

```
┌──────────────┐   messages BLE   ┌───────────────────┐   HTTPS   ┌──────────────────────┐
│  Device App  │ ◄──────────────► │   Side Service    │ ────────► │ Agrégateur (option B)│
│  (montre)    │                  │ (app Zepp, tél.)  │           │ ou APIs directes (A) │
└──────────────┘                  └───────────────────┘           └──────────────────────┘
                                          ▲
                                          │ settingsStorage
                                  ┌───────────────────┐
                                  │   Settings App    │
                                  │ (page réglages)   │
                                  └───────────────────┘
```

Trois briques du Mini Program :

- **Device App** : pages (synthèse, liste, détail, confirmation), rendu, stockage du dernier état, vibrations.
- **Side Service** : seul composant qui fait du réseau. Reçoit les requêtes de la montre, appelle les API, normalise la réponse, renvoie un payload compact.
- **Settings App** : saisie du token, de la liste des sondes, de l'URL de l'agrégateur. Les valeurs sont lues par le side service ; **le token ne transite jamais vers la montre**.

### Option A — side service autonome

Le side service appelle directement GitHub et les URL à surveiller.

- ✅ Rien à héberger.
- ❌ Logique de polling, d'agrégation et de normalisation dans le side service, plus difficile à tester.
- ❌ Pas d'alerte quand l'app est fermée (cf. §2).

### Option B — agrégateur côté serveur (recommandée)

Un petit service backend (pouvant vivre dans le dashboard d'utilitaires dev) fait le travail de fond :

- interroge GitHub et les URL à intervalle régulier (cron, 1 min),
- conserve l'état courant et un historique court,
- expose un unique `GET /watch/status` déjà résumé pour la montre,
- expose `POST /watch/actions/...` pour les actions V2,
- **envoie une notification push au téléphone** quand une sonde passe au rouge (ntfy, Pushover, Gotify, ou webhook vers une app déjà installée). La montre la relaie et vibre, ce qui contourne l'absence de notifications natives en API 2.1.

- ✅ Alertes réelles même app fermée, side service minimal, logique testable unitairement, réutilisable par le dashboard web et l'extension navigateur.
- ❌ Un service à héberger et sécuriser.

**Choix proposé : option B**, avec un mode A dégradé possible plus tard si on veut une version sans serveur.

## 5. Gestion des alertes

| Situation | Mécanisme |
|---|---|
| App ouverte, sonde passe au rouge | Rafraîchissement 60 s → comparaison avec l'état précédent → vibration + écran rouge |
| App fermée, sonde passe au rouge | Agrégateur → push téléphone → notification relayée par la montre |
| Retour au vert | Push « résolu » optionnel (configurable pour éviter le bruit) |

Règles anti-bruit côté agrégateur : alerter uniquement sur **changement d'état**, ignorer un échec isolé de healthcheck (2 échecs consécutifs requis), regrouper les alertes simultanées.

## 6. Contrat d'API (option B)

### `GET /watch/status`

Réponse volontairement compacte (le lien BLE est lent, l'écran est petit) :

```json
{
  "ts": 1761050000,
  "global": "red",
  "probes": [
    { "id": "ci-api", "type": "ci", "label": "API · main", "state": "red",
      "detail": { "conclusion": "failure", "sha": "a1b2c3d", "duration": 312, "runId": 123456789, "actions": ["rerun"] } },
    { "id": "deploy-prod", "type": "deploy", "label": "Deploy prod", "state": "orange",
      "detail": { "waiting": true, "runId": 123456790, "env": "production", "actions": ["approve", "reject"] } },
    { "id": "health-api", "type": "http", "label": "API health", "state": "green",
      "detail": { "status": 200, "latencyMs": 142 } }
  ]
}
```

États normalisés : `green`, `orange`, `red`, `grey` (inconnu / hors ligne). La montre n'a jamais à interpréter les statuts GitHub bruts.

### `POST /watch/actions/{probeId}`

```json
{ "action": "rerun" }        // ou "approve", "reject"
```

Réponse : `{ "ok": true, "message": "Relancé" }`. L'agrégateur vérifie que l'action figure bien dans `actions` de la sonde avant d'appeler GitHub.

### Appels GitHub sous-jacents

| Besoin | Endpoint REST |
|---|---|
| Derniers runs d'un workflow | `GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs?branch=main&per_page=1` |
| Relancer un run | `POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun` |
| Relancer seulement les jobs échoués | `POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs` |
| Déploiements en attente | `GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments` |
| Approuver / rejeter | `POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments` (`state: approved` ou `rejected`) |

Token : **fine-grained PAT** limité aux dépôts surveillés, permissions *Actions: read & write* et *Deployments: read & write*. Stocké côté agrégateur (variable d'environnement / secret), pas dans l'app Zepp.

## 7. Communication montre ↔ side service

Messages JSON simples, avec un `type` :

| Sens | `type` | Payload |
|---|---|---|
| Montre → tél. | `status.get` | — |
| Tél. → montre | `status.result` | objet `/watch/status` (éventuellement allégé) |
| Montre → tél. | `action.run` | `{ probeId, action }` |
| Tél. → montre | `action.result` | `{ ok, message }` |
| Tél. → montre | `error` | `{ code, message }` (`OFFLINE`, `AUTH`, `TIMEOUT`, `UPSTREAM`) |

Timeout côté montre : 10 s, au-delà affichage de l'état en cache + pastille grise « téléphone injoignable ».

## 8. Sécurité

- Agrégateur protégé par un **jeton applicatif dédié à la montre** (header `Authorization: Bearer …`), distinct du PAT GitHub, révocable indépendamment.
- Ce jeton est saisi dans la Settings App et reste dans le stockage des réglages côté téléphone.
- Actions d'écriture : confirmation explicite sur la montre, liste blanche d'actions par sonde côté serveur, journalisation (qui, quoi, quand).
- Option : limiter les actions de déploiement à certains environnements (pas `production` sans une double confirmation, par exemple).

## 9. UI (320 × 380)

- **Synthèse** : grand cercle de couleur centré, texte « Tout va bien » / « 2 problèmes », heure de mise à jour en bas. Tap → liste.
- **Liste** : lignes de ~64 px de haut (pastille + label tronqué), problèmes triés en tête. Tap → détail.
- **Détail** : 3–4 lignes d'infos max, boutons d'action en bas pleine largeur si disponibles.
- **Confirmation** : question + deux boutons larges Oui / Non, le « Non » en position par défaut.
- Contraste fort, couleurs doublées d'une icône ou d'un mot (✓ / ! / ✕) pour ne pas reposer uniquement sur la couleur.

## 10. Structure du projet (indicative)

```
wristops/
├── app.json                 # targets Bip 5, minVersion 2.1, permissions
├── app.js
├── page/
│   ├── home/index.js        # synthèse
│   ├── list/index.js
│   ├── detail/index.js
│   └── confirm/index.js
├── shared/
│   ├── messaging.js         # wrapper requêtes / réponses
│   ├── state.js             # cache local + diff pour vibration
│   └── colors.js
├── app-side/
│   └── index.js             # side service : fetch agrégateur
├── setting/
│   └── index.js             # page réglages (URL, jeton)
└── assets/
```

Agrégateur (séparé) : un module du dashboard dev existant, ou un petit service dédié — un endpoint de lecture, un endpoint d'action, un job planifié, un client push.

## 11. Plan de réalisation

1. **Socle** : projet Zepp OS généré avec le CLI, ciblé Bip 5, page synthèse avec données mockées, test sur simulateur puis sur la montre via le mode développeur.
2. **Messagerie** : aller-retour montre ↔ side service avec un JSON statique servi par le side service.
3. **Agrégateur minimal** : `GET /watch/status` sur 1 workflow + 1 healthcheck, branchement du side service, settings pour URL + jeton.
4. **UX V1** : liste, détail, cache local, vibration sur passage au rouge, gestion hors ligne.
5. **Alertes push** : job planifié + notification téléphone sur changement d'état.
6. **Actions V2** : rerun puis approbation de déploiement, avec confirmation et journalisation.
7. **Finitions** : widget raccourci, sourdine, éventuelle publication sur le store Zepp.

## 12. Points à valider tôt

- Comportement exact du side service quand l'app montre est en arrière-plan ou écran éteint (durée de vie, latence des messages) : à mesurer sur la vraie montre dès l'étape 2.
- Disponibilité du widget secondaire / carte raccourci et de ses contraintes de rafraîchissement en API 2.1.
- Taille maximale confortable d'un message BLE : garder le payload sous quelques Ko, alléger les `detail` si besoin.
- Choix du service de push (auto-hébergé type ntfy/Gotify vs Pushover) et vérification que ses notifications sont bien relayées par l'app Zepp vers la montre.
