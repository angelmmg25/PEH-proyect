import { useRef, useState } from "react";
import { enviarSolicitud } from "../services/adopcion";

const formularioVacio = {
 nombreAdoptante:"", edadAdoptante:"", correoAdoptante:"", telefonoAdoptante:"", comunaAdoptante:"",
 tipoVivienda:"", situacionVivienda:"", personasHogar:"", acuerdoFamiliar:"", otrosAnimales:"", detalleAnimales:"",
 experienciaAnimales:"", motivoAdopcion:"", cuidadosAnimal:"", aceptaCompromiso:false
};
export default function FormularioAdopcion({animal,onCancelar,onEnviada}) {
 const [datos,setDatos] = useState({...formularioVacio});
 const enviando = useRef(false);
 function cambiar(e) {
  const {name,type,value,checked} = e.target;
  setDatos(actual => ({...actual,[name]:type === "checkbox" ? checked : value}));
 }
 function enviar(e) {
  e.preventDefault();
  if(enviando.current || !e.currentTarget.reportValidity()) return;
  enviando.current = true;
  try {
   const resultado = enviarSolicitud(animal,datos);
   if(!resultado.ok) { window.alert(resultado.mensaje); return; }
   window.alert("¡Solicitud registrada! 🐾\n\nTu solicitud para adoptar a " + animal.nombre + " ha sido guardada correctamente.\n\nPuedes revisar su estado desde tu perfil.");
   setDatos({...formularioVacio});
   onEnviada(resultado.solicitud);
  } catch {
   window.alert("Ocurrió un problema al registrar tu solicitud. Inténtalo nuevamente.");
  } finally { enviando.current = false; }
 }
 return (
<form className="formulario-adopcion" id="formularioAdopcion" onSubmit={enviar}>

<fieldset className="grupo-formulario">
<legend>
<span>{" 1 "}</span>{" Sobre ti "}</legend>
<div className="fila-formulario">
<div className="campo-formulario">
<label htmlFor="nombreAdoptante">{" Nombre completo "}</label>
<input type="text" id="nombreAdoptante" name="nombreAdoptante" placeholder="Tu nombre completo" required value={datos.nombreAdoptante} onChange={cambiar} />
</div>
<div className="campo-formulario">
<label htmlFor="edadAdoptante">{" Edad "}</label>
<input type="number" id="edadAdoptante" name="edadAdoptante" min="18" placeholder="Ej: 25" required value={datos.edadAdoptante} onChange={cambiar} />
</div>
</div>
<div className="campo-formulario">
<label htmlFor="correoAdoptante">{" Correo electrónico "}</label>
<input type="email" id="correoAdoptante" name="correoAdoptante" placeholder="nombre@correo.cl" required value={datos.correoAdoptante} onChange={cambiar} />
</div>
<div className="fila-formulario">
<div className="campo-formulario">
<label htmlFor="telefonoAdoptante">{" Teléfono "}</label>
<input type="tel" id="telefonoAdoptante" name="telefonoAdoptante" placeholder="+56 9 1234 5678" required value={datos.telefonoAdoptante} onChange={cambiar} />
</div>
<div className="campo-formulario">
<label htmlFor="comunaAdoptante">{" Comuna "}</label>
<input type="text" id="comunaAdoptante" name="comunaAdoptante" placeholder="Ej: Macul" required value={datos.comunaAdoptante} onChange={cambiar} />
</div>
</div>
</fieldset>

<fieldset className="grupo-formulario">
<legend>
<span>{" 2 "}</span>{" Tu hogar "}</legend>
<div className="campo-formulario">
<label htmlFor="tipoVivienda">{" ¿En qué tipo de vivienda vives? "}</label>
<select id="tipoVivienda" name="tipoVivienda" required value={datos.tipoVivienda} onChange={cambiar}>
<option value="" disabled>{" Selecciona una opción "}</option>
<option value="casa">{" Casa "}</option>
<option value="departamento">{" Departamento "}</option>
<option value="parcela">{" Parcela "}</option>
<option value="otro">{" Otro "}</option>
</select>
</div>
<div className="campo-formulario">
<label>{" ¿La vivienda es propia o arrendada? "}</label>
<div className="opciones-formulario">
<label className="opcion-radio">
<input type="radio" name="situacionVivienda" value="propia" required checked={datos.situacionVivienda === "propia"} onChange={cambiar} />
<span>{" Propia "}</span>
</label>
<label className="opcion-radio">
<input type="radio" name="situacionVivienda" value="arrendada" checked={datos.situacionVivienda === "arrendada"} onChange={cambiar} />
<span>{" Arrendada "}</span>
</label>
<label className="opcion-radio">
<input type="radio" name="situacionVivienda" value="familiar" checked={datos.situacionVivienda === "familiar"} onChange={cambiar} />
<span>{" Familiar "}</span>
</label>
</div>
</div>
<div className="campo-formulario">
<label htmlFor="personasHogar">{" ¿Quiénes viven contigo? "}</label>
<textarea id="personasHogar" name="personasHogar" rows="3" placeholder="Cuéntanos brevemente quiénes forman parte de tu hogar..." required value={datos.personasHogar} onChange={cambiar}></textarea>
</div>
<div className="campo-formulario">
<label>{" ¿Todos están de acuerdo con la adopción? "}</label>
<div className="opciones-formulario">
<label className="opcion-radio">
<input type="radio" name="acuerdoFamiliar" value="si" required checked={datos.acuerdoFamiliar === "si"} onChange={cambiar} />
<span>{" Sí "}</span>
</label>
<label className="opcion-radio">
<input type="radio" name="acuerdoFamiliar" value="no" checked={datos.acuerdoFamiliar === "no"} onChange={cambiar} />
<span>{" No "}</span>
</label>
</div>
</div>
</fieldset>

<fieldset className="grupo-formulario">
<legend>
<span>{" 3 "}</span>{" Experiencia y convivencia "}</legend>
<div className="campo-formulario">
<label>{" ¿Actualmente tienes otros animales? "}</label>
<div className="opciones-formulario">
<label className="opcion-radio">
<input type="radio" name="otrosAnimales" value="si" required checked={datos.otrosAnimales === "si"} onChange={cambiar} />
<span>{" Sí "}</span>
</label>
<label className="opcion-radio">
<input type="radio" name="otrosAnimales" value="no" checked={datos.otrosAnimales === "no"} onChange={cambiar} />
<span>{" No "}</span>
</label>
</div>
</div>
<div className="campo-formulario">
<label htmlFor="detalleAnimales">{" Si tienes animales, cuéntanos sobre ellos "}</label>
<textarea id="detalleAnimales" name="detalleAnimales" rows="3" placeholder="Especie, edad, personalidad, etc." value={datos.detalleAnimales} onChange={cambiar}></textarea>
</div>
<div className="campo-formulario">
<label>{" ¿Has cuidado animales anteriormente? "}</label>
<div className="opciones-formulario">
<label className="opcion-radio">
<input type="radio" name="experienciaAnimales" value="si" required checked={datos.experienciaAnimales === "si"} onChange={cambiar} />
<span>{" Sí "}</span>
</label>
<label className="opcion-radio">
<input type="radio" name="experienciaAnimales" value="no" checked={datos.experienciaAnimales === "no"} onChange={cambiar} />
<span>{" No "}</span>
</label>
</div>
</div>
</fieldset>

<fieldset className="grupo-formulario">
<legend>
<span>{" 4 "}</span>{" Sobre " + animal.nombre + " "}</legend>
<div className="campo-formulario">
<label htmlFor="motivoAdopcion">{" ¿Por qué quieres adoptar a " + animal.nombre + "? "}</label>
<textarea id="motivoAdopcion" name="motivoAdopcion" rows="4" placeholder="Cuéntanos qué te motivó a elegirlo..." required value={datos.motivoAdopcion} onChange={cambiar}></textarea>
</div>
<div className="campo-formulario">
<label htmlFor="cuidadosAnimal">{" ¿Cómo organizarías sus cuidados diarios? "}</label>
<textarea id="cuidadosAnimal" name="cuidadosAnimal" rows="4" placeholder="Paseos, alimentación, compañía, veterinario..." required value={datos.cuidadosAnimal} onChange={cambiar}></textarea>
</div>
</fieldset>

<fieldset className="grupo-formulario compromiso-adopcion">
<legend>
<span>{" 5 "}</span>{" Compromiso de adopción "}</legend>
<p>{" Adoptar significa asumir un compromiso responsable con el bienestar del animal durante toda su vida. "}</p>
<label className="opcion-compromiso">
<input type="checkbox" id="aceptaCompromiso" name="aceptaCompromiso" required checked={datos.aceptaCompromiso} onChange={cambiar} />
<span>{" Entiendo que enviar esta solicitud no garantiza automáticamente la adopción y acepto participar en el proceso de evaluación de PEH. "}</span>
</label>
</fieldset>

<div className="acciones-formulario">
<button className="boton-cancelar-adopcion" id="cancelarAdopcion" type="button" onClick={onCancelar}>{" Cancelar "}</button>
<button className="boton-enviar-solicitud" type="submit">
<span aria-hidden="true">{" 🐾 "}</span>{" Enviar solicitud "}</button>
</div>
</form>
 );
}
