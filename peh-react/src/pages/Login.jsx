import { useEffect, useRef, useState } from "react";
import PEH from "../services/peh";
import { validarAcceso, camposInicio, camposRegistro } from "../services/validacionAcceso";
import "../styles/login.css";

export default function Login({onAcceso}) {
 const [registro, setRegistro] = useState(false);
 const [valores, setValores] = useState({});
 const [estados, setEstados] = useState({});
 const [mensaje, setMensaje] = useState({texto:"", tipo:""});
 const [procesando, setProcesando] = useState(false);
 const bloqueo = useRef(false);
 const raiz = useRef(null);
 const temporizadores = useRef(new Set());
 function despues(fn, ms) { const timer = setTimeout(() => { temporizadores.current.delete(timer); fn(); }, ms); temporizadores.current.add(timer); }
 useEffect(() => {
  document.body.classList.add("cuerpo-inicio-sesion");
  document.title = "PEH | Inicio de sesión";
  const timers = temporizadores.current;
  return () => { document.body.classList.remove("cuerpo-inicio-sesion"); timers.forEach(clearTimeout); timers.clear(); };
 }, []);
 function cambiarVista(valor) {
  setRegistro(valor);
  despues(() => raiz.current?.querySelector(valor ? "#nombreRegistro" : "#correo")?.focus(), 380);
 }
 function validarCampo(id, nuevos = valores) {
  const error = validarAcceso(id, nuevos);
  setEstados(actual => ({...actual, [id]:error}));
  return !error;
 }
 function cambiarCampo(e) {
  const {id, value, checked, type} = e.target;
  const nuevos = {...valores, [id]:type === "checkbox" ? checked : value};
  setValores(nuevos);
  validarCampo(id, nuevos);
  if(id === "contrasenaRegistro" && nuevos.confirmarContrasenaRegistro) validarCampo("confirmarContrasenaRegistro", nuevos);
 }
 function validarFormulario(ids) {
  const nuevos = Object.fromEntries(ids.map(id => [id, validarAcceso(id, valores)]));
  setEstados(actual => ({...actual, ...nuevos}));
  return ids.every(id => !nuevos[id]);
 }
 async function iniciarSesion(e) {
  e.preventDefault();
  if(bloqueo.current || !validarFormulario(camposInicio)) return;
  bloqueo.current = true; setProcesando(true);
  try {
   const resultado = await PEH.cuentas.iniciarSesion(valores.correo.trim(), valores.contrasena);
   if(!resultado.ok) { setEstados(actual => ({...actual, contrasena: resultado.mensaje || "Correo o contraseña incorrectos."})); return; }
   window.location.hash = PEH.admin.esAdmin() ? "desarrollador" : "inicio";
   onAcceso(PEH.sesion.obtener());
  } catch { setEstados(actual => ({...actual, contrasena:"Ocurrió un problema al iniciar sesión."})); }
  finally { bloqueo.current = false; setProcesando(false); }
 }
 function entrarInvitado() {
  const id = PEH.leer("peh_invitado_id", null) || PEH.id("INV");
  PEH.escribir("peh_invitado_id", id);
  if(PEH.sesion.iniciar({id, nombre:"Invitado", correo:"", invitado:true})) {
   window.location.hash = "inicio"; onAcceso(PEH.sesion.obtener());
  } else alert("No se pudo iniciar el modo invitado.");
 }
 async function crearCuenta(e) {
  e.preventDefault();
  if(bloqueo.current) return;
  if(!validarFormulario(camposRegistro)) {
   setMensaje({texto:"Revisa los campos marcados antes de crear tu cuenta.", tipo:"error"});
   const primerError = camposRegistro.find(id => validarAcceso(id, valores));
   raiz.current?.querySelector("#" + primerError)?.focus(); return;
  }
  bloqueo.current = true; setProcesando(true);
  const datos = {nombre:valores.nombreRegistro.trim(), apellido:valores.apellidoRegistro.trim(), usuario:valores.usuarioRegistro.trim(), correo:valores.correoRegistro.trim(), fechaNacimiento:valores.fechaNacimientoRegistro, contrasena:valores.contrasenaRegistro};
  try {
   setMensaje({texto:"Estamos creando tu cuenta...", tipo:"info"});
   const resultado = await PEH.cuentas.registrar(datos);
   if(!resultado.ok) { setMensaje({texto:resultado.mensaje || "No se pudo crear la cuenta.", tipo:"error"}); return; }
   setMensaje({texto:"¡Bienvenido a PEH! Tu cuenta fue creada correctamente.", tipo:"exito"});
   despues(() => {
    setValores(actual => ({correo:datos.correo, contrasena:actual.contrasena || ""}));
    setEstados(actual => ({contrasena:actual.contrasena}));
    setMensaje({texto:"", tipo:""}); cambiarVista(false);
   }, 900);
  } catch { setMensaje({texto:"Ocurrió un problema al crear tu cuenta.", tipo:"error"}); }
  finally { bloqueo.current = false; setProcesando(false); }
 }
 return (
<main ref={raiz} className="diseno-inicio-sesion">

<section className="promocion-inicio-sesion">

<a className="marca marca-grande" href="./">
<span className="simbolo-marca">PEH</span>
</a>

<div className="texto-promocion">
<span className="subtitulo">
            PATITAS ESPERANDO UN HOGAR
          </span>
<h1 >Bienvenido</h1>
<p >
            Un espacio para encontrar, ayudar y dar nuevas oportunidades.
          </p>

<div className="etiquetas-promocion">
<span >#adopción</span>
<span >#comunidad</span>
<span >#nuevoshogares</span>
</div>
</div>

<p className="pie-inicio-sesion">
          © 2026 PEH · Patitas Esperando un Hogar
        </p>
</section>

<section className="panel-inicio-sesion">
<div className={"contenedor-tarjeta-giratoria" + (registro ? " modo-registro" : "")} id="contenedorTarjeta">
<div className={"tarjeta-giratoria" + (registro ? " girada" : "")} id="tarjetaAcceso">

<form className="tarjeta-inicio-sesion cara-tarjeta cara-frontal" id="formularioInicioSesion" noValidate onSubmit={iniciarSesion} inert={registro} aria-hidden={registro}>
<span className="indicador-estado">
                ● Comunidad PEH
              </span>
<h2 >Bienvenido a PEH</h2>
<p className="atenuado">
                Inicia sesión para continuar.
              </p>

<div className={"grupo-campo" + (estados["correo"] === undefined ? "" : estados["correo"] ? " campo-error" : " campo-valido")}>
<label htmlFor="correo">
                  Correo electrónico
                </label>
<input id="correo" type="email" placeholder="nombre@correo.cl" autoComplete="email" required aria-describedby="errorCorreoInicio" value={valores.correo || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.correo)} />
<small className="mensaje-error" id="errorCorreoInicio" aria-live="polite">{estados.correo || ""}</small>
</div>

<div className={"grupo-campo" + (estados["contrasena"] === undefined ? "" : estados["contrasena"] ? " campo-error" : " campo-valido")}>
<div className="fila-etiqueta">
<label htmlFor="contrasena">
                    Contraseña
                  </label>
<a href="#">
                    ¿Olvidaste tu contraseña?
                  </a>
</div>
<input id="contrasena" type="password" placeholder="••••••••" minLength="4" required aria-describedby="errorContrasenaInicio" value={valores.contrasena || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.contrasena)} />
<small className="mensaje-error" id="errorContrasenaInicio" aria-live="polite">{estados.contrasena || ""}</small>
</div>

<button className="boton boton-primario boton-bloque" type="submit" id="botonIniciarSesion" disabled={procesando}>
                Iniciar sesión
              </button>

<button className="boton boton-secundario boton-bloque" type="button" id="botonInvitado" onClick={entrarInvitado}>
                Explorar como invitado
              </button>

<p className="pequeno atenuado centrado texto-cambio-formulario">

                ¿Aún no tienes una cuenta?{" "}

                <button className="enlace-cambio" type="button" id="botonMostrarRegistro" onClick={() => cambiarVista(true)}>
                  Regístrate
                </button>
</p>
</form>

<form className="tarjeta-inicio-sesion cara-tarjeta cara-trasera" id="formularioRegistro" noValidate onSubmit={crearCuenta} inert={!registro} aria-hidden={!registro}>
<span className="indicador-estado">
                ● Únete a PEH
              </span>
<h2 >Crea tu cuenta</h2>
<p className="atenuado">
                Forma parte de nuestra comunidad.
              </p>

<div className="fila-campos-registro">

<div className={"grupo-campo" + (estados["nombreRegistro"] === undefined ? "" : estados["nombreRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="nombreRegistro">
                    Nombre
                  </label>
<input id="nombreRegistro" name="nombre" type="text" placeholder="Ej: Daniel" autoComplete="given-name" minLength="2" maxLength="30" required aria-describedby="errorNombreRegistro" value={valores.nombreRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.nombreRegistro)} onBlur={() => validarCampo("nombreRegistro")} />
<small className="mensaje-error" id="errorNombreRegistro" aria-live="polite">{estados.nombreRegistro || ""}</small>
</div>

<div className={"grupo-campo" + (estados["apellidoRegistro"] === undefined ? "" : estados["apellidoRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="apellidoRegistro">
                    Apellido
                  </label>
<input id="apellidoRegistro" name="apellido" type="text" placeholder="Ej: Riquelme" autoComplete="family-name" minLength="2" maxLength="30" required aria-describedby="errorApellidoRegistro" value={valores.apellidoRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.apellidoRegistro)} onBlur={() => validarCampo("apellidoRegistro")} />
<small className="mensaje-error" id="errorApellidoRegistro" aria-live="polite">{estados.apellidoRegistro || ""}</small>
</div>
</div>

<div className={"grupo-campo" + (estados["usuarioRegistro"] === undefined ? "" : estados["usuarioRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="usuarioRegistro">
                  Nombre de usuario
                </label>
<input id="usuarioRegistro" name="usuario" type="text" placeholder="Ej: daniel_25" autoComplete="username" minLength="4" maxLength="16" required aria-describedby="ayudaUsuarioRegistro errorUsuarioRegistro" value={valores.usuarioRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.usuarioRegistro)} onBlur={() => validarCampo("usuarioRegistro")} />
<small className="sugerencia-campo" id="ayudaUsuarioRegistro">
                  Entre 4 y 16 caracteres. Solo letras, números y guion bajo.
                </small>
<small className="mensaje-error" id="errorUsuarioRegistro" aria-live="polite">{estados.usuarioRegistro || ""}</small>
</div>

<div className={"grupo-campo" + (estados["correoRegistro"] === undefined ? "" : estados["correoRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="correoRegistro">
                  Correo electrónico
                </label>
<input id="correoRegistro" name="correoRegistro" type="email" placeholder="nombre@correo.cl" autoComplete="email" required aria-describedby="errorCorreoRegistro" value={valores.correoRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.correoRegistro)} onBlur={() => validarCampo("correoRegistro")} />
<small className="mensaje-error" id="errorCorreoRegistro" aria-live="polite">{estados.correoRegistro || ""}</small>
</div>

<div className={"grupo-campo" + (estados["fechaNacimientoRegistro"] === undefined ? "" : estados["fechaNacimientoRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="fechaNacimientoRegistro">
                  Fecha de nacimiento
                </label>
<input id="fechaNacimientoRegistro" name="fechaNacimiento" type="date" autoComplete="bday" min="1900-01-01" required aria-describedby="errorFechaNacimientoRegistro" value={valores.fechaNacimientoRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.fechaNacimientoRegistro)} onBlur={() => validarCampo("fechaNacimientoRegistro")} />
<small className="mensaje-error" id="errorFechaNacimientoRegistro" aria-live="polite">{estados.fechaNacimientoRegistro || ""}</small>
</div>

<div className="fila-campos-registro">

<div className={"grupo-campo" + (estados["contrasenaRegistro"] === undefined ? "" : estados["contrasenaRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="contrasenaRegistro">
                    Contraseña
                  </label>
<input id="contrasenaRegistro" name="contrasenaRegistro" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength="8" required aria-describedby="ayudaContrasenaRegistro errorContrasenaRegistro" value={valores.contrasenaRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.contrasenaRegistro)} onBlur={() => validarCampo("contrasenaRegistro")} />
<small className="sugerencia-campo" id="ayudaContrasenaRegistro">
                    Mayúscula, minúscula, número y carácter especial.
                  </small>
<small className="mensaje-error" id="errorContrasenaRegistro" aria-live="polite">{estados.contrasenaRegistro || ""}</small>
</div>

<div className={"grupo-campo" + (estados["confirmarContrasenaRegistro"] === undefined ? "" : estados["confirmarContrasenaRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="confirmarContrasenaRegistro">
                    Confirmar contraseña
                  </label>
<input id="confirmarContrasenaRegistro" name="confirmarContrasena" type="password" placeholder="Repite tu contraseña" autoComplete="new-password" minLength="8" required aria-describedby="errorConfirmarContrasenaRegistro" value={valores.confirmarContrasenaRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.confirmarContrasenaRegistro)} onBlur={() => validarCampo("confirmarContrasenaRegistro")} />
<small className="mensaje-error" id="errorConfirmarContrasenaRegistro" aria-live="polite">{estados.confirmarContrasenaRegistro || ""}</small>
</div>
</div>

<div className={"grupo-campo grupo-terminos" + (estados["terminosRegistro"] === undefined ? "" : estados["terminosRegistro"] ? " campo-error" : "")}>
<label className="etiqueta-checkbox" htmlFor="terminosRegistro">
<input id="terminosRegistro" name="terminos" type="checkbox" checked={Boolean(valores.terminosRegistro)} onChange={cambiarCampo} aria-invalid={Boolean(estados.terminosRegistro)} />
<span >
                    Acepto participar de manera responsable y respetuosa
                    dentro de la comunidad PEH.
                  </span>
</label>
<small className="mensaje-error" id="errorTerminosRegistro" aria-live="polite">{estados.terminosRegistro || ""}</small>
</div>

<div id="mensajeRegistro" aria-live="polite" className={"mensaje-formulario " + mensaje.tipo}>{mensaje.texto}</div>

<button className="boton boton-primario boton-bloque" type="submit" id="botonRegistrar" disabled={procesando}>
                Crear cuenta
              </button>

<p className="pequeno atenuado centrado texto-cambio-formulario">

                ¿Ya tienes una cuenta?{" "}

                <button className="enlace-cambio" type="button" id="botonMostrarInicio" onClick={() => cambiarVista(false)}>
                  Inicia sesión
                </button>
</p>
</form>
</div>
</div>
</section>
</main>
 );
}
