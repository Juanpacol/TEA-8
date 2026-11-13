# Landing page de TEA-8

Documento vivo. Describe cómo se divide la página comercial del proyecto, qué dice cada sección y qué falta. Se actualiza con cada versión.

La página va en inglés, porque la entrega del hackathon exige inglés en todo material enlazado. Este documento está en español para el equipo.

## Principios

1. Una sola página, sin login ni cuentas.
2. Cada sección responde una pregunta del visitante, en este orden: qué problema hay, qué hace TEA-8, cómo funciona, por qué confiar, cómo se ve.
3. Ninguna afirmación sin respaldo: lo que la página diga, la herramienta lo hace de verdad y los números salen de las fuentes verificadas.
4. La página apoya a la herramienta y no la reemplaza. La herramienta es la sección más importante.

## Referencia de estructura

La estructura se inspira en la landing de Ether, un proyecto anterior del autor para otro hackathon. Se toma la manera de dividir las secciones. El texto, las imágenes y el código son nuevos y no se copian. Ether se anota como referencia de estilo en "References" al enviar.

| Sección en Ether | Pregunta que responde | Equivalente en TEA-8 |
|---|---|---|
| Hero | ¿De qué trata esto? | Hero |
| Problema y solución | ¿Por qué importa? | The problem |
| Cómo funciona (4 pasos) | ¿Qué hace por dentro? | How it works |
| Seguridad ("sabemos cuándo no confiar en nosotros") | ¿Hasta dónde llega y hasta dónde no? | What it won't tell you |
| Demostración | ¿Cómo se ve? | The tool |
| Código abierto | ¿Puedo revisarlo? | Sources and code |
| Diferenciadores | ¿Por qué aguanta fuera de una demo? | Why it holds up |
| Llamado a la acción | ¿Qué hago ahora? | Call to action |

## Referencia de ganadores

Cómo presentan y venden su proyecto los ganadores de 2025, qué se adopta en TEA-8 y la plantilla de la página de entrega: ver [winners-reference.md](winners-reference.md).

## Secciones

### 1. Hero
- Objetivo: decir en una frase qué hace TEA-8 y que no reemplaza al agricultor.
- Borrador de titular: "TEA-8 doesn't tell farmers what to plant. It shows them what the data says."
- Subtítulo (una línea, con dato): "In 2012, summer soil wetness in McLean County, Illinois fell to 0.51 against an average of 0.66." Verificar el dato antes de publicar. Fuente: NASA POWER, humedad de zona de raíces, junio a agosto.
- Botón: "Open the tool", que baja a la sección 5.
- Imagen: ilustración botánica de maíz y otra de soya, grandes, con borde difuminado.

### 2. The problem
- Objetivo: situar el problema con un número real.
- Contenido: una cifra grande y dos frases. Ejemplo de estructura: "Corn and soybeans alternate on about 91% of year-to-year changes in the McLean County fields we sampled." Fuente: CropScape, 23 campos, 2008 a 2023. Aclarar que es una muestra.
- Idea que transmite: una región con dos cultivos alternados y pocas opciones de diversificar.

### 3. How it works
- Cuatro pasos, cada uno con una frase corta. Borrador:
  1. Reads the weather and the soil: NASA POWER, USDA soil survey.
  2. Looks at what grew: CropScape history by year.
  3. Compares three rotations, including the current one.
  4. Shows its work: every statement tagged with its source.
- Los números de paso van con baja opacidad, como en la referencia de estilo.

### 4. What it won't tell you
- Objetivo: la sección de honestidad. Es lo que más diferencia al proyecto.
- Contenido, en lista con marcas: no da un puntaje final ni una "mejor opción"; las rotaciones alternativas son hipotéticas y se apoyan en fuentes citadas; los datos de clima son de una cuadrícula de unos 50 km, no de una parcela; sin rendimientos reales, la comparación mide estrés y exposición, no resultados.
- Solo se declara lo que sea cierto al momento de publicar. Si cambia, se actualiza.

### 5. The tool
- Es la sección principal: mapa con control de año, tres tarjetas de rotación, panel de evidencia y aviso fijo.
- Se muestra en un panel oscuro con la paleta definida, dentro de la página clara. Es el único contraste fuerte de la página.
- Nota bajo el panel: dato de origen y aviso "A prototype built for the NASA Space Apps Challenge, not agronomic advice."

### 6. Sources and code
- Lista de fuentes con enlace: NASA POWER, NASA GIBS, USDA Soil Data Access, CropScape.
- Enlace al repositorio público.
- Declaración de uso de SI/IA, en una línea y con enlace a CONTRIBUTING.

### 7. Why it holds up
- Tres a cuatro puntos, cada uno con una prueba concreta en la herramienta:
  - Says when it isn't sure.
  - Every claim shows its source.
  - Built on open, public data.
  - Doesn't need a login or a server to run.
- Cada punto se mantiene solo si es verdad en el producto final.

### 8. Call to action
- "Try the tool", enlace al repositorio y a la página del equipo en Space Apps.
- Nombre del autor y contacto, a decidir.

### Pie de página
- Créditos de datos de NASA y USDA.
- Lista corta de referencias de imágenes con su licencia.
- Aviso: "Created for the NASA Space Apps Challenge." Revisar la guía de marca de Space Apps antes de usar su logo.

## Diseño visual

Decisión pendiente de confirmar: página clara y suave, con la herramienta en un panel oscuro.

- Fondo de página: un tono claro y cálido, similar al de la referencia. Las imágenes deben fundirse con él.
- Imágenes: máscara de gradiente radial para desvanecer los bordes, filtro en escala de grises o tinte suave, opacidad parcial en las decorativas.
- Profundidad: capas superpuestas con las imágenes detrás del texto. No es 3D real. Si se quiere un efecto de paralaje, es un añadido opcional.
- Tipografía: un tipo con serifa para los titulares, uno condensado para las etiquetas y uno de texto para lectura. Se eligen y se prueban antes de fijarlas.
- Movimiento: aparición suave por sección. Respetar `prefers-reduced-motion`. Máximo tres animaciones en la herramienta.
- Panel de la herramienta: paleta oscura de TEA-8 (ver README).

## Imágenes por conseguir

Cada imagen se verifica antes de usarla: licencia, autor y enlace de origen. Se anota en "References".

| Imagen | Uso | Estado |
|---|---|---|
| Ilustración botánica de maíz | Hero y sección 2 | Por buscar |
| Ilustración botánica de soya | Hero y sección 2 | Por buscar |
| Perfil de suelo o raíces | Sección 3 | Por buscar |
| Imagen satelital de NASA de la zona (NDVI o color real) | Sección 5 y fondo | Por buscar |
| Ícono del proyecto (gerbera roja en anillo) | Cabecera y pie | Por generar |

## Estado y registro de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | 13 nov 2026 | Estructura y borradores de texto. Sin código. |

Pendiente:
- [ ] Confirmar el contenido de cada sección con los datos finales.
- [ ] Verificar cada cifra citada contra la fuente.
- [ ] Conseguir y verificar las imágenes.
- [ ] Decidir tipografías.
- [ ] Construir primero la versión mínima: hero, dos imágenes con máscara y la herramienta.
- [ ] Revisar legibilidad en móvil y en pantallas pequeñas.
- [ ] Añadir las referencias a CONTRIBUTING.
