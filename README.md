# Veterinaria San Marcos

Aplicación web fullstack para gestionar servicios, mascotas, citas y fichas clínicas de la Veterinaria San Marcos (Rancagua).
DSY1104 Desarrollo Fullstack II, Evaluación Parcial 3, Sección 005.

**Integrantes:** Alan Ojeda y Nayeli Leiva

## Tecnologías

- **Frontend:** React 19, Vite 8, React Router 7, Bootstrap 5, React Leaflet, Vitest + React Testing Library.
- **Backend:** Spring Boot 4.1.2, Java 21, Maven, Spring Security, JWT (jjwt 0.12.6), Spring Data JPA, springdoc-openapi (Swagger).
- **Base de datos:** PostgreSQL.

## Estructura

- `src/`: frontend React (páginas, componentes, servicios que consumen la API, utilidades).
- `backend/`: API REST Spring Boot (controladores, servicios, repositorios, modelos, seguridad).

## Requisitos

- Node.js 20.19 o superior
- Java 21
- Maven
- PostgreSQL

## 1. Base de datos

Crear una base de datos vacía llamada `vetsanmarcos` (por ejemplo, desde pgAdmin).
Las tablas se crean solas al iniciar el backend. También se cargan datos de demostración
(servicios, usuarios, una mascota con su ficha clínica), cada uno solo si su tabla está vacía.

## 2. Variables de entorno del backend

Definirlas en la terminal donde se inicia el backend (ver `backend/.env.example`).
Valen solo para esa terminal: si se cierra, hay que definirlas de nuevo.

| Variable      | Descripción                                           | Por defecto |
| ------------- | ----------------------------------------------------- | ----------- |
| `DB_PASSWORD` | Clave del usuario de PostgreSQL                       | (vacía)     |
| `DB_USERNAME` | Usuario de PostgreSQL                                 | `postgres`  |
| `DB_PORT`     | Puerto de PostgreSQL                                  | `5432`      |
| `JWT_SECRET`  | Secreto para firmar los tokens (mínimo 32 caracteres) | obligatoria |

En PowerShell (Windows):

```powershell
$env:DB_PASSWORD = "tu_clave"
$env:DB_PORT = "5432"
$env:DB_USERNAME = "postgres"
$env:JWT_SECRET = "un-secreto-de-al-menos-32-caracteres"
```

En Linux o macOS:

```bash
export DB_PASSWORD="tu_clave"
export DB_PORT="5432"
export DB_USERNAME="postgres"
export JWT_SECRET="un-secreto-de-al-menos-32-caracteres"
```

## 3. Iniciar el backend

```bash
cd backend
mvn spring-boot:run
```

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

Está listo cuando la consola muestra `Started VetSanMarcosApplication`.

## 4. Iniciar el frontend

En otra terminal, desde la carpeta raíz del proyecto:

```bash
npm install
npm run dev
```

Abrir http://localhost:5173 (el backend solo acepta peticiones desde esa dirección).
La URL del backend se puede cambiar con la variable `VITE_API_URL`.

## Usuarios de demostración

| Rol           | Correo                  | Contraseña |
| ------------- | ----------------------- | ---------- |
| administrador | admin@sanmarcos.cl      | 1234       |
| recepción     | recepcion@sanmarcos.cl  | 1234       |
| cliente       | dueno.demo@sanmarcos.cl | 1234       |

Los clientes nuevos se crean desde "Registrarse".

## Seguridad y sesión

- El login (`POST /api/auth/login`) devuelve un token JWT con el correo y el rol; vence a los 60 minutos.
- El frontend guarda la sesión en `localStorage` (`userSession`), así que se mantiene al recargar la página.
  Si el token venció o está dañado, la sesión se cierra sola.
- Cada petición protegida envía `Authorization: Bearer <token>`.
- El backend responde **401** si no hay sesión válida y **403** si el rol no tiene permiso.
- Los clientes solo acceden a sus propias mascotas, citas y fichas; el personal accede a todas.
- Las contraseñas se guardan con BCrypt. Los secretos se leen de variables de entorno, no del código.

## Endpoints principales

| Ruta                                                                | Acceso                           |
| ------------------------------------------------------------------- | -------------------------------- |
| `POST /api/auth/login`, `POST /api/auth/registro`                   | Público                          |
| `GET /api/servicios`                                                | Público                          |
| `POST`, `PUT`, `DELETE /api/servicios`                              | Administrador                    |
| `/api/usuarios`                                                     | Administrador                    |
| `GET /api/mascotas/mias`, `POST /api/mascotas`                      | Sesión iniciada                  |
| `GET /api/mascotas`                                                 | Administrador y recepción        |
| `GET`, `PUT /api/mascotas/{id}`                                     | Dueño, administrador y recepción |
| `DELETE /api/mascotas/{id}`                                         | Administrador y recepción        |
| `GET /api/citas/mias`, `GET /api/citas/ocupadas`, `POST /api/citas` | Sesión iniciada                  |
| `GET /api/citas`                                                    | Administrador y recepción        |
| `GET`, `PUT /api/citas/{id}`                                        | Dueño, administrador y recepción |
| `DELETE /api/citas/{id}`                                            | Administrador y recepción        |
| `GET /api/mascotas/{id}/vacunas`, `GET /api/mascotas/{id}/atenciones` | Dueño, administrador y recepción |
| `POST /api/mascotas/{id}/vacunas`, `POST /api/mascotas/{id}/atenciones` | Administrador y recepción      |
| `PUT`, `DELETE /api/vacunas/{id}`, `PUT`, `DELETE /api/atenciones/{id}` | Administrador y recepción    |

## Reglas de negocio

**Citas**

- Atención de lunes a sábado, domingos cerrado.
- Horas de inicio: 09:00 a 12:00 y 15:00 a 17:00, cada 30 minutos.
- La atención termina a las 17:30 (la hora de inicio más la duración del servicio no puede pasar de ahí).
- No se permiten fechas pasadas ni citas que se crucen en el horario.
- Toda cita nueva de un cliente parte como Pendiente.
- Un cliente solo puede cancelar o reagendar sus citas; confirmar o marcar como atendida es solo del personal.
- Reactivar una cita cancelada vuelve a validar que el horario siga libre.

**Ficha clínica**

- Cada mascota tiene un microchip opcional, vacunas y atenciones.
- Las fechas de aplicación y de atención no pueden ser futuras; el vencimiento de una vacuna no puede ser anterior a su aplicación.
- Solo el personal registra, edita o elimina vacunas y atenciones; el dueño las consulta.
- No se puede eliminar una mascota que tenga citas, vacunas o atenciones asociadas (responde 409).

## Rutas del frontend

| Ruta                                      | Acceso                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `/`, `/servicios`, `/login`, `/registro`  | Todos                                                                   |
| `/mis-mascotas`, `/agendar`, `/mis-citas` | Cliente                                                                 |
| `/historial`                              | Cualquier usuario con sesión (el cliente ve lo suyo; el personal busca por RUT) |
| `/gestion-citas`, `/fichas`               | Recepción y administrador                                               |
| `/admin`, `/usuarios`                     | Administrador                                                           |

## Pruebas

Frontend (Vitest + Testing Library; los servicios se simulan, no necesitan el backend):

```bash
npm test
npm run test:coverage
```

El backend se probó manualmente desde Swagger (casos exitosos, validaciones 400, permisos 401 y 403, conflictos 409).

## Alcance y limitaciones

- Marcar una cita como Atendida no genera automáticamente el registro de la vacuna o de la atención; el personal lo registra en la ficha.
- Desde "Gestión de Fichas" no se crean dueños ni mascotas nuevas: el dueño se registra solo (o lo crea el administrador) y su mascota la crea el cliente.
- Los servicios tienen un campo de stock informativo; agendar una cita no lo descuenta.

## Docker

Con Docker Desktop abierto, desde la carpeta raíz del proyecto:

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Swagger: http://localhost:8080/swagger-ui.html

Para detener: `docker compose down`. Para borrar también la base de datos: `docker compose down -v`.