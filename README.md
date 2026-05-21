# Fuente_Agria_Proyect

Proyecto para la Fundacion Fuente Agria de Puertollano.

## Instalación inicial

### 1. Archivos de variables de entorno

El proyecto usa tres archivos `.env` independientes. Créalos antes de arrancar:

#### `.env` — raíz del proyecto

```bash
cp .env.example .env
```

```
.env
├── MYSQL_ROOT_PASSWORD   → Contraseña del usuario root de MySQL
├── MYSQL_USER            → Usuario de la aplicación en MySQL
├── MYSQL_PASSWORD        → Contraseña del usuario anterior
├── MYSQL_DATABASE        → Nombre de la base de datos
├── DB_HOST               → Host de la BD (en Docker: mysql)
├── DB_PORT               → Puerto de MySQL (por defecto: 3306)
├── DATABASE_URL          → Cadena de conexión completa para Prisma
│                           mysql://USER:PASS@HOST:PORT/DB?allowPublicKeyRetrieval=true&ssl=false
├── JWT_SECRET            → Clave secreta para firmar tokens JWT (usa una cadena larga y aleatoria)
├── JWT_EXPIRES_IN        → Expiración del token (ej: 7d, 24h)
├── GOOGLE_CLIENT_ID      → ID de cliente OAuth 2.0 de Google Cloud Console
├── MAIL_HOST             → Servidor SMTP (ej: smtp.gmail.com)
├── MAIL_USER             → Dirección de correo remitente
├── MAIL_PASS             → Contraseña de aplicación del correo
├── MAIL_FROM             → Nombre y dirección visible para el destinatario
├── VITE_API_URL          → URL del backend accesible desde el navegador (ej: http://localhost:3000)
├── VITE_SOCKET_URL       → URL para WebSockets, normalmente igual que VITE_API_URL
└── RESERVATION_HOLIDAYS  → Festivos excluidos de días hábiles (YYYY-MM-DD separados por coma, puede dejarse vacío)
```

---

#### `back/.env` — backend (desarrollo local sin Docker)

No existe archivo de ejemplo; créalo manualmente:

```bash
cp back/.env back/.env.bak 2>/dev/null; touch back/.env
```

```
back/.env
├── OLLAMA_CHAT_MODEL   → Modelo de IA de Ollama que usa el asistente (ej: qwen2.5:1.5b)
└── FRONTEND_URL        → URL del frontend para configurar CORS (ej: http://localhost:5173)
```

---

#### `front/.env` — frontend (desarrollo local sin Docker)

```bash
cp front/.env.example front/.env
```

```
front/.env
├── VITE_GOOGLE_CLIENT_ID → ID de cliente OAuth 2.0 de Google para el login en el frontend
└── VITE_API_URL          → URL del backend a la que apunta el frontend (ej: http://localhost:3000)
```

---

### 2. Arrancar el proyecto

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Para el primer arranque deberemos lanzar el seed.
```bash
docker exec -it fuenteagria_back_prod yarn seed
```

Credenciales del administrador por defecto:

- **Email:** `admin@fuenteagria.com`
- **Contraseña:** `admin123`

La aplicación queda disponible en **http://localhost:80**.

---

### 3. Parar el proyecto

```bash
docker compose -f docker-compose.prod.yml down
```

Para parar y borrar todos los datos (base de datos incluida):

```bash
docker compose -f docker-compose.prod.yml down -v
```

## Arranque con Docker

Al arrancar el proyecto con Docker por primera vez, el servicio `ollama-models` descarga automaticamente los modelos necesarios para el asistente virtual:

- `nomic-embed-text`
- `qwen2.5:1.5b`

La primera ejecucion puede tardar varios minutos. Despues, los modelos quedan guardados en el volumen `ollama_data` y no se descargan de nuevo mientras no se borre ese volumen.
