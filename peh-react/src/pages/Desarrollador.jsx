import { useCallback, useEffect, useRef, useState } from "react";
import PEH from "../services/peh";
import TablaAdmin from "../components/TablaAdmin";
import { nombreResponsable } from "../services/administracion";
import FormulariosAdmin from "../components/FormulariosAdmin";
import "../styles/desarrollador.css";

const secciones = [
  ["resumen", "⌂", "Resumen"], ["animales", "🐾", "Animales"], ["usuarios", "♙", "Usuarios"],
  ["comentarios", "☏", "Comentarios"], ["adopciones", "♡", "Adopciones"], ["reservas", "▣", "Reservas veterinarias"], ["consultas", "✉", "Consultas de contacto"]
];
const titulos = { animales: "Perfiles de animales", usuarios: "Cuentas de usuarios", comentarios: "Comentarios de la comunidad", adopciones: "Solicitudes de adopción", reservas: "Reservas veterinarias", consultas: "Consultas de contacto" };
const descripciones = { animales: "Agrega y actualiza la información que aparece en el catálogo.", usuarios: "Consulta sus datos básicos, edita su perfil o elimina una cuenta de usuario.", comentarios: "Revisa los comentarios y sus respuestas, y elimina contenido cuando sea necesario.", adopciones: "Revisa cada solicitud, registra observaciones y actualiza su estado.", reservas: "Confirma atenciones, reprograma su fecha y hora o registra su finalización.", consultas: "Lee las consultas registradas y guarda tus respuestas como administrador." };
const version = r => r.revision || r.fechaActualizacion || r.fechaCreacion || r.fechaRegistro || "";
const normalizar = valor => String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function cargar() {
  const vacios = Object.fromEntries(secciones.slice(1).map(([tipo]) => [tipo, []]));
  try {
    if (!PEH.admin.esAdmin()) return { autorizado: false, datos: vacios, nombres: {}, error: "" };
    return { autorizado: true, datos: Object.fromEntries(secciones.slice(1).map(([tipo]) => [tipo, PEH.admin.listar(tipo).sort((a, b) => String(b.fechaCreacion || b.fechaRegistro || "").localeCompare(String(a.fechaCreacion || a.fechaRegistro || "")))])), nombres: PEH.admin.nombresUsuarios(), error: "" };
  } catch (error) { return { autorizado: PEH.admin.esAdmin(), datos: vacios, nombres: {}, error: error.message }; }
}

export default function Desarrollador({ onCerrarSesion }) {
  const [estado, setEstado] = useState(cargar), [seccion, setSeccion] = useState("resumen");
  const [filtros, setFiltros] = useState({}), [modal, setModal] = useState(null), [mensaje, setMensaje] = useState("");
  const contenido = useRef(null);
  const refrescar = useCallback(() => { const nuevo = cargar(); setEstado(nuevo); if (!nuevo.autorizado) setModal(null); }, []);
  useEffect(() => {
    document.body.classList.add("pagina-desarrollador"); document.title = "Administración | PEH";
    const actualizar = () => refrescar();
    window.addEventListener("peh:actualizado", actualizar); window.addEventListener("storage", actualizar); window.addEventListener("focus", actualizar);
    return () => { document.body.classList.remove("pagina-desarrollador"); window.removeEventListener("peh:actualizado", actualizar); window.removeEventListener("storage", actualizar); window.removeEventListener("focus", actualizar); };
  }, [refrescar]);
  const { autorizado, datos, nombres, error } = estado;
  function ir(tipo) { setSeccion(tipo); contenido.current?.focus({ preventScroll: true }); }
  function filtrar(campo, valor) { setFiltros(actual => ({ ...actual, [seccion]: { ...actual[seccion], [campo]: valor } })); }
  function abrir(tipo, registro) { setModal({ tipo, registro: registro ? JSON.parse(JSON.stringify(registro)) : null }); }
  function confirmar(titulo, texto, operacion) { setModal({ tipo: "confirmacion", titulo, texto, operacion }); }
  function accion(nombre, r) {
    if (nombre === "ver-animal") { window.open(`${location.pathname}#animal/${encodeURIComponent(r.slug)}`, "_blank", "noopener"); return; }
    if (nombre === "ver-comentario") { window.open(`${location.pathname}#comunidad/todas/${encodeURIComponent(r.publicacionId)}`, "_blank", "noopener"); return; }
    if (nombre === "editar-animal") abrir("animal", r);
    if (nombre === "editar-usuario") abrir("usuario", r);
    if (nombre === "gestionar-adopcion") abrir("adopcion", r);
    if (nombre === "gestionar-reserva") abrir("reserva", r);
    if (nombre === "gestionar-consulta") abrir("consulta", r);
    if (nombre === "eliminar-animal") confirmar("Eliminar perfil del animal", `Se retirará a ${r.nombre} del catálogo y se cancelarán sus solicitudes activas. Sus historiales anteriores se conservarán.`, () => PEH.admin.eliminarAnimal(r.id, version(r)));
    if (nombre === "eliminar-usuario") confirmar("Eliminar cuenta de usuario", `Se eliminará el acceso de ${r.nombre}, su perfil y preferencias, y se cancelarán sus solicitudes y reservas activas. Sus historiales se conservarán y su autoría comunitaria se anonimizará.`, () => PEH.admin.eliminarUsuario(r.id, version(r)));
    if (nombre === "eliminar-comentario") confirmar("Eliminar comentario", "Se eliminará este comentario junto con sus respuestas. Esta acción no se puede deshacer desde el panel.", () => PEH.admin.eliminarComentario(r.id, version(r)));
  }
  function salir() {
    confirmar("Cerrar sesión", "¿Quieres cerrar la sesión de administración?", () => {
      if (!PEH.sesion.cerrar()) return { ok: false, mensaje: "No se pudo cerrar la sesión." };
      onCerrarSesion(); return { ok: true, mensaje: "Sesión cerrada." };
    });
  }
  const contadores = {
    animales: datos.animales.filter(a => ["disponible", "en-proceso"].includes(a.estadoPerfil || "disponible")).length,
    usuarios: datos.usuarios.length, comentarios: datos.comentarios.length,
    adopciones: datos.adopciones.filter(r => ["Pendiente", "En revisión"].includes(r.estado || "Pendiente")).length,
    reservas: datos.reservas.filter(r => (r.estado || "Pendiente") === "Pendiente").length,
    consultas: datos.consultas.filter(r => ["Pendiente", "En revisión"].includes(r.estado || "Pendiente")).length
  };
  const etiquetas = { animales: "Animales visibles", usuarios: "Cuentas de usuarios", comentarios: "Comentarios", adopciones: "Adopciones por revisar", reservas: "Reservas pendientes", consultas: "Consultas sin responder" };
  const filtro = filtros[seccion] || {};
  const registros = (datos[seccion] || []).filter(r => {
    const texto = Object.values(r).filter(v => ["string", "number"].includes(typeof v)).join(" ") + " " + nombreResponsable(r, nombres);
    return (!filtro.busqueda || normalizar(texto).includes(normalizar(filtro.busqueda))) && (!filtro.estado || filtro.estado === "todos" || (seccion === "animales" ? r.estadoPerfil || "disponible" : r.estado || "Pendiente") === filtro.estado) && (seccion !== "animales" || !filtro.especie || filtro.especie === "todos" || r.especie === filtro.especie);
  });
  const opcionesEstado = seccion === "animales" ? [["disponible", "Disponible"], ["en-proceso", "En proceso de adopción"], ["adoptado", "Adoptado"], ["no-visible", "No visible"]] : (PEH.admin.ESTADOS[seccion] || []).map(e => [e, e]);
  return <>
    <a className="saltar-contenido" href="#desarrollador" onClick={e => { e.preventDefault(); contenido.current?.focus(); }}>Ir al contenido</a>
    <header className="cabecera-global"><div className="contenedor cabecera-contenido"><a className="marca marca-principal" href="#inicio" aria-label="Ir al inicio de PEH"><span className="simbolo-marca">PEH</span><span className="nombre-marca">Patitas Esperando<span>un Hogar</span></span></a><nav className="navegacion-principal" aria-label="Accesos de administración"><a className="enlace-navegacion" href="#inicio">Ver sitio</a><a className="enlace-navegacion" href="#perfil">Mi perfil</a><span className="enlace-navegacion activo" aria-current="page">Administración</span></nav></div></header>
    {!autorizado ? <section className="contenedor acceso-restringido"><span aria-hidden="true">🔒</span><h1>Acceso de administración</h1><p>Inicia sesión con la cuenta administradora predeterminada para continuar.</p><button className="boton boton-primario" type="button" onClick={salir}>Ir al acceso</button><a className="boton boton-secundario" href="#inicio">Volver a PEH</a></section> : <div className="contenedor administracion-layout">
      <aside className="menu-administracion" aria-label="Secciones del panel"><div className="identidad-administracion"><span className="icono-administracion" aria-hidden="true">🐾</span><strong>Administración PEH</strong><p>{nombres[PEH.sesion.obtener()?.id] || "Cuenta administradora"}</p></div><nav className="navegacion-administracion" aria-label="Gestión de PEH">{secciones.map(([tipo, icono, titulo]) => <button key={tipo} type="button" className={`opcion-administracion${seccion === tipo ? " activo" : ""}`} aria-current={seccion === tipo ? "page" : undefined} onClick={() => ir(tipo)}><span aria-hidden="true">{icono}</span>{titulo}</button>)}</nav><a className="volver-sitio" href="#inicio">← Volver al sitio</a><button className="boton-cerrar-administracion" type="button" onClick={salir}>Cerrar sesión</button></aside>
      <main className="contenido-administracion" ref={contenido} tabIndex={-1}><div className="encabezado-administracion"><div><span className="sobre-titulo">Cuidar también es gestionar</span><h1>Panel de administración</h1><p>Revisa los procesos de PEH y mantén su información al día.</p></div><button type="button" className="boton boton-secundario" onClick={() => { setMensaje(""); refrescar(); }}>Actualizar datos</button></div>{mensaje && <div className="mensaje-administracion" role="status">{mensaje}</div>}{error && <div className="error-administracion" role="alert">{error}</div>}
        {seccion === "resumen" ? <section className="seccion-administracion"><div className="titulo-seccion-administracion"><h2>Un vistazo a PEH</h2><p>Los pendientes que necesitan tu atención.</p></div><div className="resumen-administracion">{secciones.slice(1).map(([tipo, icono]) => <button type="button" className="tarjeta-estadistica" key={tipo} onClick={() => ir(tipo)}><span aria-hidden="true">{icono}</span><strong>{contadores[tipo]}</strong><span>{etiquetas[tipo]}</span></button>)}</div><article className="tarjeta-orientacion"><h3>¿Por dónde empezar?</h3><p>Revisa primero las solicitudes de adopción y las reservas pendientes. Después puedes actualizar el catálogo y responder las consultas de la comunidad.</p><div className="acciones-administracion"><button type="button" className="boton boton-primario" onClick={() => ir("adopciones")}>Revisar adopciones</button><button type="button" className="boton boton-secundario" onClick={() => ir("consultas")}>Ver consultas</button></div></article></section> : <section className="seccion-administracion" id={`seccion${seccion[0].toUpperCase()}${seccion.slice(1)}`}><div className="titulo-seccion-administracion"><div><h2 id="tituloSeccionReactAdmin">{titulos[seccion]}</h2><p>{descripciones[seccion]}</p></div>{seccion === "animales" && <button type="button" className="boton boton-primario" onClick={() => abrir("animal", null)}>Agregar animal</button>}</div><div className="filtros-administracion"><div className="grupo-admin"><label htmlFor="busquedaReactAdmin">Buscar en {seccion}</label><input id="busquedaReactAdmin" type="search" placeholder="Buscar…" value={filtro.busqueda || ""} onChange={e => filtrar("busqueda", e.target.value)} /></div>{seccion === "animales" && <div className="grupo-admin"><label htmlFor="especieReactAdmin">Especie</label><select id="especieReactAdmin" value={filtro.especie || "todos"} onChange={e => filtrar("especie", e.target.value)}><option value="todos">Todas</option><option value="perro">Perros</option><option value="gato">Gatos</option></select></div>}{opcionesEstado.length > 0 && <div className="grupo-admin"><label htmlFor="estadoReactAdmin">Estado</label><select id="estadoReactAdmin" value={filtro.estado || "todos"} onChange={e => filtrar("estado", e.target.value)}><option value="todos">Todos</option>{opcionesEstado.map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}</select></div>}</div><p className="resultado-administracion" aria-live="polite">{registros.length} de {datos[seccion].length} registros</p><TablaAdmin tipo={seccion} registros={registros} nombres={nombres} onAccion={accion} tituloId="tituloSeccionReactAdmin" /></section>}
      </main>
    </div>}
    <footer className="pie-administracion"><div className="contenedor"><p>© 2026 PEH · Patitas Esperando un Hogar</p><p>Gestión al servicio de cada nueva oportunidad. ♡</p></div></footer>
    {modal && <FormulariosAdmin key={`${modal.tipo}-${modal.registro?.id || "nuevo"}`} modal={modal} nombres={nombres} onCerrar={() => setModal(null)} onGuardado={texto => { setModal(null); setMensaje(texto); refrescar(); }} />}
  </>;
}
