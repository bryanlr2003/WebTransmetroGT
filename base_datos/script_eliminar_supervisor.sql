-- ============================================================
-- Limpieza de rol supervisor
-- ============================================================
-- Ejecutar si ya se habia creado el usuario/rol supervisor.
-- El sistema queda limitado a los roles del alcance del enunciado:
-- administrador y operador.

delete from usuarios
where rol = 'supervisor'
   or correo = 'supervisor@gmail.com';

alter table if exists usuarios
drop constraint if exists usuarios_rol_check;

alter table if exists usuarios
add constraint usuarios_rol_check
check (rol in ('administrador', 'operador'));
