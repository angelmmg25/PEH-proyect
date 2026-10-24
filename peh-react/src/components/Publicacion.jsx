import { Fragment, useRef, useState } from "react";
import PEH from "../services/peh";
import { categorias, textoBusquedaPublicacion } from "../data/comunidad";

// Las respuestas se anidan bajo su comentario, incluidas las de los ejemplos.
function arbolComentarios(comentarios) {
 const raices=[];const nodos=new Map();
 for(const comentario of comentarios) {
  const nodo={...comentario,respuestas:[]};
  const padre=comentario.respuestaA && nodos.get(comentario.respuestaA);
  if(padre) padre.respuestas.push(nodo); else raices.push(nodo);
  nodos.set(comentario.id,nodo);
 }
 return raices;
}
export default function Publicacion({publicacion:p,hidden=false,sesion,actualizar,mostrarMensaje}) {
 const [comentariosVisibles,setComentariosVisibles]=useState(false);
 const [texto,setTexto]=useState("");
 const [respuesta,setRespuesta]=useState(null);
 const [compartiendo,setCompartiendo]=useState(false);
 const [compartidoInvitado,setCompartidoInvitado]=useState(false);
 const campo=useRef(null),contenido=useRef(null),bloqueo=useRef(false);
 const comentarios=[...(p.comentarios || []),...PEH.comentarios.listar(p.id)].filter(c => PEH.comentarios.esVisible(c.id));
 const compartido=PEH.compartidos.contiene(p.id) || compartidoInvitado;
 const propia=!p.demo && !sesion?.invitado && p.usuarioId===sesion?.id;
 function cancelarRespuesta(){setRespuesta(null);}
 function responder(c) {
  const actual=PEH.sesion.obtener();
  if(!actual || actual.invitado){mostrarMensaje("Inicia sesión para responder.","error");return;}
  setRespuesta(c);campo.current?.focus();
 }
 function comentar(e) {
  e.preventDefault();
  const comentario=PEH.comentarios.agregar(p.id,texto,respuesta?.id || null);
  if(!comentario){mostrarMensaje("No se pudo publicar el comentario. Inicia sesión y escribe entre 1 y 200 caracteres.","error");return;}
  setTexto("");cancelarRespuesta();actualizar();
 }
 function abrirComentarios(){
  setComentariosVisibles(actual=>!actual);
  if(!comentariosVisibles) requestAnimationFrame(()=>campo.current?.focus());
 }
 async function compartir(){
  if(bloqueo.current)return;
  bloqueo.current=true;setCompartiendo(true);
  const usuario=PEH.sesion.obtener();
  const url=new URL(window.location.href);url.hash=`comunidad/todas/${p.id}`;
  let textoCompartido=contenido.current?.innerText.replace(/\s+/g," ").trim() || "Mira esta publicación de la comunidad PEH.";
  if(textoCompartido.length>220)textoCompartido=textoCompartido.slice(0,220)+"...";
  const datos={title:"Comunidad PEH",text:textoCompartido,url:url.href};
  try {
   if(navigator.share)await navigator.share(datos);
   else await navigator.clipboard.writeText(`${datos.text}\n${datos.url}`);
   if(usuario && !usuario.invitado){
    const persistido=PEH.compartidos.marcar(p.id,usuario.id);
    actualizar();
    if(!persistido && PEH.sesion.obtener()?.id===usuario.id)mostrarMensaje("La acción se completó, pero no se pudo conservar el estado de compartido. Inténtalo nuevamente.","error");
   } else if(!PEH.sesion.obtener() || PEH.sesion.obtener()?.invitado)setCompartidoInvitado(true);
   else actualizar();
  }catch(error){if(error.name!=="AbortError")mostrarMensaje("No fue posible compartir. Inténtalo nuevamente.","error");}
  finally{bloqueo.current=false;setCompartiendo(false);}
 }
 function eliminar(){
  if(!window.confirm("¿Eliminar esta publicación de la comunidad?"))return;
  if(!PEH.publicaciones.eliminar(p.id)){mostrarMensaje("No se pudo eliminar la publicación.","error");return;}
  actualizar();mostrarMensaje("Publicación eliminada.","exito");
 }
 function dibujarComentario(c,esRespuesta=false){
  const propio=c.usuarioId && c.usuarioId===sesion?.id;
  return <div className={"comentario-comunidad"+(esRespuesta?" es-respuesta":"")} data-comentario-id={c.id} key={c.id}>
   <p><strong>{`${c.autor}${propio?" (Tú)":""}: `}</strong>{c.texto}</p>
   <button className="boton-responder" type="button" onClick={()=>responder(c)}>Responder</button>
   {c.respuestas.map(hijo=>dibujarComentario(hijo,true))}
  </div>;
 }
 return <article className={"publicacion"+(p.demo?"":" publicacion-nueva")+(comentariosVisibles?" comentarios-abiertos":"")} id={`publicacion-${p.id}`} data-id={p.id} data-usuario-id={p.usuarioId || undefined} data-categoria={p.categoria} data-texto={textoBusquedaPublicacion(p)} hidden={hidden}>
  <header className="publicacion-cabecera">
   <div className="avatar-publicacion" aria-hidden="true">{p.demo?p.avatar:"👤"}</div>
   <div className="datos-publicacion"><strong>{p.demo?p.autor:((p.usuarioId?(p.autor || "Miembro de la comunidad"):"Miembro de la comunidad")+(propia?" (Tú)":""))}</strong>
    <div className="publicacion-meta">
     <span>{p.demo?p.tiempo:PEH.formatearFecha(p.fechaCreacion || p.fecha)}</span>
     {!p.demo && p.ubicacion && <><span>•</span><span>{p.ubicacion}</span></>}
     <span>•</span><span className={`etiqueta-publicacion etiqueta-${p.categoria}`}>{categorias[p.categoria] || "Comunidad"}</span>
    </div>
   </div>
   {propia && <button className="boton-opciones-publicacion" type="button" aria-label="Eliminar mi publicación" onClick={eliminar}>Eliminar</button>}
  </header>
  <div className="publicacion-contenido" ref={contenido}>
   {p.demo && p.titulo && <h3>{p.titulo}</h3>}
   {p.demo?p.parrafos.map((parrafo,i)=><p key={i}>{parrafo}</p>):<p>{String(p.contenido || "").split("\n").map((linea,i,partes)=><Fragment key={i}>{linea}{i<partes.length-1 && <br/>}</Fragment>)}</p>}
   {p.demo && p.imagenesEjemplo.length>0 && <div className="imagenes-publicacion">{p.imagenesEjemplo.map((icono,i)=><div className="imagen-placeholder" key={i}>{icono}</div>)}</div>}
   {!p.demo && p.imagen && <div className="imagenes-publicacion imagen-unica"><img src={p.imagen} alt="Imagen compartida en la publicación" /></div>}
  </div>
  <footer className="publicacion-acciones">
   <button className={"accion-publicacion boton-compartir"+(compartido?" compartido":"")} type="button" onClick={compartir} disabled={compartiendo}>{compartido?"Compartido ✓":"↗ Compartir"}</button>
   <button className="accion-publicacion boton-comentarios" type="button" aria-expanded={comentariosVisibles} onClick={abrirComentarios}><span aria-hidden="true">◯</span>{" "}<span>Comentar</span></button>
  </footer>
  <div className="seccion-comentarios" hidden={!comentariosVisibles}>
   <div className="comentarios-lista">{arbolComentarios(comentarios).map(c=>dibujarComentario(c))}</div>
   <div className="aviso-respuesta" hidden={!respuesta}>{respuesta && <>Respondiendo a {respuesta.autor}{" "}<button type="button" onClick={cancelarRespuesta}>Cancelar</button></>}</div>
   <form className="formulario-comentario" onSubmit={comentar}>
    <input type="text" ref={campo} maxLength={200} placeholder={respuesta?"Escribe tu respuesta...":"Escribe un comentario..."} value={texto} onChange={e=>setTexto(e.target.value)} required />
    <button type="submit" aria-label="Enviar comentario">➤</button>
   </form>
  </div>
 </article>;
}
