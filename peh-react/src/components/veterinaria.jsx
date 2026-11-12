/* Componentes de la vista veterinaria.
 * La lógica de estado y procesos se obtiene de hooks.
 */
import { useConsejosVeterinaria } from '../hooks/veterinaria.js';
import { servicios } from '../data/veterinaria.js';
import { horarios } from '../data/global.js';
import { Navegacion } from './global.jsx';
import { fechaLocal, horarioFuturo, fechaConfirmacion } from '../services/veterinaria.js';
/* ConsejosVeterinaria */

export function ConsejosVeterinaria() {
 const { abierto, cerrarBoton, consejo, abrir, cerrar , tecladoConsejo , abrirDesdeEnlaceConsejo } = useConsejosVeterinaria();

 return <>
<section className="seccion-consejos">
<div className="contenedor">
<div className="encabezado-seccion">
<div className="icono-seccion">{" ♡ "}</div>
<div>
<span className="sobre-titulo">{" Bienestar diario "}</span>
<h2>{" Consejos y cuidados "}</h2>
<p>{" Pequeñas acciones que ayudan a mantener a tu compañero sano y feliz. "}</p>
</div>
</div>
<div className="lista-consejos">

<article className="tarjeta-consejo peh-tarjeta-interactiva" data-consejo="alimentacion" role="button" tabIndex="0" aria-label="Ver consejos de alimentación" onClick={e=>abrir("alimentacion",e.currentTarget)} onKeyDown={e=>tecladoConsejo(e,"alimentacion")}>
<span className="consejo-icono" aria-hidden="true">{" ◉ "}</span>
<div>
<h3>{" Alimentación adecuada "}</h3>
<p>{" Una dieta equilibrada y acorde a su edad fortalece su salud y sistema inmune. "}</p>
<button type="button" className="consejo-ver-mas peh-enlace" onClick={abrirDesdeEnlaceConsejo} onKeyDown={e=>e.stopPropagation()}>{" Ver más → "}</button>
</div>
</article>

<article className="tarjeta-consejo peh-tarjeta-interactiva" data-consejo="ejercicio" role="button" tabIndex="0" aria-label="Ver consejos de ejercicio" onClick={e=>abrir("ejercicio",e.currentTarget)} onKeyDown={e=>tecladoConsejo(e,"ejercicio")}>
<span className="consejo-icono" aria-hidden="true">{" ◌ "}</span>
<div>
<h3>{" Ejercicio regular "}</h3>
<p>{" La actividad diaria ayuda a mantener su salud física, emocional y mental. "}</p>
<button type="button" className="consejo-ver-mas peh-enlace" onClick={abrirDesdeEnlaceConsejo} onKeyDown={e=>e.stopPropagation()}>{" Ver más → "}</button>
</div>
</article>

<article className="tarjeta-consejo peh-tarjeta-interactiva" data-consejo="controles" role="button" tabIndex="0" aria-label="Ver consejos de controles" onClick={e=>abrir("controles",e.currentTarget)} onKeyDown={e=>tecladoConsejo(e,"controles")}>
<span className="consejo-icono" aria-hidden="true">{" ♥ "}</span>
<div>
<h3>{" Visitas periódicas "}</h3>
<p>{" La prevención permite detectar problemas a tiempo y entregar una mejor calidad de vida. "}</p>
<button type="button" className="consejo-ver-mas peh-enlace" onClick={abrirDesdeEnlaceConsejo} onKeyDown={e=>e.stopPropagation()}>{" Ver más → "}</button>
</div>
</article>
</div>
</div>
</section>
<div className="modal-consejo" id="modalConsejo" hidden={!abierto}>
<div className="modal-consejo-fondo" aria-hidden="true">
</div>
<div className="modal-consejo-contenido" role="dialog" aria-modal="true" aria-labelledby="tituloModalConsejo" tabIndex="-1">
<button className="modal-consejo-cerrar" id="cerrarModalConsejo" type="button" aria-label="Cerrar consejo" onClick={cerrar} ref={cerrarBoton}>{" × "}</button>
<span className="modal-consejo-icono" id="iconoModalConsejo" aria-hidden="true">{consejo ? consejo.icono : "🐾"}</span>
<h2 id="tituloModalConsejo">{consejo ? consejo.titulo : "Consejo veterinario"}</h2>
<div id="contenidoModalConsejo">{consejo?.contenido.map(texto => <p key={texto}>{texto}</p>)}</div>
<p className="modal-consejo-aviso">{" Estos consejos son orientativos y no reemplazan la atención veterinaria. "}</p>
</div>
</div>
 </>;
}

/* Presentación de Veterinaria */

export function VistaVeterinaria({ datos, procesando, errores, avisoBorrador, registrado, mensaje, fechaMinima, momentoHoras, formulario, aviso, revisarAlSalir, cancelarSolicitud, cambiar, elegirServicio, irReserva, reservar }) {
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
<a className="boton boton-claro peh-boton-fondo" href="#reservar" onClick={irReserva}>{" Reservar una atención "}<span aria-hidden="true">{" ↓ "}</span>
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

<button className={"tarjeta-servicio peh-tarjeta-interactiva" + (datos.servicio === "consulta" ? " seleccionado" : "")} type="button" data-servicio="consulta" aria-pressed={datos.servicio === "consulta"} onClick={() => elegirServicio("consulta")}>
<span className="servicio-icono" aria-hidden="true">{" 🩺 "}</span>
<strong>{" Consulta general "}</strong>
<p>{" Revisión del estado de salud y orientación veterinaria. "}</p>
</button>

<button className={"tarjeta-servicio peh-tarjeta-interactiva" + (datos.servicio === "vacunacion" ? " seleccionado" : "")} type="button" data-servicio="vacunacion" aria-pressed={datos.servicio === "vacunacion"} onClick={() => elegirServicio("vacunacion")}>
<span className="servicio-icono" aria-hidden="true">{" 💉 "}</span>
<strong>{" Vacunación "}</strong>
<p>{" Aplicación de vacunas según edad y condición. "}</p>
</button>

<button className={"tarjeta-servicio peh-tarjeta-interactiva" + (datos.servicio === "desparasitacion" ? " seleccionado" : "")} type="button" data-servicio="desparasitacion" aria-pressed={datos.servicio === "desparasitacion"} onClick={() => elegirServicio("desparasitacion")}>
<span className="servicio-icono" aria-hidden="true">{" 💊 "}</span>
<strong>{" Desparasitación "}</strong>
<p>{" Control interno y externo para una mejor calidad de vida. "}</p>
</button>

<button className={"tarjeta-servicio peh-tarjeta-interactiva" + (datos.servicio === "esterilizacion" ? " seleccionado" : "")} type="button" data-servicio="esterilizacion" aria-pressed={datos.servicio === "esterilizacion"} onClick={() => elegirServicio("esterilizacion")}>
<span className="servicio-icono" aria-hidden="true">{" 🐾 "}</span>
<strong>{" Esterilización "}</strong>
<p>{" Procedimiento seguro para ayudar a prevenir camadas no deseadas. "}</p>
</button>

<button className={"tarjeta-servicio peh-tarjeta-interactiva" + (datos.servicio === "control" ? " seleccionado" : "")} type="button" data-servicio="control" aria-pressed={datos.servicio === "control"} onClick={() => elegirServicio("control")}>
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
<form id="formularioReserva" noValidate onBlur={revisarAlSalir} onSubmit={reservar} ref={formulario} aria-busy={procesando}>
<fieldset className="contenido-reserva-cuenta" disabled={!registrado || procesando}>
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
{servicios.map(servicio => <option key={servicio.id} value={servicio.id}>{` ${servicio.nombre} `}</option>)}
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
{horarios.map(hora => <option key={hora} value={hora} disabled={datos.fecha === fechaLocal(momentoHoras) && !horarioFuturo(datos.fecha, hora, momentoHoras)}>{` ${hora} `}</option>)}
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

<div className="acciones-formulario-pagina">
<button className="boton boton-secundario cancelar-solicitud-reserva boton-cancelar-proceso" type="button" onClick={cancelarSolicitud}>Cancelar proceso</button>
<button className="boton boton-primario boton-reservar peh-boton-fondo" type="submit">
<span aria-hidden="true">{" ▣ "}</span>{procesando ? " Registrando reserva… " : " Reservar hora "}</button>
</div>

<div className={"mensaje-reserva" + (mensaje.tipo ? " " + mensaje.tipo : "")} id="mensajeReserva" role="status" aria-live="polite" ref={aviso}>{mensaje.reserva ? <div className="confirmacion-reserva"><span className="confirmacion-icono" aria-hidden="true">✓</span><div><strong>¡Tu reserva fue registrada!</strong><p>{`${mensaje.reserva.mascotaNombre} tiene una solicitud de ${mensaje.reserva.servicioNombre} para el ${fechaConfirmacion(mensaje.reserva.fecha)} a las ${mensaje.reserva.hora}.`}</p><p>Estado: {mensaje.reserva.estado}. Podrás consultar la reserva en tu perfil.</p></div></div> : mensaje.texto}</div>
</fieldset>
</form>
</div>

<aside className="reserva-visual reserva-orientacion" aria-label="Guía y resumen de la reserva">
<img className="ilustracion-prepara-visita" src="/img/veterinaria-perro-gato.png" alt="" aria-hidden="true" width="320" height="180" />
<section className="prepara-visita" aria-labelledby="tituloPreparaVisita">
<h3 id="tituloPreparaVisita">Prepara tu visita</h3>
<ul className="recordatorios-visita">
<li><span className="recordatorio-marca" aria-hidden="true">✓</span><span>Ten a mano los antecedentes de tu mascota.</span></li>
<li><span className="recordatorio-marca" aria-hidden="true">✓</span><span>Organiza su traslado con correa o transportadora.</span></li>
<li><span className="recordatorio-marca" aria-hidden="true">✓</span><span>Anota las dudas que quieras consultar.</span></li>
</ul>
</section>
<section className="resumen-reserva-vivo" aria-labelledby="tituloResumenReserva">
<h3 id="tituloResumenReserva">Resumen de tu reserva</h3>
<p>Se actualizará al completar el formulario.</p>
<dl aria-live="polite" aria-atomic="true">
<div><dt>Mascota</dt><dd>{({perro:'Perro',gato:'Gato'})[datos.mascota] || 'Por indicar'}</dd></div>
<div><dt>Servicio</dt><dd>{servicios.find(servicio=>servicio.id===datos.servicio)?.nombre || 'Por seleccionar'}</dd></div>
<div><dt>Fecha</dt><dd>{datos.fecha ? fechaConfirmacion(datos.fecha) : 'Por seleccionar'}</dd></div>
<div><dt>Hora</dt><dd>{datos.hora || 'Por seleccionar'}</dd></div>
</dl>
</section>
<p className="orientacion-enlace-texto">Podrás consultar tus reservas desde tu perfil.</p>
<a href="#perfil" className="enlace-reservas-perfil peh-enlace">Ir a mi perfil →</a>
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
<a className="boton boton-secundario peh-boton-fondo" href="#contacto">{" Contactar "}<span aria-hidden="true">{" → "}</span>
</a>
</div>
</div>
</section>
</main>

 </>;
}
