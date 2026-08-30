FROM oven/bun:1

WORKDIR /app

# copy dependency manifest first for better layer caching
COPY package.json ./

# install dependencies (generates a fresh bun.lock inside the image)
RUN bun install

# copy source code
COPY . .

EXPOSE 3000

CMD ["bun", "index.ts"]
