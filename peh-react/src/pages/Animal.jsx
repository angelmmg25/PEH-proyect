import { AvisoAdopcionInvitado } from "../components/AccesoRequerido.jsx";
import PEH from "../services/peh.js";
import { formatearEdad } from "../services/catalogo";
import { useEffect, useState } from "react";
import Navegacion from "../components/Navegacion";
import FormularioAdopcion from "../components/FormularioAdopcion";
import "../styles/animal.css";

const etiquetasHogar = {casa:"Casa", departamento:"Departamento", "espacio-amplio":"Espacio amplio"};
export default function Animal({animal,onIniciarSesion}) {
 const [adoptando, setAdoptando] = useState(false);
 const [avisoInvitado,setAvisoInvitado] = useState(false);
 const sesionAnimal=PEH.sesion.obtener();
 const puedeCompletar=Boolean(sesionAnimal?.id && !sesionAnimal.invitado);
 useEffect(() => {
  document.body.classList.add("pagina-animal");
  document.title = animal ? `${animal.nombre} | PEH` : "Animal no disponible | PEH";
  return () => { document.body.classList.remove("pagina-animal", "adopcion-activa"); };
 }, [animal]);
 useEffect(() => {
  document.body.classList.toggle("adopcion-activa", adoptando);
  return () => document.body.classList.remove("adopcion-activa");
 }, [adoptando]);
 function abrirAdopcion() { if (animal.estadoPerfil !== "disponible") return; const usuario = PEH.sesion.obtener(); if (!usuario?.id || usuario.invitado) { setAvisoInvitado(true); return; } setAdoptando(true); window.scrollTo({top:0,behavior:"smooth"}); }
 function cerrarAdopcion() { setAdoptando(false); window.scrollTo({top:0,behavior:"smooth"}); }
 function verHistoria(e) {
  // Un ancla local no debe sustituir la ruta #animal/... de la aplicación.
  e.preventDefault(); document.getElementById("historiaAnimal")?.scrollIntoView();
 }
 if(!animal) return <><Navegacion pagina="animales" /><div className="estructura-animal" id="perfilAnimal"><p>Este animal no está disponible. Vuelve al catálogo para conocer a nuestros perros y gatos.</p><a href="#animales">Volver al catálogo</a></div></>;
 const capitalizar = texto => texto.charAt(0).toUpperCase() + texto.slice(1);
 const tamano = {pequeno:"Pequeño", mediano:"Mediano", grande:"Grande"}[animal.tamano];
 const edad = formatearEdad(animal) + " aprox.";
 const sexo = capitalizar(animal.sexo);
 const ubicacion = animal.comuna + ", Santiago";
 const resumen = ["📍 " + ubicacion, "🗓 " + edad, sexo, tamano];
 const datosAdopcion = ["🗓 " + edad, sexo, tamano, "📍 " + ubicacion];
 const basicos = [edad, sexo, tamano, capitalizar(animal.especie), ubicacion, animal.diasEsperando + " días"];
 return <>
  <Navegacion pagina="animales" />
<div className={"estructura-animal" + (adoptando ? " perfil-oculto" : "")} id="perfilAnimal" inert={adoptando}>

<main className="contenido-animal">
<div className="contenedor-animal">
<a className="volver-catalogo" href="#animales">
<span aria-hidden="true">{" ← "}</span>{" Volver a los animales "}</a>

<section className="presentacion-animal">

<div className="columna-fotografias">
<div className="carrusel-animal" id="carruselAnimal">
<div className="contenedor-imagen-animal">
<img id="imagenAnimal" src={animal.imagen} alt={animal.nombre + " esperando un hogar"} />
<button className="boton-carrusel anterior" id="imagenAnterior" type="button" aria-label="Ver fotografía anterior" hidden>{" ‹ "}</button>
<button className="boton-carrusel siguiente" id="imagenSiguiente" type="button" aria-label="Ver fotografía siguiente" hidden>{" › "}</button>
</div>
<div className="indicadores-carrusel" id="indicadoresCarrusel" aria-label={"Fotografías de " + animal.nombre} hidden><button type="button" className="indicador-carrusel activo" aria-label="Ver fotografía 1" /></div>
</div>

</div>

<div className="informacion-principal-animal">
<div className="encabezado-animal">
<div>
<h1 id="nombreAnimal">{" " + animal.nombre + " "}</h1>
<div className="datos-resumen-animal">
<span>{resumen[0]}</span>
<span>{resumen[1]}</span>
<span>{resumen[2]}</span>
<span>{resumen[3]}</span>
</div>
</div>
<span className="estado-adopcion">{" 🐾 En adopción "}</span>
</div>
<p className="introduccion-adopcion">{" Conoce su historia y el tipo de hogar que necesita. "}</p>

<div className="etiquetas-personalidad" aria-label="Personalidad">{animal.personalidad.map(rasgo => <span key={rasgo}>{"♥ " + rasgo}</span>)}</div>
<button className="boton-adoptar" id="botonAdoptar" type="button" aria-controls="modoAdopcion" disabled={animal.estadoPerfil !== "disponible"} onClick={abrirAdopcion}>
<span aria-hidden="true">{" 🐾 "}</span>{animal.estadoPerfil === "disponible" ? " Adoptar a " + animal.nombre + " " : " Adopción en proceso "}<span className="flecha-adoptar" aria-hidden="true">{" → "}</span>
</button>
<a className="enlace-historia-animal" href="#historiaAnimal" onClick={verHistoria}>{" Conoce su historia ↓ "}</a>
</div>
</section>

<article className="historia-animal" id="historiaAnimal">
<h2>{" Su historia "}<span aria-hidden="true">{" ♥ "}</span>
</h2>
<p>{animal.historia[0]}</p>
<p>{animal.historia[1]}</p>
<blockquote>{"“" + animal.nombre + ": " + animal.personalidad.join(", ").toLowerCase() + ".”"}</blockquote>
</article>
<section className="detalles-animal">

<article className="tarjeta-detalle informacion-basica">
<h2>
<span aria-hidden="true">{" ● "}</span>{" Información básica "}</h2>
<dl className="lista-datos-animal">
<div>
<dt>{" Edad: "}</dt>
<dd>{basicos[0]}</dd>
</div>
<div>
<dt>{" Sexo: "}</dt>
<dd>{basicos[1]}</dd>
</div>
<div>
<dt>{" Tamaño: "}</dt>
<dd>{basicos[2]}</dd>
</div>
<div>
<dt>{" Especie: "}</dt>
<dd>{basicos[3]}</dd>
</div>
<div>
<dt>{" Ubicación: "}</dt>
<dd>{basicos[4]}</dd>
</div>
<div>
<dt>{" Esperando: "}</dt>
<dd>{basicos[5]}</dd>
</div>
</dl>
</article>

<article className="tarjeta-detalle salud-cuidados">
<h2>
<span aria-hidden="true">{" ✚ "}</span>{" Salud y cuidados "}</h2>
<dl className="lista-datos-animal">
<div>
<dt>{" Vacunas: "}</dt>
<dd>{"Consultar con la persona responsable"}</dd>
</div>
<div>
<dt>{" Esterilización: "}</dt>
<dd>{"Por confirmar"}</dd>
</div>
<div>
<dt>{" Estado de salud: "}</dt>
<dd>{"Consultar evaluaci\u00f3n veterinaria"}</dd>
</div>
<div className="dato-cuidados-especiales">
<dt>{" Cuidados especiales: "}</dt>
<dd>{animal.cuidados}</dd>
</div>
</dl>
</article>

<article className="tarjeta-detalle convivencia-animal">
<h2>
<span aria-hidden="true">{" ⌂ "}</span>{" Convivencia "}</h2>
<dl className="lista-convivencia">
<div>
<dt>{" 🐶 Con perros "}</dt>
<dd>{animal.convivencia.includes("perros") ? "Se lleva bien" : "Requiere adaptación"}</dd>
</div>
<div>
<dt>{" 🐱 Con gatos "}</dt>
<dd>{animal.convivencia.includes("gatos") ? "Se lleva bien" : "Requiere adaptación"}</dd>
</div>
<div>
<dt>{" 👧 Con niños "}</dt>
<dd>{animal.convivencia.includes("ninos") ? "Sí, con supervisión" : "Consultar adaptación"}</dd>
</div>
<div>
<dt>{" 🏠 Tipo de hogar "}</dt>
<dd>{animal.hogar.map(h => etiquetasHogar[h]).join(" o ")}</dd>
</div>
</dl>
</article>
</section>

<section className="mensaje-oportunidad">
<span aria-hidden="true">{" 🐾 "}</span>
<p>{" Aquí buscamos darles a todos una oportunidad. "}</p>
<span aria-hidden="true">{" ♡ "}</span>
</section>
</div>
</main>
</div>
{puedeCompletar && <section className={"modo-adopcion" + (adoptando ? " activo" : "")} id="modoAdopcion" aria-hidden={!adoptando} inert={!adoptando}>

<div className="panel-formulario-adopcion">

<div className="encabezado-formulario">
<button className="boton-volver-perfil" id="volverPerfil" type="button" onClick={cerrarAdopcion}>{" ← Volver al perfil "}</button>
<div className="titulo-formulario">
<span className="icono-formulario">{" 🐾 "}</span>
<div>
<p className="etiqueta-formulario">{" Solicitud de adopción "}</p>
<h2>{animal.estadoPerfil === "disponible" ? " Adoptar a " + animal.nombre + " " : " Adopción en proceso "}</h2>
</div>
</div>
<p className="introduccion-formulario">{" Queremos conocerte un poquito mejor. Tus respuestas nos ayudarán a encontrar el hogar más adecuado para " + animal.nombre + ". "}</p>
</div>

<FormularioAdopcion key={animal.id} animal={animal} onCancelar={cerrarAdopcion} onEnviada={cerrarAdopcion} />
</div>

<aside className="panel-animal-adopcion">
<div className="animal-adopcion-sticky">
<div className="imagen-adopcion">
<img id="imagenAnimalAdopcion" src={animal.imagen} alt={animal.nombre + " esperando un hogar"} />
<span className="estado-adopcion-formulario">{" 🐾 En adopción "}</span>
</div>
<div className="resumen-animal-adopcion">
<p className="peh-presenta">{" Estás solicitando adoptar a "}</p>
<h2>{" " + animal.nombre + " "}</h2>
<div className="datos-adopcion">
<span>{datosAdopcion[0]}</span>
<span>{datosAdopcion[1]}</span>
<span>{datosAdopcion[2]}</span>
<span>{datosAdopcion[3]}</span>
</div>
<div className="recordatorio-adopcion">
<span>{" ♡ "}</span>
<p>{" La adopción es para toda la vida. Gracias por considerar darle una oportunidad a " + animal.nombre + ". "}</p>
</div>
</div>
</div>
</aside>
</section>}
{avisoInvitado && <AvisoAdopcionInvitado onIniciarSesion={onIniciarSesion} onCerrar={()=>setAvisoInvitado(false)}/>} 
 </>;
}
