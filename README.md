# Events API - Sistema de Gestión de Eventos & Inscripciones

API REST profesional para la gestión integral de eventos, venta e inscripción de tickets, servicios para eventos y mensajería en tiempo real. Construida con **Node.js, Express, MongoDB Atlas y Mongoose** bajo una **arquitectura en capas desacoplada (DAO, Repository, DTO)**, documentada con **Swagger OpenAPI 3.0**, probada con **Jest & Supertest**, dockerizada y con integración continua mediante **GitHub Actions**.

---

## 🏛️ Arquitectura del Sistema

El sistema implementa una arquitectura en capas estrictamente desacoplada que garantiza el principio de responsabilidad única (*Single Responsibility Principle*):

```mermaid
flowchart TD
    Client(["Cliente / Postman / Swagger UI"]) --> Router["Capas de Rutas (Express Router)"]
    Router --> Middlewares["Middlewares (Auth JWT, RBAC, Validaciones Zod)"]
    Middlewares --> Controller["Controladores (HTTP Adapter)"]
    
    subgraph DTO_Layer ["Capa DTO (Data Transfer Object)"]
        InputDTO["Input DTO (Sanitización y normalización de entrada)"]
        ResponseDTO["Response DTO (Filtrado de datos sensibles y formateo)"]
    end

    Controller --> InputDTO
    InputDTO --> Service["Servicios (Lógica de Negocio y Reglas de Dominio)"]
    Service --> Repository["Repositorios (Abstracción del Dominio / Acceso a Datos)"]
    Repository --> DAO["DAOs (Data Access Object - Persistencia pura)"]
    DAO --> DB[(MongoDB Atlas / Base de Datos)]
    
    Service -.-> ResponseDTO
    ResponseDTO -.-> Controller
    Controller --> Response(["Respuesta HTTP Estandarizada"])
```

### Separación de Responsabilidades: DAO vs. Repository vs. DTO

| Capa | Responsabilidad | Lo que HACE | Lo que NUNCA debe hacer |
| :--- | :--- | :--- | :--- |
| **DAO** *(Data Access Object)* | Persistencia | Interactúa exclusivamente con los modelos de Mongoose (`Model.create`, `Model.find`, `aggregate`). Realiza operaciones CRUD primitivas. | No contiene reglas de negocio ni lógica de autorización. |
| **Repository** | Abstracción de Datos | Conecta la capa de Servicios con los DAOs. Provee métodos orientados a la necesidad del dominio y aísla al sistema del motor de base de datos concreto. | No interactúa con peticiones HTTP (`req`, `res`) ni valida tokens. |
| **DTO** *(Data Transfer Object)* | Modelado y Seguridad | **Input DTO**: Recibe y sanitiza los campos permitidos del cliente.<br>**Response DTO**: Oculta atributos sensibles (passwords, `__v`), estandariza identificadores (`id` en lugar de `_id`) y estructura objetos embebidos. | No realiza consultas a base de datos ni aplica reglas de negocio. |
| **Service** | Reglas de Negocio | Aplica validaciones de fechas, control de cupos en tiempo real, transiciones de estado de eventos, disparador de correos con Nodemailer y eventos de WebSocket. | No interactúa con objetos HTTP `req`/`res` ni importa esquemas de Mongoose directamente. |
| **Controller** | Adaptador HTTP | Recibe `req`, extrae parámetros/cuerpo, invoca el Service correspondiente y responde utilizando el DTO de salida con el status HTTP adecuado. | No contiene lógica de negocio pesada ni queries de base de datos. |

---

## 📁 Estructura del Proyecto

```text
src/
├── app.js                      → Configuración principal de la aplicación Express
├── server.js                   → Entrada del servidor y levantamiento de Socket.io
├── config/
│   ├── env.config.js           → Variables de entorno centralizadas y tipadas
│   ├── passport.config.js      → Estrategias de Passport (Local register/login y JWT)
│   ├── socket.js               → Configuración del servidor Socket.io
│   └── swagger.config.js       → Configuración de OpenAPI 3.0 / Swagger JSDoc
├── database/
│   └── connection.js           → Conexión a MongoDB Atlas
├── controllers/                → Adaptadores HTTP (req, res, next)
│   ├── events.controller.js
│   ├── sessions.controller.js
│   ├── tickets.controller.js
│   ├── services.controller.js
│   ├── bookings.controller.js
│   ├── messages.controller.js
│   └── views.controller.js
├── services/                   → Lógica de negocio y reglas de dominio
│   ├── events.service.js
│   ├── users.service.js
│   ├── tickets.service.js
│   ├── services.service.js
│   ├── bookings.service.js
│   └── message.service.js
├── repositories/               → Capa de abstracción de acceso a datos
│   ├── events.repository.js
│   ├── users.repository.js
│   ├── tickets.repository.js
│   ├── services.repository.js
│   ├── bookings.repository.js
│   ├── message.repository.js
│   └── repository.utils.js
├── dao/                        → Objetos de acceso directo a persistencia (Mongoose)
│   ├── events.dao.js
│   ├── users.dao.js
│   ├── ticket.dao.js
│   ├── services.dao.js
│   ├── bookings.dao.js
│   └── message.dao.js
├── dtos/                       → Data Transfer Objects (Entrada y Salida)
│   ├── event.dto.js
│   ├── user.dto.js
│   ├── ticket.dto.js
│   ├── service.dto.js
│   ├── booking.dto.js
│   └── message.dto.js
├── models/                     → Esquemas Mongoose (MongoDB)
│   ├── Event.model.js
│   ├── User.model.js
│   ├── ticket.model.js
│   ├── Service.model.js
│   ├── Booking.model.js
│   └── message.model.js
├── routes/                     → Definición de endpoints y asociación de middlewares
│   ├── events.router.js
│   ├── sessions.router.js
│   ├── tickets.router.js
│   ├── services.router.js
│   ├── bookings.router.js
│   ├── messages.router.js
│   └── views.router.js
├── middlewares/                → Middlewares transversales
│   ├── errorHandler.js         → Manejo centralizado y uniforme de excepciones
│   ├── auth.middleware.js      → Verificación de sesión vía JWT (cookie)
│   ├── authorize.middleware.js → Control de acceso basado en roles (RBAC)
│   ├── validate.js             → Validación de esquema en tiempo de ejecución (Zod)
│   ├── parseId.js              → Sanitización de identificadores
│   └── requireMongo.js         → Guard de disponibilidad de MongoDB (503)
├── docs/                       → Documentación OpenAPI / Swagger por módulo
│   ├── events.yaml
│   ├── sessions.yaml
│   ├── tickets.yaml
│   ├── services.yaml
│   ├── bookings.yaml
│   └── messages.yaml
├── errors/
│   └── AppError.js             → Jerarquía de excepciones tipadas (ValidationError, NotFoundError, etc.)
├── utils/
│   ├── logger.js               → Logger profesional Winston (Consola y archivo errors.log)
│   ├── mailer.js               → Cliente de correos asíncrono con Nodemailer
│   └── jwt.utils.js            → Utilidades de firma y verificación de tokens
└── test/                       → Batería de pruebas automatizadas aisladas (24 tests)
    ├── tickets.test.js         → Inscripciones, tickets, control de cupos y cancelación
    ├── events.test.js          → CRUD de eventos y health check endpoint
    ├── sessions.test.js        → Registro, login, current y logout con JWT
    ├── bookings.test.js        → Reservas y validaciones con Zod
    └── services.test.js        → Servicios, filtros y paginación
```

---

## ⚙️ Requisitos Previos

- **Node.js**: Versión 18.x o superior.
- **npm**: Versión 9.x o superior.
- **MongoDB**: Instancia local o conexión a MongoDB Atlas.
- *(Opcional)* **Docker y Docker Compose**: Para ejecución contenerizada.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone <url-del-repositorio>
cd "Programación Backend II Diseño y Arquitectura Backend"
npm install
```

### 2. Configurar variables de entorno

Copiá el archivo `.env.example` creando tu propio `.env`:

```bash
# En Bash / Linux / macOS:
cp .env.example .env

# En Windows PowerShell:
copy .env.example .env
```

| Variable | Descripción | Requerida | Valor de Ejemplo |
| :--- | :--- | :---: | :--- |
| `PORT` | Puerto en el que escucha el servidor Express | ✅ | `8080` |
| `NODE_ENV` | Entorno de ejecución (`development`, `production`, `test`) | ✅ | `development` |
| `MONGO_URL` | Cadena de conexión URI a MongoDB Atlas o local | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/events_db` |
| `JWT_SECRET` | Clave secreta para firmar y verificar tokens JWT | ✅ | `super_secret_jwt_key_coderhouse` |
| `JWT_EXPIRES_IN` | Tiempo de expiración de la sesión JWT | ❌ | `24h` |
| `MAIL_HOST` | Host del servidor SMTP para notificaciones | ❌ | `smtp.gmail.com` |
| `MAIL_PORT` | Puerto del servidor SMTP | ❌ | `587` |
| `MAIL_USER` | Usuario/cuenta de correo para envío | ❌ | `tu_correo@gmail.com` |
| `MAIL_PASS` | Contraseña de aplicación SMTP | ❌ | `tu_app_password_16_caracteres` |
| `MAIL_FROM` | Remitente visible de las notificaciones | ❌ | `"API Eventos" <no-reply@eventos.com>` |

### 3. Ejecución de la API

```bash
# Modo desarrollo con auto-recarga (Node --watch):
npm run dev

# Modo producción:
npm start
```

---

## 🧪 Ejecución de Pruebas Automatizadas (Tests)

El proyecto cuenta con una suite completa de **24 pruebas automatizadas** unitarias y de integración construida con **Jest** y **Supertest**. Las pruebas se ejecutan de forma **100% aislada e independiente de MongoDB Atlas** mediante `mongodb-memory-server` y con un script ejecutable multiplataforma nativo sin depender de herramientas externas como `cross-env`:

```bash
# Ejecutar todas las pruebas (sin requerir Atlas ni conexión a internet):
npm test
```

### Cobertura de las 5 Suites de Pruebas:
- **`tickets.test.js`**: Flujo completo de tickets: inscripción exitosa de usuario, prevención de registros duplicados (409 Conflict), consulta de historial (`/my-tickets`), **control en tiempo real de agotamiento de cupos** (400 al superar `capacity`), y **cancelación de ticket con liberación inmediata de cupo**.
- **`sessions.test.js`**: Registro exitoso de usuarios con rol `user`, rechazo de correos duplicados, inicio de sesión con generación de cookie `currentUser`, acceso a ruta protegida `/current` y cierre de sesión seguro (`logout`).
- **`events.test.js`**: Listado público paginado de eventos, validación de permisos de organizador para creación (`401`/`403` si no hay token) y verificación del endpoint de salud (`/health`).
- **`services.test.js`**: Paginación y filtrado de servicios, obtención de servicios existentes y validación de `404` ante IDs inexistentes, protección de creación.
- **`bookings.test.js`**: Creación de reservas, validaciones con Zod y control de fechas.

---

## 📖 Documentación Interactiva de Endpoints

### 1. Swagger UI (OpenAPI 3.0)
La API cuenta con documentación interactiva con **todos los endpoints documentados** (Events, Sessions, Tickets, Services, Bookings, Messages).
- Con el servidor en ejecución, ingresá desde el navegador a:
  👉 **http://localhost:8080/api-docs**

### 2. Colección de Postman (Totalmente Automatizada y Ordenada)
En la raíz del repositorio se encuentra el archivo **`postman_collection.json`** listo para importar en Postman o Thunder Client:
1. Abrí Postman y hacé clic en **Import**.
2. Arrastrá el archivo `postman_collection.json`.
3. **Ejecución 100% Automatizada (Postman Runner):**
   - Podés correr la colección completa con el **Runner de Postman** en un solo clic.
   - Las carpetas están estructuradas numéricamente (`01 - Auth`, `02 - Events`, `03 - Tickets`, `04 - Services`, `05 - Bookings`, `06 - Messages`, `07 - Health`).
   - Cada request cuenta con **Tests automáticos (`pm.test`)** y scripts que capturan y propagan automáticamente los tokens JWT (`{{organizerToken}}`, `{{userToken}}`) y los IDs generados (`{{eventId}}`, `{{ticketId}}`, `{{serviceId}}`, `{{bookingId}}`), asegurando que todos los tests compilen y pasen con status `200/201`.
   - Soporta autenticación híbrida transparente: funciona tanto por **Cookie** como mediante el header **`Authorization: Bearer <token>`**.

---

## 🛡️ Manejo Centralizado y Uniforme de Errores

Todas las excepciones del sistema son capturadas por el middleware centralizado `errorHandler.js` garantizando un formato de respuesta **100% uniforme ante cualquier error**:

```json
{
  "status": "error",
  "message": "Descripción clara del problema",
  "details": "Información complementaria o detalle de validación (opcional)"
}
```

### Tipos de Errores Estandarizados:
- **`ValidationError` (400)**: Datos inválidos por Zod, fechas en el pasado, capacidad `<= 0` o identificadores malformados.
- **`UnauthorizedError` (401)**: Falta de token de autenticación o credenciales erróneas.
- **`ForbiddenError` (403)**: El rol del usuario no tiene permisos para el recurso o un organizador intenta modificar el evento de otro.
- **`NotFoundError` (404)**: El recurso solicitado (evento, servicio, reserva, ticket) no existe.
- **`ConflictError` (409)**: Incompatibilidad de estado (ej: usuario ya registrado a ese evento o email existente).
- **`503 Service Unavailable`**: MongoDB no disponible (con guard `requireMongo`).
- **`500 Internal Server Error`**: Excepciones no controladas registradas en el logger sin exponer datos sensibles al cliente.

---

## 👥 Matriz de Roles y Permisos (RBAC)

El sistema soporta 3 roles de usuario:
- **`user`**: Cliente estándar. Puede consultar eventos, inscribirse a eventos (`/tickets`) y consultar sus propios tickets.
- **`organizer`**: Proveedor/Organizador. Puede crear eventos y servicios, modificar y cambiar el estado de sus propios eventos, y consultar la lista de inscriptos a sus eventos.
- **`admin`**: Administrador total. Tiene acceso a modificar cualquier recurso y acceder a `/api/sessions/users`.

### 👤 Usuarios de Prueba Preconfigurados (o cómo crearlos)

Para evaluar inmediatamente todos los roles y flujos sin necesidad de crear usuarios manualmente, el sistema incluye un comando de inicialización (`seed`):

```bash
npm run seed
```

| Rol | Email | Contraseña | Capacidades en la API |
| :--- | :--- | :--- | :--- |
| **`organizer`** | `organizador@events.com` | `password123` | Crear/modificar eventos, publicar eventos, consultar inscriptos a sus eventos, gestionar servicios. |
| **`user`** | `cliente@events.com` | `password123` | Consultar eventos públicos, inscribirse a eventos (`POST /api/events/:eid/tickets`), ver y cancelar tickets. |
| **`admin`** | `admin@events.com` | `admin123` | Acceso global: modificar/cancelar cualquier evento, listar todos los usuarios en `/api/sessions/users`. |

> [!NOTE]
> Por políticas de seguridad y criterio estricto de evaluación, el endpoint público `POST /api/sessions/register` **nunca acepta el campo `role` desde el body** y siempre asigna por defecto el rol `user`. Los roles con privilegios (`organizer`, `admin`) se inicializan mediante el script de seed o directamente en la base de datos.

---

## 🐳 Docker & CI/CD

### Despliegue con Docker Compose
Podés levantar la aplicación completa con MongoDB en un contenedor aislado con un único comando:

```bash
docker compose up -d
```
Para detener los contenedores:
```bash
docker compose down
```

### Integración Continua (GitHub Actions)
El archivo `.github/workflows/ci.yml` ejecuta automáticamente la suite completa de pruebas en contenedores efímeros ante cada `push` o `pull request` hacia las ramas principales.
