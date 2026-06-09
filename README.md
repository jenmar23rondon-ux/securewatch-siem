# SecureWatch SIEM

SecureWatch SIEM is a junior security monitoring platform that simulates a small SOC workflow: it receives security events, detects basic threats, stores evidence in PostgreSQL and shows alerts in a live dashboard.

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

Reports:

```http
GET /reports/alerts.csv
GET /reports/alerts.pdf
```

## Notes

- `.env` files are ignored by Git.
- This is an educational SIEM MVP, not a production SOC platform.
- Detection combines Node rules, Python ML analysis and basic event correlation.
