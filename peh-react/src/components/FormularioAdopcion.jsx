import useBorrador, { AvisoBorrador } from "../hooks/useBorrador.jsx";
import { useRef, useState } from "react";
import { enviarSolicitud, datosInicialesAdopcion, erroresSolicitud, limpiarCondicionales } from "../services/adopcion";

const formularioVacio = {
 nombreAdoptante:"", edadAdoptante:"", correoAdoptante:"", telefonoAdoptante:"", comunaAdoptante:"",
 tipoVivienda:"", situacionVivienda:"", viveConPersonas:"", personasHogar:"", acuerdoFamiliar:"", otrosAnimales:"", detalleAnimales:"",
 experienciaAnimales:"", motivoAdopcion:"", cuidadosAnimal:"", aceptaCompromiso:false
};
export default function FormularioAdopcion({animal,onCancelar,onEnviada}) {
 const [datos,setDatos,borrador] = useBorrador("adopcion:" + animal.id, () => ({...formularioVacio, ...datosInicialesAdopcion()}));
 const [errores,setErrores] = useState({}), [mensaje,setMensaje] = useState("");
 const [revisado,setRevisado] = useState(false);
 const errorCampo = campo => <span id={"error-" + campo} className="error-campo-adopcion" aria-live="polite">{errores[campo] || ""}</span>;
 const enviando = useRef(false);
 function cambiar(e) {
  const {name,type,value,checked} = e.target;
  const nuevos = limpiarCondicionales({...datos,[name]:type === "checkbox" ? checked : value});
  setDatos(nuevos);
  const validacion = erroresSolicitud(nuevos);
  setErrores(actual => revisado ? validacion : {...actual,[name]:validacion[name] || "", ...(name === "viveConPersonas" && value === "no" ? {personasHogar:"",acuerdoFamiliar:""} : {}), ...(name === "otrosAnimales" && value === "no" ? {detalleAnimales:""} : {})});
 }
 function revisarAlSalir(e) {
  const campo = e.target.name;
  if (!campo) return;
  const validacion = erroresSolicitud(datos);
  setErrores(actual => ({...actual,[campo]:validacion[campo] || ""}));
 }
 function enviar(e) {
  e.preventDefault();
  if(enviando.current) return;
  const nuevosErrores = erroresSolicitud(datos);setErrores(nuevosErrores);setRevisado(true);setMensaje("");
  if(Object.keys(nuevosErrores).length) {
   setMensaje("Revisa los campos indicados antes de enviar la solicitud.");
   e.currentTarget.elements.namedItem(Object.keys(nuevosErrores)[0])?.focus?.();
   const campo = e.currentTarget.querySelector('[name="' + Object.keys(nuevosErrores)[0] + '"]');campo?.focus();return;
  }
  enviando.current = true;
  try {
   const resultado = enviarSolicitud(animal,datos);
   if(!resultado.ok) { setMensaje(resultado.mensaje); return; }
   window.alert("¡Solicitud registrada! 🐾\n\nTu solicitud para adoptar a " + animal.nombre + " ha sido guardada correctamente.\n\nPuedes revisar su estado desde tu perfil.");
   borrador.reiniciar({...formularioVacio,...datosInicialesAdopcion()});
   onEnviada(resultado.solicitud);
  } catch {
   setMensaje("Ocurrió un problema al registrar tu solicitud. Inténtalo nuevamente.");
  } finally { enviando.current = false; }
 }
 return (
<form key={animal.id} className="formulario-adopcion" id="formularioAdopcion" noValidate onBlur={revisarAlSalir} onSubmit={enviar}>

<AvisoBorrador estado={borrador} />
<fieldset className="grupo-formulario">
<legend>
<span>{" 1 "}</span>{" Sobre ti "}</legend>
<div className="fila-formulario">
<div className="campo-formulario">
<label htmlFor="nombreAdoptante">{" Nombre completo "}</label>
{errorCampo("nombreAdoptante")} 
<input type="text" id="nombreAdoptante" name="nombreAdoptante" minLength="3" maxLength="60" aria-invalid={Boolean(errores.nombreAdoptante)} aria-describedby="error-nombreAdoptante" placeholder="Tu nombre completo" required value={datos.nombreAdoptante} onChange={cambiar} />
</div>
<div className="campo-formulario">
<label htmlFor="edadAdoptante">{" Edad "}</label>
{errorCampo("edadAdoptante")} 
<input type="number" id="edadAdoptante" name="edadAdoptante" aria-invalid={Boolean(errores.edadAdoptante)} aria-describedby="error-edadAdoptante" min="18" max="120" placeholder="Ej: 25" required value={datos.edadAdoptante} onChange={cambiar} />
</div>
</div>
<div className="campo-formulario">
<label htmlFor="correoAdoptante">{" Correo electrónico "}</label>
{errorCampo("correoAdoptante")} 
<input type="email" id="correoAdoptante" name="correoAdoptante" maxLength="100" aria-invalid={Boolean(errores.correoAdoptante)} aria-describedby="error-correoAdoptante" placeholder="nombre@correo.cl" required value={datos.correoAdoptante} onChange={cambiar} />
</div>
<div className="fila-formulario">
<div className="campo-formulario">
<label htmlFor="telefonoAdoptante">{" Teléfono "}</label>
{errorCampo("telefonoAdoptante")} 
<input type="tel" id="telefonoAdoptante" name="telefonoAdoptante" maxLength="20" aria-invalid={Boolean(errores.telefonoAdoptante)} aria-describedby="error-telefonoAdoptante" placeholder="+56 9 1234 5678" required value={datos.telefonoAdoptante} onChange={cambiar} />
</div>
<div className="campo-formulario">
<label htmlFor="comunaAdoptante">{" Comuna "}</label>
{errorCampo("comunaAdoptante")} 
<input type="text" id="comunaAdoptante" name="comunaAdoptante" maxLength="60" aria-invalid={Boolean(errores.comunaAdoptante)} aria-describedby="error-comunaAdoptante" placeholder="Ej: Macul" required value={datos.comunaAdoptante} onChange={cambiar} />
</div>
</div>
</fieldset>

<fieldset className="grupo-formulario">
<legend>
<span>{" 2 "}</span>{" Tu hogar "}</legend>
<div className="campo-formulario">
<label htmlFor="tipoVivienda">{" ¿En qué tipo de vivienda vives? "}</label>
{errorCampo("tipoVivienda")} 
<select id="tipoVivienda" name="tipoVivienda" aria-invalid={Boolean(errores.tipoVivienda)} aria-describedby="error-tipoVivienda" required value={datos.tipoVivienda} onChange={cambiar}>
<option value="" disabled>{" Selecciona una opción "}</option>
<option value="casa">{" Casa "}</option>
<option value="departamento">{" Departamento "}</option>
<option value="parcela">{" Parcela "}</option>
<option value="otro">{" Otro "}</option>
</select>
</div>
<div className="campo-formulario">
<label>{" ¿La vivienda es propia o arrendada? "}</label>
{errorCampo("situacionVivienda")}
<div className="opciones-formulario">
<label className="opcion-radio">
<input type="radio" name="situacionVivienda" aria-invalid={Boolean(errores.situacionVivienda)} aria-describedby="error-situacionVivienda" value="propia" required checked={datos.situacionVivienda === "propia"} onChange={cambiar} />
<span>{" Propia "}</span>
</label>
<label className="opcion-radio">
<input type="radio" name="situacionVivienda" aria-invalid={Boolean(errores.situacionVivienda)} aria-describedby="error-situacionVivienda" value="arrendada" checked={datos.situacionVivienda === "arrendada"} onChange={cambiar} />
<span>{" Arrendada "}</span>
</label>
<label className="opcion-radio">
<input type="radio" name="situacionVivienda" aria-invalid={Boolean(errores.situacionVivienda)} aria-describedby="error-situacionVivienda" value="familiar" checked={datos.situacionVivienda === "familiar"} onChange={cambiar} />
<span>{" Familiar "}</span>
</label>
</div>
</div>
<div className="campo-formulario">
<label>¿Vives con otras personas?</label>
{errorCampo("viveConPersonas")}
<div className="opciones-formulario">
<label className="opcion-radio"><input type="radio" name="viveConPersonas" aria-invalid={Boolean(errores.viveConPersonas)} aria-describedby="error-viveConPersonas" value="si" required checked={datos.viveConPersonas === "si"} onChange={cambiar} /><span>Sí</span></label>
<label className="opcion-radio"><input type="radio" name="viveConPersonas" aria-invalid={Boolean(errores.viveConPersonas)} aria-describedby="error-viveConPersonas" value="no" checked={datos.viveConPersonas === "no"} onChange={cambiar} /><span>No</span></label>
</div></div>
{datos.viveConPersonas !== "no" && <>
<div className="campo-formulario">
<label htmlFor="personasHogar">¿Cuántas personas más viven contigo?</label>
{errorCampo("personasHogar")} 
<select id="personasHogar" name="personasHogar" aria-invalid={Boolean(errores.personasHogar)} aria-describedby="error-personasHogar" required value={datos.personasHogar} onChange={cambiar}>
<option value="">Selecciona una cantidad</option>
{Array.from({length:10}, (_,i) => <option key={i+1} value={String(i+1)}>{i+1}</option>)}
</select></div>
<div className="campo-formulario"><label>¿Todos están de acuerdo con la adopción?</label>
{errorCampo("acuerdoFamiliar")}
<div className="opciones-formulario">
<label className="opcion-radio"><input type="radio" name="acuerdoFamiliar" aria-invalid={Boolean(errores.acuerdoFamiliar)} aria-describedby="error-acuerdoFamiliar" value="si" required checked={datos.acuerdoFamiliar === "si"} onChange={cambiar}/><span>Sí</span></label>
<label className="opcion-radio"><input type="radio" name="acuerdoFamiliar" aria-invalid={Boolean(errores.acuerdoFamiliar)} aria-describedby="error-acuerdoFamiliar" value="no" checked={datos.acuerdoFamiliar === "no"} onChange={cambiar}/><span>No</span></label>
</div></div></>}

</fieldset>

<fieldset className="grupo-formulario">
<legend>
<span>{" 3 "}</span>{" Experiencia y convivencia "}</legend>
<div className="campo-formulario">
<label>{" ¿Actualmente tienes otros animales? "}</label>
{errorCampo("otrosAnimales")}
<div className="opciones-formulario">
<label className="opcion-radio">
<input type="radio" name="otrosAnimales" aria-invalid={Boolean(errores.otrosAnimales)} aria-describedby="error-otrosAnimales" value="si" required checked={datos.otrosAnimales === "si"} onChange={cambiar} />
<span>{" Sí "}</span>
</label>
<label className="opcion-radio">
<input type="radio" name="otrosAnimales" aria-invalid={Boolean(errores.otrosAnimales)} aria-describedby="error-otrosAnimales" value="no" checked={datos.otrosAnimales === "no"} onChange={cambiar} />
<span>{" No "}</span>
</label>
</div>
</div>
{datos.otrosAnimales !== "no" && <div className="campo-formulario">
<label htmlFor="detalleAnimales">{" Si tienes animales, cuéntanos sobre ellos "}</label>
{errorCampo("detalleAnimales")} 
<textarea id="detalleAnimales" name="detalleAnimales" aria-invalid={Boolean(errores.detalleAnimales)} aria-describedby="error-detalleAnimales" rows="3" required minLength="10" maxLength="1000" placeholder="Especie, edad, personalidad, etc." value={datos.detalleAnimales} onChange={cambiar}></textarea>
</div>}
<div className="campo-formulario">
<label>{" ¿Has cuidado animales anteriormente? "}</label>
{errorCampo("experienciaAnimales")}
<div className="opciones-formulario">
<label className="opcion-radio">
<input type="radio" name="experienciaAnimales" aria-invalid={Boolean(errores.experienciaAnimales)} aria-describedby="error-experienciaAnimales" value="si" required checked={datos.experienciaAnimales === "si"} onChange={cambiar} />
<span>{" Sí "}</span>
</label>
<label className="opcion-radio">
<input type="radio" name="experienciaAnimales" aria-invalid={Boolean(errores.experienciaAnimales)} aria-describedby="error-experienciaAnimales" value="no" checked={datos.experienciaAnimales === "no"} onChange={cambiar} />
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
{errorCampo("motivoAdopcion")} 
<textarea id="motivoAdopcion" name="motivoAdopcion" minLength="20" maxLength="2000" aria-invalid={Boolean(errores.motivoAdopcion)} aria-describedby="error-motivoAdopcion" rows="4" placeholder="Cuéntanos qué te motivó a elegirlo..." required value={datos.motivoAdopcion} onChange={cambiar}></textarea>
</div>
<div className="campo-formulario">
<label htmlFor="cuidadosAnimal">{" ¿Cómo organizarías sus cuidados diarios? "}</label>
{errorCampo("cuidadosAnimal")} 
<textarea id="cuidadosAnimal" name="cuidadosAnimal" minLength="20" maxLength="2000" aria-invalid={Boolean(errores.cuidadosAnimal)} aria-describedby="error-cuidadosAnimal" rows="4" placeholder="Paseos, alimentación, compañía, veterinario..." required value={datos.cuidadosAnimal} onChange={cambiar}></textarea>
</div>
</fieldset>

<fieldset className="grupo-formulario compromiso-adopcion">
<legend>
<span>{" 5 "}</span>{" Compromiso de adopción "}</legend>
<p>{" Adoptar significa asumir un compromiso responsable con el bienestar del animal durante toda su vida. "}</p>
{errorCampo("aceptaCompromiso")}
<label className="opcion-compromiso">
<input type="checkbox" id="aceptaCompromiso" name="aceptaCompromiso" aria-invalid={Boolean(errores.aceptaCompromiso)} aria-describedby="error-aceptaCompromiso" required checked={datos.aceptaCompromiso} onChange={cambiar} />
<span>{" Entiendo que enviar esta solicitud no garantiza automáticamente la adopción y acepto participar en el proceso de evaluación de PEH. "}</span>
</label>
</fieldset>

{mensaje && <p className="error-campo-adopcion" role="alert">{mensaje}</p>}
<div className="acciones-formulario">
<button className="boton-cancelar-adopcion boton-cancelar-proceso" id="cancelarAdopcion" type="button" onClick={() => {if(borrador.reiniciar({...formularioVacio,...datosInicialesAdopcion()})){setErrores({});setMensaje("");onCancelar();}}}>{" Cancelar proceso "}</button>
<button className="boton-enviar-solicitud" type="submit">
<span aria-hidden="true">{" 🐾 "}</span>{" Enviar solicitud "}</button>
</div>
</form>
 );
}
