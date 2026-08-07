import { useCallback, useEffect, useState } from 'react'
import { servicioDatos } from '../servicios/servicioDatos.js'
import { ContextoDatos } from './contextosBase.js'

export function ProveedorDatos({ children }) {
  // Estado general con la informacion consultada desde la base de datos.
  const [datos, setDatos] = useState({})
  const [cargandoDatos, setCargandoDatos] = useState(true)
  const [errorDatos, setErrorDatos] = useState('')

  // Trae nuevamente todos los catalogos y registros usados por la aplicacion.
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

  // Primera carga de datos al iniciar la aplicacion.
  useEffect(() => {
    recargarDatos()
  }, [recargarDatos])

  // Funciones reutilizadas por los catalogos del administrador.
  async function crearRegistro(tabla, valores) {
    await servicioDatos.crearRegistro(tabla, valores)
    await recargarDatos()
  }

  async function actualizarRegistro(tabla, id, valores) {
    await servicioDatos.actualizarRegistro(tabla, id, valores)
    await recargarDatos()
  }

  async function eliminarRegistro(tabla, id) {
    await servicioDatos.eliminarRegistro(tabla, id)
    await recargarDatos()
  }

  // Los usuarios se crean con procedimientos SQL para guardar la contrasena de forma protegida.
  async function crearUsuario(valores) {
    await servicioDatos.crearUsuario(valores)
    await recargarDatos()
  }

  async function actualizarUsuario(id, valores) {
    await servicioDatos.actualizarUsuario(id, valores)
    await recargarDatos()
  }

  // Registra la llegada de un bus y devuelve el resultado de capacidad.
  async function registrarRecorrido(valores) {
    const resultado = await servicioDatos.registrarRecorrido(valores)
    await recargarDatos()
    return resultado
  }

  // Cierra un recorrido pendiente cuando el bus sale de la estacion.
  async function registrarSalidaRecorrido(recorridoId, horaSalida, observacionSalida) {
    await servicioDatos.registrarSalidaRecorrido(recorridoId, horaSalida, observacionSalida)
    await recargarDatos()
  }

  const valor = {
    datos,
    cargandoDatos,
    errorDatos,
    supabaseConfigurado: servicioDatos.supabaseConfigurado,
    recargarDatos,
    crearRegistro,
    actualizarRegistro,
    eliminarRegistro,
    crearUsuario,
    actualizarUsuario,
    registrarRecorrido,
    registrarSalidaRecorrido,
  }

  return <ContextoDatos.Provider value={valor}>{children}</ContextoDatos.Provider>
}
