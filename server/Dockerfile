# Build context = repository root (Dokploy: Build Path "/", Docker File "server/Dockerfile", Context ".")
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./

RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["node", "src/index.js"]
