import { useEffect, useRef, useState } from "react";

const consejos = {
        alimentacion: {
            titulo: "Alimentación adecuada",
            icono: "🥣",
            contenido: [
                "Una alimentación equilibrada debe adaptarse a la especie, edad, tamaño y estado de salud de tu mascota.",
                "Proporciona siempre agua fresca y mantén horarios regulares para sus comidas.",
                "Evita ofrecer alimentos que puedan resultar tóxicos para su especie.",
                "Consulta con un veterinario antes de realizar cambios importantes en su alimentación."
            ]
        },

        ejercicio: {
            titulo: "Ejercicio regular",
            icono: "🐾",
            contenido: [
                "La actividad física ayuda a mantener un peso saludable y favorece el bienestar emocional.",
                "Los perros necesitan paseos y actividades adaptadas a su edad, energía y condición física.",
                "Los gatos también necesitan jugar, explorar y disponer de espacios de estimulación.",
                "Evita actividades demasiado intensas durante temperaturas extremas."
            ]
        },

        controles: {
            titulo: "Visitas periódicas",
            icono: "🩺",
            contenido: [
                "Los controles veterinarios permiten detectar problemas de salud de manera temprana.",
                "Mantén al día las vacunas y los tratamientos antiparasitarios indicados por el profesional.",
                "Presta atención a cambios en el apetito, comportamiento o nivel de actividad.",
                "Ante dificultades respiratorias, convulsiones u otros signos graves, busca atención veterinaria urgente."
            ]
        }
    };

export default function ConsejosVeterinaria() {
 const [tipo,setTipo]=useState(null);
 const [abierto,setAbierto]=useState(false);
 const disparador=useRef(null),cerrarBoton=useRef(null);
 const consejo=consejos[tipo];
 useEffect(()=>{
  if(!abierto)return;
  const overflowAnterior=document.body.style.overflow;
  document.body.style.overflow="hidden";cerrarBoton.current?.focus();
  function teclado(e){
   if(e.key==="Escape")setAbierto(false);
   if(e.key==="Tab"){e.preventDefault();cerrarBoton.current?.focus();}
  }
  document.addEventListener("keydown",teclado);
  return ()=>{document.removeEventListener("keydown",teclado);document.body.style.overflow=overflowAnterior;disparador.current?.focus();};
 },[abierto]);
 function abrir(tipo,elemento){disparador.current=elemento;setTipo(tipo);setAbierto(true);}
 function cerrar(){setAbierto(false);}
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

<article className="tarjeta-consejo" data-consejo="alimentacion" role="button" tabIndex="0" aria-label="Ver consejos de alimentación" onClick={e => abrir("alimentacion", e.currentTarget)} onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir("alimentacion", e.currentTarget); } }}>
<span className="consejo-icono" aria-hidden="true">{" ◉ "}</span>
<div>
<h3>{" Alimentación adecuada "}</h3>
<p>{" Una dieta equilibrada y acorde a su edad fortalece su salud y sistema inmune. "}</p>
<span className="consejo-ver-mas">{" Ver más → "}</span>
</div>
</article>

<article className="tarjeta-consejo" data-consejo="ejercicio" role="button" tabIndex="0" aria-label="Ver consejos de ejercicio" onClick={e => abrir("ejercicio", e.currentTarget)} onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir("ejercicio", e.currentTarget); } }}>
<span className="consejo-icono" aria-hidden="true">{" ◌ "}</span>
<div>
<h3>{" Ejercicio regular "}</h3>
<p>{" La actividad diaria ayuda a mantener su salud física, emocional y mental. "}</p>
<span className="consejo-ver-mas">{" Ver más → "}</span>
</div>
</article>

<article className="tarjeta-consejo" data-consejo="controles" role="button" tabIndex="0" aria-label="Ver consejos de controles" onClick={e => abrir("controles", e.currentTarget)} onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir("controles", e.currentTarget); } }}>
<span className="consejo-icono" aria-hidden="true">{" ♥ "}</span>
<div>
<h3>{" Visitas periódicas "}</h3>
<p>{" La prevención permite detectar problemas a tiempo y entregar una mejor calidad de vida. "}</p>
<span className="consejo-ver-mas">{" Ver más → "}</span>
</div>
</article>
</div>
</div>
</section>
<div className="modal-consejo" id="modalConsejo" hidden={!abierto}>
<div className="modal-consejo-fondo" data-cerrar-modal="" onClick={cerrar}>
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
