import useValidacionFormulario from "../hooks/useValidacionFormulario.jsx";
import useBorrador, { AvisoBorrador } from "../hooks/useBorrador.jsx";
import { useEffect, useRef, useState } from "react";
import PEH from "../services/peh";
const camposAdopcion=[
 ["tipoAnimal","preferenciaAnimal","Tipo de animal",[["","Sin preferencia"],["perro","Perro"],["gato","Gato"]]],
 ["tamano","preferenciaTamano","Tamaño",[["","Sin preferencia"],["pequeno","Pequeño"],["mediano","Mediano"],["grande","Grande"]]],
 ["vivienda","preferenciaVivienda","Tipo de vivienda",[["","Prefiero no indicar"],["casa","Casa"],["departamento","Departamento"]]],
 ["experiencia","preferenciaExperiencia","Experiencia cuidando animales",[["","Prefiero no indicar"],["primera","Sería mi primera adopción"],["experiencia","Ya he cuidado animales"]]]
];
export default function ConfiguracionPerfil({tipo}) {
 const [datos,setDatos,borrador]=useBorrador("configuracion:"+tipo,()=>tipo==="notificaciones"?PEH.preferencias.notificaciones():tipo==="adopcion"?{tipoAnimal:"",tamano:"",vivienda:"",experiencia:"",...PEH.preferencias.adopcion()}:{actual:"",nueva:"",confirmar:""},{activo:tipo!=="seguridad"});
 const validacion=useValidacionFormulario();
 const [confirmacion,setConfirmacion]=useState(""),[visible,setVisible]=useState(false),[mensaje,setMensaje]=useState(null),[procesando,setProcesando]=useState(false);
 const tiempo=useRef(null),bloqueo=useRef(false),vivo=useRef(true);
 useEffect(()=>{vivo.current=true;return ()=>{vivo.current=false;clearTimeout(tiempo.current);};},[]);
 function cambiar(e){const {name,type,checked,value}=e.target;setDatos(d=>({...d,[name]:type==="checkbox"?checked:value}));}
 async function guardar(e){e.preventDefault();if(bloqueo.current || !validacion.validar(e.currentTarget))return;
  if(tipo!=="seguridad"){
   const ok=tipo==="notificaciones"?PEH.preferencias.guardarNotificaciones(datos):PEH.preferencias.guardarAdopcion(datos);
   if(ok)borrador.borrar();
   setConfirmacion(ok?(tipo==="notificaciones"?"Preferencias guardadas correctamente. 🐾":"Preferencias de adopción guardadas. 🐾"):"No fue posible guardar. Comprueba que hayas iniciado sesión e inténtalo nuevamente.");
   setVisible(true);clearTimeout(tiempo.current);tiempo.current=setTimeout(()=>setVisible(false),3000);return;
  }
  bloqueo.current=true;setProcesando(true);setMensaje({texto:"Comprobando los datos…",tipo:"info"});
  try{const resultado=await PEH.cuentas.cambiarContrasena(datos.actual,datos.nueva,datos.confirmar);if(!vivo.current)return;if(resultado.ok)borrador.reiniciar({actual:"",nueva:"",confirmar:""});else validacion.asignar("actual",resultado.mensaje);setMensaje({texto:resultado.mensaje,tipo:resultado.ok?"exito":"error"});}
  catch {if(vivo.current)setMensaje({texto:"No se pudo procesar el cambio. Recarga la página e inténtalo nuevamente.",tipo:"error"});}
  finally{bloqueo.current=false;if(vivo.current)setProcesando(false);}
 }
 return <>{confirmacion&&<div className={"mensaje-confirmacion-configuracion"+(visible?" visible":"")}>{confirmacion}</div>}
 {tipo==="notificaciones"&&<form className="formulario-configuracion" id="formularioNotificaciones" noValidate onBlur={validacion.evento} onChange={validacion.evento} onSubmit={guardar}>
 {[["adopcion","Proceso de adopción","Recibe novedades sobre el estado de tus solicitudes."],["veterinaria","Reservas veterinarias","Recibe recordatorios de tus próximas reservas."],["informacion","Información de PEH","Recibe avisos relevantes sobre servicios y funcionamiento."]].map(([k,t,d])=><label className="opcion-interruptor" key={k}><span><strong>{t}</strong><small>{d}</small></span><input type="checkbox" name={k} checked={Boolean(datos[k])} onChange={cambiar}/><span className="interruptor"/></label>)}
 <AvisoBorrador estado={borrador}/><button type="button" className="boton-cancelar boton-cancelar-proceso" onClick={()=>{borrador.reiniciar(tipo==="seguridad"?{actual:"",nueva:"",confirmar:""}:tipo==="notificaciones"?PEH.preferencias.notificaciones():{tipoAnimal:"",tamano:"",vivienda:"",experiencia:"",...PEH.preferencias.adopcion()});validacion.limpiar();setMensaje(null);setConfirmacion("");setVisible(false);}}>Cancelar proceso</button><button className="boton-guardar-configuracion" type="submit">Guardar preferencias</button></form>}
 {tipo==="adopcion"&&<form className="formulario-configuracion" id="formularioPreferenciasAdopcion" noValidate onBlur={validacion.evento} onChange={validacion.evento} onSubmit={guardar}>
 {camposAdopcion.map(([k,id,t,opciones])=><div className="grupo-configuracion" key={k}><label htmlFor={id}>{t}</label><select id={id} name={k} value={datos[k]} onChange={cambiar}>{opciones.map(([v,texto])=><option key={v} value={v}>{texto}</option>)}</select>{validacion.mensaje(k)}</div>)}
 <div className="nota-preferencias"><span>🧡</span><p>Estas preferencias sirven como orientación. No crean una lista de favoritos ni reservan animales automáticamente.</p></div><AvisoBorrador estado={borrador}/><button type="button" className="boton-cancelar boton-cancelar-proceso" onClick={()=>{borrador.reiniciar(tipo==="seguridad"?{actual:"",nueva:"",confirmar:""}:tipo==="notificaciones"?PEH.preferencias.notificaciones():{tipoAnimal:"",tamano:"",vivienda:"",experiencia:"",...PEH.preferencias.adopcion()});validacion.limpiar();setMensaje(null);setConfirmacion("");setVisible(false);}}>Cancelar proceso</button><button className="boton-guardar-configuracion" type="submit">Guardar preferencias</button></form>}
 {tipo==="seguridad"&&<><form className="formulario-configuracion" id="formularioSeguridad" noValidate onBlur={validacion.evento} onChange={validacion.evento} onSubmit={guardar}>
 {[["actual","contrasenaActual","Contraseña actual"],["nueva","nuevaContrasena","Nueva contraseña (8 caracteres, mayúscula, minúscula, número y símbolo)"],["confirmar","confirmarContrasena","Confirmar nueva contraseña"]].map(([k,id,t])=><div className="grupo-configuracion" key={k}><label htmlFor={id}>{t}</label><input id={id} name={k} type="password" minLength={k==="actual"?undefined:8} autoComplete={k==="actual"?"current-password":"new-password"} required value={datos[k]} onChange={cambiar}/>{validacion.mensaje(k)}</div>)}
 <div className={"mensaje-configuracion"+(mensaje?" "+mensaje.tipo:"")} id="mensajeSeguridad" hidden={!mensaje}>{mensaje?.texto}</div><AvisoBorrador estado={borrador}/><button type="button" className="boton-cancelar boton-cancelar-proceso" onClick={()=>{borrador.reiniciar(tipo==="seguridad"?{actual:"",nueva:"",confirmar:""}:tipo==="notificaciones"?PEH.preferencias.notificaciones():{tipoAnimal:"",tamano:"",vivienda:"",experiencia:"",...PEH.preferencias.adopcion()});validacion.limpiar();setMensaje(null);setConfirmacion("");setVisible(false);}}>Cancelar proceso</button><button className="boton-guardar-configuracion" type="submit" disabled={procesando}>Actualizar contraseña</button></form><div className="nota-seguridad"><strong>Privacidad en PEH</strong><p>Tu perfil funciona como un espacio personal de gestión. No mostramos seguidores, publicaciones personales ni métricas sociales.</p></div></>}
 </>;
}
