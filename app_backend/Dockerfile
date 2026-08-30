FROM oven/bun:1

WORKDIR /app

# copy dependency files first for caching
COPY package.json .
COPY bun.lock .

# install dependencies (skips devDependencies for a smaller, faster prod image)
RUN bun install --production

# copy source code
COPY . .

EXPOSE 3000

ENV NODE_ENV=production

# run as the image's built-in non-root user instead of root
USER bun

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "index.ts"]
