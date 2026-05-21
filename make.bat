@echo off

REM --- Router de Comandos ---
IF "%1"=="start" GOTO start
IF "%1"=="stop" GOTO stop
IF "%1"=="restart" GOTO restart
IF "%1"=="hard_restart" GOTO hard_restart
IF "%1"=="reinstall" GOTO reinstall
IF "%1"=="logs" GOTO logs
IF "%1"=="init" GOTO init
IF "%1"=="install" GOTO install
IF "%1"=="install-back" GOTO install-back
IF "%1"=="install-front" GOTO install-front
IF "%1"=="shell-back" GOTO shell-back
IF "%1"=="shell-front" GOTO shell-front
IF "%1"=="clean" GOTO clean
IF "%1"=="node_modules" GOTO node_modules
GOTO help

:help

REM Si no hay argumentos o no coincide, muestra ayuda
ECHO.
ECHO Uso: make [comando]
ECHO.
ECHO Comandos disponibles:
ECHO   start          - Arrancar contenedores
ECHO   stop           - Detener contenedores
ECHO   restart        - Reiniciar contenedores
ECHO   hard_restart   - Reiniciar completamente
ECHO   reinstall      - Reiniciar y actualizar
ECHO   logs           - Ver logs en tiempo real
ECHO   init           - Instalar dependencias y arrancar (primera vez)
ECHO   install        - Instalar dependencias en back y front
ECHO   install-back   - Instalar solo back (yarn)
ECHO   install-front  - Instalar solo front (npm)
ECHO   shell-back     - Entrar a terminal del back
ECHO   shell-front    - Entrar a terminal del front
ECHO   clean          - Borrar todo (contenedores y volumenes)
ECHO   node_modules   - Reinstalar node_modules
GOTO end

REM --- DEFINICIÓN DE COMANDOS ---

:start
    docker compose up -d
    GOTO end

:stop
    docker compose stop
    GOTO end

:down
    docker compose down
    GOTO end


:restart
    docker compose stop
    docker compose up -d
    GOTO end

:hard_restart
    docker compose down
    docker compose up -d
    GOTO end

:reinstall
    docker compose down -v
    docker compose up -d
    GOTO end

:logs
    docker compose logs -f
    GOTO end

:init
    call :install
    call :start
    GOTO end

:install
    call :install-back
    call :install-front
    GOTO end

:install-back
    echo Instalando dependencias de Back (Yarn)...
    docker compose run --rm back yarn install
    GOTO end

:install-front
    echo Instalando dependencias de Front (NPM)...
    docker compose run --rm front npm install
    GOTO end

:shell-back
    docker compose exec back /bin/bash
    GOTO end

:shell-front
    docker compose exec front /bin/sh
    GOTO end

:clean
    echo BORRANDO TODO (BD INCLUIDA)...
    docker compose down -v
    GOTO end

:node_modules
    echo Reinstalando node_modules
    docker compose run --rm back yarn install
 	docker compose run --rm front npm install
    GOTO end


:end