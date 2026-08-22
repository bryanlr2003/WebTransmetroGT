-- ============================================================
-- Asignacion de pilotos a buses
-- ============================================================
-- Este script agrega la relacion entre buses y pilotos en una base ya creada.
-- Cada bus puede tener un piloto asignado y cada piloto solo puede estar en un bus.
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
  coalesce(pi.nombre, 'Sin piloto') as piloto,
  b.estado
from buses b
left join lineas l on l.id = b.linea_id
join parqueos p on p.id = b.parqueo_id
left join pilotos pi on pi.id = b.piloto_id;
