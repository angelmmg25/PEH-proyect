import { useEffect, useState } from "react";
import PEH from "../services/peh";

function cargarConsultas() {
  try { return { consultas: PEH.consultas.listar().sort((a, b) => String(b.fechaCreacion).localeCompare(String(a.fechaCreacion))), error: "" }; }
  catch (error) { return { consultas: [], error: error.message }; }
}
export default function MisConsultas() {
  const [estado, setEstado] = useState(cargarConsultas);
  useEffect(() => {
    const actualizar = evento => {
      const clave = evento.type === "storage" ? evento.key : evento.detail?.clave;
      if (clave === null || [PEH.admin.CLAVES.consultas, PEH.CLAVES.sesion, PEH.CLAVES.cuentas].includes(clave)) setEstado(cargarConsultas());
    };
    window.addEventListener("peh:actualizado", actualizar); window.addEventListener("storage", actualizar);
    return () => { window.removeEventListener("peh:actualizado", actualizar); window.removeEventListener("storage", actualizar); };
  }, []);
  return <section className="panel-notificaciones-perfil" id="consultasPerfil"><div className="titulo-seccion-perfil"><span className="icono-titulo-perfil" aria-hidden="true">✉</span><div><h2>Mis consultas de contacto</h2><p>Revisa el estado de tus consultas y las respuestas de administración.</p></div></div>{estado.error && <p role="alert">{estado.error}</p>}<div className="lista-notificaciones-perfil" aria-live="polite">{estado.consultas.length ? estado.consultas.map(c => <article className="notificacion-perfil" key={c.id}><div><strong>{c.asunto}</strong><p>{c.estado || "Pendiente"} · {PEH.formatearFecha(c.fechaCreacion)}</p><p>{c.mensaje}</p><small>Código: {c.id}</small>{(c.respuestas || []).map(r => <blockquote key={r.id}><strong>Administración · {PEH.formatearFecha(r.fechaCreacion)}</strong><p>{r.texto}</p></blockquote>)}</div></article>) : !estado.error && <p className="sin-avisos-perfil">Todavía no tienes consultas registradas con esta cuenta.</p>}</div></section>;
}
