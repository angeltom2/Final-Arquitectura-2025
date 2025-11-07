# Backend Dockerfile
FROM node:18

WORKDIR /usr/src/app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias globales necesarias
RUN npm install -g nodemon

# Instalamos dependencias del proyecto
RUN npm install

# Copiamos el resto del código
COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
