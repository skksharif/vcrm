# Client - Social Agency PM

Quick start:

1. cd client
2. npm install
3. npm run dev (opens on http://localhost:3000)

Notes:
- Proxy: `/api` → http://localhost:4000 (see `vite.config.js`)
- Tailwind CSS is configured in `tailwind.config.cjs`
- Auth uses `localStorage` for token and `/api/auth/login` endpoint

Build for production: `npm run build` and serve `dist/`
