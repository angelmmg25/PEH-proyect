/* Formulario y operaciones de las consultas de Contacto.
 * Las reglas y los datos compartidos se obtienen de global.js.
 */
import { nombresMotivos } from '../data/global.js';
import PEH, { correoValido, errorNombrePersona } from './global.js';


import { contactoVacio } from '../data/contacto.js';

// Datos del responsable de la consulta; nunca se utiliza su nombre de usuario.
export function datosInicialesContacto() {
  const usuario = PEH.sesion.obtener();
  if (usuario?.origen === 'local') {
    return {...contactoVacio, nombre:[usuario.nombre, usuario.apellido].filter(Boolean).join(" "), correo:usuario.correo || ""};
  }
  const cuenta = usuario && !usuario.invitado ? PEH.cuentas.obtenerPorId(usuario.id) : null;
  const perfil = PEH.perfil.obtener();
  return {
    ...contactoVacio,
    nombre:cuenta ? (perfil.nombre || [cuenta.nombre, cuenta.apellido].filter(Boolean).join(" ")) : "",
    correo:cuenta ? (perfil.correo || cuenta.correo) : ""
  };
}

import { camposContacto } from '../data/contacto.js';
export { camposContacto } from '../data/contacto.js';
export const CLAVE_CONSULTAS_CONTACTO = "peh_consultas_contacto";

export function validarContacto(datos) {
  const nombre = String(datos.nombre || "").trim();
  const correo = String(datos.correo || "").trim();
  const asunto = String(datos.asunto || "").trim();
  const mensaje = String(datos.mensaje || "").trim();
  return {
    nombre: !nombre ? "Ingresa tu nombre." : errorNombrePersona(nombre) ? errorNombrePersona(nombre) : nombre.length < 3 ? "El nombre debe tener al menos 3 caracteres." : nombre.length > 60 ? "El nombre no puede superar 60 caracteres." : "",
    correo: !correo ? "Ingresa tu correo electrónico." : correo.length > 100 || !correoValido(correo) ? "Ingresa un correo electrónico válido." : "",
    motivo: !datos.motivo ? "Selecciona un motivo de contacto." : !Object.keys(nombresMotivos).includes(datos.motivo) ? "Selecciona un motivo válido." : "",
    asunto: !asunto ? "Ingresa un asunto." : asunto.length < 4 ? "El asunto es demasiado corto." : asunto.length > 80 ? "El asunto no puede superar 80 caracteres." : "",
    mensaje: !mensaje ? "Escribe tu mensaje." : mensaje.length < 10 ? "Cuéntanos un poco más sobre tu consulta." : mensaje.length > 500 ? "El mensaje no puede superar 500 caracteres." : ""
  };
}

// Persistencia de demostración en este navegador; no envía correos ni usa un servidor.
export function registrarConsulta(datos) {
  const errores = validarContacto(datos);
  const error = camposContacto.map(campo => errores[campo]).find(Boolean);
  if (error) return { ok: false, mensaje: error };

  return PEH.consultas.registrar(datos);
}

export async function listarMisConsultas() {
 return PEH.consultas.listar().map(c=>({...c,respuestas:Array.isArray(c.respuestas)?c.respuestas:[]}));
}

export async function cancelarMiConsulta(id){return PEH.consultas.cancelar(id);}
