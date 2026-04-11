# =============================================================================
# Meetra — Frontend Dockerfile
# React + Vite SPA served by Nginx
# =============================================================================

# -----------------------------------------------------------------------------
# WHY MULTI-STAGE BUILD?
# A Vite build produces purely static files (HTML, CSS, JS) in a dist/ folder.
# We need Node only to run the build — not to serve the app. A multi-stage
# build lets us:
#   Stage 1 (builder): use a Node image to compile the app -> dist/
#   Stage 2 (runner):  copy only dist/ into a tiny Nginx image
# The final image has ZERO Node.js, no node_modules, no source code.
# This shrinks the image from ~1 GB down to ~25 MB and removes any
# development tooling from the production image entirely.
# -----------------------------------------------------------------------------


# =============================================================================
# STAGE 1 — BUILD
# =============================================================================
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# -----------------------------------------------------------------------------
# INSTALL DEPENDENCIES — LAYER CACHING TRICK
# Copy package files first, install, then copy source. If source code changes
# but package files don't, Docker reuses the cached install layer and skips
# npm ci — making rebuilds significantly faster.
# npm ci installs exact versions from package-lock.json (reproducible builds).
# -----------------------------------------------------------------------------
COPY package*.json ./
RUN npm ci

# -----------------------------------------------------------------------------
# INJECT VITE ENVIRONMENT VARIABLES
# CRITICAL: Vite's import.meta.env.VITE_* variables are NOT runtime env vars.
# They are replaced with literal string values during "npm run build" and baked
# permanently into the compiled JavaScript bundle.
# This means you CANNOT change them after the image is built — they must be
# provided HERE, at build time, as Docker ARGs.
#
# In docker-compose.yml these are passed under build.args:
#   args:
#     VITE_API_BASE_URL: http://localhost:5000/meetra
#     VITE_CHATBOT_URL: http://localhost:8000
#
# For production (Vercel, or a remote server), set these to real domain URLs
# before running docker compose build.
# -----------------------------------------------------------------------------
ARG VITE_API_BASE_URL
ARG VITE_CHATBOT_URL

# Make the ARGs available as environment variables so Vite can read them
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CHATBOT_URL=$VITE_CHATBOT_URL

# Copy all source code (node_modules excluded via .dockerignore)
COPY . .

# Run the Vite production build — outputs compiled assets to /app/dist/
RUN npm run build


# =============================================================================
# STAGE 2 — SERVE
# =============================================================================

# -----------------------------------------------------------------------------
# BASE IMAGE
# nginx:alpine is a production-grade static file server. It is ~7 MB, handles
# thousands of concurrent connections efficiently, and supports gzip
# compression and caching headers. No Node.js needed at runtime.
# -----------------------------------------------------------------------------
FROM nginx:alpine

# -----------------------------------------------------------------------------
# COPY BUILD OUTPUT
# "--from=builder" references Stage 1 by its alias. We copy only the compiled
# dist/ folder — none of the source code, node_modules, or secrets travel into
# this final image.
# -----------------------------------------------------------------------------
COPY --from=builder /app/dist /usr/share/nginx/html

# -----------------------------------------------------------------------------
# NGINX CONFIGURATION — SPA ROUTING FIX
# By default Nginx returns 404 for any URL that doesn't map to a real file.
# React Router handles routing entirely in JavaScript (client-side), so URLs
# like /dashboard or /auth are not actual files on disk — they only exist
# after the JS bundle loads and React takes over.
# The custom nginx.conf tells Nginx: if the requested file/folder doesn't
# exist, always serve index.html instead. React Router then reads the URL and
# renders the correct page. Without this, refreshing any route other than /
# returns a blank 404 page.
# -----------------------------------------------------------------------------
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Document that the container serves traffic on port 80
EXPOSE 80

# Start Nginx in the foreground.
# "daemon off" keeps Nginx as the main process (PID 1) so Docker can detect
# crashes and restart the container. If Nginx ran as a background daemon,
# the container would exit immediately thinking there is nothing left to run.
CMD ["nginx", "-g", "daemon off;"]
