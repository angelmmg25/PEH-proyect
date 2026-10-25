import {correoValido,errorNombrePersona} from "./datosCuenta.js";
import PEH from "./peh.js";

export const camposContacto = ["nombre", "correo", "motivo", "asunto", "mensaje"];
export const CLAVE_CONSULTAS_CONTACTO = "peh_consultas_contacto";

export function validarContacto(datos) {
  const nombre = String(datos.nombre || "").trim();
  const correo = String(datos.correo || "").trim();
  const asunto = String(datos.asunto || "").trim();
  const mensaje = String(datos.mensaje || "").trim();
  return {
    nombre: !nombre ? "Ingresa tu nombre." : errorNombrePersona(nombre) ? errorNombrePersona(nombre) : nombre.length < 3 ? "El nombre debe tener al menos 3 caracteres." : nombre.length > 60 ? "El nombre no puede superar 60 caracteres." : "",
    correo: !correo ? "Ingresa tu correo electrónico." : correo.length > 100 || !correoValido(correo) ? "Ingresa un correo electrónico válido." : "",
    motivo: !datos.motivo ? "Selecciona un motivo de contacto." : !["adopcion", "veterinaria", "soporte", "otro"].includes(datos.motivo) ? "Selecciona un motivo válido." : "",
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
