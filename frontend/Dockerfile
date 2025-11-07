# Frontend Dockerfile (versión corregida)
FROM node:18

WORKDIR /usr/src/app

# Copiamos package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalamos las dependencias del proyecto (esto incluye react, react-dom, react-scripts, etc.)
RUN npm install

# Copiamos el resto del código fuente
COPY . .

EXPOSE 3000

# Ejecuta el servidor de desarrollo de React
CMD ["npm", "start"]

