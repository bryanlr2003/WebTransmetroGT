// Pantalla genérica para crear, editar y eliminar los catálogos administrativos.

// Hooks de React para guardar estados y recalcular la configuración del catálogo.
import { useMemo, useState } from 'react'
// Componentes que muestran el formulario, los mensajes y la tabla de registros.
import { FiltroMunicipalidad } from '../../componentes/FiltroMunicipalidad.jsx'
import { FormularioModal } from '../../componentes/FormularioModal.jsx'
import { MensajeEstado } from '../../componentes/MensajeEstado.jsx'
import { TablaDatos } from '../../componentes/TablaDatos.jsx'
// Operaciones de datos disponibles para los catálogos.
import { useDatos } from '../../ganchos/useDatos.js'
// Configuración central que cambia los campos según el catálogo solicitado.
import { obtenerConfiguracionCatalogo } from '../../utilidades/configuracionCatalogos.jsx'
// Función reutilizable para conocer la municipalidad aun cuando viene por una relación.
import { obtenerMunicipalidadRegistro } from '../../utilidades/selectoresDatos.js'

// Convierte los valores del formulario al formato que espera Supabase.
function normalizarValores(campos, valores, esOperador = false) {
  const resultado = {}

  campos.forEach((campo) => {
    // Los campos virtuales solo sirven para filtros visuales y no se guardan.
    if (campo.virtual) {
      return
    }

    let valor = valores[campo.nombre]

    if (valor === '') {
      valor = null
    }

    // Los inputs numéricos llegan como texto desde HTML y se convierten a número.
    if (campo.tipo === 'number' && valor !== null) {
      valor = Number(valor)
    }

    // Los identificadores relacionados también deben guardarse como número.
    if (campo.tipo === 'select' && valor !== null && campo.nombre.endsWith('_id')) {
      valor = Number(valor)
    }

    // Si se edita un usuario y no se escribe contraseña, se conserva la anterior.
    if (campo.nombre === 'contrasena' && !valor) {
      return
    }

    resultado[campo.nombre] = valor
  })

  // El catálogo Operadores usa la tabla usuarios, por eso se agrega el rol.
  if (esOperador) {
    resultado.rol = 'operador'
  }

  return resultado
}

export function PaginaCatalogo({ tipo }) {
  // Funciones compartidas para consultar, crear, editar o eliminar registros del catálogo.
  const {
    datos,
    cargandoDatos,
    errorDatos,
    crearRegistro,
    actualizarRegistro,
    eliminarRegistro,
    crearUsuario,
    actualizarUsuario,
  } = useDatos()
  // Estados de la pantalla: apertura del modal, registro elegido y mensajes para el usuario.
  const [modalVisible, setModalVisible] = useState(false)
  const [registroEditando, setRegistroEditando] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  // Guarda la municipalidad elegida para consultar solo los registros relacionados.
  const [municipalidadSeleccionada, setMunicipalidadSeleccionada] = useState('')

  // La configuración define campos, columnas y tabla según el catálogo abierto.
  const configuracion = useMemo(
    () => obtenerConfiguracionCatalogo(tipo, datos),
    [tipo, datos],
  )

  // Combina filtros propios, por ejemplo operadores, con el filtro reutilizable de municipalidad.
  const registros = useMemo(() => {
    const lista = datos[configuracion.tabla] || []
    const listaBase = configuracion.filtrar ? configuracion.filtrar(lista) : lista

    // Si no hay municipio elegido, se conservan todos los registros del catálogo.
    if (!configuracion.permiteFiltroMunicipalidad || !municipalidadSeleccionada) {
      return listaBase
    }

    // Compara la municipalidad directa o derivada de cada registro sin modificar la base.
    return listaBase.filter(
      (registro) => Number(obtenerMunicipalidadRegistro(tipo, registro, datos)) === Number(municipalidadSeleccionada),
    )
  }, [datos, configuracion, municipalidadSeleccionada, tipo])

  // Limpia la selección anterior y abre el formulario para crear un registro nuevo.
  function abrirNuevo() {
    setRegistroEditando(null)
    setMensaje('')
    setError('')
    setModalVisible(true)
  }

  // Guarda el registro elegido para que el mismo formulario permita editarlo.
  function abrirEdicion(registro) {
    setRegistroEditando(registro)
    setMensaje('')
    setError('')
    setModalVisible(true)
  }

  // Guarda creando o actualizando, según si el modal está en modo edición.
  async function guardar(valores) {
    try {
      const esOperador = tipo === 'operadores'
      const datosFormulario = normalizarValores(configuracion.campos, valores, esOperador)

      if (esOperador && registroEditando) {
        await actualizarUsuario(registroEditando.id, datosFormulario)
      } else if (esOperador) {
        await crearUsuario(datosFormulario)
      } else if (registroEditando) {
        await actualizarRegistro(configuracion.tabla, registroEditando.id, datosFormulario)
      } else {
        await crearRegistro(configuracion.tabla, datosFormulario)
      }

      setMensaje('Registro guardado correctamente.')
      setModalVisible(false)
    } catch (err) {
      setError(err.message)
    }
  }

  // Confirmación básica para evitar eliminar registros por error.
  async function eliminar(registro) {
    const confirmado = window.confirm('¿Desea eliminar este registro?')
    if (!confirmado) return

    try {
      await eliminarRegistro(configuracion.tabla, registro.id)
      setMensaje('Registro eliminado correctamente.')
    } catch (err) {
      setError(err.message)
    }
  }

  if (!configuracion) return null

  // Encabezado, tabla y modal compartidos por todos los catálogos.
  return (
    <section>
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
        <div>
          <h1 className="titulo-seccion mb-1">{configuracion.titulo}</h1>
          <p className="texto-suave">{configuracion.descripcion}</p>
        </div>
        <div>
          <button className="btn btn-primario" type="button" onClick={abrirNuevo}>
            <i className="bi bi-plus-lg me-1"></i>
            Nuevo registro
          </button>
        </div>
      </div>

      <MensajeEstado tipo="danger">{error || errorDatos}</MensajeEstado>
      <MensajeEstado tipo="success">{mensaje}</MensajeEstado>

      {/* Se muestra solo en catálogos que tienen una relación real con municipalidades. */}
      {configuracion.permiteFiltroMunicipalidad && (
        <FiltroMunicipalidad
          municipalidades={datos.municipalidades || []}
          valor={municipalidadSeleccionada}
          onChange={setMunicipalidadSeleccionada}
          id={`filtro-municipalidad-${tipo}`}
        />
      )}

      <div className="tarjeta-panel">
        {/* La tabla usa acciones separadas para editar o pedir confirmación antes de eliminar. */}
        {cargandoDatos ? (
          <div className="p-4 text-center texto-suave">Cargando información...</div>
        ) : (
          <TablaDatos
            columnas={configuracion.columnas}
            datos={registros}
            acciones={(registro) => (
              <div className="btn-group btn-group-sm">
                <button className="btn btn-outline-primary" type="button" onClick={() => abrirEdicion(registro)}>
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button className="btn btn-outline-danger" type="button" onClick={() => eliminar(registro)}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            )}
          />
        )}
      </div>

      {/* El formulario compartido bloquea Guardar hasta que termine la operación para no duplicar registros. */}
      <FormularioModal
        visible={modalVisible}
        titulo={registroEditando ? `Editar ${configuracion.titulo}` : `Nuevo ${configuracion.titulo}`}
        campos={configuracion.campos}
        registro={registroEditando}
        onCerrar={() => setModalVisible(false)}
        onGuardar={guardar}
      />
    </section>
  )
}
