
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

#On doit installer tsc pour compiler donc pas de --only=production
RUN npm ci

COPY . .

RUN npm run build

# Générer une image plus légère avec les dossiers statiques
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

# installer les dépendences de production uniquement
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Créer un utilisateur non-root pour la sécurité et donner les droits
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["npm", "start"]