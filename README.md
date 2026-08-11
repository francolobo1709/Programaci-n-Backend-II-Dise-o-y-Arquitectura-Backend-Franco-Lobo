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
#   P r o g r a m a c i - n - B a c k e n d - I I - D i s e - o - y - A r q u i t e c t u r a - B a c k e n d - F r a n c o - L o b o  
 