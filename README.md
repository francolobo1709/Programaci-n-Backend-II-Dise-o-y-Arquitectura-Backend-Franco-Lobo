# Events API - Sistema de Gestión de Eventos

Sistema Backend para Eventos. API REST construida con **Node.js + Express**, persistencia en **MongoDB Atlas** con Mongoose y arquitectura en capas.

> **Entrega Final** — CRUD completo de eventos, relaciones con populate, filtros, paginación, ordenamiento, validaciones con Zod y comunicación en tiempo real.

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
🚀 Events API corriendo en modo: development
📡 Servidor escuchando en http://localhost:8080
⚠️  MongoDB no disponible. /api/messages no funcionará.
```

Salida esperada (con MongoDB):

```
✅ MongoDB conectado correctamente.
🚀 Events API corriendo en modo: development
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
| **Controller** | Solo coordina request/response. Llama al Service y aplica los DTOs.            |
| **Service**    | Lógica de negocio (cupos, estados, etc.). Nunca importa modelos.               |
| **Repository** | Métodos orientados al dominio (ej: findPublishedEvents). Usa DAOs.             |
| **DAO**        | Único lugar donde se importan modelos Mongoose directamente. Acceso a DB.      |
| **DTO**        | Filtra y da formato a las respuestas (oculta contraseñas y datos sensibles).   |

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

---

## Casos a Probar y Evidencias (Rúbrica - Pre-entrega 6)

A continuación se detallan las instrucciones para verificar cada caso de uso exigido por la rúbrica, asegurando que la lógica de negocio y permisos funcionan correctamente. Todas las peticiones asumen que estás autenticado y enviando la cookie JWT.

### 1. Crear evento con rol `user` → 403 Forbidden
- **Endpoint:** `POST /api/events`
- **Condición:** Autenticado con una cuenta cuyo rol sea `user`.
- **Cuerpo:** JSON con datos válidos.
- **Evidencia:** El servidor rechaza la petición por la protección del middleware `authorize(['organizer', 'admin'])`.

### 2. Crear evento con fecha pasada → Error de validación (400)
- **Endpoint:** `POST /api/events`
- **Condición:** Autenticado como `organizer` o `admin`.
- **Cuerpo:** `"date": "2020-01-01T10:00:00"`
- **Evidencia:** El servicio rechaza la creación mediante `ValidationError('No se puede crear un evento en una fecha pasada')`.

### 3. Crear evento con capacity: 0 → Error de validación (400)
- **Endpoint:** `POST /api/events`
- **Condición:** Autenticado como `organizer` o `admin`.
- **Cuerpo:** `"capacity": 0`
- **Evidencia:** Mongoose / Service rechazan la solicitud (`'La capacidad debe ser mayor a 0'`).

### 4. Organizer modifica evento propio → Éxito (200)
- **Endpoint:** `PUT /api/events/:id`
- **Condición:** Autenticado como el `organizer` que creó el evento.
- **Cuerpo:** `{"price": 1500}`
- **Evidencia:** El evento se actualiza correctamente y devuelve los nuevos datos.

### 5. Organizer modifica evento ajeno → 403 Forbidden
- **Endpoint:** `PUT /api/events/:id`
- **Condición:** Autenticado como un `organizer` que **no** es dueño del evento.
- **Evidencia:** Falla la validación `event.organizer._id !== user._id` en el servicio y retorna: `No tienes permiso para modificar este evento`.

### 6. Admin modifica evento de otro organizador → Éxito (200)
- **Endpoint:** `PUT /api/events/:id`
- **Condición:** Autenticado como `admin`.
- **Cuerpo:** `{"title": "Título Modificado por Admin"}`
- **Evidencia:** La condición `user.role === 'admin'` permite saltar la restricción de dueño y actualiza la entidad.

### 7. Cambiar estado de evento cancelado → Error (400)
- **Endpoint:** `PATCH /api/events/:id/status`
- **Condición:** Evento previamente actualizado a `status: "cancelled"`.
- **Cuerpo:** `{"status": "published"}`
- **Evidencia:** El servicio bloquea el cambio y responde: `No se puede cambiar el estado de un evento cancelado`.

### 8. Listar con filtros combinados
- **Endpoint:** `GET /api/events?status=published&category=workshop&page=2&limit=5`
- **Evidencia:** La API extrae correctamente el status y la categoría, aplica paginación con `mongoose-paginate-v2` y retorna la metadata (`page`, `limit`, `total`, `totalPages`) junto al array `data`.

### 9. Consultar evento inexistente → 404 Not Found
- **Endpoint:** `GET /api/events/65d1a123f1234567890abcde` (ID válido pero inexistente).
- **Evidencia:** El repositorio devuelve null y el servicio dispara `NotFoundError`, resultando en un 404 con mensaje `Evento no encontrado`.

---

### Tickets (Inscripciones) — `/api/tickets` y `/api/events/:id/tickets`

Gestión de inscripciones a eventos, incluyendo control de cupos y notificaciones por email.

| Método   | Ruta                              | Acceso                        | Descripción                               |
|----------|-----------------------------------|-------------------------------|-------------------------------------------|
| `POST`   | `/api/events/:id/tickets`         | Autenticado (`user`, etc.)    | Inscribirse a un evento                   |
| `GET`    | `/api/tickets/my-tickets`         | Autenticado                   | Ver mis tickets activos e historial       |
| `GET`    | `/api/events/:id/tickets`         | `organizer` (dueño) o `admin` | Ver los inscriptos de un evento           |
| `PATCH`  | `/api/tickets/:tid/cancel`        | Dueño del ticket o `admin`    | Cancelar una inscripción                  |

#### Modelo y Estados del Ticket

- **Estados (`status`):** `confirmed`, `pending`, `cancelled`.
- **Campos principales:** Referencia a usuario, referencia a evento, cantidad (`quantity`), código único de reserva y fecha de cancelación (`cancelledAt`). 
- **Estructura limpia:** El ticket almacena referncias (ObjectIds) y no duplica los objetos embebidos. Los datos se resuelven con `populate` en las consultas.

#### Flujo de Inscripción y Reglas de Cupos (Business Logic)

1. **Validaciones Previas:** El evento debe existir, estar en estado `published` y no encontrarse finalizado ni cancelado.
2. **Duplicados:** Solo se permite un ticket activo por usuario y evento.
3. **Control de Cupos:** El sistema verifica en tiempo real la sumatoria de `quantity` de los tickets activos (`status !== 'cancelled'`). Si hay suficiente `capacity`, se permite la inscripción.
4. **Reserva y Correo:** Al crearse el ticket con éxito, genera un `reservationCode` y dispara asincrónicamente un correo electrónico de confirmación usando Nodemailer a la dirección del usuario autenticado.

#### Cancelación

Al cancelar un ticket (`PATCH /cancel`):
- El estado pasa a `cancelled` y se registra la fecha en `cancelledAt`.
- **Físicamente NO se elimina** el registro de la base de datos (soft-delete lógico).
- Automáticamente, la capacidad (`quantity`) de ese ticket deja de contar contra el `capacity` del evento, liberando el cupo de forma inmediata para otras personas.

#### Variables de Entorno de Email (Nodemailer)

Para que el envío de confirmaciones funcione, es requisito configurar las variables `MAIL_*` en el archivo `.env`:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=tu_password_de_aplicacion
MAIL_FROM="API Eventos" <no-reply@eventos.com>
```
