FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN mkdir -p /app/logs

RUN addgroup -g 1001 -S nodejs && \
    adduser -S discordbot -u 1001 && \
    chown -R discordbot:nodejs /app

USER discordbot

CMD ["pnpm", "run", "start"]