# Instrucciones Persistentes para la IA (GEMINI.md)

Este archivo contiene las directivas obligatorias de lectura, escritura y control de documentación para el desarrollo de este proyecto de código (**dev-dashboard**).

## 1. Rutas de Lectura Centralizadas (Estándares y Biblioteca)
Para garantizar la consistencia visual y no duplicar lógica, se deben consultar las siguientes rutas de la biblioteca oficial y manuales técnicos:
* **Biblioteca de Componentes UI Reutilizables**: `D:\Aplicaciones\Documentacion Proyecto\06_Biblioteca_Componentes\`
* **Manuales Técnicos de Desarrollo**: `D:\Aplicaciones\Documentacion Proyecto\07_Manuales_Desarrollo\`

## 2. Ruta de Escritura Exclusiva de este Cliente
Toda la documentación de seguimiento, estado de tareas y cambios relacionados con este proyecto se debe registrar **única y exclusivamente** en la siguiente subcarpeta asignada a este cliente:
`D:\Aplicaciones\Documentacion Proyecto\08_Proyectos_Clientes\dev-dashboard\`

Los tres archivos obligatorios que se deben mantener sincronizados en dicha carpeta son:
1. `tareas_pendientes.md` - Checklist de tareas y roadmap específico de este cliente.
2. `bitacora_cambios.md` - Registro técnico de cambios en el código de este cliente.
3. `mapa_aplicacion.md` - GPS físico y lógico de los archivos de este cliente.

## 3. Restricción de Escritura
Queda **estrictamente prohibido** crear, modificar o eliminar archivos de documentación fuera de la subcarpeta asignada (`dev-dashboard`) dentro de `08_Proyectos_Clientes`.

## 4. Uso Estratégico de Repositorios y Librerías Externas (CRÍTICO)
* Existe un catálogo curado de repositorios GitHub y librerías evaluadas en: `D:\Aplicaciones\Documentacion Proyecto\09_Plan_Escalabilidad_Negocio\repositorios_github_utiles.md`
* **CONDICIÓN DE ACTIVACIÓN:** Consultar este catálogo únicamente cuando se necesite implementar una funcionalidad que podría beneficiarse de una librería externa (animaciones, gráficos, pagos, PDFs, onboarding, etc.). No consultar por defecto ni en cada turno.
* **REGLA DE ADAPTACIÓN:** Nunca copiar código de un repositorio externo directamente al proyecto. Usarlo como guía de referencia y adaptar la lógica al stack activo y al sistema de diseño del cliente.
* **VERIFICACIÓN PREVIA:** Antes de proponer instalar cualquier librería nueva, verificar si ya está declarada en `package.json`. Si ya está instalada, usarla directamente sin reinstalarla.
* **INCORPORACIÓN AL CATÁLOGO:** Si al resolver una tarea se identifica un repositorio útil no listado en el catálogo, proponer al usuario agregarlo con su ficha de evaluación de compatibilidad.
