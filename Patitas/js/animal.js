document.addEventListener("DOMContentLoaded", () => {
    const solicitado = new URLSearchParams(window.location.search).get("id") || "milo";
    const animal = window.PEH_ANIMALES.find(a => a.slug === solicitado || String(a.id) === solicitado);
    // No se permite enviar otra solicitud mientras exista una adopción aprobada.
    if (animal && animal.estadoPerfil !== "disponible") {
        const boton = document.getElementById("botonAdoptar");
        if (boton) { boton.disabled = true; boton.textContent = "Adopción en proceso"; }
        document.addEventListener("click", evento => {
            if (evento.target.closest("#botonAdoptar")) { evento.preventDefault(); evento.stopImmediatePropagation(); window.alert("Este animal ya tiene una adopción en proceso."); }
        }, true);
    }

    if (!animal) {
        const main = document.querySelector("#perfilAnimal");
        main.replaceChildren();
        const aviso = document.createElement("p");
        aviso.textContent = "Este animal no está disponible. Vuelve al catálogo para conocer a nuestros perros y gatos.";
        const enlace = document.createElement("a");
        enlace.href = "principal.html#animales";
        enlace.textContent = "Volver al catálogo";
        main.append(aviso, enlace);
        document.querySelector("#modoAdopcion").hidden = true;
        document.title = "Animal no disponible | PEH";
        return;
    }
    // Sincronizamos también los textos del formulario sin reemplazar nodos.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let nodo;
    while ((nodo = walker.nextNode())) {
        if (!["SCRIPT", "STYLE"].includes(nodo.parentElement.tagName)) {
            nodo.nodeValue = nodo.nodeValue.replace(/Milo/g, animal.nombre);
        }
    }
    document.title = animal.nombre + " | PEH";
    const capitalizar = valor => valor.charAt(0).toUpperCase() + valor.slice(1);
    const tamano = {pequeno: "Pequeño", mediano: "Mediano", grande: "Grande"}[animal.tamano];
    const edad = animal.edad + (animal.edad === 1 ? " año aprox." : " años aprox.");
    const sexo = capitalizar(animal.sexo);
    const ubicacion = animal.comuna + ", Santiago";
    function textos(selector, valores) {
        document.querySelectorAll(selector).forEach((elemento, i) => {
            if (valores[i] !== undefined) elemento.textContent = valores[i];
        });
    }
    textos(".datos-resumen-animal span", ["📍 " + ubicacion, "🗓 " + edad, sexo, tamano]);
    textos(".datos-adopcion span", ["🗓 " + edad, sexo, tamano, "📍 " + ubicacion]);
    textos(".informacion-basica dd", [edad, sexo, tamano, capitalizar(animal.especie), ubicacion, animal.diasEsperando + " días"]);
    textos(".historia-animal p", animal.historia);
    textos(".historia-animal blockquote", ["“" + animal.nombre + ": " + animal.personalidad.join(", ").toLowerCase() + ".”"]);
    // El catálogo es de demostración: no atribuimos antecedentes clínicos sin verificar.
    textos(".salud-cuidados dd", ["Consultar con la persona responsable", "Por confirmar", "Consultar evaluación veterinaria", animal.cuidados]);
    const etiquetas = document.querySelector(".etiquetas-personalidad");
    etiquetas.replaceChildren(...animal.personalidad.map(texto => {
        const span = document.createElement("span");
        span.textContent = "♥ " + texto;
        return span;
    }));
    textos(".lista-convivencia dd", [
        animal.convivencia.includes("perros") ? "Se lleva bien" : "Requiere adaptación",
        animal.convivencia.includes("gatos") ? "Se lleva bien" : "Requiere adaptación",
        animal.convivencia.includes("ninos") ? "Sí, con supervisión" : "Consultar adaptación",
        animal.hogar.map(h => ({casa:"Casa", departamento:"Departamento", "espacio-amplio":"Espacio amplio"})[h]).join(" o ")
    ]);
    document.querySelectorAll("#imagenAnimal, #imagenAnimalAdopcion").forEach(img => {
        img.alt = animal.nombre + " esperando un hogar";
    });
    document.querySelector("#indicadoresCarrusel")?.setAttribute("aria-label", "Fotografías de " + animal.nombre);




    // =====================================================
    // ELEMENTOS DEL CARRUSEL
    // =====================================================

    const imagenAnimal =
        document.getElementById("imagenAnimal");

    const botonAnterior =
        document.getElementById("imagenAnterior");

    const botonSiguiente =
        document.getElementById("imagenSiguiente");

    const indicadoresCarrusel =
        document.getElementById("indicadoresCarrusel");


    // =====================================================
    // ELEMENTOS DEL MODO ADOPCIÓN
    // =====================================================

    const perfilAnimal =
        document.getElementById("perfilAnimal");

    const modoAdopcion =
        document.getElementById("modoAdopcion");

    const botonAdoptar =
        document.getElementById("botonAdoptar");

    const volverPerfil =
        document.getElementById("volverPerfil");

    const cancelarAdopcion =
        document.getElementById("cancelarAdopcion");

    const formularioAdopcion =
        document.getElementById("formularioAdopcion");

    const imagenAnimalAdopcion =
        document.getElementById("imagenAnimalAdopcion");


    // =====================================================
    // IMÁGENES DEL ANIMAL
    // =====================================================
    //
    // Cuando tengamos varios animales, este arreglo será
    // reemplazado por los datos del animal seleccionado.
    //
    // Ejemplo futuro:
    //
    // animal.html?id=milo
    //
    // =====================================================

    const imagenesAnimal = [animal.imagen];


    let indiceImagenActual = 0;


    // =====================================================
    // MOSTRAR IMAGEN
    // =====================================================

    function mostrarImagen(indice) {

        if (!imagenAnimal || imagenesAnimal.length === 0) {
            return;
        }


        indiceImagenActual = indice;

        imagenAnimal.src =
            imagenesAnimal[indiceImagenActual];


        // Mantenemos sincronizada la fotografía
        // que aparece durante la adopción.

        if (imagenAnimalAdopcion) {

            imagenAnimalAdopcion.src =
                imagenesAnimal[indiceImagenActual];

        }


        actualizarIndicadores();

    }


    // =====================================================
    // SIGUIENTE IMAGEN
    // =====================================================

    function siguienteImagen() {

        indiceImagenActual++;


        if (
            indiceImagenActual >=
            imagenesAnimal.length
        ) {

            indiceImagenActual = 0;

        }


        mostrarImagen(indiceImagenActual);

    }


    // =====================================================
    // IMAGEN ANTERIOR
    // =====================================================

    function anteriorImagen() {

        indiceImagenActual--;


        if (indiceImagenActual < 0) {

            indiceImagenActual =
                imagenesAnimal.length - 1;

        }


        mostrarImagen(indiceImagenActual);

    }


    // =====================================================
    // CREAR INDICADORES
    // =====================================================

    function crearIndicadores() {

        if (!indicadoresCarrusel) {
            return;
        }


        indicadoresCarrusel.innerHTML = "";


        imagenesAnimal.forEach(
            (imagen, indice) => {

                const indicador =
                    document.createElement("button");


                indicador.type = "button";

                indicador.classList.add(
                    "indicador-carrusel"
                );


                indicador.setAttribute(
                    "aria-label",
                    `Ver fotografía ${indice + 1}`
                );


                if (
                    indice ===
                    indiceImagenActual
                ) {

                    indicador.classList.add(
                        "activo"
                    );

                }


                indicador.addEventListener(
                    "click",
                    () => {

                        mostrarImagen(indice);

                    }
                );


                indicadoresCarrusel.appendChild(
                    indicador
                );

            }
        );

    }


    // =====================================================
    // ACTUALIZAR INDICADORES
    // =====================================================

    function actualizarIndicadores() {

        if (!indicadoresCarrusel) {
            return;
        }


        const indicadores =
            indicadoresCarrusel.querySelectorAll(
                ".indicador-carrusel"
            );


        indicadores.forEach(
            (indicador, indice) => {

                indicador.classList.toggle(
                    "activo",
                    indice === indiceImagenActual
                );

            }
        );

    }


    // =====================================================
    // CONFIGURAR CARRUSEL
    // =====================================================

    function configurarCarrusel() {

        if (!imagenAnimal) {
            return;
        }


        // No existen fotografías.

        if (imagenesAnimal.length === 0) {

            if (botonAnterior) {
                botonAnterior.hidden = true;
            }

            if (botonSiguiente) {
                botonSiguiente.hidden = true;
            }

            if (indicadoresCarrusel) {
                indicadoresCarrusel.hidden = true;
            }

            return;

        }


        // Solo existe una fotografía.

        const unaSolaImagen =
            imagenesAnimal.length === 1;


        if (botonAnterior) {

            botonAnterior.hidden =
                unaSolaImagen;

        }


        if (botonSiguiente) {

            botonSiguiente.hidden =
                unaSolaImagen;

        }


        if (indicadoresCarrusel) {

            indicadoresCarrusel.hidden =
                unaSolaImagen;

        }


        crearIndicadores();

        mostrarImagen(indiceImagenActual);

    }


    // =====================================================
    // EVENTOS DEL CARRUSEL
    // =====================================================

    if (botonAnterior) {

        botonAnterior.addEventListener(
            "click",
            anteriorImagen
        );

    }


    if (botonSiguiente) {

        botonSiguiente.addEventListener(
            "click",
            siguienteImagen
        );

    }


    // =====================================================
    // ABRIR MODO ADOPCIÓN
    // =====================================================

    function abrirAdopcion() {

        if (!perfilAnimal || !modoAdopcion) {
            return;
        }


        // Marcamos que estamos en modo adopción.

        document.body.classList.add(
            "adopcion-activa"
        );


        // Ocultamos el perfil normal.

        perfilAnimal.classList.add(
            "perfil-oculto"
        );


        // Mostramos el panel de adopción.

        modoAdopcion.classList.add(
            "activo"
        );


        modoAdopcion.setAttribute(
            "aria-hidden",
            "false"
        );


        // Sincronizamos la fotografía.

        if (
            imagenAnimalAdopcion &&
            imagenesAnimal.length > 0
        ) {

            imagenAnimalAdopcion.src =
                imagenesAnimal[indiceImagenActual];

        }


        // Llevamos el formulario al inicio.

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    // =====================================================
    // CERRAR MODO ADOPCIÓN
    // =====================================================

    function cerrarAdopcion() {

        if (!perfilAnimal || !modoAdopcion) {
            return;
        }


        document.body.classList.remove(
            "adopcion-activa"
        );


        modoAdopcion.classList.remove(
            "activo"
        );


        modoAdopcion.setAttribute(
            "aria-hidden",
            "true"
        );


        perfilAnimal.classList.remove(
            "perfil-oculto"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    // =====================================================
    // BOTÓN ADOPTAR
    // =====================================================

    if (botonAdoptar) {

        botonAdoptar.addEventListener(
            "click",
            abrirAdopcion
        );

    }


    // =====================================================
    // VOLVER AL PERFIL
    // =====================================================

    if (volverPerfil) {

        volverPerfil.addEventListener(
            "click",
            cerrarAdopcion
        );

    }


    // =====================================================
    // CANCELAR ADOPCIÓN
    // =====================================================

    if (cancelarAdopcion) {

        cancelarAdopcion.addEventListener(
            "click",
            cerrarAdopcion
        );

    }



    // =====================================================
    // ENVÍO Y REGISTRO DE SOLICITUDES DE ADOPCIÓN
    // =====================================================

    if (formularioAdopcion) {

        let enviandoSolicitud = false;

        formularioAdopcion.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();

                // Evitar múltiples envíos simultáneos.
                if (enviandoSolicitud) return;

                // Validar los campos HTML.
                if (!formularioAdopcion.reportValidity()) {
                    return;
                }

                // Comprobar que app.js esté disponible.
                if (!window.PEH?.adopciones) {
                    alert(
                        "No se pudo iniciar el registro. " +
                        "Recarga la página e inténtalo nuevamente."
                    );
                    return;
                }

                // Identificar al usuario actual.
                const usuario = PEH.sesion.obtener();

                if (!usuario?.id) {
                    alert(
                        "Debes iniciar sesión para " +
                        "enviar una solicitud de adopción."
                    );
                    return;
                }

                // Recuperar información del formulario.
                const datos = new FormData(formularioAdopcion);

                const obtener = (campo) =>
                    String(datos.get(campo) || "").trim();

                const nombre = obtener("nombreAdoptante");
                const edad = Number(obtener("edadAdoptante"));
                const correo = obtener("correoAdoptante");
                const telefono = obtener("telefonoAdoptante");
                const comuna = obtener("comunaAdoptante");

                const motivo = obtener("motivoAdopcion");
                const cuidados = obtener("cuidadosAnimal");

                // =================================================
                // VALIDACIONES ADICIONALES
                // =================================================

                if (nombre.length < 3) {
                    alert("Ingresa tu nombre completo.");
                    return;
                }

                if (!PEH.validar.correo(correo)) {
                    alert("Ingresa un correo electrónico válido.");
                    return;
                }

                if (!Number.isInteger(edad) || edad < 18) {
                    alert(
                        "Debes tener al menos 18 años " +
                        "para realizar una solicitud."
                    );
                    return;
                }

                if (telefono.replace(/\D/g, "").length < 9) {
                    alert("Ingresa un teléfono válido.");
                    return;
                }

                if (comuna.length < 2) {
                    alert("Ingresa una comuna válida.");
                    return;
                }

                if (motivo.length < 20) {
                    alert(
                        "Cuéntanos un poco más sobre " +
                        "por qué deseas adoptar. " +
                        "Escribe al menos 20 caracteres."
                    );
                    return;
                }

                if (cuidados.length < 20) {
                    alert(
                        "Describe cómo cuidarías a tu mascota. " +
                        "Escribe al menos 20 caracteres."
                    );
                    return;
                }

                // =================================================
                // IDENTIFICACIÓN DEL ANIMAL
                // =================================================
                // Identidad del perfil seleccionado.

                const animalId = animal.slug;
                const animalNombre = animal.nombre;

                // =================================================
                // EVITAR SOLICITUDES ACTIVAS DUPLICADAS
                // =================================================

                const solicitudes =
                    PEH.adopciones.listar(usuario.id);

                const estadosActivos = [
                    "pendiente",
                    "en revisión",
                    "en revision",
                    "aprobada"
                ];

                const solicitudExistente = solicitudes.some(
                    (solicitud) => {

                        const mismoAnimal =
                            solicitud.animalId === animalId;

                        const estado = String(
                            solicitud.estado || ""
                        ).toLowerCase().trim();

                        return mismoAnimal &&
                            estadosActivos.includes(estado);
                    }
                );

                if (solicitudExistente) {
                    alert(
                        "Ya tienes una solicitud activa " +
                        "para adoptar a " + animalNombre + ".\n\n" +
                        "Puedes consultar su estado " +
                        "en tu perfil."
                    );
                    return;
                }

                // =================================================
                // CREAR SOLICITUD
                // =================================================

                const solicitud = {

                    usuarioId: usuario.id,

                    animalId: animalId,
                    animalNombre: animalNombre,
                    animalImagen: imagenesAnimal[0] || "",

                    nombreAdoptante: nombre,
                    edadAdoptante: edad,
                    correoAdoptante: correo,
                    telefonoAdoptante: telefono,
                    comunaAdoptante: comuna,

                    tipoVivienda: obtener("tipoVivienda"),
                    situacionVivienda: obtener("situacionVivienda"),

                    personasHogar: obtener("personasHogar"),
                    acuerdoFamiliar: obtener("acuerdoFamiliar"),

                    otrosAnimales: obtener("otrosAnimales"),
                    detalleAnimales: obtener("detalleAnimales"),

                    experienciaAnimales:
                        obtener("experienciaAnimales"),

                    motivoAdopcion: motivo,
                    cuidadosAnimal: cuidados,

                    aceptaCompromiso:
                        datos.get("aceptaCompromiso") !== null,

                    estado: "Pendiente"

                };

                // =================================================
                // GUARDAR EN LOCALSTORAGE
                // =================================================

                enviandoSolicitud = true;

                try {

                    const resultado =
                        PEH.adopciones.guardar(solicitud);

                    if (!resultado) {
                        alert(
                            "No fue posible guardar tu solicitud. " +
                            "Inténtalo nuevamente."
                        );
                        return;
                    }

                    alert(
                        "¡Solicitud registrada! 🐾\n\n" +
                        "Tu solicitud para adoptar a " +
                        animalNombre +
                        " ha sido guardada correctamente.\n\n" +
                        "Puedes revisar su estado " +
                        "desde tu perfil."
                    );

                    formularioAdopcion.reset();
                    cerrarAdopcion();

                } catch (error) {

                    console.error(
                        "[PEH] Error al registrar adopción:",
                        error
                    );

                    alert(
                        "Ocurrió un problema al registrar " +
                        "tu solicitud. Inténtalo nuevamente."
                    );

                } finally {

                    enviandoSolicitud = false;

                }

            }
        );

    }



    // =====================================================
    // INICIALIZACIÓN
    // =====================================================

    configurarCarrusel();

    // =====================================================
    // NAVEGACIÓN SUPERIOR EN PANTALLAS PEQUEÑAS
    // =====================================================

    const botonMenu =
        document.getElementById("botonMenu");

    const navegacionGlobal =
        document.getElementById("navegacionGlobal");

    if (botonMenu && navegacionGlobal) {

        function cerrarMenu() {

            navegacionGlobal.classList.remove("abierta");
            botonMenu.setAttribute("aria-expanded", "false");

        }

        botonMenu.addEventListener(
            "click",
            () => {

                const abierto =
                    navegacionGlobal.classList.toggle("abierta");

                botonMenu.setAttribute(
                    "aria-expanded",
                    String(abierto)
                );

            }
        );

        navegacionGlobal.querySelectorAll("a").forEach(
            (enlace) => {

                enlace.addEventListener("click", cerrarMenu);

            }
        );

        document.addEventListener(
            "keydown",
            (evento) => {

                if (evento.key === "Escape") {
                    cerrarMenu();
                }

            }
        );

    }

});
// Si el perfil cambia en otra pestaña, se actualiza su presentación. Un formulario
// con cambios sin enviar se conserva y la capa de datos vuelve a validar el animal.
window.addEventListener("storage", evento => {
    if (evento.key !== PEH.admin.CLAVES.catalogo && evento.key !== null) return;
    const formulario = document.getElementById("formularioAdopcion");
    const editando = formulario && !document.getElementById("modoAdopcion")?.hidden;
    if (editando) {
        const solicitado = new URLSearchParams(location.search).get("id") || "milo";
        const actual = PEH.catalogo.obtener(solicitado);
        if (!actual || actual.estadoPerfil !== "disponible") window.alert("El estado de este animal cambió. Tus campos se conservaron, pero ya no se puede enviar esta solicitud.");
    } else location.reload();
});
