// Le bundler Zepp n'a pas de loader JSON : le mock est un module JS.
export default {
  "ts": 1761050000,
  "global": "red",
  "probes": [
    { "id": "ci-api", "type": "ci", "label": "API · main", "state": "red",
      "detail": { "conclusion": "failure", "branch": "main", "sha": "a1b2c3d", "duration": 312, "runId": 123456789, "actions": ["rerun"] } },
    { "id": "deploy-prod", "type": "deploy", "label": "Deploy prod", "state": "orange",
      "detail": { "waiting": true, "runId": 123456790, "env": "production", "actions": ["approve", "reject"] } },
    { "id": "health-api", "type": "http", "label": "API health", "state": "green",
      "detail": { "status": 200, "latencyMs": 142 } },
    { "id": "ci-web", "type": "ci", "label": "Site web · main", "state": "green",
      "detail": { "conclusion": "success", "branch": "main", "sha": "9f8e7d6", "duration": 148, "runId": 123456791, "actions": [] } },
    { "id": "ci-worker-longname", "type": "ci", "label": "Worker de traitement des factures · develop", "state": "orange",
      "detail": { "conclusion": "in_progress", "branch": "develop", "sha": "5c4b3a2", "duration": 60, "runId": 123456792, "actions": [] } },
    { "id": "health-site", "type": "http", "label": "Site vitrine", "state": "grey",
      "detail": { "status": 0, "latencyMs": 0 } },
    { "id": "health-auth", "type": "http", "label": "Auth service", "state": "green",
      "detail": { "status": 200, "latencyMs": 98 } },
    { "id": "deploy-staging", "type": "deploy", "label": "Deploy staging", "state": "green",
      "detail": { "waiting": false, "runId": 123456793, "env": "staging", "actions": [] } }
  ]
}
