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
- Threat and alert creation
- Dashboard metrics
- WebSocket alerts in realtime
- CSV alert report

Prepared for later:

- Redis queues
- Advanced Python analyzer integration
- PDF reports
- AI models
- GitHub Actions

## Architecture

```text
Frontend React
      |
      v
Backend Node.js / Express
      |
      +--> PostgreSQL
      |
      +--> WebSocket alerts
      |
      +--> Python FastAPI analyzer
      |
      +--> Redis queue-ready service
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
py -m venv .venv
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

If a rule matches, SecureWatch creates:

- A security event
- A threat record
- An alert
- A realtime WebSocket notification

## Notes

- `.env` files are ignored by Git.
- This is an educational SIEM MVP, not a production SOC platform.
- The Node backend performs MVP detection directly.
- The Python analyzer is ready for the next phase of advanced analysis.
