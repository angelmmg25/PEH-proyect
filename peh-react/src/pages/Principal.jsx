import { useEffect, useState } from "react";
import useCatalogo from "../hooks/useCatalogo";
import TarjetaAnimal from "../components/TarjetaAnimal";
import Navegacion from "../components/Navegacion";
import { filtrosIniciales, obtenerAnimalesFiltrados, textoResultados, animalesConMasEspera } from "../services/catalogo";
import "../styles/principal.css";

export default function Principal({ soloAnimales = false }) {
 const animales = useCatalogo();
 const [filtros, setFiltros] = useState({...filtrosIniciales});
 const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
 useEffect(() => {
  document.body.classList.add("pagina-principal");
  document.title = "PEH | Encuentra a tu compañero";
  return () => document.body.classList.remove("pagina-principal");
 }, []);
 useEffect(() => {
  // Animales es un ancla del mismo inicio, como principal.html#animales.
  const frame = requestAnimationFrame(() => {
   if(soloAnimales) document.getElementById("animales")?.scrollIntoView({behavior:"instant"});
   else window.scrollTo(0,0);
  });
  return () => cancelAnimationFrame(frame);
 }, [soloAnimales]);
 function cambiarFiltro(campo, valor) { setFiltros(actual => ({...actual, [campo]:valor})); }
 function limpiarFiltros() { setFiltros({...filtrosIniciales}); }
 const resultados = obtenerAnimalesFiltrados(animales, filtros);
 const espera = animalesConMasEspera(animales);
 return <>
  <Navegacion pagina="inicio" />
<main className="inicio-peh">

<section className="hero-principal">
<div className="contenedor hero-contenido">
<div className="hero-texto">
<span className="hero-etiqueta">{" Patitas Esperando un Hogar "}</span>
<h1>{" Encuentra a quien "}<span>{" estaba esperando por ti. "}</span>
</h1>
<p>{" Conoce animales que buscan una nueva oportunidad y descubre quién podría convertirse en tu próximo compañero. "}</p>
<a className="boton boton-primario hero-boton" href="#animales">{" Conocerlos "}<span aria-hidden="true">{" ↓ "}</span>
</a>
</div>

<div className="hero-imagen" aria-hidden="true">
<div className="hero-mensaje">
<span>{" Una nueva historia "}</span>{" puede comenzar hoy. "}</div>
</div>
</div>
</section>

<section className="seccion-animales" id="animales">
<div className="contenedor">

<div className="encabezado-seccion">
<div>
<span className="sobre-titulo">{" Adopción "}</span>
<h2>{" Encuentra a tu compañero "}</h2>
<p>{" Conoce sus historias, personalidades y el tipo de hogar que necesitan. "}</p>
</div>
</div>

<div className="barra-filtros" aria-label="Filtros de animales">

<div className="filtros-especie" role="group" aria-label="Filtrar por especie">
<button className={"filtro-especie" + (filtros.especie === "todos" ? " activo" : "")} type="button" data-especie="todos" onClick={() => cambiarFiltro("especie", "todos")} aria-pressed={filtros.especie === "todos"}>{" Todos "}</button>
<button className={"filtro-especie" + (filtros.especie === "perro" ? " activo" : "")} type="button" data-especie="perro" onClick={() => cambiarFiltro("especie", "perro")} aria-pressed={filtros.especie === "perro"}>{" Perros "}</button>
<button className={"filtro-especie" + (filtros.especie === "gato" ? " activo" : "")} type="button" data-especie="gato" onClick={() => cambiarFiltro("especie", "gato")} aria-pressed={filtros.especie === "gato"}>{" Gatos "}</button>
<button className={"filtro-especie" + (filtros.especie === "otro" ? " activo" : "")} type="button" data-especie="otro" onClick={() => cambiarFiltro("especie", "otro")} aria-pressed={filtros.especie === "otro"}>{" Otros · Próximamente "}</button>
</div>

<div className="filtros-secundarios">
<label className="selector-filtro" htmlFor="filtroComuna">
<span>{" Comuna "}</span>
<select id="filtroComuna" value={filtros.comuna} onChange={e => cambiarFiltro("comuna", e.target.value)}>
<option value="todas">{" Todas "}</option>
<option value="macul">{" Macul "}</option>
<option value="nunoa">{" Ñuñoa "}</option>
<option value="la-florida">{" La Florida "}</option>
<option value="puente-alto">{" Puente Alto "}</option>
<option value="penalolen">{" Peñalolén "}</option>
<option value="san-miguel">{" San Miguel "}</option>
</select>
</label>
<button className="boton-mas-filtros" id="botonMasFiltros" type="button" aria-expanded={filtrosAbiertos} aria-controls="panelFiltros" onClick={() => setFiltrosAbiertos(valor => !valor)}>{" Más filtros "}<span aria-hidden="true">{filtrosAbiertos ? "−" : "+"}</span>
</button>
</div>
</div>

<div className="panel-filtros" id="panelFiltros" hidden={!filtrosAbiertos}>

<div className="grupo-filtro">
<label htmlFor="filtroTamano">{" Tamaño "}</label>
<select id="filtroTamano" value={filtros.tamano} onChange={e => cambiarFiltro("tamano", e.target.value)}>
<option value="todos">{" Todos "}</option>
<option value="pequeno">{" Pequeño "}</option>
<option value="mediano">{" Mediano "}</option>
<option value="grande">{" Grande "}</option>
</select>
</div>

<div className="grupo-filtro">
<label htmlFor="filtroHogar">{" Tipo de hogar "}</label>
<select id="filtroHogar" value={filtros.hogar} onChange={e => cambiarFiltro("hogar", e.target.value)}>
<option value="todos">{" Cualquiera "}</option>
<option value="departamento">{" Departamento "}</option>
<option value="casa">{" Casa "}</option>
<option value="espacio-amplio">{" Espacio amplio "}</option>
</select>
</div>

<div className="grupo-filtro">
<label htmlFor="filtroConvivencia">{" Convivencia "}</label>
<select id="filtroConvivencia" value={filtros.convivencia} onChange={e => cambiarFiltro("convivencia", e.target.value)}>
<option value="todos">{" Sin preferencia "}</option>
<option value="ninos">{" Convive con niños "}</option>
<option value="perros">{" Convive con perros "}</option>
<option value="gatos">{" Convive con gatos "}</option>
</select>
</div>

<div className="grupo-filtro">
<label htmlFor="filtroSexo">{" Sexo "}</label>
<select id="filtroSexo" value={filtros.sexo} onChange={e => cambiarFiltro("sexo", e.target.value)}>
<option value="todos">{" Todos "}</option>
<option value="macho">{" Macho "}</option>
<option value="hembra">{" Hembra "}</option>
</select>
</div>

<div className="grupo-filtro">
<label htmlFor="filtroEdad">{" Edad "}</label>
<select id="filtroEdad" value={filtros.edad} onChange={e => cambiarFiltro("edad", e.target.value)}>
<option value="todas">{" Sin preferencia "}</option>
<option value="menos-2">{" Hasta 2 años "}</option>
<option value="2-7">{" Entre 2 y 7 años "}</option>
<option value="mas-7">{" Más de 7 años "}</option>
</select>
</div>
<button className="limpiar-filtros" id="botonLimpiarFiltros" type="button" onClick={limpiarFiltros}>{" Limpiar filtros "}</button>
</div>

<div className="informacion-resultados">
<p id="textoResultados">{textoResultados(resultados.length, filtros.especie)}</p>
</div>

<div className="catalogo-animales" id="catalogoAnimales" aria-live="polite">{filtros.especie === "otro" ? <p className="aviso-proximamente">Otros animales · Próximamente. Por ahora puedes conocer a nuestros perros y gatos.</p> : resultados.map(animal => <TarjetaAnimal key={animal.id} animal={animal} />)}</div>

<div className="sin-resultados" id="sinResultados" hidden={filtros.especie === "otro" || resultados.length > 0}>
<span className="sin-resultados-icono" aria-hidden="true">{" ♡ "}</span>
<h3>{" No encontramos coincidencias "}</h3>
<p>{" Prueba cambiando algunos filtros. Puede haber un compañero esperándote un poco más allá. "}</p>
<button className="boton boton-secundario" id="botonRestablecerFiltros" type="button" onClick={limpiarFiltros}>{" Ver todos "}</button>
</div>
</div>
</section>

<section className="seccion-espera">
<div className="contenedor">
<div className="bloque-espera">
<div className="texto-espera">
<span className="sobre-titulo">{" Una oportunidad más "}</span>
<h2>{" Llevan un poco más esperando "}</h2>
<p>{" Algunos compañeros aún no han encontrado el lugar indicado. Aquí les damos un poco más de espacio para que puedan ser conocidos. "}</p>
</div>

<div className="animales-espera" id="animalesEspera">{espera.map(animal => <TarjetaAnimal key={animal.id} animal={animal} compacta />)}</div>
</div>
</div>
</section>

<section className="seccion-comunidad">
<div className="contenedor comunidad-contenido">
<div className="comunidad-presentacion">
<span className="sobre-titulo">{" Tu comunidad "}</span>
<h2>{" Ayudar también puede empezar cerca de ti. "}</h2>
<p>{" Descubre publicaciones, actividades y animales que necesitan ayuda en tu comuna y sectores cercanos. "}</p>
<a className="boton boton-secundario" href="#comunidad">{" Ir a Comunidad "}</a>
</div>
<div className="opciones-comunidad d-flex flex-column flex-lg-row">
<a className="tarjeta-comunidad flex-fill w-100" href="#comunidad/perdidos">
<span className="icono-comunidad" aria-hidden="true">{" ? "}</span>
<div>
<h3>{" Animales perdidos "}</h3>
<p>{" Ayuda a que puedan volver a casa. "}</p>
</div>
<span className="flecha-tarjeta" aria-hidden="true">{" → "}</span>
</a>
<a className="tarjeta-comunidad flex-fill w-100" href="#comunidad/encontrados">
<span className="icono-comunidad" aria-hidden="true">{" + "}</span>
<div>
<h3>{" Animales encontrados "}</h3>
<p>{" Informa sobre un animal que necesita ayuda. "}</p>
</div>
<span className="flecha-tarjeta" aria-hidden="true">{" → "}</span>
</a>
<a className="tarjeta-comunidad flex-fill w-100" href="#comunidad/jornadas">
<span className="icono-comunidad" aria-hidden="true">{" ○ "}</span>
<div>
<h3>{" Jornadas y actividades "}</h3>
<p>{" Conoce eventos y campañas de tu sector. "}</p>
</div>
<span className="flecha-tarjeta" aria-hidden="true">{" → "}</span>
</a>
</div>
</div>
</section>

<section className="seccion-veterinaria">
<div className="contenedor veterinaria-contenido">
<div>
<span className="sobre-titulo">{" Cuidado "}</span>
<h2>{" Su bienestar también forma parte de la historia. "}</h2>
<p>{" Reserva servicios veterinarios para cuidar a tu compañero antes y después de la adopción. "}</p>
</div>
<a className="boton boton-primario" href="#veterinaria">{" Ver veterinaria "}</a>
</div>
</section>
</main>
<footer className="pie-pagina pie-inicio">
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
