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
# Runtime stage — the Express auth server + the static site
# ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable

# server.js only needs Express. Express is a devDependency of the published
# package (library consumers must not install it), so installing the package's
# own manifest with --prod would skip it. Install Express in isolation from a
# minimal manifest instead — this also keeps the component libraries (radix,
# @tanstack, etc.), which server.js never touches, out of the runtime image.
RUN printf '{"name":"carbon-storybook-server","private":true,"type":"module","dependencies":{"express":"^4.19.2"}}' > package.json \
 && pnpm install --prod

COPY server.js ./
COPY --from=build /app/storybook-static ./storybook-static

# Heroku injects $PORT at runtime; server.js binds 0.0.0.0 on it.
CMD ["node", "server.js"]
