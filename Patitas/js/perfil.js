document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTOS PRINCIPALES
    // =====================================================

    const nombrePerfil =
        document.getElementById("nombrePerfil");

    const correoPerfil =
        document.getElementById("correoPerfil");

    const fotoPerfil =
        document.getElementById("fotoPerfil");

    const inputFotoPerfil =
        document.getElementById("inputFotoPerfil");


    // =====================================================
    // BOTONES PRINCIPALES
    // =====================================================

    const botonEditarPerfil =
        document.getElementById("botonEditarPerfil");

    const botonDatosPersonales =
        document.getElementById("botonDatosPersonales");

    const botonNotificaciones =
        document.getElementById("botonNotificaciones");

    const botonSeguridad =
        document.getElementById("botonSeguridad");

    const botonPreferenciasAdopcion =
        document.getElementById("botonPreferenciasAdopcion");


    // =====================================================
    // MENÚ LATERAL
    // =====================================================

    const opcionesMenuPerfil =
        document.querySelectorAll(
            ".opcion-menu-perfil[data-seccion]"
        );


    // =====================================================
    // MODAL EDITAR PERFIL
    // =====================================================

    const modalEditarPerfil =
        document.getElementById("modalEditarPerfil");

    const formularioEditarPerfil =
        document.getElementById("formularioEditarPerfil");

    const editarNombre =
        document.getElementById("editarNombre");

    const editarCorreo =
        document.getElementById("editarCorreo");

    const mensajeEditarPerfil =
        document.getElementById("mensajeEditarPerfil");


    // =====================================================
    // MODAL CONFIGURACIÓN
    // =====================================================

    const modalConfiguracion =
        document.getElementById("modalConfiguracion");

    const iconoModalConfiguracion =
        document.getElementById("iconoModalConfiguracion");

    const tituloModalConfiguracion =
        document.getElementById("tituloModalConfiguracion");

    const descripcionModalConfiguracion =
        document.getElementById("descripcionModalConfiguracion");

    const contenidoConfiguracionModal =
        document.getElementById("contenidoConfiguracionModal");


    // =====================================================
    // CERRAR SESIÓN
    // =====================================================

    const cerrarSesionLateral =
        document.getElementById("cerrarSesionLateral");

    const modalCerrarSesion =
        document.getElementById("modalCerrarSesion");

    const confirmarCerrarSesion =
        document.getElementById("confirmarCerrarSesion");


    // =====================================================
    // MENÚ RESPONSIVE
    // =====================================================

    const botonMenu =
        document.getElementById("botonMenu");

    const navegacionPrincipal =
        document.querySelector(".navegacion-principal");


    // =====================================================
    // CLAVES LOCALSTORAGE
    // =====================================================

    const CLAVE_NOTIFICACIONES =
        "peh_preferencias_notificaciones";

    const CLAVE_ADOPCION =
        "peh_preferencias_adopcion";


    // =====================================================
    // DATOS INICIALES
    // =====================================================

    const perfilPredeterminado = {
        nombre: "Usuario PEH",
        correo: "usuario@correo.com",
        foto: null
    };


    // =====================================================
    // INICIAR PERFIL
    // =====================================================

    cargarPerfil();


    // =====================================================
    // OBTENER PERFIL GUARDADO
    // =====================================================

    function obtenerPerfil() {

        const usuario = window.PEH?.sesion.obtener();

        const datos = window.PEH?.perfil.obtener() || {};

        return {
            ...perfilPredeterminado,
            nombre: usuario?.nombre || perfilPredeterminado.nombre,
            correo: usuario?.correo || perfilPredeterminado.correo,
            ...datos
        };

    }


    // =====================================================
    // CARGAR PERFIL EN PANTALLA
    // =====================================================

    function cargarPerfil() {

        const perfil =
            obtenerPerfil();


        if (nombrePerfil) {

            nombrePerfil.textContent =
                perfil.nombre;

        }


        if (correoPerfil) {

            correoPerfil.textContent =
                perfil.correo;

        }


        const saludoPerfil =
            document.getElementById("saludoPerfil");

        if (saludoPerfil) {

            saludoPerfil.textContent =
                `¡Hola, ${perfil.nombre.trim().split(/\s+/)[0]}!`;

        }


        actualizarFotoPerfil(
            perfil.foto
        );

    }


    // =====================================================
    // GUARDAR PERFIL
    // =====================================================

    function guardarPerfil(datos) {

        return window.PEH?.perfil.guardar(datos) || false;

    }


    // =====================================================
    // EDITAR PERFIL
    // =====================================================

    if (botonEditarPerfil) {

        botonEditarPerfil.addEventListener(
            "click",
            abrirEditorPerfil
        );

    }


    if (botonDatosPersonales) {

        botonDatosPersonales.addEventListener(
            "click",
            abrirEditorPerfil
        );

    }


    function abrirEditorPerfil() {

        const perfil =
            obtenerPerfil();


        editarNombre.value =
            perfil.nombre;

        editarCorreo.value =
            perfil.correo;


        ocultarMensajePerfil();


        abrirModal(
            modalEditarPerfil
        );


        setTimeout(() => {

            editarNombre?.focus();

        }, 100);

    }


    // =====================================================
    // GUARDAR CAMBIOS DEL PERFIL
    // =====================================================

    if (formularioEditarPerfil) {

        formularioEditarPerfil.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();


                const nombre =
                    editarNombre.value.trim();

                const correo =
                    editarCorreo.value
                        .trim()
                        .toLowerCase();


                // -----------------------------------------
                // VALIDAR NOMBRE
                // -----------------------------------------

                if (nombre.length < 2) {

                    mostrarMensajePerfil(
                        "Ingresa un nombre válido.",
                        "error"
                    );

                    editarNombre.focus();

                    return;

                }


                // -----------------------------------------
                // VALIDAR CORREO
                // -----------------------------------------

                if (!validarCorreo(correo)) {

                    mostrarMensajePerfil(
                        "Ingresa un correo electrónico válido.",
                        "error"
                    );

                    editarCorreo.focus();

                    return;

                }


                // -----------------------------------------
                // ACTUALIZAR DATOS
                // -----------------------------------------

                const perfil =
                    obtenerPerfil();


                perfil.nombre =
                    nombre;

                perfil.correo =
                    correo;


                if (!guardarPerfil(perfil)) {

                    mostrarMensajePerfil(
                        "No fue posible guardar los cambios.",
                        "error"
                    );

                    return;

                }


                cargarPerfil();


                mostrarMensajePerfil(
                    "Perfil actualizado correctamente. 🐾",
                    "exito"
                );


                setTimeout(() => {

                    cerrarModal(
                        modalEditarPerfil
                    );

                }, 900);

            }
        );

    }


    // =====================================================
    // CAMBIAR FOTO DE PERFIL
    // =====================================================

    if (inputFotoPerfil) {

        inputFotoPerfil.addEventListener(
            "change",
            () => {

                const archivo =
                    inputFotoPerfil.files[0];


                if (!archivo) {
                    return;
                }


                // -----------------------------------------
                // VALIDAR ARCHIVO
                // -----------------------------------------

                if (!archivo.type.startsWith("image/")) {

                    alert(
                        "Selecciona una imagen válida."
                    );

                    inputFotoPerfil.value = "";

                    return;

                }


                // -----------------------------------------
                // MÁXIMO 2 MB
                // -----------------------------------------

                const limite =
                    2 * 1024 * 1024;


                if (archivo.size > limite) {

                    alert(
                        "La imagen no puede superar los 2 MB."
                    );

                    inputFotoPerfil.value = "";

                    return;

                }


                const lector =
                    new FileReader();


                lector.onload = (evento) => {

                    const perfil =
                        obtenerPerfil();


                    perfil.foto =
                        evento.target.result;


                    if (!guardarPerfil(perfil)) {

                        alert(
                            "No fue posible guardar la imagen."
                        );

                        return;

                    }


                    actualizarFotoPerfil(
                        perfil.foto
                    );

                };


                lector.readAsDataURL(
                    archivo
                );

            }
        );

    }


    // =====================================================
    // ACTUALIZAR FOTO
    // =====================================================

    function actualizarFotoPerfil(foto) {

        if (!fotoPerfil) {
            return;
        }


        if (!foto) {

            fotoPerfil.textContent =
                obtenerPerfil().nombre.trim().charAt(0).toUpperCase();

            fotoPerfil.classList.remove(
                "con-imagen"
            );

            return;

        }


        fotoPerfil.innerHTML = "";


        const imagen =
            document.createElement("img");


        imagen.src = foto;

        imagen.alt =
            "Foto de perfil";


        fotoPerfil.appendChild(
            imagen
        );


        fotoPerfil.classList.add(
            "con-imagen"
        );

    }


    // =====================================================
    // NAVEGACIÓN LATERAL DEL PERFIL
    // =====================================================

    opcionesMenuPerfil.forEach(
        (opcion) => {

            opcion.addEventListener(
                "click",
                () => {

                    const idSeccion =
                        opcion.dataset.seccion;


                    const seccion =
                        document.getElementById(
                            idSeccion
                        );


                    if (!seccion) {
                        return;
                    }


                    opcionesMenuPerfil.forEach(
                        (boton) => {

                            boton.classList.remove(
                                "activo"
                            );

                        }
                    );


                    opcion.classList.add(
                        "activo"
                    );


                    seccion.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        }
    );


    // =====================================================
    // CONFIGURACIÓN - NOTIFICACIONES
    // =====================================================

    if (botonNotificaciones) {

        botonNotificaciones.addEventListener(
            "click",
            abrirConfiguracionNotificaciones
        );

    }


    function abrirConfiguracionNotificaciones() {

        const preferencias =
            obtenerPreferenciasNotificaciones();


        prepararModalConfiguracion(
            "🔔",
            "Notificaciones",
            "Elige qué información importante quieres recibir."
        );


        contenidoConfiguracionModal.innerHTML = `

            <form
                class="formulario-configuracion"
                id="formularioNotificaciones"
            >

                <label class="opcion-interruptor">

                    <span>

                        <strong>
                            Proceso de adopción
                        </strong>

                        <small>
                            Recibe novedades sobre el estado
                            de tus solicitudes.
                        </small>

                    </span>

                    <input
                        type="checkbox"
                        name="adopcion"
                        ${preferencias.adopcion ? "checked" : ""}
                    >

                    <span class="interruptor"></span>

                </label>


                <label class="opcion-interruptor">

                    <span>

                        <strong>
                            Reservas veterinarias
                        </strong>

                        <small>
                            Recibe recordatorios de tus
                            próximas reservas.
                        </small>

                    </span>

                    <input
                        type="checkbox"
                        name="veterinaria"
                        ${preferencias.veterinaria ? "checked" : ""}
                    >

                    <span class="interruptor"></span>

                </label>


                <label class="opcion-interruptor">

                    <span>

                        <strong>
                            Información de PEH
                        </strong>

                        <small>
                            Recibe avisos relevantes sobre
                            servicios y funcionamiento.
                        </small>

                    </span>

                    <input
                        type="checkbox"
                        name="informacion"
                        ${preferencias.informacion ? "checked" : ""}
                    >

                    <span class="interruptor"></span>

                </label>


                <button
                    class="boton-guardar-configuracion"
                    type="submit"
                >
                    Guardar preferencias
                </button>

            </form>

        `;


        abrirModal(
            modalConfiguracion
        );


        const formulario =
            document.getElementById(
                "formularioNotificaciones"
            );


        formulario?.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();


                const datos = {

                    adopcion:
                        formulario.elements
                            .adopcion.checked,

                    veterinaria:
                        formulario.elements
                            .veterinaria.checked,

                    informacion:
                        formulario.elements
                            .informacion.checked

                };


                if (!guardarDatosLocales(CLAVE_NOTIFICACIONES, datos)) {

                    mostrarConfirmacionConfiguracion(
                        "No fue posible guardar. Comprueba que hayas iniciado sesión e inténtalo nuevamente."
                    );

                    return;

                }


                mostrarConfirmacionConfiguracion(
                    "Preferencias guardadas correctamente. 🐾"
                );

            }
        );

    }


    // =====================================================
    // OBTENER PREFERENCIAS DE NOTIFICACIONES
    // =====================================================

    function obtenerPreferenciasNotificaciones() {

        return obtenerDatosLocales(
            CLAVE_NOTIFICACIONES,
            {
                adopcion: true,
                veterinaria: true,
                informacion: false
            }
        );

    }


    // =====================================================
    // CONFIGURACIÓN - SEGURIDAD
    // =====================================================

    if (botonSeguridad) {

        botonSeguridad.addEventListener(
            "click",
            abrirConfiguracionSeguridad
        );

    }


    function abrirConfiguracionSeguridad() {

        prepararModalConfiguracion(
            "🔒",
            "Seguridad y privacidad",
            "Administra la seguridad básica de tu cuenta."
        );


        contenidoConfiguracionModal.innerHTML = `

            <form
                class="formulario-configuracion"
                id="formularioSeguridad"
            >

                <div class="grupo-configuracion">

                    <label for="contrasenaActual">
                        Contraseña actual
                    </label>

                    <input
                        id="contrasenaActual"
                        name="actual"
                        type="password"
                        autocomplete="current-password"
                        required
                    >

                </div>


                <div class="grupo-configuracion">

                    <label for="nuevaContrasena">
                        Nueva contraseña (8 caracteres, mayúscula, minúscula, número y símbolo)
                    </label>

                    <input
                        id="nuevaContrasena"
                        name="nueva"
                        type="password"
                        minlength="8"
                        autocomplete="new-password"
                        required
                    >

                </div>


                <div class="grupo-configuracion">

                    <label for="confirmarContrasena">
                        Confirmar nueva contraseña
                    </label>

                    <input
                        id="confirmarContrasena"
                        name="confirmar"
                        type="password"
                        minlength="8"
                        autocomplete="new-password"
                        required
                    >

                </div>


                <div
                    class="mensaje-configuracion"
                    id="mensajeSeguridad"
                    hidden
                ></div>


                <button
                    class="boton-guardar-configuracion"
                    type="submit"
                >
                    Actualizar contraseña
                </button>

            </form>


            <div class="nota-seguridad">

                <strong>
                    Privacidad en PEH
                </strong>

                <p>
                    Tu perfil funciona como un espacio personal
                    de gestión. No mostramos seguidores,
                    publicaciones personales ni métricas sociales.
                </p>

            </div>

        `;


        abrirModal(
            modalConfiguracion
        );


        const formulario =
            document.getElementById(
                "formularioSeguridad"
            );


        let procesando = false;
        formulario?.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            if (procesando) return;
            const mensaje = document.getElementById("mensajeSeguridad");
            const boton = formulario.querySelector('button[type="submit"]');
            procesando = true;
            if (boton) boton.disabled = true;
            mostrarMensajeElemento(mensaje, "Comprobando los datos…", "info");
            try {
                if (!window.PEH?.cuentas?.cambiarContrasena) {
                    throw new Error("El sistema de cuentas no está disponible.");
                }
                const resultado = await window.PEH.cuentas.cambiarContrasena(
                    formulario.elements.actual.value,
                    formulario.elements.nueva.value,
                    formulario.elements.confirmar.value
                );
                if (resultado.ok) formulario.reset();
                mostrarMensajeElemento(mensaje, resultado.mensaje, resultado.ok ? "exito" : "error");
            } catch (error) {
                mostrarMensajeElemento(mensaje, "No se pudo procesar el cambio. Recarga la página e inténtalo nuevamente.", "error");
            } finally {
                procesando = false;
                if (boton) boton.disabled = false;
            }
        });

    }


    // =====================================================
    // CONFIGURACIÓN - PREFERENCIAS DE ADOPCIÓN
    // =====================================================

    if (botonPreferenciasAdopcion) {

        botonPreferenciasAdopcion.addEventListener(
            "click",
            abrirPreferenciasAdopcion
        );

    }


    function abrirPreferenciasAdopcion() {

        const preferencias =
            obtenerDatosLocales(
                CLAVE_ADOPCION,
                {
                    tipoAnimal: "",
                    tamano: "",
                    vivienda: "",
                    experiencia: ""
                }
            );


        prepararModalConfiguracion(
            "🐾",
            "Preferencias de adopción",
            "Cuéntanos qué tipo de compañero podría adaptarse mejor a tu estilo de vida."
        );


        contenidoConfiguracionModal.innerHTML = `

            <form
                class="formulario-configuracion"
                id="formularioPreferenciasAdopcion"
            >

                <div class="grupo-configuracion">

                    <label for="preferenciaAnimal">
                        Tipo de animal
                    </label>

                    <select
                        id="preferenciaAnimal"
                        name="tipoAnimal"
                    >

                        <option value="">
                            Sin preferencia
                        </option>

                        <option
                            value="perro"
                            ${preferencias.tipoAnimal === "perro" ? "selected" : ""}
                        >
                            Perro
                        </option>

                        <option
                            value="gato"
                            ${preferencias.tipoAnimal === "gato" ? "selected" : ""}
                        >
                            Gato
                        </option>

                    </select>

                </div>


                <div class="grupo-configuracion">

                    <label for="preferenciaTamano">
                        Tamaño
                    </label>

                    <select
                        id="preferenciaTamano"
                        name="tamano"
                    >

                        <option value="">
                            Sin preferencia
                        </option>

                        <option
                            value="pequeno"
                            ${preferencias.tamano === "pequeno" ? "selected" : ""}
                        >
                            Pequeño
                        </option>

                        <option
                            value="mediano"
                            ${preferencias.tamano === "mediano" ? "selected" : ""}
                        >
                            Mediano
                        </option>

                        <option
                            value="grande"
                            ${preferencias.tamano === "grande" ? "selected" : ""}
                        >
                            Grande
                        </option>

                    </select>

                </div>


                <div class="grupo-configuracion">

                    <label for="preferenciaVivienda">
                        Tipo de vivienda
                    </label>

                    <select
                        id="preferenciaVivienda"
                        name="vivienda"
                    >

                        <option value="">
                            Prefiero no indicar
                        </option>

                        <option
                            value="casa"
                            ${preferencias.vivienda === "casa" ? "selected" : ""}
                        >
                            Casa
                        </option>

                        <option
                            value="departamento"
                            ${preferencias.vivienda === "departamento" ? "selected" : ""}
                        >
                            Departamento
                        </option>

                    </select>

                </div>


                <div class="grupo-configuracion">

                    <label for="preferenciaExperiencia">
                        Experiencia cuidando animales
                    </label>

                    <select
                        id="preferenciaExperiencia"
                        name="experiencia"
                    >

                        <option value="">
                            Prefiero no indicar
                        </option>

                        <option
                            value="primera"
                            ${preferencias.experiencia === "primera" ? "selected" : ""}
                        >
                            Sería mi primera adopción
                        </option>

                        <option
                            value="experiencia"
                            ${preferencias.experiencia === "experiencia" ? "selected" : ""}
                        >
                            Ya he cuidado animales
                        </option>

                    </select>

                </div>


                <div class="nota-preferencias">

                    <span>
                        🧡
                    </span>

                    <p>
                        Estas preferencias sirven como orientación.
                        No crean una lista de favoritos ni reservan
                        animales automáticamente.
                    </p>

                </div>


                <button
                    class="boton-guardar-configuracion"
                    type="submit"
                >
                    Guardar preferencias
                </button>

            </form>

        `;


        abrirModal(
            modalConfiguracion
        );


        const formulario =
            document.getElementById(
                "formularioPreferenciasAdopcion"
            );


        formulario?.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();


                const datos = {

                    tipoAnimal:
                        formulario.elements
                            .tipoAnimal.value,

                    tamano:
                        formulario.elements
                            .tamano.value,

                    vivienda:
                        formulario.elements
                            .vivienda.value,

                    experiencia:
                        formulario.elements
                            .experiencia.value

                };


                if (!guardarDatosLocales(CLAVE_ADOPCION, datos)) {

                    mostrarConfirmacionConfiguracion(
                        "No fue posible guardar. Comprueba que hayas iniciado sesión e inténtalo nuevamente."
                    );

                    return;

                }


                mostrarConfirmacionConfiguracion(
                    "Preferencias de adopción guardadas. 🐾"
                );

            }
        );

    }


    // =====================================================
    // MENÚ LATERAL - NOTIFICACIONES
    // =====================================================

    const botonNotificacionesLateral =
        document.querySelector(
            '[data-seccion="notificacionesPerfil"]'
        );


    if (botonNotificacionesLateral) {

        botonNotificacionesLateral.addEventListener(
            "dblclick",
            abrirConfiguracionNotificaciones
        );

    }


    // =====================================================
    // PREPARAR MODAL DE CONFIGURACIÓN
    // =====================================================

    function prepararModalConfiguracion(
        icono,
        titulo,
        descripcion
    ) {

        if (iconoModalConfiguracion) {

            iconoModalConfiguracion.textContent =
                icono;

        }


        if (tituloModalConfiguracion) {

            tituloModalConfiguracion.textContent =
                titulo;

        }


        if (descripcionModalConfiguracion) {

            descripcionModalConfiguracion.textContent =
                descripcion;

        }


        if (contenidoConfiguracionModal) {

            contenidoConfiguracionModal.innerHTML =
                "";

        }

    }


    // =====================================================
    // CONFIRMACIÓN DE CONFIGURACIÓN
    // =====================================================

    function mostrarConfirmacionConfiguracion(
        texto
    ) {

        let mensaje =
            contenidoConfiguracionModal
                .querySelector(
                    ".mensaje-confirmacion-configuracion"
                );


        if (!mensaje) {

            mensaje =
                document.createElement("div");


            mensaje.className =
                "mensaje-confirmacion-configuracion";


            contenidoConfiguracionModal.prepend(
                mensaje
            );

        }


        mensaje.textContent =
            texto;


        mensaje.classList.add(
            "visible"
        );


        setTimeout(() => {

            mensaje.classList.remove(
                "visible"
            );

        }, 3000);

    }



    
    // =====================================================
    // HISTORIAL DE SOLICITUDES DE ADOPCIÓN
    // =====================================================

    const tarjetaAdopcion =
        document.getElementById("adopcionPerfil");

    const modalHistorialAdopciones =
        document.getElementById("modalHistorialAdopciones");

    const cerrarHistorialAdopciones =
        document.getElementById("cerrarHistorialAdopciones");

    const listaHistorialAdopciones =
        document.getElementById("listaHistorialAdopciones");

    const resumenHistorialAdopcion =
        document.getElementById("resumenHistorialAdopcion");

    const estadisticasHistorialAdopciones =
        document.getElementById("estadisticasHistorialAdopciones");

    let elementoAnteriorAdopciones = null;

    let filtroActualAdopciones = "todas";

    // =====================================================
    // UTILIDADES
    // =====================================================

    function escaparDatoAdopcion(valor) {
        return String(valor ?? "").replace(
            /[&<>"']/g,
            caracter => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[caracter]
        );
    }

    function obtenerSolicitudesAdopcion() {

        if (!window.PEH?.adopciones || !PEH.sesion) {
            return [];
        }

        const usuario = PEH.sesion.obtener();

        if (!usuario?.id) {
            return [];
        }

        return PEH.adopciones.listar(usuario.id);
    }

    function fechaSolicitudAdopcion(fecha) {

        if (!fecha) return "Fecha no disponible";

        const objeto = new Date(fecha);

        if (Number.isNaN(objeto.getTime())) {
            return "Fecha no disponible";
        }

        return objeto.toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    function obtenerEstadoAdopcion(estado) {

        const valor = String(
            estado || "Pendiente"
        ).trim().toLowerCase();

        const estados = {
            "pendiente": {
                texto: "Pendiente",
                clase: "pendiente"
            },
            "en revisión": {
                texto: "En revisión",
                clase: "revision"
            },
            "en revision": {
                texto: "En revisión",
                clase: "revision"
            },
            "aprobada": {
                texto: "Aprobada",
                clase: "aprobada"
            },
            "rechazada": {
                texto: "Rechazada",
                clase: "rechazada"
            },
            "completada": {
                texto: "Completada",
                clase: "completada"
            },
            "cancelada": {
                texto: "Cancelada",
                clase: "cancelada"
            }
        };

        return estados[valor] || {
            texto: estado || "Pendiente",
            clase: "pendiente"
        };
    }

    // =====================================================
    // ACTUALIZAR TARJETA PRINCIPAL
    // =====================================================


    function actualizarResumenAdopciones() {

    if (!resumenHistorialAdopcion) return;

    const solicitudes = obtenerSolicitudesAdopcion();

    const pendientes = solicitudes.filter(solicitud => {

        const estado = obtenerEstadoAdopcion(
            solicitud.estado
        );

        return [
            "pendiente",
            "revision"
        ].includes(estado.clase);

    }).length;

    const aprobadas = solicitudes.filter(solicitud => {

        const estado = obtenerEstadoAdopcion(
            solicitud.estado
        );

        return estado.clase === "aprobada";

    }).length;

    // ==============================================
    // RESUMEN SIN SOLICITUDES
    // ==============================================

    if (solicitudes.length === 0) {

        resumenHistorialAdopcion.innerHTML = `
            <div class="contenido-resumen-adopcion">

                <div
                    class="imagen-animal-resumen"
                    aria-hidden="true"
                >
                    🐾
                </div>

                <div class="datos-adopcion-resumen">

                    <h4>Mis solicitudes</h4>

                    <p>
                        Todavía no tienes solicitudes
                        de adopción registradas.
                    </p>

                    <p>
                        Cuando solicites adoptar una mascota,
                        podrás consultar aquí su estado.
                    </p>

                </div>

            </div>
        `;

        return;
    }

    // ==============================================
    // RESUMEN CON SOLICITUDES
    // ==============================================

    resumenHistorialAdopcion.innerHTML = `
        <div class="contenido-resumen-adopcion">

            <div
                class="imagen-animal-resumen"
                aria-hidden="true"
            >
                🐾
            </div>

            <div class="datos-adopcion-resumen">

                <h4>Mis solicitudes</h4>

                <p>
                    <strong>${solicitudes.length}</strong>
                    ${solicitudes.length === 1
                        ? "solicitud registrada"
                        : "solicitudes registradas"}
                </p>

                <p>
                    <strong>${pendientes}</strong>
                    ${pendientes === 1
                        ? "pendiente o en revisión"
                        : "pendientes o en revisión"}
                </p>

                <p>
                    <strong>${aprobadas}</strong>
                    ${aprobadas === 1
                        ? "solicitud aprobada"
                        : "solicitudes aprobadas"}
                </p>

            </div>

        </div>
    `;
}



    // =====================================================
    // RENDERIZAR HISTORIAL DE ADOPCIONES
    // =====================================================

    function renderizarHistorialAdopciones() {

        if (!listaHistorialAdopciones) return;

        const solicitudes = obtenerSolicitudesAdopcion();

        // =================================================
        // CONTADORES
        // =================================================

        const contarEstados = (...clases) => {

            return solicitudes.filter(solicitud => {

                const estado = obtenerEstadoAdopcion(
                    solicitud.estado
                );

                return clases.includes(estado.clase);

            }).length;
        };

        const pendientes = contarEstados(
            "pendiente",
            "revision"
        );

        const aprobadas = contarEstados(
            "aprobada"
        );

        const rechazadas = contarEstados(
            "rechazada"
        );

        // =================================================
        // ESTADÍSTICAS
        // =================================================

        if (estadisticasHistorialAdopciones) {

            estadisticasHistorialAdopciones.innerHTML = `
                <div class="estadistica-adopcion">
                    <strong>${solicitudes.length}</strong>
                    <span>Total de solicitudes</span>
                </div>

                <div class="estadistica-adopcion">
                    <strong>${pendientes}</strong>
                    <span>Pendientes</span>
                </div>

                <div class="estadistica-adopcion">
                    <strong>${aprobadas}</strong>
                    <span>Aprobadas</span>
                </div>
            `;
        }

        // =================================================
        // SIN SOLICITUDES
        // =================================================

        if (solicitudes.length === 0) {

            listaHistorialAdopciones.innerHTML = `
                <div class="historial-adopciones-vacio">

                    <span class="icono-historial-vacio">
                        🐾
                    </span>

                    <h3>
                        Todavía no tienes solicitudes
                    </h3>

                    <p>
                        Cuando solicites adoptar una mascota,
                        aquí podrás consultar su estado
                        y revisar su historial.
                    </p>

                    <a
                        href="principal.html"
                        class="boton-explorar-adopciones"
                    >
                        Conocer animales
                    </a>

                </div>
            `;

            return;
        }

        // =================================================
        // FILTROS
        // =================================================

        const filtros = [
            {
                valor: "todas",
                texto: "Todas",
                cantidad: solicitudes.length
            },
            {
                valor: "pendientes",
                texto: "Pendientes",
                cantidad: pendientes
            },
            {
                valor: "aprobadas",
                texto: "Aprobadas",
                cantidad: aprobadas
            },
            {
                valor: "rechazadas",
                texto: "Rechazadas",
                cantidad: rechazadas
            }
        ];

        const barraFiltros = `
            <div
                class="filtros-historial-adopciones"
                role="group"
                aria-label="Filtrar solicitudes por estado"
            >
                ${filtros.map(filtro => `

                    <button
                        type="button"
                        class="filtro-historial-adopcion
                            ${filtroActualAdopciones === filtro.valor
                                ? "activo"
                                : ""}"
                        data-filtro-adopcion="${filtro.valor}"
                        aria-pressed="${
                            filtroActualAdopciones === filtro.valor
                        }"
                    >
                        ${filtro.texto}

                        <span>
                            ${filtro.cantidad}
                        </span>
                    </button>

                `).join("")}
            </div>
        `;

        // =================================================
        // FILTRAR SOLICITUDES
        // =================================================

        const solicitudesFiltradas = solicitudes.filter(
            solicitud => {

                const estado = obtenerEstadoAdopcion(
                    solicitud.estado
                ).clase;

                switch (filtroActualAdopciones) {

                    case "pendientes":
                        return [
                            "pendiente",
                            "revision"
                        ].includes(estado);

                    case "aprobadas":
                        return estado === "aprobada";

                    case "rechazadas":
                        return estado === "rechazada";

                    default:
                        return true;
                }
            }
        );

        // =================================================
        // ORDENAR POR FECHA
        // =================================================

        solicitudesFiltradas.sort((a, b) => {

            const fechaA = new Date(
                a.fechaCreacion || 0
            ).getTime();

            const fechaB = new Date(
                b.fechaCreacion || 0
            ).getTime();

            return (
                (Number.isFinite(fechaB) ? fechaB : 0) -
                (Number.isFinite(fechaA) ? fechaA : 0)
            );
        });

        // =================================================
        // TARJETAS DE SOLICITUDES
        // =================================================

        const tarjetas = solicitudesFiltradas.map(
            solicitud => {

                const animal = escaparDatoAdopcion(
                    solicitud.animalNombre ||
                    "Animal sin nombre"
                );

                const fecha = fechaSolicitudAdopcion(
                    solicitud.fechaCreacion
                );

                const estado = obtenerEstadoAdopcion(
                    solicitud.estado
                );

                const identificador = escaparDatoAdopcion(
                    solicitud.id ||
                    "Sin identificador"
                );

                const descripciones = {

                    pendiente:
                        "Tu solicitud fue recibida y está pendiente de revisión.",

                    revision:
                        "Tu solicitud se encuentra en proceso de revisión.",

                    aprobada:
                        "Tu solicitud fue aprobada.",

                    rechazada:
                        "Esta solicitud no fue aprobada.",

                    completada:
                        "Este proceso de adopción ha finalizado.",

                    cancelada:
                        "Esta solicitud fue cancelada."
                };

                const descripcion =
                    descripciones[estado.clase] ||
                    "Consulta el estado de tu solicitud.";

                return `
                    <article class="item-historial-adopcion">

                        <div class="informacion-historial-adopcion">

                            <div class="icono-animal-historial">
                                🐾
                            </div>

                            <div class="datos-animal-historial">

                                <h3>${animal}</h3>

                                <p class="fecha-historial-adopcion">
                                    Solicitud: ${fecha}
                                </p>

                                <span
                                    class="estado-adopcion estado-${estado.clase}"
                                >
                                    ${escaparDatoAdopcion(estado.texto)}
                                </span>

                            </div>

                        </div>

                        <div class="detalle-historial-adopcion">

                            <small>
                                Código: ${identificador}
                            </small>

                            <p>
                                ${descripcion}${solicitud.observacionAdmin ? `<br><strong>Administración:</strong> ${escaparDatoAdopcion(solicitud.observacionAdmin)}` : ""}
                            </p>

                        </div>

                    </article>
                `;

            }
        ).join("");

        // =================================================
        // MOSTRAR RESULTADOS
        // =================================================

        const contenido = solicitudesFiltradas.length > 0
            ? tarjetas
            : `
                <div class="historial-adopciones-vacio">

                    <span class="icono-historial-vacio">
                        🐾
                    </span>

                    <h3>
                        No hay solicitudes en esta categoría
                    </h3>

                    <p>
                        Puedes seleccionar otro filtro
                        para revisar tus solicitudes.
                    </p>

                </div>
            `;

        listaHistorialAdopciones.innerHTML = `
            ${barraFiltros}

            <div class="resultados-historial-adopciones">
                ${contenido}
            </div>
        `;

    }


    // =====================================================
    // ABRIR Y CERRAR POPUP
    // =====================================================

    function abrirHistorialAdopciones() {

        if (!modalHistorialAdopciones) return;

        actualizarResumenAdopciones();
        renderizarHistorialAdopciones();

        elementoAnteriorAdopciones =
            document.activeElement;

        modalHistorialAdopciones.hidden = false;

        modalHistorialAdopciones.setAttribute(
            "aria-hidden", "false"
        );

        document.body.classList.add("modal-abierto");

        modalHistorialAdopciones
            .querySelector(".contenido-historial-adopciones")
            ?.focus();
    }

    function cerrarPopupAdopciones() {

        if (!modalHistorialAdopciones) return;

        modalHistorialAdopciones.hidden = true;

        modalHistorialAdopciones.setAttribute(
            "aria-hidden", "true"
        );

        const otroModalAbierto = Array.from(
            document.querySelectorAll(".modal-perfil")
        ).some(modal => !modal.hidden);

        if (!otroModalAbierto) {
            document.body.classList.remove("modal-abierto");
        }

        if (elementoAnteriorAdopciones?.isConnected) {
            elementoAnteriorAdopciones.focus();
        }
    }

    // =====================================================
    // EVENTOS
    // =====================================================

    if (modalHistorialAdopciones) {
        modalHistorialAdopciones.hidden = true;
    }

    if (tarjetaAdopcion) {

        tarjetaAdopcion.addEventListener(
            "click",
            abrirHistorialAdopciones
        );

        tarjetaAdopcion.addEventListener(
            "keydown",
            evento => {

                if (
                    evento.key === "Enter" ||
                    evento.key === " "
                ) {
                    evento.preventDefault();
                    abrirHistorialAdopciones();
                }

            }
        );
    }

        // =====================================================
    // EVENTOS DE FILTROS DE ADOPCIÓN
    // =====================================================

    listaHistorialAdopciones?.addEventListener(
        "click",
        evento => {

            const boton = evento.target.closest(
                "[data-filtro-adopcion]"
            );

            if (!boton) return;

            const filtro = boton.dataset.filtroAdopcion;

            const filtrosPermitidos = [
                "todas",
                "pendientes",
                "aprobadas",
                "rechazadas"
            ];

            if (!filtrosPermitidos.includes(filtro)) {
                return;
            }

            filtroActualAdopciones = filtro;

            renderizarHistorialAdopciones();
        }
    );

    cerrarHistorialAdopciones?.addEventListener(
        "click",
        cerrarPopupAdopciones
    );

    modalHistorialAdopciones
        ?.querySelectorAll("[data-cerrar-historial-adopciones]")
        .forEach(elemento => {

            elemento.addEventListener(
                "click",
                cerrarPopupAdopciones
            );

        });

    document.addEventListener("keydown", evento => {

        if (
            evento.key === "Escape" &&
            modalHistorialAdopciones &&
            !modalHistorialAdopciones.hidden
        ) {
            cerrarPopupAdopciones();
        }

    });

    // =====================================================
    // SINCRONIZACIÓN CON LOCALSTORAGE
    // =====================================================

    function sincronizarHistorialAdopciones() {

        actualizarResumenAdopciones();

        if (
            modalHistorialAdopciones &&
            !modalHistorialAdopciones.hidden
        ) {
            renderizarHistorialAdopciones();
        }
    }

    window.addEventListener(
        "peh:actualizado",
        sincronizarHistorialAdopciones
    );

    window.addEventListener(
        "storage",
        sincronizarHistorialAdopciones
    );

    // Carga inicial
    actualizarResumenAdopciones();


    
    // =====================================================
    // HISTORIAL DE RESERVAS VETERINARIAS
    // =====================================================

    const tarjetaReservas =
        document.getElementById("reservasPerfil");

    const modalHistorialReservas =
        document.getElementById("modalHistorialReservas");

    const botonCerrarHistorialReservas =
        document.getElementById("cerrarHistorialReservas");

    const resumenReservaVeterinaria =
        document.getElementById("resumenReservaVeterinaria");

    const listaHistorialReservas =
        document.getElementById("listaHistorialReservas");

    const estadisticasHistorialReservas =
        document.getElementById("estadisticasHistorialReservas");

    let elementoAnteriorReservas = null;

    // =====================================================
    // UTILIDADES
    // =====================================================

    function escaparDatoReserva(valor) {

        return String(valor ?? "").replace(
            /[&<>"']/g,
            caracter => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[caracter]
        );
    }

    function obtenerReservasUsuario() {

        if (!window.PEH?.reservas?.listar ||
            !window.PEH?.sesion?.obtener) {
            return [];
        }

        const usuario = PEH.sesion.obtener();

        if (!usuario?.id) return [];

        const reservas = PEH.reservas.listar(usuario.id);

        return Array.isArray(reservas) ? reservas : [];
    }

    function obtenerFechaHoraReserva(reserva) {

        if (!reserva?.fecha || !reserva?.hora) {
            return null;
        }

        const fecha = new Date(
            `${reserva.fecha}T${reserva.hora}`
        );

        return Number.isNaN(fecha.getTime())
            ? null
            : fecha;
    }

    function formatearFechaReserva(fecha) {

        if (!fecha) return "Fecha no disponible";

        const objeto = new Date(`${fecha}T12:00:00`);

        if (Number.isNaN(objeto.getTime())) {
            return "Fecha no disponible";
        }

        return objeto.toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    function obtenerEstadoReserva(estado) {

        const valor = String(
            estado || "Pendiente"
        ).trim().toLowerCase();

        const estados = {
            "pendiente": {
                texto: "Pendiente",
                clase: "pendiente"
            },
            "confirmada": {
                texto: "Confirmada",
                clase: "confirmada"
            },
            "en revisión": {
                texto: "En revisión",
                clase: "revision"
            },
            "en revision": {
                texto: "En revisión",
                clase: "revision"
            },
            "completada": {
                texto: "Completada",
                clase: "completada"
            },
            "cancelada": {
                texto: "Cancelada",
                clase: "cancelada"
            },
            "rechazada": {
                texto: "Rechazada",
                clase: "rechazada"
            }
        };

        return estados[valor] || {
            texto: estado || "Pendiente",
            clase: "desconocido"
        };
    }

    function esReservaFinalizada(reserva) {

        const estado = obtenerEstadoReserva(
            reserva.estado
        ).clase;

        return [
            "completada",
            "cancelada",
            "rechazada"
        ].includes(estado);
    }

    // =====================================================
    // OBTENER PRÓXIMA RESERVA
    // =====================================================

    function obtenerProximaReserva() {

        const ahora = new Date();

        return obtenerReservasUsuario()
            .filter(reserva => {

                const fecha =
                    obtenerFechaHoraReserva(reserva);

                return fecha &&
                    fecha >= ahora &&
                    !esReservaFinalizada(reserva);
            })
            .sort((a, b) => {

                return obtenerFechaHoraReserva(a) -
                    obtenerFechaHoraReserva(b);

            })[0] || null;
    }

    // =====================================================
    // ACTUALIZAR TARJETA PRINCIPAL
    // =====================================================

    function actualizarResumenReservas() {

        if (!resumenReservaVeterinaria) return;

        const proxima = obtenerProximaReserva();

        if (!proxima) {

            resumenReservaVeterinaria.innerHTML = `
                <div
                    class="imagen-animal-resumen"
                    aria-hidden="true"
                >
                    🩺
                </div>

                <div class="datos-reserva-resumen">
                    <h4>Sin próximas reservas</h4>
                    <p>
                        No tienes consultas veterinarias
                        futuras registradas.
                    </p>
                </div>
            `;

            return;
        }

        const servicio = escaparDatoReserva(
            proxima.servicioNombre ||
            proxima.servicio ||
            "Consulta veterinaria"
        );

        const mascota = escaparDatoReserva(
            proxima.mascotaNombre ||
            "Tu mascota"
        );

        const fecha = escaparDatoReserva(
            formatearFechaReserva(proxima.fecha)
        );

        const hora = escaparDatoReserva(
            proxima.hora || "Sin horario"
        );

        const estado = obtenerEstadoReserva(
            proxima.estado
        );

        
        resumenReservaVeterinaria.innerHTML = `
            <div
                class="imagen-animal-resumen"
                aria-hidden="true"
            >
                🩺
            </div>

            <div class="datos-reserva-resumen">

                <h4>${servicio}</h4>

                <p class="mascota-reserva-resumen">
                    🐾 ${mascota}
                </p>

                <ul>
                    <li>
                        <span>▣</span>
                        ${fecha}
                    </li>

                    <li>
                        <span>◷</span>
                        ${hora} hrs
                    </li>

                    <li>
                        <span>●</span>
                        ${escaparDatoReserva(estado.texto)}
                    </li>
                </ul>

            </div>
        `;

    }

    // =====================================================
    // RENDERIZAR HISTORIAL COMPLETO
    // =====================================================

    function renderizarHistorialReservas() {

        if (!listaHistorialReservas) return;

        const reservas = obtenerReservasUsuario();

        const ahora = new Date();

        const futuras = reservas.filter(reserva => {

            const fecha = obtenerFechaHoraReserva(reserva);

            return fecha &&
                fecha >= ahora &&
                !esReservaFinalizada(reserva);
        });

        const anteriores = reservas.filter(reserva => {

            const fecha = obtenerFechaHoraReserva(reserva);

            return !fecha ||
                fecha < ahora ||
                esReservaFinalizada(reserva);
        });

        futuras.sort((a, b) =>
            obtenerFechaHoraReserva(a) -
            obtenerFechaHoraReserva(b)
        );

        anteriores.sort((a, b) =>
            (obtenerFechaHoraReserva(b)?.getTime() || 0) -
            (obtenerFechaHoraReserva(a)?.getTime() || 0)
        );

        if (estadisticasHistorialReservas) {

            estadisticasHistorialReservas.innerHTML = `
                <div class="estadistica-reserva">
                    <strong>${reservas.length}</strong>
                    <span>Reservas registradas</span>
                </div>

                <div class="estadistica-reserva">
                    <strong>${futuras.length}</strong>
                    <span>Próximas</span>
                </div>
            `;
        }

        if (reservas.length === 0) {

            listaHistorialReservas.innerHTML = `
                <div class="historial-reservas-vacio">

                    <span class="icono-historial-vacio">
                        🩺
                    </span>

                    <h3>
                        Todavía no tienes reservas
                    </h3>

                    <p>
                        Cuando agendes una atención
                        veterinaria, aquí aparecerá
                        su información.
                    </p>

                    <a
                        href="veterinaria.html"
                        class="boton-agendar-reserva"
                    >
                        Agendar una consulta
                    </a>

                </div>
            `;

            return;
        }

        function crearTarjetaReserva(reserva) {

            const servicio = escaparDatoReserva(
                reserva.servicioNombre ||
                reserva.servicio ||
                "Consulta veterinaria"
            );

            const mascota = escaparDatoReserva(
                reserva.mascotaNombre ||
                "Mascota sin nombre"
            );

            const tipo = escaparDatoReserva(
                reserva.mascotaTipo ||
                reserva.mascota ||
                "No especificado"
            );

            const fecha = escaparDatoReserva(
                formatearFechaReserva(reserva.fecha)
            );

            const hora = escaparDatoReserva(
                reserva.hora || "No disponible"
            );

            const estado = obtenerEstadoReserva(
                reserva.estado
            );

            const codigo = escaparDatoReserva(
                reserva.id || "Sin identificador"
            );

            const fechaCita =
                obtenerFechaHoraReserva(reserva);

            const esPasada =
                fechaCita && fechaCita < ahora;

            const descripcion = esPasada &&
                !esReservaFinalizada(reserva)
                ? "La fecha de esta reserva ya pasó. Su estado administrativo sigue pendiente de actualización."
                : "Puedes consultar aquí los detalles de esta reserva veterinaria.";

            return `
                <article class="item-historial-reserva">

                    <div class="informacion-historial-reserva">

                        <div class="icono-mascota-historial">
                            🩺
                        </div>

                        <div class="datos-mascota-historial">

                            <h3>${mascota}</h3>

                            <p class="servicio-historial-reserva">
                                ${servicio}
                            </p>

                            <span
                                class="estado-reserva estado-reserva-${estado.clase}"
                            >
                                ${escaparDatoReserva(estado.texto)}
                            </span>

                        </div>

                    </div>

                    <div class="detalle-historial-reserva">

                        <p>
                            <strong>Mascota:</strong>
                            ${tipo}
                        </p>

                        <p>
                            <strong>Fecha:</strong>
                            ${fecha}
                        </p>

                        <p>
                            <strong>Hora:</strong>
                            ${hora} hrs
                        </p>

                        <small>
                            Código: ${codigo}
                        </small>

                        <p class="descripcion-estado-reserva">
                            ${descripcion}${reserva.observacionAdmin ? `<br><strong>Administración:</strong> ${escaparDatoReserva(reserva.observacionAdmin)}` : ""}
                        </p>

                    </div>

                </article>
            `;
        }

        let contenido = "";

        if (futuras.length > 0) {

            contenido += `
                <h3 class="subtitulo-historial-reservas">
                    Próximas reservas
                </h3>

                ${futuras.map(crearTarjetaReserva).join("")}
            `;
        }

        if (anteriores.length > 0) {

            contenido += `
                <h3 class="subtitulo-historial-reservas">
                    Historial anterior y finalizado
                </h3>

                ${anteriores.map(crearTarjetaReserva).join("")}
            `;
        }

        listaHistorialReservas.innerHTML = contenido;
    }

    // =====================================================
    // ABRIR POPUP
    // =====================================================

    function abrirHistorialReservas() {

        if (!modalHistorialReservas) return;

        actualizarResumenReservas();
        renderizarHistorialReservas();

        elementoAnteriorReservas =
            document.activeElement;

        modalHistorialReservas.hidden = false;

        modalHistorialReservas.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add("modal-abierto");

        modalHistorialReservas
            .querySelector(".contenido-historial-reservas")
            ?.focus();
    }

    // =====================================================
    // CERRAR POPUP
    // =====================================================

    function cerrarPopupReservas() {

        if (!modalHistorialReservas ||
            modalHistorialReservas.hidden) {
            return;
        }

        modalHistorialReservas.hidden = true;

        modalHistorialReservas.setAttribute(
            "aria-hidden",
            "true"
        );

        const otroModalAbierto = Array.from(
            document.querySelectorAll(".modal-perfil")
        ).some(modal => !modal.hidden);

        if (!otroModalAbierto) {
            document.body.classList.remove("modal-abierto");
        }

        if (elementoAnteriorReservas?.isConnected) {
            elementoAnteriorReservas.focus();
        }
    }

    // =====================================================
    // EVENTOS
    // =====================================================

    if (modalHistorialReservas) {
        modalHistorialReservas.hidden = true;
    }

    tarjetaReservas?.addEventListener(
        "click",
        evento => {

            if (evento.target.closest("a, button")) {
                return;
            }

            abrirHistorialReservas();
        }
    );

    tarjetaReservas?.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key === "Enter" ||
                evento.key === " "
            ) {

                if (evento.target !== tarjetaReservas) {
                    return;
                }

                evento.preventDefault();
                abrirHistorialReservas();
            }
        }
    );

    botonCerrarHistorialReservas?.addEventListener(
        "click",
        cerrarPopupReservas
    );

    modalHistorialReservas
        ?.querySelectorAll(
            "[data-cerrar-historial-reservas]"
        )
        .forEach(elemento => {

            elemento.addEventListener(
                "click",
                cerrarPopupReservas
            );
        });

    document.addEventListener("keydown", evento => {

        if (
            evento.key === "Escape" &&
            modalHistorialReservas &&
            !modalHistorialReservas.hidden
        ) {
            cerrarPopupReservas();
        }
    });

    // =====================================================
    // SINCRONIZACIÓN DE RESERVAS
    // =====================================================

    function sincronizarHistorialReservas() {

        actualizarResumenReservas();

        if (
            modalHistorialReservas &&
            !modalHistorialReservas.hidden
        ) {
            renderizarHistorialReservas();
        }
    }

    window.addEventListener(
        "peh:actualizado",
        sincronizarHistorialReservas
    );

    window.addEventListener(
        "storage",
        sincronizarHistorialReservas
    );

    // CARGA INICIAL
    actualizarResumenReservas();




    // =====================================================
    // MODALES
    // =====================================================

    function abrirModal(modal) {

        if (!modal) {
            return;
        }


        modal.hidden = false;


        document.body.classList.add(
            "modal-abierto"
        );

    }


    function cerrarModal(modal) {

        if (!modal) {
            return;
        }


        modal.hidden = true;


        const hayOtroModalAbierto =
            Array.from(
                document.querySelectorAll(
                    ".modal-perfil"
                )
            ).some(
                (elemento) =>
                    !elemento.hidden
            );


        if (!hayOtroModalAbierto) {

            document.body.classList.remove(
                "modal-abierto"
            );

        }

    }


    // =====================================================
    // CERRAR MODAL EDITAR PERFIL
    // =====================================================

    document
        .querySelectorAll(
            "[data-cerrar-modal]"
        )
        .forEach((elemento) => {

            elemento.addEventListener(
                "click",
                () => {

                    cerrarModal(
                        modalEditarPerfil
                    );

                }
            );

        });


    // =====================================================
    // CERRAR MODAL CONFIGURACIÓN
    // =====================================================

    document
        .querySelectorAll(
            "[data-cerrar-configuracion]"
        )
        .forEach((elemento) => {

            elemento.addEventListener(
                "click",
                () => {

                    cerrarModal(
                        modalConfiguracion
                    );

                }
            );

        });


    // =====================================================
    // CERRAR CON ESC
    // =====================================================

    document.addEventListener(
        "keydown",
        (evento) => {

            if (evento.key !== "Escape") {
                return;
            }


            if (
                modalEditarPerfil &&
                !modalEditarPerfil.hidden
            ) {

                cerrarModal(
                    modalEditarPerfil
                );

                return;

            }


            if (
                modalConfiguracion &&
                !modalConfiguracion.hidden
            ) {

                cerrarModal(
                    modalConfiguracion
                );

                return;

            }


            if (
                modalCerrarSesion &&
                !modalCerrarSesion.hidden
            ) {

                cerrarModal(
                    modalCerrarSesion
                );

            }

        }
    );


    // =====================================================
    // CERRAR SESIÓN
    // =====================================================

    if (cerrarSesionLateral) {

        cerrarSesionLateral.addEventListener(
            "click",
            () => {

                abrirModal(
                    modalCerrarSesion
                );

            }
        );

    }


    // =====================================================
    // CANCELAR CIERRE DE SESIÓN
    // =====================================================

    document
        .querySelectorAll(
            "[data-cancelar-sesion]"
        )
        .forEach((elemento) => {

            elemento.addEventListener(
                "click",
                () => {

                    cerrarModal(
                        modalCerrarSesion
                    );

                }
            );

        });


    // =====================================================
    // CONFIRMAR CIERRE DE SESIÓN
    // =====================================================

    if (confirmarCerrarSesion) {

        confirmarCerrarSesion.addEventListener(
            "click",
            () => {

                /*
                 * IMPORTANTE:
                 *
                 * No eliminamos perfil, publicaciones
                 * ni preferencias.
                 *
                 * Cerrar sesión no significa borrar
                 * información del usuario.
                 */


                if (!window.PEH?.sesion.cerrar()) {

                    window.alert("No fue posible cerrar la sesión. Inténtalo nuevamente.");

                    return;

                }


                window.location.href =
                    "../index.html";

            }
        );

    }


    // =====================================================
    // MENSAJE EDITAR PERFIL
    // =====================================================

    function mostrarMensajePerfil(
        texto,
        tipo
    ) {

        if (!mensajeEditarPerfil) {
            return;
        }


        mensajeEditarPerfil.textContent =
            texto;


        mensajeEditarPerfil.className =
            `mensaje-modal ${tipo}`;


        mensajeEditarPerfil.hidden =
            false;

    }


    function ocultarMensajePerfil() {

        if (!mensajeEditarPerfil) {
            return;
        }


        mensajeEditarPerfil.hidden =
            true;

        mensajeEditarPerfil.textContent =
            "";

    }


    // =====================================================
    // MENSAJE GENÉRICO
    // =====================================================

    function mostrarMensajeElemento(
        elemento,
        texto,
        tipo
    ) {

        if (!elemento) {
            return;
        }


        elemento.textContent =
            texto;


        elemento.className =
            `mensaje-configuracion ${tipo}`;


        elemento.hidden =
            false;

    }


    // =====================================================
    // VALIDAR CORREO
    // =====================================================

    function validarCorreo(correo) {

        const expresion =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        return expresion.test(
            correo
        );

    }


    // =====================================================
    // GUARDAR DATOS GENÉRICOS
    // =====================================================

    function guardarDatosLocales(clave, datos) {

        if (clave === CLAVE_NOTIFICACIONES) {

            return window.PEH?.preferencias.guardarNotificaciones(datos) || false;

        }

        if (clave === CLAVE_ADOPCION) {

            return window.PEH?.preferencias.guardarAdopcion(datos) || false;

        }

        return false;

    }


    // =====================================================
    // OBTENER PREFERENCIAS DE LA CUENTA ACTUAL
    // =====================================================

    function obtenerDatosLocales(clave, predeterminado) {

        const datos = clave === CLAVE_NOTIFICACIONES
            ? window.PEH?.preferencias.notificaciones()
            : window.PEH?.preferencias.adopcion();

        return {
            ...predeterminado,
            ...datos
        };

    }


    // =====================================================
    // MENÚ RESPONSIVE
    // =====================================================

    if (
        botonMenu &&
        navegacionPrincipal
    ) {

        botonMenu.addEventListener(
            "click",
            () => {

                const abierto =
                    navegacionPrincipal
                        .classList
                        .toggle("abierta");


                botonMenu.classList.toggle(
                    "activo",
                    abierto
                );


                botonMenu.setAttribute(
                    "aria-expanded",
                    String(abierto)
                );

            }
        );


        navegacionPrincipal
            .querySelectorAll("a")
            .forEach((enlace) => {

                enlace.addEventListener(
                    "click",
                    cerrarMenuMovil
                );

            });

    }


    function cerrarMenuMovil() {

        if (
            !botonMenu ||
            !navegacionPrincipal
        ) {
            return;
        }


        navegacionPrincipal.classList.remove(
            "abierta"
        );


        botonMenu.classList.remove(
            "activo"
        );


        botonMenu.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    // =====================================================
    // CERRAR MENÚ AL VOLVER A ESCRITORIO
    // =====================================================

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 900
            ) {

                cerrarMenuMovil();

            }

        }
    );


    // =====================================================
    // AVISOS BASADOS EN LOS PROCESOS DE LA CUENTA
    // =====================================================

    function actualizarAvisosPerfil() {

        const lista = document.getElementById("listaNotificacionesPerfil");

        if (!lista) return;

        const preferencias = obtenerPreferenciasNotificaciones();

        const avisos = [];

        if (preferencias.adopcion) {

            const solicitudes = obtenerSolicitudesAdopcion();

            const pendientes = solicitudes.filter(solicitud => {

                const estado = obtenerEstadoAdopcion(solicitud.estado).clase;

                return estado === "pendiente" || estado === "revision";

            }).length;

            if (pendientes) {

                avisos.push({
                    titulo: "Solicitud de adopción",
                    texto: pendientes === 1
                        ? "Tienes una solicitud pendiente o en revisión. Consulta su estado en Mis adopciones."
                        : `Tienes ${pendientes} solicitudes pendientes o en revisión. Consulta sus estados en Mis adopciones.`,
                    icono: "🐾"
                });

            }

        }

        const reserva = preferencias.veterinaria
            ? obtenerProximaReserva()
            : null;

        if (reserva) {

            avisos.push({
                titulo: "Próxima reserva",
                texto: `${reserva.mascotaNombre || "Tu mascota"}: ${formatearFechaReserva(reserva.fecha)}, ${reserva.hora || "sin horario"}. Consulta los detalles en Mis reservas.`,
                icono: "♡"
            });

        }

        lista.replaceChildren();

        if (!avisos.length) {

            const mensaje = document.createElement("p");

            mensaje.className = "sin-avisos-perfil";

            mensaje.textContent = "No tienes avisos pendientes con tus preferencias actuales. Puedes revisar tus solicitudes y reservas en sus historiales.";

            lista.appendChild(mensaje);

            return;

        }

        avisos.forEach(aviso => {

            const tarjeta = document.createElement("article");
            const icono = document.createElement("span");
            const contenido = document.createElement("div");
            const titulo = document.createElement("strong");
            const texto = document.createElement("p");

            tarjeta.className = "notificacion-perfil";
            icono.className = "icono-notificacion";
            icono.setAttribute("aria-hidden", "true");
            icono.textContent = aviso.icono;
            titulo.textContent = aviso.titulo;
            texto.textContent = aviso.texto;

            contenido.append(titulo, texto);
            tarjeta.append(icono, contenido);
            lista.appendChild(tarjeta);

        });

    }

    function sincronizarDatosPerfil() {

        cargarPerfil();
        actualizarAvisosPerfil();

    }

    window.addEventListener("peh:actualizado", sincronizarDatosPerfil);
    window.addEventListener("storage", sincronizarDatosPerfil);

    actualizarAvisosPerfil();

});