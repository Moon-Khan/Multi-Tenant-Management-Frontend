# Multi-Tenant Management — Frontend

A React admin console for the [Multi-Tenant Management Backend](https://github.com/Moon-Khan/Multi-Tenant-Management-Backend).
Built with **Vite + React + TypeScript + Tailwind CSS**.

> Scaffold stage — shared tooling, the API client, and base UI primitives.
> Features (auth, dashboard, notes, tenants) land on their own branches.

## Prerequisites

- Node.js 18+
- The backend running and reachable (default `http://localhost:3000`).

## Getting started

```bash
cp .env.example .env   # adjust VITE_API_URL if your API isn't on :3000
npm install
npm run dev            # http://localhost:5173
```

## Configuration

| Variable       | Default                 | Description                 |
| -------------- | ----------------------- | --------------------------- |
| `VITE_API_URL` | `http://localhost:3000` | Base URL of the backend API |

## Project structure

```
src/
├── components/   # shared UI primitives
├── context/      # React context providers
├── lib/          # axios instance + interceptors, typed services, types
├── App.tsx       # routes
└── main.tsx      # providers + entry
```
