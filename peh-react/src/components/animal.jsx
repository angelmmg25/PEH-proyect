/* Componentes de la vista animal.
 * La lógica de estado y procesos se obtiene de hooks.
 */
import { TarjetaAcceso, Navegacion, AvisoBorrador } from './global.jsx';
import { useAvisoAdopcionInvitado, useFormularioAdopcion } from '../hooks/animal.js';
import { enviarSolicitud, enviarSolicitudLocal } from '../services/animal.js';
import { formatearEdad } from '../services/global.js';
export function AvisoAdopcionInvitado({ onIniciarSesion, onCerrar }) {
  const { dialogo, tituloId } = useAvisoAdopcionInvitado();
  
  return <dialog className="acceso-requerido-modal" style={{padding:0,border:0,borderRadius:"16px",background:"#fff",width:"min(400px, calc(100vw - 32px))",maxWidth:"calc(100vw - 32px)",boxSizing:"border-box",margin:"auto",overflow:"auto",outline:"none"}} ref={dialogo} aria-labelledby={tituloId} onCancel={e => e.preventDefault()}>
    <TarjetaAcceso tituloId={tituloId} descripcion="Accede a tu cuenta para continuar con la adopción." onIniciarSesion={onIniciarSesion} onCerrar={onCerrar}/>
  </dialog>;
}

/* FormularioAdopcion */

export function FormularioAdopcion({animal,onCancelar,onEnviada,enviarSolicitud:enviarServicio=enviarSolicitud,onProcesando}) {
 const { datos, borrador, errores, mensaje, procesando, cambiar, revisarAlSalir, enviar, cancelarAdopcion } = useFormularioAdopcion({ animal, onEnviada, enviarServicio, onProcesando , onCancelar });

 const errorCampo = campo => <span id={"error-" + campo} className="error-campo-adopcion" aria-live="polite">{errores[campo] || ""}</span>;

 return (
<form key={animal.id} className="formulario-adopcion" id="formularioAdopcion" noValidate onBlur={revisarAlSalir} onSubmit={enviar} aria-busy={procesando}>
<fieldset disabled={procesando} style={{border:0,padding:0,margin:0,minWidth:0}}>

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
<button className="boton-cancelar-adopcion boton-cancelar-proceso" id="cancelarAdopcion" type="button" onClick={cancelarAdopcion}>{" Cancelar proceso "}</button>
<button className="boton-enviar-solicitud peh-boton-fondo" type="submit" disabled={procesando}>
<span aria-hidden="true">{" 🐾 "}</span>{procesando ? " Enviando solicitud… " : " Enviar solicitud "}</button>
</div>
</fieldset>
</form>
 );
}

/* Presentación de Animal */

const etiquetasHogar = {casa:"Casa", departamento:"Departamento", "espacio-amplio":"Espacio amplio"};
export function VistaAnimal({ identificador, onIniciarSesion, consulta, animal, mensajeAdopcion, enviandoAdopcion, setEnviandoAdopcion, adoptando, avisoInvitado, setAvisoInvitado, sesionAnimal, puedeCompletar, abrirAdopcion, cerrarAdopcion, verHistoria, adopcionEnviada }) {
if(identificador !== undefined && (consulta.cargando || consulta.error)) return <><Navegacion pagina="animales" /><main className="estructura-animal" aria-busy={consulta.cargando}><p role={consulta.error ? "alert" : "status"}>{consulta.cargando ? "Cargando la ficha…" : consulta.error}</p>{consulta.error && !consulta.noEncontrado && <button type="button" className="boton boton-secundario" onClick={consulta.recargar}>Reintentar</button>}<a href="#animales">Volver al catálogo</a></main></>;
if(!animal) return <><Navegacion pagina="animales" /><div className="estructura-animal" id="perfilAnimal"><p>Este animal no está disponible. Vuelve al catálogo para conocer a nuestros perros y gatos.</p><a href="#animales">Volver al catálogo</a></div></>;
const capitalizar = texto => texto.charAt(0).toUpperCase() + texto.slice(1);
const tamano = {pequeno:"Pequeño", mediano:"Mediano", grande:"Grande"}[animal.tamano];
const edad = formatearEdad(animal) + " aprox.";
const sexo = capitalizar(animal.sexo);
const ubicacion = animal.comuna + ", Santiago";
const resumen = ["📍 " + ubicacion, "🗓 " + edad, sexo, tamano];
const datosAdopcion = ["🗓 " + edad, sexo, tamano, "📍 " + ubicacion];
const textoEstado = animal.estadoPerfil === "adoptado" ? "Adoptado" : animal.estadoPerfil === "en-proceso" ? "Adopción en proceso" : "En adopción";
const basicos = [edad, sexo, tamano, capitalizar(animal.especie), ubicacion, animal.diasEsperando + " días"];
return <>
  <Navegacion pagina="animales" />
<div className={"estructura-animal" + (adoptando ? " perfil-oculto" : "")} id="perfilAnimal" inert={adoptando}>

<main className="contenido-animal">
<div className="contenedor-animal">
<a className="volver-catalogo peh-enlace" href="#animales">
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
<span className="estado-adopcion">{" 🐾 " + textoEstado}</span>
</div>
<p className="introduccion-adopcion">{" Conoce su historia y el tipo de hogar que necesita. "}</p>

<div className="etiquetas-personalidad" aria-label="Personalidad">{animal.personalidad.map(rasgo => <span key={rasgo}>{"♥ " + rasgo}</span>)}</div>
<button className="boton-adoptar peh-boton-fondo" id="botonAdoptar" type="button" aria-controls="modoAdopcion" disabled={animal.estadoPerfil !== "disponible"} onClick={abrirAdopcion}>
<span aria-hidden="true">{" 🐾 "}</span>{animal.estadoPerfil === "disponible" ? " Adoptar a " + animal.nombre + " " : " " + textoEstado + " "}<span className="flecha-adoptar" aria-hidden="true">{" → "}</span>
</button>
{mensajeAdopcion && <p role="status">{mensajeAdopcion} <a href="#perfil">Ver mis solicitudes</a></p>}
<a className="enlace-historia-animal peh-enlace" href="#historiaAnimal" onClick={verHistoria}>{" Conoce su historia ↓ "}</a>
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
{puedeCompletar && (identificador === undefined || sesionAnimal.origen === "local") && <section className={"modo-adopcion" + (adoptando ? " activo" : "")} id="modoAdopcion" aria-hidden={!adoptando} inert={!adoptando}>

<div className="panel-formulario-adopcion">

<div className="encabezado-formulario">
<button className="boton-volver-perfil" id="volverPerfil" type="button" onClick={cerrarAdopcion} disabled={enviandoAdopcion}>{" ← Volver al perfil "}</button>
<div className="titulo-formulario">
<span className="icono-formulario">{" 🐾 "}</span>
<div>
<p className="etiqueta-formulario">{" Solicitud de adopción "}</p>
<h2>{animal.estadoPerfil === "disponible" ? " Adoptar a " + animal.nombre + " " : " " + textoEstado + " "}</h2>
</div>
</div>
<p className="introduccion-formulario">{" Queremos conocerte un poquito mejor. Tus respuestas nos ayudarán a encontrar el hogar más adecuado para " + animal.nombre + ". "}</p>
</div>

<FormularioAdopcion key={animal.id} animal={animal} onCancelar={cerrarAdopcion} onProcesando={setEnviandoAdopcion} enviarSolicitud={identificador === undefined ? undefined : enviarSolicitudLocal} onEnviada={adopcionEnviada} />
</div>

<aside className="panel-animal-adopcion">
<div className="animal-adopcion-sticky">
<div className="imagen-adopcion">
<img id="imagenAnimalAdopcion" src={animal.imagen} alt={animal.nombre + " esperando un hogar"} />
<span className="estado-adopcion-formulario">{" 🐾 " + textoEstado}</span>
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
