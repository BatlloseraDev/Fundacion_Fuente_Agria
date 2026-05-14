# Fuente_Agria_Proyect

Proyecto para la Fundacion Fuente Agria de Puertollano.

## Arranque con Docker

Al arrancar el proyecto con Docker por primera vez, el servicio `ollama-models` descarga automaticamente los modelos necesarios para el asistente virtual:

- `nomic-embed-text`
- `qwen2.5:1.5b`

La primera ejecucion puede tardar varios minutos. Despues, los modelos quedan guardados en el volumen `ollama_data` y no se descargan de nuevo mientras no se borre ese volumen.
