# WebTransmetroGT

Proyecto web para llevar el control básico del Transmetro GT.

La idea del sistema es tener una plataforma donde se pueda administrar la información principal del servicio, como líneas, estaciones, buses, pilotos, operadores y recorridos. También permite registrar llegadas y salidas de buses desde una estación, y generar alertas cuando un bus tiene sobrecupo o baja ocupación.

## Tecnologías usadas

- React + Vite
- Bootstrap
- Bootstrap Icons
- React Router DOM
- Supabase con PostgreSQL
- Render para el despliegue

## Qué incluye el proyecto

- Inicio de sesión para administrador y operador.
- Panel principal para cada rol.
- Catálogos para administrar municipalidades, líneas, estaciones, accesos, guardias, parqueos, buses, pilotos y operadores.
- Registro del orden de estaciones por línea.
- Registro de distancias entre estaciones.
- Registro de llegada y salida de buses.
- Alertas por sobrecupo o baja ocupación.
- Reportes generales del sistema.

## Roles

- Administrador: puede administrar los catálogos, rutas, operadores y reportes.
- Operador: registra la llegada y salida de buses desde la estación que tiene asignada.

## Base de datos

La base de datos se trabaja con Supabase. Para crear las tablas y funciones necesarias se debe ejecutar el script:

```text
base_datos/script_supabase.sql
```

Después se colocan las credenciales del proyecto en un archivo `.env`:

```env
VITE_SUPABASE_URL=https://su-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=su-clave-anon-publica
```

## Usuario inicial

El script crea un administrador inicial:

```text
Correo: admin@gmail.com
Contraseña: Admin123*
```

## Cómo ejecutar el proyecto

```bash
npm install
npm run dev
```

## Compilar el proyecto

```bash
npm run build
```
