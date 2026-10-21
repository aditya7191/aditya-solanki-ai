FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates python3 util-linux && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev
ENV NODE_ENV=production PORT=10000
EXPOSE 10000
CMD ["node", "server/index.js"]
