# Utiliser Node.js 18 Alpine pour une image légère
FROM node:18-alpine

# Créer le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json (si présent)
COPY package*.json ./

# Installer les dépendances (ignorer les scripts postinstall comme husky)
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copier le code source
COPY . .

# Créer le répertoire uploads s'il n'existe pas
RUN mkdir -p uploads

# Exposer le port de l'application
EXPOSE 3000

# Définir les variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Commande pour démarrer l'application
CMD ["npm", "start"]
