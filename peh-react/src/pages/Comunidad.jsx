import { useCallback, useEffect, useRef, useState } from "react";
import PEH from "../services/peh";
import useCatalogo from "../hooks/useCatalogo";
import { animalesConMasEspera } from "../services/catalogo";
import { publicacionesDemo, categoriaValida, coincidePublicacion } from "../data/comunidad";
import Navegacion from "../components/Navegacion";
import NuevaPublicacion from "../components/NuevaPublicacion";
import Publicacion from "../components/Publicacion";
import "../styles/comunidad.css";

function cargarPublicaciones() { return [...PEH.publicaciones.listar(), ...publicacionesDemo]; }
export default function Comunidad({sesion, categoriaRuta, publicacionId, ruta, onRuta}) {
 const animales = useCatalogo();
 const [publicaciones,setPublicaciones] = useState(cargarPublicaciones);
 const [buscar,setBuscar] = useState("");
 const [,setRevision] = useState(0);
 const [mensaje,setMensaje] = useState({texto:"",tipo:"",visible:false});
 const temporizador = useRef(null);
 const rutaLocal = useRef(null);
 const categoria = categoriaValida(categoriaRuta);
 const destacados = animalesConMasEspera(animales);
 const refrescar = useCallback(() => setRevision(n => n+1),[]);
 const mostrarMensaje = useCallback((texto,tipo) => {
  clearTimeout(temporizador.current);
  setMensaje({texto,tipo,visible:true});
  temporizador.current = setTimeout(() => setMensaje(actual => ({...actual,visible:false})),4500);
 },[]);
 useEffect(() => {
  document.body.classList.add("pagina-comunidad"); document.title = "Comunidad | PEH";
  return () => { document.body.classList.remove("pagina-comunidad"); clearTimeout(temporizador.current); };
 },[]);
 useEffect(() => {
  function sincronizar(e) {
   const clave = e.type === "storage" ? e.key : e.detail?.clave;
   if(e.type === "storage" && clave === PEH.CLAVES.sesion) { window.location.reload(); return; }
   if(clave === PEH.CLAVES.publicaciones) {
    if(e.type === "storage") setPublicaciones(cargarPublicaciones());
    else setPublicaciones(actual => {
     const guardadas = PEH.publicaciones.listar();
     const ids = new Set(guardadas.map(p=>p.id));
     const conocidas = new Set(actual.map(p=>p.id));
     return [...guardadas.filter(p=>!conocidas.has(p.id)).reverse(), ...actual.filter(p=>p.demo || ids.has(p.id))];
    });
   }
   refrescar();
  }
  window.addEventListener("peh:actualizado",sincronizar);
  window.addEventListener("storage",sincronizar);
  window.addEventListener("focus",refrescar);
  window.addEventListener("pageshow",refrescar);
  return () => { window.removeEventListener("peh:actualizado",sincronizar); window.removeEventListener("storage",sincronizar); window.removeEventListener("focus",refrescar); window.removeEventListener("pageshow",refrescar); };
 },[refrescar]);
 useEffect(() => {
  if(rutaLocal.current !== ruta) setBuscar("");
  rutaLocal.current = null;
  if(!publicacionId) return;
  const frame=requestAnimationFrame(()=>document.getElementById(`publicacion-${publicacionId}`)?.scrollIntoView());
  return ()=>cancelAnimationFrame(frame);
 },[ruta,publicacionId]);
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
  setPublicaciones(actual=>[nueva,...actual.filter(p=>p.id!==nueva.id)]);
  cambiarCategoria("todas");
  mostrarMensaje("Tu publicación ya está visible en la comunidad. 🐾","exito");
  requestAnimationFrame(()=>document.getElementById(`publicacion-${nueva.id}`)?.scrollIntoView({behavior:"smooth",block:"center"}));
 }
 const hayResultados = publicaciones.some(p=>coincidePublicacion(p,categoria,buscar));
 return <><Navegacion pagina="comunidad" />
<main>

<section className="hero-comunidad">
<div className="contenedor">
<div className="hero-comunidad-contenido">
<div className="hero-comunidad-texto">
<span className="sobre-titulo">{" Comunidad "}</span>
<h1>{" Un espacio "}<span>{" para las patitas "}</span>
</h1>
<h2>{" Historias, consejos y personas con el mismo propósito. "}</h2>
<p>{" Comparte experiencias, resuelve dudas o ayuda difundiendo a patitas que aún esperan encontrar un hogar. "}</p>
<p className="hero-frase">{" Juntos podemos hacer la diferencia. 🐾 "}</p>
</div>
<div className="hero-comunidad-visual" aria-hidden="true">
<div className="mascotas-comunidad">
<span className="mascota-perro">{" 🐶 "}</span>
<span className="mascota-gato">{" 🐱 "}</span>
</div>
<p>{" Una comunidad "}<span>{" que también cuida. "}</span>{" 🧡 "}</p>
</div>
</div>
</div>
</section>

<section className="seccion-filtros-comunidad">
<div className="contenedor">
<div className="barra-comunidad">
<div className="filtros-publicaciones" id="filtrosPublicaciones">
<button className={"filtro-publicacion" + (categoria === "todas" ? " activo" : "")} type="button" data-filtro="todas" onClick={() => cambiarCategoria("todas")} aria-pressed={categoria === "todas"}>
<span aria-hidden="true">{" ⌂ "}</span>
<span>{" Todas "}<small>{" las publicaciones "}</small>
</span>
</button>
<button className={"filtro-publicacion" + (categoria === "adopcion" ? " activo" : "")} type="button" data-filtro="adopcion" onClick={() => cambiarCategoria("adopcion")} aria-pressed={categoria === "adopcion"}>
<span aria-hidden="true">{" ♥ "}</span>
<span>{" Historias "}<small>{" de adopción "}</small>
</span>
</button>
<button className={"filtro-publicacion" + (categoria === "consejos" ? " activo" : "")} type="button" data-filtro="consejos" onClick={() => cambiarCategoria("consejos")} aria-pressed={categoria === "consejos"}>
<span aria-hidden="true">{" 💡 "}</span>
<span>{" Consejos "}<small>{" y cuidados "}</small>
</span>
</button>
<button className={"filtro-publicacion" + (categoria === "preguntas" ? " activo" : "")} type="button" data-filtro="preguntas" onClick={() => cambiarCategoria("preguntas")} aria-pressed={categoria === "preguntas"}>
<span aria-hidden="true">{" ●●● "}</span>
<span>{" Preguntas "}<small>{" de la comunidad "}</small>
</span>
</button>
<button className={"filtro-publicacion" + (categoria === "difusion" ? " activo" : "")} type="button" data-filtro="difusion" onClick={() => cambiarCategoria("difusion")} aria-pressed={categoria === "difusion"}>
<span aria-hidden="true">{" 📣 "}</span>
<span>{" Ayuda "}<small>{" y difusión "}</small>
</span>
</button>
<button className={"filtro-publicacion" + (categoria === "perdidos" ? " activo" : "")} type="button" data-filtro="perdidos" onClick={() => cambiarCategoria("perdidos")} aria-pressed={categoria === "perdidos"}>
<span aria-hidden="true">{" ⌕ "}</span>
<span>{" Animales perdidos "}</span>
</button>
<button className={"filtro-publicacion" + (categoria === "encontrados" ? " activo" : "")} type="button" data-filtro="encontrados" onClick={() => cambiarCategoria("encontrados")} aria-pressed={categoria === "encontrados"}>
<span aria-hidden="true">{" 🐾 "}</span>
<span>{" Animales encontrados "}</span>
</button>
<button className={"filtro-publicacion" + (categoria === "jornadas" ? " activo" : "")} type="button" data-filtro="jornadas" onClick={() => cambiarCategoria("jornadas")} aria-pressed={categoria === "jornadas"}>
<span aria-hidden="true">{" 📅 "}</span>
<span>{" Jornadas y actividades "}</span>
</button>
</div>

<div className="buscador-comunidad">
<span aria-hidden="true">{" ⌕ "}</span>
<input id="buscarPublicaciones" type="search" placeholder="Buscar publicaciones..." aria-label="Buscar publicaciones" autoComplete="off" value={buscar} onChange={e => setBuscar(e.target.value)} />
</div>
</div>
</div>
</section>

<section className="seccion-comunidad">
<div className="contenedor">
<div className="comunidad-grid">

<div className="columna-publicaciones">

<NuevaPublicacion onPublicada={publicada} mostrarMensaje={mostrarMensaje} mensaje={mensaje} />

<div className="lista-publicaciones" id="listaPublicaciones">{publicaciones.map(p => <Publicacion key={p.id} publicacion={p} hidden={!coincidePublicacion(p,categoria,buscar)} sesion={sesion} actualizar={refrescar} mostrarMensaje={mostrarMensaje} />)}</div>

<div className="sin-publicaciones" id="sinPublicaciones" hidden={hayResultados}>
<span aria-hidden="true">{" 🐾 "}</span>
<h3>{" No encontramos publicaciones "}</h3>
<p>{" Prueba con otra búsqueda o categoría. "}</p>
</div>
</div>

<aside className="barra-lateral-comunidad">


<section className="tarjeta-comunidad">
<div className="titulo-tarjeta-lateral">
<h2>{" 💬 Temas de la comunidad "}</h2>
</div>
<div className="lista-temas">
<button className="tema-comunidad" type="button" data-busqueda="primeros días en casa" onClick={() => abrirTema("todas","primeros días en casa")}>
<span className="icono-tema">{" 🏠 "}</span>
<span>
<strong>{" Primeros días en casa "}</strong>
<small>{" Adaptación y bienvenida "}</small>
</span>
</button>
<button className="tema-comunidad" type="button" data-busqueda="alimentación" onClick={() => abrirTema("todas","alimentación")}>
<span className="icono-tema">{" 🍽 "}</span>
<span>
<strong>{" Consejos de alimentación "}</strong>
<small>{" Cuidados cotidianos "}</small>
</span>
</button>
<button className="tema-comunidad" type="button" data-categoria="adopcion" onClick={() => abrirTema("adopcion","")}>
<span className="icono-tema">{" 🧡 "}</span>
<span>
<strong>{" Historias de adopción "}</strong>
<small>{" Experiencias de familias "}</small>
</span>
</button>
<button className="tema-comunidad" type="button" data-busqueda="gato" onClick={() => abrirTema("todas","gato")}>
<span className="icono-tema">{" 🐱 "}</span>
<span>
<strong>{" Adaptación de gatos "}</strong>
<small>{" Experiencias y consejos "}</small>
</span>
</button>
<button className="tema-comunidad" type="button" data-categoria="difusion" onClick={() => abrirTema("difusion","")}>
<span className="icono-tema">{" 📣 "}</span>
<span>
<strong>{" Difusión de patitas "}</strong>
<small>{" Ayuda a encontrar hogares "}</small>
</span>
</button>
</div>
</section>

<section className="tarjeta-comunidad">
<div className="titulo-tarjeta-lateral">
<h2>{" 🐾 Buscan un hogar "}</h2>
<a href="#animales" className="boton-texto">{" Ver todos "}</a>
</div>
<p className="descripcion-patitas">{" Algunas patitas que actualmente esperan encontrar una familia. "}</p>
<div className="patitas-destacadas" id="patitasDestacadas" aria-label="Animales que llevan más tiempo esperando">{destacados.map(animal => <a className="patita-destacada" key={animal.id} href={`#animal/${encodeURIComponent(animal.slug)}`}><div className="foto-patita"><img src={animal.imagen} alt={`${animal.nombre}, ${animal.especie === "perro" ? "perro" : "gato"} en adopción`} loading="lazy" /></div><strong>{animal.nombre}</strong><small>En adopción</small></a>)}</div>
</section>

<section className="tarjeta-comunidad tarjeta-orientacion">
<h2>{" ¿Necesitas orientación? "}</h2>
<p>{" Comparte, participa y ayuda a construir una comunidad consciente y comprometida con los animales. "}</p>
<a className="enlace-orientacion" href="#contacto">{" Contáctanos → "}</a>
</section>
</aside>
</div>
</div>
</section>
</main>
<footer className="pie-pagina">
<div className="contenedor pie-contenido">
<div className="marca-pie">
<strong>{" 🐾 PEH "}</strong>
<span>{" Patitas Esperando un Hogar "}</span>
</div>
<p className="frase-pie">{" Más que una plataforma, "}<span>{" una comunidad. 🧡 "}</span>
</p>
<div className="mascotas-pie" aria-hidden="true">{" ♡ 🐕 🐈 "}</div>
</div>
</footer>
 </>;
}
