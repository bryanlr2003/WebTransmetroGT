// Este servicio agrupa las consultas y procedimientos que conectan la web con Supabase.
// Importación del cliente configurado y del indicador de conexión disponible.
import { clienteSupabase, supabaseConfigurado } from './clienteSupabase.js'

// Campos que se consultan por tabla. En usuarios se evita traer el hash de contraseña por seguridad.
const consultasPorTabla = {
  usuarios: 'id,nombre,correo,rol,estacion_id,estado,creado_en,actualizado_en',
  municipalidades: '*',
  lineas: '*',
  estaciones: '*',
  linea_estacion: '*',
  accesos: '*',
  guardias: '*',
  parqueos: '*',
  buses: '*',
  pilotos: '*',
  recorridos: '*',
  alertas: '*',
}

// Lista generada desde la configuración anterior para cargar todos los catálogos al abrir la aplicación.
const nombresTablas = Object.keys(consultasPorTabla)

// Control de conexión: antes de consultar se valida que el archivo .env tenga las credenciales.
function validarConexionSupabase() {
  if (!supabaseConfigurado) {
    throw new Error('Faltan las credenciales de Supabase en el archivo .env.')
  }
}

// Función auxiliar que devuelve los datos o convierte el error de Supabase en un mensaje manejable.
async function ejecutarConsulta(consulta) {
  const { data, error } = await consulta
  if (error) throw new Error(error.message)
  return data
}

// Objeto público con las operaciones que pueden usar los contextos y las pantallas.
export const servicioDatos = {
  supabaseConfigurado,

  // Trae los catálogos y registros principales. Se ordenan por id para mostrarlos de forma consistente.
  async obtenerTodosLosDatos() {
    validarConexionSupabase()

    const resultado = {}
    for (const tabla of nombresTablas) {
      resultado[tabla] = await ejecutarConsulta(
        clienteSupabase
          .from(tabla)
          .select(consultasPorTabla[tabla])
          .order('id', { ascending: true }),
      )
    }
    return resultado
  },

  // Llama al procedimiento SQL con parámetros separados para validar correo, contraseña y estado del usuario.
  async iniciarSesion(correo, contrasena) {
    validarConexionSupabase()

    const respuesta = await ejecutarConsulta(
      clienteSupabase.rpc('iniciar_sesion', {
        p_correo: correo,
        p_contrasena: contrasena,
      }),
    )

    if (!respuesta?.length) {
      throw new Error('Credenciales incorrectas o usuario inactivo.')
    }

    return respuesta[0]
  },

  // Inserta un registro en el catálogo indicado y devuelve el registro creado.
  async crearRegistro(tabla, datosRegistro) {
    validarConexionSupabase()

    return ejecutarConsulta(
      clienteSupabase.from(tabla).insert(datosRegistro).select().single(),
    )
  },

  // Actualiza un registro usando su id para que solo se modifique el elemento seleccionado.
  async actualizarRegistro(tabla, id, datosRegistro) {
    validarConexionSupabase()

    return ejecutarConsulta(
      clienteSupabase.from(tabla).update(datosRegistro).eq('id', id).select().single(),
    )
  },

  // Asigna un bus al piloto elegido. Si se deja vacio, el piloto queda sin bus.
  async asignarBusAPiloto(pilotoId, busId) {
    validarConexionSupabase()

    if (busId) {
      const busSeleccionado = await ejecutarConsulta(
        clienteSupabase
          .from('buses')
          .select('id,piloto_id')
          .eq('id', busId)
          .single(),
      )

      if (busSeleccionado.piloto_id && Number(busSeleccionado.piloto_id) !== Number(pilotoId)) {
        throw new Error('El bus seleccionado ya tiene piloto asignado.')
      }
    }

    await ejecutarConsulta(
      clienteSupabase
        .from('buses')
        .update({ piloto_id: null })
        .eq('piloto_id', pilotoId),
    )

    if (!busId) {
      return true
    }

    await ejecutarConsulta(
      clienteSupabase
        .from('buses')
        .update({ piloto_id: pilotoId })
        .eq('id', busId),
    )

    return true
  },

  // Elimina un registro del catálogo indicado usando su id y confirma la operación con true.
  async eliminarRegistro(tabla, id) {
    validarConexionSupabase()

    await ejecutarConsulta(clienteSupabase.from(tabla).delete().eq('id', id))
    return true
  },

  // Crea usuarios usando un procedimiento SQL para guardar la contraseña de forma protegida.
  async crearUsuario(datosUsuario) {
    validarConexionSupabase()

    const respuesta = await ejecutarConsulta(
      clienteSupabase.rpc('crear_usuario', {
        p_nombre: datosUsuario.nombre,
        p_correo: datosUsuario.correo,
        p_contrasena: datosUsuario.contrasena || 'Usuario123*',
        p_rol: datosUsuario.rol,
        p_estacion_id: datosUsuario.estacion_id || null,
      }),
    )

    return respuesta?.[0] || respuesta
  },

  // Actualiza datos del usuario y solo cambia la contraseña si se envía una nueva.
  async actualizarUsuario(id, datosUsuario) {
    validarConexionSupabase()

    const respuesta = await ejecutarConsulta(
      clienteSupabase.rpc('actualizar_usuario', {
        p_id: id,
        p_nombre: datosUsuario.nombre,
        p_correo: datosUsuario.correo,
        p_rol: datosUsuario.rol,
        p_estacion_id: datosUsuario.estacion_id || null,
        p_estado: datosUsuario.estado,
        p_contrasena: datosUsuario.contrasena || null,
      }),
    )

    return respuesta?.[0] || respuesta
  },

  // Registra llegada, pasajeros y genera alerta si aplica según la capacidad del bus.
  async registrarRecorrido(datosRecorrido) {
    validarConexionSupabase()

    const respuesta = await ejecutarConsulta(
      clienteSupabase.rpc('registrar_recorrido', {
        p_bus_id: datosRecorrido.bus_id,
        p_linea_id: datosRecorrido.linea_id,
        p_estacion_id: datosRecorrido.estacion_id,
        p_usuario_id: datosRecorrido.usuario_id,
        p_pasajeros: datosRecorrido.pasajeros,
        p_hora_llegada: datosRecorrido.hora_llegada,
        p_observacion: datosRecorrido.observacion || '',
      }),
    )

    return respuesta?.[0] || respuesta
  },

  // Marca el recorrido como finalizado cuando el bus sale de la estación y guarda su observación.
  async registrarSalidaRecorrido(recorridoId, horaSalida, observacionSalida) {
    validarConexionSupabase()

    return ejecutarConsulta(
      clienteSupabase
        .from('recorridos')
        .update({
          hora_salida: horaSalida,
          observacion_salida: observacionSalida || '',
          estado: 'finalizado',
        })
        .eq('id', recorridoId)
        .select()
        .single(),
    )
  },
}
