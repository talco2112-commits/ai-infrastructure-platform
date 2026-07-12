# InfrAI

A construction management platform for execution contractors (schedule, billing, RFIs, documents, safety, quality, and more), with an AI assistant on top.

## Prerequisites

- Node.js 20+
- Java 21 JDK (e.g. [Microsoft Build of OpenJDK](https://learn.microsoft.com/en-us/java/openjdk/download)) — required only for the schedule parser service below

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Used for | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | AI chat / schedule analysis (`src/app/api/chat`) | Yes — chat routes return 401/error without it |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity CMS (landing page content) | Yes |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity CMS dataset (usually `production`) | Yes |
| `SCHEDULE_PARSER_URL` | URL of the schedule-parser service (defaults to `http://localhost:3001`) | No — only if running the parser on a non-default host/port |

## Running the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Schedule parser service (`schedule-parser/`)

MPP/MPX/XER/PMXML schedule files are parsed by a separate Node + Java microservice (MPXJ), since MPXJ can't run inside Next.js/webpack. It must be running for schedule uploads and Gantt import to work.

**One-time setup:**

```bash
cd schedule-parser
npm install
npm run setup          # downloads mpxj.jar from Maven Central into lib/
```

Build the Java fat JAR (requires the JDK and Maven; a portable Maven is vendored under `schedule-parser/maven/`):

```bash
cd schedule-parser/java
../maven/apache-maven-3.9.9/bin/mvn.cmd package -q
```

**Run the service** (in a separate terminal, alongside `npm run dev`):

```bash
cd schedule-parser
node server.js
```

It listens on port `3001` by default (override with `PARSER_PORT`). Health check: `GET http://localhost:3001/health`.

**Data flow:** browser → `POST /api/parse-schedule` (Next.js) → `POST :3001/parse` → `java -jar schedule-parser-1.0.0.jar` → normalized JSON.

## Known limitations

- `src/app/api/content/route.ts` writes to the local filesystem — this breaks on Vercel's read-only filesystem in production. Scheduled to be fixed in Phase 4 (see roadmap).
