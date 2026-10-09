# Veterinaria San Marcos - Frontend (EP2)

Aplicación web para la gestión de servicios, citas e historial de la Veterinaria San Marcos (Rancagua).
DSY1104 Desarrollo Full Stack II · Sección <XXX> · Grupo <GXX>

**Integrantes:** <Alan Ojeda>, <Nayeli Leiva>

## Tecnologías
React 19, Vite, React Router, Bootstrap 5, React Leaflet, Vitest + React Testing Library.

## Cómo ejecutarlo
```bash
npm install
npm run dev      # abre http://localhost:5173
npm test         # ejecuta las pruebas unitarias
npm run test:coverage   # genera el reporte de cobertura
npm run build    # compila para producción
```

## Usuarios de prueba (sesión simulada)
En /login se elige el rol; cualquier correo y contraseña sirven.
| Rol | Qué puede hacer |
|---|---|
| cliente | Agendar citas y ver sus citas en "Mis Citas" |
| recepcion | <completar> |
| admin | Panel de administración |

## Estructura
- `src/pages`: vistas principales (Home, Servicios, Agendar, Mis Citas, Historial, Login, Admin).
- `src/components`: componentes reutilizables (layout y ui).
- `src/context`: estado global de las citas (CitasContext).
- `src/constants`: roles del sistema.
- `src/utils`: funciones puras (filtros, sesión).
- `src/data`: datos simulados.

## Pruebas
31 pruebas con Vitest y React Testing Library, junto al código que prueban (`*.test.jsx`).
