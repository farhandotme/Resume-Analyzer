FROM oven/bun:1

WORKDIR /app

# copy dependency files first for caching
COPY package.json .
COPY bun.lock .

# install dependencies
RUN bun install

# copy source code
COPY . .

EXPOSE 3000

# run migrations then start server
CMD bun index.ts