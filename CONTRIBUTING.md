# Guía de trabajo de TEA

Este documento reúne los requisitos del hackathon y las reglas del proyecto. Se leyó en las páginas oficiales el 13 de noviembre de 2026. Si algo cambia en el sitio oficial, el sitio manda.

Páginas de referencia:
- Preguntas frecuentes: https://www.spaceappschallenge.org/resources/participant-faqs/
- Guía de evaluación y premios: https://www.spaceappschallenge.org/resources/judging-awards-guide/
- Guía de entrega del proyecto: https://www.spaceappschallenge.org/resources/project-submission-guide/
- Guía de formación de equipos: https://www.spaceappschallenge.org/resources/team-formation-guide/
- Reto: https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/

## 1. Requisitos del hackathon

Plazos, formulario, formato de la demo, criterios de evaluación y lista antes de enviar: ver [docs/hackathon-requirements.md](docs/hackathon-requirements.md).

### Reglas sobre el uso de SI (IA)
- Se permite usar herramientas de SI como apoyo. **No deben usarse para idear cómo resolver el reto.** La idea de la solución debe ser del equipo.
- Lo generado **no puede usar ni modificar marcas NASA** (logos, banderas, identificadores de misiones).
- Se debe indicar dónde y cómo se usó: **imágenes y video** generados, con **marca de agua visible**; **audio**, con aviso en el texto descriptivo y los metadatos; **código y datos**, con aviso en el texto descriptivo y los metadatos.
- La respuesta del campo "Use of SI" es solo para recopilar datos y no la ven los jueces. Sí ven las marcas de agua, textos y metadatos dentro del proyecto, y evalúan originalidad, intención y ejecución.
- Consecuencia práctica: el ícono hecho con una herramienta de imágenes lleva marca de agua visible, o se hace a mano. Los archivos de código escritos con asistencia llevan un aviso (comentario de cabecera o nota en el README).

## 2. Reglas del proyecto

### Alcance
- Un caso bien hecho: McLean County, Illinois. Casos: verano 2023 (reciente) y 2012 (contraste extremo).
- Tres rotaciones por comparación: la actual (maíz-soya) y dos alternativas.
- No se añaden funciones por aparentar. Lo opcional (globo 3D, comparador antes y después) solo se hace si sobra tiempo y no toca el núcleo.

### Datos
- Solo se usan fuentes verificadas: NASA POWER, NASA GIBS, USDA Soil Data Access, CropScape.
- Cada número que se muestra lleva su fuente, el parámetro y la fecha de consulta.
- Los datos faltantes no se rellenan con ceros ni se inventan. Lo desconocido se muestra como desconocido.
- Los datos simulados se etiquetan siempre como simulados.
- NASA POWER es una cuadrícula gruesa (unos 50 km). No se presenta como medición de una parcela.
- Los límites conocidos se declaran en la interfaz y en la entrega (ver README).

### Evidencia y citas
- No hay puntaje final ni "mejor opción": la decisión es del agricultor.
- Cada frase indica su origen: dato NASA, cálculo de la plataforma, texto del modelo o cita por verificar.
- Las rotaciones alternativas son **hipotéticas**, porque no existen en los campos observados. Se apoyan en fuentes citadas y se dice así.
- No se cita una fuente sin haberla abierto y leído. Las fuentes de la sección 4 están marcadas por verificar.
- Si una fuente contradice la recomendación (por ejemplo, coberturas con gramíneas que bajan algo el rendimiento del maíz), se muestra.

### Código
- Python solo para preparar datos antes de la demo (`pipeline/`). La página (`web/`) es estática.
- React con Vite. Carpetas por funcionalidad en `web/src/features/`.
- Componentes solo pintan. La lógica con estado y efectos va en hooks. Las reglas de rotación van en `features/rotations/` (`rules.ts`, `compare.ts`) como funciones puras, sin React.
- Cada funcionalidad expone solo lo necesario mediante su `index.ts`.
- Todo lo 3D, si se hace, va en `features/globe/` con carga diferida.
- Las dependencias van en un solo sentido: componentes, hooks, reglas. Las reglas no importan React, `fetch` ni archivos.
- Sin Docker. La IA en vivo, si se hace, va en una función serverless en `web/api/`; las explicaciones pregeneradas son la base. La clave de API va en variables de entorno, nunca en el repositorio.
- TypeScript recomendado para datos y props.
- Pruebas junto a cada archivo, primero en las reglas y en la validación de cifras y citas.
- Sin carpetas ni capas "por si acaso".
- Revisar la licencia de cada librería antes de usarla. Ejemplo: react-leaflet 5 se reportó bajo una licencia no estándar.

### Originalidad y derechos
- No se copia código de otros proyectos, ni del hackathon de Meta ni de los ganadores. Se toman técnicas e ideas.
- Todo recurso externo (código, librería, imagen, texto) se anota en la sección 4 para pasarlo al campo "References".
- El ícono es una obra original. Las imágenes de referencia sirven solo de inspiración de estilo.
- No se suben claves de API ni credenciales. Las claves van en variables de entorno y fuera del repositorio.
- El repositorio es público: no se publica nada que no deba ser público.

### Flujo de trabajo
- Commits pequeños, con mensaje que diga qué cambia y por qué.
- Antes de subir (push), revisar que no haya claves, datos personales ni archivos pesados.
- Los resultados de pruebas de datos se guardan en el README con sus límites.

## 3. Registro de uso de SI/IA

La entrega exige describir cómo se usaron herramientas de SI. Se anota aquí desde el inicio para no reconstruirlo al final.

| Herramienta | Para qué se usó | Dónde se nota |
|---|---|---|
| Claude (asistente de IA) | Investigación de reto y fuentes, pruebas de las APIs de datos, borradores de texto, propuesta de estructura de carpetas | README, CONTRIBUTING, pruebas de datos |
| (añadir) | | |

Regla: lo que genere una herramienta de IA se revisa y se entiende antes de usarlo, y la persona que firma el proyecto responde por ello.

## 4. Registro de referencias externas

Para copiar al campo "References" de la entrega. Estado "por verificar" significa que la fuente salió de una búsqueda y todavía no se abrió completa.

| Recurso | Uso | Estado |
|---|---|---|
| NASA POWER, https://power.larc.nasa.gov/ | Clima y humedad de zona de raíces | Verificado como accesible |
| NASA GIBS (Worldview), https://gibs.earthdata.nasa.gov | Mosaicos satelitales por fecha | Verificado como accesible |
| USDA Soil Data Access (SSURGO) | Suelo por coordenada | Verificado como accesible |
| USDA CropScape (CDL), https://nassgeodata.gmu.edu/CropScape/ | Cultivo por año | Verificado como accesible |
| CropWatch, Universidad de Nebraska: rotaciones diversas, https://cropwatch.unl.edu/2021/more-diverse-crop-rotations-improve-yield-yield-stability-and-soil-health | Rotaciones alternativas | Por verificar |
| Ensayo de largo plazo del USDA en Nebraska, https://par.nsf.gov/servlets/purl/10554940 | Estabilidad frente a sequía | Por verificar |
| American Society of Agronomy, estudio de coberturas en Illinois, https://agronomy.org/news/media-releases/releases/2020/0916/1214 | Advertencia sobre coberturas | Por verificar |
| Illinois NREC en Field Advisor, https://fieldadvisor.org/refining-cover-crop-recommendations-for-corn-soybean-rotations-based-on-species-and-timing/ | Guía de coberturas | Por verificar |
| Top Crop Manager, trigo en rotaciones (Ontario), https://www.topcropmanager.com/complex-crop-rotations-19018/ | Evidencia de otra región | Por verificar |
| NASA Worldview, https://worldview.earthdata.nasa.gov/ | Referencia de diseño de interfaz | Referencia de estilo, sin código reutilizado |
| Proyectos ganadores de Space Apps 2025 (Queñaris, Henry's Farm Adventures, Twisters) | Referencia de técnicas | Referencia de estilo, sin código reutilizado |
