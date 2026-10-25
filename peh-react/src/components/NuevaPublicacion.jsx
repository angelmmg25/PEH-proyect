import useValidacionFormulario from "../hooks/useValidacionFormulario.jsx";
import useBorrador, { AvisoBorrador } from "../hooks/useBorrador.jsx";
import { useEffect, useRef } from "react";
import PEH from "../services/peh";

export default function NuevaPublicacion({onPublicada,mostrarMensaje,mensaje}) {
 const [contenido,setContenido,bContenido]=useBorrador("publicacion:texto","",{mostrarGuardado:false});
 const [categoria,setCategoria,bCategoria]=useBorrador("publicacion:categoria","",{mostrarGuardado:false});
 const [ubicacion,setUbicacion,bUbicacion]=useBorrador("publicacion:ubicacion","",{mostrarGuardado:false});
 const [imagen,setImagen,bImagen]=useBorrador("publicacion:imagen",null,{mostrarGuardado:false});
 const validacion=useValidacionFormulario();
 const archivo=useRef(null);
 const lectura=useRef(0);
 useEffect(()=>()=>{++lectura.current;},[]);
 function limpiarImagen() {
  ++lectura.current; setImagen(null);
  if(archivo.current) archivo.current.value="";
 }
 function cargar(e) {
  const f=e.target.files[0];
  if(!f) { limpiarImagen(); return; }
  if(!f.type.startsWith("image/")) { validacion.asignar("imagen","Selecciona un archivo de imagen válido."); mostrarMensaje("Selecciona un archivo de imagen válido.","error");limpiarImagen();return; }
  if(f.size>3*1024*1024) { validacion.asignar("imagen","La imagen no puede superar los 3 MB."); mostrarMensaje("La imagen no puede superar los 3 MB.","error");limpiarImagen();return; }
  validacion.asignar("imagen","");
  const actual=++lectura.current;
  const lector=new FileReader();
  lector.onload=()=>{if(lectura.current===actual)setImagen(String(lector.result));};
  lector.onerror=()=>{if(lectura.current===actual){validacion.asignar("imagen","No se pudo leer la imagen.");limpiarImagen();mostrarMensaje("Selecciona un archivo de imagen válido.","error");}};
  lector.readAsDataURL(f);
 }
 function publicar(e) {
  e.preventDefault();
  if(!validacion.validar(e.currentTarget))return;
  if(contenido.trim().length<10) { mostrarMensaje("Escribe un poco más para que la comunidad pueda entender tu publicación.","error");document.getElementById("contenidoPublicacion")?.focus();return; }
  if(!categoria) { mostrarMensaje("Selecciona una categoría para tu publicación.","error");document.getElementById("categoriaPublicacion")?.focus();return; }
  const nueva=PEH.publicaciones.agregar({autor:"",contenido:contenido.trim(),categoria,ubicacion:ubicacion.trim(),imagen,fecha:new Date().toISOString()});
  if(!nueva) { mostrarMensaje("Inicia sesión para publicar y comprueba que haya espacio para almacenar la publicación.","error");return; }
  bContenido.reiniciar("");bCategoria.reiniciar("");bUbicacion.reiniciar("");bImagen.reiniciar(null);++lectura.current;if(archivo.current)archivo.current.value="";onPublicada(nueva);
 }
 return (
<article className="crear-publicacion" id="crearPublicacion">
<div className="crear-publicacion-cabecera">
<div className="avatar-usuario" aria-hidden="true">{" 👤 "}</div>
<div>
<h2>{" Crear una publicación "}</h2>
<p>{" Comparte información que pueda ayudar a la comunidad. "}</p>
</div>
</div>
<form id="formularioPublicacion" className="formulario-publicacion" noValidate onBlur={validacion.evento} onChange={validacion.evento} onSubmit={publicar}>
<textarea id="contenidoPublicacion" name="contenido" rows="3" minLength="10" maxLength="500" placeholder="Comparte una historia, haz una pregunta o ayuda a difundir una patita..." required value={contenido} onChange={e => setContenido(e.target.value)}></textarea>{validacion.mensaje("contenido")}

<div className="vista-previa-publicacion" id="vistaPreviaPublicacion" hidden={!imagen}>
<img id="imagenPreviaPublicacion" src={imagen || undefined} alt="Vista previa de la imagen seleccionada" />
<button id="quitarImagenPublicacion" type="button" aria-label="Quitar imagen" onClick={limpiarImagen}>{" × "}</button>
</div>
<div className="crear-publicacion-opciones">

<label className="opcion-publicacion" htmlFor="imagenPublicacion">
<span aria-hidden="true">{" ▣ "}</span>{" Foto "}</label>
<input id="imagenPublicacion" name="imagen" type="file" accept="image/*" hidden ref={archivo} onChange={cargar} />{validacion.mensaje("imagen")}

<label className="opcion-publicacion">
<span aria-hidden="true">{" ◇ "}</span>
<select id="categoriaPublicacion" name="categoria" aria-label="Categoría de la publicación" required value={categoria} onChange={e => setCategoria(e.target.value)}>
<option value="">{" Etiquetar categoría "}</option>
<option value="adopcion">{" Historia de adopción "}</option>
<option value="consejos">{" Consejos y cuidados "}</option>
<option value="preguntas">{" Pregunta a la comunidad "}</option>
<option value="perdidos">{" Animales perdidos "}</option>
<option value="encontrados">{" Animales encontrados "}</option>
<option value="jornadas">{" Jornadas y actividades "}</option>
<option value="difusion">{" Ayuda y difusión "}</option>
</select>{validacion.mensaje("categoria")}
</label>

<label className="opcion-publicacion">
<span aria-hidden="true">{" ● "}</span>
<input id="ubicacionPublicacion" name="ubicacion" type="text" maxLength="50" placeholder="Ubicación (opcional)" value={ubicacion} onChange={e => setUbicacion(e.target.value)} />{validacion.mensaje("ubicacion")}
</label>

<div className="acciones-publicacion-proceso"><button className="boton-cancelar boton-cancelar-proceso" type="button" onClick={()=>{bContenido.reiniciar("");bCategoria.reiniciar("");bUbicacion.reiniciar("");bImagen.reiniciar(null);++lectura.current;if(archivo.current)archivo.current.value="";validacion.limpiar();}}>Cancelar proceso</button>
<button className="boton-publicar" type="submit">
<span aria-hidden="true">{" ➤ "}</span>{" Publicar "}</button></div>
</div>
<AvisoBorrador estado={bContenido}/><AvisoBorrador estado={bImagen}/><div className={"mensaje-publicacion " + mensaje.tipo} id="mensajePublicacion" role="status" aria-live="polite" hidden={!mensaje.visible}>{mensaje.texto}</div>
</form>
</article>
 );
}
