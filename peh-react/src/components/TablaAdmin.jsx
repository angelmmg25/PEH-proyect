import { formatearEdad } from "../services/catalogo";
import PEH from "../services/peh";
import { nombreResponsable } from "../services/administracion";

const fecha = valor => valor ? PEH.formatearFecha(valor) : "Sin fecha registrada";
const estadosAnimal = { disponible: "Disponible", "en-proceso": "En proceso", adoptado: "Adoptado", "no-visible": "No visible" };
const columnas = {
  animales: ["Animal", "Especie y edad", "Comuna", "Estado", "Acciones"],
  usuarios: ["Nombre", "Usuario", "Correo", "Registro", "Acciones"],
  comentarios: ["Autor", "Comentario", "Publicación", "Fecha", "Acciones"],
  adopciones: ["Animal", "Solicitante", "Fecha", "Estado", "Acciones"],
  reservas: ["Mascota", "Responsable", "Servicio", "Fecha y hora", "Estado", "Acciones"],
  consultas: ["Remitente", "Asunto y motivo", "Fecha", "Estado", "Acciones"]
};
const estado = valor => <span className="estado-admin">{valor || "Pendiente"}</span>;


export default function TablaAdmin({ tipo, registros, nombres, onAccion, tituloId }) {
  function boton(accion, texto, registro, peligro = false) {
    return <button type="button" className={peligro ? "accion-peligro" : undefined} onClick={() => onAccion(accion, registro)} aria-label={`${texto}: ${registro.nombre || registro.animalNombre || registro.mascotaNombre || registro.asunto || registro.autor || registro.id}`}>{texto}</button>;
  }
  function celdas(r) {
    if (tipo === "animales") return <><td><div className="animal-celda-admin"><img src={r.imagen} alt={r.nombre} width="52" height="52" loading="lazy" /><div><strong>{r.nombre}</strong><small>{r.slug}</small></div></div></td><td>{r.especie === "perro" ? "Perro" : "Gato"} · {formatearEdad(r)}</td><td>{r.comuna}</td><td>{estado(estadosAnimal[r.estadoPerfil || "disponible"])}</td><td><div className="acciones-fila-admin">{boton("ver-animal", "Ver perfil", r)}{boton("editar-animal", "Editar", r)}{boton("eliminar-animal", "Eliminar perfil", r, true)}</div></td></>;
    if (tipo === "usuarios") return <><td>{r.nombre} {r.apellido}</td><td>{r.usuario}</td><td>{r.correo}</td><td>{fecha(r.fechaRegistro)}</td><td><div className="acciones-fila-admin">{boton("editar-usuario", "Editar perfil", r)}{boton("eliminar-usuario", "Eliminar cuenta", r, true)}</div></td></>;
    if (tipo === "comentarios") return <><td>{r.autor || "Usuario eliminado"}</td><td><p className="texto-comentario-admin">{r.texto}</p><small>{r.respuestaA ? "Respuesta" : r.demo ? "Comentario de ejemplo" : "Comentario"}</small></td><td>{r.publicacionId}</td><td>{fecha(r.fechaCreacion)}</td><td><div className="acciones-fila-admin">{boton("ver-comentario", "Ver contexto", r)}{boton("eliminar-comentario", "Eliminar", r, true)}</div></td></>;
    if (tipo === "adopciones") return <><td>{r.animalNombre}</td><td><strong>{nombreResponsable(r, nombres)}</strong><small>{r.correoAdoptante}</small></td><td>{fecha(r.fechaCreacion)}</td><td>{estado(r.estado)}</td><td>{boton("gestionar-adopcion", "Revisar solicitud", r)}</td></>;
    if (tipo === "reservas") return <><td>{r.mascotaNombre}</td><td>{nombreResponsable(r, nombres)}</td><td>{r.servicioNombre || r.servicio}</td><td>{fecha(r.fecha)} · {r.hora}</td><td>{estado(r.estado)}</td><td>{boton("gestionar-reserva", "Gestionar reserva", r)}</td></>;
    return <><td><strong>{r.nombre}</strong><small>{r.correo}</small></td><td><strong>{r.asunto}</strong><small>{r.motivo}</small></td><td>{fecha(r.fechaCreacion)}</td><td>{estado(r.estado)}</td><td>{boton("gestionar-consulta", "Ver y responder", r)}</td></>;
  }
  return <div className="tabla-administracion-contenedor" role="region" aria-labelledby={tituloId} tabIndex={0}><table className="tabla-administracion"><caption>Registros de {tipo} de PEH</caption><thead><tr>{columnas[tipo].map(columna => <th scope="col" key={columna}>{columna}</th>)}</tr></thead><tbody>{registros.length ? registros.map(r => <tr key={r.id}>{celdas(r)}</tr>) : <tr><td colSpan={columnas[tipo].length}>No hay registros con esos filtros.</td></tr>}</tbody></table></div>;
}
