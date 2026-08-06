import { clienteSupabase, supabaseConfigurado } from './clienteSupabase.js'

// Campos consultados por tabla. En usuarios se evita traer el hash de contrasena.
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

const nombresTablas = Object.keys(consultasPorTabla)

// Antes de consultar se valida que el archivo .env tenga las credenciales.
function validarConexionSupabase() {
  if (!supabaseConfigurado) {
    throw new Error('Faltan las credenciales de Supabase en el archivo .env.')
  }
}

// Funcion auxiliar para manejar de la misma forma los errores de Supabase.
async function ejecutarConsulta(consulta) {
  const { data, error } = await consulta
  if (error) throw new Error(error.message)
  return data
}

export const servicioDatos = {
  supabaseConfigurado,

  // Traer los reportes y catalogos principales de la base de datos.
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

  // Llama al procedimiento SQL que valida correo, contrasena y estado del usuario.
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

  // Inserta registros de catalogos simples.
  async crearRegistro(tabla, datosRegistro) {
    validarConexionSupabase()

    return ejecutarConsulta(
      clienteSupabase.from(tabla).insert(datosRegistro).select().single(),
    )
  },

  // Actualiza registros de catalogos simples.
  async actualizarRegistro(tabla, id, datosRegistro) {
    validarConexionSupabase()

    return ejecutarConsulta(
      clienteSupabase.from(tabla).update(datosRegistro).eq('id', id).select().single(),
    )
  },

  // Elimina registros desde el catalogo indicado.
  async eliminarRegistro(tabla, id) {
    validarConexionSupabase()

    await ejecutarConsulta(clienteSupabase.from(tabla).delete().eq('id', id))
    return true
  },

  // Crea usuarios usando un procedimiento SQL para guardar la contrasena de forma protegida.
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

  // Actualiza datos del usuario y solo cambia la contrasena si se envia una nueva.
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

  // Registra llegada, pasajeros y genera alerta si aplica segun la capacidad.
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

  // Marca el recorrido como finalizado cuando el bus sale de la estacion.
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
