# WebTransmetroGT

Sistema web administrativo para el control basico del Transmetro GT.

El proyecto fue desarrollado con React, Bootstrap y Supabase, siguiendo el alcance solicitado en el enunciado universitario: administrar lineas, estaciones, accesos, guardias, buses, parqueos, pilotos, operadores, recorridos, alertas y reportes.

## Tecnologias

- React + Vite
- Bootstrap
- Bootstrap Icons
- React Router DOM
- Supabase con PostgreSQL
- Render para despliegue

## Funciones principales

- Inicio de sesion por rol.
- Panel de administrador.
- Catalogos de municipalidades, lineas, estaciones, accesos, guardias, parqueos, buses, pilotos y operadores.
- Definicion del orden de estaciones por linea.
- Registro de distancia entre estaciones.
- Registro de llegada y salida de buses por operador.
- Generacion de alertas por sobrecupo o baja ocupacion.
- Reportes de lineas, estaciones, buses asignados, recorridos y alertas.

## Roles

- Administrador: administra la informacion principal del sistema.
- Operador: registra llegadas y salidas desde su estacion asignada.

## Configuracion de Supabase

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
Contrasena: Admin123*
```

## Ejecutar localmente

```bash
npm install
npm run dev
```

## Construir para produccion

```bash
npm run build
```

## Documentacion incluida

- `base_datos/script_supabase.sql`: estructura completa de base de datos.
- `base_datos/consultas_reportes.sql`: consultas SQL para reportes.
- `documentacion/guia_configuracion.md`: pasos para configurar Supabase.
