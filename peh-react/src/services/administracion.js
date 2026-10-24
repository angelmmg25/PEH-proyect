export function crearAdministracion(base, animalesIniciales, comentariosIniciales = []) {
    const K = Object.freeze({
        catalogo: "peh_catalogo_admin_v1",
        comentarios: "peh_comentarios_comunidad",
        comentariosOcultos: "peh_comentarios_moderados_v1",
        consultas: "peh_consultas_contacto"
    });
    const ESTADOS = Object.freeze({
        animales: ["disponible", "en-proceso", "adoptado", "no-visible"],
        adopciones: ["Pendiente", "En revisión", "Aprobada", "Rechazada", "Completada", "Cancelada"],
        reservas: ["Pendiente", "Confirmada", "Completada", "Cancelada", "Rechazada"],
        consultas: ["Pendiente", "En revisión", "Respondida", "Cerrada"]
    });
    // Cuenta fija de demostración: su identidad es independiente de las cuentas normales.
    const ADMIN_DEMO = Object.freeze({
        id: "PEH-ADMIN-DEMO", correo: "adminp@gmail.com", usuario: "peh_admin_demo",
        sal: "cef63670a7445fd44cc8d0bec68a0b64", claveDerivada: "b31d108fc7d93a4dd06ab125d9a6d9caad9a004104860b59305ea116a7e8d17c", iteraciones: 120000
    });
    const correoPermitido = valor => /^[^\s@]+@(?:gmail\.com|duoc\.cl|profesor\.uc\.cl)$/i.test(String(valor || "").trim());
    const esCuentaAdministradora = cuenta => Boolean(cuenta && cuenta.id === ADMIN_DEMO.id && cuenta.correo === ADMIN_DEMO.correo && cuenta.rol === "ADMIN" && cuenta.administradorPredeterminado === true);
    let catalogoBase = [];
    let comentariosBase = [];
    const copia = valor => JSON.parse(JSON.stringify(valor));
    const texto = valor => String(valor ?? "").trim();
    const normalizar = valor => texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const ahora = () => new Date().toISOString();
    const exito = (mensaje, extra = {}) => ({ ok: true, mensaje, ...extra });
    const fallo = mensaje => ({ ok: false, mensaje });

    // Se distingue un registro malformado de una lista vacía para no sobrescribirlo.
    function leerLista(clave) {
        const crudo = localStorage.getItem(clave);
        if (crudo === null) return [];
        let valor;
        try { valor = JSON.parse(crudo); } catch { throw new Error("No se pudo leer un registro guardado. No se han reemplazado sus datos."); }
        if (!Array.isArray(valor)) throw new Error("El registro guardado no tiene el formato esperado.");
        return valor;
    }
    function leerObjeto(clave) {
        const crudo = localStorage.getItem(clave);
        if (crudo === null) return {};
        const valor = JSON.parse(crudo);
        if (!valor || typeof valor !== "object" || Array.isArray(valor)) throw new Error("No se pudo leer el perfil guardado.");
        return valor;
    }
    function cuentaActual() {
        const sesion = base.sesion.obtener();
        if (!sesion || sesion.invitado) return null;
        return leerLista(base.CLAVES.cuentas).find(c => c.id === sesion.id) || null;
    }
    function esAdmin() {
        try { return esCuentaAdministradora(cuentaActual()); } catch { return false; }
    }
    function exigirAdmin() {
        const cuenta = cuentaActual();
        if (!esCuentaAdministradora(cuenta)) throw new Error("Esta acción requiere una sesión administradora.");
        return cuenta;
    }
    function ejecutar(operacion) {
        try { return operacion(exigirAdmin()); }
        catch (error) { return fallo(error.message || "No se pudo completar la operación."); }
    }
    function revisarVersion(registro, version) {
        if (version !== undefined && version !== (registro.revision || registro.fechaActualizacion || registro.fechaCreacion || registro.fechaRegistro || "")) {
            throw new Error("Este registro cambió mientras lo revisabas. Ciérralo, actualiza los datos y vuelve a intentarlo.");
        }
    }
    // Escrituras agrupadas: las notificaciones se emiten tras guardar el grupo.
    // Si falla una escritura se intenta restaurar el estado anterior de cada clave.
    function guardarGrupo(cambios) {
        const entradas = Object.entries(cambios).map(([clave, valor]) => [clave, valor === null ? null : JSON.stringify(valor)]);
        const anteriores = entradas.map(([clave]) => [clave, localStorage.getItem(clave)]);
        try {
            for (const [clave, valor] of entradas) {
                if (valor === null) localStorage.removeItem(clave); else localStorage.setItem(clave, valor);
            }
        } catch {
            let restaurado = true;
            for (const [clave, valor] of anteriores.reverse()) {
                try {
                    if (localStorage.getItem(clave) === valor) continue;
                    if (valor === null) localStorage.removeItem(clave); else localStorage.setItem(clave, valor);
                } catch { restaurado = false; }
            }
            throw new Error(restaurado ? "No se pudieron guardar los cambios. Los datos anteriores se conservaron; revisa el espacio del navegador." : "Falló el guardado y no se pudo restaurar todo. Actualiza el panel y revisa los registros antes de continuar.");
        }
        for (const [clave] of entradas) window.dispatchEvent(new CustomEvent("peh:actualizado", { detail: { clave } }));
    }
    function todosAnimales() {
        const mapa = new Map(catalogoBase.map(a => [String(a.id), copia(a)]));
        for (const animal of leerLista(K.catalogo)) mapa.set(String(animal.id), animal);
        return [...mapa.values()].map(a => ({ ...a, imagen: String(a.imagen || "").replace(/^\.\.\/img\//, "/img/") }));
    }
    function referenciaAnimal(valor) {
        const animal = todosAnimales().find(a => a.slug === valor || String(a.id) === String(valor));
        return String(animal?.id ?? valor);
    }
    function animalesPublicos() {
        return todosAnimales().filter(a => !a.eliminado && ["disponible", "en-proceso"].includes(a.estadoPerfil || "disponible"));
    }
    function refrescarCatalogo() {
        window.dispatchEvent(new CustomEvent("peh:catalogo"));
    }
    const catalogo = Object.freeze({
        inicializar(animales) {
            catalogoBase = copia(animales).map(a => ({ ...a, estadoPerfil: a.estadoPerfil || "disponible" }));
            refrescarCatalogo();
        },
        listar: () => copia(animalesPublicos()),
        obtener(identificador) {
            return copia(animalesPublicos().find(a => String(a.id) === String(identificador) || a.slug === identificador) || null);
        }
    });
    function fechaCita(fecha, hora) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) return null;
        const [anio, mes, dia] = fecha.split("-").map(Number);
        const d = new Date(`${fecha}T${hora}:00`);
        return !Number.isNaN(d.getTime()) && d.getFullYear() === anio && d.getMonth() === mes - 1 && d.getDate() === dia ? d : null;
    }
    function marcarCambio(registro, cambios, admin) {
        return { ...registro, ...cambios, fechaActualizacion: ahora(), actualizadoPor: admin.id, revision: base.id("REV") };
    }
    function historial(registro, cambios, admin) {
        return [...(registro.historialCambios || []), { ...cambios, fecha: ahora(), administradorId: admin.id }];
    }
    function cuentaSegura(cuenta) {
        const { claveDerivada, sal, iteraciones, ...publica } = cuenta;
        return publica;
    }
    function comentarioVisible(id) { return !leerLista(K.comentariosOcultos).includes(id); }
    function todosComentarios() {
        return [...comentariosBase, ...leerLista(K.comentarios)].filter(c => comentarioVisible(c.id));
    }
    const consultas = Object.freeze({
        listar() {
            const cuenta = cuentaActual();
            return cuenta ? copia(leerLista(K.consultas).filter(c => c.usuarioId === cuenta.id)) : [];
        },
        registrar(datos) {
            try {
                const limpios = Object.fromEntries(["nombre", "correo", "motivo", "asunto", "mensaje"].map(k => [k, texto(datos[k])]));
                if (limpios.nombre.length < 3 || limpios.nombre.length > 60 || !base.validar.correo(limpios.correo) || limpios.correo.length > 100 || !["adopcion", "veterinaria", "soporte", "otro"].includes(limpios.motivo) || limpios.asunto.length < 4 || limpios.asunto.length > 80 || limpios.mensaje.length < 10 || limpios.mensaje.length > 500) return fallo("Revisa los campos de la consulta.");
                const cuenta = cuentaActual();
                const consulta = { ...limpios, id: base.id("CON"), usuarioId: cuenta?.id || null, invitado: !cuenta, estado: "Pendiente", respuestas: [], fechaCreacion: ahora() };
                guardarGrupo({ [K.consultas]: [...leerLista(K.consultas), consulta] });
                return exito("Consulta registrada en este navegador.", { consulta: copia(consulta) });
            } catch (error) { return fallo(error.message); }
        }
    });
    const admin = Object.freeze({
        CLAVES: K, ESTADOS, esAdmin,
        cargarComentariosDemo(lista) { comentariosBase = copia(lista); },
        listar(tipo) {
            exigirAdmin();
            const claves = { adopciones: base.CLAVES.adopciones, reservas: base.CLAVES.reservas, consultas: K.consultas };
            if (tipo === "animales") return copia(todosAnimales().filter(a => !a.eliminado));
            if (tipo === "usuarios") return copia(leerLista(base.CLAVES.cuentas).filter(c => !esCuentaAdministradora(c)).map(cuentaSegura));
            if (tipo === "comentarios") return copia(todosComentarios());
            if (!claves[tipo]) throw new Error("Sección no válida.");
            return copia(leerLista(claves[tipo]));
        },
        nombresUsuarios() {
            exigirAdmin();
            return Object.fromEntries(leerLista(base.CLAVES.cuentas).map(c => [c.id, `${c.nombre} ${c.apellido || ""}`.trim()]));
        },
        guardarAnimal(datos, version) {
            return ejecutar(cuenta => {
                const animales = todosAnimales();
                const existente = datos.id ? animales.find(a => String(a.id) === String(datos.id) && !a.eliminado) : null;
                if (datos.id && !existente) return fallo("El perfil ya no está disponible.");
                if (existente) revisarVersion(existente, version);
                const nombre = texto(datos.nombre), especie = texto(datos.especie), sexo = texto(datos.sexo), tamano = texto(datos.tamano), comuna = texto(datos.comuna);
                const edad = Number(datos.edad), diasEsperando = Number(datos.diasEsperando);
                const historia = Array.isArray(datos.historia) ? datos.historia.map(texto).filter(Boolean) : texto(datos.historia).split(/\n\s*\n/).filter(Boolean);
                const cuidados = texto(datos.cuidados);
                if (nombre.length < 2 || nombre.length > 60 || !["perro", "gato"].includes(especie) || !["macho", "hembra"].includes(sexo) || !["pequeno", "mediano", "grande"].includes(tamano) || comuna.length < 2 || comuna.length > 60 || !Number.isFinite(edad) || edad < 0 || edad > 40 || !Number.isInteger(diasEsperando) || diasEsperando < 0 || historia.join(" ").length < 20 || historia.join(" ").length > 3000 || cuidados.length < 10 || cuidados.length > 1500) return fallo("Revisa los datos del animal: nombre, edad, ubicación, historia y cuidados.");
                const estadoPerfil = texto(datos.estadoPerfil || "disponible");
                if (!ESTADOS.animales.includes(estadoPerfil)) return fallo("Estado del animal no válido.");
                const vinculada = leerLista(base.CLAVES.adopciones).find(s => (s.animalId === existente?.slug || String(s.animalId) === String(existente?.id)) && ["Aprobada", "Completada"].includes(s.estado));
                if (vinculada && estadoPerfil !== (vinculada.estado === "Completada" ? "adoptado" : "en-proceso")) return fallo("Este estado depende de una adopción aprobada o completada. Gestiona primero esa solicitud.");
                const imagen = texto(datos.imagen || existente?.imagen).replace(/^\.\.\/img\//, "/img/");
                if (!imagen || imagen.length > 1500000 || !/^(?:\/?img\/[^<>]+\.(?:jpg|jpeg|png|webp|avif)|data:image\/(?:jpeg|png|webp|avif);base64,[A-Za-z0-9+/=]+)$/i.test(imagen)) return fallo("Selecciona una fotografía JPG, PNG, WEBP o AVIF de hasta 1 MB.");
                const id = existente?.id || base.id("ANI");
                const slug = existente?.slug || `${normalizar(nombre).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "animal"}-${String(id).slice(-8)}`;
                const personalidad = (Array.isArray(datos.personalidad) ? datos.personalidad : texto(datos.personalidad).split(",")).map(texto).filter(Boolean).slice(0, 8);
                if (personalidad.join(", ").length > 180) return fallo("La personalidad no puede superar 180 caracteres.");
                const animal = marcarCambio({ ...existente, id, slug, fechaCreacion: existente?.fechaCreacion || ahora() }, {
                    nombre, especie, sexo, edad, tamano, comuna, comunaValor: normalizar(comuna).replace(/[^a-z0-9]+/g, "-"), diasEsperando, historia, cuidados, imagen, personalidad,
                    hogar: (datos.hogar || []).filter(h => ["casa", "departamento", "espacio-amplio"].includes(h)),
                    convivencia: (datos.convivencia || []).filter(c => ["ninos", "perros", "gatos"].includes(c)), estadoPerfil
                }, cuenta);
                guardarGrupo({ [K.catalogo]: [...animales.filter(a => String(a.id) !== String(id)), animal] });
                return exito("Perfil del animal guardado.", { registro: copia(animal) });
            });
        },
        eliminarAnimal(id, version) {
            return ejecutar(cuenta => {
                const animales = todosAnimales(), animal = animales.find(a => String(a.id) === String(id) && !a.eliminado);
                if (!animal) return fallo("El animal ya no está disponible.");
                revisarVersion(animal, version);
                const solicitudes = leerLista(base.CLAVES.adopciones).map(s => {
                    if ((s.animalId === animal.slug || String(s.animalId) === String(animal.id)) && ["Pendiente", "En revisión", "Aprobada"].includes(s.estado || "Pendiente")) return marcarCambio(s, { estado: "Cancelada", observacionAdmin: "El perfil de este animal fue retirado del catálogo.", historialCambios: historial(s, { estado: "Cancelada" }, cuenta) }, cuenta);
                    return s;
                });
                guardarGrupo({ [K.catalogo]: animales.map(a => a.id === animal.id ? marcarCambio(a, { eliminado: true, estadoPerfil: "no-visible" }, cuenta) : a), [base.CLAVES.adopciones]: solicitudes });
                return exito("Perfil retirado. Sus historiales se conservaron y las solicitudes activas quedaron canceladas.");
            });
        },
        guardarUsuario(datos, version) {
            return ejecutar(cuenta => {
                const cuentas = leerLista(base.CLAVES.cuentas), indice = cuentas.findIndex(c => c.id === datos.id && !esCuentaAdministradora(c));
                if (indice < 0) return fallo("La cuenta no está disponible o es administradora.");
                revisarVersion(cuentas[indice], version);
                const nombre = texto(datos.nombre), apellido = texto(datos.apellido), usuario = texto(datos.usuario), correo = texto(datos.correo).toLowerCase();
                if (nombre.length < 2 || nombre.length > 30 || apellido.length < 2 || apellido.length > 30 || !/^[A-Za-z0-9_]{4,16}$/.test(usuario) || !correoPermitido(correo) || correo.length > 100) return fallo("Revisa los datos del perfil. Usa gmail.com, duoc.cl o profesor.uc.cl.");
                if (cuentas.some(c => c.id !== datos.id && (c.correo.toLowerCase() === correo || c.usuario?.toLowerCase() === usuario.toLowerCase()))) return fallo("Ese correo o nombre de usuario ya está ocupado.");
                cuentas[indice] = marcarCambio(cuentas[indice], { nombre, apellido, usuario, correo }, cuenta);
                const clavePerfil = `${base.CLAVES.perfil}__${datos.id}`;
                guardarGrupo({ [base.CLAVES.cuentas]: cuentas, [clavePerfil]: { ...leerObjeto(clavePerfil), nombre, correo } });
                return exito("Datos del usuario actualizados.");
            });
        },
        eliminarUsuario(id, version) {
            return ejecutar(cuenta => {
                const cuentas = leerLista(base.CLAVES.cuentas), objetivo = cuentas.find(c => c.id === id);
                if (!objetivo || esCuentaAdministradora(objetivo) || objetivo.id === cuenta.id) return fallo("Solo puedes eliminar cuentas de usuarios normales.");
                revisarVersion(objetivo, version);
                const cambios = { [base.CLAVES.cuentas]: cuentas.filter(c => c.id !== id) };
                for (const clave of [base.CLAVES.perfil, base.CLAVES.notificaciones, base.CLAVES.preferenciasAdopcion, "peh_compartidos_comunidad"]) cambios[`${clave}__${id}`] = null;
                for (const clave of [base.CLAVES.publicaciones, K.comentarios]) cambios[clave] = leerLista(clave).map(r => r.usuarioId === id ? { ...r, usuarioId: null, autor: "Usuario eliminado", autorEliminado: true } : r);
                const canceladas = new Set();
                cambios[base.CLAVES.adopciones] = leerLista(base.CLAVES.adopciones).map(r => {
                    if (r.usuarioId !== id || !["Pendiente", "En revisión", "Aprobada"].includes(r.estado || "Pendiente")) return r;
                    canceladas.add(r.id);
                    return marcarCambio(r, { estado: "Cancelada", observacionAdmin: "La cuenta solicitante fue eliminada.", historialCambios: historial(r, { estado: "Cancelada" }, cuenta) }, cuenta);
                });
                cambios[base.CLAVES.reservas] = leerLista(base.CLAVES.reservas).map(r => r.usuarioId === id && ["Pendiente", "Confirmada"].includes(r.estado || "Pendiente") ? marcarCambio(r, { estado: "Cancelada", observacionAdmin: "La cuenta responsable fue eliminada.", historialCambios: historial(r, { estado: "Cancelada" }, cuenta) }, cuenta) : r);
                cambios[K.catalogo] = todosAnimales().map(a => canceladas.has(a.solicitudVinculada) && a.estadoPerfil === "en-proceso" ? marcarCambio(a, { estadoPerfil: "disponible", solicitudVinculada: null }, cuenta) : a);
                guardarGrupo(cambios);
                return exito("Cuenta eliminada. Sus procesos activos se cancelaron; los historiales se conservaron y la autoría comunitaria quedó anonimizada.");
            });
        },
        eliminarComentario(id, version) {
            return ejecutar(() => {
                const comentarios = todosComentarios(), objetivo = comentarios.find(c => c.id === id);
                if (!objetivo) return fallo("El comentario ya no está disponible.");
                revisarVersion(objetivo, version);
                const eliminar = new Set([id]);
                let cambio = true;
                while (cambio) { cambio = false; for (const c of comentarios) if (eliminar.has(c.respuestaA) && !eliminar.has(c.id)) { eliminar.add(c.id); cambio = true; } }
                guardarGrupo({ [K.comentarios]: leerLista(K.comentarios).filter(c => !eliminar.has(c.id)), [K.comentariosOcultos]: [...new Set([...leerLista(K.comentariosOcultos), ...eliminar])] });
                return exito(`Comentario eliminado${eliminar.size > 1 ? " junto con sus respuestas" : ""}.`);
            });
        },
        guardarAdopcion(id, datos, version) {
            return ejecutar(cuenta => {
                const solicitudes = leerLista(base.CLAVES.adopciones), indice = solicitudes.findIndex(s => s.id === id);
                if (indice < 0) return fallo("La solicitud ya no está disponible.");
                const registro = solicitudes[indice]; revisarVersion(registro, version);
                const estado = texto(datos.estado), observacionAdmin = texto(datos.observacionAdmin);
                if (!ESTADOS.adopciones.includes(estado) || observacionAdmin.length > 1500) return fallo("Estado u observación no válidos.");
                if (registro.estado === "Completada" && estado !== "Completada") return fallo("Una adopción completada conserva su estado final.");
                if (estado === "Completada" && !["Aprobada", "Completada"].includes(registro.estado)) return fallo("Aprueba la solicitud antes de completar la adopción.");
                const animales = todosAnimales(), animal = animales.find(a => a.slug === registro.animalId || String(a.id) === String(registro.animalId));
                if (["Pendiente", "En revisión", "Aprobada"].includes(estado) && (!animal || animal.eliminado || ["no-visible", "adoptado"].includes(animal.estadoPerfil))) return fallo("Este animal ya no está disponible para mantener una solicitud activa.");
                if (["Aprobada", "Completada"].includes(estado) && !(estado === "Completada" && registro.estado === "Completada")) {
                    if (!leerLista(base.CLAVES.cuentas).some(c => c.id === registro.usuarioId)) return fallo("La cuenta solicitante ya no existe.");
                    if (!animal || animal.eliminado || animal.estadoPerfil === "no-visible") return fallo("El animal ya no está disponible para este proceso.");
                    if (solicitudes.some(s => s.id !== id && referenciaAnimal(s.animalId) === referenciaAnimal(registro.animalId) && ["Aprobada", "Completada"].includes(s.estado))) return fallo("Este animal ya tiene otra solicitud aprobada o completada.");
                }
                const nuevo = marcarCambio(registro, { estado, observacionAdmin, historialCambios: historial(registro, { estado, observacionAdmin }, cuenta) }, cuenta);
                solicitudes[indice] = nuevo;
                const cambios = { [base.CLAVES.adopciones]: solicitudes };
                if (animal && !animal.eliminado) {
                    if (["Aprobada", "Completada"].includes(estado)) { animal.estadoPerfil = estado === "Completada" ? "adoptado" : "en-proceso"; animal.solicitudVinculada = id; }
                    else if (animal.solicitudVinculada === id && animal.estadoPerfil === "en-proceso") { animal.estadoPerfil = "disponible"; animal.solicitudVinculada = null; }
                    cambios[K.catalogo] = animales.map(a => a.id === animal.id ? marcarCambio(animal, {}, cuenta) : a);
                }
                if (estado === "Completada") cambios[base.CLAVES.adopciones] = solicitudes.map(s => s.id !== id && referenciaAnimal(s.animalId) === referenciaAnimal(registro.animalId) && ["Pendiente", "En revisión"].includes(s.estado || "Pendiente") ? marcarCambio(s, { estado: "Rechazada", observacionAdmin: "El animal fue adoptado mediante otra solicitud.", historialCambios: historial(s, { estado: "Rechazada" }, cuenta) }, cuenta) : s);
                guardarGrupo(cambios);
                return exito("Estado de adopción actualizado.");
            });
        },
        guardarReserva(id, datos, version) {
            return ejecutar(cuenta => {
                const reservas = leerLista(base.CLAVES.reservas), indice = reservas.findIndex(r => r.id === id);
                if (indice < 0) return fallo("La reserva ya no está disponible.");
                const registro = reservas[indice]; revisarVersion(registro, version);
                const estado = texto(datos.estado), fecha = texto(datos.fecha), hora = texto(datos.hora), observacionAdmin = texto(datos.observacionAdmin);
                if (!ESTADOS.reservas.includes(estado) || observacionAdmin.length > 1500 || !fechaCita(fecha, hora) || !["09:00", "10:30", "12:00", "15:00", "16:30", "18:00"].includes(hora)) return fallo("Revisa el estado, la fecha y la hora.");
                const activa = ["Pendiente", "Confirmada"].includes(estado);
                if (activa && fechaCita(fecha, hora) <= new Date()) return fallo("Una reserva pendiente o confirmada necesita una fecha y hora futuras.");
                if (activa && reservas.some(r => r.id !== id && r.estado === "Confirmada" && r.fecha === fecha && r.hora === hora)) return fallo("Ese horario ya tiene una atención confirmada. Selecciona otro.");
                if ((fecha !== registro.fecha || hora !== registro.hora) && !observacionAdmin) return fallo("Indica el motivo de la reprogramación en las observaciones.");
                reservas[indice] = marcarCambio(registro, { estado, fecha, hora, observacionAdmin, historialCambios: historial(registro, { estado, fecha, hora, observacionAdmin }, cuenta) }, cuenta);
                guardarGrupo({ [base.CLAVES.reservas]: reservas });
                return exito("Reserva veterinaria actualizada.");
            });
        },
        guardarConsulta(id, datos, version) {
            return ejecutar(cuenta => {
                const consultas = leerLista(K.consultas), indice = consultas.findIndex(c => c.id === id);
                if (indice < 0) return fallo("La consulta ya no está disponible.");
                const registro = consultas[indice]; revisarVersion(registro, version);
                const respuesta = texto(datos.respuesta), respuestas = [...(registro.respuestas || [])];
                let estado = texto(datos.estado || registro.estado);
                if (!ESTADOS.consultas.includes(estado) || respuesta.length > 2000 || (respuesta && respuesta.length < 10)) return fallo("Usa un estado válido y una respuesta de 10 a 2000 caracteres.");
                if (respuesta) { respuestas.push({ id: base.id("RESP"), texto: respuesta, administradorId: cuenta.id, autor: `${cuenta.nombre} ${cuenta.apellido || ""}`.trim(), fechaCreacion: ahora() }); estado = "Respondida"; }
                if (estado === "Respondida" && !respuestas.length) return fallo("Escribe una respuesta antes de marcar la consulta como respondida.");
                consultas[indice] = marcarCambio(registro, { estado, respuestas }, cuenta);
                guardarGrupo({ [K.consultas]: consultas });
                return exito(respuesta ? "Respuesta guardada dentro de PEH." : "Estado de la consulta actualizado.");
            });
        }
    });
    const comentarios = Object.freeze({
        ...base.comentarios,
        esVisible: comentarioVisible,
        listar: id => base.comentarios.listar(id).filter(c => comentarioVisible(c.id)),
        agregar(publicacionId, contenido, respuestaA = null) {
            if (respuestaA && !comentarioVisible(respuestaA)) return null;
            return base.comentarios.agregar(publicacionId, contenido, respuestaA);
        }
    });
    const adopciones = Object.freeze({
        ...base.adopciones,
        guardar(datos) {
            const animal = catalogo.obtener(datos?.animalId);
            if (!animal || animal.estadoPerfil !== "disponible") return null;
            return base.adopciones.guardar(datos);
        }
    });
    // Se prepara únicamente tras comprobar la contraseña de la cuenta fija.
    // Nunca se eleva una cuenta existente que simplemente tenga el mismo correo.
    async function prepararAdministrador(contrasena) {
            const cuentas = leerLista(base.CLAVES.cuentas);
            const existente = cuentas.find(c => c.id === ADMIN_DEMO.id || c.correo?.toLowerCase() === ADMIN_DEMO.correo || c.usuario?.toLowerCase() === ADMIN_DEMO.usuario);
            if (existente) {
                if (!esCuentaAdministradora(existente)) throw new Error("El correo o identificador reservado del administrador ya está ocupado por otra cuenta. Sus datos se conservaron; no se convirtió esa cuenta en administradora.");
                return;
            }
            if (!window.crypto?.subtle || typeof contrasena !== "string") throw new Error("No se pudo comprobar el acceso. Usa localhost o HTTPS.");
            const sal = Uint8Array.from(ADMIN_DEMO.sal.match(/.{2}/g).map(x => parseInt(x, 16)));
            const clave = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(contrasena), "PBKDF2", false, ["deriveBits"]);
            const bits = await window.crypto.subtle.deriveBits({ name: "PBKDF2", salt: sal, iterations: ADMIN_DEMO.iteraciones, hash: "SHA-256" }, clave, 256);
            const calculada = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, "0")).join("");
            if (calculada !== ADMIN_DEMO.claveDerivada) throw new Error("Correo o contraseña incorrectos.");
            // Releer después de la comprobación asíncrona para preservar otras cuentas.
            const actuales = leerLista(base.CLAVES.cuentas);
            const colision = actuales.find(c => c.id === ADMIN_DEMO.id || c.correo?.toLowerCase() === ADMIN_DEMO.correo || c.usuario?.toLowerCase() === ADMIN_DEMO.usuario);
            if (colision) {
                if (esCuentaAdministradora(colision)) return;
                throw new Error("El correo o identificador del administrador ya está ocupado. No se modificó esa cuenta.");
            }
            const cuenta = { ...ADMIN_DEMO, nombre: "Administrador", apellido: "PEH", rol: "ADMIN", administradorPredeterminado: true, fechaRegistro: ahora() };
            // Las conversiones anteriores dejan de otorgar permisos; sus cuentas y datos se conservan.
            guardarGrupo({ [base.CLAVES.cuentas]: [...actuales.map(c => c.rol === "ADMIN" ? { ...c, rol: "USUARIO" } : c), cuenta] });
    }
    const cuentas = Object.freeze({
        ...base.cuentas,
        async iniciarSesion(correoIngresado, contrasena) {
            const correo = texto(correoIngresado).toLowerCase();
            if (!correoPermitido(correo)) return fallo("Usa un correo de gmail.com, duoc.cl o profesor.uc.cl.");
            try {
                if (correo === ADMIN_DEMO.correo) await prepararAdministrador(contrasena);
                return await base.cuentas.iniciarSesion(correo, contrasena);
            } catch (error) { return fallo(error.message || "No se pudo comprobar el acceso."); }
        },
        async registrar(datos) {
            if (!correoPermitido(datos?.correo)) return fallo("Usa un correo de gmail.com, duoc.cl o profesor.uc.cl.");
            if (texto(datos.correo).toLowerCase() === ADMIN_DEMO.correo || texto(datos.usuario).toLowerCase() === ADMIN_DEMO.usuario) return fallo("Ese correo o usuario está reservado para la administración.");
            return base.cuentas.registrar(datos);
        },
        async cambiarContrasena(actual, nueva, confirmar) {
            if (esAdmin()) return fallo("La cuenta administradora usa las credenciales fijas de esta demostración.");
            return base.cuentas.cambiarContrasena(actual, nueva, confirmar);
        }
    });
    const PEH = Object.freeze({ ...base, cuentas, admin, catalogo, consultas, comentarios, adopciones });
    window.addEventListener("peh:actualizado", e => { if (e.detail?.clave === K.catalogo) refrescarCatalogo(); });
    window.addEventListener("storage", e => { if (e.key === K.catalogo || e.key === null) refrescarCatalogo(); });
    catalogo.inicializar(animalesIniciales);
    admin.cargarComentariosDemo(comentariosIniciales);
    return PEH;
}

export function nombreResponsable(registro, nombres) {
  return nombres[registro.usuarioId] || registro.nombreAdoptante || registro.usuarioNombre || (registro.invitado ? "Invitado" : "Cuenta eliminada");
}
