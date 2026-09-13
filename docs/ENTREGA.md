# Guía de entrega y presentación

## Relación con la pauta

| Criterio | Implementación / evidencia |
| --- | --- |
| IE1.1.1: estructura HTML y navegación | Todas las páginas incluyen `header`, `nav`, `main`, `section` y `footer`; `article` representa productos y contenido independiente. Navegación entre seis páginas con enlaces relativos, botones operativos e imágenes con texto alternativo. Video con `iframe`, título y enlace alternativo en Inicio. |
| IE1.1.2: CSS personalizado externo | Las seis páginas enlazan `css/styles.css`. Variables de color, Grid, Flexbox, media queries, estilos de foco y errores. |
| IE1.2.1: validación JavaScript | `validate`, `error` y `bindValidation` en `js/app.js`. Reglas por campo en acceso, contacto e inventario; mensajes contextuales, `aria-invalid`, `aria-describedby`, foco en el primer error y prevención de envío con `preventDefault()`. |
| IE1.3.1: repositorio colaborativo | Pendiente de evidencia real: asignar nombres a las tareas de COLABORACION.md, trabajar en ramas, revisar e integrar aportes y publicar en el remoto del equipo. |
| IE1.1.3: explicar semántica | Demostrar cómo `nav` agrupa enlaces, `main` contiene lo principal y `article` identifica productos independientes. Una jerarquía de encabezados comunica la estructura. |
| IE1.1.4: explicar CSS externo | Cambiar `--green` en `:root` y explicar cómo se aplica a todas las páginas. Mostrar Grid de productos y media queries. |
| IE1.2.2: demostrar validaciones | Enviar contacto vacío, ingresar un correo incorrecto, corregirlo y mostrar éxito. En inventario probar código repetido, precio negativo y stock decimal. |
| IE1.3.2: justificar colaboración | Mostrar el historial real y una revisión de cambios: los mensajes explican la intención y las ramas separan tareas hasta su integración. |

## Guion sugerido (8–10 minutos)

1. **Objetivo (1 min):** tienda gaming como evolución del inventario de referencia; distinguir frontend de backend.
2. **HTML (2 min):** recorrer portada, catálogo y contacto; mostrar etiquetas semánticas, enlaces, imágenes y video.
3. **CSS (1 min):** explicar hoja compartida, paleta, Grid/Flexbox y diseño móvil.
4. **JavaScript (3 min):** filtrar productos, agregar al carrito, cambiar cantidades, validar contacto y editar inventario con admin.
5. **Git (2 min):** cada integrante muestra su aporte real y una integración revisada. No presentar una propuesta de tareas como trabajo realizado.
6. **Límites (1 min):** almacenamiento local, sesión simulada y ausencia de transacciones reales.

## Pruebas para repetir antes de entregar

| Caso | Resultado esperado |
| --- | --- |
| Inicio y enlaces del menú | Navegan entre páginas; CSS e imágenes cargan. |
| Buscar un texto inexistente | Mensaje de catálogo sin coincidencias. |
| Categoría Consolas / limpiar filtros | Solo consolas / vuelve el catálogo completo. |
| Orden menor y mayor precio | Orden numérico correcto. |
| Producto sin stock | Botón de agregar deshabilitado. |
| Agregar y aumentar una unidad | Badge, cantidad y total se actualizan; no excede stock. |
| Compra demo | Carrito vacío y aviso explícito de simulación. |
| Contacto vacío | Error junto a cada campo y foco en nombre. |
| Correo incompleto o mensaje corto | No aparece confirmación de éxito. |
| Contacto válido y casilla marcada | Confirmación sin envío ni almacenamiento. |
| Credenciales incorrectas | Error; el quinto fallo impone espera de 60 segundos. |
| Admin / Admin123 | Se habilita el inventario. |
| Código duplicado o precio negativo | El producto no se guarda y aparece un error específico. |
| Crear, editar y eliminar | Tabla y catálogo reflejan los cambios. Eliminar pide confirmación. |
| Salir e intentar administrar | Pide cuenta de administrador. |
| Recargar y abrir otra pestaña del mismo origen | Se mantienen productos y carrito locales. |
| Pantalla de 390 px y teclado | Menú legible, columnas adaptadas y foco visible. |
| Video | Reproducir manualmente con internet; si el proveedor bloquea el iframe, usar el enlace alternativo. |

## Verificación efectuada durante la creación

Comprobados en navegador: render de inicio, agregar al carrito, aumento de cantidad y total, confirmación de compra demo, contacto vacío y válido, acceso admin, rechazo de precio negativo, creación y edición de un producto de prueba. El producto temporal se retiró al terminar. La sintaxis JavaScript se revisó con `node --check`.

El video se enlazó a la guía «How to build a PC, the last guide you'll ever need!» de YouTube: https://www.youtube.com/watch?v=BL4DCEp7blY . La reproducción embebida depende del proveedor y de la conexión; no se acredita reproducción completa en esta revisión.
