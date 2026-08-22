-- ============================================================
-- Sistema Web Transmetro GT
-- Script principal para Supabase / PostgreSQL
-- ============================================================
-- Este script crea las tablas, relaciones y funciones necesarias
-- para el proyecto universitario de control administrativo del Transmetro.

create extension if not exists pgcrypto;

-- ============================================================
-- TABLAS PRINCIPALES
-- ============================================================

-- Municipalidades responsables de administrar lineas y estaciones.
create table if not exists municipalidades (
  id bigint generated always as identity primary key,
  nombre varchar(120) not null,
  estado varchar(20) not null default 'activo' check (estado in ('activo', 'inactivo')),
  creado_en timestamp not null default now(),
  actualizado_en timestamp not null default now()
);

-- Estaciones fisicas donde se registra llegada y salida de buses.
create table if not exists estaciones (
  id bigint generated always as identity primary key,
  nombre varchar(120) not null,
  municipalidad_id bigint not null references municipalidades(id) on delete restrict,
  ubicacion varchar(180) not null,
  estado varchar(20) not null default 'activo' check (estado in ('activo', 'inactivo')),
  creado_en timestamp not null default now(),
  actualizado_en timestamp not null default now()
);

-- Lineas o recorridos principales del sistema.
create table if not exists lineas (
  id bigint generated always as identity primary key,
  codigo varchar(30) not null unique,
  nombre varchar(120) not null,
  municipalidad_id bigint not null references municipalidades(id) on delete restrict,
  descripcion text,
  estado varchar(20) not null default 'activo' check (estado in ('activo', 'inactivo')),
  creado_en timestamp not null default now(),
  actualizado_en timestamp not null default now()
);

-- Relacion entre una linea y sus estaciones, incluyendo orden y distancia.
create table if not exists linea_estacion (
  id bigint generated always as identity primary key,
  linea_id bigint not null references lineas(id) on delete cascade,
  estacion_id bigint not null references estaciones(id) on delete restrict,
  orden integer not null check (orden > 0),
  distancia_km numeric(8,2) not null default 0 check (distancia_km >= 0),
  creado_en timestamp not null default now(),
  actualizado_en timestamp not null default now(),
  unique (linea_id, estacion_id),
  unique (linea_id, orden)
);

-- Accesos o entradas pertenecientes a una estacion.
create table if not exists accesos (
  id bigint generated always as identity primary key,
  nombre varchar(120) not null,
  estacion_id bigint not null references estaciones(id) on delete cascade,
  descripcion text,
  estado varchar(20) not null default 'activo' check (estado in ('activo', 'inactivo')),
  creado_en timestamp not null default now(),
  actualizado_en timestamp not null default now()
);

-- Guardias asignados a accesos especificos.
create table if not exists guardias (
  id bigint generated always as identity primary key,
  nombre varchar(120) not null,
  dpi varchar(20) not null,
  telefono varchar(30) not null,
  acceso_id bigint not null references accesos(id) on delete restrict,
  estado varchar(20) not null default 'activo' check (estado in ('activo', 'inactivo')),
  creado_en timestamp not null default now(),
  actualizado_en timestamp not null default now()
);

-- Parqueos disponibles para guardar buses.
create table if not exists parqueos (
  id bigint generated always as identity primary key,
  nombre varchar(120) not null,
  municipalidad_id bigint not null references municipalidades(id) on delete restrict,
  estacion_id bigint references estaciones(id) on delete set null,
  ubicacion varchar(180) not null,
  estado varchar(20) not null default 'activo' check (estado in ('activo', 'inactivo')),
  creado_en timestamp not null default now(),
  actualizado_en timestamp not null default now()
);

-- Buses con capacidad maxima y asignacion a linea/parqueo.
create table if not exists buses (
  id bigint generated always as identity primary key,
  codigo varchar(40) not null unique,
  placa varchar(30) not null unique,
  capacidad_maxima integer not null check (capacidad_maxima > 0),
  linea_id bigint references lineas(id) on delete set null,
  parqueo_id bigint not null references parqueos(id) on delete restrict,
  estado varchar(20) not null default 'activo' check (estado in ('activo', 'inactivo')),
  creado_en timestamp not null default now(),
  actualizado_en timestamp not null default now()
);

-- Pilotos registrados como parte del control administrativo.
create table if not exists pilotos (
  id bigint generated always as identity primary key,
  nombre varchar(120) not null,
  dpi varchar(20) not null unique,
  telefono varchar(30) not null,
  correo varchar(160) not null,
  direccion varchar(220) not null,
  municipio_residencia varchar(120) not null,
  historial_educativo text not null,
  estado varchar(20) not null default 'activo' check (estado in ('activo', 'inactivo')),
  creado_en timestamp not null default now(),
  actualizado_en timestamp not null default now()
);

-- Relacion entre bus y piloto. Cada piloto puede quedar asignado a un solo bus.
alter table if exists buses
add column if not exists piloto_id bigint references pilotos(id) on delete set null;

create unique index if not exists idx_buses_piloto_unico
on buses(piloto_id)
where piloto_id is not null;

-- Usuarios del sistema. Solo se manejan administrador y operador.
create table if not exists usuarios (
  id bigint generated always as identity primary key,
  nombre varchar(120) not null,
  correo varchar(160) not null unique,
  contrasena_hash text not null,
  rol varchar(30) not null check (rol in ('administrador', 'operador')),
  estacion_id bigint references estaciones(id) on delete set null,
  estado varchar(20) not null default 'activo' check (estado in ('activo', 'inactivo')),
  creado_en timestamp not null default now(),
  actualizado_en timestamp not null default now()
);

-- Registro operativo de llegada y salida de buses por estacion.
create table if not exists recorridos (
  id bigint generated always as identity primary key,
  bus_id bigint not null references buses(id) on delete restrict,
  linea_id bigint not null references lineas(id) on delete restrict,
  estacion_id bigint not null references estaciones(id) on delete restrict,
  usuario_id bigint not null references usuarios(id) on delete restrict,
  pasajeros integer not null check (pasajeros >= 0),
  hora_llegada timestamp not null,
  hora_salida timestamp,
  observacion text,
  observacion_salida text,
  estado varchar(30) not null default 'en_estacion' check (estado in ('en_estacion', 'finalizado')),
  creado_en timestamp not null default now(),
  actualizado_en timestamp not null default now()
);

-- Alertas generadas cuando el bus tiene sobrecupo o baja ocupacion.
create table if not exists alertas (
  id bigint generated always as identity primary key,
  recorrido_id bigint not null references recorridos(id) on delete cascade,
  bus_id bigint not null references buses(id) on delete restrict,
  estacion_id bigint not null references estaciones(id) on delete restrict,
  tipo varchar(40) not null check (tipo in ('sobrecupo', 'baja_ocupacion')),
  mensaje text not null,
  fecha timestamp not null default now(),
  estado varchar(30) not null default 'pendiente' check (estado in ('pendiente', 'revisada')),
  creado_en timestamp not null default now(),
  actualizado_en timestamp not null default now()
);

-- ============================================================
-- FECHAS DE MODIFICACION
-- ============================================================

create or replace function actualizar_fecha_modificacion()
returns trigger
language plpgsql
as $$
begin
  -- Mantiene actualizada la fecha de modificacion en cada cambio.
  new.actualizado_en = now();
  return new;
end;
$$;

do $$
declare
  tabla text;
begin
  -- Crea el mismo trigger de actualizacion para todas las tablas principales.
  foreach tabla in array array[
    'municipalidades',
    'estaciones',
    'lineas',
    'linea_estacion',
    'accesos',
    'guardias',
    'parqueos',
    'buses',
    'pilotos',
    'usuarios',
    'recorridos',
    'alertas'
  ]
  loop
    execute format('drop trigger if exists trg_%I_actualizado on %I', tabla, tabla);
    execute format(
      'create trigger trg_%I_actualizado before update on %I
       for each row execute function actualizar_fecha_modificacion()',
      tabla,
      tabla
    );
  end loop;
end;
$$;

-- ============================================================
-- FUNCIONES DE USUARIO
-- ============================================================

create or replace function iniciar_sesion(
  p_correo text,
  p_contrasena text
)
returns table (
  id bigint,
  nombre varchar,
  correo varchar,
  rol varchar,
  estacion_id bigint,
  estado varchar
)
language plpgsql
security definer
as $$
begin
  -- Compara la contrasena escrita con el hash guardado en la tabla usuarios.
  return query
  select
    u.id,
    u.nombre,
    u.correo,
    u.rol,
    u.estacion_id,
    u.estado
  from usuarios u
  where lower(u.correo) = lower(p_correo)
    and u.contrasena_hash = crypt(p_contrasena, u.contrasena_hash)
    and u.estado = 'activo'
  limit 1;
end;
$$;

create or replace function crear_usuario(
  p_nombre text,
  p_correo text,
  p_contrasena text,
  p_rol text,
  p_estacion_id bigint default null
)
returns table (
  id bigint,
  nombre varchar,
  correo varchar,
  rol varchar,
  estacion_id bigint,
  estado varchar
)
language plpgsql
security definer
as $$
begin
  -- La contrasena se guarda cifrada usando pgcrypto.
  return query
  insert into usuarios (nombre, correo, contrasena_hash, rol, estacion_id, estado)
  values (
    p_nombre,
    lower(p_correo),
    crypt(p_contrasena, gen_salt('bf')),
    p_rol,
    p_estacion_id,
    'activo'
  )
  returning usuarios.id, usuarios.nombre, usuarios.correo, usuarios.rol, usuarios.estacion_id, usuarios.estado;
end;
$$;

create or replace function actualizar_usuario(
  p_id bigint,
  p_nombre text,
  p_correo text,
  p_rol text,
  p_estacion_id bigint,
  p_estado text,
  p_contrasena text default null
)
returns table (
  id bigint,
  nombre varchar,
  correo varchar,
  rol varchar,
  estacion_id bigint,
  estado varchar
)
language plpgsql
security definer
as $$
begin
  update usuarios
  set
    nombre = p_nombre,
    correo = lower(p_correo),
    rol = p_rol,
    estacion_id = p_estacion_id,
    estado = p_estado,
    -- Si no se envia nueva contrasena, se conserva la que ya estaba guardada.
    contrasena_hash = case
      when p_contrasena is null or length(trim(p_contrasena)) = 0 then contrasena_hash
      else crypt(p_contrasena, gen_salt('bf'))
    end
  where usuarios.id = p_id;

  return query
  select u.id, u.nombre, u.correo, u.rol, u.estacion_id, u.estado
  from usuarios u
  where u.id = p_id;
end;
$$;

-- ============================================================
-- FUNCION DE RECORRIDOS Y ALERTAS
-- ============================================================

create or replace function registrar_recorrido(
  p_bus_id bigint,
  p_linea_id bigint,
  p_estacion_id bigint,
  p_usuario_id bigint,
  p_pasajeros integer,
  p_hora_llegada timestamp,
  p_observacion text default ''
)
returns table (
  recorrido_id bigint,
  tipo_alerta text,
  mensaje_alerta text
)
language plpgsql
security definer
as $$
declare
  v_recorrido_id bigint;
  v_capacidad integer;
  v_codigo_bus varchar;
  v_tipo_alerta text := 'normal';
  v_mensaje text := '';
begin
  -- Se consulta la capacidad del bus para evaluar si corresponde generar alerta.
  select capacidad_maxima, codigo
  into v_capacidad, v_codigo_bus
  from buses
  where id = p_bus_id;

  if v_capacidad is null then
    raise exception 'El bus seleccionado no existe.';
  end if;

  v_mensaje := 'Capacidad de pasajeros: ' || v_capacidad
    || '.' || chr(10) || 'Llegada registrada correctamente. Ocupacion dentro del rango normal.';

  insert into recorridos (
    bus_id,
    linea_id,
    estacion_id,
    usuario_id,
    pasajeros,
    hora_llegada,
    observacion,
    estado
  )
  values (
    p_bus_id,
    p_linea_id,
    p_estacion_id,
    p_usuario_id,
    p_pasajeros,
    p_hora_llegada,
    p_observacion,
    'en_estacion'
  )
  returning id into v_recorrido_id;

  -- Regla de sobrecupo: 150% o mas de la capacidad registrada.
  if p_pasajeros >= (v_capacidad * 1.5) then
    v_tipo_alerta := 'sobrecupo';
    v_mensaje := 'Capacidad de pasajeros: ' || v_capacidad || '.' || chr(10) || 'El bus '
      || v_codigo_bus || ' supera el 150% de su capacidad. Se recomienda enviar otra unidad.';

  -- Regla de baja ocupacion: menos del 25% de la capacidad registrada.
  elsif p_pasajeros < (v_capacidad * 0.25) then
    v_tipo_alerta := 'baja_ocupacion';
    v_mensaje := 'Capacidad de pasajeros: ' || v_capacidad || '.' || chr(10) || 'El bus '
      || v_codigo_bus || ' no alcanza el 25% de ocupacion. Debe esperar 5 minutos adicionales.';
  end if;

  -- Solo se crea alerta cuando el resultado no esta dentro del rango normal.
  if v_tipo_alerta <> 'normal' then
    insert into alertas (
      recorrido_id,
      bus_id,
      estacion_id,
      tipo,
      mensaje,
      fecha,
      estado
    )
    values (
      v_recorrido_id,
      p_bus_id,
      p_estacion_id,
      v_tipo_alerta,
      v_mensaje,
      p_hora_llegada,
      'pendiente'
    );
  end if;

  return query
  select v_recorrido_id, v_tipo_alerta, v_mensaje;
end;
$$;

-- ============================================================
-- VISTAS DE APOYO PARA REPORTES Y VALIDACIONES
-- ============================================================

create or replace view vista_lineas_resumen as
select
  l.id,
  l.codigo,
  l.nombre,
  m.nombre as municipalidad,
  count(le.estacion_id) as total_estaciones,
  coalesce(sum(le.distancia_km), 0) as distancia_total_km,
  (
    select count(*)
    from buses b
    where b.linea_id = l.id
  ) as total_buses
from lineas l
join municipalidades m on m.id = l.municipalidad_id
left join linea_estacion le on le.linea_id = l.id
group by l.id, l.codigo, l.nombre, m.nombre;

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

-- ============================================================
-- USUARIO PRINCIPAL DEL SISTEMA
-- ============================================================
-- Cambie esta contrasena despues de la primera prueba.

insert into usuarios (nombre, correo, contrasena_hash, rol, estado)
values (
  'Administrador General',
  'admin@gmail.com',
  crypt('Admin123*', gen_salt('bf')),
  'administrador',
  'activo'
)
on conflict (correo) do nothing;

-- ============================================================
-- PERMISOS PARA USAR EL PROYECTO CON LA CLAVE ANON DE SUPABASE
-- ============================================================
-- Para un proyecto academico se permite acceso desde la aplicacion web.
-- En un sistema real se implementarian politicas RLS mas estrictas.

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;

-- Para el alcance academico del proyecto se desactiva RLS.
-- Esto permite que la aplicacion web consuma las tablas con la clave anon/publishable.
alter table if exists municipalidades disable row level security;
alter table if exists estaciones disable row level security;
alter table if exists lineas disable row level security;
alter table if exists linea_estacion disable row level security;
alter table if exists accesos disable row level security;
alter table if exists guardias disable row level security;
alter table if exists parqueos disable row level security;
alter table if exists buses disable row level security;
alter table if exists pilotos disable row level security;
alter table if exists usuarios disable row level security;
alter table if exists recorridos disable row level security;
alter table if exists alertas disable row level security;
