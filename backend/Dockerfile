FROM node:20-alpine
# Image de base : Node.js 20 LTS sur Alpine Linux (ultra-légère ~50Mo)
# Téléchargée depuis Docker Hub au premier build

WORKDIR /app
# Tous les fichiers seront dans /app à l'intérieur du container

COPY package*.json ./
# Copie tout le code source dans /app
# Fait APRÈS npm install pour bénéficier du cache

EXPOSE 5000
# Documentation : ce container utilise le port 5000
# (la vraie exposition est dans docker-compose.yml)

CMD ["npm", "run", "dev"]
# Commande lancée au DÉMARRAGE du container
# npm run dev = nodemon server.js (redémarre à chaque m