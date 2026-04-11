# =============================================================================
# Meetra — Chatbot Dockerfile
# Python FastAPI + LangGraph agent served by Uvicorn
# =============================================================================

# -----------------------------------------------------------------------------
# BASE IMAGE
# python:3.12-slim is the official Python 3.12 image built on Debian slim.
# "slim" means it strips locale files, man pages, and other docs that are
# never used at runtime — cutting the base image from ~900 MB down to ~130 MB.
# We use 3.12 specifically because that is the Python version this project was
# developed and tested on. Using a different version risks subtle breaking
# changes in LangGraph, Pydantic, or other sensitive dependencies.
#
# We do NOT use python:3.12-alpine here (unlike the Node services).
# Many Python packages (cryptography, orjson, ormsgpack) include compiled C
# extensions. Alpine uses musl libc instead of glibc, and pre-built wheels
# from PyPI are compiled against glibc — they won't install on Alpine without
# compiling from source, which requires a full C toolchain and makes builds
# slow and fragile. Slim (Debian-based) avoids this entirely.
# -----------------------------------------------------------------------------
FROM python:3.12-slim

# Set working directory inside the container
WORKDIR /app

# -----------------------------------------------------------------------------
# ENVIRONMENT FLAGS
# PYTHONDONTWRITEBYTECODE=1 — stops Python from writing .pyc bytecode cache
#   files to disk. These are useful for repeated local runs but are wasteful
#   inside a container that starts fresh every time.
# PYTHONUNBUFFERED=1 — forces Python's stdout/stderr to flush immediately
#   without buffering. This ensures logs appear in "docker logs" in real time
#   rather than being held in a buffer and showing up late or not at all.
# -----------------------------------------------------------------------------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# -----------------------------------------------------------------------------
# INSTALL DEPENDENCIES — LAYER CACHING TRICK
# Copy requirements.txt first and install before copying source code.
# Docker caches each layer. If only your source code changes (not requirements),
# Docker reuses the cached pip install layer and skips the ~56-package install
# entirely — saving a minute or more on every rebuild.
#
# --no-cache-dir tells pip not to store downloaded packages in a local cache
# directory inside the image. We will never reuse that cache across builds,
# so it only wastes image space.
# -----------------------------------------------------------------------------
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# -----------------------------------------------------------------------------
# COPY APPLICATION SOURCE
# Done after pip install so source-code changes don't bust the dep cache.
# The .dockerignore file excludes venv/, .env, and __pycache__ from this COPY.
# -----------------------------------------------------------------------------
COPY . .

# Document that the container listens on port 8000
EXPOSE 8000

# -----------------------------------------------------------------------------
# START COMMAND
# We run uvicorn directly (not via a shell script or python -m) so it becomes
# PID 1 inside the container. PID 1 receives Docker's shutdown signals
# (SIGTERM) directly, allowing graceful shutdown of in-flight requests.
#
# --host 0.0.0.0  — REQUIRED in Docker. By default uvicorn binds to 127.0.0.1
#   (loopback only), which is unreachable from outside the container. Binding
#   to 0.0.0.0 tells it to accept connections on all network interfaces,
#   including the one Docker uses to route traffic into the container.
#
# --port 8000     — matches the EXPOSE above and the docker-compose port mapping.
#
# We do NOT use --reload here. --reload watches the filesystem for changes and
# restarts the server automatically — great for development, but wasteful and
# unnecessary in a container (Docker itself handles restarts on crash).
# -----------------------------------------------------------------------------
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
