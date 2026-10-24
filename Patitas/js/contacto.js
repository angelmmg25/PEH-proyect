document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTOS PRINCIPALES
    // =====================================================

    const formulario = document.getElementById("formularioContacto");

    const nombre = document.getElementById("nombreContacto");
    const correo = document.getElementById("correoContacto");
    const motivo = document.getElementById("motivoContacto");
    const asunto = document.getElementById("asuntoContacto");
    const mensaje = document.getElementById("mensajeContacto");

    const contadorMensaje = document.getElementById("contadorMensaje");
    const estadoEnvio = document.getElementById("estadoEnvio");
    formulario?.querySelector(".boton-enviar-contacto")?.childNodes.forEach(nodo => {
        if (nodo.nodeType === Node.TEXT_NODE) nodo.textContent = nodo.textContent.replace("Enviar mensaje", "Registrar consulta");
    });

    if (mensaje && !mensaje.value.trim()) mensaje.value = "";
    if (contadorMensaje) contadorMensaje.textContent = `${mensaje?.value.length || 0} / 500`;
    const introduccion = document.querySelector(".encabezado-formulario-contacto p");
    if (introduccion) introduccion.textContent = "Registra tu consulta en este navegador. Con una cuenta, podrás ver la respuesta de administración en Mi perfil. Esta demostración no envía correos.";


    const tarjetasTipo = document.querySelectorAll(
        ".tarjeta-tipo-contacto"
    );

    const preguntas = document.querySelectorAll(
        ".pregunta-frecuente"
    );

    const botonPreguntas = document.getElementById("botonPreguntas");
    const seccionPreguntas = document.getElementById(
        "preguntasFrecuentes"
    );

    const botonMenu = document.getElementById("botonMenu");
    const navegacion = document.querySelector(
        ".navegacion-principal"
    );


    // =====================================================
    // TARJETAS DE MOTIVO DE CONTACTO
    // =====================================================

    tarjetasTipo.forEach((tarjeta) => {

        tarjeta.addEventListener("click", () => {

            const motivoSeleccionado = tarjeta.dataset.motivo;

            if (!motivoSeleccionado || !motivo) {
                return;
            }

            motivo.value = motivoSeleccionado;


            // Quitamos selección anterior

            tarjetasTipo.forEach((item) => {
                item.classList.remove("seleccionada");
            });


            // Marcamos la tarjeta actual

            tarjeta.classList.add("seleccionada");


            // Asunto sugerido según el motivo

            if (asunto) {

                switch (motivoSeleccionado) {

                    case "adopcion":

                        if (!asunto.value.trim()) {
                            asunto.value = "Consulta sobre adopción";
                        }

                        break;


                    case "veterinaria":

                        if (!asunto.value.trim()) {
                            asunto.value = "Consulta veterinaria";
                        }

                        break;


                    case "soporte":

                        if (!asunto.value.trim()) {
                            asunto.value = "Consulta de soporte";
                        }

                        break;

                }

            }


            // Limpiamos posible error del select

            limpiarError(motivo);


            // Llevamos al usuario al formulario

            formulario?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });



    // =====================================================
    // SINCRONIZAR SELECT CON TARJETAS
    // =====================================================

    if (motivo) {

        motivo.addEventListener("change", () => {

            tarjetasTipo.forEach((tarjeta) => {

                const estaSeleccionada =
                    tarjeta.dataset.motivo === motivo.value;

                tarjeta.classList.toggle(
                    "seleccionada",
                    estaSeleccionada
                );

            });


            if (motivo.value) {
                limpiarError(motivo);
            }

        });

    }



    // =====================================================
    // CONTADOR DEL MENSAJE
    // =====================================================

    if (mensaje && contadorMensaje) {

        const actualizarContador = () => {

            const cantidad = mensaje.value.length;

            contadorMensaje.textContent =
                `${cantidad} / 500`;


            // Aviso visual cuando se acerca al límite

            contadorMensaje.classList.toggle(
                "cerca-limite",
                cantidad >= 450
            );

        };


        mensaje.addEventListener(
            "input",
            actualizarContador
        );


        actualizarContador();

    }



    // =====================================================
    // VALIDACIÓN EN TIEMPO REAL
    // =====================================================

    const campos = [
        nombre,
        correo,
        motivo,
        asunto,
        mensaje
    ].filter(Boolean);


    campos.forEach((campo) => {

        const evento =
            campo.tagName === "SELECT"
                ? "change"
                : "input";


        campo.addEventListener(evento, () => {

            if (campo.value.trim()) {
                limpiarError(campo);
            }

        });

    });



    // =====================================================
    // ENVÍO DEL FORMULARIO
    // =====================================================

    if (formulario) {

        formulario.addEventListener("submit", (evento) => {

            evento.preventDefault();


            // Ocultamos mensajes anteriores

            if (estadoEnvio) {
                estadoEnvio.hidden = true;
            }


            let formularioValido = true;


            // -------------------------------------------------
            // Nombre
            // -------------------------------------------------

            if (!nombre.value.trim()) {

                mostrarError(
                    nombre,
                    "Ingresa tu nombre."
                );

                formularioValido = false;

            } else if (nombre.value.trim().length < 3) {

                mostrarError(
                    nombre,
                    "El nombre debe tener al menos 3 caracteres."
                );

                formularioValido = false;

            } else {

                limpiarError(nombre);

            }


            // -------------------------------------------------
            // Correo
            // -------------------------------------------------

            if (!correo.value.trim()) {

                mostrarError(
                    correo,
                    "Ingresa tu correo electrónico."
                );

                formularioValido = false;

            } else if (!correoValido(correo.value.trim())) {

                mostrarError(
                    correo,
                    "Ingresa un correo electrónico válido."
                );

                formularioValido = false;

            } else {

                limpiarError(correo);

            }


            // -------------------------------------------------
            // Motivo
            // -------------------------------------------------

            if (!motivo.value) {

                mostrarError(
                    motivo,
                    "Selecciona un motivo de contacto."
                );

                formularioValido = false;

            } else {

                limpiarError(motivo);

            }


            // -------------------------------------------------
            // Asunto
            // -------------------------------------------------

            if (!asunto.value.trim()) {

                mostrarError(
                    asunto,
                    "Ingresa un asunto."
                );

                formularioValido = false;

            } else if (asunto.value.trim().length < 4) {

                mostrarError(
                    asunto,
                    "El asunto es demasiado corto."
                );

                formularioValido = false;

            } else {

                limpiarError(asunto);

            }


            // -------------------------------------------------
            // Mensaje
            // -------------------------------------------------

            if (!mensaje.value.trim()) {

                mostrarError(
                    mensaje,
                    "Escribe tu mensaje."
                );

                formularioValido = false;

            } else if (mensaje.value.trim().length < 10) {

                mostrarError(
                    mensaje,
                    "Cuéntanos un poco más sobre tu consulta."
                );

                formularioValido = false;

            } else {

                limpiarError(mensaje);

            }


            // -------------------------------------------------
            // Si existen errores
            // -------------------------------------------------

            if (!formularioValido) {

                const primerCampoError =
                    formulario.querySelector(".campo-error");

                primerCampoError?.focus();

                return;

            }


            // -------------------------------------------------
            // Simulación del envío
            // -------------------------------------------------

            enviarFormulario();

        });

    }



    // =====================================================
    // SIMULACIÓN DE ENVÍO
    // =====================================================

    function enviarFormulario() {
        const botonEnviar = formulario.querySelector(".boton-enviar-contacto");
        if (!botonEnviar || botonEnviar.disabled) return;
        botonEnviar.disabled = true;
        const error = document.getElementById("errorRegistroContacto") || document.createElement("p");
        error.id = "errorRegistroContacto"; error.className = "mensaje-error"; error.setAttribute("role", "alert");
        if (!error.isConnected) formulario.append(error);
        error.hidden = true;
        try {
            const resultado = PEH.consultas.registrar({ nombre: nombre.value, correo: correo.value, motivo: motivo.value, asunto: asunto.value, mensaje: mensaje.value });
            if (!resultado.ok) { error.textContent = resultado.mensaje; error.hidden = false; return; }
            if (estadoEnvio) {
                estadoEnvio.replaceChildren();
                const titulo = document.createElement("strong"), texto = document.createElement("p");
                titulo.textContent = "Consulta registrada";
                texto.textContent = `Código: ${resultado.consulta.id}. Quedó guardada en este navegador; no se envió un correo.`;
                estadoEnvio.append(titulo, texto);
                if (resultado.consulta.usuarioId) {
                    const enlace = document.createElement("a"); enlace.href = "perfil.html#consultasPerfil"; enlace.textContent = "Ver mis consultas y respuestas"; estadoEnvio.append(enlace);
                } else {
                    const aviso = document.createElement("p"); aviso.textContent = "Las consultas de invitados no tienen seguimiento en un perfil. Inicia sesión con tu cuenta para recibir respuestas dentro de PEH."; estadoEnvio.append(aviso);
                }
                estadoEnvio.hidden = false;
                estadoEnvio.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
            formulario.reset(); mensaje.value = "";
            tarjetasTipo.forEach(t => t.classList.remove("seleccionada"));
            if (contadorMensaje) { contadorMensaje.textContent = "0 / 500"; contadorMensaje.classList.remove("cerca-limite"); }
            campos.forEach(limpiarError);
        } finally { botonEnviar.disabled = false; }
    }

    // =====================================================
    // FUNCIONES DE VALIDACIÓN
    // =====================================================

    function mostrarError(campo, mensajeError) {

        if (!campo) {
            return;
        }


        campo.classList.add("campo-error");


        const grupo = campo.closest(".grupo-campo");

        if (!grupo) {
            return;
        }


        const elementoError =
            grupo.querySelector(".mensaje-error");


        if (elementoError) {

            elementoError.textContent =
                mensajeError;

        }

    }



    function limpiarError(campo) {

        if (!campo) {
            return;
        }


        campo.classList.remove("campo-error");


        const grupo = campo.closest(".grupo-campo");

        if (!grupo) {
            return;
        }


        const elementoError =
            grupo.querySelector(".mensaje-error");


        if (elementoError) {

            elementoError.textContent = "";

        }

    }



    function correoValido(valor) {

        const expresion =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return expresion.test(valor);

    }



    // =====================================================
    // PREGUNTAS FRECUENTES
    // =====================================================

    preguntas.forEach((pregunta) => {

        const boton =
            pregunta.querySelector(".pregunta-boton");

        const respuesta =
            pregunta.querySelector(".pregunta-respuesta");

        const icono =
            pregunta.querySelector(".pregunta-icono");


        if (!boton || !respuesta) {
            return;
        }


        // Estado inicial

        respuesta.hidden = true;


        boton.addEventListener("click", () => {

            const estaAbierta =
                boton.getAttribute("aria-expanded") === "true";


            // Cerramos las demás preguntas

            preguntas.forEach((otraPregunta) => {

                if (otraPregunta === pregunta) {
                    return;
                }


                const otroBoton =
                    otraPregunta.querySelector(".pregunta-boton");

                const otraRespuesta =
                    otraPregunta.querySelector(".pregunta-respuesta");

                const otroIcono =
                    otraPregunta.querySelector(".pregunta-icono");


                if (otroBoton) {

                    otroBoton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }


                if (otraRespuesta) {

                    otraRespuesta.hidden = true;

                }


                if (otroIcono) {

                    otroIcono.textContent = "+";

                }


                otraPregunta.classList.remove("abierta");

            });


            // Cambiamos la pregunta actual

            boton.setAttribute(
                "aria-expanded",
                String(!estaAbierta)
            );


            respuesta.hidden =
                estaAbierta;


            pregunta.classList.toggle(
                "abierta",
                !estaAbierta
            );


            if (icono) {

                icono.textContent =
                    estaAbierta ? "+" : "−";

            }

        });

    });



    // =====================================================
    // BOTÓN "PREGUNTAS FRECUENTES"
    // =====================================================

    if (botonPreguntas && seccionPreguntas) {

        botonPreguntas.addEventListener(
            "click",
            () => {

                seccionPreguntas.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    }



    // =====================================================
    // MENÚ RESPONSIVE
    // =====================================================

    if (botonMenu && navegacion) {

        botonMenu.addEventListener("click", () => {

            const menuAbierto =
                navegacion.classList.toggle("abierta");


            botonMenu.classList.toggle(
                "activo",
                menuAbierto
            );


            botonMenu.setAttribute(
                "aria-expanded",
                String(menuAbierto)
            );

        });


        // Cerramos menú al seleccionar un enlace

        navegacion
            .querySelectorAll("a")
            .forEach((enlace) => {

                enlace.addEventListener("click", () => {

                    navegacion.classList.remove("abierta");

                    botonMenu.classList.remove("activo");

                    botonMenu.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                });

            });

    }



    // =====================================================
    // CERRAR MENÚ AL CAMBIAR A ESCRITORIO
    // =====================================================

    window.addEventListener("resize", () => {

        if (
            window.innerWidth > 900 &&
            navegacion &&
            botonMenu
        ) {

            navegacion.classList.remove("abierta");

            botonMenu.classList.remove("activo");

            botonMenu.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

});