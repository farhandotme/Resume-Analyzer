FROM python:3.12-slim

WORKDIR /app

# install uv
RUN pip install --no-cache-dir uv

# copy dependency files first for caching
COPY pyproject.toml .
COPY uv.lock .

# install dependencies
RUN uv sync --frozen --no-dev
RUN uv pip install "fastapi[standard]"

# copy source code
COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health', timeout=3).status==200 else 1)"

# Production ASGI server: multiple workers, no auto-reload.
# (docker-compose.yml overrides this command for the "celery" service.)
CMD ["uv", "run", "fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "8000"]
