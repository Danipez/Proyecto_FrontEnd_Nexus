# NEXUS Gaming

Frontend de tienda de componentes, periféricos y consolas. Evaluación Parcial 2, DSY1104.

## Abrir la aplicación

En Windows, ejecutar `INICIAR.cmd` y visitar `http://127.0.0.1:8081`. Mantener la terminal abierta. El archivo sirve la compilación incluida en `dist/`; si el puerto está ocupado, cerrar el servidor anterior o ejecutar en PowerShell `$env:PORT=8082` antes de `node scripts/serve.mjs`.

## Desarrollo

Node.js 22.12 o superior. Para reproducir exactamente las dependencias, usar el archivo pnpm-lock.yaml:

```powershell
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

También se admite `npm install` y luego `npm run dev`, aunque la resolución exacta de versiones está fijada en el lock de pnpm. El servidor de desarrollo indica su dirección en la terminal. Tras modificar el código, ejecutar `pnpm build` para actualizar dist.

## Pruebas y cobertura

```powershell
pnpm test
pnpm build
```

Jasmine define 35 casos. Karma los ejecuta en un navegador Chromium sin interfaz. En Windows se utiliza Edge cuando está instalado en su ruta habitual; en otros equipos, establecer CHROME_BIN con la ruta a Chrome o Chromium. Istanbul instrumenta src y karma-coverage genera coverage/index.html y coverage/coverage-summary.json. Los resultados individuales están en reports/test-results.json. Se excluyen main.jsx, seed.js, CSS, recursos y dependencias de la métrica de código.

## Organización

- src/App.jsx: rutas por hash, menú y estructura común.
- src/Store.jsx: estado compartido, sesión y operaciones de inventario y carrito.
- src/pages: Inicio, Catálogo, Carrito, Login, Contacto y Administración.
- src/components: controles reutilizables con propiedades y estado.
- src/domain.js: reglas independientes de la interfaz.
- src/storage.js: persistencia y lectura de fotografías.
- tests/suite.jsx: pruebas de componentes, DOM y reglas con mocks.
- public/assets: fotografías, ilustraciones y video.
- documentos: ERS, explicación de código y cobertura de testing.

## Acceso y alcance

Cuenta administrativa: `admin` / `Admin123`. Cuenta de cliente: `jperez` / `User123`.

La aplicación gestiona catálogo, carrito, compra con descuento de stock y comprobante local. El almacenamiento opera en el navegador y no se comparte entre computadores. El acceso se valida en el cliente; no constituye autenticación de servidor. La versión no integra pasarela bancaria, facturación tributaria ni servicio de correo. Contacto valida los campos y confirma esa validación, sin enviar mensajes.

Los datos anteriores se importan desde nexus_products, nexus_cart y nexus_last_order cuando no existe nexus_state_v2 y se utiliza el mismo origen. Cambiar de puerto, host o navegador implica otro almacenamiento. La sesión conserva su clave nexus_session y su vencimiento de treinta minutos.

## Publicación

Repositorio del proyecto: https://github.com/Danipez/Proyecto_FrontEnd_Nexus

El contenido de dist se puede publicar en un servidor estático o GitHub Pages. El enrutamiento por hash permite recargar rutas sin configuración de redirecciones del servidor. El workflow verify.yml ejecuta pruebas y compilación al recibir cambios; no publica ni atribuye contribuciones automáticamente a otras personas.

## Referencias

- React: https://react.dev/learn
- Bootstrap: https://getbootstrap.com/docs/5.3/layout/grid/
- Jasmine: https://jasmine.github.io/
- Karma: https://karma-runner.github.io/latest/index.html
- Fotografía del setup: ELLA DON / Unsplash, https://unsplash.com/photos/JomkRNkzKhE

Las fotografías de productos y el video se conservaron de la versión anterior del proyecto.
