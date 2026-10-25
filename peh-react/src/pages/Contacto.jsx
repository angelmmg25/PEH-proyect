import PEH from "../services/peh.js";
import useBorrador, { AvisoBorrador } from "../hooks/useBorrador.jsx";
import { useEffect, useRef, useState } from "react";
import Navegacion from "../components/Navegacion";
import PreguntasContacto from "../components/PreguntasContacto";
import { asuntosSugeridos } from "../data/contacto";
import { validarContacto, camposContacto, registrarConsulta } from "../services/contacto";
import "../styles/contacto.css";

const vacio = { nombre: "", correo: "", motivo: "", asunto: "", mensaje: "" };

export default function Contacto() {
  const contactoInicial = () => {const u=PEH.sesion.obtener(),c=u&&!u.invitado?PEH.cuentas.obtenerPorId(u.id):null,p=PEH.perfil.obtener();return {...vacio,nombre:c?(p.nombre || [c.nombre,c.apellido].filter(Boolean).join(" ")):"",correo:c?(p.correo || c.correo):""};};
  const [datos, setDatos, borrador] = useBorrador("contacto", contactoInicial);
  const [errores, setErrores] = useState({});
  const [procesando, setProcesando] = useState(false);
  const [confirmacion, setConfirmacion] = useState(false);
  const [consultaRegistrada, setConsultaRegistrada] = useState(null);
  const [errorEnvio, setErrorEnvio] = useState("");
  const contador = datos.mensaje.length;
  const formulario = useRef(null), aviso = useRef(null), bloqueo = useRef(false);
  const temporizador = useRef(null), frame = useRef(null);

  useEffect(() => {
    document.body.classList.add("pagina-contacto");
    document.title = "Contacto | PEH";
    return () => {
      clearTimeout(temporizador.current);
      cancelAnimationFrame(frame.current);
      document.body.classList.remove("pagina-contacto");
    };
  }, []);

  function cambiar(e) {
    const { name, value } = e.target;
    setDatos(actual => ({ ...actual, [name]: value }));
    setErrorEnvio("");
    setErrores(actual => ({...actual,[name]:validarContacto({...datos,[name]:value})[name]}));
  }

  function elegir(motivo) {
    setDatos(actual => ({ ...actual, motivo, asunto: actual.asunto.trim() ? actual.asunto : asuntosSugeridos[motivo] || actual.asunto }));
    setErrores(actual => ({ ...actual, motivo: "" }));
    formulario.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function enviar(e) {
    e.preventDefault();
    if (bloqueo.current) return;
    clearTimeout(temporizador.current);
    setConfirmacion(false);
    setErrorEnvio("");
    const nuevos = validarContacto(datos);
    setErrores(nuevos);
    const primero = camposContacto.find(campo => nuevos[campo]);
    if (primero) {
      document.getElementById(primero + "Contacto")?.focus();
      return;
    }
    bloqueo.current = true;
    setProcesando(true);
    try {
      const resultado = registrarConsulta(datos);
      if (!resultado.ok) {
        setErrorEnvio(resultado.mensaje);
        return;
      }
      setConsultaRegistrada(resultado.consulta);
      setConfirmacion(true);
      borrador.reiniciar(contactoInicial());
      setErrores({});
      frame.current = requestAnimationFrame(() => aviso.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
      temporizador.current = setTimeout(() => setConfirmacion(false), 6000);
    } finally {
      bloqueo.current = false;
      setProcesando(false);
    }
  }
 return <>


<Navegacion pagina="contacto" />

<main><section className="hero-contacto"><div className="contenedor"><div className="hero-contacto-contenido"><div className="hero-contacto-texto"><span className="hero-contacto-etiqueta"> Contacto </span><h1> Hablemos <span aria-hidden="true"> ♡ </span></h1><h2> ¿Necesitas ayuda? Estamos aquí para ti. </h2><p> Ya sea que tengas dudas sobre una adopción, quieras reportar un problema o simplemente necesites orientación, puedes registrar una consulta en esta demostración de PEH. </p></div><div className="hero-contacto-visual" aria-hidden="true"></div></div></div></section><section className="seccion-contacto" id="escribir"><div className="contenedor"><div className="contacto-grid"><div className="contacto-formulario"><div className="encabezado-formulario-contacto"><span className="sobre-titulo"> Estamos para ayudarte </span><h2> Envíanos un mensaje <span aria-hidden="true"> 🐾 </span></h2><p> Completa el formulario para guardar tu consulta en este navegador. Esta demostración no envía correos. </p></div><div className="tipos-contacto atajos-contacto"><button type="button" data-motivo="adopcion" className={"tarjeta-tipo-contacto"+(datos.motivo === "adopcion" ? " seleccionada" : "")} onClick={() => elegir("adopcion")}><span className="tipo-contacto-icono" aria-hidden="true"> 🐾 </span><span className="tipo-contacto-contenido"><strong> Adopciones </strong><small> Dudas sobre solicitudes, requisitos o el proceso de adopción. </small></span><span className="tipo-contacto-flecha" aria-hidden="true"> → </span></button><button type="button" data-motivo="veterinaria" className={"tarjeta-tipo-contacto"+(datos.motivo === "veterinaria" ? " seleccionada" : "")} onClick={() => elegir("veterinaria")}><span className="tipo-contacto-icono" aria-hidden="true"> ♡ </span><span className="tipo-contacto-contenido"><strong> Veterinaria </strong><small> Consultas relacionadas con reservas o atención veterinaria. </small></span><span className="tipo-contacto-flecha" aria-hidden="true"> → </span></button><button type="button" data-motivo="soporte" className={"tarjeta-tipo-contacto"+(datos.motivo === "soporte" ? " seleccionada" : "")} onClick={() => elegir("soporte")}><span className="tipo-contacto-icono" aria-hidden="true"> ◯ </span><span className="tipo-contacto-contenido"><strong> Soporte general </strong><small> Problemas con tu cuenta, publicaciones o funcionamiento de PEH. </small></span><span className="tipo-contacto-flecha" aria-hidden="true"> → </span></button></div><form id="formularioContacto" noValidate={true} onBlur={e => {if(e.target.name)setErrores(actual=>({...actual,[e.target.name]:validarContacto(datos)[e.target.name]}));}} onSubmit={enviar} ref={formulario}><div className="campos-contacto"><div className="grupo-campo"><label htmlFor="nombreContacto"> Nombre completo </label><input id="nombreContacto" name="nombre" type="text" placeholder="Tu nombre" autoComplete="name" maxLength="60" required={true} value={datos.nombre} onChange={cambiar} className={errores.nombre ? "campo-error" : undefined} /><small className="mensaje-error">{errores.nombre === undefined ? " " : errores.nombre}</small></div><div className="grupo-campo"><label htmlFor="correoContacto"> Correo electrónico </label><input id="correoContacto" name="correo" type="email" placeholder="tu.correo@ejemplo.com" autoComplete="email" maxLength="100" required={true} value={datos.correo} onChange={cambiar} className={errores.correo ? "campo-error" : undefined} /><small className="mensaje-error">{errores.correo === undefined ? " " : errores.correo}</small></div><div className="grupo-campo campo-ancho"><label htmlFor="motivoContacto"> Motivo de contacto </label><select id="motivoContacto" name="motivo" required={true} value={datos.motivo} onChange={cambiar} className={errores.motivo ? "campo-error" : undefined}><option value=""> Selecciona una opción </option><option value="adopcion"> Adopciones </option><option value="veterinaria"> Veterinaria </option><option value="soporte"> Soporte general </option><option value="otro"> Otro </option></select><small className="mensaje-error">{errores.motivo === undefined ? " " : errores.motivo}</small></div><div className="grupo-campo campo-ancho"><label htmlFor="asuntoContacto"> Asunto </label><input id="asuntoContacto" name="asunto" type="text" placeholder="Ej. Consulta sobre adopción" maxLength="80" required={true} value={datos.asunto} onChange={cambiar} className={errores.asunto ? "campo-error" : undefined} /><small className="mensaje-error">{errores.asunto === undefined ? " " : errores.asunto}</small></div><div className="grupo-campo campo-mensaje"><label htmlFor="mensajeContacto"> Mensaje </label><textarea id="mensajeContacto" name="mensaje" rows="7" maxLength="500" placeholder="Cuéntanos en qué podemos ayudarte..." required={true} value={datos.mensaje} onChange={cambiar} className={errores.mensaje ? "campo-error" : undefined}></textarea><div className="mensaje-informacion"><small className="mensaje-error">{errores.mensaje === undefined ? " " : errores.mensaje}</small><span id="contadorMensaje" className={contador >= 450 ? "cerca-limite" : undefined}>{contador} / 500</span></div></div></div><AvisoBorrador estado={borrador}/><button className="boton boton-secundario boton-cancelar-proceso" type="button" onClick={()=>{if(borrador.reiniciar(contactoInicial())){setErrores({});setErrorEnvio("");setConfirmacion(false);}}}>Cancelar proceso</button><button className="boton boton-principal boton-enviar-contacto" type="submit" disabled={procesando}>{procesando ? <><span className="indicador-carga" /> Guardando...</> : <><span aria-hidden="true">➤</span>{" "}Registrar consulta{" "}<span aria-hidden="true">🐾</span></>}</button>{errorEnvio && <p className="mensaje-error" role="alert">{errorEnvio}</p>}<div className="estado-envio" id="estadoEnvio" role="status" aria-live="polite" hidden={!confirmacion} ref={aviso}><span aria-hidden="true"> ✓ </span><div><strong> ¡Consulta registrada! </strong><p> Tu consulta quedó guardada en este navegador. No se envió un correo. </p>{consultaRegistrada && <><p>Código: {consultaRegistrada.id}</p>{consultaRegistrada.usuarioId ? <a href="#perfil/consultas">Ver mis consultas y respuestas</a> : <p>Las consultas de invitados no tienen seguimiento en un perfil. Para recibir respuestas dentro de PEH, consulta con una cuenta registrada.</p>}</>}</div></div></form></div><aside className="contacto-ayuda"><div className="tarjeta-ayuda-contacto"><div className="encabezado-ayuda-contacto"><span className="ayuda-contacto-icono" aria-hidden="true"> 💡 </span><div><h2> Antes de escribirnos... </h2><p> Quizás encuentres la respuesta que buscas aquí. </p></div></div><div className="accesos-ayuda"><button className="acceso-ayuda" id="botonPreguntas" type="button" onClick={() => document.getElementById("preguntasFrecuentes")?.scrollIntoView({behavior:"smooth",block:"start"})}><span className="acceso-ayuda-icono" aria-hidden="true"> ? </span><span><strong> Preguntas frecuentes </strong><small> Revisa las dudas más comunes. </small></span><span className="acceso-ayuda-flecha" aria-hidden="true"> → </span></button><a className="acceso-ayuda" href="#animales"><span className="acceso-ayuda-icono" aria-hidden="true"> 🐾 </span><span><strong> Ver animales en adopción </strong><small> Conoce a nuestras patitas en busca de hogar. </small></span><span className="acceso-ayuda-flecha" aria-hidden="true"> → </span></a><a className="acceso-ayuda" href="#veterinaria/reservar"><span className="acceso-ayuda-icono" aria-hidden="true"> ♡ </span><span><strong> Reservar atención veterinaria </strong><small> Agenda una hora desde nuestra sección veterinaria. </small></span><span className="acceso-ayuda-flecha" aria-hidden="true"> → </span></a></div></div><div className="tarjeta-compromiso"><span className="compromiso-corazon" aria-hidden="true"> ♥ </span><div><h2> Nuestro compromiso </h2><p> En PEH trabajamos para crear una comunidad más consciente, responsable y comprometida con el bienestar de los animales. </p><p> Gracias por ser parte de este cambio. 🐾 </p></div><div className="compromiso-mascotas" aria-hidden="true"> 🐶 🐱 </div></div></aside></div></div></section><section className="seccion-preguntas" id="preguntasFrecuentes"><div className="contenedor"><div className="encabezado-seccion-preguntas"><span className="sobre-titulo"> Preguntas frecuentes </span><h2> Puede que tu respuesta esté aquí </h2><p> Algunas de las consultas más comunes dentro de PEH. </p></div><PreguntasContacto /></div></section><section className="seccion-cierre-contacto"><div className="contenedor"><div className="cierre-contacto-contenido"><span className="cierre-patita" aria-hidden="true"> 🐾 </span><div><h2> Cada mensaje también puede ayudar a una patita. </h2><p> Queremos que PEH sea un espacio donde adoptar, cuidar y participar sea cada vez más sencillo. </p></div><a className="boton boton-secundario" href="#animales"> Conocer animales <span aria-hidden="true"> → </span></a></div></div></section></main>



<footer className="pie-pagina"><div className="contenedor pie-contenido"><div><strong> PEH </strong><p> Patitas Esperando un Hogar </p></div><nav className="enlaces-pie" aria-label="Enlaces del pie de página"><a href="#inicio"> Inicio </a><a href="#comunidad"> Comunidad </a><a href="#veterinaria"> Veterinaria </a><a href="#contacto"> Ayuda </a></nav><p className="copyright"> © 2026 PEH </p></div></footer>






</>;
}
