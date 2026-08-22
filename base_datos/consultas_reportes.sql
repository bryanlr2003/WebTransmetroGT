-- Consultas SQL para documentar los reportes del sistema.

-- 1. Reporte de lineas con municipalidad, estaciones, buses y distancia total.
select
  l.codigo,
  l.nombre as linea,
  m.nombre as municipalidad,
  (
    select count(*)
    from linea_estacion le
    where le.linea_id = l.id
  ) as total_estaciones,
  (
    select count(*)
    from buses b
    where b.linea_id = l.id
  ) as total_buses,
  (
    select coalesce(sum(le.distancia_km), 0)
    from linea_estacion le
    where le.linea_id = l.id
  ) as distancia_total_km
from lineas l
join municipalidades m on m.id = l.municipalidad_id
group by l.id, l.codigo, l.nombre, m.nombre
order by l.codigo;

-- 2. Reporte de estaciones con municipalidad.
select
  e.nombre as estacion,
  m.nombre as municipalidad,
  e.ubicacion,
  e.estado
from estaciones e
join municipalidades m on m.id = e.municipalidad_id
order by e.nombre;

-- 3. Reporte de buses asignados a lineas.
select
  b.codigo as bus,
  b.placa,
  b.capacidad_maxima,
  coalesce(l.nombre, 'Sin linea') as linea,
  p.nombre as parqueo,
  coalesce(pi.nombre, 'Sin piloto') as piloto,
  b.estado
from buses b
left join lineas l on l.id = b.linea_id
join parqueos p on p.id = b.parqueo_id
left join pilotos pi on pi.id = b.piloto_id
order by l.nombre, b.codigo;

-- 4. Reporte de accesos por linea.
select
  l.nombre as linea,
  e.nombre as estacion,
  a.nombre as acceso,
  a.estado
from lineas l
join linea_estacion le on le.linea_id = l.id
join estaciones e on e.id = le.estacion_id
join accesos a on a.estacion_id = e.id
order by l.nombre, le.orden, a.nombre;

-- 5. Reporte de guardias por acceso.
select
  e.nombre as estacion,
  a.nombre as acceso,
  g.nombre as guardia,
  g.telefono,
  g.estado
from guardias g
join accesos a on a.id = g.acceso_id
join estaciones e on e.id = a.estacion_id
order by e.nombre, a.nombre;

-- 6. Reporte de alertas generadas.
select
  al.fecha,
  b.codigo as bus,
  e.nombre as estacion,
  al.tipo,
  al.mensaje,
  al.estado
from alertas al
join buses b on b.id = al.bus_id
join estaciones e on e.id = al.estacion_id
order by al.fecha desc;

-- 7. Reporte de recorridos registrados.
select
  r.hora_llegada,
  r.hora_salida,
  b.codigo as bus,
  l.nombre as linea,
  e.nombre as estacion,
  r.pasajeros,
  r.estado
from recorridos r
join buses b on b.id = r.bus_id
join lineas l on l.id = r.linea_id
join estaciones e on e.id = r.estacion_id
order by r.hora_llegada desc;
