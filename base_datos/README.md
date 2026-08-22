# Base de datos

En esta carpeta deje los scripts que use para crear y ajustar la base de datos en Supabase.
La idea es tenerlos ordenados por si toca levantar el proyecto desde cero o aplicar algun cambio en una base que ya existe.

## Orden recomendado

1. `script_supabase.sql`

   Este es el script principal. Crea las tablas, relaciones, funciones, vistas, permisos y el usuario inicial del sistema.
   Si la base de datos se crea desde cero, este es el que se debe ejecutar primero.

2. `script_asignar_pilotos_buses.sql`

   Este script se usa cuando la base ya estaba creada antes de agregar la asignacion de pilotos a buses.
   Agrega el campo `piloto_id` en buses, evita que un piloto quede en mas de un bus y actualiza la vista de buses asignados.

3. `script_actualizar_indicador_capacidad.sql`

   Este script actualiza el procedimiento de recorridos para que las alertas muestren mejor la capacidad del bus.

4. `consultas_reportes.sql`

   Aqui deje consultas de apoyo para revisar reportes directamente desde Supabase.

## Nota

Si se ejecuta `script_supabase.sql` en una base nueva, ya queda incluida la parte de pilotos asignados a buses.
El script `script_asignar_pilotos_buses.sql` sirve mas que todo para actualizar una base que ya estaba creada.
