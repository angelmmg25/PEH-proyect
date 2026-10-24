import { useRef, useState } from "react";
import PEH from "../services/peh";

export default function NuevaPublicacion({onPublicada,mostrarMensaje,mensaje}) {
 const [contenido,setContenido]=useState("");
 const [categoria,setCategoria]=useState("");
 const [ubicacion,setUbicacion]=useState("");
 const [imagen,setImagen]=useState(null);
 const archivo=useRef(null);
 const lectura=useRef(0);
 function limpiarImagen() {
  ++lectura.current; setImagen(null);
  if(archivo.current) archivo.current.value="";
 }
 function cargar(e) {
  const f=e.target.files[0];
  if(!f) { limpiarImagen(); return; }
  if(!f.type.startsWith("image/")) { mostrarMensaje("Selecciona un archivo de imagen válido.","error");limpiarImagen();return; }
  if(f.size>3*1024*1024) { mostrarMensaje("La imagen no puede superar los 3 MB.","error");limpiarImagen();return; }
  const actual=++lectura.current;
  const lector=new FileReader();
  lector.onload=()=>{if(lectura.current===actual)setImagen(String(lector.result));};
  lector.onerror=()=>{if(lectura.current===actual){limpiarImagen();mostrarMensaje("Selecciona un archivo de imagen válido.","error");}};
  lector.readAsDataURL(f);
 }
 function publicar(e) {
  e.preventDefault();
  if(contenido.trim().length<10) { mostrarMensaje("Escribe un poco más para que la comunidad pueda entender tu publicación.","error");document.getElementById("contenidoPublicacion")?.focus();return; }
  if(!categoria) { mostrarMensaje("Selecciona una categoría para tu publicación.","error");document.getElementById("categoriaPublicacion")?.focus();return; }
  const nueva=PEH.publicaciones.agregar({autor:"",contenido:contenido.trim(),categoria,ubicacion:ubicacion.trim(),imagen,fecha:new Date().toISOString()});
  if(!nueva) { mostrarMensaje("Inicia sesión para publicar y comprueba que haya espacio para almacenar la publicación.","error");return; }
  setContenido("");setCategoria("");setUbicacion("");limpiarImagen();onPublicada(nueva);
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
<form id="formularioPublicacion" className="formulario-publicacion" onSubmit={publicar}>
<textarea id="contenidoPublicacion" name="contenido" rows="3" maxLength="500" placeholder="Comparte una historia, haz una pregunta o ayuda a difundir una patita..." required value={contenido} onChange={e => setContenido(e.target.value)}></textarea>

<div className="vista-previa-publicacion" id="vistaPreviaPublicacion" hidden={!imagen}>
<img id="imagenPreviaPublicacion" src={imagen || undefined} alt="Vista previa de la imagen seleccionada" />
<button id="quitarImagenPublicacion" type="button" aria-label="Quitar imagen" onClick={limpiarImagen}>{" × "}</button>
</div>
<div className="crear-publicacion-opciones">

<label className="opcion-publicacion" htmlFor="imagenPublicacion">
<span aria-hidden="true">{" ▣ "}</span>{" Foto "}</label>
<input id="imagenPublicacion" type="file" accept="image/*" hidden ref={archivo} onChange={cargar} />

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
</select>
</label>

<label className="opcion-publicacion">
<span aria-hidden="true">{" ● "}</span>
<input id="ubicacionPublicacion" type="text" maxLength="50" placeholder="Ubicación (opcional)" value={ubicacion} onChange={e => setUbicacion(e.target.value)} />
</label>

<button className="boton-publicar" type="submit">
<span aria-hidden="true">{" ➤ "}</span>{" Publicar "}</button>
</div>
<div className={"mensaje-publicacion " + mensaje.tipo} id="mensajePublicacion" role="status" aria-live="polite" hidden={!mensaje.visible}>{mensaje.texto}</div>
</form>
</article>
 );
}
