// Hooks de React para guardar valores y cargarlos al abrir el formulario.
import { useEffect, useState } from 'react'
// Botón y hook comunes para evitar que el mismo formulario se guarde dos veces.
import { useAccionUnica } from '../ganchos/useAccionUnica.js'
import { BotonAccion } from './BotonAccion.jsx'

// Define el valor inicial de cada campo al crear o editar un registro.
function obtenerValorInicial(campo, registro) {
  if (campo.obtenerValorInicial) {
    return campo.obtenerValorInicial(registro) ?? ''
  }

  if (registro && registro[campo.nombre] !== undefined && registro[campo.nombre] !== null) {
    return registro[campo.nombre]
  }
  return campo.valorInicial ?? ''
}

// Devuelve las opciones del select; algunas dependen de otros campos del formulario.
function obtenerOpcionesCampo(campo, valores) {
  if (campo.obtenerOpciones) {
    return campo.obtenerOpciones(valores)
  }
  return campo.opciones || []
}

// Mantiene el teléfono con ocho dígitos y agrega el guion después del cuarto.
function formatearTelefono(valor) {
  const digitos = String(valor).replace(/\D/g, '').slice(0, 8)
  return digitos.length > 4 ? `${digitos.slice(0, 4)}-${digitos.slice(4)}` : digitos
}

// El DPI se guarda solo con sus trece dígitos, sin letras ni símbolos.
function formatearDpi(valor) {
  return String(valor).replace(/\D/g, '').slice(0, 13)
}

// Ordena la placa con una letra inicial, tres números y tres letras.
function formatearPlaca(valor) {
  const texto = String(valor).toUpperCase().replace(/[^A-Z0-9]/g, '')
  // La primera letra indica el tipo de placa, por ejemplo U o C.
  const prefijo = /^[A-Z]/.test(texto) ? texto.charAt(0) : ''
  const contenido = prefijo ? texto.slice(1) : texto
  const numeros = contenido.replace(/\D/g, '').slice(0, 3)
  const letras = contenido.replace(/[^A-Z]/g, '').slice(0, 3)

  // Une los grupos con espacios para mostrar un formato como U 421 ABF.
  return [prefijo, numeros, letras].filter(Boolean).join(' ')
}

// Aplica el formato indicado en la configuración de cada campo.
function aplicarFormato(campo, valor) {
  if (campo.formato === 'telefono') return formatearTelefono(valor)
  if (campo.formato === 'dpi') return formatearDpi(valor)
  if (campo.formato === 'placa') return formatearPlaca(valor)
  return valor
}

// Busca todos los campos que dependen de otro, incluso cuando la relacion viene en cadena.
// Esto mantiene consistente el formulario cuando un select depende de otro select.
function obtenerCamposDependientes(campos, nombreCampo) {
  const pendientes = [nombreCampo]
  const dependientes = []

  while (pendientes.length > 0) {
    const actual = pendientes.shift()

    campos.forEach((campo) => {
      if (campo.dependeDe === actual && !dependientes.includes(campo.nombre)) {
        dependientes.push(campo.nombre)
        pendientes.push(campo.nombre)
      }
    })
  }

  return dependientes
}

// Formulario reutilizable para crear o editar registros desde una ventana modal.
// Recibe la visibilidad, título, campos, registro, textos y funciones de guardar o cerrar.
export function FormularioModal({
  visible,
  titulo,
  campos,
  registro,
  textoBoton = 'Guardar',
  onCerrar,
  onGuardar,
}) {
  // valores guarda temporalmente lo escrito o seleccionado en cada campo.
  const [valores, setValores] = useState({})
  // procesando bloquea Guardar, Cancelar y Cerrar hasta terminar la operación.
  const { procesando, ejecutar } = useAccionUnica()

  // Cada vez que se abre el modal se cargan los datos iniciales.
  useEffect(() => {
    const iniciales = {}
    campos.forEach((campo) => {
      iniciales[campo.nombre] = aplicarFormato(campo, obtenerValorInicial(campo, registro))
    })
    setValores(iniciales)
  }, [campos, registro, visible])

  // El modal solo se renderiza cuando la pantalla lo solicita.
  if (!visible) return null

  // Actualiza el valor de un campo y limpia campos dependientes si corresponde.
  function cambiarValor(campoActual, valor) {
    const valorFormateado = aplicarFormato(campoActual, valor)

    setValores((actuales) => {
      const nuevosValores = { ...actuales, [campoActual.nombre]: valorFormateado }

      obtenerCamposDependientes(campos, campoActual.nombre).forEach((nombreCampo) => {
        nuevosValores[nombreCampo] = ''
      })

      return nuevosValores
    })
  }

  // Envía los datos una sola vez, aunque se presione Guardar rápidamente varias veces.
  async function enviarFormulario(evento) {
    evento.preventDefault()
    await ejecutar(() => onGuardar(valores))
  }

  return (
    // Fondo y contenedor principal del formulario modal.
    <div className="modal d-block modal-fondo" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <form className="modal-content" onSubmit={enviarFormulario}>
          <div className="modal-header">
            <h5 className="modal-title">{titulo}</h5>
            {/* No permite cerrar el modal mientras se guarda para no interrumpir el envío. */}
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={onCerrar}
              disabled={procesando}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              {/* Los campos se construyen con la configuración enviada por cada pantalla. */}
              {campos.map((campo) => (
                <div className={campo.columna || 'col-md-6'} key={campo.nombre}>
                  <label className={`form-label ${campo.requerido ? 'campo-obligatorio' : ''}`}>
                    {campo.etiqueta}
                  </label>
                  {/* Select, textarea e input usan clases de Bootstrap para mantener formularios simples. */}
                  {campo.tipo === 'select' ? (
                    <select
                      className="form-select"
                      value={valores[campo.nombre] ?? ''}
                      required={campo.requerido}
                      disabled={
                        campo.dependeDe &&
                        !valores[campo.dependeDe] &&
                        campo.bloquearSiDependenciaVacia !== false
                      }
                      onChange={(evento) => cambiarValor(campo, evento.target.value)}
                    >
                      <option value="">
                        {campo.dependeDe &&
                        !valores[campo.dependeDe] &&
                        campo.bloquearSiDependenciaVacia !== false
                          ? campo.mensajeDependencia || 'Seleccione primero el dato relacionado...'
                          : 'Seleccione...'}
                      </option>
                      {/* Las opciones pueden ser fijas o depender de otro campo elegido. */}
                      {obtenerOpcionesCampo(campo, valores).map((opcion) => (
                        <option key={opcion.valor} value={opcion.valor}>
                          {opcion.texto}
                        </option>
                      ))}
                    </select>
                  ) : campo.tipo === 'textarea' ? (
                    <textarea
                      className="form-control"
                      rows={campo.filas || 3}
                      value={valores[campo.nombre] ?? ''}
                      required={campo.requerido}
                      onChange={(evento) => cambiarValor(campo, evento.target.value)}
                    />
                  ) : (
                    <input
                      className="form-control"
                      type={campo.tipo || 'text'}
                      min={campo.min}
                      step={campo.step}
                      inputMode={campo.inputMode}
                      pattern={campo.patron}
                      maxLength={campo.longitudMaxima}
                      placeholder={campo.placeholder}
                      value={valores[campo.nombre] ?? ''}
                      required={campo.requerido}
                      onChange={(evento) => cambiarValor(campo, evento.target.value)}
                    />
                  )}
                  {campo.ayuda && <div className="form-text">{campo.ayuda}</div>}
                </div>
              ))}
            </div>
          </div>
          {/* Botones para cancelar o enviar los datos capturados. */}
          <div className="modal-footer">
            {/* Cancelar también queda bloqueado hasta que el guardado termine. */}
            <button type="button" className="btn btn-outline-secondary" onClick={onCerrar} disabled={procesando}>
              Cancelar
            </button>
            <BotonAccion type="submit" texto={textoBoton} procesando={procesando} />
          </div>
        </form>
      </div>
    </div>
  )
}
