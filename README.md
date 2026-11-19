# Veterinaria San Marcos

Aplicación web fullstack para gestionar servicios, mascotas y citas de la Veterinaria San Marcos (Rancagua).
DSY1104 Desarrollo Fullstack II, Evaluación Parcial 3, Sección 005.

**Integrantes:** Alan Ojeda y Nayeli Leiva

## Tecnologías

- **Frontend:** React 19, Vite 8, React Router 7, Bootstrap 5, React Leaflet, Vitest + React Testing Library.
- **Backend:** Spring Boot 4.1.2, Java 21, Maven, Spring Security, JWT (jjwt 0.12.6), Spring Data JPA, springdoc-openapi (Swagger).
- **Base de datos:** PostgreSQL.

## Estructura

- `src/`: frontend React.
- `backend/`: API REST Spring Boot.

## Requisitos

- Node.js 20.19 o superior
- Java 21
- Maven
- PostgreSQL

## 1. Base de datos

Crear una base de datos vacía llamada `vetsanmarcos` (por ejemplo, desde pgAdmin).
Las tablas, los servicios de prueba y los usuarios de demostración se crean solos al iniciar el backend.

## 2. Variables de entorno del backend

Definirlas en la terminal donde se inicia el backend (ver `backend/.env.example`).

| Variable      | Descripción                                           | Por defecto |
| ------------- | ----------------------------------------------------- | ----------- |
| `DB_PASSWORD` | Clave del usuario de PostgreSQL                       | (vacía)     |
| `DB_USERNAME` | Usuario de PostgreSQL                                 | `postgres`  |
| `DB_PORT`     | Puerto de PostgreSQL                                  | `5432`      |
| `JWT_SECRET`  | Secreto para firmar los tokens (mínimo 32 caracteres) | obligatoria |

En PowerShell:

```powershell
$env:DB_PASSWORD = "tu_clave"
$env:DB_PORT = "5432"
$env:DB_USERNAME = "postgres"
$env:JWT_SECRET = "un-secreto-de-al-menos-32-caracteres"
```

## 3. Iniciar el backend

```bash
cd backend
mvn spring-boot:run
```

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

## 4. Iniciar el frontend

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

## Reglas de negocio de las citas

- Atención de lunes a sábado, domingos cerrado.
- Horas de inicio: 09:00 a 12:00 y 15:00 a 17:00, cada 30 minutos.
- La atención termina a las 17:30.
- No se permiten fechas pasadas ni citas que se crucen en el horario.
- Toda cita nueva parte como Pendiente.
- Un cliente solo puede cancelar o reagendar sus citas; confirmar o marcar como atendida es solo del personal.

## Rutas del frontend

| Ruta                                                 | Acceso                       |
| ---------------------------------------------------- | ---------------------------- |
| `/`, `/servicios`, `/agendar`, `/login`, `/registro` | Todos                        |
| `/historial`                                         | Cualquier usuario con sesión |
| `/mis-citas`                                         | Cliente                      |
| `/gestion-citas`, `/fichas`                          | Recepción y administrador    |
| `/admin`, `/usuarios`                                | Administrador                |

## Pruebas

```bash
npm test
npm run test:coverage
```
