# ─── Build stage ────────────────────────────────────
FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

# Vite build-time env vars (baked into the static bundle)
ARG VITE_NODE_BACKEND_URL=/api
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_NODE_BACKEND_URL=$VITE_NODE_BACKEND_URL \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN bun run build

# ─── Serve stage ────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
