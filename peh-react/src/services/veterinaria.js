/* Validación, horarios y reservas de la vista Veterinaria.
 * Las reglas y los datos compartidos se obtienen de global.js.
 */
import PEH, { fechaLocal, horarioFuturo, instanteCitaChile, claveBorrador, leerBorrador, guardarBorrador, borrarBorrador, correoValido, errorTelefono, errorComuna, normalizarTelefono, errorNombrePersona } from './global.js';
// Se conserva la interfaz usada por las vistas y pruebas de Veterinaria.
export { momentoChile, fechaLocal, horarioFuturo, instanteCitaChile } from './global.js';


import { servicios } from '../data/veterinaria.js';
import { horarios } from '../data/global.js';



import { camposReserva } from '../data/veterinaria.js';
export { camposReserva } from '../data/veterinaria.js';
export function fechaValida(valor,ahora=new Date()) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(valor || ''))return false;
 const [anio,mes,dia]=valor.split('-').map(Number), comprobacion=new Date(Date.UTC(anio,mes-1,dia));
 return comprobacion.getUTCFullYear()===anio && comprobacion.getUTCMonth()===mes-1 && comprobacion.getUTCDate()===dia && valor>=fechaLocal(ahora);
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
 const reserva={...responsable,servicio:datos.servicio,servicioNombre:servicios.find(s=>s.id===datos.servicio)?.nombre || "",mascota:datos.mascota,mascotaTipo:datos.mascota,mascotaNombre:String(datos.mascotaNombre).trim(),fecha:datos.fecha,hora:datos.hora,observaciones:String(datos.observaciones || "").trim(),estado:"Confirmada"};
 try {
  const duplicada=PEH.reservas.listar(usuario.id).some(item=>!["cancelada","rechazada","anulada"].includes(String(item.estado || "").toLowerCase()) && item.usuarioId===usuario.id && item.fecha===reserva.fecha && item.hora===reserva.hora && String(item.mascotaNombre || "").trim().toLowerCase()===reserva.mascotaNombre.toLowerCase());
  if(duplicada)return {ok:false,mensaje:"Ya tienes una reserva para esta mascota en la misma fecha y hora."};
  const guardada=PEH.reservas.guardar({...reserva,usuarioId:usuario.id});
  return guardada ? {ok:true,reserva:{...reserva,...guardada}} : {ok:false,mensaje:"No pudimos guardar la reserva. Inténtalo nuevamente."};
 } catch { return {ok:false,mensaje:"Ocurrió un problema al guardar la reserva. Revisa la consola para más detalles."}; }
}

import { reservaVacia } from '../data/veterinaria.js';
export { reservaVacia } from '../data/veterinaria.js';
export function responsableInicialReserva() {
 const usuario=PEH.sesion.obtener();
 if(!usuario?.id || usuario.invitado)return {};
 const cuenta=usuario.origen === "local" ? usuario : PEH.cuentas.obtenerPorId(usuario.id) || {}, perfil=usuario.origen === "local" ? {} : PEH.perfil.obtener();
 return {responsableNombre:perfil.nombre && perfil.nombre!==cuenta.nombre ? perfil.nombre : [cuenta.nombre,cuenta.apellido].filter(Boolean).join(" "),responsableCorreo:perfil.correo || cuenta.correo || "",responsableTelefono:perfil.telefono ?? cuenta.telefono ?? "",responsableComuna:perfil.comuna ?? cuenta.comuna ?? ""};
}
// Adaptador de los campos veterinarios sobre la persistencia compartida de borradores.
export function leerBorradorReserva() {
 const datos = leerBorrador(claveBorrador("veterinaria"));
 if (!datos || typeof datos !== "object" || Array.isArray(datos)) return null;
 return Object.fromEntries(camposReserva.filter(campo => typeof datos[campo] === "string").map(campo => [campo, datos[campo]]));
}
export function guardarBorradorReserva(datos) {
 const campos = Object.fromEntries(camposReserva.map(campo => [campo, String(datos[campo] ?? "")]));
 return guardarBorrador(claveBorrador("veterinaria"), campos);
}
export function eliminarBorradorReserva() {
 return borrarBorrador(claveBorrador("veterinaria"));
}
export function datosInicialesReserva() {return {...reservaVacia,...responsableInicialReserva(),...(leerBorradorReserva() || {})};}

export function normalizarReserva(d) {
 const hora=String(d.hora||'').slice(0,5),instante=instanteCitaChile(d.fecha,hora);
 return {...d,hora,servicioNombre:servicios.find(s=>s.id===d.servicio)?.nombre||d.servicioNombre,mascotaTipo:d.mascota,instanteCita:instante?.toISOString(),historialCambios:Array.isArray(d.historialCambios)?d.historialCambios:[]};
}
export async function listarMisReservas() { return PEH.reservas.listar().map(normalizarReserva); }
export async function cancelarMiReserva(id) {
 const r=PEH.reservas.obtener(id);
 if(!r)throw new Error('La reserva no está disponible para tu cuenta.');
 if(!['Pendiente','Confirmada'].includes(r.estado))throw new Error('Esta reserva ya finalizó.');
 const cambios={estado:'Cancelada',fechaEstado:new Date().toISOString(),historialCambios:[...(r.historialCambios||[]),{estado:'Cancelada',fechaCreacion:new Date().toISOString()}]};
 if(!PEH.reservas.actualizar(id,cambios))throw new Error('No pudimos cancelar la reserva.');
 return normalizarReserva(PEH.reservas.obtener(id));
}
