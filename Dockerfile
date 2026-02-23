FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --production
COPY . .

FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --production

COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["node", "src/index.js"]

