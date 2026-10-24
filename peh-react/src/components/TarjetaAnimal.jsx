import { useState } from "react";
import { formatearSexo, formatearTamano, formatearEdad, formatearEspecie } from "../services/catalogo";

export default function TarjetaAnimal({ animal, compacta = false }) {
 const [sinImagen, setSinImagen] = useState(false);
 function abrirPerfil() { window.location.hash = `animal/${encodeURIComponent(animal.slug)}`; }
 return (
  <article className={"tarjeta-animal" + (compacta ? " tarjeta-animal-compacta" : "")} data-animal={animal.slug}
   tabIndex={0} role="link" aria-label={`Conocer a ${animal.nombre}`} onClick={abrirPerfil}
   onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirPerfil(); } }}>
   <div className={"contenedor-imagen-animal" + (sinImagen ? " imagen-no-disponible" : "")}>
    {sinImagen ? <span className="texto-imagen-no-disponible">{animal.nombre.charAt(0)}</span> :
     <img className="animal-imagen" src={animal.imagen} alt={`${animal.nombre}, ${formatearEspecie(animal)} en adopción`} loading="lazy" onError={() => setSinImagen(true)} />}
   </div>
   <div className="animal-informacion">
    <h3 className="animal-nombre">{animal.nombre}</h3>
    <p className="animal-personalidad">{animal.personalidad.slice(0,2).join(" · ")}</p>
    <p className="animal-ubicacion"><span aria-hidden="true">⌖</span>{" "}{animal.comuna}</p>
    <div className="animal-datos"><span>{formatearSexo(animal.sexo)}</span><span>{formatearTamano(animal.tamano)}</span><span>{formatearEdad(animal.edad)}</span></div>
    <span className="animal-accion">Conocer a {animal.nombre}{" "}<span aria-hidden="true">→</span></span>
   </div>
  </article>
 );
}
