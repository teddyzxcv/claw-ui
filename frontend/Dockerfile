FROM node:20-alpine

ENV HOST=0.0.0.0 \
    PORT=3000

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
