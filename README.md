# CleanMatch - API de Servicios y Reservas

> **Nota:** Este proyecto es la continuación del proyecto ya utilizado en Backend I.

Sistema Backend de Turnos y Reservas. API REST construida con **Node.js + Express**, persistencia en **MongoDB Atlas** con Mongoose y arquitectura en capas.

> **Entrega Final** — CRUD completo de servicios y reservas, relaciones con populate, filtros, paginación, ordenamiento, validaciones con Zod, vistas con Handlebars y comunicación en tiempo real con Socket.io.

## Requisitos

- Node.js v18 o superior
- npm

## Instalación

```bash
git clone <url-del-repositorio>
cd <carpeta>
npm install
```

## Variables de entorno

Copiá el archivo `.env.example` como `.env` y completá los valores:

```bash
cp .env.example .env
```

| Variable    | Descripción                       | Requerida | Ejemplo                         |
|-------------|-----------------------------------|-----------|---------------------------------|
| `PORT`      | Puerto del servidor               | ✅        | `8080`                          |
| `NODE_ENV`  | Entorno de ejecución              | ✅        | `development`                   |
| `MONGO_URI` | URI de conexión a MongoDB Atlas   | ✅ | `mongodb+srv://...` |
| `JWT_SECRET`| Secreto para firmar tokens JWT    | ✅ | `super_secret_key`              |

## Ejecución

```bash
npm start      # producción
npm run dev    # desarrollo con watch
```

Salida esperada (sin MongoDB):

```
🚀 CleanMatch corriendo en modo: development
📡 Servidor escuchando en http://localhost:8080
⚠️  MongoDB no disponible. /api/messages no funcionará.
```

Salida esperada (con MongoDB):

```
✅ MongoDB conectado correctamente.
🚀 CleanMatch corriendo en modo: development
📡 Servidor escuchando en http://localhost:8080
```

---

## Arquitectura en capas

El proyecto implementa una arquitectura en capas donde cada una tiene una responsabilidad única.

### Estructura del proyecto

```
src/
├── config/
│   ├── env.config.js       → Variables de entorno (PORT, NODE_ENV, MONGO_URI)
│   └── socket.js           → Configuración de Socket.io
├── database/
│   └── connection.js       → Conexión a MongoDB Atlas (todos los módulos)
├── controllers/
│   ├── services.controller.js
│   ├── bookings.controller.js
│   ├── messages.controller.js
│   └── views.controller.js
├── services/
│   ├── services.service.js
│   ├── bookings.service.js
│   └── message.service.js
├── repositories/
│   ├── services.repository.js
│   ├── bookings.repository.js
│   └── message.repository.js
├── dao/
│   ├── services.dao.js     → Opera contra MongoDB (ServiceModel)
│   ├── bookings.dao.js     → Opera contra MongoDB (BookingModel)
│   └── message.dao.js      → Opera contra MongoDB (MessageModel)
├── routes/
│   ├── services.router.js
│   ├── bookings.router.js
│   ├── messages.router.js
│   └── views.router.js
├── middlewares/
│   ├── errorHandler.js     → Manejador centralizado de errores
│   ├── validate.js         → Validación con Zod
│   ├── parseId.js          → Validación de ID en params
│   └── requireMongo.js     → Guard 503 si MongoDB no está disponible
├── validators/
│   ├── service.validators.js
│   └── booking.validators.js
├── models/
│   ├── Service.model.js    → Mongoose schema para servicios
│   ├── Booking.model.js    → Mongoose schema para reservas (ref a Service)
│   └── message.model.js    → Mongoose schema para mensajes (ref a Booking)
└── errors/
    └── AppError.js         → AppError, ValidationError, NotFoundError
```

### Flujo de una petición

```
Request
  └─→ Router          → define el endpoint, aplica middlewares
        └─→ validate  → Zod (400 si falla)
              └─→ Controller   → lee req, llama service, responde con res
                    └─→ Service      → reglas de negocio (sin req/res)
                          └─→ Repository   → acceso a datos, sin lógica
                                └─→ DAO         → accede a MongoDB vía Mongoose
```

### Responsabilidades por capa

| Capa           | Responsabilidad                                                                 |
|----------------|---------------------------------------------------------------------------------|
| **Router**     | Define endpoints y aplica middlewares de validación. Sin lógica de negocio.    |
| **Controller** | Lee `req`, llama al service y responde con `res`. Sin lógica de negocio.       |
| **Service**    | Concentra las reglas de negocio. No conoce `req`, `res` ni la fuente de datos. |
| **Repository** | Ofrece métodos de acceso a datos, valida IDs y lanza errores tipados.          |
| **DAO**        | Única capa que accede directamente a MongoDB vía Mongoose.                     |

### Regla de negocio clave — bookings

Al agregar un servicio a una reserva (`POST /api/bookings/:bid/services/:sid`), si el mismo servicio ya existe se **incrementa `quantity`** en vez de duplicarlo. Esta lógica vive exclusivamente en `bookings.service.js`.

---

## Endpoints

### Services — `/api/services`

| Método   | Ruta                  | Descripción                                          |
|----------|-----------------------|------------------------------------------------------|
| `GET`    | `/api/services`       | Listar servicios (filtros, paginación y ordenamiento)|
| `GET`    | `/api/services/:sid`  | Obtener servicio por ID                              |
| `POST`   | `/api/services`       | Crear un servicio                                    |
| `PUT`    | `/api/services/:sid`  | Actualizar un servicio                               |
| `DELETE` | `/api/services/:sid`  | Eliminar un servicio                                 |

#### Filtros y paginación — `GET /api/services`

| Query param | Tipo    | Default      | Ejemplo               |
|-------------|---------|-------------- |-----------------------|
| `category`  | string  | —            | `?category=limpieza`  |
| `available` | boolean | —            | `?available=true`     |
| `page`      | number  | `1`          | `?page=2`             |
| `limit`     | number  | `10` (máx 100)| `?limit=5`           |
| `sortBy`    | string  | `createdAt`  | `?sortBy=price`       |
| `order`     | string  | `asc`        | `?order=desc`         |

**Respuesta:**
```json
{
  "data": [{ "_id": "...", "name": "Limpieza", "price": 3500, "category": "limpieza", "available": true }],
  "pagination": { "total": 12, "page": 1, "limit": 5, "totalPages": 3, "hasPrevPage": false, "hasNextPage": true }
}
```

#### Body `POST /api/services` (todos los campos requeridos)

```json
{
  "name": "Limpieza del hogar",
  "description": "Limpieza completa del hogar",
  "duration": 120,
  "price": 5000,
  "category": "limpieza",
  "available": true
}
```

---

### Bookings — `/api/bookings`

| Método   | Ruta                                | Descripción                               |
|----------|-------------------------------------|-------------------------------------------|
| `GET`    | `/api/bookings`                     | Listar todas las reservas                 |
| `GET`    | `/api/bookings/:bid`                | Obtener reserva por ID                    |
| `POST`   | `/api/bookings`                     | Crear una reserva                         |
| `PUT`    | `/api/bookings/:bid`                | Actualizar una reserva                    |
| `DELETE` | `/api/bookings/:bid`                | Eliminar una reserva                      |
| `POST`   | `/api/bookings/:bid/services/:sid`  | Agregar servicio a la reserva             |

#### Body `POST /api/bookings`

```json
{
  "clientName": "Juan Pérez",
  "clientEmail": "juan@mail.com",
  "date": "2026-07-15T10:00:00"
}
```

#### Body `POST /api/bookings/:bid/services/:sid`

```json
{ "quantity": 2 }
```

> `quantity` es opcional (default `1`). Si el servicio ya existe en la reserva, se incrementa su cantidad.

---

### Messages — `/api/messages` *(requiere MongoDB)*

| Método   | Ruta                         | Descripción                       |
|----------|------------------------------|-----------------------------------|
| `GET`    | `/api/messages`              | Listar todos los mensajes         |
| `GET`    | `/api/messages/:mid`         | Obtener mensaje por ID            |
| `GET`    | `/api/messages/booking/:bid` | Mensajes de una reserva           |
| `POST`   | `/api/messages`              | Crear un mensaje                  |
| `DELETE` | `/api/messages/:mid`         | Eliminar un mensaje               |

> Si `MONGO_URI` no está configurada o la conexión falla, estos endpoints devuelven `503`.

---

## Validaciones con Zod

Las validaciones se aplican como middlewares en la capa de rutas antes de llegar al controller. Si los datos no son válidos, se devuelve `400`.

```json
{
  "error": "Datos inválidos.",
  "details": "price: price debe ser mayor a 0 | available: available debe ser true o false."
}
```

---

### Autorización y Roles (Pre-entrega 5)

El sistema cuenta con autorización basada en roles (RBAC). 

**Roles Disponibles:**
- `user`: Cliente estándar. Solo puede consultar servicios.
- `organizer`: Proveedor de servicios. Puede crear servicios y modificar/eliminar únicamente aquellos que haya creado.
- `admin`: Administrador de la plataforma. Puede modificar o eliminar cualquier servicio y visualizar la lista de usuarios.

**Matriz de Permisos (`/api/services`):**

| Acción | `user` | `organizer` | `admin` |
|--------|--------|-------------|---------|
| Consultar servicios publicados | ✅ | ✅ | ✅ |
| Crear servicios (`POST /`) | ❌ | ✅ | ✅ |
| Modificar/cancelar servicios propios (`PUT/DELETE /:sid`) | ❌ | ✅ | ✅ |
| Modificar cualquier servicio ajeno | ❌ | ❌ | ✅ |

**Rutas Protegidas:**
- `GET /api/sessions/current`: Solo usuarios autenticados (cualquier rol). Devuelve `401` si no hay sesión.
- `GET /api/sessions/users`: Ruta administrativa. Solo `admin`. Devuelve `403` si otro rol intenta acceder.
- `POST /api/services`: Solo `organizer` o `admin`.
- `PUT /api/services/:sid`: Solo el `organizer` dueño del servicio o un `admin`.
- `DELETE /api/services/:sid`: Solo el `organizer` dueño del servicio o un `admin`.

**Diferencia entre Códigos de Error HTTP:**
- **401 Unauthorized:** Ocurre cuando el usuario **no está autenticado** (no hay sesión activa, o el token JWT es inválido o no se proporcionó).
- **403 Forbidden:** Ocurre cuando el usuario está autenticado correctamente, pero **no tiene los permisos suficientes** (su rol no le permite realizar la acción solicitada, o está intentando modificar un recurso que no le pertenece).

---

### Sessions — `/api/sessions` (Autenticación con Passport.js)

El sistema de autenticación está centralizado utilizando **Passport.js**, lo que permite una validación robusta y deja la aplicación preparada para sumar proveedores externos (Google, GitHub, etc.) sin modificar el archivo principal `app.js`.

**Estrategias Implementadas:**
- **`register` (LocalStrategy):** Valida datos, verifica que el email sea único, hashea la contraseña y asigna el rol `user` por defecto.
- **`login` (LocalStrategy):** Verifica credenciales comparando la contraseña con bcrypt. Si es exitoso, delega al controlador la generación del JWT.
- **`current` (JWTStrategy):** Extrae el token JWT desde la cookie `currentUser` (HttpOnly), lo valida y devuelve los datos seguros del usuario autenticado.

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/sessions/register` | Registro seguro de usuarios (Passport `register`) |
| `POST` | `/api/sessions/login`    | Login e inicio de sesión (Passport `login`, devuelve cookie JWT `currentUser`) |
| `GET`  | `/api/sessions/current`  | Obtiene datos del usuario logueado (Passport `current`) |
| `POST` | `/api/sessions/logout`   | Cierra la sesión (Limpia la cookie `currentUser`) |

#### Body `POST /api/sessions/register`

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com",
  "password": "Secreta123"
}
```

**Respuesta 201 (Éxito):**
```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

**Respuesta 400 (Faltan campos o son inválidos):**
```json
{
  "status": "error",
  "message": "Faltan campos obligatorios"
}
```

**Respuesta 409 (Email ya registrado):**
```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

---

### Events — `/api/events`

Entidad principal para la gestión de eventos.

| Método   | Ruta                        | Acceso                 | Descripción                               |
|----------|-----------------------------|------------------------|-------------------------------------------|
| `GET`    | `/api/events`               | Público                | Listar eventos (filtros, paginación)      |
| `GET`    | `/api/events/:id`           | Público                | Obtener evento por ID                     |
| `POST`   | `/api/events`               | `organizer`, `admin`   | Crear un evento                           |
| `PUT`    | `/api/events/:id`           | Dueño o `admin`        | Actualizar un evento                      |
| `PATCH`  | `/api/events/:id/status`    | Dueño o `admin`        | Cambiar estado de un evento               |

#### Reglas de Negocio (Events)

- No se permiten fechas pasadas al crear o actualizar un evento.
- La capacidad debe ser mayor a `0` y el precio mayor o igual a `0`.
- El campo `organizer` se asigna automáticamente mediante el token JWT.
- Los organizadores solo pueden modificar o cambiar el estado de sus propios eventos (los admins pueden modificar cualquiera).
- Un evento en estado `cancelled` **no** puede ser modificado.
- Un evento en estado `finished` o `cancelled` **no** puede ser publicado nuevamente.

#### Filtros y Paginación — `GET /api/events`

| Query param | Descripción                                  | Ejemplo                              |
|-------------|----------------------------------------------|--------------------------------------|
| `status`    | Filtrar por estado (`draft`, `published`...) | `?status=published`                  |
| `category`  | Filtrar por categoría                        | `?category=workshop`                 |
| `location`  | Filtrar por ubicación (parcial)              | `?location=Buenos`                   |
| `dateFrom`  | Filtrar eventos desde una fecha              | `?dateFrom=2024-01-01`               |
| `dateTo`    | Filtrar eventos hasta una fecha              | `?dateTo=2024-12-31`                 |
| `page`      | Número de página (default: 1)                | `?page=2`                            |
| `limit`     | Cantidad por página (default: 10)            | `?limit=5`                           |
| `sort`      | Campo para ordenar                           | `?sort=date`                         |

**Ejemplo de Petición:** `GET /api/events?status=published&category=workshop&page=2&limit=5`


