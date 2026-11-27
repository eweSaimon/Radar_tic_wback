# Radar TIC — Evolución Full-Stack (Actividad de Seguimiento 3)

Radar TIC pasa de ser un Front-End que lee datos locales a una aplicación **Full-Stack**: Angular consume una **API REST** construida con **Node.js + Express**, y el usuario puede **registrar su interés** en una oportunidad.

```
radar-tic/
├── backend/    → Node.js + Express (puerto 3000)
└── frontend/   → Angular (puerto 4200)
```

## Cómo ejecutarlo

**Requisitos de Node.js**

| Parte | Versión mínima |
|---|---|
| `backend/` (Express) | Node.js 18 o superior |
| `frontend/` (Angular 22) | Node.js 22.22.3 o superior (o 24.15+) |

> El código del Front-End usa componentes *standalone*, `inject()`, signals y el control de flujo `@if` / `@for`, por lo que sus piezas (services, modelos, componentes) también se pueden llevar a un proyecto Angular 17 o superior, como el de la Actividad 2.

Abre **dos terminales**:

```bash
# Terminal 1 — Back-End
cd backend
npm install
npm start            # http://localhost:3000

# Terminal 2 — Front-End
cd frontend
npm install
npm start            # http://localhost:4200
```

Pruebas automáticas:

```bash
cd backend  && npm test           # 16 pruebas de la API
cd frontend && npm run test:ci    # 15 pruebas de Services y componentes
```

> 📄 La explicación de los cambios y las evidencias con capturas están en **[docs/INFORME_ENTREGA.md](docs/INFORME_ENTREGA.md)**.

## Arquitectura: ANTES y AHORA

**ANTES (Actividad 2)**

```
Angular → datos locales (JSON)
```

**AHORA (Actividad 3)**

```
Angular → Services → HttpClient → API REST → Node.js + Express
```

| Aspecto | Actividad 2 | Actividad 3 |
|---|---|---|
| Origen de los datos | Archivo JSON local dentro de Angular | Servidor Express (`GET /api/oportunidades`) |
| Comunicación | Importación/lectura local | HTTP mediante `HttpClient` dentro de Services |
| Escritura | No existía | `POST /api/intereses` |
| Validación | Solo en el Front-End | Autoridad final en el Back-End (códigos 400/404/409) |
| Procesos | 1 (Angular, puerto 4200) | 2 independientes (Angular :4200, Express :3000) |
| Seguridad entre orígenes | No aplica | CORS configurado en Express para `http://localhost:4200` |

### Cambios realizados

**Back-End (nuevo, `backend/`)**
- `src/app.js`: rutas, validaciones, CORS y manejo de errores en JSON. `src/server.js` solo arranca el servidor.
- `src/data/oportunidades.json`: la colección que antes vivía en Angular ahora la sirve el servidor.
- Los intereses se guardan **en memoria** (sin base de datos ni persistencia, según el alcance).

**Front-End (`frontend/src/app/`)**
- `services/oportunidades.service.ts` y `services/intereses.service.ts`: únicos puntos de contacto con la API vía `HttpClient`.
- `services/api.config.ts`: URL base de la API.
- `services/error-http.ts`: convierte el error HTTP en el mensaje JSON enviado por el servidor.
- `app.config.ts`: se añade `provideHttpClient()`.
- `pages/oportunidades-list`: lista las oportunidades con `GET /api/oportunidades` (estados de carga, error y reintento).
- `pages/oportunidad-detalle`: consulta `GET /api/oportunidades/:id` y contiene el formulario que envía `POST /api/intereses`, mostrando el éxito o el error devuelto por el servidor.
- Se **eliminó** la dependencia del JSON local para obtener la colección principal.

## API REST

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/oportunidades` | Colección completa | `200` |
| GET | `/api/oportunidades/:id` | Una oportunidad | `200`, `404` si no existe |
| POST | `/api/intereses` | Registrar interés | `201`, `400`, `404`, `409` |

**Cuerpo de `POST /api/intereses`**

```json
{ "nombre": "Laura Gómez", "correo": "laura@email.com", "oportunidadId": 3 }
```

**Validaciones del servidor**

| Condición | Código | Ejemplo de respuesta |
|---|---|---|
| Falta `nombre`, `correo` u `oportunidadId` | `400` | `{"error":"Faltan campos obligatorios: correo, oportunidadId.","camposFaltantes":[...]}` |
| Correo con formato inválido (extra) | `400` | `{"error":"El correo electrónico no tiene un formato válido."}` |
| JSON mal formado (extra) | `400` | `{"error":"El cuerpo de la solicitud no es un JSON válido."}` |
| `oportunidadId` no es un entero (p. ej. `true`, `[3]`, `"3abc"`) | `400` | `{"error":"oportunidadId debe ser un número entero."}` |
| `nombre` > 100 o `correo` > 254 caracteres | `400` | `{"error":"El nombre no puede superar 100 caracteres."}` |
| La oportunidad no existe | `404` | `{"error":"La oportunidad con id 999 no existe."}` |
| La oportunidad no está disponible | `409` | `{"error":"La oportunidad \"Reto de Ciberseguridad para Pymes\" ya no se encuentra disponible."}` |

Las oportunidades **4** y **6** están marcadas como `disponible: false` para poder probar el rechazo `409`.

## Evidencia

Las capturas de pantalla, el registro de solicitudes HTTP Angular → Express y la tabla de pruebas mínimas están en **[docs/INFORME_ENTREGA.md](docs/INFORME_ENTREGA.md)** (imágenes en `docs/evidencias/`).

Esas capturas se generaron con una prueba automática en Chromium sobre la aplicación real. Si tu docente pide capturas propias de **DevTools → Network**, el recorrido es: abrir `http://localhost:4200`, filtrar *Fetch/XHR*, entrar al detalle de la oportunidad 3 y enviar el formulario (`201`), y repetirlo en la oportunidad 4 (`409`).

## Enlace al repositorio

`<pega aquí el enlace a tu repositorio>`
