import PEH from "./peh.js";
import { servicios } from "../data/veterinaria.js";

export const camposReserva=["servicio","mascota","mascotaNombre","fecha","hora","observaciones"];
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
  case "servicio": return datos.servicio ? "" : "Selecciona un servicio veterinario.";
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
 const error=validarReserva(datos,ahora);
 if(error)return {ok:false,mensaje:error};
 let usuario;
 try { usuario=PEH.sesion.obtener(); } catch { return {ok:false,mensaje:"No pudimos comprobar tu sesión."}; }
 if(!usuario?.id || usuario.invitado)return {ok:false,mensaje:"Debes iniciar sesión con una cuenta para registrar una reserva."};
 const reserva={servicio:datos.servicio,servicioNombre:servicios.find(s=>s.id===datos.servicio)?.nombre || "",mascota:datos.mascota,mascotaTipo:datos.mascota,mascotaNombre:String(datos.mascotaNombre).trim(),fecha:datos.fecha,hora:datos.hora,observaciones:String(datos.observaciones || "").trim(),estado:"Pendiente"};
 try {
  const duplicada=PEH.reservas.listar(usuario.id).some(item=>!["cancelada","rechazada","anulada"].includes(String(item.estado || "").toLowerCase()) && item.usuarioId===usuario.id && item.fecha===reserva.fecha && item.hora===reserva.hora && String(item.mascotaNombre || "").trim().toLowerCase()===reserva.mascotaNombre.toLowerCase());
  if(duplicada)return {ok:false,mensaje:"Ya tienes una reserva para esta mascota en la misma fecha y hora."};
  const guardada=PEH.reservas.guardar({...reserva,usuarioId:usuario.id});
  return guardada ? {ok:true,reserva:{...reserva,...guardada}} : {ok:false,mensaje:"No pudimos guardar la reserva. Inténtalo nuevamente."};
 } catch { return {ok:false,mensaje:"Ocurrió un problema al guardar la reserva. Revisa la consola para más detalles."}; }
}
