# =============================================================================
# Meetra — Backend Dockerfile
# Node.js + Express API server
# =============================================================================

# -----------------------------------------------------------------------------
# BASE IMAGE
# node:20-alpine is the official Node 20 LTS image built on Alpine Linux.
# Alpine is a minimal Linux distro (~5 MB) — the full Debian-based node image
# is ~300 MB. Alpine keeps the final image small and reduces the attack surface.
# -----------------------------------------------------------------------------
FROM node:20-alpine

# -----------------------------------------------------------------------------
# WORKING DIRECTORY
# All subsequent commands (COPY, RUN, CMD) run relative to /app inside the
# container. If /app does not exist Docker creates it automatically.
# -----------------------------------------------------------------------------
WORKDIR /app

# -----------------------------------------------------------------------------
# INSTALL DEPENDENCIES — LAYER CACHING TRICK
# We copy ONLY package.json and package-lock.json first, then run npm ci.
# Docker caches each instruction as a layer. If your source code changes but
# package files don't, Docker reuses the cached npm ci layer and skips
# reinstalling — builds become much faster.
# npm ci (clean install) is preferred over npm install in CI/Docker because:
#   - It installs exact versions from package-lock.json (reproducible builds)
#   - It deletes node_modules before installing (no leftover stale packages)
#   - It fails if package-lock.json is out of sync with package.json
# -----------------------------------------------------------------------------
COPY package*.json ./
RUN npm ci

# -----------------------------------------------------------------------------
# COPY APPLICATION SOURCE
# Done AFTER npm ci so source-code changes don't bust the dependency cache.
# The .dockerignore file (in the same directory) tells Docker what to exclude
# from this COPY — node_modules, .env, uploads/, pdfs/ are excluded.
# -----------------------------------------------------------------------------
COPY . .

# -----------------------------------------------------------------------------
# CREATE REQUIRED DIRECTORIES
# The app writes uploaded audio files to uploads/ and generated PDFs to pdfs/.
# These directories must exist inside the container before the server starts.
# In docker-compose, these paths are mounted as named volumes so data persists
# across container restarts — but the directories still need to exist first.
# -----------------------------------------------------------------------------
RUN mkdir -p uploads pdfs

# -----------------------------------------------------------------------------
# EXPOSE PORT
# Documents that the container listens on port 5000. This does NOT publish
# the port to the host — that is done in docker-compose.yml with "ports:".
# EXPOSE is informational metadata for tooling and developers.
# -----------------------------------------------------------------------------
EXPOSE 5000

# -----------------------------------------------------------------------------
# START COMMAND
# We run "node server.js" directly instead of "npm start" because the start
# script in package.json uses nodemon (a dev tool that watches files and
# auto-restarts). nodemon adds unnecessary overhead and is not meant for
# production containers — the container itself is restarted by Docker/Compose
# if it crashes, making nodemon redundant.
#
# Note: server.js reads process.env.PORT for the port number. When running
# locally without Docker, set PORT=5000 in your .env file. In docker-compose,
# the PORT env var is injected via env_file or environment block.
# -----------------------------------------------------------------------------
CMD ["node", "server.js"]
