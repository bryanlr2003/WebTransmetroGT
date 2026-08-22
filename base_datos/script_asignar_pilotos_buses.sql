-- ============================================================
-- Asignacion de pilotos a buses
-- ============================================================
-- Este script deja lista la relacion para asignar buses desde el registro de pilotos.
-- Un bus puede quedar sin piloto, pero un piloto asignado solo puede estar en un bus.
-- Se ejecuta una vez en Supabase si el proyecto ya tenia la base montada.

alter table if exists buses
add column if not exists piloto_id bigint references pilotos(id) on delete set null;

create unique index if not exists idx_buses_piloto_unico
on buses(piloto_id)
where piloto_id is not null;

create or replace view vista_buses_asignados as
select
  b.id,
  b.codigo,
  b.placa,
  b.capacidad_maxima,
  coalesce(l.nombre, 'Sin linea') as linea,
  p.nombre as parqueo,
  b.estado,
  coalesce(pi.nombre, 'Sin piloto') as piloto
from buses b
left join lineas l on l.id = b.linea_id
join parqueos p on p.id = b.parqueo_id
left join pilotos pi on pi.id = b.piloto_id;

notify pgrst, 'reload schema';
