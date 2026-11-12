/* PEH — SERVICIOS GLOBALES
 * Reglas comunes, sesión, persistencia, borradores y catálogo compartido.
 * Los bloques de construcción permanecen privados y conservan las claves existentes.
 */
import { animales } from '../data/global.js';
import { publicacionesDemo } from '../data/comunidad.js';
import { categorias } from '../data/global.js';
import { horarios } from '../data/global.js';


/* VALIDACIÓN COMÚN DE DATOS DE CUENTA Y FORMULARIOS */
export const patronCorreo = /^[A-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:com|cl)$/i;
export const correoValido = valor => String(valor ?? "").trim().length <= 100 && patronCorreo.test(String(valor ?? "").trim());
export function normalizarTelefono(valor) { return String(valor ?? "").trim().replace(/[ ()-]/g, ""); }
export function errorTelefono(valor) {
 const t=normalizarTelefono(valor);
 return /^(?:\+?56)?[2-9]\d{8}$/.test(t) ? "" : "Ingresa un teléfono chileno de 9 dígitos, con +56 opcional.";
}
export function errorComuna(valor) {
 const t=String(valor ?? "").trim();
 return t.length >= 2 && t.length <= 60 && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(t) ? "" : "Ingresa una comuna válida, entre 2 y 60 caracteres.";
}

export function edadDesdeFecha(valor, hoy=new Date()) {
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valor || ""));
 if(!m)return -1;
 const a=Number(m[1]),mes=Number(m[2]),dia=Number(m[3]),fecha=new Date(a,mes-1,dia);
 if(fecha.getFullYear()!==a || fecha.getMonth()!==mes-1 || fecha.getDate()!==dia || fecha>hoy)return -1;
 return hoy.getFullYear()-a-(hoy.getMonth()<mes-1 || (hoy.getMonth()===mes-1&&hoy.getDate()<dia)?1:0);
}
export function errorNombrePersona(valor,maximo=60) {
 const t=String(valor || "").trim();
 return t.length<=maximo && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(t) && (t.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g)||[]).length>=2 ? "" : `Escribe un nombre válido, con al menos 2 letras y un máximo de ${maximo} caracteres.`;
}

/* EDAD ANIMAL — COMPARTIDA POR CATÁLOGO Y ADMINISTRACIÓN */
// edadMeses es la unidad nueva; edad conserva compatibilidad con datos en años.
export function obtenerEdadMeses(animal) {
  if (animal.edadMeses !== undefined && animal.edadMeses !== null && animal.edadMeses !== "") return Number(animal.edadMeses);
  if (animal.edad === undefined || animal.edad === null || animal.edad === "") return NaN;
  return Math.round(Number(animal.edad) * 12);
}
export function edadMesesValida(valor) {
  if (typeof valor !== "number" && typeof valor !== "string") return false;
  if (String(valor).trim() === "") return false;
  const meses = Number(valor);
  return Number.isInteger(meses) && meses >= 0 && meses <= 480 && (meses < 12 || meses % 3 === 0);
}
export function textoEdadMeses(meses) {
  if (!Number.isFinite(meses) || meses < 0) return "Edad por confirmar";
  if (meses === 0) return "Menos de 1 mes";
  if (meses < 12) return meses === 1 ? "1 mes" : `${meses} meses`;
  const anios = Math.floor(meses / 12), resto = Math.floor((meses % 12) / 3) * 3;
  return `${anios} ${anios === 1 ? "año" : "años"}${resto ? ` y ${resto} meses` : ""}`;
}
export const opcionesEdad = [0, ...Array.from({length: 11}, (_, i) => i + 1), ...Array.from({length: 157}, (_, i) => 12 + i * 3)].map(meses => [String(meses), textoEdadMeses(meses)]);

/* FECHA Y HORA DE CHILE — COMPARTIDAS POR RESERVAS E HISTORIALES */
// Funciones puras de fecha y hora de Santiago, compartidas entre procesos.
export function momentoChile(fecha=new Date()) {
 const partes=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(fecha).map(p=>[p.type,p.value]));
 return {fecha:`${partes.year}-${partes.month}-${partes.day}`,hora:`${partes.hour}:${partes.minute}:${partes.second}`};
}
export function fechaLocal(fecha=new Date()) { return momentoChile(fecha).fecha; }
export function horarioFuturo(fecha,hora,ahora=new Date()) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !/^\d{2}:\d{2}$/.test(hora || ''))return false;
 const actual=momentoChile(ahora);
 return `${fecha}T${hora}:00` > `${actual.fecha}T${actual.hora}`;
}
// Convierte la cita civil de Santiago a un instante para ordenar el historial.
export function instanteCitaChile(fecha,hora) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !/^\d{2}:\d{2}$/.test(hora || ''))return null;
 const objetivo=Date.parse(`${fecha}T${hora}:00Z`);if(!Number.isFinite(objetivo))return null;
 let instante=objetivo;
 for(let i=0;i<3;i++) { const local=momentoChile(new Date(instante));const diferencia=objetivo-Date.parse(`${local.fecha}T${local.hora}Z`);instante+=diferencia;if(diferencia===0)break; }
 const cita=new Date(instante),comprobacion=momentoChile(cita);
 return comprobacion.fecha===fecha && comprobacion.hora.slice(0,5)===hora ? cita : null;
}

/* ACCESOINVITADO — REGLAS COMPARTIDAS */
const vistasPublicas = new Set(['inicio', 'animales', 'animal']);

export function vistaPermitidaInvitado(ruta) {
  const pagina = String(ruta || 'inicio').replace(/^#/, '').split('/')[0];
  return vistasPublicas.has(pagina);
}

export function requiereSesion(ruta, sesion) {
  return sesion?.invitado === true && !vistaPermitidaInvitado(ruta);
}

/* REGLASFORMULARIO — REGLAS COMPARTIDAS */
export function mensajeDeCampo(control,formulario) {
  if(!control || control.disabled || control.matches?.(':disabled') || ['hidden','submit','button','reset'].includes(control.type) || control.closest?.('[hidden]'))return '';
  const nombre=control.name||control.id, tipo=control.type, valor=String(control.value??'').trim();
  const lista=Array.from(formulario?.elements||[]);
  if(tipo==='radio')return lista.some(c=>c.name===control.name&&c.required)&&!lista.some(c=>c.name===control.name&&c.checked)?'Selecciona una opción.':'';
  if(tipo==='checkbox')return control.required&&!control.checked?'Debes aceptar esta opción para continuar.':'';
  if(control.required&&!valor)return control.tagName==='SELECT'?'Selecciona una opción.':tipo==='file'?'Selecciona una imagen.':'Completa este campo.';
  if(tipo==='file' && control.files?.length){
    const archivo=control.files[0], aceptados=String(control.accept||'').split(',').map(v=>v.trim()).filter(Boolean);
    if(aceptados.length&&!aceptados.some(t=>t==='image/*'?archivo.type.startsWith('image/'):t===archivo.type))return 'Selecciona una imagen con un formato permitido.';
    const maximo=control.id==='admin-foto'?1:3;
    if(archivo.size>maximo*1024*1024)return `La imagen no puede superar ${maximo} MB.`;
  }
  if(!valor)return '';
  if(control.tagName==='SELECT'&&!Array.from(control.options).some(o=>o.value===control.value&&!o.disabled))return 'Selecciona una opción válida.';
  if((tipo==='email'||/correo/i.test(nombre))&&!correoValido(valor))return 'Ingresa un correo válido con terminación .com o .cl.';
  if(/telefono/i.test(nombre)&&errorTelefono(valor))return errorTelefono(valor);
  if(/comuna/i.test(nombre)&&errorComuna(valor))return errorComuna(valor);
  if(control.minLength>0&&valor.length<control.minLength)return `Escribe al menos ${control.minLength} caracteres.`;
  if(control.maxLength>0&&valor.length>control.maxLength)return `El máximo es de ${control.maxLength} caracteres.`;
  if(tipo==='number'){
    const n=Number(valor);
    if(!Number.isFinite(n))return 'Escribe un número válido.';
    if(control.min!==''&&n<Number(control.min))return `El mínimo permitido es ${control.min}.`;
    if(control.max!==''&&n>Number(control.max))return `El máximo permitido es ${control.max}.`;
    if((control.step===''||control.step==='1')&&!Number.isInteger(n))return 'Escribe un número entero.';
  }
  if(control.pattern){try{if(!new RegExp('^(?:'+control.pattern+')$').test(valor))return 'Revisa el formato de este campo.';}catch{}}
  if(tipo==='password'&&/nueva|^nueva$/.test(nombre)&&!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/.test(valor))return 'Usa al menos 8 caracteres, mayúscula, minúscula, número y símbolo.';
  if(tipo==='password'&&/confirmar/i.test(nombre)){
    const nueva=lista.find(c=>c.name==='nueva'||c.id==='nuevaContrasena');
    if(nueva&&control.value!==nueva.value)return 'Las contraseñas no coinciden.';
  }
  if(control.validity?.badInput)return 'Ingresa un valor válido.';
  if(control.validity?.rangeUnderflow)return `El mínimo permitido es ${control.min}.`;
  if(control.validity?.rangeOverflow)return `El máximo permitido es ${control.max}.`;
  if(control.validity?.customError)return control.validationMessage;
  return '';
}

/* BASE DE ALMACENAMIENTO Y GESTORES: ámbito privado para proteger sus campos internos. */
const base = (() => {
/* ==========================================================
   PEH — PATITAS ESPERANDO UN HOGAR
   BASE LOCAL MULTIUSUARIO

   Frontend + localStorage. No es autenticación de producción.
   Utilizada por la composición de servicios de React.
   No borra ni reasigna registros anteriores.
   ========================================================== */

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

    function ordenarHistorial(registros) {
        return [...registros].sort((a, b) =>
            (Date.parse(b.fechaCreacion || "") || 0) -
            (Date.parse(a.fechaCreacion || "") || 0)
        );
    }

    const validar = Object.freeze({
        requerido: valor => String(valor ?? "").trim().length > 0,
        correo: correoValido,
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
        return lista(CLAVES.cuentas).find(cuenta => cuenta.id === usuarioId && cuenta.activo !== false) || null;
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
            const telefono = normalizarTelefono(datos.telefono), comuna = String(datos.comuna || "").trim();
            if (errorTelefono(telefono) || errorComuna(comuna)) return {ok:false, mensaje:errorTelefono(telefono) || errorComuna(comuna)};

            const edadRegistro=edadDesdeFecha(fechaNacimiento);
            if(edadRegistro<13 || edadRegistro>120)return {ok:false,mensaje:"Ingresa una fecha de nacimiento válida: entre 13 y 120 años."};
            if(errorNombrePersona(nombre,30) || errorNombrePersona(apellido,30))return {ok:false,mensaje:errorNombrePersona(nombre,30) || errorNombrePersona(apellido,30)};
            if (!nombre || !apellido || !/^[A-Za-z0-9_]{4,16}$/.test(usuario) ||
                !validar.correo(correo) ||
                !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/.test(contrasena)) {
                return { ok: false, mensaje: "Revisa los datos del registro." };
            }
            const existentes = lista(CLAVES.cuentas);
            if (existentes.some(c => c.correo.toLowerCase() === correo)) {
                return { ok: false, mensaje: "Este correo ya está registrado." };
            }
            if (existentes.some(c => String(c.usuario || "").toLowerCase() === usuario.toLowerCase())) {
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
                    fechaNacimiento, telefono, comuna, sal: salHex, iteraciones, claveDerivada,
                    fechaRegistro: new Date().toISOString()
                };
                // Releer antes de guardar para evitar duplicados simples.
                const actuales = lista(CLAVES.cuentas);
                if (actuales.some(c => c.correo.toLowerCase() === correo ||
                    String(c.usuario || "").toLowerCase() === usuario.toLowerCase())) {
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
            const cuenta = lista(CLAVES.cuentas).find(c => c.correo === correo && c.activo !== false);
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
            if (datos?.telefono !== undefined && datos.telefono !== "" && errorTelefono(datos.telefono)) return false;
            if (datos?.comuna !== undefined && datos.comuna !== "" && errorComuna(datos.comuna)) return false;
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

    const PEH = Object.freeze({
        CLAVES, leer, escribir, eliminar, lista, id,
        ordenarHistorial, validar, sesion, cuentas,
        adopciones, reservas, publicaciones, comentarios, compartidos, perfil, preferencias,
        validarRequeridos: validar.requeridos,
        limpiarPreferencias: preferencias.limpiar
    });

    console.info("[PEH] Núcleo global V3 multiusuario cargado.");
return PEH;
})();

/* MOTOR COMPARTIDO DE DATOS LOCALES
 * Catálogo, cuentas y trámites son consumidos por varias vistas.
 * Las comprobaciones de cada formulario permanecen en su servicio de vista.
 */
// Construye el conjunto local: catálogo, cuentas, trámites y gestión administrativa.
// Recibe la base privada y conserva las claves y reglas de persistencia.
function crearServiciosLocales(base, animalesIniciales, comentariosIniciales = []) {
    const K = Object.freeze({
        catalogo: "peh_catalogo_admin_v1",
        comentarios: "peh_comentarios_comunidad",
        comentariosOcultos: "peh_comentarios_moderados_v1",
        consultas: "peh_consultas_contacto"
    });
    const ESTADOS = Object.freeze({
        animales: ["disponible", "en-proceso", "adoptado", "no-visible"],
        adopciones: ["Pendiente", "En revisión", "Aprobada", "Rechazada", "Completada", "Cancelada"],
        reservas: ["Confirmada", "Cerrada", "Cancelada"],
        consultas: ["Pendiente", "En revisión", "Respondida", "Cerrada", "Cancelada"]
    });
    // Cuenta fija de demostración: su identidad es independiente de las cuentas normales.
    const ADMIN_DEMO = Object.freeze({
        id: "PEH-ADMIN-DEMO", correo: "adminp@gmail.com", usuario: "peh_admin_demo",
        sal: "cef63670a7445fd44cc8d0bec68a0b64", claveDerivada: "b31d108fc7d93a4dd06ab125d9a6d9caad9a004104860b59305ea116a7e8d17c", iteraciones: 120000
    });
    const correoPermitido = correoValido;
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
            return copia(todosAnimales().find(a => !a.eliminado && a.estadoPerfil !== "no-visible" && (String(a.id) === String(identificador) || a.slug === identificador)) || null);
        }
    });
    function fechaCita(fecha, hora) { return instanteCitaChile(fecha,hora); }
    function marcarCambio(registro, cambios, admin) {
        return { ...registro, ...cambios,
          ...(cambios.estado && cambios.estado !== registro.estado ? {fechaEstado:ahora()} : {}),
          fechaActualizacion: ahora(), actualizadoPor: admin.id, revision: base.id("REV") };
    }
    function historial(registro, cambios, admin) {
        return [...(registro.historialCambios || []), { ...cambios, fechaCreacion: ahora(), administradorId: admin.id }];
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
                if (!edadMesesValida(datos.edadMeses)) return fallo("Selecciona una edad válida: meses antes del año e intervalos de 3 meses después (máximo 40 años).");
                const edadMeses = Number(datos.edadMeses);
                const edadMaxima = especie === "perro" ? 30 : 40;
                if (edadMeses > edadMaxima * 12) return fallo(`La edad máxima permitida para ${especie === "perro" ? "perros" : "gatos"} es de ${edadMaxima} años.`);
                const edad = edadMeses / 12, diasEsperando = Number(datos.diasEsperando);
                const historia = Array.isArray(datos.historia) ? datos.historia.map(texto).filter(Boolean) : texto(datos.historia).split(/\n\s*\n/).filter(Boolean);
                const cuidados = texto(datos.cuidados);
                if (nombre.length < 2 || nombre.length > 50 || !["perro", "gato"].includes(especie) || !["macho", "hembra"].includes(sexo) || !["pequeno", "mediano", "grande"].includes(tamano) || comuna.length < 2 || comuna.length > 60 || !Number.isFinite(edad) || edad < 0 || edad > 40 || !Number.isInteger(diasEsperando) || diasEsperando < 0 || historia.length < 1 || historia.length > 10 || historia.some(p => p.length > 2000) || cuidados.length < 1 || cuidados.length > 2000) return fallo("Revisa los datos del animal: nombre, edad, ubicación, historia y cuidados.");
                const estadoPerfil = texto(datos.estadoPerfil || "disponible");
                if (!ESTADOS.animales.includes(estadoPerfil)) return fallo("Estado del animal no válido.");
                const vinculada = leerLista(base.CLAVES.adopciones).find(s => (s.animalId === existente?.slug || String(s.animalId) === String(existente?.id)) && ["Aprobada", "Completada"].includes(s.estado));
                if (vinculada && estadoPerfil !== (vinculada.estado === "Completada" ? "adoptado" : "en-proceso")) return fallo("Este estado depende de una adopción aprobada o completada. Gestiona primero esa solicitud.");
                const imagen = texto(datos.imagen || existente?.imagen).replace(/^\.\.\/img\//, "/img/");
                if (!imagen || imagen.length > 4400000 || (!/^https:\/\/[^<>\s]+$/i.test(imagen) && !/^(?:\/?img\/[^<>]+\.(?:jpg|jpeg|png|webp|avif|gif)|data:image\/(?:jpeg|png|webp|avif|gif);base64,[A-Za-z0-9+/=]+)$/i.test(imagen))) return fallo("Selecciona una fotografía PNG, JPG o GIF de hasta 3 MB, o una URL HTTPS válida.");
                const id = existente?.id || base.id("ANI");
                const slug = texto(datos.slug) || existente?.slug || `${normalizar(nombre).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "animal"}-${String(id).slice(-8)}`;
                if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || animales.some(a => a.id !== id && a.slug === slug)) return fallo("Ese identificador de animal no es válido o ya está ocupado.");
                const personalidad = (Array.isArray(datos.personalidad) ? datos.personalidad : texto(datos.personalidad).split(",")).map(texto).filter(Boolean);
                if (personalidad.length > 15 || personalidad.some(p => p.length > 100)) return fallo("Personalidad: máximo 15 elementos de 100 caracteres.");
                const animal = marcarCambio({ ...existente, id, slug, fechaCreacion: existente?.fechaCreacion || ahora() }, {
                    nombre, especie, sexo, edad, edadMeses, tamano, comuna, comunaValor: normalizar(comuna).replace(/[^a-z0-9]+/g, "-"), diasEsperando, historia, cuidados, imagen, personalidad,
                    hogar: (datos.hogar || []).filter(h => ["casa", "departamento", "espacio-amplio"].includes(h)),
                    convivencia: (datos.convivencia || []).filter(c => ["ninos", "perros", "gatos"].includes(c)), estadoPerfil
                }, cuenta);
                const cambiosCatalogo = { [K.catalogo]: [...animales.filter(a => String(a.id) !== String(id)), animal] };
                if (existente && existente.slug !== slug) cambiosCatalogo[base.CLAVES.adopciones] = leerLista(base.CLAVES.adopciones).map(s => s.animalId === existente.slug ? { ...s, animalId: id, animalSlug: slug } : s);
                guardarGrupo(cambiosCatalogo);
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
                guardarGrupo({ [K.catalogo]: animales.map(a => a.id === animal.id ? marcarCambio(a, { estadoPerfil: "no-visible" }, cuenta) : a), [base.CLAVES.adopciones]: solicitudes });
                return exito("Perfil retirado. Sus historiales se conservaron y las solicitudes activas quedaron canceladas.");
            });
        },
        guardarUsuario(datos, version) {
            return ejecutar(cuenta => {
                const cuentas = leerLista(base.CLAVES.cuentas), indice = cuentas.findIndex(c => c.id === datos.id && !esCuentaAdministradora(c));
                if (indice < 0) return fallo("La cuenta no está disponible o es administradora.");
                revisarVersion(cuentas[indice], version);
                const nombre = texto(datos.nombre), apellido = texto(datos.apellido), usuario = texto(datos.usuario), correo = texto(datos.correo).toLowerCase();
                if (nombre.length < 2 || nombre.length > 30 || apellido.length < 2 || apellido.length > 30 || !/^[A-Za-z0-9_]{4,16}$/.test(usuario) || !correoPermitido(correo) || correo.length > 100) return fallo("Revisa los datos del perfil. Usa terminación .com o .cl, como duocuc.cl o profesor.duocuc.cl.");
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
                const cambios = { [base.CLAVES.cuentas]: cuentas.map(c => c.id === id ? { ...c, activo: false, claveDerivada: "!desactivada", sal: "", foto: null } : c) };
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
                if (["Completada", "Rechazada", "Cancelada"].includes(registro.estado) && estado !== registro.estado) return fallo("Una adopción completada conserva su estado final.");
                if (estado === "Completada" && !["Aprobada", "Completada"].includes(registro.estado)) return fallo("Aprueba la solicitud antes de completar la adopción.");
                const animales = todosAnimales(), animal = animales.find(a => a.slug === registro.animalId || String(a.id) === String(registro.animalId));
                if (["Pendiente", "En revisión", "Aprobada"].includes(estado) && (!animal || animal.eliminado || ["no-visible", "adoptado"].includes(animal.estadoPerfil))) return fallo("Este animal ya no está disponible para mantener una solicitud activa.");
                if (["Aprobada", "Completada"].includes(estado) && !(estado === "Completada" && registro.estado === "Completada")) {
                    if (!leerLista(base.CLAVES.cuentas).some(c => c.id === registro.usuarioId && c.activo !== false)) return fallo("La cuenta solicitante ya no existe.");
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
                const fechaAtencion=texto(datos.fechaAtencion||registro.fechaAtencion||fecha),horaTermino=texto(datos.horaTermino||registro.horaTermino);
                const conclusionConsulta=texto(datos.conclusionConsulta??registro.conclusionConsulta),recomendacionesVeterinario=texto(datos.recomendacionesVeterinario??registro.recomendacionesVeterinario);
                if(conclusionConsulta.length>2000||recomendacionesVeterinario.length>2000)return fallo('La conclusión y las recomendaciones permiten hasta 2000 caracteres.');
                if(estado==='Cerrada'){
                  const fin=fechaCita(fechaAtencion,horaTermino),inicio=fechaCita(fecha,hora);
                  if(!fin||!inicio||fin<inicio||fin>new Date())return fallo('Indica la fecha de atención y hora de término válidas, posteriores al inicio y no futuras.');
                  if(!conclusionConsulta||!recomendacionesVeterinario)return fallo('Completa la conclusión de la consulta y las recomendaciones del veterinario.');
                }
                if (!ESTADOS.reservas.includes(estado) || observacionAdmin.length > 1500 || !fechaCita(fecha, hora) || !horarios.includes(hora)) return fallo("Revisa el estado, la fecha y la hora.");
                const finalAnterior={Completada:'Cerrada',Cerrada:'Cerrada',Cancelada:'Cancelada',Rechazada:'Cancelada'}[registro.estado];
                if(finalAnterior&&estado!==finalAnterior)return fallo('Una reserva finalizada conserva su estado final.');
                const activa = ["Pendiente", "Confirmada"].includes(estado);
                if (activa && fechaCita(fecha, hora) <= new Date()) return fallo("Una reserva pendiente o confirmada necesita una fecha y hora futuras.");
                if (activa && reservas.some(r => r.id !== id && r.usuarioId === registro.usuarioId && ["Pendiente","Confirmada"].includes(r.estado) && normalizar(r.mascotaNombre) === normalizar(registro.mascotaNombre) && r.fecha === fecha && r.hora === hora)) return fallo("Ya existe una reserva activa para esta mascota en la misma fecha y hora.");
                if (activa && reservas.some(r => r.id !== id && r.estado === "Confirmada" && r.fecha === fecha && r.hora === hora)) return fallo("Ese horario ya tiene una atención confirmada. Selecciona otro.");
                if ((fecha !== registro.fecha || hora !== registro.hora) && !observacionAdmin) return fallo("Indica el motivo de la reprogramación en las observaciones.");
                reservas[indice] = marcarCambio(registro, { estado, fecha, hora, observacionAdmin, fechaAtencion, horaTermino, conclusionConsulta, recomendacionesVeterinario, historialCambios: historial(registro, { estado, fecha, hora, observacionAdmin, ...(estado==='Cerrada'?{fechaAtencion,horaTermino,conclusionConsulta,recomendacionesVeterinario}:{}) }, cuenta) }, cuenta);
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
                consultas[indice] = marcarCambio(registro, { estado, respuestas, ...(respuesta?{fechaEstado:ahora()}:{}), historialCambios: historial(registro, {estado}, cuenta) }, cuenta);
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
        actualizarPerfil(datos) {
            try {
                const sesion=base.sesion.obtener();
                if(!sesion?.id || sesion.invitado)return fallo("Inicia sesión para editar tu cuenta.");
                const cuentas=leerLista(base.CLAVES.cuentas), indice=cuentas.findIndex(c=>c.id===sesion.id);
                if(indice<0)return fallo("No encontramos tu cuenta.");
                const nombre=texto(datos.nombre),correo=texto(datos.correo).toLowerCase(),telefono=normalizarTelefono(datos.telefono),comuna=texto(datos.comuna);
                if(errorNombrePersona(nombre))return fallo(errorNombrePersona(nombre));
                if(!correoValido(correo))return fallo("Ingresa un correo válido con terminación .com o .cl.");
                if(errorTelefono(telefono) || errorComuna(comuna))return fallo(errorTelefono(telefono) || errorComuna(comuna));
                if(esCuentaAdministradora(cuentas[indice]) && correo!==cuentas[indice].correo)return fallo("El correo de la cuenta administradora es fijo.");
                if(cuentas.some(c=>c.id!==sesion.id && texto(c.correo).toLowerCase()===correo))return fallo("Ese correo ya pertenece a otra cuenta.");
                cuentas[indice]=marcarCambio(cuentas[indice],{nombre,...(datos.apellido!==undefined?{apellido:datos.apellido}:{}),correo,telefono,comuna},sesion);
                const clavePerfil=base.CLAVES.perfil+"__"+sesion.id;
                guardarGrupo({[base.CLAVES.cuentas]:cuentas,[clavePerfil]:{...leerObjeto(clavePerfil),nombre,...(datos.apellido!==undefined?{apellido:datos.apellido}:{}),...(datos.foto!==undefined?{foto:datos.foto}:{}),correo,telefono,comuna}});
                return exito("Perfil actualizado correctamente.");
            }catch(error){return fallo(error.message || "No fue posible guardar los cambios.");}
        },
        async iniciarSesion(correoIngresado, contrasena) {
            const correo = texto(correoIngresado).toLowerCase();
            if (!correoPermitido(correo)) return fallo("Usa un correo de terminación .com o .cl, como duocuc.cl o profesor.duocuc.cl.");
            try {
                if (correo === ADMIN_DEMO.correo) await prepararAdministrador(contrasena);
                return await base.cuentas.iniciarSesion(correo, contrasena);
            } catch (error) { return fallo(error.message || "No se pudo comprobar el acceso."); }
        },
        async registrar(datos) {
            if (!correoPermitido(datos?.correo)) return fallo("Usa un correo de terminación .com o .cl, como duocuc.cl o profesor.duocuc.cl.");
            if (texto(datos.correo).toLowerCase() === ADMIN_DEMO.correo || texto(datos.usuario).toLowerCase() === ADMIN_DEMO.usuario) return fallo("Ese correo o usuario está reservado para la administración.");
            return base.cuentas.registrar(datos);
        },
        async cambiarContrasena(actual, nueva, confirmar) {
            
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

/* PUBLICACIONES Y COMENTARIOS — COMUNIDAD Y ADMINISTRACIÓN */
// Operaciones de publicaciones y comentarios; dependencias recibidas al construir PEH.
function crearComunidadLocal(local, {exigirUsuario, guardar, leerLista}) {
const K_COMENTARIOS = 'peh_comentarios_comunidad';
function publicacionesDisponibles() { return local.publicaciones.listar(); }
function comprobarPublicacion(id) {
  const p = publicacionesDisponibles().find(p => p.id === id);
  if (!p) throw Object.assign(new Error('Esta publicación ya no está disponible.'), { estado: 404 });
  return p;
}
function comprobarAutor(registro) {
  const s = exigirUsuario();
  if (registro.usuarioId !== s.id && s.rol !== 'ADMIN') throw Object.assign(new Error('Solo el autor o administración pueden realizar esta acción.'), { estado: 403 });
  return s;
}
const publicaciones = Object.freeze({
  ...local.publicaciones,
  agregar(datos) {
    exigirUsuario();
    const contenido = String(datos?.contenido ?? datos?.texto ?? '').trim();
    if (contenido.length < 10 || contenido.length > 500 || !Object.hasOwn(categorias, datos?.categoria)) return null;
    return local.publicaciones.agregar({contenido, ...(Object.hasOwn(datos,'texto')?{texto:contenido}:{}), categoria:datos.categoria, ubicacion:String(datos.ubicacion || '').trim(), imagen:datos.imagen || null});
  },
  editar(id, datos) {
    const p = comprobarPublicacion(id); comprobarAutor(p);
    const cambios = {contenido:datos.contenido, categoria:datos.categoria, ubicacion:datos.ubicacion, imagen:datos.imagen};
    const nueva = {...p, ...cambios, fechaActualizacion:new Date().toISOString()};
    guardar(local.CLAVES.publicaciones, leerLista(local.CLAVES.publicaciones).map(r => r.id === id ? nueva : r));
    return nueva;
  },
  eliminar(id) {
    try {
      const p = comprobarPublicacion(id); comprobarAutor(p);
      // Conserva ambos conjuntos si el navegador rechaza alguna escritura.
      const anteriores = [local.CLAVES.publicaciones, K_COMENTARIOS].map(k => [k,localStorage.getItem(k)]);
      try {
        localStorage.setItem(local.CLAVES.publicaciones, JSON.stringify(leerLista(local.CLAVES.publicaciones).filter(r => r.id !== id)));
        localStorage.setItem(K_COMENTARIOS, JSON.stringify(leerLista(K_COMENTARIOS).filter(c => c.publicacionId !== id)));
      } catch (error) {
        for (const [k,v] of anteriores) { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k,v); }
        throw error;
      }
      for (const [clave] of anteriores) window.dispatchEvent(new CustomEvent('peh:actualizado',{detail:{clave}}));
      return true;
    } catch { return false; }
  }
});
const comentarios = Object.freeze({
  ...local.comentarios,
  editar(id, texto) {
    const todos = leerLista(K_COMENTARIOS), c = todos.find(c => c.id === id);
    if (!c) throw new Error('Este comentario ya no está disponible.');
    comprobarAutor(c);
    texto = String(texto ?? '').trim();
    if (!texto || texto.length > 200) throw new Error('Escribe entre 1 y 200 caracteres.');
    const nuevo = {...c, texto, fechaActualizacion:new Date().toISOString()};
    guardar(K_COMENTARIOS, todos.map(r => r.id === id ? nuevo : r));
    return nuevo;
  },
  eliminar(id) {
    const todos = leerLista(K_COMENTARIOS), c = todos.find(c => c.id === id);
    if (!c) throw Object.assign(new Error('Este comentario ya no está disponible.'),{estado:404});
    comprobarAutor(c);
    const borrar = new Set([id]);
    {
      let cambio = true;
      while (cambio) { cambio=false; for (const r of todos) if (borrar.has(r.respuestaA) && !borrar.has(r.id)) { borrar.add(r.id); cambio=true; } }
    }
    guardar(K_COMENTARIOS,todos.filter(r => !borrar.has(r.id)).map(r => borrar.has(r.respuestaA) ? {...r,respuestaA:null} : r));
  }
});
 return {publicaciones, comentarios};
}

/* CONSULTAS — CONTACTO, PERFIL Y ADMINISTRACIÓN */
// Operaciones de contacto para usuarios, independientes de la vista administrativa.
function crearConsultasLocales(local, {obtenerSesion, exigirUsuario, guardar, leerLista}) {
const consultas = Object.freeze({
  ...local.consultas,
  cancelar(id) {
    const s = exigirUsuario(), clave = 'peh_consultas_contacto';
    const lista = leerLista(clave), c = lista.find(c => c.id === id && c.usuarioId === s.id);
    if (!c) throw new Error('Esta consulta ya no está disponible.');
    if (!['Pendiente','En revisión'].includes(c.estado)) throw new Error('Esta consulta ya no se puede cancelar.');
    const fecha = new Date().toISOString();
    const nueva = {...c, estado:'Cancelada', fechaEstado:fecha, fechaActualizacion:fecha,
      historialCambios:[...(c.historialCambios || []), {estado:'Cancelada', fechaCreacion:fecha}]};
    guardar(clave, lista.map(r => r.id === id ? nueva : r));
    return nueva;
  },
  registrar(datos) {
    const s=obtenerSesion();
    if(!s || s.invitado)return {ok:false,mensaje:'Debes iniciar sesión para registrar una consulta.'};
    return local.consultas.registrar(datos);
  }
});
 return consultas;
}

/* SESIÓN Y ACCESO COMÚN A LAS OPERACIONES LOCALES */
const comentariosDemo = publicacionesDemo.flatMap(p => (p.comentarios || []).map(c => ({ ...c, demo: true, autor: c.autor.replace(/:$/, '') })));
const local = crearServiciosLocales(base, animales, comentariosDemo);
export const EVENTO_SESION = 'peh:sesion-local';
export const emitirSesion = () => window.dispatchEvent(new Event(EVENTO_SESION));
export function obtenerSesion() {
  const s = local.sesion.obtener();
  if (!s || s.invitado) return s;
  const cuenta = local.cuentas.obtenerPorId(s.id);
  if (!cuenta || cuenta.activo === false) return null;
  const perfil = local.perfil.obtener();
  return { ...cuenta, ...perfil, id: cuenta.id, usuarioId: cuenta.id, invitado: false,
    origen: 'local', rol: local.admin.esAdmin() ? 'ADMIN' : 'USUARIO' };
}
export const tieneSesion = () => Boolean(obtenerSesion() && !obtenerSesion().invitado);
export function limpiarSesion() {
  if (!local.sesion.cerrar()) throw new Error('No pudimos cerrar la sesión. Inténtalo nuevamente.');
  emitirSesion();
}
export async function verificarSesion() { return obtenerSesion(); }
export async function cerrarSesionLocal() { limpiarSesion(); }

// La vista decide cómo navegar y mostrar errores; el servicio prepara la sesión.



function exigirUsuario() {
  const s = obtenerSesion();
  if (!s || s.invitado) throw Object.assign(new Error('Inicia sesión para continuar.'), { estado: 401 });
  return s;
}
function guardar(clave, datos) {
  if (!base.escribir(clave, datos)) throw new Error('No pudimos guardar los cambios. Revisa el espacio disponible del navegador.');
}
function leerLista(clave) {
  const crudo = localStorage.getItem(clave);
  if (crudo === null) return [];
  const datos = JSON.parse(crudo);
  if (!Array.isArray(datos)) throw new Error('Los datos guardados no tienen el formato esperado.');
  return datos;
}
const dependencias = {obtenerSesion, exigirUsuario, guardar, leerLista};
const {publicaciones, comentarios} = crearComunidadLocal(local, dependencias);
const consultas = crearConsultasLocales(local, dependencias);
const PEH = Object.freeze({...local, publicaciones, comentarios, consultas,
  sesion:Object.freeze({...local.sesion, obtener:obtenerSesion, cerrar:()=>{
    const ok=local.sesion.cerrar();if(ok)emitirSesion();return ok;
  }})
});

/* BORRADORES — USADO DESDE VARIAS VISTAS */
// Se conserva la clave histórica de Veterinaria para recuperar los borradores existentes.
const prefijosHeredados = { veterinaria: 'peh_borrador_veterinaria_v1:' };
const omitidos = /contrasen|password|clave|^sal$|^iteraciones$|^actual$|^nueva$|^confirmar$|token/i;
export function limpiarBorrador(valor) {
  if (Array.isArray(valor)) return valor.map(limpiarBorrador);
  if (valor && typeof valor === 'object') return Object.fromEntries(Object.entries(valor).filter(([k]) => !omitidos.test(k) && !['__proto__','constructor','prototype'].includes(k)).map(([k,v])=>[k,limpiarBorrador(v)]));
  return ['string','number','boolean'].includes(typeof valor) || valor === null ? valor : null;
}
export function claveBorrador(formulario) {
  const usuario = PEH.sesion.obtener();
  if(usuario?.invitado)return null;
  if(!usuario?.id && formulario!=="acceso-registro")return null;
  if (Object.hasOwn(prefijosHeredados, formulario)) return prefijosHeredados[formulario] + encodeURIComponent(usuario.id);
  return 'peh_borrador_v2:' + encodeURIComponent(usuario?.id || 'acceso-local') + ':' + encodeURIComponent(formulario);
}
function clavePermitida(clave) {
  const usuario=PEH.sesion.obtener();
  if(!clave || typeof clave!=="string" || usuario?.invitado)return false;
  if(!usuario?.id)return clave==='peh_borrador_v2:acceso-local:acceso-registro';
  return clave.startsWith('peh_borrador_v2:'+encodeURIComponent(usuario.id)+':') ||
    Object.values(prefijosHeredados).some(prefijo => clave === prefijo + encodeURIComponent(usuario.id));
}
export function leerBorrador(clave) {
  if(!clavePermitida(clave))return undefined;
  try { const texto=localStorage.getItem(clave); return texto === null ? undefined : limpiarBorrador(JSON.parse(texto)); } catch { return undefined; }
}
export function guardarBorrador(clave, datos) {
  if(!clavePermitida(clave))return false;
  try {localStorage.setItem(clave,JSON.stringify(limpiarBorrador(datos)));return true;}catch{return false;}
}
export function borrarBorrador(clave) {
  const accesoLocal=clave==='peh_borrador_v2:acceso-local:acceso-registro' && !PEH.sesion.obtener()?.invitado;
  if(!clavePermitida(clave) && !accesoLocal)return false;
  try {localStorage.removeItem(clave);return true;}catch{return false;}
}

/* CATALOGO — USADO DESDE VARIAS VISTAS */
export function formatearSexo(sexo) {

    if (sexo === "macho") {
        return "Macho";
    }

    if (sexo === "hembra") {
        return "Hembra";
    }

    return sexo;

}

export function formatearEdad(edad) {
 return textoEdadMeses(obtenerEdadMeses(typeof edad === "object" && edad !== null ? edad : {edad}));
}

export function formatearTamano(tamano) {

    const tamanos = {

        pequeno: "Pequeño",

        mediano: "Mediano",

        grande: "Grande"

    };


    return tamanos[tamano] || tamano;

}

export function formatearEspecie(animal) {

    if (animal.especie === "perro") {
        return "Perro";
    }

    if (animal.especie === "gato") {
        return "Gato";
    }

    if (animal.tipo) {

        return animal.tipo
            .charAt(0)
            .toUpperCase()
            + animal.tipo.slice(1);

    }

    return "Animal";

}

export function animalesConMasEspera(animales) {
 return [...animales].sort((a,b) => b.diasEsperando - a.diasEsperando).slice(0,4);
}

// La fuente es el catálogo local, incluyendo las modificaciones de administración.
let estadoCatalogo={animales:[],cargando:true,error:''};
const oyentesCatalogo=new Set();let consumidoresCatalogo=0;
export const obtenerEstadoCatalogo=()=>estadoCatalogo;
export function suscribirCatalogo(fn){oyentesCatalogo.add(fn);return ()=>oyentesCatalogo.delete(fn);}
export async function cargarCatalogo(){
 try{
  const animales=PEH.catalogo.listar().map(a=>({...a,edadMeses:obtenerEdadMeses(a),estadoPerfil:a.estadoPerfil||'disponible'}));
  estadoCatalogo={animales,cargando:false,error:''};
 }catch(error){estadoCatalogo={animales:[],cargando:false,error:error.message};}
 oyentesCatalogo.forEach(fn=>fn());return estadoCatalogo.animales;
}
const refrescarCatalogoLocal=()=>{void cargarCatalogo();};
export function activarCatalogo(){
 consumidoresCatalogo++;
 if(consumidoresCatalogo===1){window.addEventListener('peh:catalogo',refrescarCatalogoLocal);window.addEventListener('storage',refrescarCatalogoLocal);}
 void cargarCatalogo();
 return ()=>{if(--consumidoresCatalogo===0){window.removeEventListener('peh:catalogo',refrescarCatalogoLocal);window.removeEventListener('storage',refrescarCatalogoLocal);}};
}
export async function obtenerAnimal(identificador){
 const a=PEH.catalogo.obtener(identificador);
 if(!a)throw Object.assign(new Error('Este animal ya no está disponible.'),{estado:404});
 return {...a,edadMeses:obtenerEdadMeses(a),estadoPerfil:a.estadoPerfil||'disponible'};
}

/* Estado veterinario compartido por Perfil y Administración. */
export function estadoReserva(estado){const valor=String(estado||"Pendiente").trim().toLowerCase();const estados={pendiente:["Confirmada","confirmada"],confirmada:["Confirmada","confirmada"],"en revisión":["En revisión","revision"],"en revision":["En revisión","revision"],completada:["Cerrada","cerrada"],cerrada:["Cerrada","cerrada"],cancelada:["Cancelada","cancelada"],rechazada:["Rechazada","rechazada"]};const [texto,clase]=estados[valor]||[estado||"Pendiente","desconocido"];return {texto,clase};}

export default PEH;
