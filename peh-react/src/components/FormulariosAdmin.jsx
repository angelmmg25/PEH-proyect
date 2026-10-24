import { useEffect, useRef, useState } from "react";
import PEH from "../services/peh";
import { nombreResponsable } from "../services/administracion";

const fecha = valor => valor ? PEH.formatearFecha(valor) : "Sin fecha registrada";
const version = r => r?.revision || r?.fechaActualizacion || r?.fechaCreacion || r?.fechaRegistro || "";

function Detalle({ pares }) {
  return <dl className="detalle-registro-admin">{pares.map(([titulo, valor]) => <ParDetalle key={titulo} titulo={titulo} valor={valor} />)}</dl>;
}
function ParDetalle({ titulo, valor }) {
  return <><dt>{titulo}</dt><dd>{valor === true ? "Sí" : valor === false ? "No" : valor || "No indicado"}</dd></>;
}
function leerImagen(archivo) {
  if (!archivo) return Promise.resolve(null);
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(archivo.type) || archivo.size > 1024 * 1024) return Promise.reject(new Error("Selecciona una imagen JPG, PNG, WEBP o AVIF de hasta 1 MB."));
  return new Promise((resolve, reject) => { const lector = new FileReader(); lector.onload = () => resolve(lector.result); lector.onerror = () => reject(new Error("No se pudo leer la imagen.")); lector.readAsDataURL(archivo); });
}

export default function FormulariosAdmin({ modal, nombres, onCerrar, onGuardado }) {
  const r = modal.registro || {};
  const tipo = modal.tipo;
  const dialogo = useRef(null), vivo = useRef(true), bloqueo = useRef(false), turnoFoto = useRef(0);
  const [datos, setDatos] = useState(() => ({ ...r, personalidad: (r.personalidad || []).join(", "), historia: (r.historia || []).join("\n\n"), hogar: r.hogar || [], convivencia: r.convivencia || [], estadoPerfil: r.estadoPerfil || "disponible", diasEsperando: r.diasEsperando ?? 0, respuesta: "", estado: r.estado || "Pendiente", observacionAdmin: r.observacionAdmin || "" }));
  const [imagen, setImagen] = useState(r.imagen || ""), [error, setError] = useState(""), [procesando, setProcesando] = useState(false), [leyendoFoto, setLeyendoFoto] = useState(false);
  const titulos = { animal: r.id ? `Editar a ${r.nombre}` : "Agregar un animal", usuario: "Editar perfil de usuario", adopcion: "Revisar solicitud de adopción", reserva: "Gestionar reserva veterinaria", consulta: "Consulta de contacto", confirmacion: modal.titulo };
  useEffect(() => {
    vivo.current = true;
    const elemento = dialogo.current, anterior = document.activeElement;
    if (!elemento.open) elemento.showModal();
    return () => { vivo.current = false; turnoFoto.current++; elemento.close(); if (anterior?.isConnected) anterior.focus(); };
  }, []);
  function cambiar(e) { const { name, value } = e.target; setDatos(actual => ({ ...actual, [name]: value })); }
  function opcion(campo, valor, checked) { setDatos(actual => ({ ...actual, [campo]: checked ? [...actual[campo], valor] : actual[campo].filter(v => v !== valor) })); }
  async function elegirFoto(e) {
    const turno = ++turnoFoto.current;
    setError(""); setLeyendoFoto(true);
    try { const foto = await leerImagen(e.target.files[0]); if (vivo.current && turno === turnoFoto.current && foto) setImagen(foto); }
    catch (fallo) { if (vivo.current) setError(fallo.message); }
    finally { if (vivo.current && turno === turnoFoto.current) setLeyendoFoto(false); }
  }
  function campo(nombre, titulo, opciones = {}) {
    const id = `admin-${nombre}`;
    return <div className={`grupo-admin${opciones.completo ? " campo-completo" : ""}`}><label htmlFor={id}>{titulo}</label>{opciones.lista ? <select id={id} name={nombre} required value={datos[nombre] ?? ""} onChange={cambiar}>{opciones.lista.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}</select> : opciones.filas ? <textarea id={id} name={nombre} rows={opciones.filas} minLength={opciones.minLength} maxLength={opciones.maxLength} required={opciones.required} value={datos[nombre] ?? ""} onChange={cambiar} /> : <input id={id} name={nombre} type={opciones.type || "text"} min={opciones.min} max={opciones.max} step={opciones.step} minLength={opciones.minLength} maxLength={opciones.maxLength} pattern={opciones.pattern} autoComplete="off" required={opciones.required} value={datos[nombre] ?? ""} onChange={cambiar} />}{opciones.ayuda && <small>{opciones.ayuda}</small>}</div>;
  }
  function gestionar(soloEstado = false) {
    if (tipo === "animal") return PEH.admin.guardarAnimal({ ...datos, imagen }, r.id ? version(r) : undefined);
    if (tipo === "usuario") return PEH.admin.guardarUsuario(datos, version(r));
    if (tipo === "adopcion") return PEH.admin.guardarAdopcion(r.id, datos, version(r));
    if (tipo === "reserva") return PEH.admin.guardarReserva(r.id, datos, version(r));
    if (tipo === "consulta") return PEH.admin.guardarConsulta(r.id, soloEstado ? { estado: datos.estado } : datos, version(r));
    return modal.operacion();
  }
  function guardar(e, soloEstado = false) {
    e?.preventDefault(); if (bloqueo.current || leyendoFoto) return;
    bloqueo.current = true; setProcesando(true); setError("");
    try { const resultado = gestionar(soloEstado); if (resultado.ok) onGuardado(resultado.mensaje); else setError(resultado.mensaje); }
    catch (fallo) { setError(fallo.message || "No se pudo completar la operación."); }
    finally { bloqueo.current = false; if (vivo.current) setProcesando(false); }
  }
  const paresAdopcion = { animalNombre: "Animal", nombreAdoptante: "Nombre", correoAdoptante: "Correo", telefonoAdoptante: "Teléfono", edadAdoptante: "Edad", comunaAdoptante: "Comuna", tipoVivienda: "Vivienda", situacionVivienda: "Situación de vivienda", personasHogar: "Personas en el hogar", acuerdoFamiliar: "Acuerdo familiar", otrosAnimales: "Otros animales", detalleAnimales: "Detalle de animales", experienciaAnimales: "Experiencia", motivoAdopcion: "Motivo de adopción", cuidadosAnimal: "Cuidados propuestos", aceptaCompromiso: "Acepta compromiso" };
  return <dialog ref={dialogo} className={`dialogo-administracion${["animal", "adopcion", "consulta"].includes(tipo) ? " dialogo-amplio" : ""}${tipo === "confirmacion" ? " dialogo-confirmacion" : ""}`} aria-labelledby="tituloDialogoReactAdmin" onCancel={e => { e.preventDefault(); onCerrar(); }} onClick={e => { if (e.target === e.currentTarget) { const b = e.currentTarget.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) onCerrar(); } }}>
    <form onSubmit={guardar}>
      {tipo === "confirmacion" ? <><span className="icono-confirmacion-admin" aria-hidden="true">!</span><h2 id="tituloDialogoReactAdmin">{titulos[tipo]}</h2><p>{modal.texto}</p></> : <div className="cabecera-dialogo"><h2 id="tituloDialogoReactAdmin">{titulos[tipo]}</h2><button type="button" className="cerrar-dialogo" aria-label="Cerrar" onClick={onCerrar}>×</button></div>}
      {tipo === "animal" && <div className="campos-admin">
        {campo("nombre", "Nombre", { required: true, minLength: 2, maxLength: 60 })}
        {campo("especie", "Especie", { lista: [["", "Selecciona"], ["perro", "Perro"], ["gato", "Gato"]] })}
        {campo("sexo", "Sexo", { lista: [["", "Selecciona"], ["macho", "Macho"], ["hembra", "Hembra"]] })}
        {campo("edad", "Edad aproximada en años", { type: "number", required: true, min: 0, max: 40, step: .1 })}
        {campo("tamano", "Tamaño", { lista: [["", "Selecciona"], ["pequeno", "Pequeño"], ["mediano", "Mediano"], ["grande", "Grande"]] })}
        {campo("comuna", "Comuna", { required: true, minLength: 2, maxLength: 60 })}
        {campo("diasEsperando", "Días esperando un hogar", { type: "number", required: true, min: 0, step: 1 })}
        {campo("estadoPerfil", "Estado del perfil", { lista: [["disponible", "Disponible"], ["en-proceso", "En proceso de adopción"], ["adoptado", "Adoptado"], ["no-visible", "No visible"]] })}
        {campo("personalidad", "Personalidad", { completo: true, maxLength: 180, ayuda: "Separa las características con comas." })}
        {[["hogar", "Hogar adecuado", [["casa", "Casa"], ["departamento", "Departamento"], ["espacio-amplio", "Espacio amplio"]]], ["convivencia", "Puede convivir con", [["ninos", "Niños"], ["perros", "Perros"], ["gatos", "Gatos"]]]].map(([nombre, titulo, opciones]) => <fieldset className="grupo-admin" key={nombre}><legend>{titulo}</legend>{opciones.map(([valor, etiqueta]) => <label className="opcion-admin" key={valor}><input type="checkbox" checked={datos[nombre].includes(valor)} onChange={e => opcion(nombre, valor, e.target.checked)} />{etiqueta}</label>)}</fieldset>)}
        {campo("historia", "Historia", { completo: true, filas: 5, required: true, minLength: 20, maxLength: 3000, ayuda: "Separa los párrafos con una línea en blanco." })}
        {campo("cuidados", "Cuidados y necesidades", { completo: true, filas: 3, required: true, minLength: 10, maxLength: 1500 })}
        <div className="grupo-admin campo-completo"><label htmlFor="admin-foto">Fotografía</label><input id="admin-foto" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={elegirFoto} /><small>JPG, PNG, WEBP o AVIF, hasta 1 MB. Al editar, se conserva la foto si no eliges otra.</small>{imagen && <img className="vista-previa-animal" src={imagen} alt="Vista previa del animal" width="240" height="180" />}</div>
      </div>}
      {tipo === "usuario" && <div className="campos-admin">{campo("nombre", "Nombre", { required: true, minLength: 2, maxLength: 30 })}{campo("apellido", "Apellido", { required: true, minLength: 2, maxLength: 30 })}{campo("usuario", "Nombre de usuario", { required: true, minLength: 4, maxLength: 16, pattern: "[A-Za-z0-9_]{4,16}" })}{campo("correo", "Correo electrónico", { type: "email", required: true, maxLength: 100, ayuda: "gmail.com, duoc.cl o profesor.uc.cl" })}</div>}
      {tipo === "adopcion" && <><section><h3>Información de la solicitud</h3><Detalle pares={[["Código", r.id], ["Cuenta", nombreResponsable(r, nombres)], ["Fecha", fecha(r.fechaCreacion)], ...Object.entries(paresAdopcion).map(([k, etiqueta]) => [etiqueta, r[k]])]} /></section>{campo("estado", "Estado de la solicitud", { lista: PEH.admin.ESTADOS.adopciones.map(e => [e, e]) })}<p className="ayuda-admin">Aprobada indica que la solicitud fue aceptada. Completada indica que la adopción ya se concretó.</p>{campo("observacionAdmin", "Observaciones para la persona solicitante", { filas: 4, maxLength: 1500 })}</>}
      {tipo === "reserva" && <><Detalle pares={[["Código", r.id], ["Responsable", nombreResponsable(r, nombres)], ["Mascota", r.mascotaNombre], ["Servicio", r.servicioNombre || r.servicio], ["Observaciones originales", r.observaciones]]} /><div className="campos-admin">{campo("estado", "Estado de la reserva", { completo: true, lista: PEH.admin.ESTADOS.reservas.map(e => [e, e]) })}{campo("fecha", "Fecha de atención", { type: "date", required: true })}{campo("hora", "Hora de atención", { lista: [["", "Selecciona"], ...["09:00", "10:30", "12:00", "15:00", "16:30", "18:00"].map(h => [h, h])] })}{campo("observacionAdmin", "Observaciones para la persona responsable", { completo: true, filas: 4, maxLength: 1500, ayuda: "Para reprogramar, indica el motivo del cambio." })}</div></>}
      {tipo === "consulta" && <><Detalle pares={[["Código", r.id], ["Nombre", r.nombre], ["Correo", r.correo], ["Asunto", r.asunto], ["Motivo", r.motivo], ["Fecha", fecha(r.fechaCreacion)], ["Seguimiento", r.usuarioId && nombres[r.usuarioId] ? "Respuesta visible para su cuenta en Mi perfil" : "Registro interno, sin envío de correo"]]} /><section className="mensaje-original-admin"><h3>Mensaje recibido</h3><p>{r.mensaje}</p></section><section><h3>Respuestas de administración</h3>{r.respuestas?.length ? <ol className="respuestas-consulta-admin">{r.respuestas.map(respuesta => <li key={respuesta.id}><strong>{respuesta.autor} · {fecha(respuesta.fechaCreacion)}</strong><p>{respuesta.texto}</p></li>)}</ol> : <p id="sinRespuestasConsultaAdmin">Esta consulta todavía no tiene respuestas.</p>}</section>{campo("estado", "Estado de la consulta", { lista: PEH.admin.ESTADOS.consultas.map(e => [e, e]) })}<button id="guardarEstadoConsultaAdmin" type="button" className="boton boton-secundario" disabled={procesando || leyendoFoto} onClick={() => guardar(null, true)}>Guardar solo el estado</button>{campo("respuesta", "Tu respuesta", { filas: 5, required: true, minLength: 10, maxLength: 2000, ayuda: "La respuesta se registra dentro de PEH. No se envían correos." })}</>}
      {error && <p className="error-formulario-admin" role="alert">{error}</p>}
      <div className="acciones-dialogo"><button type="button" className="boton boton-secundario" onClick={onCerrar}>Cancelar</button><button type="submit" disabled={procesando || leyendoFoto} className={`boton ${tipo === "confirmacion" ? "boton-peligro" : "boton-primario"}`}>{leyendoFoto ? "Leyendo imagen…" : procesando ? "Guardando…" : tipo === "confirmacion" ? "Confirmar" : tipo === "animal" ? "Guardar perfil" : tipo === "adopcion" ? "Guardar estado" : tipo === "reserva" ? "Guardar reserva" : tipo === "consulta" ? "Guardar respuesta" : "Guardar cambios"}</button></div>
    </form>
  </dialog>;
}
