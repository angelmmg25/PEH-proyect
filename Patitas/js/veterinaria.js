
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // =====================================================
    // 1. ELEMENTOS DEL DOM
    // =====================================================

    const formulario = document.getElementById("formularioReserva");
    const servicio = document.getElementById("servicioReserva");
    const mascota = document.getElementById("mascotaReserva");
    const nombreMascota = document.getElementById("nombreMascotaReserva");
    const fecha = document.getElementById("fechaReserva");
    const hora = document.getElementById("horaReserva");
    const observaciones = document.getElementById("observacionesReserva");
    const mensajeReserva = document.getElementById("mensajeReserva");

    const tarjetasServicio = document.querySelectorAll(".tarjeta-servicio");
    const tarjetasConsejo = document.querySelectorAll(".tarjeta-consejo[data-consejo]");

    const botonMenu = document.getElementById("botonMenu");
    const navegacion = document.querySelector(".navegacion-principal");

    const modal = document.getElementById("modalConsejo");
    const tituloModal = document.getElementById("tituloModalConsejo");
    const iconoModal = document.getElementById("iconoModalConsejo");
    const contenidoModal = document.getElementById("contenidoModalConsejo");
    const botonCerrarModal = document.getElementById("cerrarModalConsejo");

    let elementoAnterior = null;

    // =====================================================
    // 2. FECHA ACTUAL
    // =====================================================

    function obtenerFechaActual() {
        const hoy = new Date();

        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    }

    function actualizarFechaMinima() {
        if (fecha) {
            fecha.min = obtenerFechaActual();
        }
    }

    actualizarFechaMinima();

    function esFechaValida(valor) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
            return false;
        }

        const [anio, mes, dia] = valor.split("-").map(Number);
        const comprobacion = new Date(anio, mes - 1, dia);

        return (
            comprobacion.getFullYear() === anio &&
            comprobacion.getMonth() === mes - 1 &&
            comprobacion.getDate() === dia &&
            valor >= obtenerFechaActual()
        );
    }

    function esHorarioFuturo(fechaValor, horaValor) {
        const cita = new Date(`${fechaValor}T${horaValor}:00`);

        return (
            !Number.isNaN(cita.getTime()) &&
            cita.getTime() > Date.now()
        );
    }

    function actualizarHoras() {
        if (!fecha || !hora) return;

        Array.from(hora.options).forEach(opcion => {
            if (!opcion.value) return;

            opcion.disabled =
                fecha.value === obtenerFechaActual() &&
                !esHorarioFuturo(fecha.value, opcion.value);
        });

        if (hora.selectedOptions[0]?.disabled) {
            hora.value = "";
        }
    }

    // =====================================================
    // 3. MOSTRAR Y LIMPIAR ERRORES
    // =====================================================

    function mostrarError(campo, texto) {
        if (!campo) return;

        const grupo = campo.closest(".grupo-campo");
        if (!grupo) return;

        grupo.classList.add("campo-error");
        campo.setAttribute("aria-invalid", "true");

        const mensaje = grupo.querySelector(".mensaje-error");

        if (mensaje) {
            mensaje.textContent = texto;
        }
    }

    function limpiarError(campo) {
        if (!campo) return;

        const grupo = campo.closest(".grupo-campo");
        if (!grupo) return;

        grupo.classList.remove("campo-error");
        campo.removeAttribute("aria-invalid");

        const mensaje = grupo.querySelector(".mensaje-error");

        if (mensaje) {
            mensaje.textContent = "";
        }
    }

    function mostrarMensajeGeneral(texto, tipo = "error") {
        if (!mensajeReserva) return;

        mensajeReserva.classList.remove("error", "exito");
        mensajeReserva.classList.add(tipo);
        mensajeReserva.textContent = texto;
    }

    function limpiarMensajeGeneral() {
        if (!mensajeReserva) return;

        mensajeReserva.classList.remove("error", "exito");
        mensajeReserva.replaceChildren();
    }

    // =====================================================
    // 4. TARJETAS DE SERVICIOS
    // =====================================================

    function sincronizarTarjetas() {
        if (!servicio) return;

        tarjetasServicio.forEach(tarjeta => {
            const seleccionada =
                tarjeta.dataset.servicio === servicio.value;

            tarjeta.classList.toggle("seleccionado", seleccionada);
            tarjeta.setAttribute("aria-pressed", String(seleccionada));
        });
    }

    tarjetasServicio.forEach(tarjeta => {
        tarjeta.addEventListener("click", () => {
            if (!servicio) return;

            servicio.value = tarjeta.dataset.servicio || "";

            sincronizarTarjetas();
            validarServicio();

            document.getElementById("reservar")?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });
    });

    servicio?.addEventListener("change", () => {
        sincronizarTarjetas();
        validarServicio();
    });

    // =====================================================
    // 5. VALIDACIONES
    // =====================================================

    function validarServicio() {
        if (!servicio?.value) {
            mostrarError(servicio, "Selecciona un servicio veterinario.");
            return false;
        }

        limpiarError(servicio);
        return true;
    }

    function validarMascota() {
        if (!["perro", "gato"].includes(mascota?.value)) {
            mostrarError(mascota, "Selecciona perro o gato para agendar.");
            return false;
        }

        limpiarError(mascota);
        return true;
    }

    function validarNombreMascota() {
        const nombre = nombreMascota?.value.trim() || "";

        if (nombre.length < 2) {
            mostrarError(
                nombreMascota,
                "Escribe el nombre de tu mascota (mínimo 2 caracteres)."
            );
            return false;
        }

        if (nombre.length > 50) {
            mostrarError(
                nombreMascota,
                "El nombre no puede superar 50 caracteres."
            );
            return false;
        }

        limpiarError(nombreMascota);
        return true;
    }

    function validarFecha() {
        if (!fecha?.value) {
            mostrarError(fecha, "Selecciona una fecha.");
            return false;
        }

        if (!esFechaValida(fecha.value)) {
            mostrarError(
                fecha,
                "Selecciona una fecha válida desde hoy en adelante."
            );
            return false;
        }

        limpiarError(fecha);
        return true;
    }

    function validarHora() {
        if (!hora?.value) {
            mostrarError(hora, "Selecciona una hora.");
            return false;
        }

        if (!fecha?.value || !esFechaValida(fecha.value)) {
            mostrarError(hora, "Primero selecciona una fecha válida.");
            return false;
        }

        if (!esHorarioFuturo(fecha.value, hora.value)) {
            mostrarError(hora, "La hora seleccionada ya pasó.");
            return false;
        }

        limpiarError(hora);
        return true;
    }

    function validarObservaciones() {
        if (!observaciones) return true;

        const texto = observaciones.value.trim();

        if (texto.length === 0) {
            limpiarError(observaciones);
            return true;
        }

        if (texto.length < 10) {
            mostrarError(
                observaciones,
                "Escribe al menos 10 caracteres o deja el campo vacío."
            );
            return false;
        }

        if (texto.length > 250) {
            mostrarError(
                observaciones,
                "Las observaciones no pueden superar 250 caracteres."
            );
            return false;
        }

        limpiarError(observaciones);
        return true;
    }

    function validarFormulario() {
        const resultados = [
            validarServicio(),
            validarMascota(),
            validarNombreMascota(),
            validarFecha(),
            validarHora(),
            validarObservaciones()
        ];

        return resultados.every(Boolean);
    }

    mascota?.addEventListener("change", validarMascota);
    nombreMascota?.addEventListener("input", validarNombreMascota);

    fecha?.addEventListener("change", () => {
        actualizarFechaMinima();
        actualizarHoras();
        validarFecha();

        if (hora?.value) {
            validarHora();
        }
    });

    hora?.addEventListener("change", validarHora);
    observaciones?.addEventListener("input", validarObservaciones);

    // =====================================================
    // 6. CREAR RESERVA
    // =====================================================

    function obtenerTextoSeleccionado(select) {
        return select?.selectedOptions[0]?.textContent.trim() || "";
    }

    function crearReserva() {
        return {
            servicio: servicio.value,
            servicioNombre: obtenerTextoSeleccionado(servicio),

            mascota: mascota.value,
            mascotaTipo: mascota.value,
            mascotaNombre: nombreMascota.value.trim(),

            fecha: fecha.value,
            hora: hora.value,

            observaciones: observaciones?.value.trim() || "",

            estado: "Pendiente"
        };
    }

    // =====================================================
    // 7. COMPROBAR DUPLICADOS
    // =====================================================

    function existeReservaDuplicada(reserva, usuarioId) {
        const existentes = window.PEH.reservas.listar(usuarioId);

        return existentes.some(item => {
            const estado = String(item.estado || "").toLowerCase();

            const cancelada = [
                "cancelada",
                "rechazada",
                "anulada"
            ].includes(estado);

            return (
                !cancelada &&
                item.usuarioId === usuarioId &&
                item.fecha === reserva.fecha &&
                item.hora === reserva.hora &&
                String(item.mascotaNombre || "")
                    .trim().toLowerCase() ===
                reserva.mascotaNombre.toLowerCase()
            );
        });
    }

    // =====================================================
    // 8. CONFIRMACIÓN
    // =====================================================

    function formatearFecha(valor) {
        const [anio, mes, dia] = valor.split("-").map(Number);

        return new Date(anio, mes - 1, dia).toLocaleDateString(
            "es-CL",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }

    function mostrarConfirmacion(reserva) {
        if (!mensajeReserva) return;

        limpiarMensajeGeneral();
        mensajeReserva.classList.add("exito");

        const contenedor = document.createElement("div");
        contenedor.className = "confirmacion-reserva";

        const icono = document.createElement("span");
        icono.className = "confirmacion-icono";
        icono.setAttribute("aria-hidden", "true");
        icono.textContent = "✓";

        const contenido = document.createElement("div");

        const titulo = document.createElement("strong");
        titulo.textContent = "¡Tu reserva fue registrada!";

        const descripcion = document.createElement("p");
        descripcion.textContent =
            `${reserva.mascotaNombre} tiene una solicitud de ` +
            `${reserva.servicioNombre} para el ` +
            `${formatearFecha(reserva.fecha)} ` +
            `a las ${reserva.hora}.`;

        const estado = document.createElement("p");
        estado.textContent =
            "Estado: Pendiente. Podrás consultar la reserva en tu perfil.";

        contenido.append(titulo, descripcion, estado);
        contenedor.append(icono, contenido);
        mensajeReserva.appendChild(contenedor);
    }

    // =====================================================
    // 9. REINICIAR FORMULARIO
    // =====================================================

    function reiniciarFormulario() {
        formulario?.reset();

        [
            servicio,
            mascota,
            nombreMascota,
            fecha,
            hora,
            observaciones
        ].forEach(limpiarError);

        sincronizarTarjetas();
        actualizarFechaMinima();
        actualizarHoras();
    }

    // =====================================================
    // 10. GUARDAR RESERVA
    // =====================================================

    formulario?.addEventListener("submit", evento => {
        evento.preventDefault();

        limpiarMensajeGeneral();
        actualizarFechaMinima();

        if (!validarFormulario()) {
            mostrarMensajeGeneral(
                "Revisa los campos marcados antes de continuar."
            );

            formulario.querySelector(
                '[aria-invalid="true"]'
            )?.focus({ preventScroll: true });

            return;
        }

        // No detenemos el resto de la página si app.js falla.
        const peh = window.PEH;

        if (
            !peh?.sesion?.obtener ||
            !peh?.reservas?.listar ||
            !peh?.reservas?.guardar
        ) {
            mostrarMensajeGeneral(
                "El sistema de reservas no está disponible. " +
                "Debemos revisar app.js."
            );
            return;
        }

        let usuario;

        try {
            usuario = peh.sesion.obtener();
        } catch (error) {
            console.error("Error al consultar la sesión:", error);

            mostrarMensajeGeneral(
                "No pudimos comprobar tu sesión."
            );
            return;
        }

        if (!usuario?.id) {
            mostrarMensajeGeneral(
                "Debes iniciar sesión o entrar como invitado " +
                "antes de registrar una reserva."
            );
            return;
        }

        const reserva = crearReserva();

        try {
            if (existeReservaDuplicada(reserva, usuario.id)) {
                mostrarMensajeGeneral(
                    "Ya tienes una reserva para esta mascota " +
                    "en la misma fecha y hora."
                );
                return;
            }

            const resultado = peh.reservas.guardar({
                ...reserva,
                usuarioId: usuario.id
            });

            if (!resultado || resultado === false) {
                mostrarMensajeGeneral(
                    "No pudimos guardar la reserva. Inténtalo nuevamente."
                );
                return;
            }

            mostrarConfirmacion({
                ...reserva,
                ...(typeof resultado === "object" ? resultado : {})
            });

            reiniciarFormulario();

            mensajeReserva?.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        } catch (error) {
            console.error("Error al registrar la reserva:", error);

            mostrarMensajeGeneral(
                "Ocurrió un problema al guardar la reserva. " +
                "Revisa la consola para más detalles."
            );
        }
    });

    // =====================================================
    // 11. CONSEJOS VETERINARIOS
    // =====================================================

    const consejos = {
        alimentacion: {
            titulo: "Alimentación adecuada",
            icono: "🥣",
            contenido: [
                "Una alimentación equilibrada debe adaptarse a la especie, edad, tamaño y estado de salud de tu mascota.",
                "Proporciona siempre agua fresca y mantén horarios regulares para sus comidas.",
                "Evita ofrecer alimentos que puedan resultar tóxicos para su especie.",
                "Consulta con un veterinario antes de realizar cambios importantes en su alimentación."
            ]
        },

        ejercicio: {
            titulo: "Ejercicio regular",
            icono: "🐾",
            contenido: [
                "La actividad física ayuda a mantener un peso saludable y favorece el bienestar emocional.",
                "Los perros necesitan paseos y actividades adaptadas a su edad, energía y condición física.",
                "Los gatos también necesitan jugar, explorar y disponer de espacios de estimulación.",
                "Evita actividades demasiado intensas durante temperaturas extremas."
            ]
        },

        controles: {
            titulo: "Visitas periódicas",
            icono: "🩺",
            contenido: [
                "Los controles veterinarios permiten detectar problemas de salud de manera temprana.",
                "Mantén al día las vacunas y los tratamientos antiparasitarios indicados por el profesional.",
                "Presta atención a cambios en el apetito, comportamiento o nivel de actividad.",
                "Ante dificultades respiratorias, convulsiones u otros signos graves, busca atención veterinaria urgente."
            ]
        }
    };

    function abrirConsejo(tipo) {
        const consejo = consejos[tipo];

        if (
            !consejo ||
            !modal ||
            !tituloModal ||
            !contenidoModal
        ) {
            return;
        }

        elementoAnterior = document.activeElement;

        tituloModal.textContent = consejo.titulo;

        if (iconoModal) {
            iconoModal.textContent = consejo.icono;
        }

        contenidoModal.replaceChildren();

        consejo.contenido.forEach(texto => {
            const parrafo = document.createElement("p");
            parrafo.textContent = texto;
            contenidoModal.appendChild(parrafo);
        });

        modal.hidden = false;
        modal.style.display = "flex";

        document.body.style.overflow = "hidden";

        botonCerrarModal?.focus();
    }

    function cerrarConsejo() {
        if (!modal || modal.hidden) return;

        modal.hidden = true;
        modal.style.display = "none";

        document.body.style.overflow = "";

        elementoAnterior?.focus?.();
    }

    tarjetasConsejo.forEach(tarjeta => {
        tarjeta.addEventListener("click", () => {
            abrirConsejo(tarjeta.dataset.consejo);
        });

        tarjeta.addEventListener("keydown", evento => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                abrirConsejo(tarjeta.dataset.consejo);
            }
        });
    });

    botonCerrarModal?.addEventListener("click", cerrarConsejo);

    modal?.querySelectorAll("[data-cerrar-modal]").forEach(fondo => {
        fondo.addEventListener("click", cerrarConsejo);
    });

    document.addEventListener("keydown", evento => {
        if (!modal || modal.hidden) return;

        if (evento.key === "Escape") {
            cerrarConsejo();
        }

        if (evento.key === "Tab") {
            const boton = botonCerrarModal;

            if (boton) {
                evento.preventDefault();
                boton.focus();
            }
        }
    });

    // =====================================================
    // 12. MENÚ MÓVIL
    // =====================================================

    function cerrarMenu() {
        navegacion?.classList.remove("abierta");
        botonMenu?.classList.remove("activo");

        botonMenu?.setAttribute("aria-expanded", "false");
    }

    if (botonMenu && navegacion) {
        botonMenu.addEventListener("click", () => {
            const abierto = navegacion.classList.toggle("abierta");

            botonMenu.classList.toggle("activo", abierto);

            botonMenu.setAttribute(
                "aria-expanded",
                String(abierto)
            );
        });

        navegacion.querySelectorAll("a").forEach(enlace => {
            enlace.addEventListener("click", cerrarMenu);
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 900) {
                cerrarMenu();
            }
        });
    }

    console.info("[PEH] veterinaria.js cargado correctamente.");
});
