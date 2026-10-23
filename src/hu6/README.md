# Historia 6 — Sustentación

Pantallas de la Historia 6 (págs. 41–47 del PDF de mockups). Entrega 1: **solo interfaz**, sin backend;
el estado vive en memoria (`context/reductor.js`).

Todo el código de la historia está dentro de esta carpeta. Fuera de ella solo se toca `src/App.jsx`
(registrar las rutas) y `docs/uml/historia-6-sustentacion/` (el UML).

## Cómo se conecta con el resto de la app

`src/App.jsx` ya lo hace así; las demás historias solo necesitan su propio bloque de rutas:

```jsx
import { ProveedorSustentacion, RUTAS_SUSTENTACION, RUTA_INICIAL_SUSTENTACION } from './hu6'

<ProveedorSustentacion>
  <Routes>
    {RUTAS_SUSTENTACION.map(({ path, Componente }) => (
      <Route key={path} path={path} element={<Componente />} />
    ))}
  </Routes>
</ProveedorSustentacion>
```

Cada entrada de `RUTAS_SUSTENTACION` trae `rol` (`ADMINISTRADOR` / `ESTUDIANTE`) y `pantalla`, por si el grupo
agrega un guardia de acceso por rol.

| Ruta | Rol | Pantalla |
|---|---|---|
| `/sustentaciones/programar` | Administrador | 6.1 Programar sustentación (+ modal sala ocupada) |
| `/sustentaciones/jurado` | Administrador | 6.2 Conformación del jurado |
| `/sustentaciones/acta` | Administrador | 6.3 Acta (+ modal confirmar) |
| `/sustentaciones/acta/imprimir` | Administrador | Acta A4 |
| `/mi-sustentacion` | Estudiante | 6.4 Mi sustentación (sin programar / programada / realizada) |
| `/mi-sustentacion/acta` | Estudiante | Acta A4 |

Para presentar, agrega `?demo` a cualquier ruta (por ejemplo `/sustentaciones/programar?demo`): aparece una barra
que cambia de pantalla y de estado. Sin `?demo` no se muestra. Para quitarla: borrar `componentes/BarraDemo.jsx`
y su uso en `paginas.jsx`.

## Convivencia con Bootstrap y la plantilla de Vite

- Todo el CSS está en `styles/sustentacion.css` y **cuelga de `.h6`** (lo agrega `paginas.jsx`): no pisa a otras
  historias ni es pisado por ellas. Los colores del PDF son variables dentro de `.h6`, no en `:root`.
- Las clases propias están en español (`boton`, `navegacion`, `dialogo`…) para **no chocar con `.btn`, `.nav` ni
  `.modal` de Bootstrap**. La historia no necesita Bootstrap; si se importa en `main.jsx`, convive sin problemas.
- Una regla `#root:has(.h6)` anula el ancho de 1126 px de la plantilla de Vite solo mientras hay una pantalla
  de esta historia. Cuando el grupo reemplace `index.css`, se puede borrar.
- Las tipografías (Lora e Inter) se cargan con `@import` en el CSS; sin internet usa las de respaldo.

## Estructura

```
hu6/
  pages/          5 pantallas
  componentes/    layout (cabecera, navegación, pie), ui (botón, alerta, diálogo…), Enlace, BarraDemo
  context/        ProveedorSustentacion · SustentacionContext · useSustentaciones · reductor (estado y acciones)
  data/           sustentacion.js (propios) · externo.js (de OTRAS historias) · sesion.js · mock.js
  utils/          reglas.js (negocio) · fechas.js · selectores.js · personas.js · useIrA.js
  styles/         sustentacion.css
  rutas.js · paginas.jsx · index.js
```

`paginas.jsx`, `Enlace.jsx`, `useIrA.js` y los archivos de `context/` están separados para cumplir la regla
`react-refresh/only-export-components` del ESLint del repo.

## Qué espera esta historia de las demás

Hoy son datos de ejemplo en `data/externo.js` y `data/sesion.js`. **Conviene acordar estos nombres con el grupo.**

| Entidad (UML) | Campos que usa la Historia 6 |
|---|---|
| **Usuario / sesión** | `id`, `nombres`, `apellidos`, `rol`, `cargo` (admin), `codigo` y `carrera` (estudiante), `trabajoCodigo` (trabajo activo del estudiante) |
| **TrabajoFinCarrera** | `codigo`, `titulo`, `estado` (`CONCLUIDO` / `SUSTENTADO`…), `departamento`, `linea`, `asesorId`, `equipo[]` (`id`, `nombres`, `apellidos`, `rol`), `avance` (`aprobados`, `total`) |
| **Docente** | `id`, `titulo` (Dr./Mg./Ing.), `nombres`, `apellidos`, `genero`, `grado` (`DOCTOR`/`MAGISTER`/`INGENIERO`), `departamento`, `cargaJurados` |
| **Periodo / EtapaCronograma** | `codigo` del periodo y del anterior; etapa 5 (Sustentaciones) con `fechaInicio` y `fechaFin` = ventana |
| **DictadoClase** | `docenteId`, `estudianteId`, `periodo`, `curso` (advertencia de conflicto del jurado) |

Lo que **esta historia entrega** a las demás: al registrar el acta, el trabajo pasa a `SUSTENTADO`, la sustentación a
`REALIZADA` y se generan notificaciones (equipo, asesor, Secretaría Académica). Hoy el reductor guarda su propia copia
de los trabajos; con el estado o la API compartida del grupo, esa actualización debe hacerse allí.

## Reglas de negocio (`utils/reglas.js`)

- Solo trabajos Concluidos, dentro de la ventana de sustentaciones.
- Una sala no puede tener dos sustentaciones en el mismo bloque de 60 min.
- Jurado de 3: al menos 1 doctor, 1 del departamento del trabajo, 1 presidente.
- El asesor no puede ser jurado; haber dictado clases al equipo el periodo anterior es solo advertencia.
- Nota final = Σ(nota × peso) redondeada; el acta registrada queda de solo lectura.

## Flujo de demo

1. **Administrador → 6.1**: elige trabajo, fecha, hora, sala y modalidad. 11:00 en A-402 abre el modal de sala ocupada.
2. **6.2**: agrega 3 docentes. El asesor sale "No disponible"; la Dra. Torres muestra advertencia.
3. **6.3**: escribe las 4 notas (la nota final se calcula sola), elige resultado y registra el acta.
4. **Vista de impresión**: acta A4 lista para guardar como PDF (`window.print()`).
5. **Estudiante** (`?demo`): "Sin programar / Programada / Realizada" muestran los tres estados de 6.4.

## UML

`docs/uml/historia-6-sustentacion/historia6_sustentacion.puml` (extensión PlantUML de VS Code, `Alt + D`).
El código del acta es el código del trabajo (TFC-2026-2-012): el acta no tiene código propio.

## Integración con el Layout del grupo

La rama `Layout` del repo trae `src/components/Layout.jsx` (cabecera + navegación + `<Outlet />`) y activa Bootstrap global.
Para usarlo con la Historia 6: poner `USAR_LAYOUT_PROPIO = false` en `config.js` y registrar `RUTAS_SUSTENTACION`
dentro de `<Route element={<Layout />}>`. Así las pantallas solo dibujan su contenido.

## Cómo registrar la Historia 6 en el App del grupo

`src/App.jsx` queda igual que en `main`; esta feature no lo modifica. Quien arme el App con rutas solo agrega:

```jsx
import { ProveedorSustentacion, rutasSustentacion } from "./hu6";

<ProveedorSustentacion>
  <Routes>
    {/* rutas de las otras historias */}
    {rutasSustentacion}
  </Routes>
</ProveedorSustentacion>
```

Para probar solo esta historia: en `src/main.jsx` usar temporalmente `import App from './hu6/AppLocal.jsx'`
(y devolverlo a `./App.jsx` antes de hacer commit). Abrir `/sustentaciones/programar?demo`.
