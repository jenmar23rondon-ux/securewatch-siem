# SecureWatch SIEM

SecureWatch SIEM is a junior security monitoring platform that simulates a small SOC workflow: it receives security events, detects basic threats, stores evidence in PostgreSQL and shows alerts in a live dashboard.

## Project Identity

**SecureWatch SIEM** is a realtime SIEM-style project focused on event ingestion, Redis queue processing, threat detection, correlation, WebSocket updates and security reporting.

## Screenshots

The screenshot below uses sanitized demo data and documentation IP ranges.

### Realtime SIEM dashboard

<img src="docs/screenshots/securewatch-dashboard.svg" alt="SecureWatch realtime SIEM dashboard" width="900" />

## MVP Scope

This first version includes:

- Login with JWT
- Roles: `ADMIN`, `ANALYST`, `VIEWER`
- Log source creation
- Event ingestion through API
- Security event storage
- SQL injection detection
- Brute-force detection
- Event queue with Bull + Redis
- Python analyzer with Scikit-learn `IsolationForest`
- Self-training anomaly model using low-risk events from PostgreSQL
- Event correlation by IP across multiple log sources
- Threat and alert creation
- Dashboard metrics
- WebSocket events in realtime: `new-event`, `new-alert`, `metrics-update`
- React Query API state management
- React Hook Form + Zod validation for frontend forms
- CSV alert report
- PDF alert report
- Attacker IP map
- Visual event timeline
- Docker Compose for PostgreSQL, Redis, backend, analyzer and frontend
- GitHub Actions CI for builds, Docker validation and container builds

## Architecture

```text
Frontend React + TypeScript
      |
      v
Backend Node.js / Express
      |
      +--> PostgreSQL
      |
      +--> WebSocket events, alerts and metrics
      |
      +--> Bull + Redis event queue
      |
      +--> Python FastAPI analyzer with IsolationForest
```

## Project Structure

```text
securewatch-siem/
|-- backend-node/
|   |-- src/
|   |   |-- config/
|   |   |-- modules/
|   |   |   |-- auth/
|   |   |   |-- users/
|   |   |   |-- log-sources/
|   |   |   |-- events/
|   |   |   |-- threats/
|   |   |   |-- alerts/
|   |   |   |-- dashboard/
|   |   |   `-- reports/
|   |   |-- middlewares/
|   |   |-- workers/
|   |   |-- utils/
|   |   |-- app.ts
|   |   `-- server.ts
|   |-- prisma/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- Dockerfile
|   `-- package.json
|-- analyzer-python/
|   |-- app/
|   |   |-- main.py
|   |   |-- services/
|   |   |-- rules/
|   |   `-- utils/
|   |-- Dockerfile
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |   |-- pages/
|   |   |-- components/
|   |   |-- services/
|   |   |-- sockets/
|   |   |-- types/
|   |   `-- main.tsx
|   |-- Dockerfile
|   `-- package.json
|-- docker-compose.yml
|-- README.md
`-- .gitignore
```

## Main Detection Rules

| Rule | Detection |
| --- | --- |
| Brute force | 10 failed logins in 5 minutes |
| SQL injection | Payload contains patterns like `' OR 1=1` |
| DDoS signal | 100 requests per minute |
| Port scan | Many different ports from the same source |
| ML anomaly | IsolationForest flags unusual failed logins, request volume, ports or payload risk |
| Self-training | Node reads low-risk PostgreSQL events and retrains the Python model periodically |
| Correlation | Same IP appears across multiple log sources in a short window |

## Frontend Stack

The dashboard frontend is built with a modern React stack:

- React + TypeScript
- TailwindCSS-ready styling pipeline
- React Query for API caching, loading states and refetching
- Socket.IO Client for realtime alerts and metrics
- Recharts for dashboard charts
- React Hook Form + Zod for validated forms
- Lucide React for dashboard icons

## Local Setup

### Backend

```bash
cd backend-node
npm install
copy .env.example .env
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Backend URL:

```text
http://localhost:3000
```

Default admin:

```text
Email: admin@securewatch.local
Password: Admin1234
```

### Python Analyzer

```bash
cd analyzer-python
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Analyzer URL:

```text
http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Demo credentials:

```text
Email: admin@securewatch.local
Password: Admin1234
```

## Docker

If Docker is installed:

```bash
docker compose up --build
```

This starts:

- PostgreSQL
- Redis
- Python analyzer
- Node backend
- React frontend

Docker is the easiest way to run the complete stack because Redis and PostgreSQL start automatically with the app.

## Useful API Flow

Login:

```http
POST /auth/login
```

Create event:

```http
POST /events
Authorization: Bearer TOKEN
```

Example event:

```json
{
  "type": "LOGIN_FAILED",
  "sourceId": 1,
  "ip": "181.50.12.10",
  "payload": "' OR 1=1 --",
  "failedAttempts": 10,
  "requestCount": 20
}
```

The API queues the event in Redis. A Bull worker processes it, calls the Python analyzer, stores the result and emits realtime updates. If a rule matches, SecureWatch creates:

- A security event
- A threat record
- An alert
- A realtime WebSocket notification

Realtime WebSocket events:

```text
new-event
new-alert
metrics-update
```

Python analyzer training:

```http
GET /threats/analyzer/status
POST /threats/analyzer/train
Authorization: Bearer ADMIN_OR_ANALYST_TOKEN
```

How the self-training flow works:

```text
PostgreSQL security_events
      |
      v
Node training worker selects LOW severity events
      |
      v
Node converts events into ML vectors
      |
      v
Python FastAPI /train endpoint
      |
      v
IsolationForest retrains in memory
```

The Python analyzer starts with a fallback baseline so the project works with an empty database. Once enough low-risk events exist, the backend automatically retrains the model every 10 minutes using real historical events.

Reports:

```http
GET /reports/alerts.csv
GET /reports/alerts.pdf
```

## Notes

- `.env` files are ignored by Git.
- This is an educational SIEM MVP, not a production SOC platform.
- Detection combines Node rules, Python ML analysis and basic event correlation.

## Testing

- Backend TypeScript build validation.
- Frontend Vite build validation.
- Python analyzer syntax validation.
- Docker Compose configuration validation.
- Recommended next tests: auth, role permissions, event ingestion, alert creation and report exports.

## What I Learned

- JWT authentication and RBAC for security dashboards.
- Security event modeling in PostgreSQL.
- Background jobs with Redis and Bull.
- Realtime WebSocket updates for alerts and metrics.
- Threat correlation by IP and source.
- Python FastAPI analyzer integration.
- IsolationForest anomaly detection and self-training with low-risk events.
- Docker Compose for a multi-service SIEM stack.

## License

MIT License.
