
/* ==========================================================
   PEH — PATITAS ESPERANDO UN HOGAR
   APP.JS V3 — NÚCLEO MULTIUSUARIO DE DEMOSTRACIÓN

   Frontend + localStorage. No es autenticación de producción.
   Cargar antes de los JS individuales.
   No borra ni reasigna registros anteriores.
   ========================================================== */

    "use strict";

    const CLAVES = Object.freeze({
        adopciones: "pehSolicitudesAdopcion",
        reservas: "pehReservasVeterinarias",
        publicaciones: "peh_publicaciones_comunidad",
        perfil: "peh_perfil_usuario",
        notificaciones: "peh_preferencias_notificaciones",
        preferenciasAdopcion: "peh_preferencias_adopcion",
        sesion: "peh_sesion_demo",
        cuentas: "peh_cuentas_demo_v3"
    });

    function leer(clave, respaldo = null) {
        try {
            const dato = localStorage.getItem(clave);
            return dato === null ? respaldo : JSON.parse(dato);
        } catch (error) {
            console.warn("[PEH] Error de lectura:", clave, error);
            return respaldo;
        }
    }

    function notificarCambio(clave) {
        window.dispatchEvent(new CustomEvent("peh:actualizado", {
            detail: { clave }
        }));
    }

    function escribir(clave, valor) {
        try {
            localStorage.setItem(clave, JSON.stringify(valor));
            notificarCambio(clave);
            return true;
        } catch (error) {
            console.error("[PEH] Error al guardar:", clave, error);
            return false;
        }
    }

    function eliminar(clave) {
        try {
            localStorage.removeItem(clave);
            notificarCambio(clave);
            return true;
        } catch (error) {
            console.error("[PEH] Error al eliminar:", clave, error);
            return false;
        }
    }

    function lista(clave) {
        const datos = leer(clave, []);
        return Array.isArray(datos) ? datos : [];
    }

    function id(prefijo = "PEH") {
        const unico = window.crypto?.randomUUID?.();
        return unico
            ? `${prefijo}-${unico}`
            : `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function escaparHTML(texto) {
        const mapa = {
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#39;"
        };
        return String(texto ?? "").replace(/[&<>"']/g, c => mapa[c]);
    }

    function formatearFecha(fecha) {
        if (!fecha) return "Sin fecha";
        const valor = /^\d{4}-\d{2}-\d{2}$/.test(fecha)
            ? `${fecha}T12:00:00` : fecha;
        const objeto = new Date(valor);
        if (Number.isNaN(objeto.getTime())) return "Fecha inválida";
        return new Intl.DateTimeFormat("es-CL", {
            day: "2-digit", month: "long", year: "numeric"
        }).format(objeto);
    }

    function ordenarHistorial(registros) {
        return [...registros].sort((a, b) =>
            (Date.parse(b.fechaCreacion || "") || 0) -
            (Date.parse(a.fechaCreacion || "") || 0)
        );
    }

    const validar = Object.freeze({
        requerido: valor => String(valor ?? "").trim().length > 0,
        correo: valor => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valor ?? "").trim()),
        longitud(valor, minimo, maximo = Infinity) {
            const cantidad = String(valor ?? "").trim().length;
            return cantidad >= minimo && cantidad <= maximo;
        },
        coinciden: (a, b) => a === b,
        fechaFutura(fecha) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
            const seleccionada = new Date(`${fecha}T12:00:00`);
            if (Number.isNaN(seleccionada.getTime())) return false;
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            return seleccionada >= hoy;
        },
        requeridos(campos) {
            return campos.filter(campo => !String(campo?.value ?? "").trim());
        }
    });

    function cuentaPublica(cuenta) {
        if (!cuenta) return null;
        const { claveDerivada, sal, iteraciones, ...publica } = cuenta;
        return { ...publica };
    }

    function obtenerCuentaPorId(usuarioId) {
        return lista(CLAVES.cuentas).find(cuenta => cuenta.id === usuarioId) || null;
    }

    const sesion = Object.freeze({
        iniciar(usuario) {
            if (!usuario || typeof usuario !== "object") return false;
            const invitado = usuario.invitado === true;
            const usuarioId = String(usuario.id || "").trim();
            if (!usuarioId) return false;

            // Para cuentas registradas, los datos se obtienen del registro real.
            const cuenta = invitado ? null : obtenerCuentaPorId(usuarioId);
            if (!invitado && !cuenta) return false;

            const datos = invitado ? {
                id: usuarioId,
                nombre: "Invitado",
                correo: "",
                invitado: true,
                fechaInicio: new Date().toISOString()
            } : {
                id: cuenta.id,
                nombre: cuenta.nombre,
                correo: cuenta.correo,
                invitado: false,
                fechaInicio: new Date().toISOString()
            };
            return escribir(CLAVES.sesion, datos);
        },
        obtener() {
            const actual = leer(CLAVES.sesion, null);
            if (!actual || typeof actual !== "object" || !actual.id) return null;
            if (actual.invitado === true) return { ...actual, invitado: true };
            const cuenta = obtenerCuentaPorId(actual.id);
            if (!cuenta) return null; // No aceptar sesiones heredadas sin cuenta.
            return {
                id: cuenta.id,
                nombre: cuenta.nombre,
                correo: cuenta.correo,
                invitado: false,
                fechaInicio: actual.fechaInicio || null
            };
        },
        activa() { return Boolean(this.obtener()); },
        cerrar() { return eliminar(CLAVES.sesion); }
    });

    function usuarioAutenticado() {
        const actual = sesion.obtener();
        return actual && !actual.invitado ? actual : null;
    }

    // Hash PBKDF2 para credenciales FICTICIAS de demostración.
    // No sustituye un servidor de autenticación.
    function bytesHex(bytes) {
        return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
    }

    async function derivarClave(contrasena, salHex, iteraciones = 120000) {
        if (!window.crypto?.subtle || !window.crypto?.getRandomValues) {
            throw new Error("Web Crypto no está disponible. Usa localhost o HTTPS.");
        }
        const sal = Uint8Array.from(salHex.match(/.{2}/g).map(x => parseInt(x, 16)));
        const base = await crypto.subtle.importKey(
            "raw", new TextEncoder().encode(contrasena),
            "PBKDF2", false, ["deriveBits"]
        );
        const bits = await crypto.subtle.deriveBits(
            { name: "PBKDF2", salt: sal, iterations: iteraciones, hash: "SHA-256" },
            base, 256
        );
        return bytesHex(new Uint8Array(bits));
    }

    const cuentas = Object.freeze({
        listar() { return lista(CLAVES.cuentas).map(cuentaPublica); },
        obtenerPorId(usuarioId) {
            return cuentaPublica(obtenerCuentaPorId(usuarioId));
        },
        async registrar(datos) {
            if (!datos || typeof datos !== "object") {
                return { ok: false, mensaje: "Datos de registro inválidos." };
            }
            const nombre = String(datos.nombre || "").trim();
            const apellido = String(datos.apellido || "").trim();
            const usuario = String(datos.usuario || "").trim();
            const correo = String(datos.correo || "").trim().toLowerCase();
            const contrasena = String(datos.contrasena || "");
            const fechaNacimiento = String(datos.fechaNacimiento || "");

            if (!nombre || !apellido || !/^[A-Za-z0-9_]{4,16}$/.test(usuario) ||
                !validar.correo(correo) ||
                !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/.test(contrasena)) {
                return { ok: false, mensaje: "Revisa los datos del registro." };
            }
            const existentes = lista(CLAVES.cuentas);
            if (existentes.some(c => c.correo.toLowerCase() === correo)) {
                return { ok: false, mensaje: "Este correo ya está registrado." };
            }
            if (existentes.some(c => c.usuario.toLowerCase() === usuario.toLowerCase())) {
                return { ok: false, mensaje: "Este nombre de usuario ya está ocupado." };
            }
            try {
                const sal = new Uint8Array(16);
                crypto.getRandomValues(sal);
                const salHex = bytesHex(sal);
                const iteraciones = 120000;
                const claveDerivada = await derivarClave(contrasena, salHex, iteraciones);
                const nueva = {
                    id: id("USR"), nombre, apellido, usuario, correo,
                    fechaNacimiento, sal: salHex, iteraciones, claveDerivada,
                    fechaRegistro: new Date().toISOString()
                };
                // Releer antes de guardar para evitar duplicados simples.
                const actuales = lista(CLAVES.cuentas);
                if (actuales.some(c => c.correo.toLowerCase() === correo ||
                    c.usuario.toLowerCase() === usuario.toLowerCase())) {
                    return { ok: false, mensaje: "El correo o usuario ya está registrado." };
                }
                if (!escribir(CLAVES.cuentas, [...actuales, nueva])) {
                    return { ok: false, mensaje: "No se pudo guardar la cuenta." };
                }
                return { ok: true, cuenta: cuentaPublica(nueva) };
            } catch (error) {
                console.error("[PEH] Error de registro:", error);
                return { ok: false, mensaje: "No se pudo procesar el registro. Abre PEH desde localhost o HTTPS." };
            }
        },
        async cambiarContrasena(actual, nueva, confirmar) {
            const usuario = usuarioAutenticado();
            if (!usuario) return { ok: false, mensaje: "Inicia sesión con tu cuenta para cambiar la contraseña." };
            if (typeof actual !== "string" || !actual || typeof nueva !== "string") {
                return { ok: false, mensaje: "Completa todos los campos." };
            }
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/.test(nueva)) {
                return { ok: false, mensaje: "Usa al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo." };
            }
            if (nueva !== confirmar) return { ok: false, mensaje: "Las contraseñas nuevas no coinciden." };
            if (actual === nueva) return { ok: false, mensaje: "Elige una contraseña diferente de la actual." };
            const cuenta = obtenerCuentaPorId(usuario.id);
            try {
                const calculada = await derivarClave(actual, cuenta.sal, cuenta.iteraciones);
                if (calculada !== cuenta.claveDerivada) {
                    return { ok: false, mensaje: "La contraseña actual es incorrecta." };
                }
                const sal = new Uint8Array(16);
                crypto.getRandomValues(sal);
                const salHex = bytesHex(sal);
                const iteraciones = 120000;
                const claveDerivada = await derivarClave(nueva, salHex, iteraciones);
                // Releer tras los pasos asíncronos: no sobrescribir otra cuenta
                // ni un cambio de contraseña realizado mientras se procesaba.
                const vigentes = lista(CLAVES.cuentas);
                const indice = vigentes.findIndex(c => c.id === usuario.id);
                if (usuarioAutenticado()?.id !== usuario.id || indice === -1 ||
                    vigentes[indice].claveDerivada !== cuenta.claveDerivada ||
                    vigentes[indice].sal !== cuenta.sal) {
                    return { ok: false, mensaje: "La cuenta o sesión cambió. Vuelve a intentarlo." };
                }
                vigentes[indice] = { ...vigentes[indice], sal: salHex, iteraciones, claveDerivada };
                if (!escribir(CLAVES.cuentas, vigentes)) {
                    return { ok: false, mensaje: "No se pudo guardar la contraseña. Inténtalo nuevamente." };
                }
                return { ok: true, mensaje: "Contraseña actualizada correctamente." };
            } catch (error) {
                console.error("[PEH] Error al cambiar contraseña:", error);
                return { ok: false, mensaje: "No se pudo actualizar la contraseña. Usa localhost o HTTPS e inténtalo nuevamente." };
            }
        },
        async iniciarSesion(correoIngresado, contrasena) {
            const correo = String(correoIngresado || "").trim().toLowerCase();
            const cuenta = lista(CLAVES.cuentas).find(c => c.correo === correo);
            if (!cuenta || typeof contrasena !== "string") {
                return { ok: false, mensaje: "Correo o contraseña incorrectos." };
            }
            try {
                const calculada = await derivarClave(
                    contrasena, cuenta.sal, cuenta.iteraciones
                );
                if (calculada !== cuenta.claveDerivada) {
                    return { ok: false, mensaje: "Correo o contraseña incorrectos." };
                }
                if (!sesion.iniciar(cuenta)) {
                    return { ok: false, mensaje: "No se pudo iniciar sesión." };
                }
                return { ok: true, cuenta: cuentaPublica(cuenta) };
            } catch (error) {
                console.error("[PEH] Error de acceso:", error);
                return { ok: false, mensaje: "No se pudo comprobar el acceso. Usa localhost o HTTPS." };
            }
        }
    });

    function crearGestor(clave, prefijo) {
        return Object.freeze({
            listar(usuarioId = null) {
                const actual = usuarioAutenticado();
                if (!actual) return [];
                if (usuarioId !== null && String(usuarioId) !== actual.id) return [];
                return ordenarHistorial(lista(clave).filter(
                    item => item.usuarioId === actual.id
                ));
            },
            obtener(identificador) {
                const actual = usuarioAutenticado();
                if (!actual) return null;
                return lista(clave).find(item =>
                    item.id === identificador && item.usuarioId === actual.id
                ) || null;
            },
            guardar(datos) {
                const actual = usuarioAutenticado();
                if (!actual || !datos || typeof datos !== "object" || Array.isArray(datos)) {
                    return null;
                }
                const registros = lista(clave);
                const nuevo = {
                    ...datos,
                    id: id(prefijo),
                    usuarioId: actual.id,
                    estado: datos.estado || "Pendiente",
                    fechaCreacion: new Date().toISOString()
                };
                return escribir(clave, [...registros, nuevo]) ? nuevo : null;
            },
            actualizar(identificador, cambios) {
                const actual = usuarioAutenticado();
                if (!actual || !identificador || !cambios ||
                    typeof cambios !== "object" || Array.isArray(cambios)) return false;
                const registros = lista(clave);
                const indice = registros.findIndex(r =>
                    r.id === identificador && r.usuarioId === actual.id
                );
                if (indice === -1) return false;
                const { id: _id, usuarioId: _usuarioId,
                    fechaCreacion: _fecha, ...permitidos } = cambios;
                registros[indice] = {
                    ...registros[indice], ...permitidos,
                    fechaActualizacion: new Date().toISOString()
                };
                return escribir(clave, registros);
            }
        });
    }

    const adopciones = crearGestor(CLAVES.adopciones, "ADOP");
    const reservas = crearGestor(CLAVES.reservas, "VET");

    // Comunidad pública con autor por cuenta y comentarios persistentes.
    const publicaciones = Object.freeze({
        listar() { return lista(CLAVES.publicaciones); },
        agregar(datos) {
            if (!datos || typeof datos !== "object" || Array.isArray(datos)) return null;
            const actual = usuarioAutenticado();
            if (!actual) return null;
            const registros = lista(CLAVES.publicaciones);
            const nueva = {
                ...datos, id: id("PUB"), usuarioId: actual.id,
                autor: nombreAutor(actual.id),
                fechaCreacion: new Date().toISOString()
            };
            return escribir(CLAVES.publicaciones, [...registros, nueva]) ? nueva : null;
        },
        eliminar(identificador) {
            const actual = usuarioAutenticado();
            if (!actual) return false;
            const registros = lista(CLAVES.publicaciones);
            const filtrados = registros.filter(p =>
                !(p.id === identificador && p.usuarioId === actual.id)
            );
            if (filtrados.length === registros.length) return false;
            return escribir(CLAVES.publicaciones, filtrados);
        }
    });

    function nombreAutor(usuarioId) {
        const cuenta = obtenerCuentaPorId(usuarioId);
        return cuenta ? `${cuenta.nombre} ${cuenta.apellido}`.trim() : "Miembro de la comunidad";
    }
    const comentarios = Object.freeze({
        listar(publicacionId) {
            return lista("peh_comentarios_comunidad").filter(c => c.publicacionId === publicacionId);
        },
        agregar(publicacionId, texto, respuestaA = null) {
            const actual = usuarioAutenticado();
            const contenido = typeof texto === "string" ? texto.trim() : "";
            if (!actual || !contenido || contenido.length > 200 || typeof publicacionId !== "string") return null;
            const existe = publicaciones.listar().some(p => p.id === publicacionId) ||
                /^peh-demo-[0-3]$/.test(publicacionId);
            if (!existe) return null;
            if (respuestaA !== null) {
                const padre = this.listar(publicacionId).some(c => c.id === respuestaA);
                const demo = /^peh-demo-[0-3]$/.test(publicacionId) && respuestaA === `${publicacionId}-comentario-0`;
                if (!padre && !demo) return null;
            }
            const nuevo = { id: id("COM"), publicacionId, respuestaA, usuarioId: actual.id,
                autor: nombreAutor(actual.id), texto: contenido, fechaCreacion: new Date().toISOString() };
            return escribir("peh_comentarios_comunidad", [...lista("peh_comentarios_comunidad"), nuevo]) ? nuevo : null;
        }
    });

    // Nuevas preferencias y perfil por cuenta; las claves antiguas no se tocan.
    function claveUsuario(base) {
        const actual = usuarioAutenticado();
        return actual ? `${base}__${actual.id}` : null;
    }

    // Estado privado por cuenta; no representa favoritos ni un contador público.
    const compartidos = Object.freeze({
        contiene(publicacionId) {
            const clave = claveUsuario("peh_compartidos_comunidad");
            return Boolean(clave && lista(clave).includes(publicacionId));
        },
        marcar(publicacionId, usuarioId) {
            const actual = usuarioAutenticado();
            if (!actual || actual.id !== usuarioId || typeof publicacionId !== "string" || !publicacionId) return false;
            const existe = publicaciones.listar().some(p => p.id === publicacionId) ||
                /^peh-demo-[0-3]$/.test(publicacionId);
            if (!existe) return false;
            const clave = claveUsuario("peh_compartidos_comunidad");
            const ids = lista(clave);
            return ids.includes(publicacionId) || escribir(clave, [...ids, publicacionId]);
        }
    });

    const perfil = Object.freeze({
        obtener() {
            const clave = claveUsuario(CLAVES.perfil);
            return clave ? leer(clave, {}) : {};
        },
        guardar(datos) {
            const clave = claveUsuario(CLAVES.perfil);
            return Boolean(clave && datos && typeof datos === "object" &&
                !Array.isArray(datos) && escribir(clave, datos));
        },
        actualizar(cambios) {
            const clave = claveUsuario(CLAVES.perfil);
            return Boolean(clave && cambios && typeof cambios === "object" &&
                !Array.isArray(cambios) && escribir(clave, {
                    ...leer(clave, {}), ...cambios
                }));
        },
        historialAdopciones(usuarioId = null) { return adopciones.listar(usuarioId); },
        historialReservas(usuarioId = null) { return reservas.listar(usuarioId); }
    });

    const preferencias = Object.freeze({
        notificaciones() {
            const clave = claveUsuario(CLAVES.notificaciones);
            return clave ? leer(clave, {
                adopcion: true, veterinaria: true, informacion: false
            }) : { adopcion: true, veterinaria: true, informacion: false };
        },
        guardarNotificaciones(datos) {
            const clave = claveUsuario(CLAVES.notificaciones);
            return Boolean(clave && escribir(clave, datos));
        },
        adopcion() {
            const clave = claveUsuario(CLAVES.preferenciasAdopcion);
            return clave ? leer(clave, {}) : {};
        },
        guardarAdopcion(datos) {
            const clave = claveUsuario(CLAVES.preferenciasAdopcion);
            return Boolean(clave && escribir(clave, datos));
        },
        limpiar() {
            const a = claveUsuario(CLAVES.notificaciones);
            const b = claveUsuario(CLAVES.preferenciasAdopcion);
            if (!a || !b) return false;
            return eliminar(a) && eliminar(b);
        }
    });

    function mostrarMensaje(elemento, mensaje, tipo = "info") {
        if (!elemento) return false;
        elemento.textContent = mensaje;
        elemento.dataset.tipo = tipo;
        elemento.hidden = false;
        return true;
    }

    function navegar(pagina) {
        const permitidas = ["index", "principal", "animal", "comunidad",
            "veterinaria", "perfil", "contacto"];
        if (!permitidas.includes(pagina)) return false;
        window.location.href = `${pagina}.html`;
        return true;
    }

    const PEH = Object.freeze({
        CLAVES, leer, escribir, eliminar, lista, id, escaparHTML,
        formatearFecha, ordenarHistorial, validar, sesion, cuentas,
        adopciones, reservas, publicaciones, comentarios, compartidos, perfil, preferencias,
        mostrarMensaje, navegar,
        validarRequeridos: validar.requeridos,
        limpiarPreferencias: preferencias.limpiar
    });

    console.info("[PEH] Núcleo global V3 multiusuario cargado.");
export default PEH;
