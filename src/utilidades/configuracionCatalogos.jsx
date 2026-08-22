// Archivo de configuración para los catálogos administrativos: campos, columnas y filtros.

// Importación de funciones reutilizables para llenar listas, mostrar nombres relacionados y pintar estados.
import { claseEstado, obtenerNombre, opcionesDesdeLista, textoEstado } from './selectoresDatos.js'

// Opciones comunes para activar o desactivar registros sin eliminarlos desde los formularios.
const opcionesEstado = [
  { valor: 'activo', texto: 'Activo' },
  { valor: 'inactivo', texto: 'Inactivo' },
]

// Muestra el estado de cada registro con una etiqueta de Bootstrap en las tablas.
function estadoBadge(registro) {
  return (
    <span className={`badge text-bg-${claseEstado(registro.estado)} badge-estado`}>
      {textoEstado(registro.estado)}
    </span>
  )
}

// Centraliza la configuración de cada catálogo para reutilizar la misma pantalla y modal.
// Recibe el tipo de catálogo solicitado y los datos actuales para crear sus opciones relacionadas.
export function obtenerConfiguracionCatalogo(tipo, datos) {
  // Opciones para llenar selects desde la información que ya viene de Supabase.
  const opcionesMunicipalidades = opcionesDesdeLista(datos.municipalidades, (item) => item.nombre)
  const opcionesLineas = opcionesDesdeLista(datos.lineas, (item) => `${item.codigo} - ${item.nombre}`)

  // Funciones de apoyo para encontrar registros relacionados cuando se editan formularios.
  const obtenerLinea = (id) => (datos.lineas || []).find((linea) => Number(linea.id) === Number(id))
  const obtenerEstacion = (id) => (datos.estaciones || []).find((estacion) => Number(estacion.id) === Number(id))
  const obtenerAcceso = (id) => (datos.accesos || []).find((acceso) => Number(acceso.id) === Number(id))
  const obtenerParqueo = (id) => (datos.parqueos || []).find((parqueo) => Number(parqueo.id) === Number(id))
  const obtenerBusPiloto = (pilotoId) => (datos.buses || []).find((bus) => Number(bus.piloto_id) === Number(pilotoId))
  const obtenerMunicipalidadBus = (bus) => obtenerParqueo(bus?.parqueo_id)?.municipalidad_id

  // Cada bloque define título, tabla, campos del formulario y columnas de la tabla del catálogo.
  const configuraciones = {
    municipalidades: {
      titulo: 'Municipalidades',
      tabla: 'municipalidades',
      descripcion: 'Registro de municipalidades responsables de líneas y estaciones.',
      campos: [
        { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
        { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: opcionesEstado, valorInicial: 'activo', requerido: true },
      ],
      columnas: [
        { campo: 'nombre', titulo: 'Municipalidad' },
        { campo: 'estado', titulo: 'Estado', render: estadoBadge },
      ],
    },
    lineas: {
      titulo: 'Líneas de Transmetro',
      tabla: 'lineas',
      descripcion: 'Administración de líneas y municipalidad responsable.',
      // Permite usar el filtro general porque cada línea guarda su municipalidad.
      permiteFiltroMunicipalidad: true,
      campos: [
        { nombre: 'codigo', etiqueta: 'Código', requerido: true },
        { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
        { nombre: 'municipalidad_id', etiqueta: 'Municipalidad', tipo: 'select', opciones: opcionesMunicipalidades, requerido: true },
        { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea', columna: 'col-12' },
        { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: opcionesEstado, valorInicial: 'activo', requerido: true },
      ],
      columnas: [
        { campo: 'codigo', titulo: 'Código' },
        { campo: 'nombre', titulo: 'Línea' },
        {
          campo: 'municipalidad_id',
          titulo: 'Municipalidad',
          render: (registro) => obtenerNombre(datos.municipalidades, registro.municipalidad_id),
        },
        { campo: 'estado', titulo: 'Estado', render: estadoBadge },
      ],
    },
    estaciones: {
      titulo: 'Estaciones',
      tabla: 'estaciones',
      descripcion: 'Registro de estaciones y municipalidad a la que pertenecen.',
      // Permite usar el filtro general porque cada estación guarda su municipalidad.
      permiteFiltroMunicipalidad: true,
      campos: [
        { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
        { nombre: 'municipalidad_id', etiqueta: 'Municipalidad', tipo: 'select', opciones: opcionesMunicipalidades, requerido: true },
        { nombre: 'ubicacion', etiqueta: 'Ubicación o referencia', requerido: true },
        { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: opcionesEstado, valorInicial: 'activo', requerido: true },
      ],
      columnas: [
        { campo: 'nombre', titulo: 'Estación' },
        {
          campo: 'municipalidad_id',
          titulo: 'Municipalidad',
          render: (registro) => obtenerNombre(datos.municipalidades, registro.municipalidad_id),
        },
        { campo: 'ubicacion', titulo: 'Ubicación' },
        { campo: 'estado', titulo: 'Estado', render: estadoBadge },
      ],
    },
    accesos: {
      titulo: 'Accesos',
      tabla: 'accesos',
      descripcion: 'Cada acceso pertenece a una sola estación.',
      // El filtro obtiene la municipalidad mediante la estación de cada acceso.
      permiteFiltroMunicipalidad: true,
      campos: [
        { nombre: 'nombre', etiqueta: 'Nombre del acceso', requerido: true },
        {
          nombre: 'municipalidad_filtro',
          etiqueta: 'Municipalidad',
          tipo: 'select',
          opciones: opcionesMunicipalidades,
          requerido: true,
          virtual: true,
          // Campo virtual: solo filtra estaciones, no se guarda en la tabla accesos.
          obtenerValorInicial: (registro) => {
            const estacion = obtenerEstacion(registro?.estacion_id)
            return estacion?.municipalidad_id || ''
          },
        },
        {
          nombre: 'estacion_id',
          etiqueta: 'Estación',
          tipo: 'select',
          dependeDe: 'municipalidad_filtro',
          mensajeDependencia: 'Seleccione primero la municipalidad...',
          // Solo muestra estaciones de la municipalidad elegida.
          obtenerOpciones: (valores) =>
            opcionesDesdeLista(
              (datos.estaciones || []).filter(
                (estacion) => Number(estacion.municipalidad_id) === Number(valores.municipalidad_filtro),
              ),
              (item) => item.nombre,
            ),
          requerido: true,
        },
        { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea', columna: 'col-12' },
        { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: opcionesEstado, valorInicial: 'activo', requerido: true },
      ],
      columnas: [
        { campo: 'nombre', titulo: 'Acceso' },
        {
          campo: 'estacion_id',
          titulo: 'Estación',
          render: (registro) => obtenerNombre(datos.estaciones, registro.estacion_id),
        },
        { campo: 'estado', titulo: 'Estado', render: estadoBadge },
      ],
    },
    guardias: {
      titulo: 'Guardias de seguridad',
      tabla: 'guardias',
      descripcion: 'Asignación simple de guardias a accesos de estaciones.',
      // El filtro llega a la municipalidad mediante acceso y estación.
      permiteFiltroMunicipalidad: true,
      campos: [
        { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
        {
          nombre: 'dpi',
          etiqueta: 'DPI',
          requerido: true,
          // Control de entrada: el modal conserva solo números y limita el DPI a 13 dígitos.
          formato: 'dpi',
          inputMode: 'numeric',
        },
        {
          nombre: 'telefono',
          etiqueta: 'Teléfono',
          requerido: true,
          // Control de entrada: el modal limita el teléfono a 8 dígitos y agrega el guion automáticamente.
          formato: 'telefono',
          inputMode: 'numeric',
        },
        {
          nombre: 'municipalidad_filtro',
          etiqueta: 'Municipalidad',
          tipo: 'select',
          opciones: opcionesMunicipalidades,
          requerido: true,
          virtual: true,
          // Campo virtual: primero se elige la municipalidad para mostrar sus estaciones.
          obtenerValorInicial: (registro) => {
            const acceso = obtenerAcceso(registro?.acceso_id)
            const estacion = obtenerEstacion(acceso?.estacion_id)
            return estacion?.municipalidad_id || ''
          },
        },
        {
          nombre: 'estacion_filtro',
          etiqueta: 'Estación',
          tipo: 'select',
          dependeDe: 'municipalidad_filtro',
          mensajeDependencia: 'Seleccione primero la municipalidad...',
          requerido: true,
          virtual: true,
          // Con la municipalidad elegida, se listan solo sus estaciones.
          obtenerOpciones: (valores) =>
            opcionesDesdeLista(
              (datos.estaciones || []).filter(
                (estacion) => Number(estacion.municipalidad_id) === Number(valores.municipalidad_filtro),
              ),
              (item) => item.nombre,
            ),
          // Campo virtual: sirve para cargar la estación al editar un guardia.
          obtenerValorInicial: (registro) => {
            const acceso = obtenerAcceso(registro?.acceso_id)
            return acceso?.estacion_id || ''
          },
        },
        {
          nombre: 'acceso_id',
          etiqueta: 'Acceso asignado',
          tipo: 'select',
          dependeDe: 'estacion_filtro',
          mensajeDependencia: 'Seleccione primero la estación...',
          // Cada guardia queda asignado a un acceso específico.
          obtenerOpciones: (valores) =>
            opcionesDesdeLista(
              (datos.accesos || []).filter(
                (acceso) => Number(acceso.estacion_id) === Number(valores.estacion_filtro),
              ),
              (item) => item.nombre,
            ),
          requerido: true,
        },
        { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: opcionesEstado, valorInicial: 'activo', requerido: true },
      ],
      columnas: [
        { campo: 'nombre', titulo: 'Guardia' },
        { campo: 'telefono', titulo: 'Teléfono' },
        {
          campo: 'acceso_id',
          titulo: 'Acceso',
          render: (registro) => obtenerNombre(datos.accesos, registro.acceso_id),
        },
        { campo: 'estado', titulo: 'Estado', render: estadoBadge },
      ],
    },
    parqueos: {
      titulo: 'Parqueos',
      tabla: 'parqueos',
      descripcion: 'Parqueos disponibles para asignar buses.',
      // Permite usar el filtro general porque cada parqueo guarda su municipalidad.
      permiteFiltroMunicipalidad: true,
      campos: [
        { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
        { nombre: 'municipalidad_id', etiqueta: 'Municipalidad', tipo: 'select', opciones: opcionesMunicipalidades, requerido: true },
        {
          nombre: 'estacion_id',
          etiqueta: 'Estación relacionada',
          tipo: 'select',
          dependeDe: 'municipalidad_id',
          // Evita seleccionar estaciones de otra municipalidad.
          obtenerOpciones: (valores) =>
            opcionesDesdeLista(
              (datos.estaciones || []).filter(
                (estacion) => Number(estacion.municipalidad_id) === Number(valores.municipalidad_id),
              ),
              (item) => item.nombre,
            ),
        },
        { nombre: 'ubicacion', etiqueta: 'Ubicación', requerido: true },
        { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: opcionesEstado, valorInicial: 'activo', requerido: true },
      ],
      columnas: [
        { campo: 'nombre', titulo: 'Parqueo' },
        {
          campo: 'municipalidad_id',
          titulo: 'Municipalidad',
          render: (registro) => obtenerNombre(datos.municipalidades, registro.municipalidad_id),
        },
        {
          campo: 'estacion_id',
          titulo: 'Estación',
          render: (registro) => obtenerNombre(datos.estaciones, registro.estacion_id),
        },
        { campo: 'estado', titulo: 'Estado', render: estadoBadge },
      ],
    },
    buses: {
      titulo: 'Buses',
      tabla: 'buses',
      descripcion: 'Control de buses, capacidad, línea y parqueo asignado.',
      // El filtro obtiene la municipalidad mediante el parqueo asignado al bus.
      permiteFiltroMunicipalidad: true,
      campos: [
        { nombre: 'codigo', etiqueta: 'Código del bus', requerido: true },
        // Solicita tipo de placa, tres números y tres letras con guía visual: U 421 ABF.
        {
          nombre: 'placa',
          etiqueta: 'Placa',
          formato: 'placa',
          patron: '[A-Z] [0-9]{3} [A-Z]{3}',
          longitudMaxima: 9,
          placeholder: 'U 421 ABF',
          requerido: true,
        },
        // No permite registrar buses con capacidad cero o negativa.
        { nombre: 'capacidad_maxima', etiqueta: 'Capacidad máxima', tipo: 'number', min: 1, requerido: true },
        { nombre: 'linea_id', etiqueta: 'Línea asignada', tipo: 'select', opciones: opcionesLineas },
        {
          nombre: 'parqueo_id',
          etiqueta: 'Parqueo asignado',
          tipo: 'select',
          dependeDe: 'linea_id',
          obtenerOpciones: (valores) => {
            const linea = obtenerLinea(valores.linea_id)

            if (!linea) {
              return []
            }

            // El parqueo disponible debe pertenecer a la municipalidad de la línea.
            return opcionesDesdeLista(
              (datos.parqueos || []).filter(
                (parqueo) => Number(parqueo.municipalidad_id) === Number(linea.municipalidad_id),
              ),
              (item) => item.nombre,
            )
          },
          requerido: true,
        },
        { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: opcionesEstado, valorInicial: 'activo', requerido: true },
      ],
      columnas: [
        { campo: 'codigo', titulo: 'Código' },
        { campo: 'placa', titulo: 'Placa' },
        { campo: 'capacidad_maxima', titulo: 'Capacidad' },
        {
          campo: 'linea_id',
          titulo: 'Línea',
          render: (registro) => obtenerNombre(datos.lineas, registro.linea_id),
        },
        {
          campo: 'parqueo_id',
          titulo: 'Parqueo',
          render: (registro) => obtenerNombre(datos.parqueos, registro.parqueo_id),
        },
        {
          campo: 'piloto_id',
          titulo: 'Piloto',
          render: (registro) => obtenerNombre(datos.pilotos, registro.piloto_id),
        },
        { campo: 'estado', titulo: 'Estado', render: estadoBadge },
      ],
    },
    pilotos: {
      titulo: 'Pilotos',
      tabla: 'pilotos',
      descripcion: 'Registro de datos personales, residencia, historial educativo y bus asignado.',
      // El filtro de municipalidad se obtiene desde el bus asignado al piloto.
      permiteFiltroMunicipalidad: true,
      campos: [
        { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
        {
          nombre: 'dpi',
          etiqueta: 'DPI',
          requerido: true,
          // Control de entrada: el modal conserva solo números y limita el DPI a 13 dígitos.
          formato: 'dpi',
          inputMode: 'numeric',
        },
        {
          nombre: 'telefono',
          etiqueta: 'Teléfono',
          requerido: true,
          // Control de entrada: el modal limita el teléfono a 8 dígitos y agrega el guion automáticamente.
          formato: 'telefono',
          inputMode: 'numeric',
        },
        { nombre: 'correo', etiqueta: 'Correo', tipo: 'email', requerido: true },
        { nombre: 'direccion', etiqueta: 'Dirección', requerido: true },
        { nombre: 'municipio_residencia', etiqueta: 'Municipio de residencia', requerido: true },
        { nombre: 'historial_educativo', etiqueta: 'Historial educativo', tipo: 'textarea', columna: 'col-12', requerido: true },
        {
          nombre: 'municipalidad_bus_filtro',
          etiqueta: 'Municipalidad del bus',
          tipo: 'select',
          opciones: opcionesMunicipalidades,
          virtual: true,
          // Primero se elige la municipalidad para no mezclar buses de todo el sistema.
          obtenerValorInicial: (registro) => {
            const busAsignado = obtenerBusPiloto(registro?.id)
            return obtenerMunicipalidadBus(busAsignado) || ''
          },
        },
        {
          nombre: 'bus_id',
          etiqueta: 'Bus asignado',
          tipo: 'select',
          dependeDe: 'municipalidad_bus_filtro',
          mensajeDependencia: 'Seleccione primero la municipalidad...',
          virtual: true,
          // El piloto puede quedar sin bus, pero si se asigna solo aparecen buses libres.
          obtenerValorInicial: (registro) => obtenerBusPiloto(registro?.id)?.id || '',
          obtenerOpciones: (valores, registro) =>
            opcionesDesdeLista(
              (datos.buses || []).filter(
                (bus) =>
                  Number(obtenerMunicipalidadBus(bus)) === Number(valores.municipalidad_bus_filtro) &&
                  (bus.estado === 'activo' || Number(bus.piloto_id) === Number(registro?.id)) &&
                  (!bus.piloto_id || Number(bus.piloto_id) === Number(registro?.id)),
              ),
              (item) => `${item.codigo} - ${item.placa}`,
            ),
        },
        { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: opcionesEstado, valorInicial: 'activo', requerido: true },
      ],
      columnas: [
        { campo: 'nombre', titulo: 'Piloto' },
        { campo: 'telefono', titulo: 'Teléfono' },
        { campo: 'correo', titulo: 'Correo' },
        { campo: 'municipio_residencia', titulo: 'Residencia' },
        {
          campo: 'bus_asignado',
          titulo: 'Bus asignado',
          render: (registro) => obtenerBusPiloto(registro.id)?.codigo || 'Sin asignar',
        },
        { campo: 'estado', titulo: 'Estado', render: estadoBadge },
      ],
    },
    operadores: {
      titulo: 'Operadores de estación',
      tabla: 'usuarios',
      descripcion: 'Usuarios que registran llegadas y salidas desde una estación.',
      // El filtro obtiene la municipalidad mediante la estación del operador.
      permiteFiltroMunicipalidad: true,
      // Control de listado: esta pantalla muestra únicamente usuarios con rol de operador.
      filtrar: (usuarios) => usuarios.filter((usuario) => usuario.rol === 'operador'),
      campos: [
        { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
        { nombre: 'correo', etiqueta: 'Correo', tipo: 'email', requerido: true },
        // El campo password oculta la contraseña y solo se usa al crear o cambiar ese dato.
        { nombre: 'contrasena', etiqueta: 'Contraseña', tipo: 'password', ayuda: 'Solo se escribe al crear o cambiar contraseña.' },
        {
          nombre: 'municipalidad_filtro',
          etiqueta: 'Municipalidad',
          tipo: 'select',
          opciones: opcionesMunicipalidades,
          requerido: true,
          virtual: true,
          // Campo virtual: facilita asignar operadores a estaciones de una municipalidad.
          obtenerValorInicial: (registro) => {
            const estacion = obtenerEstacion(registro?.estacion_id)
            return estacion?.municipalidad_id || ''
          },
        },
        {
          nombre: 'estacion_id',
          etiqueta: 'Estación asignada',
          tipo: 'select',
          dependeDe: 'municipalidad_filtro',
          mensajeDependencia: 'Seleccione primero la municipalidad...',
          // El operador solo puede quedar asociado a una estación existente.
          obtenerOpciones: (valores) =>
            opcionesDesdeLista(
              (datos.estaciones || []).filter(
                (estacion) => Number(estacion.municipalidad_id) === Number(valores.municipalidad_filtro),
              ),
              (item) => item.nombre,
            ),
          requerido: true,
        },
        { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: opcionesEstado, valorInicial: 'activo', requerido: true },
      ],
      columnas: [
        { campo: 'nombre', titulo: 'Operador' },
        { campo: 'correo', titulo: 'Correo' },
        {
          campo: 'estacion_id',
          titulo: 'Estación',
          render: (registro) => obtenerNombre(datos.estaciones, registro.estacion_id),
        },
        { campo: 'estado', titulo: 'Estado', render: estadoBadge },
      ],
    },
  }

  // Entrega solo la configuración solicitada para que cada pantalla use sus propios campos y columnas.
  return configuraciones[tipo]
}
