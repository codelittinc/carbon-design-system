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
# Runtime stage — prod deps + the Express auth server + static site
# ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable

# Only production dependencies (express) are needed to serve.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY server.js ./
COPY --from=build /app/storybook-static ./storybook-static

# Heroku injects $PORT at runtime; server.js binds 0.0.0.0 on it.
CMD ["node", "server.js"]
