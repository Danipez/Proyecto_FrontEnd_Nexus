# Trabajo colaborativo pendiente de realizar por el equipo

Esta es una propuesta de distribución, no evidencia de contribuciones ya realizadas. Reemplazar los responsables con los nombres reales y adaptar al tamaño del grupo.

| Responsable por asignar | Tarea | Evidencia esperada |
| --- | --- | --- |
| Integrante 1 | Revisar semántica, navegación y contenido de HTML | Rama, commits y revisión de otro integrante |
| Integrante 2 | Ajustar CSS, accesibilidad y diseño móvil | Comparación de capturas y commits |
| Integrante 3 | Extender o revisar validaciones y carrito | Casos probados y commits |
| Integrante 4, o tarea compartida | Revisar inventario, documentación e integración | Pull request revisado y pruebas finales |

## Flujo

1. Crear el repositorio remoto del equipo y compartir acceso con los integrantes.
2. Conectar el proyecto al remoto, usando la URL real. Revisar los archivos antes de publicarlos.
3. Cada integrante clona el repositorio y crea una rama por tarea, por ejemplo `codex/validaciones-contacto`.
4. Realizar cambios propios, probarlos y registrarlos con mensajes que expliquen la intención.
5. Subir la rama y abrir una solicitud de integración. Otro integrante revisa los cambios y pruebas.
6. Integrar y actualizar la rama principal antes de comenzar otra tarea.

Ejemplo de comandos (sustituir los valores de ejemplo; no se han ejecutado contra un remoto):

```sh
git remote add origin URL_REAL_DEL_REPOSITORIO
git add index.html productos.html carrito.html login.html contacto.html admin.html css js assets README.md docs .gitignore
git commit -m "feat: crear tienda academica NEXUS Gaming"
git push -u origin HEAD
git switch -c codex/validaciones-contacto
# Realizar y probar la tarea asignada
git add js/app.js
git commit -m "fix: mejorar validacion de correo y mensajes de ayuda"
git push -u origin codex/validaciones-contacto
```

No copiar un mensaje de commit si ese cambio no se realizó. No cambiar el autor para simular aportes de otra persona.

## Evidencia para el docente

- URL accesible del repositorio remoto.
- Tabla completada con nombres y tareas reales.
- Historial: `git log --oneline --graph --all`.
- Solicitudes de integración con revisión de compañeros.
- Capturas o registro de pruebas por cada aporte.
- Explicación individual del código aportado.

Estado inicial: la carpeta de trabajo contiene un repositorio Git sin commits y sin remoto configurado. No se publicó contenido ni se generó historial artificial para la entrega.
