# WebTransmetroGT

Sistema web administrativo para el control básico del Transmetro GT.

El proyecto fue desarrollado con React, Bootstrap y Supabase, siguiendo el alcance solicitado por la Docente Evaluadora: administrar líneas, estaciones, accesos, guardias, buses, parqueos, pilotos, operadores, recorridos, alertas y reportes.

## Tecnologías

- React + Vite
- Bootstrap
- Bootstrap Icons
- React Router DOM
- Supabase con PostgreSQL
- Render para despliegue

## Funciones principales

- Inicio de sesión por rol.
- Panel de administrador.
- Catálogos de municipalidades, líneas, estaciones, accesos, guardias, parqueos, buses, pilotos y operadores.
- Definición del orden de estaciones por línea.
- Registro de distancia entre estaciones.
- Registro de llegada y salida de buses por operador.
- Generación de alertas por sobrecupo o baja ocupación.
- Reportes de líneas, estaciones, buses asignados, recorridos y alertas.

## Roles

- Administrador: administra la información principal del sistema.
- Operador: registra llegadas y salidas desde su estación asignada.

## Configuración de Supabase

1. Crear un proyecto en Supabase.
2. Abrir el editor SQL.
3. Pegar y ejecutar el archivo:

```text
base_datos/script_supabase.sql
```

4. Copiar las credenciales del proyecto y colocarlas en `.env`:

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

## Ejecutar localmente

```bash
npm install
npm run dev
```

## Construir para producción

```bash
npm run build
```
