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

## Arquitectura y estructura de carpetas

Monolito simple en un solo repositorio, con dos partes unidas por un contrato de datos:

1. **pipeline/** (Python): se ejecuta antes de la demo. Descarga, resume y guarda JSON.
2. **web/** (React con Vite): página estática que lee esos JSON.

No se usa arquitectura hexagonal completa: el alcance es de un fin de semana. Se conserva una sola idea de ella: la lógica que compara rotaciones (`domain/`) no sabe de dónde vienen los datos ni cómo se muestran.

### Principio para el frontend

Se usa el modelo propio de React y no patrones trasplantados de otros lenguajes.

| Idea habitual | Equivalente en React |
|---|---|
| Vista | Componentes: solo pintan según sus props |
| Controlador | Hooks personalizados: estado y efectos (`useRotations`, `useTimeline`) |
| Servicio | Módulos de funciones para cargar datos en `shared/lib`, usados desde hooks |
| Estado compartido | Context con `useReducer`, o una librería pequeña como Zustand |
| Modelo o dominio | Funciones puras en TypeScript, sin React |
| Carga pesada (3D) | `React.lazy` y `Suspense` |

### Carpetas

```
tea/
├── docs/                  decisiones, fuentes y reglas citadas
├── pipeline/              Python, se ejecuta antes de la demo
│   ├── download/          NASA POWER, SMAP, NDVI
│   ├── summarize/         resumen por temporada y región
│   ├── explain/           explicaciones con plantillas o modelo
│   └── schema/            contrato JSON entre pipeline y web
├── data/processed/        JSON listos para la página
└── web/src/
    ├── app/               raíz, rutas y proveedores de contexto
    ├── features/          una carpeta por funcionalidad
    │   ├── map/           mapa y línea de tiempo
    │   ├── rotations/     tarjetas, comparación y domain/ (reglas puras)
    │   ├── evidence/      panel de evidencia y etiquetas de origen
    │   ├── priorities/    prioridades del agricultor
    │   └── globe/         3D opcional, aislado y con lazy loading
    ├── shared/            componentes, hooks y utilidades comunes
    ├── data/              JSON procesados que consume la página
    └── styles/
```

### Reglas

1. Un componente, una responsabilidad. El hook decide, el componente pinta.
2. Nada de lógica de negocio dentro del JSX: va en `domain/` o en un hook.
3. Cada feature expone solo lo necesario mediante su `index.ts`.
4. Composición antes que herencia: piezas pequeñas que se combinan.
5. Los efectos (cargas, temporizadores, eventos del mapa) viven en hooks.
6. TypeScript recomendado, para tipar datos y props.
7. Todo lo 3D va dentro de `features/globe/` y se carga con `lazy`: si falla o sobra, se borra la carpeta sin tocar el resto.
8. Las pruebas van primero en `domain/` y en la validación de cifras y citas.
9. No crear carpetas ni capas "por si acaso": solo las que se usan.

### Librerías de React a evaluar

Se conocen por nombre y no se han probado: react-leaflet (mapa), react-three-fiber (3D) y un globo en React como react-globe.gl. Revisar la licencia de cada una antes de elegir. Por ejemplo, otro proyecto documentó que react-leaflet 5 usa una licencia no estándar.

## Opcional: planeta giratorio

Idea de pantalla de entrada: un globo terráqueo que gira, se hace zoom hacia la región y se entra al mapa de la finca. Solo se hace si sobra tiempo el domingo. El mapa plano es la base y no depende de esto.

Opciones a evaluar (no probadas ni comparadas todavía; comprobar peso, licencia y facilidad antes de elegir):

| Opción | Idea |
|---|---|
| globe.gl (basada en three.js) | Globo interactivo con pocas líneas de código. |
| CesiumJS | Globo 3D completo y muy potente, pero pesado para este alcance. |
| three.js directo | Máximo control, más trabajo. |
| Imagen o video corto de un globo girando | Alternativa mínima: sin 3D en vivo, solo un recurso visual en la portada. |

Criterio de decisión: si tarda más de unas horas en funcionar, se descarta.

## Prueba de viabilidad del mapa

Primera tarea técnica, de unos 30 minutos: un mapa de Leaflet con una capa satelital de NASA (NDVI) y un control de fecha.

- NASA GIBS (la fuente de Worldview) podría servir capas como mosaicos con fecha. Hay que verificar que funciona en Leaflet, que no pide cuenta y qué capas de vegetación ofrece.
- Si funciona: se muestran imágenes reales de NASA sin descargar archivos, y el comparador de antes y después es sencillo.
- Si no funciona: plan de respaldo, preparar los datos en Python y guardarlos como imágenes pequeñas o JSON.

## Referencias técnicas de proyectos ganadores (2025)

Observado en sus sitios públicos. Solo como referencia de técnicas, no se reutiliza su código.

- Queñaris (Local Impact): aplicación de una sola página con Vite, Leaflet y lectura de archivos GeoTIFF en el navegador. Secciones de mapa NDVI, análisis histórico y análisis por zona.
- Henry's Farm Adventures, de Zumorroda-X (Art & Technology): juego 2D con Phaser, imágenes Landsat antes y después, NDVI y datos del US Drought Monitor.
- Twisters (Best Use of Technology): web app con APIs de NASA y Gemini.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Reto | Field Shift: Adapting Farms with NASA Data (dificultad Advanced/Intermediate) |
| Modalidad | Participación individual |
| Zona | McLean County, Illinois (EE. UU.) |
| Caso principal | Verano 2023 (sequía moderada reciente) |
| Contraste | Verano 2012 (sequía extrema) |
| Punto de caso A (maíz en 2023) | -88.6594, 40.2840. Suelo Osco |
| Punto de caso B (maíz en 2012) | -88.6735, 40.6954. Suelo Chenoa |
| Procesamiento de datos | Python, antes de la demo |
| Interfaz | React con Vite y Leaflet, página estática |
| Explicaciones | Plantillas por código, con modelo opcional |

Motivo de la zona: los datos de suelo (USDA) y de cultivos por año (CropScape) que recomienda el reto son de EE. UU. McLean fue el candidato donde los tres servicios respondieron con datos útiles.

## Datos verificados (noviembre de 2026)

| Dato | Fuente | Estado |
|---|---|---|
| Lluvia, temperatura y humedad de zona de raíces, mensual | NASA POWER (API) | Funciona sin cuenta. Datos hasta septiembre de 2026 |
| Mosaicos satelitales por fecha (NDVI MODIS y VIIRS, lluvia IMERG) | NASA GIBS (WMTS) | Funciona. Permite CORS (`access-control-allow-origin: *`). NDVI MODIS cada 16 días desde 2000 |
| Suelo por coordenada | USDA Soil Data Access (SSURGO) | Funciona sin cuenta |
| Cultivo por año y coordenada | CropScape (CDL) | Funciona hasta 2025. Pide coordenadas en metros, proyección Albers EPSG:5070 |

Notas:
- GIBS no ofrece humedad de suelo de SMAP, solo capas de temperatura de brillo. La humedad de raíz sale de NASA POWER (`GWETROOT`).
- NASA POWER usa una cuadrícula de unos 50 km: representa la zona, no la parcela.
- Los servicios se probaron con consultas puntuales. La carga continua de varias capas en una demo no se probó.

## Hallazgos de McLean County

Muestra: 30 puntos al azar dentro del condado (verificados con el API de la FCC, código 17113). 23 son campos de cultivo (maíz o soya en al menos 12 de 16 años, 2008 a 2023).

Transiciones de un año al siguiente entre campos de cultivo (n = 338):

| Transición | Porcentaje |
|---|---|
| Maíz a soya | 45,6 % |
| Soya a maíz | 45,3 % |
| Maíz a maíz | 7,1 % |
| Soya a soya | 2,1 % |

- La rotación actual de la zona es la alternancia maíz-soya.
- No apareció trigo, alfalfa, heno ni otros cultivos en esos campos. Las rotaciones alternativas serán hipotéticas y deben apoyarse en fuentes agronómicas citadas.
- En 2012, 14 de 23 campos tenían maíz (61 %, intervalo aproximado 41 % a 78 %).

Clima de verano (junio a agosto) en el punto del caso A, NASA POWER:

| Año | Humedad de raíz | Desvío frente a 2001-2023 |
|---|---|---|
| 2012 | 0,51 | -1,98 |
| 2013 | 0,73 | +1,02 |
| 2022 | 0,61 | -0,59 |
| 2023 | 0,56 | -1,22 |
| 2024 | 0,62 | -0,41 |
| 2025 | 0,61 | -0,59 |
| 2026 | 0,66 | +0,04 |

- 2012 fue el verano más seco de 2001 a 2023. Con 2012 excluido de la base, su desvío es -2,23 (intervalo de remuestreo al 95 %: -3,06 a -1,77).
- Lluvia de verano 2012: 1,77 mm/día. Temperatura media de verano: 25,6 °C en 2012 y 21,9 °C en 2013.

Suelos de los puntos de caso (capa superior):

| Punto | Suelo | Drenaje | Grupo hidrológico | Materia orgánica | Agua disponible |
|---|---|---|---|---|---|
| A (-88.6594, 40.2840) | Osco, 90 % | Bien drenado | B | 3,5 % | 0,23 |
| B (-88.6735, 40.6954) | Chenoa, 94 % | Algo pobremente drenado | C/D | 4,3 % | 0,17 |

Historial de cultivos en los puntos:
- A: alterna cada año. Maíz en 2023, soya en 2012.
- B: alterna cada año. Maíz en 2012, 2022 y 2024. Soya en 2013, 2023 y 2025.

Límites de esta prueba:
- No hay rendimientos. La comparación retrospectiva mide estrés y exposición, no resultados.
- CropScape es una clasificación con error propio, no verificado aquí.
- Son 30 puntos (23 de cultivo): una muestra, no un censo.

## Por definir

- [x] Región concreta de la finca: McLean County, Illinois.
- [x] Fuente de datos de suelo: USDA Soil Data Access (SSURGO).
- [ ] Clave gratuita de NASS QuickStats, para traer rendimientos de maíz y soya por año.
- [ ] Fuentes agronómicas citables para las rotaciones alternativas (por ejemplo trigo o cultivo de cobertura).
- [ ] Criterios de evaluación y reglas sobre trabajo previo: no aparecieron en la página del reto ni en los recursos.
- [ ] Modelo para las explicaciones: Ollama local o API (confirmar permiso y crédito si es el plan de la empresa).
- [ ] Si se incluye el comparador de imágenes antes y después.
- [ ] Nombre completo o significado de TEA, si lo tiene.

## Antes del sábado

- [ ] Crear cuenta gratuita de NASA Earthdata.
- [ ] Comprobar que se pueden descargar datos reales de la región (NASA POWER como mínimo).
- [ ] Prueba de viabilidad del mapa con una capa NASA en Leaflet (ver sección arriba).
- [ ] Definir los 6 cultivos y sus reglas con fuentes.
- [ ] Armar el equipo y repartir roles: frontend, datos geoespaciales, agronomía, diseño y pitch.
- [ ] Revisar las reglas del hackathon sobre trabajo previo y equipos.
- [ ] Si se usa una API de modelo: llave propia con límite de gasto, nunca dentro del código de la página.

## Riesgos

- Reto de dificultad intermedia a avanzada. Un solo caso bien hecho vale más que varias funciones a medias.
- Si no se consiguen datos reales de la región a tiempo, el proyecto pierde fuerza. Plan de respaldo: NASA POWER más imágenes ya publicadas.
- Los puntajes de rotación deben apoyarse en fuentes. Si no, no resisten una pregunta de un juez científico.
- Muchos equipos harán una herramienta parecida. La diferencia tiene que verse en la demo.

## Identidad visual (borrador)

- Símbolo: una gerbera roja de pétalos finos con centro amarillo, dentro de un anillo dividido en tres segmentos (las tres rotaciones) y con un punto de órbita (el satélite).
- Paleta: verde azulado oscuro, ocre y rojo como acento.
- Divisa propuesta: "Evidence before advice".
- Debe ser una obra original. Las imágenes de referencia sirven solo para estilo y colores.

## Criterios de evaluación de referencia

Los premios globales de Space Apps incluyen Best Use of Data, Best Use of Science, Best Use of Technology, Galactic Impact y Local Impact, entre otros. El reto pide, de forma opcional, comparar al menos tres rotaciones y explicar evidencia, lagunas y riesgos.

## Referencias

- Página del reto: https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/
- Premios: https://www.spaceappschallenge.org/awards/
- Prototipo visual: https://claude.ai/artifact/NLB1N4QrmmBsEjgVkZcPhC (privado)
