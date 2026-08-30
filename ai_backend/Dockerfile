FROM python:3.12-slim

WORKDIR /app

# install uv
RUN pip install uv

# copy dependency files first for caching
COPY pyproject.toml .
COPY uv.lock .

# install dependencies
RUN uv sync --frozen --no-dev
RUN uv pip install "fastapi[standard]"

# copy source code
COPY . .

EXPOSE 8000