# ---- Build stage ----
FROM node:22-slim AS build
WORKDIR /app

# Install deps first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_* env vars into the static bundle at build time, so they
# must be supplied as build args (docker-compose.yml wires these up).
ARG VITE_NODE_BACKEND_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_NODE_BACKEND_URL=$VITE_NODE_BACKEND_URL \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
