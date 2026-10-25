import PEH from "./peh.js";
import { servicios, horarios } from "../data/veterinaria.js";

import { correoValido, errorTelefono, errorComuna, normalizarTelefono, errorNombrePersona } from "./datosCuenta.js";

export const camposReserva=["responsableNombre","responsableCorreo","responsableTelefono","responsableComuna","servicio","mascota","mascotaNombre","fecha","hora","observaciones"];
export function fechaLocal(fecha=new Date()) {
 return `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,"0")}-${String(fecha.getDate()).padStart(2,"0")}`;
}
export function fechaValida(valor,ahora=new Date()) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(valor || ""))return false;
 const [anio,mes,dia]=valor.split("-").map(Number);
 const comprobacion=new Date(anio,mes-1,dia);
 return comprobacion.getFullYear()===anio && comprobacion.getMonth()===mes-1 && comprobacion.getDate()===dia && valor>=fechaLocal(ahora);
}
export function horarioFuturo(fecha,hora,ahora=new Date()) {
 const cita=new Date(`${fecha}T${hora}:00`);
 return !Number.isNaN(cita.getTime()) && cita.getTime()>ahora.getTime();
}
// Reglas y mensajes de veterinaria.js, separados de la presentación de React.
export function validarCampoReserva(campo,datos,ahora=new Date()) {
 switch(campo) {
  case "responsableNombre": {
   const nombre=String(datos.responsableNombre || "").trim();
   return nombre.length>=3 && !errorNombrePersona(nombre) ? "" : "Escribe el nombre completo del responsable (entre 3 y 60 caracteres).";
  }
  case "responsableCorreo": return correoValido(datos.responsableCorreo) ? "" : "Escribe un correo válido con terminación .com o .cl.";
  case "responsableTelefono": return String(datos.responsableTelefono || "").trim() ? errorTelefono(datos.responsableTelefono) : "Escribe tu número de teléfono.";
  case "responsableComuna": return String(datos.responsableComuna || "").trim() ? errorComuna(datos.responsableComuna) : "Escribe la comuna donde vives.";
  case "servicio": return servicios.some(s=>s.id===datos.servicio) ? "" : "Selecciona un servicio veterinario válido.";
  case "mascota": return ["perro","gato"].includes(datos.mascota) ? "" : "Selecciona perro o gato para agendar.";
  case "mascotaNombre": {
   const nombre=String(datos.mascotaNombre || "").trim();
   if(nombre.length<2)return "Escribe el nombre de tu mascota (mínimo 2 caracteres).";
   if(nombre.length>50)return "El nombre no puede superar 50 caracteres.";
   return "";
  }
  case "fecha":
   if(!datos.fecha)return "Selecciona una fecha.";
   return fechaValida(datos.fecha,ahora) ? "" : "Selecciona una fecha válida desde hoy en adelante.";
  case "hora":
   if(!datos.hora)return "Selecciona una hora.";
   if(!horarios.includes(datos.hora))return "Selecciona una de las horas disponibles en la lista.";
   if(!datos.fecha || !fechaValida(datos.fecha,ahora))return "Primero selecciona una fecha válida.";
   return horarioFuturo(datos.fecha,datos.hora,ahora) ? "" : "La hora seleccionada ya pasó.";
  case "observaciones": {
   const texto=String(datos.observaciones || "").trim();
   if(texto.length===0)return "";
   if(texto.length<10)return "Escribe al menos 10 caracteres o deja el campo vacío.";
   if(texto.length>250)return "Las observaciones no pueden superar 250 caracteres.";
   return "";
  }
  default:return "";
 }
}
export function validarReserva(datos,ahora=new Date()) {
 return camposReserva.map(campo=>validarCampoReserva(campo,datos,ahora)).find(Boolean) || "";
}
export function fechaConfirmacion(valor) {
 const [anio,mes,dia]=valor.split("-").map(Number);
 return new Date(anio,mes-1,dia).toLocaleDateString("es-CL",{day:"numeric",month:"long",year:"numeric"});
}
export function registrarReserva(datos,ahora=new Date()) {
 let usuario;
 try { usuario=PEH.sesion.obtener(); } catch { return {ok:false,mensaje:"No pudimos comprobar tu sesión."}; }
 if(!usuario?.id || usuario.invitado)return {ok:false,mensaje:"Debes iniciar sesión con una cuenta para registrar una reserva."};
 const error=validarReserva(datos,ahora);
 if(error)return {ok:false,mensaje:error};
 const responsable={responsableNombre:String(datos.responsableNombre).trim(),responsableCorreo:String(datos.responsableCorreo).trim().toLowerCase(),responsableTelefono:normalizarTelefono(datos.responsableTelefono),responsableComuna:String(datos.responsableComuna).trim()};
 const reserva={...responsable,servicio:datos.servicio,servicioNombre:servicios.find(s=>s.id===datos.servicio)?.nombre || "",mascota:datos.mascota,mascotaTipo:datos.mascota,mascotaNombre:String(datos.mascotaNombre).trim(),fecha:datos.fecha,hora:datos.hora,observaciones:String(datos.observaciones || "").trim(),estado:"Pendiente"};
 try {
  const duplicada=PEH.reservas.listar(usuario.id).some(item=>!["cancelada","rechazada","anulada"].includes(String(item.estado || "").toLowerCase()) && item.usuarioId===usuario.id && item.fecha===reserva.fecha && item.hora===reserva.hora && String(item.mascotaNombre || "").trim().toLowerCase()===reserva.mascotaNombre.toLowerCase());
  if(duplicada)return {ok:false,mensaje:"Ya tienes una reserva para esta mascota en la misma fecha y hora."};
  const guardada=PEH.reservas.guardar({...reserva,usuarioId:usuario.id});
  return guardada ? {ok:true,reserva:{...reserva,...guardada}} : {ok:false,mensaje:"No pudimos guardar la reserva. Inténtalo nuevamente."};
 } catch { return {ok:false,mensaje:"Ocurrió un problema al guardar la reserva. Revisa la consola para más detalles."}; }
}

export const reservaVacia = Object.freeze(Object.fromEntries(camposReserva.map(c=>[c, ""])));
export function responsableInicialReserva() {
 const usuario=PEH.sesion.obtener();
 if(!usuario?.id || usuario.invitado)return {};
 const cuenta=PEH.cuentas.obtenerPorId(usuario.id) || {}, perfil=PEH.perfil.obtener();
 return {responsableNombre:perfil.nombre && perfil.nombre!==cuenta.nombre ? perfil.nombre : [cuenta.nombre,cuenta.apellido].filter(Boolean).join(" "),responsableCorreo:perfil.correo || cuenta.correo || "",responsableTelefono:perfil.telefono ?? cuenta.telefono ?? "",responsableComuna:perfil.comuna ?? cuenta.comuna ?? ""};
}
function claveBorradorReserva() {
 const usuario=PEH.sesion.obtener();
 return usuario?.id && !usuario.invitado ? "peh_borrador_veterinaria_v1:" + encodeURIComponent(usuario.id) : null;
}
export function leerBorradorReserva() {
 const clave=claveBorradorReserva();
 if(!clave)return null;
 try {
  const d=JSON.parse(localStorage.getItem(clave));
  if(!d || typeof d!=="object" || Array.isArray(d))return null;
  return Object.fromEntries(camposReserva.filter(c=>typeof d[c]==="string").map(c=>[c,d[c]]));
 } catch {return null;}
}
export function guardarBorradorReserva(datos) {
 const clave=claveBorradorReserva();if(!clave)return false;
 try {localStorage.setItem(clave,JSON.stringify(Object.fromEntries(camposReserva.map(c=>[c,String(datos[c] ?? "")]))));return true;}catch{return false;}
}
export function eliminarBorradorReserva() {
 const clave=claveBorradorReserva();if(!clave)return false;
 try {localStorage.removeItem(clave);return true;}catch{return false;}
}
export function datosInicialesReserva() {return {...reservaVacia,...responsableInicialReserva(),...(leerBorradorReserva() || {})};}
