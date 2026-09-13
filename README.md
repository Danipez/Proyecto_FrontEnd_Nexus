# NEXUS Gaming

Proyecto académico de tienda de componentes de computadores, periféricos y consolas. Toma como referencia el inventario entregado, conserva la idea de usuarios y administración y agrega una experiencia de tienda. Desarrollado con HTML5, CSS externo y JavaScript sin frameworks ni instalación de dependencias.

## Abrir el proyecto

Desde esta carpeta, ejecutar:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Abrir http://127.0.0.1:8080 en el navegador. También puede utilizarse Live Server de VS Code. Se recomienda un servidor local: al abrir mediante `file://`, el almacenamiento compartido entre páginas depende del navegador. Detener el servidor con Ctrl+C.

## Cuentas de demostración

| Usuario | Contraseña | Acceso |
| --- | --- | --- |
| admin | Admin123 | Administración: crear, editar, eliminar y ocultar productos |
| jperez | User123 | Cliente: navegar por la tienda |

El catálogo y el carrito son públicos. La sesión dura 30 minutos. Después de cinco credenciales incorrectas, el acceso se bloquea durante 60 segundos en ese navegador.

## Archivos

- `index.html`: banner fotográfico, categorías, destacados y video embebido.
- `productos.html`: búsqueda, filtro por categoría, orden por precio y productos agotados.
- `carrito.html`: cantidades, eliminación, cálculo del total y compra simulada.
- `login.html`: inicio de sesión de prueba.
- `contacto.html`: formulario con etiquetas, autocompletado, sugerencias y errores personalizados.
- `admin.html`: inventario y formulario de productos.
- `css/styles.css`: estilos compartidos, diseño adaptable, estados de foco y errores.
- `js/app.js`: datos iniciales, almacenamiento, sesión, carrito, filtros y validaciones.
- `assets/`: fotografías reales locales, ilustraciones de respaldo y favicon; fuentes en `docs/IMAGENES.md`.
- `docs/ENTREGA.md`: matriz de requisitos, guion de exposición y pruebas manuales.
- `docs/COLABORACION.md`: distribución propuesta de tareas y flujo de Git.

## Alcance

Es una demostración de frontend, no una tienda lista para producción. No hay autenticación segura: las cuentas están en JavaScript y los roles pueden modificarse desde el navegador. No ingresar datos sensibles. No hay backend, pagos, despachos ni envío de formularios. La compra demo vacía el carrito, pero no registra ventas ni descuenta inventario. Precios, stock y descripciones son datos didácticos; las fotografías de productos son referenciales y sus fuentes están documentadas en `docs/IMAGENES.md`.

`localStorage` guarda `nexus_products`, `nexus_cart` y `nexus_attempts`; `sessionStorage` guarda `nexus_session`. El formulario de contacto no guarda datos. Para restaurar la demostración, eliminar únicamente esas claves desde las herramientas del navegador y recargar. Los cambios no se comparten entre dispositivos. Si el almacenamiento está bloqueado, se muestra un aviso; no puede iniciarse sesión sin almacenamiento de sesión.

La presentación de componentes usa video HTML5 local (`assets/video/nexus-componentes.mp4`): 28 segundos, H.264, 720p, textos en español y sin audio. No requiere internet. La guía completa de montaje permanece como enlace externo a YouTube.

El criterio de colaboración requiere aportes reales del equipo y un repositorio remoto: los archivos por sí solos no acreditan ese criterio. No se han inventado integrantes, commits ajenos ni evidencia de colaboración.
