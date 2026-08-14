-- ============================================================
-- Limpieza de departamentos
-- ============================================================
-- Ejecutar si ya se habia creado la tabla departamentos y el campo
-- departamento dentro de municipalidades.
--
-- Esto deja el sistema enfocado en municipalidades, como solicita
-- el enunciado del proyecto.

alter table if exists municipalidades
drop column if exists departamento;

drop table if exists departamentos;
