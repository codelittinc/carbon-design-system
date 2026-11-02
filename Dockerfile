# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Build stage — install all deps (incl. dev) and build Storybook
# ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable

# Install dependencies against the committed lockfile first (better layer caching).
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build the static Storybook into /app/storybook-static.
COPY . .
RUN pnpm run build

# ─────────────────────────────────────────────────────────────
# Runtime stage — Clerk/Gatekeeper auth server + the static site
# ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable

# Hosting dependencies stay out of the published component library's runtime deps.
COPY package.json ./source-package.json
RUN node --input-type=module -e 'import fs from "node:fs"; const p=JSON.parse(fs.readFileSync("source-package.json")); fs.writeFileSync("package.json", JSON.stringify({name:"carbon-storybook-server",private:true,type:"module",packageManager:p.packageManager,dependencies:{express:p.devDependencies.express,"@clerk/express":p.devDependencies["@clerk/express"]}}));' \
 && pnpm install --prod

COPY server.js ./
COPY server ./server
COPY --from=build /app/storybook-static ./storybook-static
COPY --from=build /app/auth-static ./auth-static

# Railway injects $PORT at runtime; server.js binds 0.0.0.0 on it.
CMD ["node", "server.js"]
