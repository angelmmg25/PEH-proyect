/* Cuenta, preferencias e historiales presentados en Perfil.
 * Las reglas y los datos compartidos se obtienen de global.js.
 */
import PEH, { errorNombrePersona } from './global.js';

export function estadoAdopcion(estado){const valor=String(estado||"Pendiente").trim().toLowerCase();const estados={pendiente:["Pendiente","pendiente"],"en revisión":["En revisión","revision"],"en revision":["En revisión","revision"],aprobada:["Aprobada","aprobada"],rechazada:["Rechazada","rechazada"],completada:["Completada","completada"],cancelada:["Cancelada","cancelada"]};const [texto,clase]=estados[valor]||[estado||"Pendiente","pendiente"];return {texto,clase};}

export function fechaSolicitud(fecha){if(!fecha)return "Fecha no disponible";const d=new Date(fecha);return Number.isNaN(d.getTime())?"Fecha no disponible":d.toLocaleDateString("es-CL",{day:"2-digit",month:"long",year:"numeric"});}
export function fechaReserva(fecha){return fecha?fechaSolicitud(`${fecha}T12:00:00`):"Fecha no disponible";}
export function fechaHora(reserva){if(reserva?.instanteCita){const fecha=new Date(reserva.instanteCita);return Number.isNaN(fecha.getTime())?null:fecha;}if(!reserva?.fecha||!reserva?.hora)return null;const d=new Date(`${reserva.fecha}T${reserva.hora}`);return Number.isNaN(d.getTime())?null:d;}
export async function guardarPerfil(datos) {
 const actual=PEH.sesion.obtener();
 if(!actual || actual.invitado)throw new Error('Inicia sesión para editar tu cuenta.');
 const nombre=String(datos.nombre||'').trim(),apellido=String(datos.apellido||'').trim();
 const error=errorNombrePersona(nombre,30)||errorNombrePersona(apellido,30);
 if(error)throw new Error(error);
 const foto=String(datos.foto||'').trim();
 if(foto && !/^\/img\/[A-Za-z0-9_./-]+$/.test(foto)){
  let url;try{url=new URL(foto);}catch{throw new Error('Usa una URL HTTPS o una ruta /img/ para la fotografía.');}
  if(url.protocol!=='https:')throw new Error('Usa una URL HTTPS o una ruta /img/ para la fotografía.');
 }
 const r=PEH.cuentas.actualizarPerfil({nombre,apellido,foto,correo:datos.correo,telefono:datos.telefono,comuna:datos.comuna});
 if(!r.ok)throw new Error(r.mensaje);
 return PEH.sesion.obtener();
}
export async function leerPreferencias() {
 if(!PEH.sesion.obtener() || PEH.sesion.obtener().invitado)throw new Error('Inicia sesión para consultar tus preferencias.');
 return {notificaciones:PEH.preferencias.notificaciones(),adopcion:PEH.preferencias.adopcion()};
}
export async function guardarPreferencias(datos) {
 const s=PEH.sesion.obtener();if(!s||s.invitado)throw new Error('Inicia sesión para guardar tus preferencias.');
 const anterior={notificaciones:PEH.preferencias.notificaciones(),adopcion:PEH.preferencias.adopcion()};
 if(!PEH.preferencias.guardarNotificaciones(datos.notificaciones))throw new Error('No pudimos guardar tus preferencias.');
 if(!PEH.preferencias.guardarAdopcion(datos.adopcion)){
  PEH.preferencias.guardarNotificaciones(anterior.notificaciones);
  throw new Error('No pudimos guardar tus preferencias.');
 }
 return leerPreferencias();
}
export async function cambiarContrasena(actual,nueva,confirmar) {
 if(new TextEncoder().encode(nueva).length>72)throw new Error('La contraseña no puede superar 72 bytes.');
 const resultado=await PEH.cuentas.cambiarContrasena(actual,nueva,confirmar);
 if(!resultado.ok)throw new Error(resultado.mensaje);
 if(!PEH.sesion.cerrar())throw new Error('La contraseña cambió, pero no pudimos cerrar la sesión.');
 window.alert('Contraseña actualizada. Inicia sesión con tu nueva contraseña.');
}

// Orden de presentación: fecha de registro, sin modificar los datos almacenados.
export function ordenarPorRegistroReciente(registros) {
 const instante = r => Date.parse(r.fechaCreacion || r.fechaRegistro || '') || 0;
 return [...registros].sort((a,b)=>instante(b)-instante(a));
}

// Dates on the summary describe the current state event. Missing historical dates
// are shown explicitly rather than invented from the appointment or another edit.
export function eventoHistorial(registro,tipo) {
 const estado=String(registro.estado||'Pendiente');
 const etiquetas={Pendiente:'envío','En revisión':'revisión',Aprobada:'aprobación',Rechazada:'rechazo',Completada:'finalización',Respondida:'respuesta',Cerrada:'cierre',Cancelada:'cancelación'};
 let evento=etiquetas[estado]||'actualización',instante=registro.fechaEstado||null;
 const historial=registro.historialCambios||[];
 let ultimo=-1;
 for(let i=historial.length-1;i>=0;i--)if(historial[i].estado===estado){ultimo=i;break;}
 if(!instante&&ultimo>=0){while(ultimo>0&&historial[ultimo-1].estado===estado)ultimo--;instante=historial[ultimo].fechaCreacion;}
 if(estado==='Pendiente'){evento='envío';instante=registro.fechaCreacion;}
 if(tipo==='reservas'&&['Pendiente','Confirmada'].includes(estado)){evento='reserva';instante=registro.fechaCreacion;}
 if(tipo==='consultas'&&estado==='Respondida'&&!instante)instante=registro.respuestas?.at(-1)?.fechaCreacion;
 let fecha='No registrada',hora='No registrada';
 const d=instante?new Date(instante):null;
 if(d&&!Number.isNaN(d.getTime())){
  fecha=d.toLocaleDateString('es-CL',{day:'2-digit',month:'long',year:'numeric',timeZone:'America/Santiago'});
  hora=d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'America/Santiago'})+' hrs';
 }
 if(tipo==='reservas'&&['Cerrada','Completada'].includes(estado)){
  evento='atención';
  const dia=registro.fechaAtencion||registro.fecha;
  fecha=dia?fechaReserva(dia):'No registrada';
  hora=registro.horaTermino?registro.horaTermino+' hrs':'No registrada';
 }
 return {fecha,hora,etiquetaFecha:'Fecha de '+evento,etiquetaHora:tipo==='reservas'&&['Cerrada','Completada'].includes(estado)?'Hora de término':tipo==='reservas'&&evento==='reserva'?'Hora de registro':'Hora de '+evento};
}
export function mensajeHistorial(registro,tipo,ahora=new Date()) {
 const estado=registro.estado||'Pendiente';
 if(tipo==='reservas'){
  if(['Cerrada','Completada'].includes(estado))return 'La atención veterinaria finalizó. Revisa la conclusión y las recomendaciones en los detalles.';
  if(estado==='Cancelada')return 'Esta reserva fue cancelada y permanece registrada en tu historial.';
  if(estado==='Rechazada')return 'Esta reserva fue rechazada. Puedes revisar las observaciones en los detalles.';
  if(fechaHora(registro)&&fechaHora(registro)<ahora)return 'La fecha de esta reserva ya pasó. Su estado administrativo sigue pendiente de actualización.';
  return 'Tu reserva fue registrada correctamente. Revisa en los detalles la fecha y hora de atención.';
 }
 const mensajes=tipo==='adopciones'?{
  Pendiente:'Tu solicitud fue recibida y está pendiente de revisión.', 'En revisión':'Estamos revisando tu solicitud de adopción.',
  Aprobada:'Tu solicitud fue aprobada. Revisa los detalles y las indicaciones de PEH.',Rechazada:'Tu solicitud no fue aprobada. Revisa las observaciones en los detalles.',
  Completada:'El proceso de adopción finalizó. Puedes revisar sus detalles e historial.',Cancelada:'Esta solicitud fue cancelada y permanece en tu historial.'
 }:{Pendiente:'Tu consulta fue recibida y está pendiente de revisión.','En revisión':'El equipo de PEH está revisando tu consulta.',Respondida:'Tu consulta ya tiene una respuesta del equipo de PEH.',Cerrada:'Esta consulta fue cerrada. Puedes revisar sus respuestas e historial.',Cancelada:'Esta consulta fue cancelada y permanece en tu historial.'};
 return mensajes[estado]||'Revisa los detalles y el historial de este proceso.';
}
