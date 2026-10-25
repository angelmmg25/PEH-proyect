import PEH from "../services/peh.js";
import { useEffect, useRef, useState } from "react";
import Navegacion from "../components/Navegacion";
import ConsejosVeterinaria from "../components/ConsejosVeterinaria";
import { fechaLocal, horarioFuturo, validarCampoReserva, camposReserva, registrarReserva, fechaConfirmacion, datosInicialesReserva, reservaVacia, responsableInicialReserva, guardarBorradorReserva, eliminarBorradorReserva, leerBorradorReserva } from "../services/veterinaria";
import "../styles/veterinaria.css";

const vacio=reservaVacia;
const nombresCampo={responsableNombreReserva:"responsableNombre",responsableCorreoReserva:"responsableCorreo",responsableTelefonoReserva:"responsableTelefono",responsableComunaReserva:"responsableComuna",servicioReserva:"servicio",mascotaReserva:"mascota",nombreMascotaReserva:"mascotaNombre",fechaReserva:"fecha",horaReserva:"hora",observacionesReserva:"observaciones"};
export default function Veterinaria() {
 const [datos,setDatos]=useState(datosInicialesReserva);
 const [errores,setErrores]=useState({});
 const [avisoBorrador,setAvisoBorrador]=useState(()=>leerBorradorReserva() ? "Recuperamos tu solicitud sin enviar." : "");
 const [registrado,setRegistrado]=useState(()=>Boolean(PEH.sesion.obtener()?.id && !PEH.sesion.obtener()?.invitado));
 const usuarioFormulario=useRef(PEH.sesion.obtener()?.id);
 const [mensaje,setMensaje]=useState({texto:" ",tipo:"",reserva:null});
 const [fechaMinima,setFechaMinima]=useState(()=>fechaLocal());
 const [momentoHoras,setMomentoHoras]=useState(()=>new Date());
 const formulario=useRef(null),aviso=useRef(null),bloqueo=useRef(false);
 useEffect(()=>{
  document.body.classList.add("pagina-veterinaria");document.title="Veterinaria | PEH";
  return ()=>document.body.classList.remove("pagina-veterinaria");
 },[]);
 useEffect(()=>{
  const sincronizar=()=>{
   const usuario=PEH.sesion.obtener(), id=usuario?.id;
   setRegistrado(Boolean(id && !usuario.invitado));
   if(id!==usuarioFormulario.current){usuarioFormulario.current=id;setDatos(datosInicialesReserva());setErrores({});setMensaje({texto:"",tipo:"",reserva:null});setAvisoBorrador(leerBorradorReserva()?"Recuperamos tu solicitud sin enviar.":"");}
  };
  window.addEventListener("peh:actualizado",sincronizar);window.addEventListener("storage",sincronizar);
  return ()=>{window.removeEventListener("peh:actualizado",sincronizar);window.removeEventListener("storage",sincronizar);};
 },[]);
 function comprobarSesion(){
  const usuario=PEH.sesion.obtener();
  if(!usuario?.id || usuario.invitado){setRegistrado(false);window.alert("Debes iniciar sesión con una cuenta para reservar una atención veterinaria.");return false;}
  if(usuario.id!==usuarioFormulario.current){usuarioFormulario.current=usuario.id;setDatos(datosInicialesReserva());setErrores({});return false;}
  return true;
 }
 function guardarCambio(nuevos){
  if(!comprobarSesion())return;
  setDatos(nuevos);
  setAvisoBorrador(guardarBorradorReserva(nuevos)?"Borrador guardado.":"No pudimos guardar el borrador. Revisa el almacenamiento de tu navegador.");
 }
 function revisarAlSalir(e){const campo=nombresCampo[e.target.id];if(campo)setErrores(actual=>({...actual,[campo]:validarCampoReserva(campo,datos)}));}
 function cancelarSolicitud(){
  if(!comprobarSesion())return;
  if(!eliminarBorradorReserva()){setAvisoBorrador("No pudimos eliminar el borrador. Inténtalo nuevamente.");return;}
  setDatos({...vacio,...responsableInicialReserva()});setErrores({});setMensaje({texto:"",tipo:"",reserva:null});setAvisoBorrador("");setFechaMinima(fechaLocal());setMomentoHoras(new Date());
 }
 function cambiar(e) {
  if(!comprobarSesion())return;
  const campo=nombresCampo[e.target.id];
  if(!campo)return;
  const nuevos={...datos,[campo]:e.target.value};
  const ahora=new Date();
  if(campo==="fecha") {
   setFechaMinima(fechaLocal(ahora));setMomentoHoras(ahora);
   if(nuevos.fecha===fechaLocal(ahora) && nuevos.hora && !horarioFuturo(nuevos.fecha,nuevos.hora,ahora)) nuevos.hora="";
  }
  guardarCambio(nuevos);
  const cambios={[campo]:validarCampoReserva(campo,nuevos,ahora)};
  if(campo==="fecha" && nuevos.hora)cambios.hora=validarCampoReserva("hora",nuevos,ahora);
  setErrores(actual=>({...actual,...cambios}));
 }
 function elegirServicio(servicio) {
  if(!comprobarSesion())return;
  const nuevos={...datos,servicio};guardarCambio(nuevos);
  setErrores(actual=>({...actual,servicio:validarCampoReserva("servicio",nuevos)}));
  document.getElementById("reservar")?.scrollIntoView({behavior:"smooth",block:"center"});
 }
 function irReserva(e) {e.preventDefault();if(!comprobarSesion())return;document.getElementById("reservar")?.scrollIntoView();}
 function reservar(e) {
  e.preventDefault();if(bloqueo.current || !comprobarSesion())return;
  const ahora=new Date();setFechaMinima(fechaLocal(ahora));
  setMensaje({texto:"",tipo:"",reserva:null});
  const nuevosErrores=Object.fromEntries(camposReserva.map(campo=>[campo,validarCampoReserva(campo,datos,ahora)]));
  setErrores(nuevosErrores);
  if(Object.values(nuevosErrores).some(Boolean)) {
   setMensaje({texto:"Revisa los campos marcados antes de continuar.",tipo:"error",reserva:null});
   const primero=Object.keys(nombresCampo).find(id=>nuevosErrores[nombresCampo[id]]);
   document.getElementById(primero)?.focus();return;
  }
  bloqueo.current=true;
  try {
   const resultado=registrarReserva(datos,ahora);
   if(!resultado.ok) {setMensaje({texto:resultado.mensaje,tipo:"error",reserva:null});return;}
   setMensaje({texto:"",tipo:"exito",reserva:resultado.reserva});
   const borrado=eliminarBorradorReserva();setAvisoBorrador(borrado?"":"La reserva se registró, pero no pudimos eliminar el borrador guardado. Pulsa Cancelar proceso para intentarlo nuevamente.");
   setDatos({...vacio,...responsableInicialReserva()});setErrores(Object.fromEntries(camposReserva.map(campo=>[campo,""])));setFechaMinima(fechaLocal());setMomentoHoras(new Date());
   requestAnimationFrame(()=>aviso.current?.scrollIntoView({behavior:"smooth",block:"nearest"}));
  } finally {bloqueo.current=false;}
 }
 return <><Navegacion pagina="veterinaria" />
<main>

<section className="hero-veterinaria">
<div className="contenedor">
<div className="hero-veterinaria-contenido">
<div className="hero-veterinaria-imagen" aria-hidden="true">
</div>
<div className="hero-veterinaria-texto">
<span className="hero-veterinaria-etiqueta">{" Bienestar animal "}</span>
<h1>{" Veterinaria "}</h1>
<h2>{" Cuidar también es una forma de adoptar. "}</h2>
<p>{" En PEH creemos que el bienestar de cada animal es parte de una segunda oportunidad. Aquí encontrarás servicios veterinarios pensados para apoyar su salud y calidad de vida. "}</p>
<a className="boton boton-claro" href="#reservar" onClick={irReserva}>{" Reservar una atención "}<span aria-hidden="true">{" ↓ "}</span>
</a>
</div>
</div>
</div>
</section>

<section className="seccion-servicios" id="servicios">
<div className="contenedor">
<div className="encabezado-seccion">
<div className="icono-seccion">{" 🐾 "}</div>
<div>
<span className="sobre-titulo">{" Cuidado y prevención "}</span>
<h2>{" Nuestros servicios "}</h2>
<p>{" Atenciones enfocadas en la prevención, el cuidado y el bienestar animal. "}</p>
</div>
</div>
<div className="lista-servicios">

<button className={"tarjeta-servicio" + (datos.servicio === "consulta" ? " seleccionado" : "")} type="button" data-servicio="consulta" aria-pressed={datos.servicio === "consulta"} onClick={() => elegirServicio("consulta")}>
<span className="servicio-icono" aria-hidden="true">{" 🩺 "}</span>
<strong>{" Consulta general "}</strong>
<p>{" Revisión del estado de salud y orientación veterinaria. "}</p>
</button>

<button className={"tarjeta-servicio" + (datos.servicio === "vacunacion" ? " seleccionado" : "")} type="button" data-servicio="vacunacion" aria-pressed={datos.servicio === "vacunacion"} onClick={() => elegirServicio("vacunacion")}>
<span className="servicio-icono" aria-hidden="true">{" 💉 "}</span>
<strong>{" Vacunación "}</strong>
<p>{" Aplicación de vacunas según edad y condición. "}</p>
</button>

<button className={"tarjeta-servicio" + (datos.servicio === "desparasitacion" ? " seleccionado" : "")} type="button" data-servicio="desparasitacion" aria-pressed={datos.servicio === "desparasitacion"} onClick={() => elegirServicio("desparasitacion")}>
<span className="servicio-icono" aria-hidden="true">{" 💊 "}</span>
<strong>{" Desparasitación "}</strong>
<p>{" Control interno y externo para una mejor calidad de vida. "}</p>
</button>

<button className={"tarjeta-servicio" + (datos.servicio === "esterilizacion" ? " seleccionado" : "")} type="button" data-servicio="esterilizacion" aria-pressed={datos.servicio === "esterilizacion"} onClick={() => elegirServicio("esterilizacion")}>
<span className="servicio-icono" aria-hidden="true">{" 🐾 "}</span>
<strong>{" Esterilización "}</strong>
<p>{" Procedimiento seguro para ayudar a prevenir camadas no deseadas. "}</p>
</button>

<button className={"tarjeta-servicio" + (datos.servicio === "control" ? " seleccionado" : "")} type="button" data-servicio="control" aria-pressed={datos.servicio === "control"} onClick={() => elegirServicio("control")}>
<span className="servicio-icono" aria-hidden="true">{" ♡ "}</span>
<strong>{" Control post-adopción "}</strong>
<p>{" Seguimiento de salud para animales adoptados. "}</p>
</button>
</div>
</div>
</section>

<section className="seccion-reserva" id="reservar">
<div className="contenedor">
<div className="reserva-contenido">
<div className="reserva-formulario">
<div className="encabezado-reserva">
<span className="reserva-icono" aria-hidden="true">{" ▣ "}</span>
<div>
<span className="sobre-titulo">{" Agenda veterinaria "}</span>
<h2>{" Reserva una atención "}</h2>
<p>{" Completa el formulario para solicitar una cita veterinaria para tu compañero. "}</p>
</div>
</div>
{!registrado && <p className="aviso-sesion-reserva" role="status">Inicia sesión con una cuenta para completar una reserva.</p>}
{avisoBorrador && <p className="aviso-borrador-reserva" role="status">{avisoBorrador}</p>}
<form id="formularioReserva" noValidate onBlur={revisarAlSalir} onSubmit={reservar} ref={formulario}>
<fieldset className="contenido-reserva-cuenta" disabled={!registrado}>
<legend>Datos del responsable y de la atención</legend>
<div className="campos-reserva">
<div className={"grupo-campo" + (errores.responsableNombre ? " campo-error" : "")}>
<label htmlFor="responsableNombreReserva">Nombre completo del responsable</label>
<input id="responsableNombreReserva" name="responsableNombre" type="text" autoComplete="name" maxLength="60" required value={datos.responsableNombre} onChange={cambiar} aria-invalid={Boolean(errores.responsableNombre)} aria-describedby="error-responsableNombre" />
<small id="error-responsableNombre" className="mensaje-error" aria-live="polite">{errores.responsableNombre || ""}</small>
</div>
<div className={"grupo-campo" + (errores.responsableCorreo ? " campo-error" : "")}>
<label htmlFor="responsableCorreoReserva">Correo electrónico</label>
<input id="responsableCorreoReserva" name="responsableCorreo" type="email" autoComplete="email" maxLength="100" required value={datos.responsableCorreo} onChange={cambiar} aria-invalid={Boolean(errores.responsableCorreo)} aria-describedby="error-responsableCorreo" />
<small id="error-responsableCorreo" className="mensaje-error" aria-live="polite">{errores.responsableCorreo || ""}</small>
</div>
<div className={"grupo-campo" + (errores.responsableTelefono ? " campo-error" : "")}>
<label htmlFor="responsableTelefonoReserva">Teléfono</label>
<input id="responsableTelefonoReserva" name="responsableTelefono" type="tel" autoComplete="tel" maxLength="20" required value={datos.responsableTelefono} onChange={cambiar} aria-invalid={Boolean(errores.responsableTelefono)} aria-describedby="error-responsableTelefono" />
<small id="error-responsableTelefono" className="mensaje-error" aria-live="polite">{errores.responsableTelefono || ""}</small>
</div>
<div className={"grupo-campo" + (errores.responsableComuna ? " campo-error" : "")}>
<label htmlFor="responsableComunaReserva">Comuna</label>
<input id="responsableComunaReserva" name="responsableComuna" type="text" autoComplete="address-level3" maxLength="60" required value={datos.responsableComuna} onChange={cambiar} aria-invalid={Boolean(errores.responsableComuna)} aria-describedby="error-responsableComuna" />
<small id="error-responsableComuna" className="mensaje-error" aria-live="polite">{errores.responsableComuna || ""}</small>
</div>

<div className={"grupo-campo" + (errores.servicio ? " campo-error" : "")}>
<label htmlFor="servicioReserva">{" Tipo de servicio "}</label>
<select id="servicioReserva" name="servicio" required value={datos.servicio} onChange={cambiar} aria-invalid={Boolean(errores.servicio)} aria-describedby="error-servicio">
<option value="">{" Selecciona un servicio "}</option>
<option value="consulta">{" Consulta general "}</option>
<option value="vacunacion">{" Vacunación "}</option>
<option value="desparasitacion">{" Desparasitación "}</option>
<option value="esterilizacion">{" Esterilización "}</option>
<option value="control">{" Control post-adopción "}</option>
</select>
<small id="error-servicio" className="mensaje-error" aria-live="polite">{errores.servicio || ""}</small>
</div>

<div className={"grupo-campo" + (errores.mascota ? " campo-error" : "")}>
<label htmlFor="mascotaReserva">{" Tipo de mascota "}</label>
<select id="mascotaReserva" name="mascota" required value={datos.mascota} onChange={cambiar} aria-invalid={Boolean(errores.mascota)} aria-describedby="error-mascota">
<option value="">{" Selecciona el tipo de mascota "}</option>
<option value="perro">{" Perro "}</option>
<option value="gato">{" Gato "}</option>
</select>
<small id="error-mascota" className="mensaje-error" aria-live="polite">{errores.mascota || ""}</small>
</div>

<div className={"grupo-campo campo-ancho" + (errores.mascotaNombre ? " campo-error" : "")}>
<label htmlFor="nombreMascotaReserva">{" Nombre de tu mascota "}</label>
<input id="nombreMascotaReserva" name="nombreMascota" type="text" minLength="2" maxLength="50" placeholder="Ejemplo: Pelusa" autoComplete="off" required value={datos.mascotaNombre} onChange={cambiar} aria-invalid={Boolean(errores.mascotaNombre)} aria-describedby="error-mascotaNombre" />
<small id="error-mascotaNombre" className="mensaje-error" aria-live="polite">{errores.mascotaNombre || ""}</small>
</div>

<div className={"grupo-campo" + (errores.fecha ? " campo-error" : "")}>
<label htmlFor="fechaReserva">{" Fecha "}</label>
<input id="fechaReserva" name="fecha" type="date" required value={datos.fecha} onChange={cambiar} aria-invalid={Boolean(errores.fecha)} aria-describedby="error-fecha" min={fechaMinima} />
<small id="error-fecha" className="mensaje-error" aria-live="polite">{errores.fecha || ""}</small>
</div>

<div className={"grupo-campo" + (errores.hora ? " campo-error" : "")}>
<label htmlFor="horaReserva">{" Hora "}</label>
<select id="horaReserva" name="hora" required value={datos.hora} onChange={cambiar} aria-invalid={Boolean(errores.hora)} aria-describedby="error-hora">
<option value="">{" Selecciona una hora "}</option>
<option value="09:00" disabled={datos.fecha === fechaLocal(momentoHoras) && !horarioFuturo(datos.fecha, "09:00", momentoHoras)}>{" 09:00 "}</option>
<option value="10:30" disabled={datos.fecha === fechaLocal(momentoHoras) && !horarioFuturo(datos.fecha, "10:30", momentoHoras)}>{" 10:30 "}</option>
<option value="12:00" disabled={datos.fecha === fechaLocal(momentoHoras) && !horarioFuturo(datos.fecha, "12:00", momentoHoras)}>{" 12:00 "}</option>
<option value="15:00" disabled={datos.fecha === fechaLocal(momentoHoras) && !horarioFuturo(datos.fecha, "15:00", momentoHoras)}>{" 15:00 "}</option>
<option value="16:30" disabled={datos.fecha === fechaLocal(momentoHoras) && !horarioFuturo(datos.fecha, "16:30", momentoHoras)}>{" 16:30 "}</option>
<option value="18:00" disabled={datos.fecha === fechaLocal(momentoHoras) && !horarioFuturo(datos.fecha, "18:00", momentoHoras)}>{" 18:00 "}</option>
</select>
<small id="error-hora" className="mensaje-error" aria-live="polite">{errores.hora || ""}</small>
</div>
</div>

<div className={"grupo-campo campo-observaciones" + (errores.observaciones ? " campo-error" : "")}>
<label htmlFor="observacionesReserva">{" ¿Hay algo que debamos saber? "}<span>{" Opcional "}</span>
</label>
<textarea id="observacionesReserva" name="observaciones" rows="3" minLength="10" maxLength="250" placeholder="Cuéntanos brevemente el motivo de la consulta o alguna consideración importante." value={datos.observaciones} onChange={cambiar} aria-invalid={Boolean(errores.observaciones)} aria-describedby="error-observaciones"></textarea>
<small className="ayuda-observaciones">{" Si escribes una observación, utiliza al menos 10 caracteres. Máximo 250. "}</small>
<small id="error-observaciones" className="mensaje-error" aria-live="polite">{errores.observaciones || ""}</small>
</div>

<button className="boton boton-secundario cancelar-solicitud-reserva boton-cancelar-proceso" type="button" onClick={cancelarSolicitud}>Cancelar proceso</button>
<button className="boton boton-primario boton-reservar" type="submit">
<span aria-hidden="true">{" ▣ "}</span>{" Agendar cita "}</button>

<div className={"mensaje-reserva" + (mensaje.tipo ? " " + mensaje.tipo : "")} id="mensajeReserva" role="status" aria-live="polite" ref={aviso}>{mensaje.reserva ? <div className="confirmacion-reserva"><span className="confirmacion-icono" aria-hidden="true">✓</span><div><strong>¡Tu reserva fue registrada!</strong><p>{`${mensaje.reserva.mascotaNombre} tiene una solicitud de ${mensaje.reserva.servicioNombre} para el ${fechaConfirmacion(mensaje.reserva.fecha)} a las ${mensaje.reserva.hora}.`}</p><p>Estado: Pendiente. Podrás consultar la reserva en tu perfil.</p></div></div> : mensaje.texto}</div>
</fieldset>
</form>
</div>

<aside className="reserva-visual">
<h3>{" Antes de reservar "}</h3>
<p>{" Revisa el servicio, la fecha y la hora antes de confirmar. "}</p>
<p>{" Podrás consultar tus reservas desde tu perfil. "}</p>
<a href="#perfil" className="enlace-reservas-perfil">{" Ir a mi perfil → "}</a>
</aside>
</div>
</div>
</section>

<ConsejosVeterinaria />



<section className="seccion-ayuda-veterinaria">
<div className="contenedor">
<div className="ayuda-veterinaria-contenido">
<div className="ayuda-veterinaria-texto">
<span className="ayuda-icono" aria-hidden="true">{" ◯ "}</span>
<div>
<h2>{" ¿Dudas o necesitas más información? "}</h2>
<p>{" Puedes escribirnos si necesitas orientación antes de reservar una atención. "}</p>
</div>
</div>
<a className="boton boton-secundario" href="#contacto">{" Contactar "}<span aria-hidden="true">{" → "}</span>
</a>
</div>
</div>
</section>
</main>
<footer className="pie-pagina">
<div className="contenedor pie-contenido">
<div>
<strong>{" PEH "}</strong>
<p>{" Patitas Esperando un Hogar "}</p>
</div>
<nav className="enlaces-pie" aria-label="Enlaces del pie de página">
<a href="#inicio">{" Inicio "}</a>
<a href="#comunidad">{" Comunidad "}</a>
<a href="#veterinaria">{" Veterinaria "}</a>
<a href="#contacto">{" Ayuda "}</a>
</nav>
<p className="copyright">{" © 2026 PEH "}</p>
</div>
</footer>
 </>;
}
