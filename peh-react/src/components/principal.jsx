/* Componentes de la vista principal.
 * La lógica de estado y procesos se obtiene de hooks.
 */
import { useCarruselPrincipal, useTarjetaAnimal } from '../hooks/principal.js';
import { diapositivas } from '../data/principal.js';
import { formatearSexo, formatearTamano, formatearEdad, formatearEspecie } from '../services/global.js';
import { Navegacion } from './global.jsx';
import { textoResultados } from '../services/principal.js';
/* CarruselPrincipal */

export function CarruselPrincipal() {
 const { diapositiva, setDiapositiva, actual, desplazar } = useCarruselPrincipal();

 return (
<section className="hero-principal" aria-label="Destacados de PEH" aria-roledescription="carrusel">
<div className="carrusel-ventana">
{/* La primera diapositiva determina siempre el tamaño, incluso cuando está oculta. */}
<div className="contenedor hero-contenido carrusel-medida" aria-hidden="true" inert={true}>
<div className="hero-texto"><span className="hero-etiqueta">{diapositivas[0].etiqueta}</span>
<h1>{diapositivas[0].titulo}{" "}<span>{diapositivas[0].destacado}</span></h1>
<p>{diapositivas[0].texto}</p><span className="boton boton-primario hero-boton peh-boton-fondo">Conocerlos <span>↓</span></span>
</div><div className="hero-imagen" /></div>
<div className="contenedor hero-contenido carrusel-diapositiva" key={diapositiva} role="group" aria-roledescription="diapositiva" aria-label={`${diapositiva + 1} de 4: ${actual.etiqueta}`} aria-live="polite">
<div className="hero-texto">
<span className="hero-etiqueta">{actual.etiqueta}</span>
<h1>{actual.titulo}{" "}{actual.destacado && <span>{actual.destacado}</span>}</h1>
<p>{actual.texto}</p>
<a className="boton boton-primario hero-boton peh-boton-fondo" href={actual.enlace}>{actual.boton}{" "}<span aria-hidden="true">{actual.flecha}</span></a>
</div>
<div className={`hero-imagen${diapositiva ? " hero-imagen-seccion hero-imagen-" + actual.etiqueta.toLowerCase() : ""}`} style={{backgroundImage: `url("${actual.imagen}")`}} >
{diapositiva === 0 ? <div className="hero-mensaje hero-mensaje-inicio"><span>Una nueva historia</span><span>puede comenzar</span><strong>hoy.</strong></div>:<p className={'hero-frase-imagen'+(actual.etiqueta==='Contacto'?' frase-contacto':'')}>{actual.frase}</p>}
</div>
</div>
</div>
<div className="contenedor carrusel-controles" aria-label="Controles del carrusel">
<button type="button" className="carrusel-flecha" aria-label="Diapositiva anterior" onClick={() => desplazar(-1)}>‹</button>
<div className="carrusel-indicadores">
{diapositivas.map((item, indice) => <button type="button" key={item.etiqueta} className="carrusel-punto" aria-label={`Mostrar ${indice === 0 ? "Inicio" : item.etiqueta}`} aria-current={indice === diapositiva ? "true" : undefined} onClick={() => setDiapositiva(indice)} />)}
</div>
<button type="button" className="carrusel-flecha" aria-label="Diapositiva siguiente" onClick={() => desplazar(1)}>›</button>
</div>
</section>
 );
}

/* TarjetaAnimal */

export function TarjetaAnimal({ animal, compacta = false }) {
 const { sinImagen, setSinImagen, abrirPerfil , tecladoTarjeta , abrirDesdeBoton } = useTarjetaAnimal({ animal });
 
 return (
  <article className={"tarjeta-animal peh-tarjeta-interactiva" + (compacta ? " tarjeta-animal-compacta" : "")} data-animal={animal.slug}
   tabIndex={0} role="link" aria-label={`Conocer a ${animal.nombre}`} onClick={abrirPerfil}
   onKeyDown={tecladoTarjeta}>
   <div className={"contenedor-imagen-animal" + (sinImagen ? " imagen-no-disponible" : "")}>
    {sinImagen ? <span className="texto-imagen-no-disponible">{animal.nombre.charAt(0)}</span> :
     <img className="animal-imagen" src={animal.imagen} alt={`${animal.nombre}, ${formatearEspecie(animal)} en adopción`} loading="lazy" onError={() => setSinImagen(true)} />}
   </div>
   <div className="animal-informacion">
    <h3 className="animal-nombre">{animal.nombre}</h3>
    <p className="animal-personalidad">{animal.personalidad.slice(0,2).join(" · ")}</p>
    <p className="animal-ubicacion"><span aria-hidden="true">⌖</span>{" "}{animal.comuna}</p>
    <div className="animal-datos"><span>{formatearSexo(animal.sexo)}</span><span>{formatearTamano(animal.tamano)}</span><span>{formatearEdad(animal)}</span></div>
    <button type="button" className="animal-accion peh-boton-fondo" onClick={abrirDesdeBoton} onKeyDown={e=>e.stopPropagation()}>Conocer a {animal.nombre}</button>
   </div>
  </article>
 );
}

/* Presentación de Principal */

export function VistaPrincipal({ cuentaCabecera, cargando, error, recargar, filtros, filtrosAbiertos, setFiltrosAbiertos, cambiarFiltro, limpiarFiltros, resultados, espera }) {
return <>
  <Navegacion pagina="inicio" cuenta={cuentaCabecera} />
<main className="inicio-peh">

<CarruselPrincipal />

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
<p id="textoResultados">{cargando ? "Cargando compañeros…" : error ? "No pudimos cargar el catálogo." : textoResultados(resultados.length, filtros.especie)}</p>
</div>

{error && <div role="alert"><p>{error}</p><button type="button" className="boton boton-secundario" onClick={recargar}>Reintentar</button></div>}
<div className="catalogo-animales" id="catalogoAnimales" aria-live="polite" aria-busy={cargando}>{cargando ? <p role="status">Cargando compañeros…</p> : error ? null : filtros.especie === "otro" ? <p className="aviso-proximamente">Otros animales · Próximamente. Por ahora puedes conocer a nuestros perros y gatos.</p> : resultados.map(animal => <TarjetaAnimal key={animal.id} animal={animal} />)}</div>

<div className="sin-resultados" id="sinResultados" hidden={cargando || Boolean(error) || filtros.especie === "otro" || resultados.length > 0}>
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

<div className="animales-espera" id="animalesEspera">{!cargando && !error && espera.map(animal => <TarjetaAnimal key={animal.id} animal={animal} compacta />)}</div>
</div>
</div>
</section>

<section className="seccion-comunidad">
<div className="contenedor comunidad-contenido">
<div className="comunidad-presentacion">
<span className="sobre-titulo">{" Tu comunidad "}</span>
<h2>{" Ayudar también puede empezar cerca de ti. "}</h2>
<p>{" Descubre publicaciones, actividades y animales que necesitan ayuda en tu comuna y sectores cercanos. "}</p>
<a className="boton boton-secundario peh-boton-fondo" href="#comunidad">{" Ir a Comunidad "}<span aria-hidden="true">→</span></a>
</div>
<div className="opciones-comunidad d-flex flex-column flex-lg-row">
<a className="tarjeta-comunidad flex-fill w-100 peh-tarjeta-interactiva" href="#comunidad/perdidos">
<span className="icono-comunidad" aria-hidden="true">{" ? "}</span>
<div>
<h3>{" Animales perdidos "}</h3>
<p>{" Ayuda a que puedan volver a casa. "}</p>
</div>
<span className="flecha-tarjeta" aria-hidden="true">{" → "}</span>
</a>
<a className="tarjeta-comunidad flex-fill w-100 peh-tarjeta-interactiva" href="#comunidad/encontrados">
<span className="icono-comunidad" aria-hidden="true">{" + "}</span>
<div>
<h3>{" Animales encontrados "}</h3>
<p>{" Informa sobre un animal que necesita ayuda. "}</p>
</div>
<span className="flecha-tarjeta" aria-hidden="true">{" → "}</span>
</a>
<a className="tarjeta-comunidad flex-fill w-100 peh-tarjeta-interactiva" href="#comunidad/jornadas">
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
<a className="boton boton-primario peh-boton-fondo" href="#veterinaria">{" Ver veterinaria "}<span aria-hidden="true">→</span></a>
</div>
</section>
</main>

 </>;
}
