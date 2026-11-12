/* Comunidad: carga, categorías, publicaciones, comentarios y acciones del usuario. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { listarPublicaciones, detallePublicacion, listarCompartidos, categoriaValida, coincidePublicacion, inicializarPublicacionesEjemplo, ordenarComentarios, listarComentarios, comentar, eliminarComentario, editarComentario, eliminarPublicacion, editarPublicacion, marcarCompartido } from '../services/comunidad.js';
import { useCatalogo, useValidacionFormulario, useBorrador } from './global.jsx';
import PEH, { animalesConMasEspera } from '../services/global.js';
/* pages/Comunidad.jsx — Comunidad */
export function useComunidad({ sesion, categoriaRuta, publicacionId, ruta, onRuta }) {
const animales = useCatalogo();
const [publicaciones,setPublicaciones] = useState([]);
const [buscar,setBuscar] = useState("");
const [revision,setRevision] = useState(0);
const [mensaje,setMensaje] = useState({texto:"",tipo:"",visible:false});
const [cargando,setCargando]=useState(true),[errorCarga,setErrorCarga]=useState("");
const [compartidos,setCompartidos]=useState(new Set()),[errorCompartidos,setErrorCompartidos]=useState("");
const generacion=useRef(0);
const temporizador = useRef(null);
const rutaLocal = useRef(null);
const categoria = categoriaValida(categoriaRuta);
const destacados = animalesConMasEspera(animales);
const refrescar = useCallback(() => {++generacion.current;setRevision(n=>n+1);},[]);
const mostrarMensaje = useCallback((texto,tipo) => {
  clearTimeout(temporizador.current);
  setMensaje({texto,tipo,visible:true});
  temporizador.current = setTimeout(() => setMensaje(actual => ({...actual,visible:false})),4500);
 },[]);
useEffect(() => {
  document.body.classList.add("pagina-comunidad"); document.title = "Comunidad | PEH";
  return () => { document.body.classList.remove("pagina-comunidad"); clearTimeout(temporizador.current); };
 },[]);
useEffect(()=>{
  let activo=true;const controller=new AbortController(),turno=++generacion.current;
  const cargar=async()=>{
   setCargando(true);setErrorCarga("");
   try{
   inicializarPublicacionesEjemplo();
   const datos=await listarPublicaciones({signal:controller.signal});
   if(publicacionId){const id=publicacionId;if(!datos.some(p=>String(p.id)===String(id)))datos.unshift(await detallePublicacion(id,{signal:controller.signal}));}
   if(activo&&turno===generacion.current){setPublicaciones(datos);setCargando(false);}
   }catch(error){if(activo&&!controller.signal.aborted&&turno===generacion.current){setPublicaciones([]);setErrorCarga(error.estado===404?"Esta publicación ya no está disponible.":error.message);setCargando(false);}}
  };void cargar();
  listarCompartidos({signal:controller.signal}).then(ids=>{if(activo&&turno===generacion.current){setCompartidos(new Set(ids));setErrorCompartidos("");}}).catch(error=>{if(activo&&!controller.signal.aborted&&error.name!=="AbortError"&&turno===generacion.current){setCompartidos(new Set());setErrorCompartidos(error.message);}});
  return ()=>{activo=false;controller.abort();};
 },[revision,publicacionId,sesion.id]);
useEffect(()=>{
  const actualizar=()=>{if(document.visibilityState!=="hidden")refrescar();};
  const timer=setInterval(actualizar,30_000);window.addEventListener("focus",actualizar);document.addEventListener("visibilitychange",actualizar);
  return ()=>{clearInterval(timer);window.removeEventListener("focus",actualizar);document.removeEventListener("visibilitychange",actualizar);};
 },[refrescar]);
useEffect(() => {
  if(rutaLocal.current !== ruta) setBuscar("");
  rutaLocal.current = null;
  if(!publicacionId) return;
  const frame=requestAnimationFrame(()=>document.getElementById(`publicacion-${publicacionId}`)?.scrollIntoView());
  return ()=>cancelAnimationFrame(frame);
 },[ruta,publicacionId]);
useEffect(()=>{if(publicacionId){const frame=requestAnimationFrame(()=>document.getElementById(`publicacion-${publicacionId}`)?.scrollIntoView());return ()=>cancelAnimationFrame(frame);}},[publicacionId,publicaciones]);
function cambiarCategoria(valor,nuevaBusqueda="") {
  const seleccion = categoriaValida(valor);
  setBuscar(nuevaBusqueda);
  const destino = `comunidad/${seleccion}`;
  rutaLocal.current = destino;
  window.history.replaceState(null,"",`#${destino}`);
  onRuta(destino);
 }
function abrirTema(valor,busqueda) {
  cambiarCategoria(valor,busqueda);
  document.getElementById("listaPublicaciones")?.scrollIntoView({behavior:"smooth",block:"start"});
 }
function publicada(nueva) {
  ++generacion.current;
  setPublicaciones(actual=>[nueva,...actual.filter(p=>p.id!==nueva.id)]);
  cambiarCategoria("todas");
  refrescar();
  mostrarMensaje("Tu publicación ya está visible en la comunidad. 🐾","exito");
  requestAnimationFrame(()=>document.getElementById(`publicacion-${nueva.id}`)?.scrollIntoView({behavior:"smooth",block:"center"}));
 }
const hayResultados = publicaciones.some(p=>coincidePublicacion(p,categoria,buscar));
function publicacionCompartida(id) {++generacion.current;setCompartidos(prev=>new Set([...prev,id]));refrescar();}
function publicacionEliminada(id) {++generacion.current;setPublicaciones(prev=>prev.filter(p=>p.id!==id));if(String(publicacionId)===String(id))cambiarCategoria("todas");refrescar();}
function publicacionEditada(nueva) {++generacion.current;setPublicaciones(prev=>prev.map(p=>p.id===nueva.id?nueva:p));refrescar();}
return { publicaciones, setPublicaciones, buscar, setBuscar, mensaje, cargando, errorCarga, compartidos, setCompartidos, errorCompartidos, generacion, categoria, destacados, refrescar, mostrarMensaje, cambiarCategoria, abrirTema, publicada, hayResultados , publicacionCompartida, publicacionEliminada, publicacionEditada };
}

/* components/comunidad.jsx — NuevaPublicacion */
export function useNuevaPublicacion({ onPublicada, mostrarMensaje, publicarServicio }) {
const [contenido,setContenido,bContenido]=useBorrador("publicacion:texto","",{mostrarGuardado:false});
const [categoria,setCategoria,bCategoria]=useBorrador("publicacion:categoria","",{mostrarGuardado:false});
const [ubicacion,setUbicacion,bUbicacion]=useBorrador("publicacion:ubicacion","",{mostrarGuardado:false});
const [imagen,setImagen,bImagen]=useBorrador("publicacion:imagen",null,{mostrarGuardado:false});
const validacion=useValidacionFormulario();
const archivo=useRef(null);
const lectura=useRef(0),vivo=useRef(false),bloqueo=useRef(false);
const [procesando,setProcesando]=useState(false);
useEffect(()=>{vivo.current=true;return ()=>{vivo.current=false;};},[]);
function limpiarImagen() {
  ++lectura.current; setImagen(null);
  if(archivo.current) archivo.current.value="";
 }
function cargar(e) {
  const f=e.target.files[0];
  if(!f) { limpiarImagen(); return; }
  if(!(publicarServicio ? ["image/png","image/jpeg","image/gif"].includes(f.type) : f.type.startsWith("image/"))) { validacion.asignar("imagen","Selecciona una imagen PNG, JPG o GIF."); mostrarMensaje("Selecciona una imagen PNG, JPG o GIF.","error");limpiarImagen();return; }
  if(f.size>3*1024*1024) { validacion.asignar("imagen","La imagen no puede superar los 3 MB."); mostrarMensaje("La imagen no puede superar los 3 MB.","error");limpiarImagen();return; }
  validacion.asignar("imagen","");
  const actual=++lectura.current;
  const lector=new FileReader();
  lector.onload=()=>{if(vivo.current&&lectura.current===actual)setImagen(String(lector.result));};
  lector.onerror=()=>{if(vivo.current&&lectura.current===actual){validacion.asignar("imagen","No se pudo leer la imagen.");limpiarImagen();mostrarMensaje("Selecciona una imagen PNG, JPG o GIF.","error");}};
  lector.readAsDataURL(f);
 }
async function publicar(e) {
  e.preventDefault();
  if(bloqueo.current)return;
  if(!validacion.validar(e.currentTarget))return;
  if(contenido.trim().length<10) { mostrarMensaje("Escribe un poco más para que la comunidad pueda entender tu publicación.","error");document.getElementById("contenidoPublicacion")?.focus();return; }
  if(!categoria) { mostrarMensaje("Selecciona una categoría para tu publicación.","error");document.getElementById("categoriaPublicacion")?.focus();return; }
  bloqueo.current=true;setProcesando(true);
  try {
   const datos={contenido:contenido.trim(),categoria,ubicacion:ubicacion.trim(),imagen};
   const nueva=publicarServicio ? await publicarServicio(datos) : PEH.publicaciones.agregar(datos);
   if(!vivo.current)return;
   if(!nueva){mostrarMensaje("No se pudo publicar. Inténtalo nuevamente.","error");return;}
   bContenido.reiniciar("");bCategoria.reiniciar("");bUbicacion.reiniciar("");bImagen.reiniciar(null);++lectura.current;if(archivo.current)archivo.current.value="";onPublicada(nueva);
  }catch(error){if(vivo.current&&error.name!=="AbortError"){Object.entries(error.errores||{}).forEach(([campo,texto])=>validacion.asignar(campo,texto));mostrarMensaje(error.message||"No pudimos publicar. Actualiza la comunidad antes de reenviar.","error");}}
  finally{bloqueo.current=false;if(vivo.current)setProcesando(false);}
 }
function cancelarPublicacion() {bContenido.reiniciar("");bCategoria.reiniciar("");bUbicacion.reiniciar("");bImagen.reiniciar(null);++lectura.current;if(archivo.current)archivo.current.value="";validacion.limpiar();}
return { contenido, setContenido, bContenido, categoria, setCategoria, bCategoria, ubicacion, setUbicacion, bUbicacion, imagen, bImagen, validacion, archivo, lectura, procesando, limpiarImagen, cargar, publicar , cancelarPublicacion };
}

/* components/comunidad.jsx — Publicacion */
export function usePublicacion({ p, sesion, onCompartido, onEliminada, onEditada }) {
const [abiertos,setAbiertos]=useState(false),[consulta,setConsulta]=useState({datos:[],cargando:false,error:''}),[intento,setIntento]=useState(0);
const [texto,setTexto,bTexto]=useBorrador('comentario:'+p.id,'',{mostrarGuardado:false});
const [respuesta,setRespuesta,bRespuesta]=useBorrador('respuesta:'+p.id,null,{mostrarGuardado:false});
const [edicion,setEdicion,bEdicion]=useBorrador('editar-publicacion:'+p.id,()=>({contenido:p.contenido,categoria:p.categoria,ubicacion:p.ubicacion||''}),{mostrarGuardado:false});
const [editando,setEditando]=useState(false),[ocupado,setOcupado]=useState(''),[error,setError]=useState('');
const vivo=useRef(false),bloqueo=useRef(false),generacion=useRef(0),campo=useRef(null),respuestaActual=useRef(respuesta),accionesRespuesta=useRef(bRespuesta);
useEffect(()=>{respuestaActual.current=respuesta;accionesRespuesta.current=bRespuesta;},[respuesta,bRespuesta]);
const puedeModificar=sesion?.origen==='local'&&(sesion.usuarioId===p.usuarioId||sesion.rol==='ADMIN');
useEffect(()=>{vivo.current=true;return ()=>{vivo.current=false;};},[]);
useEffect(()=>{
  if(!abiertos)return;
  let activo=true,peticion;
  const cargar=()=>{
   if(document.visibilityState==='hidden'||bloqueo.current)return;
   peticion?.abort();const controller=new AbortController();peticion=controller;const turno=++generacion.current;
   setConsulta(prev=>({...prev,cargando:true,error:''}));
   listarComentarios(p.id,{signal:controller.signal}).then(datos=>{
    if(!activo||controller.signal.aborted||turno!==generacion.current)return;
    setConsulta({datos,cargando:false,error:''});
    if(respuestaActual.current&&!datos.some(c=>c.id===respuestaActual.current.id)){accionesRespuesta.current.reiniciar(null);setError('El comentario al que respondías ya no está disponible. Tu texto se conserva.');}
   }).catch(e=>{if(activo&&!controller.signal.aborted&&turno===generacion.current)setConsulta({datos:[],cargando:false,error:e.message});});
  };
  cargar();const timer=setInterval(cargar,30_000);window.addEventListener('focus',cargar);document.addEventListener('visibilitychange',cargar);
  return ()=>{activo=false;peticion?.abort();clearInterval(timer);window.removeEventListener('focus',cargar);document.removeEventListener('visibilitychange',cargar);};
 },[abiertos,p.id,intento]);
async function ejecutar(tipo,fn){
  if(bloqueo.current)return;
  bloqueo.current=true;++generacion.current;setOcupado(tipo);setError('');
  try{await fn();}catch(e){if(vivo.current&&e.name!=='AbortError')setError(e.message||'No pudimos completar la acción. Actualiza antes de reenviar.');}
  finally{bloqueo.current=false;if(vivo.current){setOcupado('');if(abiertos)setIntento(n=>n+1);}}
 }
function enviar(e){
  e.preventDefault();if(!texto.trim()||texto.trim().length>200){setError('Escribe entre 1 y 200 caracteres.');campo.current?.focus();return;}
  void ejecutar('comentario',async()=>{
   await comentar(p.id,texto,respuesta?.id??null);if(!vivo.current)return;bTexto.reiniciar('');bRespuesta.reiniciar(null);
  });
 }
function borrarComentario(c){if(!window.confirm('¿Eliminar este comentario y todas sus respuestas?'))return;void ejecutar('eliminar comentario',async()=>{await eliminarComentario(c.id);});}
function borrar(){if(!window.confirm('¿Eliminar esta publicación y sus comentarios?'))return;void ejecutar('eliminar',async()=>{await eliminarPublicacion(p.id);if(vivo.current)onEliminada(p.id);});}
function guardar(e){e.preventDefault();void ejecutar('editar',async()=>{const nueva=await editarPublicacion(p.id,{...edicion,imagen:p.imagenOriginal});if(vivo.current){bEdicion.reiniciar({contenido:nueva.contenido,categoria:nueva.categoria,ubicacion:nueva.ubicacion||''});setEditando(false);onEditada(nueva);}});}
function compartir(){void ejecutar('compartir',async()=>{
  const url=new URL(window.location.href);url.hash=`comunidad/todas/${p.id}`;
  if(navigator.share)await navigator.share({title:'Comunidad PEH',text:p.contenido.slice(0,220),url:url.href});
  else if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(url.href);
  else throw new Error('Tu navegador no permite compartir. Copia el enlace de esta publicación desde la barra de direcciones.');
  await marcarCompartido(p.id);if(vivo.current)onCompartido(p.id);
 });}
const [comentarioEditando,setComentarioEditando]=useState(null),[textoEdicion,setTextoEdicion]=useState('');
function guardarComentario(e){e.preventDefault();void ejecutar('editar comentario',async()=>{await editarComentario(comentarioEditando,textoEdicion);if(vivo.current)setComentarioEditando(null);});}
const comentarios=ordenarComentarios(consulta.datos);
function cancelarEdicion() {bEdicion.reiniciar({contenido:p.contenido,categoria:p.categoria,ubicacion:p.ubicacion||''});setEditando(false);}
function responderComentario(c) {setRespuesta({id:c.id,autor:c.autor});campo.current?.focus();}
function editarComentarioSeleccionado(c) {setComentarioEditando(c.id);setTextoEdicion(c.texto);}
function cancelarComentario() {bTexto.reiniciar('');bRespuesta.reiniciar(null);setError('');}
return { abiertos, setAbiertos, consulta, setIntento, texto, setTexto, bTexto, respuesta, setRespuesta, bRespuesta, edicion, setEdicion, bEdicion, editando, setEditando, ocupado, error, setError, campo, puedeModificar, enviar, borrarComentario, borrar, guardar, compartir, comentarioEditando, setComentarioEditando, textoEdicion, setTextoEdicion, guardarComentario, comentarios , cancelarEdicion, responderComentario, editarComentarioSeleccionado, cancelarComentario };
}
