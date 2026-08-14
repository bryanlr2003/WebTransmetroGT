-- Actualiza el procedimiento que registra llegadas para incluir
-- solo la capacidad de pasajeros en los mensajes.

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
  -- Se consulta la capacidad del bus para evaluar la llegada registrada.
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

  -- Genera alerta cuando el bus llega con 150% o mas de su capacidad.
  if p_pasajeros >= (v_capacidad * 1.5) then
    v_tipo_alerta := 'sobrecupo';
    v_mensaje := 'Capacidad de pasajeros: ' || v_capacidad || '.' || chr(10) || 'El bus '
      || v_codigo_bus || ' supera el 150% de su capacidad. Se recomienda enviar otra unidad.';

  -- Genera alerta cuando el bus llega con menos del 25% de ocupacion.
  elsif p_pasajeros < (v_capacidad * 0.25) then
    v_tipo_alerta := 'baja_ocupacion';
    v_mensaje := 'Capacidad de pasajeros: ' || v_capacidad || '.' || chr(10) || 'El bus '
      || v_codigo_bus || ' no alcanza el 25% de ocupacion. Debe esperar 5 minutos adicionales.';
  end if;

  -- Si la ocupacion es normal, no se guarda alerta pendiente.
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
