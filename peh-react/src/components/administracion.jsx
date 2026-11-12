/* Componentes de la vista administracion.
 * La lógica de estado y procesos se obtiene de hooks.
 */
import { useFormularioAdmin, estadoFila, useRegistroAdmin } from '../hooks/administracion.js';
import { AvisoBorrador, IconoPerfil, Navegacion } from './global.jsx';
import { seccionesAdministracion as secciones, etiquetasAdministracion as etiquetas, camposOmitidosDetalle as omitidos } from '../data/administracion.js';
import { Fragment } from 'react';
import { estadosAdopcion } from '../services/administracion.js';
/* FormulariosAdmin */

export function FormulariosAdmin({modal,onCerrar,onGuardado}) {
  const { tipo, accion, registro, config, datos, setDatos, borrador, mensaje, errores, ocupado, subiendo, dialogo, elegirImagen, guardar, edades , cerrarFormulario , impedirCierre } = useFormularioAdmin({ modal, onGuardado , onCerrar });

  function entrada(c) {
    const comun={id:`admin-api-${c.nombre}`,name:c.nombre,value:datos[c.nombre]??'',required:!['observacionAdmin','personalidad','hogar','convivencia'].includes(c.nombre) && (!['fechaAtencion','horaTermino','conclusionConsulta','recomendacionesVeterinario'].includes(c.nombre)||datos.estado==='Cerrada'),onChange:e=>setDatos(d=>({...d,[c.nombre]:e.target.value})), 'aria-invalid':Boolean(errores[c.nombre]),'aria-describedby':errores[c.nombre]?`error-${c.nombre}`:undefined};
    if(c.tipo==='edad')return <select {...comun}>{edades.map(m=><option value={m} key={m}>{m===0?'Menos de 1 mes':m<12?`${m} ${m===1?'mes':'meses'}`:`${Math.floor(m/12)} ${m<24?'año':'años'}${m%12?` ${m%12} meses`:''}`}</option>)}</select>;
    if(c.tipo==='select')return <select {...comun}>{c.opciones.map(o=>{const [v,t]=Array.isArray(o)?o:[o,o];return <option value={v} key={v}>{t}</option>;})}</select>;
    if(c.tipo==='textarea')return <textarea {...comun} rows={4} maxLength={c.max} minLength={c.min||undefined}/>;
    return <input {...comun} type={c.tipo} maxLength={c.tipo==='number'?undefined:c.max} minLength={c.tipo==='number'?undefined:c.min||undefined} min={c.tipo==='number'?c.min:undefined} max={c.tipo==='number'?c.max:undefined} step={c.tipo==='number'?1:undefined} pattern={c.nombre==='slug'?'[a-z0-9]+(?:-[a-z0-9]+)*':c.nombre==='usuario'?'[A-Za-z0-9_]{4,16}':undefined}/>;
  }
  return <dialog className="admin-api-dialogo" ref={dialogo} aria-labelledby="admin-api-titulo" onCancel={impedirCierre}>
    <div className="admin-api-cabecera-modal"><h2 id="admin-api-titulo">{config.titulo}</h2><button type="button" disabled={ocupado || subiendo} aria-label="Cerrar y conservar borrador" onClick={onCerrar}>×</button></div>
    {accion==='eliminar' && <p>{tipo==='animales'?'El animal se ocultará del catálogo y conservará su historial.':tipo==='usuarios'?'La cuenta quedará desactivada, se cerrarán sus sesiones y se cancelarán sus trámites pendientes. Sus historiales se conservarán.':tipo==='publicaciones'?'Se eliminará la publicación y sus comentarios.':'Se eliminará el comentario y sus respuestas.'} Confirma la acción sobre <strong>{registro.nombre||registro.autor||`registro ${registro.id}`}</strong>.</p>}
    {tipo==='adopciones' && <p>Aprobada reserva el proceso; Completada marca al animal como adoptado y rechaza otras solicitudes pendientes.</p>}
    <form onSubmit={guardar}><fieldset disabled={ocupado || subiendo}>{tipo==='animales' && accion==='editar' && <div className="grupo-admin"><label htmlFor="admin-api-archivo">Subir fotografía</label><input id="admin-api-archivo" type="file" accept="image/png,image/jpeg,image/gif" onChange={elegirImagen}/><p>{subiendo?'Subiendo imagen…':'PNG, JPG o GIF, hasta 3 MB. También puedes escribir una URL en el campo Imagen. La fotografía se vincula al animal al guardar los cambios.'}</p></div>}<div className="admin-api-campos">{config.campos.filter(c=>!['fechaAtencion','horaTermino','conclusionConsulta','recomendacionesVeterinario'].includes(c.nombre)||datos.estado==='Cerrada').map(c=><div className="grupo-admin" key={c.nombre}><label htmlFor={`admin-api-${c.nombre}`}>{c.titulo}</label>{entrada(c)}{errores[c.nombre] && <p id={`error-${c.nombre}`} role="alert">{errores[c.nombre]}</p>}</div>)}</div>
      <AvisoBorrador estado={borrador}/>
      <div className="acciones-administracion"><button type="button" className="boton boton-secundario boton-cancelar-proceso" onClick={cerrarFormulario}>Cancelar proceso</button><button type="submit" className="boton boton-primario peh-boton-fondo">{ocupado?'Guardando…':accion==='eliminar'?'Confirmar acción':'Guardar cambios'}</button></div>
    </fieldset>{mensaje && <p role="alert">{mensaje}</p>}</form>
  </dialog>;
}

/* Presentación de Desarrollador */

function IconoAdmin({tipo,oscuro=false}) {
  if(!oscuro && ['usuarios','adopciones','consultas'].includes(tipo))return <IconoPerfil tipo={tipo==='usuarios'?'datos':tipo}/>;
  const dibujos={
    animales:<path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/>,
    reservas:<><path d="m15 3 6 6M17 5 7 15l-2 4 4-2L19 7M3 21l3-3M11 7l6 6M10 12l2 2M13 9l2 2"/></>,
    publicaciones:<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h4v4H7ZM15 8h3M15 12h3M7 16h11"/></>,
    comentarios:<><path d="M14 14a7 7 0 1 0-9-1l-2 4 5-1M20 16a5 5 0 1 0-3 4l4 1-1-5Z"/></>,
    persona:<><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3Z"/></>
  };
  return <svg className={'icono-admin'+(oscuro?' admin-silueta-oscura':'')} viewBox="0 0 24 24" fill={oscuro?'currentColor':'none'} stroke={oscuro?'none':'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{oscuro?dibujos.persona:dibujos[tipo]||dibujos.persona}</svg>;
}
function Detalles({valor,nivel=0,campo=''}) {
  if(valor===null || valor===undefined || valor==='')return <span>Sin información</span>;
  if(Array.isArray(valor)) {
    if(!valor.length)return <span>Sin registros</span>;
    if(valor.every(v=>typeof v!=='object' || v===null))return <span>{valor.map(v=>v===true?'Sí':v===false?'No':String(v??'Sin información')).join(' · ')}</span>;
    return <ol className="admin-detalles-lista">{valor.map((v,i)=><li key={i}><Detalles valor={v} nivel={nivel+1}/></li>)}</ol>;
  }
  if(typeof valor==='object')return <dl className={'admin-api-detalles admin-detalles-nivel'+nivel}>{Object.entries(valor).filter(([k,v])=>!omitidos.has(k) && !(nivel===0 && valor.formulario && Object.hasOwn(valor.formulario,k) && valor.formulario[k]===v)).map(([k,v])=><div className={'admin-detalles-campo'+(v && typeof v==='object' && !Array.isArray(v) || Array.isArray(v) && v.some(x=>x && typeof x==='object')?' admin-detalles-grupo':'')} key={k}><dt>{etiquetas[k]||k}</dt><dd><Detalles valor={v} nivel={nivel+1} campo={k}/></dd></div>)}</dl>;
  if(typeof valor==='string' && ['fecha','fechaCreacion','fechaRegistro','fechaActualizacion','fechaNacimiento'].includes(campo)) {
    const soloFecha=/^\d{4}-\d{2}-\d{2}$/.test(valor),fecha=new Date(soloFecha?valor+'T12:00:00':valor);
    if(!Number.isNaN(fecha.getTime()))return <span>{fecha.toLocaleString('es-CL',{dateStyle:'medium',...(!soloFecha?{timeStyle:'short',timeZone:'America/Santiago'}:{})})}</span>;
  }
  return <span>{typeof valor==='boolean'?(valor?'Sí':'No'):valor==='si'?'Sí':valor==='no'?'No':String(valor)}</span>;
}
function RegistroAdmin({tipo,registro:r}) {
  const { fallida, setFallida, nombre, descripcion, foto } = useRegistroAdmin({ tipo, r });

  return <div className="admin-registro-identidad">
    <span className={'admin-registro-avatar'+(['animales','adopciones'].includes(tipo)?' admin-registro-foto':'')}>
      {['animales','adopciones'].includes(tipo) && foto && fallida!==foto?<img src={foto} alt={tipo==='animales'?r.nombre:r.animalNombre} width="68" height="68" loading="lazy" onError={()=>setFallida(foto)}/>:<IconoAdmin tipo={tipo==='reservas'?'reservas':'animales'} oscuro={!['animales','adopciones','reservas'].includes(tipo)}/>}
    </span>
    <div className="admin-registro-nombre"><strong>{nombre}</strong>{tipo==='animales'?<><p>{r.especie==='perro'?'Perro':r.especie==='gato'?'Gato':r.especie}</p><p>{r.edadMeses<1?'Menos de 1 mes':`${r.edadMeses} meses`} · {r.comuna}</p></>:tipo==='comentarios'?<details className="admin-texto-comentario"><summary>Ver texto</summary><p className="admin-api-texto">{r.texto||descripcion}</p></details>:<p className="admin-api-texto">{descripcion}</p>}</div>
  </div>;
}
export function VistaAdministracion({ titulo, lista, estados, esAdmin, tipo, pagina, setIntento, abiertos, estado, busqueda, setBusqueda, filtro, setFiltro, modal, setModal, mensaje, alternarDetalle, seleccionar, guardado, abrir, paginaAnterior, paginaSiguiente }) {
if(!esAdmin)return <><Navegacion pagina="desarrollador"/><main className="contenedor"><h1>Acceso restringido</h1><p role="alert">Esta sección requiere una cuenta administradora.</p><a href="#perfil">Volver a mi perfil</a></main></>;
function boton(accion,texto,r){return <button type="button" onClick={()=>abrir(accion,r)}>{texto}</button>;}
function acciones(r) {
    if(tipo==='animales')return <>{r.estadoPerfil!=='no-visible' && <a href={`#animal/${encodeURIComponent(r.slug)}`}>Ver perfil</a>}{boton('editar','Editar',r)}{['disponible','no-visible'].includes(r.estadoPerfil) && <>{boton('estado','Visibilidad',r)}{r.estadoPerfil==='disponible' && boton('eliminar','Archivar',r)}</>}</>;
    if(tipo==='usuarios')return r.rol==='ADMIN'?<span>Cuenta administradora protegida</span>:r.activo?<>{boton('editar','Editar',r)}{boton('eliminar','Desactivar',r)}</>:<span>Cuenta desactivada</span>;
    if(tipo==='adopciones')return estadosAdopcion(r.estado).length?boton('estado','Gestionar',r):<span>Proceso finalizado</span>;
    if(tipo==='reservas')return ['Pendiente','Confirmada'].includes(r.estado)?boton('editar','Gestionar',r):<span>Reserva finalizada</span>;
    if(tipo==='consultas')return <>{boton('responder','Responder',r)}{boton('estado','Cambiar estado',r)}</>;
    return <>{tipo==='comentarios' && <a href={`#comunidad/todas/${r.publicacionId}`}>Ver contexto</a>}{boton('eliminar','Eliminar',r)}</>;
  }
return <><Navegacion pagina="desarrollador"/><div className="panel-administracion admin-api-panel">
    <aside className="menu-administracion peh-panel-persistente" aria-label="Secciones administrativas"><h2>Administración PEH</h2><nav>{secciones.map(([k,t])=><button type="button" key={k} className={`opcion-menu-admin${tipo===k?' activa':''}`} aria-current={tipo===k?'page':undefined} disabled={Boolean(modal)} onClick={()=>seleccionar(k)}><IconoAdmin tipo={k}/><span>{t}</span></button>)}</nav><a className="admin-mi-perfil peh-boton-fondo" href="#perfil">Mi perfil</a></aside>
    <main className="contenido-administracion"><header className="titulo-seccion-administracion"><div><h1>{titulo}</h1><p>Gestión de los registros de Patitas Esperando un Hogar.</p></div>{tipo==='animales' && <button type="button" className="boton boton-primario peh-boton-fondo" disabled={estado.cargando} onClick={()=>abrir('editar')}>Agregar animal</button>}</header>
      {mensaje && <p role="status">{mensaje}</p>}
      <div className="filtros-administracion"><div className="grupo-admin"><label htmlFor="admin-api-buscar">Buscar en esta página</label><input id="admin-api-buscar" type="search" value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></div><div className="grupo-admin"><label htmlFor="admin-api-filtro">Estado o categoría en esta página</label><select id="admin-api-filtro" value={filtro} onChange={e=>setFiltro(e.target.value)}><option value="">Todos</option>{estados.map(e=><option key={e}>{e}</option>)}</select></div><button type="button" className="boton boton-secundario" disabled={estado.cargando} onClick={()=>setIntento(n=>n+1)}>Actualizar</button></div>
      <section aria-busy={estado.cargando} aria-label={`Registros de ${titulo}`}>
        {estado.cargando?<p role="status">Cargando registros…</p>:estado.error?<><p role="alert">{estado.error}</p><button type="button" className="boton boton-secundario" onClick={()=>setIntento(n=>n+1)}>Reintentar</button></>:<>
          <p>{lista.length} de {estado.lista.length} registros de la página {pagina+1}.</p>
          <div className="tabla-administracion-contenedor" tabIndex={0} role="region" aria-label={`Tabla de ${titulo}`}><table className="tabla-administracion"><caption>{titulo}</caption><thead><tr><th scope="col">Registro</th><th scope="col">Estado</th><th scope="col">Información</th><th scope="col">Acciones</th></tr></thead><tbody>{lista.length?lista.map(r=>{const id=String(r.id),abierto=abiertos.has(id),detalleId=`admin-detalle-${tipo}-${id}`;return <Fragment key={id}><tr className="admin-fila-registro"><td><RegistroAdmin tipo={tipo} registro={r}/></td><td><span className="estado-admin">{estadoFila(tipo,r)}</span></td><td><button type="button" className="admin-ver-detalles peh-enlace" aria-expanded={abierto} aria-controls={detalleId} onClick={()=>alternarDetalle(id)}><span className="admin-chevron" aria-hidden="true"/>Ver detalles</button></td><td><div className="acciones-fila-admin">{acciones(r)}</div></td></tr><tr className="admin-fila-detalle" hidden={!abierto} id={detalleId}><td colSpan={4}><div className="admin-detalle-contenido"><Detalles valor={r}/></div></td></tr></Fragment>;}):<tr><td colSpan={4}>No hay registros con estos filtros en esta página.</td></tr>}</tbody></table></div>
        </>}
        <nav className="acciones-administracion" aria-label="Páginas de resultados"><button type="button" className="boton boton-secundario" disabled={pagina===0 || estado.cargando} onClick={paginaAnterior}>Anterior</button><span>Página {pagina+1}</span><button type="button" className="boton boton-secundario" disabled={estado.cargando || Boolean(estado.error) || estado.lista.length<20} onClick={paginaSiguiente}>Siguiente</button></nav>
      </section>
    </main></div>{modal && <FormulariosAdmin key={`${tipo}:${modal.registro?.id||'nuevo'}:${modal.accion}`} modal={modal} onCerrar={()=>setModal(null)} onGuardado={guardado}/>}</>;
}
