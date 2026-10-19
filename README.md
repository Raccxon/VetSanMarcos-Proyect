# Veterinaria San Marcos - Frontend (EP2)

Aplicación web para la gestión de servicios, citas, fichas clínicas e historial de la Veterinaria San Marcos (Rancagua).
DSY1104 Desarrollo Full Stack II - Evaluación Parcial 2, Sección 005 (caso Forma A).

**Integrantes:** Alan Ojeda y Nayeli Leiva

Es una aplicación solo front-end con datos simulados: todo se guarda en el navegador (`localStorage`). El backend se incorpora en el Parcial 3.

## Tecnologías
React 19, Vite 8, React Router 7, Bootstrap 5, React Leaflet, Vitest + React Testing Library.

## Cómo ejecutarlo
```bash
npm install
npm run dev             # abre http://localhost:5173
npm test                # ejecuta las pruebas unitarias
npm run test:coverage   # genera el reporte de cobertura
npm run build           # compila para producción
npm run lint            # revisa el código
```

## Usuarios de prueba (sesión simulada)
El login valida correo y contraseña. Los usuarios del personal son fijos y los clientes se crean desde "Registrarse".

| Rol | Correo | Contraseña | Qué puede hacer |
|---|---|---|---|
| administrador | admin@gmail.cl | 1234 | Panel de administración (stock y servicios), Usuarios, Gestión de Citas, Gestión de Fichas e Historial |
| recepción | recepcion@gmail.cl | 1234 | Gestión de Citas (cambiar estado, reagendar, eliminar), Gestión de Fichas e Historial |
| cliente | el que se registre en /registro | la que elija (mínimo 4 caracteres) | Agendar citas, ver y cancelar sus citas en "Mis Citas" y ver su propio historial |

Reglas del registro: la contraseña debe repetirse igual, el correo no puede repetirse y no se pueden registrar los correos del administrador ni de recepción.

## Rutas y permisos
| Ruta | Quién entra |
|---|---|
| `/`, `/servicios`, `/agendar`, `/login`, `/registro` | Todos |
| `/historial` | Cualquier usuario con sesión |
| `/mis-citas` | Cliente |
| `/gestion-citas`, `/fichas` | Recepción y administrador |
| `/admin`, `/usuarios` | Administrador |

La seguridad es solo de interfaz: la sesión vive en `localStorage` y puede editarse desde el navegador. La autenticación real corresponde al Parcial 3.

## Estructura
- `src/pages`: vistas (Home, Servicios, Agendar, Mis Citas, Historial, Login, Registro, Gestión de Citas, Fichas, Usuarios y Admin).
- `src/components`: componentes reutilizables (`layout`: Navbar, Footer, Layout; `ui`: RutaProtegida, ServicioCard, MapaClinica).
- `src/context`: estado compartido de las citas (CitasContext).
- `src/constants`: roles, estados de cita y categorías.
- `src/utils`: funciones puras (filtros, sesión, validaciones, vacunas, fichas, historial).
- `src/services`: servicio simulado de datos (`apiServices`).
- `src/data`: datos simulados.
- `src/test`: configuración común de las pruebas.

## Pruebas
140 pruebas en 24 archivos con Vitest + React Testing Library, junto al código que prueban (`*.test.jsx` y `*.test.js`). Incluyen mocks y espías (`vi.mock`, `vi.fn`, `vi.spyOn`) y temporizadores simulados.

Cobertura (`npm run test:coverage`): Statements 89,1 %, Branches 81,5 %, Functions 86,4 %, Lines 90,4 %.