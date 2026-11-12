# TEA

Herramienta de apoyo a decisiones que compara rotaciones de cultivo con datos de la NASA, mostrando la evidencia detrás de cada recomendación.

**Reto:** Field Shift: Adapting Farms with NASA Data (NASA Space Apps 2026).
**Fechas:** sábado y domingo del hackathon.
**Estado:** propuesta. Hay un prototipo visual con datos ilustrativos. Aún no hay código del proyecto.

## Idea

El agricultor indica su ubicación y sus prioridades (ahorrar agua, ingresos, salud del suelo). TEA compara tres rotaciones, incluida la que ya usa, y para cada una muestra:

- por qué se sugiere,
- qué evidencia la respalda,
- qué no sabemos,
- qué riesgos debe revisar un experto local.

TEA apoya la decisión y no la reemplaza. No da un puntaje final ni una "mejor opción".

## Qué la diferencia

- Cada frase indica su origen: dato NASA, cálculo de la plataforma, texto del modelo o cita por verificar.
- Las barras de cada rotación salen de reglas visibles y citadas, no de números inventados.
- Un mapa con línea de tiempo y un control de escenario de lluvia hacen visible el cambio entre años secos y húmedos.
- Una historia real de una finca abre la demo.

## Stack

| Capa | Tecnología | Notas |
|---|---|---|
| Preparación de datos | Python (xarray, rasterio, pandas) | Se ejecuta antes de la demo. Descarga, recorta a una región y guarda JSON. |
| Interfaz | React con Vite | Si el tiempo aprieta, HTML y JavaScript simples. |
| Mapa | Leaflet | |
| Datos NASA | NASA POWER, SMAP, GPM, NDVI (MODIS o Landsat) | Una sola región. Guardados como archivos estáticos. |
| Reglas de rotación | Código propio, tabla de unos 6 cultivos | Con fuentes citadas. |
| Explicaciones | Plantillas por código, mejoradas con un modelo | Opciones: Ollama local o una API. Se generan antes de la demo. |
| Publicación | Vercel o Firebase Hosting | Página estática. Sin servidor ni base de datos. |

## Alcance mínimo (MVP)

- Una región.
- Dos o tres fuentes NASA.
- Tres rotaciones fijas, incluida la actual.
- Tabla de cultivos hecha a mano.
- Cada rotación con evidencia, lagunas y riesgos.
- Mapa con control de año y de lluvia.
- Aviso fijo: apoya, no reemplaza a un experto local.

## Fuera del alcance

- ECOSTRESS, GRACE, GEDI y SRTM.
- Autenticación y base de datos.
- Historial de usuarios y múltiples regiones.
- Consultas en vivo a las APIs durante la demo.

## Por definir

- [ ] Región concreta de la finca.
- [ ] Fuente de datos de suelo (confirmar con los recursos del reto, publicados el viernes 13).
- [ ] Modelo para las explicaciones: Ollama local o API (confirmar permiso y crédito si es el plan de la empresa).
- [ ] Si se incluye el comparador de imágenes antes y después.
- [ ] Nombre completo o significado de TEA, si lo tiene.

## Antes del sábado

- [ ] Crear cuenta gratuita de NASA Earthdata.
- [ ] Comprobar que se pueden descargar datos reales de la región (NASA POWER como mínimo).
- [ ] Definir los 6 cultivos y sus reglas con fuentes.
- [ ] Armar el equipo y repartir roles: frontend, datos geoespaciales, agronomía, diseño y pitch.
- [ ] Revisar las reglas del hackathon sobre trabajo previo y equipos.
- [ ] Si se usa una API de modelo: llave propia con límite de gasto, nunca dentro del código de la página.

## Riesgos

- Reto de dificultad intermedia a avanzada. Un solo caso bien hecho vale más que varias funciones a medias.
- Si no se consiguen datos reales de la región a tiempo, el proyecto pierde fuerza. Plan de respaldo: NASA POWER más imágenes ya publicadas.
- Los puntajes de rotación deben apoyarse en fuentes. Si no, no resisten una pregunta de un juez científico.
- Muchos equipos harán una herramienta parecida. La diferencia tiene que verse en la demo.

## Criterios de evaluación de referencia

Los premios globales de Space Apps incluyen Best Use of Data, Best Use of Science, Best Use of Technology, Galactic Impact y Local Impact, entre otros. El reto pide, de forma opcional, comparar al menos tres rotaciones y explicar evidencia, lagunas y riesgos.

## Referencias

- Página del reto: https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/
- Premios: https://www.spaceappschallenge.org/awards/
- Prototipo visual: https://claude.ai/artifact/NLB1N4QrmmBsEjgVkZcPhC (privado)
