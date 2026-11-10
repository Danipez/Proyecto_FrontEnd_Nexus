# NEXUS Gaming

Proyecto React con Bootstrap, React Router y API de JSON Server.

## Iniciar desde cero

Instalar Node.js 22.12 o superior. Abrir una terminal en esta carpeta:

```powershell
npm.cmd install
npm.cmd run dev
```

Abrir http://127.0.0.1:5173 y mantener la terminal abierta. El comando inicia Vite y JSON Server juntos. También se puede ejecutar INICIAR.cmd. Para detener ambos, presionar Ctrl+C.

Para instalar exactamente las dependencias del lockfile:

```powershell
npm.cmd install --global pnpm@11.25.0
pnpm.cmd install --frozen-lockfile
pnpm.cmd dev
```

## Cuentas

- Administrador: admin / Admin123
- Cliente: jperez / User123

No se incluye registro de cuentas. La API valida el acceso y entrega una sesión de 30 minutos. Reiniciar la API invalida sus sesiones; se debe ingresar nuevamente para modificar productos.

## Organización

- src/pages y src/components: vistas y componentes.
- src/App.jsx: HashRouter, Routes y Route de React Router.
- src/api.js: peticiones HTTP a la API.
- src/Store.jsx: estado compartido y acciones.
- src/domain.js: validaciones y reglas del carrito y la compra.
- server/index.mjs: JSON Server y rutas de acceso y compra.
- server/db.json: catálogo inicial.
- server/db.local.json: datos de trabajo, creado automáticamente; no se sube a Git.
- tests: pruebas conservadas como verificación adicional.
- public/assets: imágenes y video utilizados por el sitio.

## API

URL local: http://127.0.0.1:3001/api

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | /products | Consultar catálogo |
| GET | /products/:id | Consultar producto |
| POST | /products | Crear producto con token de administrador |
| PUT o PATCH | /products/:id | Modificar producto con token de administrador |
| DELETE | /products/:id | Eliminar producto con token de administrador |
| POST | /login | Validar usuario y contraseña |
| POST | /logout | Cerrar sesión |
| POST | /checkout | Validar compra, descontar stock y guardar comprobante |
| GET | /health | Comprobar disponibilidad |

El inventario y las compras quedan en el archivo JSON del servidor. El carrito y la última compra consultada se conservan además en el navegador. No se realizan cobros bancarios. Contacto valida sus campos sin enviar correo.

## Verificación

Las pruebas se conservan como apoyo aunque no sean evaluables según la indicación actualizada.

```powershell
npm.cmd test
npm.cmd run test:api
npm.cmd run build
```

Jasmine y Karma ejecutan los casos de interfaz y reglas en Edge o Chrome. La prueba de API usa una base temporal y comprueba CRUD, permisos, compra y persistencia. Los resultados y la cobertura se generan localmente y no forman parte del código entregado.

## Publicación

GitHub Pages solo aloja el frontend y no ejecuta JSON Server. Para usar esta versión completa, iniciar el proyecto localmente o publicar la API en un servidor Node.js y definir VITE_API_URL antes de compilar. El workflow de Pages se ejecuta manualmente y requiere esa dirección para no publicar una página desconectada.

## Referencias técnicas

- React Router: https://reactrouter.com/start/declarative/routing
- JSON Server 0.17.4: https://github.com/typicode/json-server/tree/v0.17.4
- Fotografía del setup: ELLA DON / Unsplash, https://unsplash.com/photos/JomkRNkzKhE
