# Todo App – Docker, SST, Encore, Next.js, Drizzle

A modern full-stack Todo application featuring a TypeScript backend API built with Encore and Drizzle ORM, a Next.js frontend, PostgreSQL for data persistence, and automated infrastructure management via SST for GCP deployment.

## Features

- **Todo API**: RESTful API (GET /items, POST /items, PUT /items/:id, DELETE /items/:id)
- **Next.js Frontend**: Modern React UI with todo management capabilities
- **Backend**: Encore framework with Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with automatic migrations via Drizzle Kit
- **Monitoring**: Prometheus metrics endpoint
- **Reverse Proxy**: Traefik for local routing and production HTTPS
- **Containerized**: Docker Compose for local development and production deployments
- **IaC with SST**: Infrastructure as Code for GCP (Artifact Registry, Compute Engine, Cloud Storage)
- **Health Checks**: Built-in API health check endpoint

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
├── backend/                       # Encore API service
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.ts       # Drizzle ORM connection
│   │   │   ├── schema.ts         # Todos table schema
│   │   │   └── migrations/       # Auto-generated SQL migrations
│   │   └── todo/
│   │       ├── todo.api.ts       # Encore API endpoints
│   │       ├── todo.service.ts   # Business logic
│   │       └── todo.repo.ts      # Data access layer (repository)
│   ├── package.json
│   ├── tsconfig.json
│   └── encore.app                # Encore service config
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
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── postgres/                      # PostgreSQL Docker setup
│   ├── Dockerfile                # Custom Postgres image
│   ├── docker-entrypoint-wrapper.sh
│   └── wal-g-cron.sh            # WAL-G backup cron job
│
├── docker-compose.yml             # Local development stack
├── docker-compose.prod.yml        # Production stack (Swarm)
├── drizzle.config.ts              # Drizzle Kit migration config
├── sst.config.ts                  # SST infrastructure as code (GCP)
├── prometheus.yml                 # Prometheus scrape config
├── package.json                   # Monorepo root
└── sst-env.d.ts                   # SST environment type definitions
```

## Local Development

### Prerequisites

- **Docker & Docker Compose** - For containerized local development
- **Bun** - Fast JavaScript runtime and package manager
- **Node.js** (optional) - Needed only if not using Bun
- **Encore CLI** (optional) - For running backend standalone

### Quick Start with Docker Compose

1. **Start the full stack:**

```bash
docker-compose up -d
```

This starts:

- **API** at `http://api.localhost` (routed via Traefik)
- **Frontend** at `http://localhost:3000`
- **Traefik Dashboard** at `http://localhost:8080`
- **PostgreSQL** at `localhost:5432`

2. **View logs:**

```bash
docker-compose logs -f api      # Backend logs
docker-compose logs -f web      # Frontend logs
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

1. Builds and tests the Docker images
2. Scans images for vulnerabilities (Trivy)
3. Pushes images to GCP Artifact Registry
4. Deploys to Compute Engine VM via Docker Swarm
5. Runs health checks post-deployment
6. Automatic rollback on failures

## Frontend

The Next.js frontend (`frontend/`) includes:

- **TodoClient Component**: Full-featured todo list UI with add, toggle, and delete functionality
- **Tailwind CSS**: Utility-first CSS styling
- **Encore Client Integration**: Auto-generated API client for type-safe backend communication
- **Modern React 19**: Latest React features and hooks

### Key Components

- **TodoClient.tsx**: Main component handling todo CRUD operations
- **page.tsx**: Home page displaying the todo list
- **lib/encore.ts**: Encore client initialization with environment-aware URL

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

### Development (docker-compose.yml)

```env
POSTGRES_HOST=db
POSTGRES_USER=root
POSTGRES_PASSWORD=secret
POSTGRES_DB=todos
DATABASE_URL=postgresql://root:secret@db:5432/todos
NEXT_PUBLIC_API_URL=http://api.localhost
```

### Production (docker-compose.prod.yml)

- `DATABASE_URL`: PostgreSQL connection (via Docker secret)
- `BACKUP_BUCKET`: GCS bucket for WAL-G backups
- `DOMAIN_NAME`: For Traefik HTTPS routing

## License

MIT

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
