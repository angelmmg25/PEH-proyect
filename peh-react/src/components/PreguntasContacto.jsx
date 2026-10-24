import { useState } from "react";
import { preguntas } from "../data/contacto";
export default function PreguntasContacto() {
 const [abierta,setAbierta]=useState(null);
 return <div className="lista-preguntas">{preguntas.map(([pregunta,respuesta],i)=><article key={pregunta} className={"pregunta-frecuente"+(abierta===i?" abierta":"")}>
  <button className="pregunta-boton" type="button" aria-expanded={abierta===i} onClick={()=>setAbierta(a=>a===i?null:i)}><span>{pregunta}</span><span className="pregunta-icono" aria-hidden="true">{abierta===i?"−":"+"}</span></button>
  <div className="pregunta-respuesta" hidden={abierta!==i}><p>{respuesta}</p></div>
 </article>)}</div>;
}
