# Makefile para Fundación Fuente Agria
# Comandos para automatizar Docker en entorno de desarrollo

.PHONY: all build start stop restart hard-restart reinstall logs install install-back install-front shell-back shell-front clean 

# --- COMANDOS PRINCIPALES ---

# Arrancar todo (si no tienes dependencias, ejecuta 'make install' primero)
start:
	docker compose up -d

# Detener todo
stop:
	docker compose stop

# Detener y eliminar todo
down:
	docker compose down
# docker compose down

# Reiniciar contenedores
restart: stop start

hard-restart:
	docker compose down 
	docker compose up -d

reinstall:
	docker compose down -v
	docker compose up -d


# Ver logs en tiempo real
logs:
	docker compose logs -f

# --- INSTALACIÓN DE DEPENDENCIAS (La solución a tu problema) ---

# Instalar todo (Back y Front) y luego arrancar
init: install start

# Instalar dependencias en ambos
install: install-back install-front

# Instala node_modules del Back en tu local (usando Yarn)
install-back:
	docker compose run --rm back yarn install

# Instala node_modules del Front en tu local (usando NPM)
install-front:
	docker compose run --rm front npm install

# --- UTILIDADES ---

# Entrar a la terminal del Backend
shell-back:
	docker compose exec back /bin/bash

# Entrar a la terminal del Frontend
shell-front:
	docker compose exec front /bin/sh

# Limpiar todo (borra contenedores y volúmenes de base de datos - CUIDADO)
clean:
	docker compose down -v

##Cosas de vic por usar wsl: sudo chown -R $USER:$USER back

node_modules: 
	docker compose run --rm back yarn install
	docker compose run --rm front npm install
 


# Generar el prisma
back-prisma-generate:
	docker compose exec back npx prisma generate
	