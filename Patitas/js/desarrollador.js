window.PEH_COMENTARIOS_DEMO_ADMIN = [{"id": "peh-demo-0-comentario-0", "publicacionId": "peh-demo-0", "autor": "Valentina", "texto": "¡Qué hermosa Luna! Me alegra mucho que haya encontrado familia. 🧡", "demo": true, "usuarioId": null, "respuestaA": null}, {"id": "peh-demo-1-comentario-0", "publicacionId": "peh-demo-1", "autor": "Daniela", "texto": "Dale un espacio tranquilo durante los primeros días y deja que explore a su ritmo.", "demo": true, "usuarioId": null, "respuestaA": null}, {"id": "peh-demo-2-comentario-0", "publicacionId": "peh-demo-2", "autor": "Francisca", "texto": "Compartido. Ojalá Max encuentre una familia pronto. 🐾", "demo": true, "usuarioId": null, "respuestaA": null}, {"id": "peh-demo-3-comentario-0", "publicacionId": "peh-demo-3", "autor": "Paula", "texto": "Sí, algunos necesitan bastante tiempo para sentirse seguros. Mucha paciencia. 🧡", "demo": true, "usuarioId": null, "respuestaA": null}];

/* Panel de administración: DOM y formularios. La persistencia está en app.js. */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";
    const PEH = window.PEH;
    const $ = id => document.getElementById(id);
    const tipos = ["animales", "usuarios", "comentarios", "adopciones", "reservas", "consultas"];
    const singular = { animales: "Animal", usuarios: "Usuario", comentarios: "Comentario", adopciones: "Adopcion", reservas: "Reserva", consultas: "Consulta" };
    let datos = {}, nombres = {}, seccion = "resumen", accionConfirmar = null, ocupada = false;
    const ediciones = new Map();
    const normalizar = valor => String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const fecha = valor => valor ? PEH.formatearFecha(valor) : "Sin fecha registrada";
    const version = registro => registro.revision || registro.fechaActualizacion || registro.fechaCreacion || registro.fechaRegistro || "";
    const nombreUsuario = registro => nombres[registro.usuarioId] || registro.nombreAdoptante || registro.usuarioNombre || (registro.invitado ? "Invitado" : "Cuenta eliminada");
    const estadosAnimal = { disponible: "Disponible", "en-proceso": "En proceso", adoptado: "Adoptado", "no-visible": "No visible" };

    function aviso(mensaje, error = false) {
        const destino = $(error ? "errorAdministracion" : "mensajeAdministracion");
        $(error ? "mensajeAdministracion" : "errorAdministracion").hidden = true;
        destino.textContent = mensaje; destino.hidden = false;
    }
    function errorFormulario(nombre, mensaje = "") {
        const elemento = $("error" + nombre + "Admin");
        if (elemento) { elemento.textContent = mensaje; elemento.hidden = !mensaje; }
    }
    function acceso() {
        const autorizada = PEH.admin.esAdmin();
        $("panelAdministracion").hidden = !autorizada;
        $("accesoRestringido").hidden = autorizada;
        if (!autorizada) {
            document.querySelectorAll("dialog[open]").forEach(d => d.close());
            $("mensajeAccesoRestringido").textContent = "Inicia sesión desde el acceso de PEH con la cuenta administradora predeterminada. Las cuentas normales y los invitados no pueden gestionar estos registros.";
        }
        return autorizada;
    }
    function irSeccion(nombre, enfocar = true) {
        seccion = nombre;
        document.querySelectorAll("[data-panel]").forEach(panel => { panel.hidden = panel.dataset.panel !== nombre; });
        document.querySelectorAll("[data-seccion]").forEach(boton => {
            const activa = boton.dataset.seccion === nombre;
            boton.classList.toggle("activo", activa);
            if (activa) boton.setAttribute("aria-current", "page"); else boton.removeAttribute("aria-current");
        });
        if (enfocar) $("contenidoAdministracion").focus({ preventScroll: true });
    }
    function celda(fila, campo, valor) {
        const elemento = fila.querySelector(`[data-campo="${campo}"]`);
        if (elemento) elemento.textContent = valor ?? "—";
    }
    function tabla(tipo) {
        const nombre = singular[tipo];
        const busqueda = normalizar(document.querySelector(`[data-busqueda="${tipo}"]`)?.value);
        const estado = document.querySelector(`[data-filtro="${tipo}-estado"]`)?.value || "todos";
        const especie = $("especieAnimalesAdmin")?.value || "todos";
        const registros = datos[tipo].filter(r => {
            const texto = Object.values(r).filter(v => ["string", "number"].includes(typeof v)).join(" ") + " " + nombreUsuario(r);
            return (!busqueda || normalizar(texto).includes(busqueda)) &&
                (estado === "todos" || (tipo === "animales" ? r.estadoPerfil || "disponible" : r.estado || "Pendiente") === estado) &&
                (tipo !== "animales" || especie === "todos" || r.especie === especie);
        });
        const cuerpo = $("tabla" + tipo[0].toUpperCase() + tipo.slice(1) + "Admin");
        cuerpo.replaceChildren();
        for (const r of registros) {
            const fila = $("plantilla" + nombre + "Admin").content.firstElementChild.cloneNode(true);
            fila.dataset.id = r.id;
            if (tipo === "animales") {
                celda(fila, "nombre", r.nombre); celda(fila, "identificador", r.slug); celda(fila, "especieEdad", `${r.especie === "perro" ? "Perro" : "Gato"} · ${r.edad} años`); celda(fila, "comuna", r.comuna); celda(fila, "estado", estadosAnimal[r.estadoPerfil || "disponible"]);
                const imagen = fila.querySelector("img"); imagen.src = r.imagen; imagen.alt = r.nombre;
            } else if (tipo === "usuarios") {
                celda(fila, "nombre", `${r.nombre} ${r.apellido || ""}`); celda(fila, "usuario", r.usuario); celda(fila, "correo", r.correo); celda(fila, "fecha", fecha(r.fechaRegistro));
            } else if (tipo === "comentarios") {
                celda(fila, "autor", r.autor || "Usuario eliminado"); celda(fila, "texto", r.texto); celda(fila, "tipo", r.respuestaA ? "Respuesta" : r.demo ? "Comentario de ejemplo" : "Comentario"); celda(fila, "publicacion", r.publicacionId); celda(fila, "fecha", fecha(r.fechaCreacion));
            } else if (tipo === "adopciones") {
                celda(fila, "animal", r.animalNombre); celda(fila, "solicitante", nombreUsuario(r)); celda(fila, "correo", r.correoAdoptante); celda(fila, "fecha", fecha(r.fechaCreacion)); celda(fila, "estado", r.estado || "Pendiente");
            } else if (tipo === "reservas") {
                celda(fila, "mascota", r.mascotaNombre); celda(fila, "responsable", nombreUsuario(r)); celda(fila, "servicio", r.servicioNombre || r.servicio); celda(fila, "fechaHora", `${fecha(r.fecha)} · ${r.hora}`); celda(fila, "estado", r.estado || "Pendiente");
            } else {
                celda(fila, "nombre", r.nombre); celda(fila, "correo", r.correo); celda(fila, "asunto", r.asunto); celda(fila, "motivo", r.motivo); celda(fila, "fecha", fecha(r.fechaCreacion)); celda(fila, "estado", r.estado || "Pendiente");
            }
            fila.querySelectorAll("[data-accion]").forEach(b => { b.dataset.id = r.id; b.setAttribute("aria-label", `${b.textContent.trim()}: ${r.nombre || r.animalNombre || r.mascotaNombre || r.asunto || r.autor || r.id}`); });
            cuerpo.append(fila);
        }
        if (!registros.length) {
            const fila = document.createElement("tr"), mensaje = document.createElement("td");
            mensaje.colSpan = tipo === "reservas" ? 6 : 5; mensaje.textContent = busqueda || estado !== "todos" || (tipo === "animales" && especie !== "todos") ? "No hay resultados con esos filtros." : "No hay registros en esta sección."; fila.append(mensaje); cuerpo.append(fila);
        }
        $("resultado" + tipo[0].toUpperCase() + tipo.slice(1) + "Admin").textContent = `${registros.length} de ${datos[tipo].length} registros`;
    }
    function refrescar() {
        try {
            if (!acceso()) return;
            nombres = PEH.admin.nombresUsuarios();
            for (const tipo of tipos) datos[tipo] = PEH.admin.listar(tipo).sort((a, b) => String(b.fechaCreacion || b.fechaRegistro || "").localeCompare(String(a.fechaCreacion || a.fechaRegistro || "")));
            $("nombreAdministrador").textContent = nombres[PEH.sesion.obtener().id] || "Administración PEH";
            const contadores = {
                animales: datos.animales.filter(a => ["disponible", "en-proceso"].includes(a.estadoPerfil || "disponible")).length,
                usuarios: datos.usuarios.length, comentarios: datos.comentarios.length,
                adopciones: datos.adopciones.filter(a => ["Pendiente", "En revisión"].includes(a.estado || "Pendiente")).length,
                reservas: datos.reservas.filter(r => (r.estado || "Pendiente") === "Pendiente").length,
                consultas: datos.consultas.filter(c => ["Pendiente", "En revisión"].includes(c.estado || "Pendiente")).length
            };
            document.querySelectorAll("[data-contador]").forEach(e => { e.textContent = contadores[e.dataset.contador]; });
            tipos.forEach(tabla); irSeccion(seccion, false);
        } catch (error) { aviso(error.message, true); }
    }
    function abrir(nombre, registro) {
        ediciones.set(nombre, registro ? JSON.parse(JSON.stringify(registro)) : null);
        errorFormulario(nombre);
        const dialogo = $("dialogo" + nombre);
        dialogo.dataset.apertura = String(Number(dialogo.dataset.apertura || 0) + 1);
        if (!dialogo.open) dialogo.showModal();
    }
    function detalle(id, pares) {
        const dl = $(id); dl.replaceChildren();
        for (const [etiqueta, valor] of pares) { const dt = document.createElement("dt"), dd = document.createElement("dd"); dt.textContent = etiqueta; dd.textContent = valor === true ? "Sí" : valor === false ? "No" : valor || "No indicado"; dl.append(dt, dd); }
    }
    function editarAnimal(r = null) {
        $("formularioAnimalAdmin").reset(); $("tituloDialogoAnimal").textContent = r ? `Editar a ${r.nombre}` : "Agregar un animal";
        const campos = { id: "idAnimalAdmin", imagen: "imagenActualAnimalAdmin", nombre: "nombreAnimalAdmin", especie: "especieAnimalAdmin", sexo: "sexoAnimalAdmin", edad: "edadAnimalAdmin", tamano: "tamanoAnimalAdmin", comuna: "comunaAnimalAdmin", diasEsperando: "esperaAnimalAdmin", estadoPerfil: "estadoAnimalAdmin", cuidados: "cuidadosAnimalAdmin" };
        for (const [campo, id] of Object.entries(campos)) $(id).value = r?.[campo] ?? (campo === "estadoPerfil" ? "disponible" : campo === "diasEsperando" ? 0 : "");
        $("personalidadAnimalAdmin").value = r?.personalidad?.join(", ") || ""; $("historiaAnimalAdmin").value = r?.historia?.join("\n\n") || "";
        for (const campo of ["hogar", "convivencia"]) document.querySelectorAll(`#formularioAnimalAdmin [name="${campo}"]`).forEach(c => { c.checked = (r?.[campo] || []).includes(c.value); });
        const vista = $("vistaPreviaAnimalAdmin"); vista.hidden = !r?.imagen; if (r?.imagen) vista.src = r.imagen; else vista.removeAttribute("src");
        abrir("Animal", r);
    }
    function editarUsuario(r) {
        for (const [campo, id] of Object.entries({ id: "idUsuarioAdmin", nombre: "nombreUsuarioAdmin", apellido: "apellidoUsuarioAdmin", usuario: "aliasUsuarioAdmin", correo: "correoUsuarioAdmin" })) $(id).value = r[campo] || "";
        abrir("Usuario", r);
    }
    function gestionarAdopcion(r) {
        $("idAdopcionAdmin").value = r.id; $("nuevoEstadoAdopcionAdmin").value = r.estado || "Pendiente"; $("observacionAdopcionAdmin").value = r.observacionAdmin || "";
        const etiquetas = { animalNombre: "Animal", nombreAdoptante: "Nombre", correoAdoptante: "Correo", telefonoAdoptante: "Teléfono", edadAdoptante: "Edad", comunaAdoptante: "Comuna", tipoVivienda: "Vivienda", situacionVivienda: "Situación de vivienda", personasHogar: "Personas en el hogar", acuerdoFamiliar: "Acuerdo familiar", otrosAnimales: "Otros animales", detalleAnimales: "Detalle de animales", experienciaAnimales: "Experiencia", motivoAdopcion: "Motivo de adopción", cuidadosAnimal: "Cuidados propuestos", aceptaCompromiso: "Acepta compromiso" };
        detalle("detalleAdopcionAdmin", [["Código", r.id], ["Cuenta", nombreUsuario(r)], ["Fecha", fecha(r.fechaCreacion)], ...Object.entries(etiquetas).map(([campo, label]) => [label, r[campo]])]); abrir("Adopcion", r);
    }
    function gestionarReserva(r) {
        $("idReservaAdmin").value = r.id; $("nuevoEstadoReservaAdmin").value = r.estado || "Pendiente"; $("fechaReservaAdmin").value = r.fecha || ""; $("horaReservaAdmin").value = r.hora || ""; $("observacionReservaAdmin").value = r.observacionAdmin || "";
        detalle("detalleReservaAdmin", [["Código", r.id], ["Responsable", nombreUsuario(r)], ["Mascota", r.mascotaNombre], ["Servicio", r.servicioNombre || r.servicio], ["Observaciones originales", r.observaciones]]); abrir("Reserva", r);
    }
    function gestionarConsulta(r) {
        $("idConsultaAdmin").value = r.id; $("nuevoEstadoConsultaAdmin").value = r.estado || "Pendiente"; $("respuestaConsultaAdmin").value = "";
        detalle("detalleConsultaAdmin", [["Código", r.id], ["Nombre", r.nombre], ["Correo", r.correo], ["Asunto", r.asunto], ["Motivo", r.motivo], ["Fecha", fecha(r.fechaCreacion)], ["Seguimiento", r.usuarioId && nombres[r.usuarioId] ? "Respuesta visible para su cuenta en Mi perfil" : r.usuarioId ? "La cuenta fue eliminada; se conserva este registro interno" : "Consulta de invitado: respuesta guardada como registro interno, sin envío de correo"]]);
        $("mensajeConsultaAdmin").textContent = r.mensaje; $("respuestasConsultaAdmin").replaceChildren();
        for (const respuesta of r.respuestas || []) { const li = document.createElement("li"), titulo = document.createElement("strong"), p = document.createElement("p"); titulo.textContent = `${respuesta.autor || "Administración"} · ${fecha(respuesta.fechaCreacion)}`; p.textContent = respuesta.texto; li.append(titulo, p); $("respuestasConsultaAdmin").append(li); }
        $("sinRespuestasConsultaAdmin").hidden = Boolean(r.respuestas?.length); abrir("Consulta", r);
    }
    function confirmar(titulo, texto, operacion) {
        $("tituloConfirmacionAdmin").textContent = titulo; $("textoConfirmacionAdmin").textContent = texto; errorFormulario("Confirmacion"); accionConfirmar = operacion; $("dialogoConfirmacionAdmin").showModal();
    }
    function resultado(nombre, r) {
        if (!r.ok) { errorFormulario(nombre, r.mensaje); return; }
        $(nombre === "Confirmacion" ? "dialogoConfirmacionAdmin" : "dialogo" + nombre).close(); refrescar(); aviso(r.mensaje);
    }
    function archivoImagen(archivo) {
        if (!archivo) return Promise.resolve(null);
        if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(archivo.type) || archivo.size > 1024 * 1024) return Promise.reject(new Error("Selecciona una imagen JPG, PNG, WEBP o AVIF de hasta 1 MB."));
        return new Promise((resolve, reject) => { const lector = new FileReader(); lector.onload = () => resolve(lector.result); lector.onerror = () => reject(new Error("No se pudo leer la imagen.")); lector.readAsDataURL(archivo); });
    }
    document.addEventListener("click", e => {
        const boton = e.target.closest("button"); if (!boton) return;
        if (boton.hasAttribute("data-cerrar-dialogo")) { boton.closest("dialog")?.close(); return; }
        if (boton.dataset.seccion || boton.dataset.irSeccion) { irSeccion(boton.dataset.seccion || boton.dataset.irSeccion); return; }
        const accion = boton.dataset.accion; if (!accion) return;
        if (!PEH.admin.esAdmin()) { acceso(); return; }
        const tipo = accion.includes("animal") ? "animales" : accion.includes("usuario") ? "usuarios" : accion.includes("comentario") ? "comentarios" : accion.includes("adopcion") ? "adopciones" : accion.includes("reserva") ? "reservas" : "consultas";
        const r = datos[tipo].find(r => String(r.id) === boton.dataset.id); if (!r) return;
        if (accion === "ver-animal") window.open(`animal.html?id=${encodeURIComponent(r.slug)}`, "_blank", "noopener");
        if (accion === "editar-animal") editarAnimal(r);
        if (accion === "editar-usuario") editarUsuario(r);
        if (accion === "ver-comentario") window.open(`comunidad.html#publicacion-${encodeURIComponent(r.publicacionId)}`, "_blank", "noopener");
        if (accion === "gestionar-adopcion") gestionarAdopcion(r);
        if (accion === "gestionar-reserva") gestionarReserva(r);
        if (accion === "gestionar-consulta") gestionarConsulta(r);
        if (accion === "eliminar-animal") confirmar("Eliminar perfil del animal", `Se retirará a ${r.nombre} del catálogo y se cancelarán sus solicitudes activas. Sus historiales anteriores se conservarán.`, () => PEH.admin.eliminarAnimal(r.id, version(r)));
        if (accion === "eliminar-usuario") confirmar("Eliminar cuenta de usuario", `Se eliminará el acceso de ${r.nombre}. Se retirarán su perfil y preferencias, y se cancelarán sus solicitudes y reservas activas. Sus historiales se conservarán y su autoría en la comunidad se anonimizará.`, () => PEH.admin.eliminarUsuario(r.id, version(r)));
        if (accion === "eliminar-comentario") confirmar("Eliminar comentario", "Se eliminará este comentario junto con sus respuestas. Esta acción no se puede deshacer desde el panel.", () => PEH.admin.eliminarComentario(r.id, version(r)));
    });
    document.querySelectorAll("[data-busqueda], [data-filtro]").forEach(e => e.addEventListener(e.tagName === "INPUT" ? "input" : "change", () => { if (PEH.admin.esAdmin()) tipos.forEach(tabla); }));
    $("botonNuevoAnimal").addEventListener("click", () => { if (PEH.admin.esAdmin()) editarAnimal(); });
    $("botonActualizarAdmin").addEventListener("click", refrescar);
    $("botonCerrarSesionAdmin").addEventListener("click", () => confirmar("Cerrar sesión", "¿Quieres cerrar la sesión de administración?", () => {
        if (!PEH.sesion.cerrar()) return { ok: false, mensaje: "No se pudo cerrar la sesión." };
        window.location.href = "index.html"; return { ok: true, mensaje: "Sesión cerrada." };
    }));
    $("fotoAnimalAdmin").addEventListener("change", async e => {
        const archivo = e.target.files[0];
        try { const foto = await archivoImagen(archivo); if (foto && e.target.files[0] === archivo) { $("vistaPreviaAnimalAdmin").src = foto; $("vistaPreviaAnimalAdmin").hidden = false; } }
        catch (error) { errorFormulario("Animal", error.message); e.target.value = ""; }
    });
    for (const nombre of ["Animal", "Usuario", "Adopcion", "Reserva", "Consulta", "Confirmacion"]) {
        $("formulario" + nombre + "Admin").addEventListener("submit", async e => {
            if (e.submitter?.value === "cancelar") return;
            e.preventDefault(); if (ocupada) return;
            if (!PEH.admin.esAdmin()) { acceso(); return; }
            ocupada = true; const boton = e.submitter; if (boton) boton.disabled = true;
            try {
                const formulario = e.currentTarget, campos = new FormData(formulario), original = ediciones.get(nombre);
                const apertura = $(nombre === "Confirmacion" ? "dialogoConfirmacionAdmin" : "dialogo" + nombre).dataset.apertura;
                if (nombre === "Animal") {
                    const foto = await archivoImagen($("fotoAnimalAdmin").files[0]);
                    if (!$("dialogoAnimal").open || $("dialogoAnimal").dataset.apertura !== apertura) return;
                    const datos = Object.fromEntries(campos); datos.hogar = campos.getAll("hogar"); datos.convivencia = campos.getAll("convivencia"); datos.imagen = foto || campos.get("imagenActual");
                    resultado(nombre, PEH.admin.guardarAnimal(datos, original ? version(original) : undefined));
                } else if (nombre === "Usuario") resultado(nombre, PEH.admin.guardarUsuario(Object.fromEntries(campos), version(original)));
                else if (nombre === "Adopcion") resultado(nombre, PEH.admin.guardarAdopcion(campos.get("id"), Object.fromEntries(campos), version(original)));
                else if (nombre === "Reserva") resultado(nombre, PEH.admin.guardarReserva(campos.get("id"), Object.fromEntries(campos), version(original)));
                else if (nombre === "Consulta") resultado(nombre, PEH.admin.guardarConsulta(campos.get("id"), Object.fromEntries(campos), version(original)));
                else if (nombre === "Confirmacion" && accionConfirmar) resultado(nombre, accionConfirmar());
            } catch (error) { errorFormulario(nombre, error.message || "No se pudo completar la operación."); }
            finally { ocupada = false; if (boton) boton.disabled = false; }
        });
    }
    $("guardarEstadoConsultaAdmin").addEventListener("click", () => {
        const original = ediciones.get("Consulta"); if (!original) return;
        resultado("Consulta", PEH.admin.guardarConsulta(original.id, { estado: $("nuevoEstadoConsultaAdmin").value }, version(original)));
    });
    document.querySelectorAll("dialog").forEach(d => d.addEventListener("click", e => { if (e.target === d) { const r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } }));
    let refresco = null;
    function programarRefresco() { clearTimeout(refresco); refresco = setTimeout(refrescar, 0); }
    window.addEventListener("peh:actualizado", programarRefresco); window.addEventListener("storage", programarRefresco); window.addEventListener("focus", programarRefresco);
    // Los comentarios incluidos en comunidad.html conservan identificadores estables.
    PEH.admin.cargarComentariosDemo(window.PEH_COMENTARIOS_DEMO_ADMIN || []);
    refrescar();
});
