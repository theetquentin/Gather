FROM node:24-alpine AS frontend_builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:24-alpine

# Installer serve lancer le serveur avec les fichiers statiques
RUN npm install -g serve

WORKDIR /usr/app/dist

COPY --from=frontend_builder /app/dist .

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

USER nodejs

EXPOSE 5173

# --single pour les Single Page Applications (SPA) comme React.
CMD ["serve", "-s", ".", "-l", "5173", "--single", "--no-clipboard"]