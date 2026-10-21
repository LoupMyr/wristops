# WristOps — Roadmap à cocher

> Découpage du projet décrit dans `compagnon-monitoring-bip5.md`. Chaque feature se termine par un critère « Terminé quand… » à valider sur la vraie montre, pas seulement sur le simulateur.
>
> Cible : Amazfit Bip 5 — Zepp OS 2.1 / API_LEVEL 2.1 — 320 × 380.

---

## Étape 0 — Préparation

### 0.1 Environnement de dev
- [X] Installer Node.js LTS
- [X] Installer le CLI Zepp OS (`npm i -g @zeppos/zeus-cli`)
- [X] Installer le simulateur Zepp OS et vérifier qu'il démarre
- [X] Créer / vérifier le compte développeur Zepp
- [X] Activer le mode développeur dans l'app Zepp sur le téléphone
- [X] Vérifier que la Bip 5 est appairée et à jour

### 0.2 Dépôts et organisation
- [X] Créer le dépôt `wristops` (Mini Program)
- [X] Ajouter les deux documents (spec + roadmap) dans `docs/`
- [X] Mettre en place `.gitignore`, `.editorconfig`, Prettier / ESLint

### 0.3 Sanity check matériel
- [X] Générer un projet « Hello World » avec le CLI
- [X] Le lancer dans le simulateur
- [X] L'installer sur la montre via QR code (mode dev)
- [X] Afficher un `console.log` depuis la montre et depuis le side service

**Terminé quand :** un Hello World tourne sur la Bip 5 et les logs des deux côtés sont visibles.

---

## Étape 1 — Socle du Mini Program

### 1.1 Configuration du projet
- [X] Renseigner `app.json` : nom, `appId`, version
- [X] Cibler la Bip 5 dans `targets` (forme carrée, 320 × 380)
- [X] Fixer `apiVersion.minVersion` à `2.1`
- [X] Déclarer les modules : pages, `app-side`, `setting`
- [X] Déclarer les permissions nécessaires (vibration, stockage local)
- [X] Ajouter une icône d'app provisoire

### 1.2 Structure des dossiers
- [X] Créer `page/home`, `page/list`, `page/detail`, `page/confirm`
- [X] Créer `shared/` (`messaging.js`, `state.js`, `colors.js`)
- [X] Créer `app-side/index.js`
- [X] Créer `setting/index.js`
- [X] Créer `mocks/status.js` avec 3 sondes (vert, orange, rouge)

### 1.3 Design tokens
- [X] Définir la palette dans `shared/colors.js` (vert, orange, rouge, gris, fond, texte)
- [X] Définir les tailles de police et hauteurs de ligne
- [X] Définir les icônes / symboles d'état (✓ / ! / ✕ / ?)

**Terminé quand :** le projet build sans erreur et s'installe sur la montre avec ses 4 pages vides.

---

## Feature 1 — Écran de synthèse (données mockées)

- [X] Charger `mocks/status.js` directement sur la montre
- [X] Calculer l'état global (pire état parmi les sondes)
- [X] Afficher le grand indicateur central coloré
- [X] Afficher le texte : « Tout va bien » / « N problème(s) »
- [X] Afficher l'heure de dernière mise à jour
- [X] Ajouter le symbole d'état en plus de la couleur
- [X] Tap sur l'écran → navigation vers la liste
- [X] Vérifier la lisibilité en plein jour sur la vraie montre

**Terminé quand :** l'écran affiche correctement les 3 cas (tout vert, un orange, un rouge) en changeant le mock.

---

## Feature 2 — Liste des sondes

- [X] Créer le composant ligne : pastille + symbole + label tronqué
- [X] Trier les sondes : rouge → orange → gris → vert
- [ ] Gérer le scroll vertical si plus de 5 sondes
- [X] Tronquer proprement les labels trop longs
- [X] Tap sur une ligne → navigation vers le détail avec l'`id` de la sonde
- [X] Retour vers la synthèse (swipe / bouton physique)

**Terminé quand :** une liste de 8 sondes mockées est lisible et navigable sans erreur de tap.

---

## Feature 3 — Écran de détail

- [X] Récupérer la sonde via son `id` passé par le router
- [X] Gabarit commun : label, état, horodatage
- [X] Variante `ci` : conclusion, branche, SHA court, durée
- [X] Variante `deploy` : environnement, « en attente » ou non
- [X] Variante `http` : code HTTP, latence
- [X] Zone d'actions en bas (masquée en V1, prévue dans le layout)

**Terminé quand :** les trois types de sondes s'affichent correctement depuis le mock.

---

## Feature 4 — Messagerie montre ↔ side service

### 4.1 Côté side service
- [X] Mettre en place l'écoute des messages entrants
- [X] Router les messages selon `type`
- [X] Répondre à `status.get` avec le mock servi depuis le side service
- [X] Renvoyer un message `error` structuré pour les types inconnus

### 4.2 Côté montre
- [X] Écrire `shared/messaging.js` : `request(type, payload)` → Promise
- [X] Corréler requêtes et réponses (identifiant de requête)
- [X] Gérer le timeout à 10 s
- [X] Remplacer le chargement du mock local par `status.get`

### 4.3 Validation
- [ ] Mesurer la latence d'un aller-retour sur la vraie montre
- [ ] Tester téléphone Bluetooth coupé → erreur `OFFLINE` affichée
- [ ] Tester app Zepp fermée sur le téléphone
- [ ] Noter le comportement quand l'écran de la montre s'éteint (point ouvert de la spec)

**Terminé quand :** la montre affiche des données reçues du téléphone et gère proprement l'absence de téléphone.

---

## Feature 5 — Page de réglages (Settings App)

- [ ] Champ « URL de l'agrégateur »
- [ ] Champ « Jeton montre » (masqué)
- [ ] Bouton « Tester la connexion »
- [ ] Persister les valeurs dans le stockage des réglages
- [ ] Lire ces valeurs depuis le side service
- [ ] Vérifier que le jeton n'est jamais envoyé à la montre

**Terminé quand :** les réglages saisis dans l'app Zepp sont utilisés par le side service et survivent à un redémarrage du téléphone.

---

## Feature 6 — Agrégateur : lecture

### 6.1 Socle serveur
- [ ] Initialiser le projet / module
- [ ] Configuration par variables d'environnement (PAT GitHub, jeton montre, liste des sondes)
- [ ] Middleware d'authentification `Authorization: Bearer <jeton montre>`
- [ ] Endpoint `GET /health` pour l'agrégateur lui-même
- [ ] Logs structurés

### 6.2 Sonde CI GitHub Actions
- [ ] Créer un fine-grained PAT limité aux dépôts suivis (*Actions: read*)
- [ ] Client GitHub : dernier run d'un workflow sur une branche
- [ ] Normaliser `status` / `conclusion` → `green` / `orange` / `red` / `grey`
- [ ] Extraire SHA court, durée, `runId`
- [ ] Tests unitaires de la normalisation

### 6.3 Sonde HTTP (API / site)
- [ ] Requête avec timeout configurable
- [ ] Vérifier le code attendu et la latence max
- [ ] Exiger 2 échecs consécutifs avant de passer au rouge
- [ ] Tests unitaires (succès, lent, erreur, timeout)

### 6.4 Planification et état
- [ ] Job planifié toutes les 60 s
- [ ] Stocker l'état courant de chaque sonde
- [ ] Stocker l'état précédent (pour détecter les changements)
- [ ] Calculer l'état global

### 6.5 Endpoint montre
- [ ] `GET /watch/status` au format compact de la spec
- [ ] Vérifier la taille du payload (quelques Ko max)
- [ ] Tests d'intégration de l'endpoint

### 6.6 Déploiement
- [ ] Déployer l'agrégateur (HTTPS obligatoire)
- [ ] Configurer les secrets en production
- [ ] Vérifier l'accès depuis le réseau mobile, pas seulement le Wi-Fi

**Terminé quand :** `GET /watch/status` renvoie l'état réel d'au moins 1 workflow et 1 healthcheck.

---

## Feature 7 — Branchement réel

- [ ] Side service : remplacer le mock par un `fetch` vers `/watch/status`
- [ ] Ajouter le header d'authentification
- [ ] Mapper les erreurs HTTP → `AUTH`, `TIMEOUT`, `UPSTREAM`
- [ ] Afficher un message clair sur la montre pour chaque code d'erreur
- [ ] Tester avec un jeton invalide
- [ ] Tester avec l'agrégateur arrêté

**Terminé quand :** casser volontairement un build fait passer la montre au rouge au prochain rafraîchissement.

---

## Feature 8 — Rafraîchissement, cache et vibration

### 8.1 Rafraîchissement
- [ ] Rafraîchir à l'ouverture de l'app
- [ ] Rafraîchir toutes les 60 s tant que l'app est au premier plan
- [ ] Bouton / geste « rafraîchir » manuel
- [ ] Indicateur de chargement discret
- [ ] Arrêter le timer quand la page est quittée

### 8.2 Cache local
- [ ] Sauvegarder le dernier état reçu sur la montre
- [ ] Afficher le cache instantanément à l'ouverture
- [ ] Afficher « hors ligne » + âge du cache si le rafraîchissement échoue
- [ ] Pastille grise si le cache a plus de N minutes

### 8.3 Vibration sur changement
- [ ] Comparer le nouvel état au précédent (`shared/state.js`)
- [ ] Vibrer si une sonde passe au rouge
- [ ] Ne pas re-vibrer pour une sonde déjà rouge
- [ ] Motif de vibration distinct (court) pour le retour au vert, optionnel
- [ ] Tests unitaires du diff d'état

**Terminé quand :** l'app ouverte au poignet vibre une seule fois quand un build casse, et affiche le cache sans téléphone.

---

## 🏁 Jalon V1 — Monitoring en lecture seule

- [ ] Utilisation réelle pendant une semaine
- [ ] Liste des irritants notée
- [ ] Corrections prioritaires faites
- [ ] Tag `v1.0.0`

---

## Feature 9 — Alertes push app fermée

- [ ] Choisir le service : ntfy / Gotify (auto-hébergé) ou Pushover
- [ ] Installer l'app correspondante sur le téléphone
- [ ] Vérifier que ses notifications sont relayées par l'app Zepp vers la montre
- [ ] Autoriser cette app dans les réglages de notifications Zepp
- [ ] Agrégateur : envoyer un push sur passage au rouge
- [ ] Agrégateur : regrouper les alertes simultanées en un seul push
- [ ] Option : push « résolu » sur retour au vert (désactivable)
- [ ] Texte du push court et lisible sur 320 px (« ✕ API · main — build échoué »)
- [ ] Tester avec la montre en veille et l'app fermée

**Terminé quand :** un build cassé fait vibrer la montre dans la minute, sans que l'app soit ouverte.

---

## Feature 10 — Action : relancer un workflow

### 10.1 Agrégateur
- [ ] Ajouter la permission *Actions: write* au PAT
- [ ] Exposer `actions: ["rerun"]` sur les sondes CI en échec
- [ ] Endpoint `POST /watch/actions/{probeId}`
- [ ] Vérifier que l'action est autorisée pour la sonde (liste blanche)
- [ ] Appeler `rerun-failed-jobs` (ou `rerun` selon la config)
- [ ] Journaliser l'action (sonde, action, date, résultat)
- [ ] Tests (action autorisée, refusée, erreur GitHub)

### 10.2 Side service
- [ ] Gérer le message `action.run`
- [ ] Appeler l'endpoint d'action et renvoyer `action.result`

### 10.3 Montre
- [ ] Afficher le bouton « Relancer » dans le détail si disponible
- [ ] Page de confirmation : question + Oui / Non, « Non » par défaut
- [ ] Afficher le résultat (« Relancé » / erreur)
- [ ] Rafraîchir l'état après l'action (sonde passe en orange)
- [ ] Empêcher le double tap (bouton désactivé pendant la requête)

**Terminé quand :** un workflow en échec est relancé depuis la montre et apparaît « en cours » au rafraîchissement suivant.

---

## Feature 11 — Action : approuver / rejeter un déploiement

### 11.1 Agrégateur
- [ ] Ajouter la permission *Deployments: read & write* au PAT
- [ ] Nouvelle sonde `deploy` : détecter les runs en attente d'approbation
- [ ] Exposer `actions: ["approve", "reject"]`
- [ ] Appeler l'endpoint `pending_deployments` avec `approved` / `rejected`
- [ ] Règle : double confirmation requise pour `production` (configurable)
- [ ] Journaliser
- [ ] Tests

### 11.2 Montre
- [ ] Deux boutons dans le détail : Approuver / Rejeter
- [ ] Confirmation simple, ou double pour les environnements sensibles
- [ ] Résultat + rafraîchissement

**Terminé quand :** un déploiement sur un environnement protégé de test est approuvé depuis la montre.

---

## 🏁 Jalon V2 — Actions

- [ ] Revue sécurité : jetons, liste blanche, journal
- [ ] Rotation du jeton montre testée (révocation sans toucher au PAT)
- [ ] Tag `v2.0.0`

---

## Feature 12 — Widget / carte raccourci (V3)

- [ ] Vérifier la disponibilité et les contraintes de rafraîchissement en API 2.1
- [ ] Afficher uniquement l'indicateur global + nombre de problèmes
- [ ] Tap → ouverture de l'app sur la synthèse
- [ ] Alimenter depuis le cache local

**Terminé quand :** l'état global est visible depuis l'écran des widgets sans ouvrir l'app.

---

## Feature 13 — Sourdine d'une sonde (V3)

- [ ] Agrégateur : champ `mutedUntil` par sonde
- [ ] Pas de push pour une sonde en sourdine
- [ ] Endpoint d'action `mute` (1 h / 4 h / 24 h)
- [ ] Montre : bouton « Sourdine » dans le détail + choix de durée
- [ ] Affichage d'une icône de sourdine dans la liste

---

## Feature 14 — Historique 24 h (V3)

- [ ] Agrégateur : conserver les états horodatés sur 24 h
- [ ] Ajouter une série compacte au payload (ex. 24 points horaires)
- [ ] Montre : mini barre de disponibilité dans le détail
- [ ] Vérifier l'impact sur la taille du payload

---

## Feature 15 — Finitions et publication (optionnel)

- [ ] Icône définitive et captures d'écran
- [ ] Textes FR / EN (i18n)
- [ ] Revue des performances et de l'autonomie
- [ ] README d'installation (montre + agrégateur)
- [ ] Décider : usage perso uniquement ou publication sur le store Zepp
- [ ] Si publication : rendre l'agrégateur configurable par l'utilisateur et préparer la fiche store

---

## Suivi des points ouverts de la spec

- [ ] Durée de vie du side service écran éteint / app en arrière-plan (mesuré en Feature 4)
- [ ] Taille max confortable d'un message BLE (mesuré en Feature 6.5)
- [ ] Relais des notifications push par l'app Zepp (validé en Feature 9)
- [ ] Contraintes du widget en API 2.1 (validé en Feature 12)
