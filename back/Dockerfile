# back/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiamos package.json y yarn.lock (ya que tienes yarn en el back)
COPY package.json yarn.lock ./

# Instalamos dependencias
RUN yarn install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de NestJS
EXPOSE 3000

# Comando para desarrollo
CMD ["yarn", "start:dev"]