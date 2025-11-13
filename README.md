# Postify API

API de réseau social moderne avec Node.js/Express, Postgres et JWT — packagée avec Docker Compose, testée par Postman/Newman, intégrée en CI avec GitHub Actions, et prête pour Kubernetes.

## Aperçu
- Authentification JWT: `register`, `login`, `logout`
- Posts: création, liste paginée (scroll infini sans doublons), like idempotent, mise à jour, suppression
- REST stateless: routes uniformes, responses JSON, codes HTTP cohérents
- Persistance: Postgres initialisé via `db/init.sql`
- Qualité: collection Postman et tests Newman automatisés
- CI: pipeline GitHub Actions qui build, attend `/readyz`, exécute Newman

## Démarrage rapide
- Prérequis: Docker Desktop, Node.js 18 (optionnel), GitHub Actions (pour CI)
- Lancer les services:
  - Config par variables d’environnement (pas de `.env` versionné)
  - PowerShell (exemple avec placeholders):
    - `\$env:POSTGRES_USER='<POSTGRES_USER>'`
    - `\$env:POSTGRES_PASSWORD='<POSTGRES_PASSWORD>'`
    - `\$env:POSTGRES_DB='<POSTGRES_DB>'`
    - `\$env:DB_HOST='postgres'`
    - `\$env:DB_PORT='5432'`
    - `\$env:DB_USER='<POSTGRES_USER>'`
    - `\$env:DB_PASSWORD='<POSTGRES_PASSWORD>'`
    - `\$env:DB_NAME='<POSTGRES_DB>'`
    - `\$env:JWT_SECRET='<JWT_SECRET>'`
  - Bash (exemple avec placeholders):
    - `export POSTGRES_USER='<POSTGRES_USER>' POSTGRES_PASSWORD='<POSTGRES_PASSWORD>' POSTGRES_DB='<POSTGRES_DB>'`
    - `export DB_HOST='postgres' DB_PORT='5432' DB_USER="$POSTGRES_USER" DB_PASSWORD="$POSTGRES_PASSWORD" DB_NAME="$POSTGRES_DB" JWT_SECRET='<JWT_SECRET>'`
  - Démarrer:
    - `docker compose up -d --build`
  - Vérifier l’API:
    - `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/readyz` → `200`

## Configuration
- Variables requises:
  - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `JWT_SECRET`
- Local (placeholders):
  - PowerShell:
    - `\$env:POSTGRES_USER='<POSTGRES_USER>'`
    - `\$env:POSTGRES_PASSWORD='<POSTGRES_PASSWORD>'`
    - `\$env:POSTGRES_DB='<POSTGRES_DB>'`
    - `\$env:DB_HOST='postgres'`
    - `\$env:DB_PORT='5432'`
    - `\$env:DB_USER='<POSTGRES_USER>'`
    - `\$env:DB_PASSWORD='<POSTGRES_PASSWORD>'`
    - `\$env:DB_NAME='<POSTGRES_DB>'`
    - `\$env:JWT_SECRET='<JWT_SECRET>'`
  - Bash:
    - `export POSTGRES_USER='<POSTGRES_USER>' POSTGRES_PASSWORD='<POSTGRES_PASSWORD>' POSTGRES_DB='<POSTGRES_DB>'`
    - `export DB_HOST='postgres' DB_PORT='5432' DB_USER="$POSTGRES_USER" DB_PASSWORD="$POSTGRES_PASSWORD" DB_NAME="$POSTGRES_DB" JWT_SECRET='<JWT_SECRET>'`
- CI (GitHub Actions):
  - Crée des secrets de repo: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`
  - Le workflow les exporte en variables d’environnement pour `docker compose`
- Notes:
  - Pour les URI `psql`, encode les caractères spéciaux du mot de passe (ex: `@` → `%40`).

## Endpoints
- Auth
  - `POST /auth/register` { email, password }
  - `POST /auth/login` { email, password } → { token }
  - `POST /auth/logout` (Bearer)
- Posts
  - `GET /posts?limit=10&cursor=...` (Bearer) — keyset sur `(created_at, id)` sans doublons
  - `POST /posts` { content } (Bearer)
  - `POST /posts/:id/like` (Bearer) — idempotent
  - `PUT /posts/:id` { content } (Bearer)
  - `DELETE /posts/:id` (Bearer)
- Santé
  - `GET /readyz`, `GET /healthz`

## Tests API
- Collection Postman: `tests/postman_collection.json`
- Environnement: `tests/postman_environment.json`
- Installer Newman:
  - `npm ci`
- Lancer les tests:
  - `npm run test:api`

## CI GitHub Actions
- Fichier: `.github/workflows/pipeline.yaml`
- Secrets requis:
  - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`
- Étapes: checkout → setup Node → `docker compose up -d --build` → wait `/readyz` → `npm run test:api` → logs si échec → `docker compose down -v`

## Docker Compose
- API: `postify-api` sur `http://localhost:3000`
- Postgres: exposé sur `localhost:5433` (`5433:5432`)
- Schéma auto: `db/init.sql` (tables `users`, `posts`, `likes` + index)

## Architecture
- `index.js`: bootstrap server, routes, probes
- `src/controllers`: `authController`, `postController`
- `src/services`: `userService`, `postService`, `tokenService`
- `src/middleware`: `auth` (vérification JWT + révocation)
- `src/db.js`: pool Postgres (`pg`)

## Kubernetes
- Manifests: `k8s/deployment.yaml`, `k8s/service.yaml`
- Probes: `/readyz`, `/healthz`

## Conseils
- Ne pas committer de secrets. En CI, utiliser GitHub Secrets et variables d’environnement.
- En local, préférer exporter des variables plutôt qu’un `.env` versionné.