# Todo App – Docker, SST, Encore, Next.js, Drizzle

A modern full-stack Todo application featuring a TypeScript backend API built with Encore and Drizzle ORM, a Next.js frontend, PostgreSQL for data persistence, and automated infrastructure management via SST for GCP deployment.

## Features

- **Todo API**: RESTful API (GET /items, POST /items, PUT /items/:id, DELETE /items/:id)
- **Next.js Frontend**: Modern React UI with todo management capabilities
- **Backend**: Encore framework with Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with automatic migrations via Drizzle Kit
- **Monitoring**: Prometheus metrics and Grafana dashboards
- **Reverse Proxy**: Traefik for local routing and production HTTPS with Let's Encrypt
- **Docker Multi-Stage Builds**: Optimized production containers for both frontend and backend
- **Containerized**: Docker Compose for local development and production deployments
- **IaC with SST**: Infrastructure as Code for GCP (Artifact Registry, Compute Engine, Cloud Storage)
- **Security Scanning**: Trivy vulnerability scanning in CI/CD
- **Health Checks**: Built-in API and database health check endpoints

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, TypeScript
- **Backend**: Encore (TypeScript), Drizzle ORM, PostgreSQL
- **Containerization**: Docker, Docker Compose
- **Infrastructure**: SST (Google Cloud), Traefik
- **Monitoring**: Prometheus
- **Package Manager**: Bun

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml             # CI/CD pipeline for GCP deployment
├── backend/                       # Encore API service
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.ts       # Drizzle ORM connection
│   │   │   ├── schema.ts         # Todos table schema
│   │   │   └── migrations/       # Auto-generated SQL migrations
│   │   └── todo/
│   │       ├── encore.service.ts # Encore service definition
│   │       ├── todo.api.ts       # Encore API endpoints
│   │       ├── todo.service.ts   # Business logic
│   │       └── todo.repo.ts      # Data access layer (repository)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # Next.js web app
│   ├── app/
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page with TodoClient
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   └── TodoClient.tsx        # Todo list UI component
│   ├── lib/
│   │   ├── client.ts             # Generated Encore API client
│   │   ├── encore.ts             # Encore client initialization
│   │   └── utils.ts              # Utility functions
│   ├── Dockerfile                # Multi-stage Next.js build
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── postgres/                      # PostgreSQL Docker setup
│   ├── Dockerfile                # Custom Postgres image
│   ├── docker-entrypoint-wrapper.sh
│   └── wal-g-cron.sh            # WAL-G backup cron job
│
├── .dockerignore                  # Docker build ignore rules
├── .env-example                   # Environment variables template
├── Dockerfile.api.dev             # Backend dev container
├── Dockerfile.web                 # Frontend build container (root-level)
├── docker-compose.yml             # Local development stack
├── docker-compose.prod.yml        # Production stack (Swarm)
├── drizzle.config.ts              # Drizzle Kit migration config
├── sst.config.ts                  # SST infrastructure as code (GCP)
├── prometheus.yml                 # Prometheus scrape config
├── package.json                   # Monorepo root
├── bun.lock                       # Bun lock file
└── sst-env.d.ts                   # SST environment type definitions
```

## Local Development

### Prerequisites

- **Docker & Docker Compose** - For containerized local development
- **Bun** - Fast JavaScript runtime and package manager (v1.x+)
- **Node.js** (optional) - v20+ if not using Bun
- **Encore CLI** (optional) - For running backend standalone
- **Git** - Version control

### Setup Steps

1. **Clone the repository:**

```bash
git clone <repo-url>
cd docker-practices
```

2. **Install dependencies (optional if using Docker):**

```bash
bun install
```

3. **Configure environment:**

```bash
cp .env-example .env
# Edit .env with your database URL if needed
```

### Quick Start with Docker Compose

1. **Start the full stack:**

```bash
docker-compose up -d
```

This starts:

- **API** at `http://api.localhost` (routed via Traefik on port 80)
- **Frontend** at `http://localhost` (routed via Traefik on port 80)
- **Traefik Dashboard** at `http://localhost:8080`
- **PostgreSQL** at `http://localhost:5432`
- **Encore Development Dashboard** at `http://localhost:9400`

2. **View logs:**

```bash
docker-compose logs -f api      # Backend logs
docker-compose logs -f web      # Frontend logs
docker-compose logs -f db       # Database logs
```

3. **Stop the stack:**

```bash
docker-compose down
```

### Running Backend Standalone

For backend-only development with hot-reload:

```bash
cd backend
bun install      # Install dependencies
encore run       # Starts at http://localhost:4000
```

Requires local PostgreSQL or set `DATABASE_URL` environment variable.

### Running Frontend Standalone

```bash
cd frontend
bun install
bun run dev      # Starts at http://localhost:3000
```

#### API Endpoints

The backend provides these endpoints:

| Method | Path            | Description       |
| ------ | --------------- | ----------------- |
| GET    | `/`             | Welcome message   |
| GET    | `/health-check` | Health check      |
| GET    | `/items`        | List all todos    |
| POST   | `/items`        | Create a new todo |
| PUT    | `/items/:id`    | Update a todo     |
| DELETE | `/items/:id`    | Delete a todo     |

#### Example Requests

```bash
# Get all todos
curl http://api.localhost/items

# Create a new todo
curl -X POST http://api.localhost/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Learn Docker"}'

# Update a todo (mark as done)
curl -X PUT http://api.localhost/items/78c7ffab-ff9f-492b-8d52-69ac1fac2fc2 \
  -H "Content-Type: application/json" \
  -d '{"isDone":true}'

# Delete a todo
curl -X DELETE http://api.localhost/items/78c7ffab-ff9f-492b-8d52-69ac1fac2fc2
```

## Database Migrations

Migrations are managed with **Drizzle Kit**. When you modify `backend/src/db/schema.ts`:

```bash
# Generate a new migration
bunx drizzle-kit generate

# Apply migrations to database
bunx drizzle-kit push

# Drop and recreate database (dev only)
bunx drizzle-kit drop
```

The Docker Compose setup automatically runs migrations on startup via `docker-compose.yml`.

## Docker Images & Containerization

### Dockerfiles Overview

| File                  | Purpose                      | Usage                              |
| --------------------- | ---------------------------- | ---------------------------------- |
| `Dockerfile.api.dev`  | API development container    | `docker-compose.yml`               |
| `frontend/Dockerfile` | Frontend multi-stage build   | Standalone frontend build          |
| `postgres/Dockerfile` | Custom PostgreSQL with WAL-G | Production PostgreSQL with backups |

### Multi-Stage Builds

Both frontend Dockerfiles use multi-stage builds:

- **Stage 1 (Builder)**: Installs dependencies and builds Next.js
- **Stage 2 (Runner)**: Optimized runtime image with only necessary files (reduces image size ~80%)

## Infrastructure as Code (IaC) with SST

This project uses **[SST](https://sst.dev/)** to provision and manage Google Cloud Platform (GCP) infrastructure. The `sst.config.ts` file defines:

- **GCP Configuration**: Project setup in `asia-southeast1` region
- **Artifact Registry**: Docker image repository for storing container images
- **Storage Bucket**: Cloud Storage for PostgreSQL WAL-G backups with 30-day auto-delete
- **Service Accounts**: Runtime SA for VM and GitHub Actions deployer SA
- **Compute Engine VM**: For running Docker Swarm with automated deployment and monitoring
- **Firewall Rules**: HTTP(80), HTTPS(443), SSH(22), and Prometheus metrics access

To deploy or update infrastructure:

```bash
sst deploy
```

See [SST documentation](https://docs.sst.dev/) for more details.

## Production Deployment

### Docker Swarm Stack

The production stack (`docker-compose.prod.yml`) includes:

- **Traefik**: Reverse proxy with automatic HTTPS via Let's Encrypt
- **API**: Encore backend service with health checks
- **PostgreSQL**: Database with WAL-G backup to GCS
- **Prometheus & Grafana**: Monitoring and metrics visualization

### Deployment via GitHub Actions

Automated CI/CD pipeline (`.github/workflows/deploy.yml`):

1. Checks out code and installs dependencies
2. Builds Docker images for frontend and backend
3. Scans images for vulnerabilities using Trivy
4. Pushes images to GCP Artifact Registry
5. Deploys to Compute Engine VM via Docker Swarm
6. Configures Traefik with TLS/HTTPS certificates
7. Runs health checks post-deployment
8. Automatic rollback on failures
9. Cleans up unused Docker images and networks

## Frontend

The Next.js frontend (`frontend/`) includes:

- **TodoClient Component**: Full-featured todo list UI with add, toggle, and delete functionality
- **Tailwind CSS**: Utility-first CSS styling (v4+)
- **Encore Client Integration**: Auto-generated API client for type-safe backend communication
- **Modern React 19**: Latest React features and hooks
- **Multi-stage Docker Build**: Optimized production image in `frontend/Dockerfile`
- **Environment-Aware Configuration**: Switches between dev and production API URLs

### Key Components

- **TodoClient.tsx**: Main component handling todo CRUD operations with error handling
- **page.tsx**: Home page displaying the todo list with title
- **layout.tsx**: Root layout with global styling
- **lib/encore.ts**: Encore client initialization with smart API URL selection
- **lib/client.ts**: Auto-generated Encore API client (type-safe)

### Development Features

- Hot-reload with Next.js dev server
- Automatic re-rendering on code changes
- Full TypeScript support with strict mode
- ESLint configuration for code quality

## Backend

The Encore backend (`backend/`) provides a type-safe REST API built with Encore:

- **Encore Framework**: Modern TypeScript backend framework with automatic API generation
- **Service Architecture**: Modular service-based design (`todo` service)
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **Auto-Generated Client**: Type-safe API client generated from service definitions
- **Request Logging**: Built-in structured logging for all API calls
- **Health Checks**: Automatic service health monitoring

### Architecture Layers

- **API Layer** (`todo.api.ts`): Encore API endpoints with request/response types
- **Service Layer** (`todo.service.ts`): Business logic and error handling
- **Repository Layer** (`todo.repo.ts`): Database operations using Drizzle ORM
- **Database Layer** (`database.ts`): ORM connection and schema setup
- **Schema** (`schema.ts`): Drizzle table definitions with types

### Key Features

- RESTful CRUD operations on todos
- Automatic request validation via TypeScript types
- Structured error handling with API error responses
- Transaction support for data consistency
- Built-in metrics and tracing

## Monitoring & Observability

- **Prometheus**: Scrapes metrics from API at `/metrics`
- **Grafana**: Dashboards for monitoring (port 3001 in compose)
- **Traefik Dashboard**: Real-time request routing visualization (port 8080)

## Development Workflow

1. **Make changes** to backend or frontend code
2. **Docker hot-reloads** automatically with volume mounts
3. **Test locally** at `http://api.localhost` and `http://localhost:3000`
4. **Run migrations** with Drizzle Kit when schema changes
5. **Commit and push** to trigger GitHub Actions deployment

## Environment Variables

### Setup

1. **Copy the example file:**

```bash
cp .env-example .env
```

2. **Configure as needed:**

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
```

### Development (docker-compose.yml)

```env
POSTGRES_HOST=db
POSTGRES_USER=root
POSTGRES_PASSWORD=secret
POSTGRES_DB=todos
DATABASE_URL=postgresql://root:secret@db:5432/todos
NEXT_PUBLIC_API_URL=http://api.localhost
INTERNAL_API_URL=http://api:4000
PORT=3000
NODE_ENV=development
```

### Production (docker-compose.prod.yml & GCP)

- `DATABASE_URL`: PostgreSQL connection (via Docker secret)
- `NEXT_PUBLIC_API_URL`: Frontend API endpoint for Traefik routing
- `INTERNAL_API_URL`: Internal backend-to-database communication
- `BACKUP_BUCKET`: GCS bucket for WAL-G backups

## License

MIT

---

## Troubleshooting

### Common Issues

**Port already in use:**

```bash
# Kill process on port 80 (Traefik)
lsof -ti :80 | xargs kill -9

# Kill process on port 5432 (PostgreSQL)
lsof -ti :5432 | xargs kill -9
```

**Database connection errors:**

```bash
# Check if database is healthy
docker-compose ps db

# Recreate database volume
docker-compose down -v
docker-compose up -d
```

**API returning 502 Bad Gateway:**

- Check if backend container is running: `docker-compose ps api`
- View backend logs: `docker-compose logs api`
- Ensure `INTERNAL_API_URL` matches the service name in docker-compose

**Frontend not loading:**

- Clear Next.js cache: `rm -rf frontend/.next`
- Rebuild containers: `docker-compose down && docker-compose build --no-cache`

**Migrations failed:**

```bash
# Reset database and re-run migrations
docker-compose exec db psql -U root -d todos -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker-compose exec api bunx drizzle-kit push
```

### Useful Commands

```bash
# View all running containers
docker-compose ps

# SSH into a container
docker-compose exec api bash

# Watch logs in real-time with timestamps
docker-compose logs -f --timestamps

# Remove all volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild a specific service
docker-compose build --no-cache api

# View Encore's generated API documentation
curl http://localhost:4000/
```

---

**Practice Focus:**

- Full-stack TypeScript development
- Encore framework & Drizzle ORM
- Next.js React applications
- Docker Compose & Docker Swarm
- GCP infrastructure with SST
- GitHub Actions CI/CD pipelines
- Traefik reverse proxy & HTTPS
- Infrastructure as Code (SST)
- Monitoring with Prometheus & Grafana

---

For any issues or questions, please open an issue or contact the maintainer.
