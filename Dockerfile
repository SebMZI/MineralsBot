FROM node:20-alpine


RUN npm install -g pnpm

WORKDIR /app

COPY package.json ./

RUN pnpm install


COPY . .

RUN mkdir -p /app/logs

RUN mkdir -p /app/logs && \
    addgroup -g 1001 -S nodejs && \
    adduser -S discordbot -u 1001 && \
    chown -R discordbot:nodejs /app && \
    chown -R discordbot:nodejs /app/logs

USER discordbot

# Lancer le bot
CMD ["pnpm", "run", "start"]