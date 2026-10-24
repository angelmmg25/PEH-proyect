# PEH — pruebas con Vitest

## Integración
1. Extrae PEH_Vitest_tests.zip.
2. Copia la carpeta tests dentro de peh-react, junto a src, public y package.json.
3. Ya debes tener instalado Vitest en peh-react con npm.cmd install -D vitest.
4. Los scripts del package.json principal deben incluir "test": "vitest run" y "test:watch": "vitest".
5. Desde la terminal situada en peh-react ejecuta: npm.cmd test
6. Resultado esperado: Test Files 1 passed (1) y Tests 10 passed (10).
7. Para repetir al guardar cambios: npm.cmd run test:watch. Para detener: Ctrl+C.

No instales dependencias dentro de tests. No requiere Jasmine, Karma, Chrome, jsdom ni cambios a vite.config.js.

## Casos
01. Persistencia de la solicitud de adopción y recuperación en el historial.
02. Persistencia de reserva veterinaria y recuperación en el historial.
03. Comentarios visibles desde otra cuenta.
04. Publicaciones visibles desde otra cuenta.
05. Separación de adopciones y reservas entre cuentas y modo invitado.
06. Eliminación de publicación propia sin borrar las demás.
07. Bloqueo de reservas duplicadas tras volver a iniciar sesión.
08. Filtros de perros y gatos del catálogo.
09. Estado Compartido persistente y separado por cuenta.
10. Prohibición de eliminar publicaciones de otra cuenta.

## Alcance
Los casos importan los servicios reales de src. Se sustituye localStorage por un Map en memoria y se proporciona window con EventTarget y crypto nativos de Node. Los globales se restauran al terminar. No se accede al almacenamiento real del navegador.
Las cuentas son datos de prueba: no se verifica el registro ni contraseñas. Reconstruir las cadenas JSON y reabrir una sesión comprueba la recuperación de datos, sin simular un F5 real ni un cierre del navegador. No se comprueban clics, renderizado React, responsive ni recorridos completos en un navegador.

## Verificación realizada
Vitest 5.0.5, Node 24.19.0, Linux.
Resultado: 1 archivo aprobado; 10 pruebas aprobadas.
Se usaron los servicios y datos extraídos del ZIP PEH JK del usuario, sin modificarlos. Se ejecutó en entorno Node con la configuración predeterminada de Vitest. La ejecución en el equipo Windows del usuario queda por comprobar.
