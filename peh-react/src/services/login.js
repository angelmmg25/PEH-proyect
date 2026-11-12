/* Acceso, registro y validación de los campos de Login.
 * Las reglas y los datos compartidos se obtienen de global.js.
 */
import PEH, { obtenerSesion, emitirSesion, errorTelefono, errorComuna, correoValido, edadDesdeFecha } from './global.js';
export { obtenerSesion, cerrarSesionLocal, limpiarSesion, tieneSesion, verificarSesion, EVENTO_SESION } from './global.js';
export default PEH;

/* Operaciones de inicio, registro y acceso de invitado. */
export async function iniciarSesion(correo, contrasena) {
  const r = await PEH.cuentas.iniciarSesion(correo, contrasena);
  if (!r.ok) throw new Error(r.mensaje);
  emitirSesion(); return obtenerSesion();
}

export function iniciarSesionInvitado() {
  const id = PEH.leer("peh_invitado_id", null) || PEH.id("INV");
  PEH.escribir("peh_invitado_id", id);
  if (!PEH.sesion.iniciar({id, nombre:"Invitado", correo:"", invitado:true})) {
    throw new Error("No se pudo iniciar el modo invitado.");
  }
  return PEH.sesion.obtener();
}

export async function registrarCuenta(datos) {
  const campos = ['nombre','apellido','usuario','correo','contrasena','fechaNacimiento','telefono','comuna'];
  const r = await PEH.cuentas.registrar(Object.fromEntries(campos.map(k => [k, datos[k]])));
  if (!r.ok) throw new Error(r.mensaje);
  return r.cuenta;
}



export { camposInicio } from '../data/login.js';
export { camposRegistro } from '../data/login.js';

const expresionNombre = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const expresionUsuario = /^[A-Za-z0-9_]{4,16}$/;
const expresionContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;
const mensajeCorreo = "Usa un correo de terminación .com o .cl, como duocuc.cl o profesor.duocuc.cl.";

// Las reglas de estos dos campos son iguales; sus mensajes siguen siendo específicos.
function validarNombre(valor, apellido = false) {
  const nombre = valor.trim();
  const sujeto = apellido ? "apellido" : "nombre";
  if (!nombre) return `El ${sujeto} es obligatorio.`;
  if (nombre.length > 30) return "El máximo es de 30 caracteres.";
  if (!expresionNombre.test(nombre)) return `El ${sujeto} solo puede contener letras, espacios, apóstrofes o guiones.`;
  if ((nombre.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length < 2) return `El ${sujeto} debe contener como mínimo 2 letras.`;
  return "";
}

// Recibe valores de React y devuelve un mensaje; no construye controles simulados.
export function validarAcceso(id, valores) {
  if (id === "telefonoRegistro") return errorTelefono(valores[id]);
  if (id === "comunaRegistro") return errorComuna(valores[id]);
  const valor = valores[id] || "";
  switch (id) {
    case "correo":
    case "correoRegistro": {
      const correo = valor.trim();
      if (!correo) return id === "correo" ? "Ingresa tu correo electrónico." : "El correo electrónico es obligatorio.";
      return correoValido(correo) ? "" : mensajeCorreo;
    }
    case "contrasena":
      if (!valor) return "Ingresa tu contraseña.";
      return valor.length < 4 ? "La contraseña debe tener al menos 4 caracteres." : "";
    case "nombreRegistro":
      return validarNombre(valor);
    case "apellidoRegistro":
      return validarNombre(valor, true);
    case "usuarioRegistro": {
      const usuario = valor.trim();
      if (!usuario) return "El nombre de usuario es obligatorio.";
      return expresionUsuario.test(usuario) ? "" : "Usa entre 4 y 16 caracteres: letras, números o guion bajo.";
    }
    case "fechaNacimientoRegistro": {
      if (!valor) return "Selecciona tu fecha de nacimiento.";
      const edad = edadDesdeFecha(valor);
      if (edad < 0) return "La fecha de nacimiento no es válida.";
      if (edad > 120) return "La edad máxima permitida es de 120 años.";
      return edad < 13 ? "Debes tener mínimo 13 años para registrarte." : "";
    }
    case "contrasenaRegistro":
      if (!valor) return "La contraseña es obligatoria.";
      return expresionContrasena.test(valor) ? "" : "Debe tener 8 caracteres o más e incluir mayúscula, minúscula, número y carácter especial.";
    case "confirmarContrasenaRegistro":
      if (!valor) return "Repite tu contraseña.";
      return valor === (valores.contrasenaRegistro || "") ? "" : "Las contraseñas no coinciden.";
    case "terminosRegistro":
      return valores[id] ? "" : "Debes aceptar el compromiso de participación responsable.";
    default:
      throw new TypeError(`Campo de acceso desconocido: ${id}`);
  }
}
