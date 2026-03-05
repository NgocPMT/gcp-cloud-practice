# Todo App – GCP, Docker, SST, Encore, Drizzle

This project is a modern TypeScript-based Todo API deployed on Google Cloud Platform (GCP) using Docker, Docker Swarm, SST (IaC), and Traefik. It features a RESTful API built with Encore and Drizzle ORM, PostgreSQL for persistence, and Prometheus for monitoring. Infrastructure and deployment are automated via SST and GitHub Actions.

## Features

-   **Todo List API**: RESTful API for managing todo items (add, update, delete, list) with Encore and Drizzle ORM
-   **Persistence**: PostgreSQL database
-   **Monitoring**: Prometheus metrics endpoint
-   **Reverse Proxy**: Traefik for HTTPS, routing, and Let's Encrypt
-   **Dockerized**: Local and production-ready Docker Compose setups
-   **Docker Swarm**: Orchestration on GCP Compute Engine VM
-   **IaC with SST**: Infrastructure managed via SST (TypeScript)
-   **CI/CD**: Automated build, push, and deploy with GitHub Actions

## Tech Stack

-   **API**: TypeScript, Encore, Drizzle ORM
-   **Database**: PostgreSQL
-   **Containerization**: Docker, Docker Compose, Docker Swarm
-   **IaC**: SST (TypeScript)
-   **Monitoring**: Prometheus, Grafana
-   **Reverse Proxy**: Traefik
-   **CI/CD**: GitHub Actions
-   **Cloud**: GCP Artifact Registry, Compute Engine

src/
docker-compose.yml
docker-compose.prod.yml
sst.config.ts # SST infrastructure config
tsconfig.json

## Project Structure

```
.github/workflows/deploy.yml      # CI/CD pipeline
docker-compose.yml                # Local dev stack (Traefik, API, DB, monitoring)
docker-compose.prod.yml           # Production stack (Swarm, Traefik, API, DB, backup, monitoring)
sst.config.ts                     # SST infrastructure config (GCP, VM, Artifact Registry, firewall)
prometheus.yml                    # Prometheus scrape config
src/
  db/
    database.ts                   # Drizzle ORM DB connection
    drizzle.config.ts             # Drizzle migration config
    schema.ts                     # Todos table schema
    migrations/                   # SQL migrations
  todo/
    encore.service.ts             # Encore service definition
    todo.api.ts                   # Encore API endpoints
    todo.repo.ts                  # Data access (Drizzle)
    todo.service.ts               # Business logic
  utils/                          # (Reserved for helpers)
tests/
  placeholder.test.ts             # Vitest placeholder
Dockerfile                        # (if present)
package.json                      # Bun/Node dependencies
tsconfig.json                     # TypeScript config
sst-env.d.ts                      # SST env typings
encore.app                        # Encore config
```

## Local Development

### Prerequisites

-   Docker & Docker Compose
-   Bun (package manager)
-   Encore CLI (for local development)

### Running Locally

1. **With Docker Compose (recommended):**

```bash
docker-compose up -d
```

-   API runs on [http://localhost:80](http://localhost:80)
-   Traefik dashboard: [http://localhost:8080](http://localhost:8080)
-   PostgreSQL DB, Prometheus, and Grafana included

2. **Directly with Encore (for development):**

```bash
encore run
```

-   API runs on [http://localhost:4000](http://localhost:4000)
-   Requires local PostgreSQL (see `.env` for config)

## Infrastructure as Code (IaC) with SST

This project uses [SST](https://sst.dev/) to provision and manage GCP infrastructure. The `sst.config.ts` file defines:

-   GCP project, region, and zone
-   Artifact Registry for Docker images
-   Backup bucket for Postgres WAL-G
-   Service accounts and IAM roles
-   Compute Engine VM (Docker, Swarm, firewall, startup script)

To deploy or update infrastructure:

```bash
sst deploy
```

See [SST documentation](https://docs.sst.dev/) for details.

## Traefik Reverse Proxy

-   Traefik handles HTTPS, routing, and Let's Encrypt certificates
-   In production, Traefik is deployed as a Swarm service and configured via labels in `docker-compose.prod.yml`
-   Example domain: `ngocpmt-todo-app.duckdns.org` (see compose labels)

## Monitoring

-   Prometheus is configured via `prometheus.yml` for metrics scraping
-   Grafana is included for dashboarding (see port 3001)

## Deployment Workflow (GCP)

Deployment is automated via GitHub Actions and Docker Swarm:

-   On push to `main`, the workflow:
    1. Authenticates to GCP
    2. Builds and pushes Docker images to Artifact Registry
    3. Copies production compose and Prometheus config to VM
    4. Deploys/updates the Docker Swarm stack (Traefik, API, DB, backup, monitoring)

See `.github/workflows/deploy.yml` for details.

## Environment Variables

-   `DATABASE_URL` or `DATABASE_URL_FILE`: PostgreSQL connection string (used by Drizzle and API)
-   `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: PostgreSQL container config
-   `GRAFANA_PASSWORD`: Grafana admin password (prod)
-   `BACKUP_BUCKET`: GCS bucket for WAL-G backups (prod)

## License

MIT

---

**Practice Focus:**

-   TypeScript, Bun, Encore, Drizzle ORM
-   GCP Artifact Registry, Compute Engine
-   Docker image automation & Swarm orchestration
-   Traefik reverse proxy & HTTPS
-   GitHub Actions CI/CD
-   Infrastructure as Code (SST)
-   Monitoring with Prometheus & Grafana

---

For any issues or questions, please open an issue or contact the maintainer.
