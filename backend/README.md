# Veterinaria San Marcos: Backend

API REST de la Veterinaria San Marcos. Spring Boot 4.1.2, Java 21, Maven, Spring Security con JWT,
Spring Data JPA, PostgreSQL y Swagger. DSY1104 Desarrollo Fullstack II, EP3, Sección 005.

**Integrantes:** Alan Ojeda y Nayeli Leiva

El frontend (React) está en el repositorio principal del proyecto: https://github.com/Raccxon/VetSanMarcos-Proyect

## Requisitos

Java 21, Maven y PostgreSQL (con una base de datos vacía llamada `vetsanmarcos`).

## Variables de entorno

Definirlas en la terminal donde se inicia el backend (ver `.env.example`).

| Variable      | Descripción                                           | Por defecto |
| ------------- | ----------------------------------------------------- | ----------- |
| `DB_PASSWORD` | Clave del usuario de PostgreSQL                       | (vacía)     |
| `DB_USERNAME` | Usuario de PostgreSQL                                 | `postgres`  |
| `DB_HOST`     | Servidor de PostgreSQL                                | `localhost` |
| `DB_PORT`     | Puerto de PostgreSQL                                  | `5432`      |
| `JWT_SECRET`  | Secreto para firmar los tokens (mínimo 32 caracteres) | obligatoria |

En PowerShell (Windows):

```powershell
$env:DB_PASSWORD = "tu_clave"
$env:DB_PORT = "5432"
$env:JWT_SECRET = "un-secreto-de-al-menos-32-caracteres"
```

## Ejecutar

```bash
mvn spring-boot:run
```

Está listo cuando la consola muestra `Started VetSanMarcosApplication`.
API: http://localhost:8080 · Swagger: http://localhost:8080/swagger-ui.html

Las tablas se crean solas y, con la base vacía, se cargan datos de demostración.

## Usuarios de demostración

| Rol           | Correo                  | Contraseña |
| ------------- | ----------------------- | ---------- |
| administrador | admin@sanmarcos.cl      | 1234       |
| recepción     | recepcion@sanmarcos.cl  | 1234       |
| cliente       | dueno.demo@sanmarcos.cl | 1234       |

## Probar en Swagger

1. En `POST /api/auth/login` enviar `{"email":"recepcion@sanmarcos.cl","password":"1234"}`.
2. Copiar el `token` de la respuesta, presionar **Authorize** y pegarlo (sin la palabra Bearer).
3. Probar los endpoints. Sin token responde 401; con un rol sin permiso, 403.

## Docker

Este repositorio incluye un `Dockerfile` del backend. Para levantar el sistema completo (base de datos,
backend y frontend) con un solo comando, usar el repositorio principal, que incluye `docker-compose.yml`.