/* Componentes de la vista perfil.
 * La lógica de estado y procesos se obtiene de hooks.
 */
import { camposDatosPersonales as campos, opcionesPreferencias as opciones, filtrosAdopciones, filtrosReservas, etiquetasSolicitud as etiquetas, filtrosConsultas } from '../data/perfil.js';
import { useDatosPersonales, usePreferenciasPerfil, useSeguridadPerfil, useConfiguracionPerfil, useFiltroReservas, useConsultasPerfil, useReservasPerfil, useSeccionPerfil } from '../hooks/perfil.js';
import { AvisoBorrador, IconoPerfil, Navegacion } from './global.jsx';
import PEH, { estadoReserva } from '../services/global.js';
import { estadoAdopcion, ordenarPorRegistroReciente, eventoHistorial, mensajeHistorial, fechaSolicitud, fechaReserva } from '../services/perfil.js';
import { nombresMotivos as motivos } from '../data/global.js';
import { createPortal } from 'react-dom';
import { Suspense } from 'react';
/* ConfiguracionPerfil */

function DatosPersonales({ sesion }) {
  const { datos, setDatos, borrador, errores, mensaje, ocupado, guardar, cancelarDatos } = useDatosPersonales({ sesion });

  return <section className="resumen-perfil" id="datosPerfilApi"><h2>Datos personales</h2>
    <form className="formulario-configuracion" onSubmit={guardar}>
      <fieldset disabled={ocupado} style={{border:0,padding:0,margin:0}}>
        {campos.map(([k,t,tipo,max]) => <div className="grupo-configuracion" key={k}>
          <label htmlFor={`perfil-api-${k}`}>{t}</label>
          <input id={`perfil-api-${k}`} name={k} type={tipo} maxLength={max} required={k !== 'foto'} minLength={['nombre','apellido','comuna'].includes(k)?2:undefined}
            value={datos[k]} aria-invalid={Boolean(errores[k])} aria-describedby={errores[k]?`perfil-error-${k}`:undefined}
            onChange={e => setDatos(d => ({...d,[k]:e.target.value}))}/>
          {errores[k] && <p id={`perfil-error-${k}`} role="alert">{errores[k]}</p>}
        </div>)}
        <AvisoBorrador estado={borrador}/>
      <div className="perfil-acciones-formulario">
        <button className="boton-guardar-configuracion peh-boton-fondo" type="submit">{ocupado?'Guardando…':'Guardar datos'}</button>
        <button type="button" className="boton-cancelar boton-cancelar-proceso" onClick={cancelarDatos}>Cancelar proceso</button>
      </div>
      </fieldset>
      {mensaje && <p role="status">{mensaje}</p>}
    </form>
  </section>;
}

function Preferencias({ inicial }) {
  const { datos, borrador, mensaje, ocupado, cambiar, guardar, cancelarPreferencias } = usePreferenciasPerfil({ inicial });

  return <form className="formulario-configuracion" onSubmit={guardar}>
    <fieldset disabled={ocupado} style={{border:0,padding:0,margin:0}}><legend>Notificaciones y adopción</legend>
      {[['adopcion','Proceso de adopción'],['veterinaria','Reservas veterinarias'],['informacion','Información de PEH']].map(([k,t])=><label className="opcion-interruptor" key={k}><span>{t}</span><input type="checkbox" checked={Boolean(datos.notificaciones?.[k])} onChange={e=>cambiar('notificaciones',k,e.target.checked)}/><span className="interruptor"/></label>)}
      <p>Estas opciones guardan tus preferencias; no activan envíos automáticos de correos.</p>
      {opciones.map(([k,t,lista])=><div className="grupo-configuracion" key={k}><label htmlFor={`preferencia-api-${k}`}>{t}</label><select id={`preferencia-api-${k}`} value={datos.adopcion?.[k]||''} onChange={e=>cambiar('adopcion',k,e.target.value)}>{lista.map(([v,texto])=><option key={v} value={v}>{texto}</option>)}</select></div>)}
      <AvisoBorrador estado={borrador}/>
      <div className="perfil-acciones-formulario">
      <button className="boton-guardar-configuracion peh-boton-fondo" type="submit">{ocupado?'Guardando…':'Guardar preferencias'}</button>
      <button type="button" className="boton-cancelar boton-cancelar-proceso" onClick={cancelarPreferencias}>Cancelar proceso</button>
      </div>
    </fieldset>{mensaje && <p role="status">{mensaje}</p>}
  </form>;
}

function Seguridad() {
  const { datos, setDatos, mensaje, ocupado, guardar, cancelarContrasena } = useSeguridadPerfil();

  return <section className="resumen-perfil" id="seguridadPerfilApi"><h2>Cambiar contraseña</h2><p>Al cambiarla, se cerrarán todas las sesiones de tu cuenta.</p>
    <form className="formulario-configuracion" onSubmit={guardar}><fieldset disabled={ocupado} style={{border:0,padding:0,margin:0}}>
      {[['actual','Contraseña actual'],['nueva','Nueva contraseña'],['confirmar','Confirmar nueva contraseña']].map(([k,t])=><div className="grupo-configuracion" key={k}><label htmlFor={`seguridad-api-${k}`}>{t}</label><input id={`seguridad-api-${k}`} type="password" autoComplete={k==='actual'?'current-password':'new-password'} required minLength={k==='actual'?undefined:8} maxLength={72} value={datos[k]} onChange={e=>setDatos(d=>({...d,[k]:e.target.value}))}/></div>)}
      <p>Usa al menos 8 caracteres con mayúscula, minúscula, número y símbolo.</p>
      <div className="perfil-acciones-formulario">
      <button className="boton-guardar-configuracion peh-boton-fondo" type="submit">{ocupado?'Actualizando…':'Actualizar contraseña'}</button>
      <button type="button" className="boton-cancelar boton-cancelar-proceso" onClick={cancelarContrasena}>Cancelar proceso</button>
      </div>
    </fieldset>{mensaje && <p role="alert">{mensaje}</p>}</form>
  </section>;
}

export function ConfiguracionPerfil({sesion}) {
  const { estado, setIntento } = useConfiguracionPerfil({ sesion });
  
  return <><DatosPersonales sesion={sesion}/><section className="resumen-perfil" id="preferenciasPerfilApi"><h2>Preferencias</h2>
    {estado.error?<><p role="alert">{estado.error}</p><button className="boton boton-secundario" onClick={()=>setIntento(n=>n+1)}>Reintentar</button></>:estado.datos?<Preferencias inicial={estado.datos}/>:<p role="status">Cargando preferencias…</p>}
  </section><Seguridad/></>;
}

/* HistorialPerfil */

export function FiltrosHistorial({opciones,filtro,onFiltro,registros,estadoDe=r=>r.estado,etiqueta}){
 if(!registros.length)return null;
 return <div className="filtros-historial-adopciones" role="group" aria-label={etiqueta}>{opciones.map(([valor,titulo,estados])=><button key={valor} type="button" className={'filtro-historial-adopcion'+(filtro===valor?' activo':'')} aria-pressed={filtro===valor} onClick={()=>onFiltro(valor)}>{titulo} <span>{registros.filter(r=>!estados||estados.includes(estadoDe(r))).length}</span></button>)}</div>;
}
export function FechaEvento({registro,tipo}){
 const e=eventoHistorial(registro,tipo);
 return <div className="datos-evento-historial"><p><strong>{e.etiquetaFecha}:</strong> {e.fecha}</p><p><strong>{e.etiquetaHora}:</strong> {e.hora}</p></div>;
}
export function HistorialVacio({tipo}){
 const datos={adopciones:['🐾','solicitudes','Cuando solicites adoptar una mascota, aquí podrás consultar su estado y revisar su historial.','#animales','Conocer animales'],reservas:['🩺','reservas','Cuando reserves una atención veterinaria, aquí podrás consultar su estado y revisar su historial.','#veterinaria/reservar','Reservar una hora'],consultas:['📩','consultas','Cuando realices una consulta, aquí podrás consultar su estado y revisar su historial.','#contacto','Realizar una consulta']};
 const [icono,nombre,texto,enlace,boton]=datos[tipo];
 return <div className={'historial-vacio-unificado vacio-'+tipo}><span className="icono-vacio-unificado" aria-hidden="true">{icono}</span><h3>Todavía no tienes {nombre}</h3><p>{texto}</p><a className="boton-vacio-unificado peh-boton-fondo" href={enlace}>{boton}</a></div>;
}

export function ListaAdopciones({solicitudes,filtro,onFiltro,renderAcciones}){
 if(!solicitudes.length)return <HistorialVacio tipo="adopciones"/>;
 const permitidos=filtrosAdopciones.find(([v])=>v===filtro)?.[2];
 const filtradas=ordenarPorRegistroReciente(solicitudes.filter(s=>!permitidos||permitidos.includes(estadoAdopcion(s.estado).clase)));
 return <><FiltrosHistorial opciones={filtrosAdopciones} filtro={filtro} onFiltro={onFiltro} registros={solicitudes} estadoDe={s=>estadoAdopcion(s.estado).clase} etiqueta="Filtrar solicitudes por estado"/>
 <div className="resultados-historial-adopciones">{filtradas.length?filtradas.map(s=>{
  const e=estadoAdopcion(s.estado),animal=PEH.catalogo.obtener(s.animalId);
  return <article className="item-historial-adopcion" key={s.id}>
   <div className="informacion-historial-adopcion"><div className="icono-animal-historial"><IconoPerfil tipo="adopciones"/></div><div className="datos-animal-historial"><h3>{s.animalNombre||'Animal sin nombre'}</h3><span className={'estado-adopcion estado-'+e.clase}>{e.texto}</span></div></div>
   <div className="detalle-historial-adopcion">
    {animal?.slug?<a className="peh-link enlace-perfil-animal peh-enlace" href={'#animal/'+encodeURIComponent(animal.slug)}>Ir al perfil</a>:<p>El perfil del animal ya no está disponible.</p>}
    <FechaEvento registro={s} tipo="adopciones"/><small>Código: {s.id||'Sin identificador'}</small>
    <p className="mensaje-estado-historial">{mensajeHistorial(s,'adopciones')}</p>
    {s.observacionAdmin&&<p><strong>Administración:</strong> {s.observacionAdmin}</p>}{renderAcciones?.(s)}
   </div>
  </article>;
 }):<h3 className="sin-registros-filtro">No hay solicitudes en esta categoría</h3>}</div></>;
}
function TarjetaReserva({reserva:r,renderAcciones}){
 const e=estadoReserva(r.estado);
 return <article className="item-historial-reserva"><div className="informacion-historial-reserva"><div className="icono-mascota-historial"><IconoPerfil tipo="reservas"/></div><div className="datos-mascota-historial"><h3>{r.mascotaNombre||'Mascota sin nombre'}</h3><p className="servicio-historial-reserva">{r.servicioNombre||r.servicio||'Consulta veterinaria'}</p><span className={'estado-reserva estado-reserva-'+e.clase}>{e.texto}</span></div></div>
 <div className="detalle-historial-reserva"><p><strong>Mascota:</strong> {r.mascotaTipo||r.mascota||'No especificado'}</p><FechaEvento registro={r} tipo="reservas"/><small>Código: {r.id||'Sin identificador'}</small><p className="mensaje-estado-historial">{mensajeHistorial(r,'reservas')}</p>{r.observacionAdmin&&<p><strong>Administración:</strong> {r.observacionAdmin}</p>}{renderAcciones?.(r)}</div></article>;
}

export function ListaReservas({reservas,renderAcciones}){
 const { filtro, setFiltro } = useFiltroReservas();
 if(!reservas.length)return <HistorialVacio tipo="reservas"/>;
 const permitidos=filtrosReservas.find(([v])=>v===filtro)?.[2];
 const filtradas=ordenarPorRegistroReciente(reservas.filter(r=>!permitidos||permitidos.includes(estadoReserva(r.estado).clase)));
 return <><FiltrosHistorial opciones={filtrosReservas} filtro={filtro} onFiltro={setFiltro} registros={reservas} estadoDe={r=>estadoReserva(r.estado).clase} etiqueta="Filtrar reservas por estado"/>{filtradas.length?filtradas.map(r=><TarjetaReserva key={r.id} reserva={r} renderAcciones={renderAcciones}/>):<p className="sin-registros-filtro">No hay reservas en esta categoría.</p>}</>;
}

/* MisAdopciones */

const mostrar = v => v === true ? 'Sí' : v === false ? 'No' : v === 'si' ? 'Sí' : v === 'no' ? 'No' : typeof v === 'string' || typeof v === 'number' ? String(v) : '';

export function MisAdopciones({gestion}) {
 const {estado, filtro, setFiltro, cancelando, mensaje, setIntento, solicitarCancelacion} = gestion;
  const acciones=s=><>
    <details className="perfil-detalle"><summary>Ver solicitud e historial</summary><dl>{Object.entries(etiquetas).filter(([k])=>mostrar(s.formulario[k])).map(([k,t])=><div key={k}><dt>{t}</dt><dd style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{mostrar(s.formulario[k])}</dd></div>)}</dl>
    {s.historialCambios.length>0 && <><h4>Cambios de estado</h4><ul>{s.historialCambios.map((h,i)=><li key={i}>{fechaSolicitud(h.fechaCreacion)}: {mostrar(h.estado)}{h.observacionAdmin && ` — ${mostrar(h.observacionAdmin)}`}</li>)}</ul></>}
    {['Pendiente','En revisión'].includes(s.estado) && <button type="button" className="boton-cancelar-proceso" disabled={cancelando!==null || estado.cargando} onClick={()=>solicitarCancelacion(s)}>Cancelar solicitud de {s.animalNombre}</button>}
  </details>
  </>;
 return (
<SeccionPerfil id="misAdopcionesApi" tipo="adopciones" titulo="Mis solicitudes de adopción" resumen={estado.cargando?'Actualizando solicitudes…':estado.error?'No pudimos cargar tus solicitudes':`${estado.solicitudes.length} ${estado.solicitudes.length===1?'solicitud':'solicitudes'} · ${estado.solicitudes.filter(s=>['Pendiente','En revisión'].includes(s.estado)).length} pendientes`}>
            <div aria-busy={estado.cargando}>
            <p>Revisa el formulario enviado, su estado y las observaciones de PEH.</p>
            <button type="button" className="peh-link peh-enlace" disabled={estado.cargando || cancelando!==null} onClick={()=>setIntento(n=>n+1)}>{estado.error?'Reintentar':'Actualizar historial'}</button>
            {mensaje && <p role="status">{mensaje}</p>}
            {estado.cargando && <p role="status">Actualizando tus solicitudes…</p>}
            {estado.error && <p role="alert">{estado.error}</p>}
            {!estado.error && !estado.cargando && <><ListaAdopciones solicitudes={estado.solicitudes} filtro={filtro} onFiltro={setFiltro} renderAcciones={acciones}/></>}
            </div>
          </SeccionPerfil>
 );
}

export function ConfirmacionAdopcion({gestion}) {
 const {confirmar, setConfirmar, cancelando, botonConfirmar, cancelar} = gestion;
 return <>
{confirmar && <div className="modal-perfil"><div className="fondo-modal-perfil"/><section className="contenido-modal-perfil modal-cerrar-sesion" role="dialog" aria-modal="true" aria-labelledby="tituloCancelarApi">
      <h2 id="tituloCancelarApi">¿Cancelar tu solicitud para {confirmar.animalNombre}?</h2><p>La solicitud quedará registrada como Cancelada en tu historial.</p><div className="acciones-cerrar-sesion"><button className="boton-cancelar" disabled={cancelando!==null} onClick={()=>setConfirmar(null)}>Volver</button><button ref={botonConfirmar} className="boton-confirmar-sesion peh-boton-fondo" disabled={cancelando!==null} onClick={cancelar}>{cancelando!==null?'Cancelando…':'Confirmar cancelación'}</button></div>
    </section></div>}
 </>;
}

/* MisConsultas */

const fecha=valor=>new Date(valor).toLocaleString('es-CL',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Santiago'});
const textoLargo={whiteSpace:'pre-wrap',overflowWrap:'anywhere'};
export function MisConsultas({usuarioId,enfocar=false}){
 const { filtro, setFiltro, cancelando, mensaje, cancelar, estado, setIntento, seccion } = useConsultasPerfil({ usuarioId, enfocar });

 return <SeccionPerfil id="consultasPerfil" tipo="consultas" titulo="Mis consultas de contacto" enfocar={enfocar} resumen={estado.cargando?'Actualizando consultas…':estado.error?'No pudimos cargar tus consultas':`${estado.consultas.length} ${estado.consultas.length===1?'consulta':'consultas'} · ${estado.consultas.filter(c=>!c.respuestas.length&&!['Cancelada','Cerrada'].includes(c.estado)).length} sin respuesta`}>
  <div ref={seccion} aria-busy={estado.cargando}>
  <p>Revisa el estado de tus consultas y todas las respuestas del equipo de PEH.</p>
  <button className="peh-link peh-enlace" type="button" disabled={estado.cargando} onClick={()=>setIntento(n=>n+1)}>{estado.error?'Reintentar consultas':'Actualizar consultas'}</button>
  {mensaje&&<p role="status">{mensaje}</p>}
  <FiltrosHistorial opciones={filtrosConsultas} filtro={filtro} onFiltro={setFiltro} registros={estado.consultas} etiqueta="Filtrar consultas por estado"/>
  {!estado.cargando&&!estado.error&&estado.consultas.length>0&&!estado.consultas.some(c=>filtro==='Todas'||c.estado===({'Pendientes':'Pendiente','Respondidas':'Respondida','Cerradas':'Cerrada','Canceladas':'Cancelada'}[filtro]||filtro))&&<p>No hay consultas en esta categoría.</p>}
  {estado.cargando&&<p role="status">Actualizando tus consultas…</p>}{estado.error&&<p role="alert">{estado.error}</p>}
  {!estado.cargando&&!estado.error&&<div className="lista-notificaciones-perfil" aria-live="polite">{estado.consultas.length?ordenarPorRegistroReciente(estado.consultas.filter(c=>filtro==='Todas'||c.estado===({'Pendientes':'Pendiente','Respondidas':'Respondida','Cerradas':'Cerrada','Canceladas':'Cancelada'}[filtro]||filtro))).map(c=><article className="notificacion-perfil consulta-api" style={{gridTemplateColumns:"minmax(0,1fr)"}} data-consulta-id={c.id} key={c.id}><div style={{minWidth:0,width:'100%'}}>
   <div className="perfil-consulta-cabecera"><h3 style={{overflowWrap:'anywhere'}}>{c.asunto}</h3><span className="perfil-estado-consulta">{c.estado}</span></div>
   <p><strong>Asunto:</strong> {c.asunto}</p><p><strong>Motivo:</strong> {motivos[c.motivo]}</p><FechaEvento registro={c} tipo="consultas"/><small>Código: {c.id}</small><p className="mensaje-estado-historial">{mensajeHistorial(c,'consultas')}</p>
   <details className="perfil-detalle"><summary>Ver consulta e historial</summary>
    <dl>{[['Nombre',c.nombre],['Correo',c.correo],['Motivo',motivos[c.motivo]],['Fecha',fecha(c.fechaCreacion)]].map(([k,v])=><div key={k}><dt>{k}</dt><dd style={textoLargo}>{v}</dd></div>)}</dl>
    <div className="perfil-bloque-detalle"><h4>Mensaje</h4><p style={textoLargo}>{c.mensaje}</p></div>
    <div className="perfil-bloque-detalle"><h4>Respuestas de PEH</h4>
     {c.respuestas.length?c.respuestas.map(r=><blockquote data-respuesta-id={r.id} key={r.id}><strong>{r.autor} · {fecha(r.fechaCreacion)}</strong><p style={textoLargo}>{r.texto}</p></blockquote>):<p>Aún no hay respuestas para esta consulta.</p>}
    </div>
    {c.historialCambios?.length>0&&<div className="perfil-bloque-detalle"><h4>Cambios de estado</h4><ul>{c.historialCambios.map((h,i)=><li key={i}>{fecha(h.fechaCreacion)}: {h.estado}</li>)}</ul></div>}
    {['Pendiente','En revisión'].includes(c.estado)&&<button type="button" className="boton-cancelar-proceso" disabled={cancelando} onClick={()=>cancelar(c)}>Cancelar consulta</button>}
   </details>
  </div></article>):<HistorialVacio tipo="consultas"/>}</div>}
 </div>
 </SeccionPerfil>;
}

/* MisReservas */

const texto=v=>typeof v==='string'||typeof v==='number'?String(v):'';

export function MisReservas({usuarioId,enfocar=false}) {
 const { confirmar, setConfirmar, cancelando, mensaje, volver, estado, setIntento, cancelar, solicitarCancelacionReserva } = useReservasPerfil({ usuarioId });

 const acciones=r=><>
  <details className="perfil-detalle"><summary>Ver reserva e historial</summary><dl>{[['Mascota',r.mascotaNombre],['Tipo de mascota',r.mascotaTipo||r.mascota],['Servicio',r.servicioNombre||r.servicio],['Fecha',fechaReserva(r.fecha)],['Hora',r.hora],['Responsable',r.responsableNombre],['Correo',r.responsableCorreo],['Teléfono',r.responsableTelefono],['Comuna',r.responsableComuna],['Observaciones',r.observaciones]].filter(([,v])=>texto(v)).map(([k,v])=><div key={k}><dt>{k}</dt><dd style={{overflowWrap:'anywhere',whiteSpace:'pre-wrap'}}>{texto(v)}</dd></div>)}</dl>
   {r.historialCambios.length>0&&<><h4>Cambios de la reserva</h4><ul>{r.historialCambios.map((h,i)=><li key={i}>{fechaSolicitud(h.fechaCreacion)}: {texto(h.estado)}{h.fecha&&` — Cita: ${fechaReserva(h.fecha)}`}{h.hora&&` ${texto(h.hora).slice(0,5)} hrs`}{h.observacionAdmin&&` — ${texto(h.observacionAdmin)}`}</li>)}</ul></>}
  
  {['Cerrada','Completada'].includes(r.estado)&&<><div className="perfil-bloque-detalle"><h4>Conclusión de la consulta</h4><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{r.conclusionConsulta||'No registrada.'}</p></div><div className="perfil-bloque-detalle"><h4>Recomendaciones del veterinario</h4><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{r.recomendacionesVeterinario||'No registradas.'}</p></div></>}
  {['Pendiente','Confirmada'].includes(r.estado)&&<button type="button" className="boton-cancelar-proceso" disabled={cancelando||estado.cargando} onClick={()=>solicitarCancelacionReserva(r)}>Cancelar reserva de {r.mascotaNombre}</button>}
  </details>
 </>;
 return <SeccionPerfil id="misReservasApi" enfocar={enfocar} tipo="reservas" titulo="Mis reservas veterinarias" resumen={estado.cargando?'Actualizando reservas…':estado.error?'No pudimos cargar tus reservas':`${estado.reservas.length} ${estado.reservas.length===1?'reserva':'reservas'} · ${estado.reservas.filter(r=>['Pendiente','Confirmada'].includes(r.estado)).length} confirmadas`}>
  <div aria-busy={estado.cargando}>
  <p>Revisa fechas, estados y cambios de tus atenciones. Horarios de Chile.</p>
  <button className="peh-link peh-enlace" type="button" disabled={estado.cargando||cancelando} onClick={()=>setIntento(n=>n+1)}>{estado.error?'Reintentar reservas':'Actualizar reservas'}</button>
  {mensaje&&<p role="status">{mensaje}</p>}{estado.cargando&&<p role="status">Actualizando tus reservas…</p>}{estado.error&&<p role="alert">{estado.error}</p>}
  {!estado.cargando&&!estado.error&&<><ListaReservas reservas={estado.reservas} renderAcciones={acciones}/></>}
  {confirmar&&createPortal(<div className="modal-perfil"><div className="fondo-modal-perfil"/><section className="contenido-modal-perfil modal-cerrar-sesion" role="dialog" aria-modal="true" aria-labelledby="tituloCancelarReservaApi">
   <button className="cerrar-modal-perfil" aria-label="Cerrar confirmación" disabled={cancelando} onClick={()=>setConfirmar(null)}>×</button>
   <h2 id="tituloCancelarReservaApi">¿Cancelar la reserva de {confirmar.mascotaNombre}?</h2><p>{fechaReserva(confirmar.fecha)}, {confirmar.hora} hrs. Quedará registrada como Cancelada en tu historial.</p>
   <div className="acciones-cerrar-sesion"><button ref={volver} className="boton-cancelar" disabled={cancelando} onClick={()=>setConfirmar(null)}>Volver</button><button className="boton-confirmar-sesion peh-boton-fondo" disabled={cancelando} onClick={cancelar}>{cancelando?'Cancelando…':'Confirmar cancelación'}</button></div>
  </section></div>,document.body)}
 </div>
 </SeccionPerfil>;
}

/* SeccionPerfil */

export function SeccionPerfil({id,titulo,resumen,tipo,enfocar=false,children}) {
  const { abierta, alternarSeccion } = useSeccionPerfil({ id, enfocar });

  return <details id={id} className="perfil-acordeon" open={abierta}>
    <summary className="perfil-acordeon-cabecera" onClick={alternarSeccion}>
      <span className="perfil-acordeon-icono"><IconoPerfil tipo={tipo}/></span>
      <span className="perfil-acordeon-texto"><h2>{titulo}</h2><span>{resumen}</span></span>
      <span className="perfil-acordeon-flecha" aria-hidden="true">⌄</span>
    </summary>
    <div className="perfil-acordeon-contenido">{children}</div>
  </details>;
}

/* Presentación de Perfil */

export function VistaPerfil({ sesion, seccionRuta, seccionActiva, adopciones, seleccionarSeccion, MisConsultas, MisReservas }) {
return <>
    <Navegacion pagina="perfil" />
    <main className="perfil-limpio" inert={Boolean(adopciones.confirmar)}>
      <section className="hero-perfil"><div className="contenedor hero-perfil-contenido"><div className="hero-perfil-texto"><h1>Tu espacio dentro de <span>PEH</span></h1><p>Consulta tus adopciones, reservas y consultas de contacto.</p></div><span className="detalle-perfil" aria-hidden="true">🐾</span></div></section>
      <section className="seccion-perfil"><div className="contenedor perfil-layout">
        <aside className="menu-lateral-perfil peh-panel-persistente" aria-label="Cuenta y secciones del perfil"><div className="identidad-lateral"><div className="foto-perfil" aria-hidden="true">{sesion.nombre.charAt(0).toUpperCase()}</div><div className="datos-usuario-perfil"><h2>{sesion.nombre} {sesion.apellido}</h2><p>{sesion.correo}</p><p>{sesion.usuario}</p></div></div>
          <div className="separador-menu-perfil" />
          <nav className="navegacion-perfil" aria-label="Secciones del perfil">
            {[
              ['misAdopcionesApi','adopciones','Mis adopciones'],
              ['misReservasApi','reservas','Mis reservas'],
              ['consultasPerfil','consultas','Mis consultas'],
              ['datosPerfilApi','datos','Datos personales'],
              ['preferenciasPerfilApi','preferencias','Preferencias'],
              ['seguridadPerfilApi','seguridad','Seguridad']
            ].map(([id,tipo,texto])=><button type="button" key={id} className={"opcion-menu-perfil"+(seccionActiva===id?" perfil-opcion-activa":"")} aria-current={seccionActiva===id?"location":undefined} onClick={()=>seleccionarSeccion(id)}><IconoPerfil tipo={tipo}/><span>{texto}</span></button>)}
          </nav>
        </aside>
        <div className="contenido-perfil"><section className="bienvenida-perfil"><div><h2>¡Hola, {sesion.nombre}!</h2><p>El estado de tus solicitudes se actualiza al regresar a esta página y mientras la mantienes abierta.</p></div></section>
          <MisAdopciones gestion={adopciones}/>
          <Suspense fallback={<p role="status">Cargando reservas…</p>}><MisReservas usuarioId={sesion.id} enfocar={seccionActiva==="misReservasApi"}/></Suspense>
          <Suspense fallback={<p role="status">Cargando consultas…</p>}><MisConsultas usuarioId={sesion.id} enfocar={seccionRuta==="consultas" || seccionActiva==="consultasPerfil"}/></Suspense>
          <ConfiguracionPerfil sesion={sesion}/>
        </div>
      </div></section>
    </main>
    <ConfirmacionAdopcion gestion={adopciones}/>
  </>;
}
