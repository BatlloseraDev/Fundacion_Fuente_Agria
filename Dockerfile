# FROM node:20-alpine

# WORKDIR /app

# # 1. Pre-creamos la carpeta node_modules
# # 2. Le asignamos la propiedad al usuario "node" (que internamente es el 1000)
# # Esto es vital para que el volumen anónimo no se cree como root
# RUN mkdir -p /app/node_modules && chown -R node:node /app

# # Cambiamos al usuario no-root
# USER node

# # Copiamos archivos y damos permisos
# COPY --chown=node:node package*.json yarn.lock* ./

# # Instalamos dependencias aquí (para que se queden en la caché de la imagen)
# # Usaremos npm o yarn dependiendo del proyecto
# RUN if [ -f yarn.lock ]; then yarn install; else npm install; fi

# # Copiamos el resto del código
# COPY --chown=node:node . .

# CMD ["npm", "run", "start:dev"]