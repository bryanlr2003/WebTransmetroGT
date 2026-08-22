// Proveedor que concentra los datos de la base y las operaciones usadas por las pantallas.
// Importación de hooks para guardar estado, cargar datos y reutilizar funciones.
import { useCallback, useEffect, useState } from 'react'
// Importación del servicio que se comunica con Supabase.
import { servicioDatos } from '../servicios/servicioDatos.js'
// Importación del contexto donde se compartirán los datos.
import { ContextoDatos } from './contextosBase.js'

export function ProveedorDatos({ children }) {
  // Estado general con la información consultada desde la base de datos y mensajes de carga o error.
  const [datos, setDatos] = useState({})
  const [cargandoDatos, setCargandoDatos] = useState(true)
  const [errorDatos, setErrorDatos] = useState('')

  // Trae nuevamente todos los catálogos y registros usados por la aplicación.
  const recargarDatos = useCallback(async () => {
    setCargandoDatos(true)
    setErrorDatos('')
    try {
      const respuesta = await servicioDatos.obtenerTodosLosDatos()
      setDatos(respuesta)
    } catch (error) {
      setErrorDatos(error.message)
    } finally {
      setCargandoDatos(false)
    }
  }, [])

  // Primera carga de datos al iniciar la aplicación. Si falla, errorDatos queda disponible para mostrarlo.
  useEffect(() => {
    recargarDatos()
  }, [recargarDatos])

  // Funciones reutilizadas por los catálogos del administrador. Después de cada cambio se recargan los datos.
  async function crearRegistro(tabla, valores) {
    const resultado = await servicioDatos.crearRegistro(tabla, valores)
    await recargarDatos()
    return resultado
  }

  async function actualizarRegistro(tabla, id, valores) {
    const resultado = await servicioDatos.actualizarRegistro(tabla, id, valores)
    await recargarDatos()
    return resultado
  }

  async function asignarBusAPiloto(pilotoId, busId) {
    await servicioDatos.asignarBusAPiloto(pilotoId, busId)
    await recargarDatos()
  }

  async function eliminarRegistro(tabla, id) {
    await servicioDatos.eliminarRegistro(tabla, id)
    await recargarDatos()
  }

  // Los usuarios se crean con procedimientos SQL para guardar la contraseña de forma protegida.
  async function crearUsuario(valores) {
    await servicioDatos.crearUsuario(valores)
    await recargarDatos()
  }

  async function actualizarUsuario(id, valores) {
    await servicioDatos.actualizarUsuario(id, valores)
    await recargarDatos()
  }

  // Registra la llegada de un bus, actualiza las listas y devuelve el resultado de capacidad.
  async function registrarRecorrido(valores) {
    const resultado = await servicioDatos.registrarRecorrido(valores)
    await recargarDatos()
    return resultado
  }

  // Cierra un recorrido pendiente cuando el bus sale de la estación y actualiza las listas.
  async function registrarSalidaRecorrido(recorridoId, horaSalida, observacionSalida) {
    await servicioDatos.registrarSalidaRecorrido(recorridoId, horaSalida, observacionSalida)
    await recargarDatos()
  }

  // Objeto que se comparte con todos los componentes que necesitan datos del sistema.
  const valor = {
    datos,
    cargandoDatos,
    errorDatos,
    supabaseConfigurado: servicioDatos.supabaseConfigurado,
    recargarDatos,
    crearRegistro,
    actualizarRegistro,
    asignarBusAPiloto,
    eliminarRegistro,
    crearUsuario,
    actualizarUsuario,
    registrarRecorrido,
    registrarSalidaRecorrido,
  }

  // Entrega los datos y funciones a los componentes que están dentro del proveedor.
  return <ContextoDatos.Provider value={valor}>{children}</ContextoDatos.Provider>
}
