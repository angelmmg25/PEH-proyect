/* Componentes de la vista login.
 * La lógica de estado y procesos se obtiene de hooks.
 */
import { AvisoBorrador } from './global.jsx';
/* Presentación de Login */

export function VistaLogin({ registro, valores, borrador, estados, mensaje, procesando, raiz, cambiarVista, cambiarCampo, iniciarSesion, entrarInvitado, crearCuenta, revisarAccesoAlSalir, cancelarRegistro }) {
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

<form className="tarjeta-inicio-sesion cara-tarjeta cara-frontal" id="formularioInicioSesion" noValidate onBlur={revisarAccesoAlSalir} onSubmit={iniciarSesion} inert={registro} aria-hidden={registro}><AvisoBorrador estado={borrador} />
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
<a className="enlace-recuperar peh-enlace" href="#">
                    ¿Olvidaste tu contraseña?
                  </a>
</div>
<input id="contrasena" type="password" placeholder="••••••••" minLength="4" required aria-describedby="errorContrasenaInicio" value={valores.contrasena || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.contrasena)} />
<small className="mensaje-error" id="errorContrasenaInicio" aria-live="polite">{estados.contrasena || ""}</small>
</div>

<button className="boton boton-primario boton-bloque peh-boton-fondo" type="submit" id="botonIniciarSesion" disabled={procesando}>
                Iniciar sesión
              </button>

<button className="boton boton-secundario boton-bloque" type="button" id="botonInvitado" onClick={entrarInvitado} disabled={procesando}>
                Explorar como invitado
              </button>

<p className="pequeno atenuado centrado texto-cambio-formulario">

                ¿Aún no tienes una cuenta?{" "}

                <button className="enlace-cambio peh-enlace" type="button" id="botonMostrarRegistro" onClick={() => cambiarVista(true)} disabled={procesando}>
                  Regístrate
                </button>
</p>
</form>

<form className="tarjeta-inicio-sesion cara-tarjeta cara-trasera" id="formularioRegistro" noValidate onBlur={revisarAccesoAlSalir} onSubmit={crearCuenta} inert={!registro} aria-hidden={!registro}><AvisoBorrador estado={borrador} />
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
<input id="nombreRegistro" name="nombre" type="text" placeholder="Ej: Daniel" autoComplete="given-name" minLength="2" maxLength="30" required aria-describedby="errorNombreRegistro" value={valores.nombreRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.nombreRegistro)} />
<small className="mensaje-error" id="errorNombreRegistro" aria-live="polite">{estados.nombreRegistro || ""}</small>
</div>

<div className={"grupo-campo" + (estados["apellidoRegistro"] === undefined ? "" : estados["apellidoRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="apellidoRegistro">
                    Apellido
                  </label>
<input id="apellidoRegistro" name="apellido" type="text" placeholder="Ej: Riquelme" autoComplete="family-name" minLength="2" maxLength="30" required aria-describedby="errorApellidoRegistro" value={valores.apellidoRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.apellidoRegistro)} />
<small className="mensaje-error" id="errorApellidoRegistro" aria-live="polite">{estados.apellidoRegistro || ""}</small>
</div>
</div>

<div className={"grupo-campo" + (estados["usuarioRegistro"] === undefined ? "" : estados["usuarioRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="usuarioRegistro">
                  Nombre de usuario
                </label>
<input id="usuarioRegistro" name="usuario" type="text" placeholder="Ej: daniel_25" autoComplete="username" minLength="4" maxLength="16" required aria-describedby="ayudaUsuarioRegistro errorUsuarioRegistro" value={valores.usuarioRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.usuarioRegistro)} />
<small className="sugerencia-campo" id="ayudaUsuarioRegistro">
                  Entre 4 y 16 caracteres. Solo letras, números y guion bajo.
                </small>
<small className="mensaje-error" id="errorUsuarioRegistro" aria-live="polite">{estados.usuarioRegistro || ""}</small>
</div>

<div className={"grupo-campo" + (estados["correoRegistro"] === undefined ? "" : estados["correoRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="correoRegistro">
                  Correo electrónico
                </label>
<input id="correoRegistro" name="correoRegistro" type="email" placeholder="nombre@correo.cl" autoComplete="email" required aria-describedby="errorCorreoRegistro" value={valores.correoRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.correoRegistro)} />
<small className="mensaje-error" id="errorCorreoRegistro" aria-live="polite">{estados.correoRegistro || ""}</small>
</div>

<div className={"grupo-campo" + (estados.telefonoRegistro ? " campo-error" : "")}>
<label htmlFor="telefonoRegistro">Teléfono</label>
<input id="telefonoRegistro" name="telefono" type="tel" autoComplete="tel" required maxLength="20" value={valores.telefonoRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.telefonoRegistro)} aria-describedby="errorTelefonoRegistro" />
<small className="mensaje-error" id="errorTelefonoRegistro" aria-live="polite">{estados.telefonoRegistro || ""}</small>
</div>
<div className={"grupo-campo" + (estados.comunaRegistro ? " campo-error" : "")}>
<label htmlFor="comunaRegistro">Comuna</label>
<input id="comunaRegistro" name="comuna" type="text" autoComplete="address-level3" required maxLength="60" value={valores.comunaRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.comunaRegistro)} aria-describedby="errorComunaRegistro" />
<small className="mensaje-error" id="errorComunaRegistro" aria-live="polite">{estados.comunaRegistro || ""}</small>
</div>
<div className={"grupo-campo" + (estados["fechaNacimientoRegistro"] === undefined ? "" : estados["fechaNacimientoRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="fechaNacimientoRegistro">
                  Fecha de nacimiento
                </label>
<input id="fechaNacimientoRegistro" name="fechaNacimiento" type="date" autoComplete="bday" min="1900-01-01" required aria-describedby="errorFechaNacimientoRegistro" value={valores.fechaNacimientoRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.fechaNacimientoRegistro)} />
<small className="mensaje-error" id="errorFechaNacimientoRegistro" aria-live="polite">{estados.fechaNacimientoRegistro || ""}</small>
</div>

<div className="fila-campos-registro">

<div className={"grupo-campo" + (estados["contrasenaRegistro"] === undefined ? "" : estados["contrasenaRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="contrasenaRegistro">
                    Contraseña
                  </label>
<input id="contrasenaRegistro" name="contrasenaRegistro" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength="8" required aria-describedby="ayudaContrasenaRegistro errorContrasenaRegistro" value={valores.contrasenaRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.contrasenaRegistro)} />
<small className="sugerencia-campo" id="ayudaContrasenaRegistro">
                    Mayúscula, minúscula, número y carácter especial.
                  </small>
<small className="mensaje-error" id="errorContrasenaRegistro" aria-live="polite">{estados.contrasenaRegistro || ""}</small>
</div>

<div className={"grupo-campo" + (estados["confirmarContrasenaRegistro"] === undefined ? "" : estados["confirmarContrasenaRegistro"] ? " campo-error" : " campo-valido")}>
<label htmlFor="confirmarContrasenaRegistro">
                    Confirmar contraseña
                  </label>
<input id="confirmarContrasenaRegistro" name="confirmarContrasena" type="password" placeholder="Repite tu contraseña" autoComplete="new-password" minLength="8" required aria-describedby="errorConfirmarContrasenaRegistro" value={valores.confirmarContrasenaRegistro || ""} onChange={cambiarCampo} aria-invalid={Boolean(estados.confirmarContrasenaRegistro)} />
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

<div className="acciones-registro"><button className="enlace-cambio boton-cancelar-proceso" type="button" disabled={procesando} onClick={cancelarRegistro}>Cancelar proceso</button><button className="boton boton-primario boton-bloque peh-boton-fondo" type="submit" id="botonRegistrar" disabled={procesando}>
                Crear cuenta
              </button></div>

<p className="pequeno atenuado centrado texto-cambio-formulario">

                ¿Ya tienes una cuenta?{" "}

                <button className="enlace-cambio peh-enlace" type="button" id="botonMostrarInicio" onClick={() => cambiarVista(false)} disabled={procesando}>
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
