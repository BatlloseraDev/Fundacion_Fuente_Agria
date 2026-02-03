# front/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiamos package.json y package-lock.json (tienes npm en el front)
COPY package.json package-lock.json ./

# Instalamos dependencias
RUN npm ci

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de Vite
EXPOSE 5173

# Vite debe correr en host 0.0.0.0 para ser accesible desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host"]