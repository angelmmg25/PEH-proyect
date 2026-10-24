document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTOS PRINCIPALES
    // =====================================================

    const listaPublicaciones =
        document.getElementById("listaPublicaciones");

    const sinPublicaciones =
        document.getElementById("sinPublicaciones");

    const buscador =
        document.getElementById("buscarPublicaciones");

    const filtros =
        document.querySelectorAll(".filtro-publicacion");

    const formularioPublicacion =
        document.getElementById("formularioPublicacion");

    const contenidoPublicacion =
        document.getElementById("contenidoPublicacion");

    const categoriaPublicacion =
        document.getElementById("categoriaPublicacion");

    const ubicacionPublicacion =
        document.getElementById("ubicacionPublicacion");

    const imagenPublicacion =
        document.getElementById("imagenPublicacion");

    const vistaPreviaPublicacion =
        document.getElementById("vistaPreviaPublicacion");

    const imagenPreviaPublicacion =
        document.getElementById("imagenPreviaPublicacion");

    const quitarImagenPublicacion =
        document.getElementById("quitarImagenPublicacion");

    const mensajePublicacion =
        document.getElementById("mensajePublicacion");


    const temasComunidad =
        document.querySelectorAll(".tema-comunidad");

    const botonMenu =
        document.getElementById("botonMenu");

    const navegacion =
        document.querySelector(".navegacion-principal");


    // =====================================================
    // ESTADO DE LA COMUNIDAD
    // =====================================================

    const categoriasValidas = ["todas", "adopcion", "consejos", "preguntas", "difusion", "perdidos", "encontrados", "jornadas"];
    const categoriaURL = new URLSearchParams(window.location.search).get("tipo");
    let filtroActual = categoriasValidas.includes(categoriaURL) ? categoriaURL : "todas";

    let imagenSeleccionada = null;




    // =====================================================
    // PUBLICACIONES INICIALES
    // =====================================================

    // =====================================================
    // ANIMALES DESTACADOS: MISMA FUENTE Y ORDEN QUE EL INICIO
    // =====================================================

    const patitasDestacadas =
        document.getElementById("patitasDestacadas");

    function refrescarPatitasDestacadas() {
        if (!patitasDestacadas) return;

        const seleccionados =
            [...window.PEH_ANIMALES]
                .sort(
                    (a, b) =>
                        b.diasEsperando - a.diasEsperando
                )
                .slice(0, 4);

        patitasDestacadas.replaceChildren(
            ...seleccionados.map(
                (animal) => {

                    const enlace = document.createElement("a");
                    enlace.className = "patita-destacada";
                    enlace.href =
                        `animal.html?id=${encodeURIComponent(animal.slug)}`;

                    const foto = document.createElement("div");
                    foto.className = "foto-patita";

                    const imagen = document.createElement("img");
                    imagen.src = animal.imagen;
                    imagen.alt =
                        `${animal.nombre}, ${animal.especie === "perro" ? "perro" : "gato"} en adopción`;
                    imagen.loading = "lazy";
                    foto.appendChild(imagen);

                    const nombre = document.createElement("strong");
                    nombre.textContent = animal.nombre;

                    const estado = document.createElement("small");
                    estado.textContent = animal.estadoPerfil === "en-proceso" ? "Adopción en proceso" : "En adopción";

                    enlace.append(foto, nombre, estado);
                    return enlace;

                }
            )
        );

    }


    refrescarPatitasDestacadas();
    window.addEventListener("storage", e => { if ([PEH.admin.CLAVES.catalogo, null].includes(e.key)) refrescarPatitasDestacadas(); });
    window.addEventListener("peh:actualizado", e => { if (e.detail?.clave === PEH.admin.CLAVES.catalogo) refrescarPatitasDestacadas(); });

    activarFiltro(filtroActual);
    inicializarPublicaciones();
    window.addEventListener("storage", evento => {
        if ([window.PEH.CLAVES.publicaciones, window.PEH.CLAVES.sesion].includes(evento.key)) {
            window.location.reload();
        }
    });
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();


    function inicializarPublicaciones() {

        listaPublicaciones?.querySelectorAll(".publicacion").forEach((p, indice) => {
            p.dataset.id = `peh-demo-${indice}`;
        });
        cargarPublicacionesPersistentes();

        prepararPublicaciones();

        aplicarFiltros();

    }



    // =====================================================
    // FILTROS POR CATEGORÍA
    // =====================================================

    filtros.forEach((boton) => {

        boton.addEventListener("click", () => {

            filtroActual =
                boton.dataset.filtro || "todas";


            // Cambiar filtro activo

            filtros.forEach((filtro) => {

                filtro.classList.remove("activo");

            });

            boton.classList.add("activo");


            // Limpiamos búsqueda para que el filtro
            // muestre claramente su contenido

            if (buscador) {
                buscador.value = "";
            }


            actualizarURLFiltro();
            aplicarFiltros();

        });

    });



    // =====================================================
    // BUSCADOR
    // =====================================================

    if (buscador) {

        buscador.addEventListener("input", () => {

            aplicarFiltros();

        });

    }



    // =====================================================
    // APLICAR FILTROS Y BÚSQUEDA
    // =====================================================

    function aplicarFiltros() {

        const publicaciones =
            document.querySelectorAll(
                "#listaPublicaciones .publicacion"
            );


        const termino =
            normalizarTexto(
                buscador?.value || ""
            );


        let visibles = 0;


        publicaciones.forEach((publicacion) => {

            const categoria =
                publicacion.dataset.categoria || "";

            const texto =
                normalizarTexto(
                    publicacion.dataset.texto ||
                    publicacion.textContent
                );


            const coincideCategoria =
                filtroActual === "todas" ||
                categoria === filtroActual;


            const coincideBusqueda =
                !termino ||
                texto.includes(termino);


            const mostrar =
                coincideCategoria &&
                coincideBusqueda;


            publicacion.hidden = !mostrar;


            if (mostrar) {
                visibles++;
            }

        });


        if (sinPublicaciones) {

            sinPublicaciones.hidden =
                visibles !== 0;

        }

    }



    // =====================================================
    // TEMAS DE LA COMUNIDAD
    // =====================================================

    temasComunidad.forEach((tema) => {

        tema.addEventListener("click", () => {

            const categoria =
                tema.dataset.categoria;

            const busqueda =
                tema.dataset.busqueda;


            // ---------------------------------------------
            // Tema conectado a una categoría
            // ---------------------------------------------

            if (categoria) {

                activarFiltro(categoria);

                if (buscador) {
                    buscador.value = "";
                }

            }


            // ---------------------------------------------
            // Tema conectado a una búsqueda
            // ---------------------------------------------

            if (busqueda && buscador) {

                activarFiltro("todas");

                buscador.value = busqueda;

            }


            aplicarFiltros();


            // Llevamos al usuario al contenido

            listaPublicaciones?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });



    // =====================================================
    // ACTIVAR FILTRO DESDE JAVASCRIPT
    // =====================================================

    function actualizarURLFiltro() {
        const url = new URL(window.location.href);
        if (filtroActual === "todas") url.searchParams.delete("tipo");
        else url.searchParams.set("tipo", filtroActual);
        window.history.replaceState(null, "", url);
    }

    function activarFiltro(categoria) {

        filtroActual = categoriasValidas.includes(categoria) ? categoria : "todas";
        actualizarURLFiltro();


        filtros.forEach((boton) => {

            boton.classList.toggle(
                "activo",
                boton.dataset.filtro === categoria
            );

        });

    }



    // =====================================================
    // SELECCIÓN DE IMAGEN
    // =====================================================

    if (imagenPublicacion) {

        imagenPublicacion.addEventListener(
            "change",
            () => {

                const archivo =
                    imagenPublicacion.files[0];


                if (!archivo) {

                    limpiarImagen();

                    return;

                }


                // -----------------------------------------
                // Validar tipo
                // -----------------------------------------

                if (!archivo.type.startsWith("image/")) {

                    mostrarMensaje(
                        "Selecciona un archivo de imagen válido.",
                        "error"
                    );

                    limpiarImagen();

                    return;

                }


                // -----------------------------------------
                // Límite aproximado: 3 MB
                // -----------------------------------------

                const limite =
                    3 * 1024 * 1024;


                if (archivo.size > limite) {

                    mostrarMensaje(
                        "La imagen no puede superar los 3 MB.",
                        "error"
                    );

                    limpiarImagen();

                    return;

                }


                // -----------------------------------------
                // Generar vista previa
                // -----------------------------------------

                const lector =
                    new FileReader();


                lector.onload = (evento) => {

                    imagenSeleccionada =
                        evento.target.result;


                    if (imagenPreviaPublicacion) {

                        imagenPreviaPublicacion.src =
                            imagenSeleccionada;

                    }


                    if (vistaPreviaPublicacion) {

                        vistaPreviaPublicacion.hidden =
                            false;

                    }

                };


                lector.readAsDataURL(archivo);

            }
        );

    }



    // =====================================================
    // QUITAR IMAGEN
    // =====================================================

    if (quitarImagenPublicacion) {

        quitarImagenPublicacion.addEventListener(
            "click",
            limpiarImagen
        );

    }



    function limpiarImagen() {

        imagenSeleccionada = null;


        if (imagenPublicacion) {

            imagenPublicacion.value = "";

        }


        if (imagenPreviaPublicacion) {

            imagenPreviaPublicacion.src = "";

        }


        if (vistaPreviaPublicacion) {

            vistaPreviaPublicacion.hidden = true;

        }

    }



    // =====================================================
    // CREAR PUBLICACIÓN
    // =====================================================

    if (formularioPublicacion) {

        formularioPublicacion.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();


                const contenido =
                    contenidoPublicacion.value.trim();

                const categoria =
                    categoriaPublicacion.value;

                const ubicacion =
                    ubicacionPublicacion.value.trim();


                // -----------------------------------------
                // Validaciones
                // -----------------------------------------

                if (contenido.length < 10) {

                    mostrarMensaje(
                        "Escribe un poco más para que la comunidad pueda entender tu publicación.",
                        "error"
                    );

                    contenidoPublicacion.focus();

                    return;

                }


                if (!categoria) {

                    mostrarMensaje(
                        "Selecciona una categoría para tu publicación.",
                        "error"
                    );

                    categoriaPublicacion.focus();

                    return;

                }


                // -----------------------------------------
                // Crear objeto
                // -----------------------------------------

                const nuevaPublicacion = {

                    id: generarId(),

                    autor: "",

                    contenido: contenido,

                    categoria: categoria,

                    ubicacion: ubicacion,

                    imagen: imagenSeleccionada,

                    fecha: new Date().toISOString()

                };


                // -----------------------------------------
                // Guardar localmente
                // -----------------------------------------

                const persistida = guardarNuevaPublicacion(nuevaPublicacion);
                if (!persistida) {
                    mostrarMensaje("Inicia sesión para publicar y comprueba que haya espacio para almacenar la publicación.", "error");
                    return;
                }
                Object.assign(nuevaPublicacion, persistida);


                // -----------------------------------------
                // Crear publicación visual
                // -----------------------------------------

                const elemento =
                    crearElementoPublicacion(
                        nuevaPublicacion
                    );


                listaPublicaciones.prepend(
                    elemento
                );


                prepararPublicacion(elemento);


                // -----------------------------------------
                // Reiniciar formulario
                // -----------------------------------------

                formularioPublicacion.reset();

                limpiarImagen();


                // Mostramos todas las publicaciones

                activarFiltro("todas");


                if (buscador) {
                    buscador.value = "";
                }


                aplicarFiltros();


                mostrarMensaje(
                    "Tu publicación ya está visible en la comunidad. 🐾",
                    "exito"
                );


                elemento.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }
        );

    }



    // =====================================================
    // CREAR HTML DE UNA PUBLICACIÓN NUEVA
    // =====================================================

    function crearElementoPublicacion(publicacion) {

        const articulo =
            document.createElement("article");


        articulo.className =
            "publicacion publicacion-nueva";


        articulo.dataset.id =
            publicacion.id;


        articulo.dataset.usuarioId = publicacion.usuarioId || "";

        articulo.dataset.categoria =
            publicacion.categoria;


        articulo.dataset.texto =
            normalizarTexto(
                `${publicacion.contenido}
                 ${publicacion.ubicacion || ""}
                 ${obtenerNombreCategoria(
                    publicacion.categoria
                 )}`
            );


        const ubicacionHTML =
            publicacion.ubicacion
                ? `
                    <span>•</span>
                    <span>
                        ${escaparHTML(publicacion.ubicacion)}
                    </span>
                `
                : "";


        const imagenHTML =
            publicacion.imagen
                ? `
                    <div class="imagenes-publicacion imagen-unica">

                        <img
                            src="${publicacion.imagen}"
                            alt="Imagen compartida en la publicación"
                        >

                    </div>
                `
                : "";


        articulo.innerHTML = `

            <header class="publicacion-cabecera">

                <div
                    class="avatar-publicacion"
                    aria-hidden="true"
                >
                    👤
                </div>


                <div class="datos-publicacion">

                    <strong>
                        ${escaparHTML(publicacion.usuarioId ? (publicacion.autor || "Miembro de la comunidad") : "Miembro de la comunidad")} ${publicacion.usuarioId && publicacion.usuarioId === window.PEH.sesion.obtener()?.id ? "(Tú)" : ""}
                    </strong>

                    <div class="publicacion-meta">

                        <span>
                            ${escaparHTML(window.PEH.formatearFecha(publicacion.fechaCreacion || publicacion.fecha))}
                        </span>

                        ${ubicacionHTML}

                        <span>•</span>

                        <span
                            class="
                                etiqueta-publicacion
                                etiqueta-${publicacion.categoria}
                            "
                        >
                            ${obtenerNombreCategoria(
                                publicacion.categoria
                            )}
                        </span>

                    </div>

                </div>


                <button
                    class="boton-opciones-publicacion"
                    type="button"
                    aria-label="Opciones de publicación"
                >
                    •••
                </button>

            </header>


            <div class="publicacion-contenido">

                <p>
                    ${convertirSaltosLinea(
                        escaparHTML(
                            publicacion.contenido
                        )
                    )}
                </p>

                ${imagenHTML}

            </div>


            <footer class="publicacion-acciones">

                <button
                    class="
                        accion-publicacion
                        boton-compartir
                    "
                    type="button"
                >
                    <span aria-hidden="true">
                        ↗
                    </span>

                    <span>
                        Compartir
                    </span>
                </button>


                <button
                    class="
                        accion-publicacion
                        boton-comentarios
                    "
                    type="button"
                    aria-expanded="false"
                >
                    <span aria-hidden="true">
                        ◯
                    </span>

                    <span>
                        Comentar
                    </span>
                </button>

            </footer>


            <div
                class="seccion-comentarios"
                hidden
            >

                <div class="comentarios-lista">
                </div>


                <form class="formulario-comentario">

                    <input
                        type="text"
                        maxlength="200"
                        placeholder="Escribe un comentario..."
                        required
                    >

                    <button
                        type="submit"
                        aria-label="Enviar comentario"
                    >
                        ➤
                    </button>

                </form>

            </div>
        `;


        return articulo;

    }



    // =====================================================
    // PREPARAR PUBLICACIONES
    // =====================================================

    function prepararPublicaciones() {

        const publicaciones =
            document.querySelectorAll(
                "#listaPublicaciones .publicacion"
            );


        publicaciones.forEach((publicacion) => {

            prepararPublicacion(publicacion);

        });

    }



    function prepararPublicacion(publicacion) {

        publicacion.id = `publicacion-${obtenerIdPublicacion(publicacion)}`;
        prepararCompartir(publicacion);

        prepararComentarios(publicacion);

        prepararBorrado(publicacion);

    }



    // =====================================================
    // COMPARTIR PUBLICACIÓN
    // =====================================================

    function prepararCompartir(publicacion) {
        const boton = publicacion.querySelector(".boton-compartir");
        if (!boton) return;
        const publicacionId = obtenerIdPublicacion(publicacion);
        function actualizarEtiqueta() {
            const compartido =
                window.PEH.compartidos.contiene(publicacionId);

            boton.textContent =
                compartido ? "Compartido ✓" : "↗ Compartir";

            boton.classList.toggle("compartido", compartido);
        }
        actualizarEtiqueta();
        window.addEventListener("storage", evento => {
            if (evento.key?.startsWith("peh_compartidos_comunidad__")) actualizarEtiqueta();
        });
        boton.addEventListener("click", async () => {
            const usuario = window.PEH.sesion.obtener();
            const url = new URL(window.location.href);
            url.hash = `publicacion-${publicacionId}`;
            const datos = { title: "Comunidad PEH", text: obtenerTextoPublicacion(publicacion), url: url.href };
            boton.disabled = true;
            try {
                if (navigator.share) await navigator.share(datos);
                else await navigator.clipboard.writeText(`${datos.text}\n${datos.url}`);
                // Capturar la cuenta antes de abrir el diálogo evita atribuir
                // el resultado a otra sesión si cambia mientras se comparte.
                if (usuario && !usuario.invitado) {
                    const persistido = window.PEH.compartidos.marcar(publicacionId, usuario.id);
                    actualizarEtiqueta();
                    if (!persistido && window.PEH.sesion.obtener()?.id === usuario.id) {
                        mostrarMensaje("La acción se completó, pero no se pudo conservar el estado de compartido. Inténtalo nuevamente.", "error");
                    }
                } else if (!window.PEH.sesion.obtener() || window.PEH.sesion.obtener()?.invitado) {
                    boton.textContent = "Compartido ✓";
                    boton.classList.add("compartido");
                } else actualizarEtiqueta();
            } catch (error) {
                if (error.name !== "AbortError") mostrarMensaje("No fue posible compartir. Inténtalo nuevamente.", "error");
            } finally { boton.disabled = false; }
        });
    }


    function obtenerTextoPublicacion(
        publicacion
    ) {

        const contenido =
            publicacion.querySelector(
                ".publicacion-contenido"
            );


        if (!contenido) {

            return "Mira esta publicación de la comunidad PEH.";

        }


        const texto =
            contenido.innerText
                .replace(/\s+/g, " ")
                .trim();


        const limite = 220;


        if (texto.length > limite) {

            return (
                texto.slice(0, limite) +
                "..."
            );

        }


        return texto;

    }



    // =====================================================
    // COMENTARIOS
    // =====================================================

    function prepararComentarios(publicacion) {
        const boton = publicacion.querySelector(".boton-comentarios");
        const seccion = publicacion.querySelector(".seccion-comentarios");
        const formulario = publicacion.querySelector(".formulario-comentario");
        const lista = publicacion.querySelector(".comentarios-lista");
        const id = obtenerIdPublicacion(publicacion);
        if (!lista || !formulario || !seccion) return;
        // Los comentarios de ejemplo conservan IDs estables entre cuentas.
        const ejemplos = Array.from(lista.querySelectorAll(":scope > p")).map((p, indice) => ({
            id: `${id}-comentario-${indice}`,
            autor: p.querySelector("strong")?.textContent.replace(/:$/, "").trim() || "Comunidad",
            texto: p.textContent.replace(p.querySelector("strong")?.textContent || "", "").trim()
        }));
        let respuestaA = null;
        const aviso = document.createElement("div");
        aviso.className = "aviso-respuesta";
        aviso.hidden = true;
        formulario.before(aviso);
        function cancelarRespuesta() {
            respuestaA = null; aviso.hidden = true; aviso.replaceChildren();
            formulario.querySelector("input").placeholder = "Escribe un comentario...";
        }
        function renderizar() {
            lista.replaceChildren();
            const comentarios = [...ejemplos, ...window.PEH.comentarios.listar(id)].filter(c => window.PEH.comentarios.esVisible(c.id));
            const nodos = new Map();
            for (const c of comentarios) {
                const bloque = document.createElement("div");
                bloque.className = "comentario-comunidad";
                bloque.dataset.comentarioId = c.id;
                const texto = document.createElement("p");
                const autor = document.createElement("strong");
                const propio = c.usuarioId && c.usuarioId === window.PEH.sesion.obtener()?.id;
                autor.textContent = `${c.autor}${propio ? " (Tú)" : ""}: `;
                texto.append(autor, document.createTextNode(c.texto));
                const responder = document.createElement("button");
                responder.type = "button";
                responder.className = "boton-responder";
                responder.textContent = "Responder";
                responder.addEventListener("click", () => {
                    const actual = window.PEH.sesion.obtener();
                    if (!actual || actual.invitado) {
                        mostrarMensaje("Inicia sesión para responder.", "error"); return;
                    }
                    respuestaA = c.id;
                    aviso.replaceChildren(document.createTextNode(`Respondiendo a ${c.autor} `));
                    const cancelar = document.createElement("button");
                    cancelar.type = "button"; cancelar.textContent = "Cancelar";
                    cancelar.addEventListener("click", cancelarRespuesta);
                    aviso.append(cancelar); aviso.hidden = false;
                    formulario.querySelector("input").placeholder = "Escribe tu respuesta...";
                    formulario.querySelector("input").focus();
                });
                bloque.append(texto, responder);
                const padre = c.respuestaA && nodos.get(c.respuestaA);
                if (padre) {
                    bloque.classList.add("es-respuesta");
                    padre.append(bloque);
                } else lista.append(bloque);
                nodos.set(c.id, bloque);
            }
        }
        renderizar();
        boton?.addEventListener("click", () => {
            seccion.hidden = !seccion.hidden;
            boton.setAttribute("aria-expanded", String(!seccion.hidden));
            publicacion.classList.toggle("comentarios-abiertos", !seccion.hidden);
            if (!seccion.hidden) { renderizar(); formulario.querySelector("input")?.focus(); }
        });
        // Actualizar al volver de otra cuenta/página, al restaurar una pestaña
        // y al recibir comentarios desde otra pestaña del mismo navegador.
        window.addEventListener("pageshow", renderizar);
        window.addEventListener("peh:actualizado", e => { if (["peh_comentarios_comunidad", "peh_comentarios_moderados_v1"].includes(e.detail?.clave)) renderizar(); });
        window.addEventListener("focus", renderizar);
        window.addEventListener("storage", evento => {
            if (["peh_comentarios_comunidad", "peh_comentarios_moderados_v1"].includes(evento.key) || evento.key === null) renderizar();
        });
        formulario.addEventListener("submit", evento => {
            evento.preventDefault();
            const input = formulario.querySelector("input");
            const comentario = window.PEH.comentarios.agregar(id, input.value, respuestaA);
            if (!comentario) {
                mostrarMensaje("No se pudo publicar el comentario. Inicia sesión y escribe entre 1 y 200 caracteres.", "error");
                return;
            }
            input.value = "";
            cancelarRespuesta(); renderizar();
        });
    }

    function prepararBorrado(publicacion) {
        const boton = publicacion.querySelector(".boton-opciones-publicacion");
        if (!boton) return;
        const actual = window.PEH.sesion.obtener();
        if (!actual || actual.invitado || publicacion.dataset.usuarioId !== actual.id) {
            boton.remove(); return;
        }
        boton.textContent = "Eliminar";
        boton.setAttribute("aria-label", "Eliminar mi publicación");
        boton.addEventListener("click", () => {
            if (!window.confirm("¿Eliminar esta publicación de la comunidad?")) return;
            if (!window.PEH.publicaciones.eliminar(obtenerIdPublicacion(publicacion))) {
                mostrarMensaje("No se pudo eliminar la publicación.", "error"); return;
            }
            publicacion.remove();
            aplicarFiltros();
            mostrarMensaje("Publicación eliminada.", "exito");
        });
    }


    function obtenerIdPublicacion(publicacion) { return publicacion.dataset.id; }


    function guardarNuevaPublicacion(publicacion) { return window.PEH.publicaciones.agregar(publicacion); }


    function obtenerPublicacionesPersistentes() { return window.PEH.publicaciones.listar(); }


    function cargarPublicacionesPersistentes() {

        if (!listaPublicaciones) {
            return;
        }


        const publicaciones =
            obtenerPublicacionesPersistentes();


        /*
         * Recorremos al revés porque usamos prepend().
         * Así conservamos el orden original.
         */

        [...publicaciones]
            .reverse()
            .forEach((publicacion) => {

                const elemento =
                    crearElementoPublicacion(
                        publicacion
                    );


                listaPublicaciones.prepend(
                    elemento
                );

            });

    }



    // =====================================================
    // MENSAJES DEL FORMULARIO
    // =====================================================

    function mostrarMensaje(
        texto,
        tipo
    ) {

        if (!mensajePublicacion) {
            return;
        }


        mensajePublicacion.textContent =
            texto;


        mensajePublicacion.className =
            `mensaje-publicacion ${tipo}`;


        mensajePublicacion.hidden =
            false;


        clearTimeout(
            mostrarMensaje.temporizador
        );


        mostrarMensaje.temporizador =
            setTimeout(() => {

                mensajePublicacion.hidden =
                    true;

            }, 4500);

    }



    // =====================================================
    // AVISO TEMPORAL EN BOTONES
    // =====================================================

    function mostrarAvisoTemporal(
        boton,
        texto
    ) {

        if (!boton) {
            return;
        }


        const contenidoOriginal =
            boton.innerHTML;


        boton.disabled = true;

        boton.textContent = texto;


        setTimeout(() => {

            boton.innerHTML =
                contenidoOriginal;

            boton.disabled = false;

        }, 1300);

    }



    // =====================================================
    // NOMBRE DE CATEGORÍA
    // =====================================================

    function obtenerNombreCategoria(
        categoria
    ) {

        const categorias = {

            adopcion:
                "Historia de adopción",

            consejos:
                "Consejos y cuidados",

            preguntas:
                "Preguntas de la comunidad",

            difusion:
                "Ayuda y difusión",
            perdidos: "Animales perdidos",
            encontrados: "Animales encontrados",
            jornadas: "Jornadas y actividades"

        };


        return (
            categorias[categoria] ||
            "Comunidad"
        );

    }



    // =====================================================
    // NORMALIZAR TEXTO
    // =====================================================

    function normalizarTexto(texto) {

        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(/\s+/g, " ")
            .trim();

    }



    // =====================================================
    // SEGURIDAD PARA CONTENIDO ESCRITO
    // =====================================================

    function escaparHTML(texto) {

        return texto
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }



    function convertirSaltosLinea(texto) {

        return texto.replace(
            /\n/g,
            "<br>"
        );

    }



    // =====================================================
    // GENERAR ID
    // =====================================================

    function generarId() {

        return (
            "publicacion-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );

    }



    // =====================================================
    // MENÚ RESPONSIVE
    // =====================================================

    if (botonMenu && navegacion) {

        botonMenu.addEventListener(
            "click",
            () => {

                const abierto =
                    navegacion.classList.toggle(
                        "abierta"
                    );


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


        navegacion
            .querySelectorAll("a")
            .forEach((enlace) => {

                enlace.addEventListener(
                    "click",
                    () => {

                        navegacion.classList.remove(
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
                );

            });

    }



    // =====================================================
    // CERRAR MENÚ AL VOLVER A ESCRITORIO
    // =====================================================

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 900 &&
                navegacion &&
                botonMenu
            ) {

                navegacion.classList.remove(
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

        }
    );

});