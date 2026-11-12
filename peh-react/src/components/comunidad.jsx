/* Componentes de la vista comunidad.
 * La lógica de estado y procesos se obtiene de hooks.
 */
import { useNuevaPublicacion, usePublicacion } from '../hooks/comunidad.js';
import { categoriasPublicacion, filtrosComunidad } from '../data/comunidad.js';
import { AvisoBorrador, Navegacion } from './global.jsx';
import { Fragment } from 'react';
import { categorias } from '../data/global.js';
import { crearPublicacion, coincidePublicacion } from '../services/comunidad.js';
/* NuevaPublicacion */

export function NuevaPublicacion({onPublicada,mostrarMensaje,mensaje,publicarServicio}) {
 const { contenido, setContenido, bContenido, categoria, setCategoria, ubicacion, setUbicacion, imagen, bImagen, validacion, archivo, procesando, limpiarImagen, cargar, publicar, cancelarPublicacion } = useNuevaPublicacion({ onPublicada, mostrarMensaje, publicarServicio });

 return (
<article className="crear-publicacion" id="crearPublicacion">
<div className="crear-publicacion-cabecera">
<div className="avatar-usuario" aria-hidden="true">{" 👤 "}</div>
<div>
<h2>{" Crear una publicación "}</h2>
<p>{" Comparte información que pueda ayudar a la comunidad. "}</p>
</div>
</div>
<form id="formularioPublicacion" className="formulario-publicacion" noValidate onBlur={validacion.evento} onChange={validacion.evento} onSubmit={publicar} aria-busy={procesando}>
<fieldset disabled={procesando} style={{border:0,padding:0,margin:0,minWidth:0}}>
<textarea id="contenidoPublicacion" name="contenido" rows="3" minLength="10" maxLength="500" placeholder="Comparte una historia, haz una pregunta o ayuda a difundir una patita..." required value={contenido} onChange={e => setContenido(e.target.value)}></textarea>{validacion.mensaje("contenido")}

<div className="vista-previa-publicacion" id="vistaPreviaPublicacion" hidden={!imagen}>
<img id="imagenPreviaPublicacion" src={imagen || undefined} alt="Vista previa de la imagen seleccionada" />
<button id="quitarImagenPublicacion" type="button" aria-label="Quitar imagen" onClick={limpiarImagen}>{" × "}</button>
</div>
<div className="crear-publicacion-opciones">

<label className="opcion-publicacion" htmlFor="imagenPublicacion">
<span aria-hidden="true">{" ▣ "}</span>{" Foto "}</label>
<input id="imagenPublicacion" name="imagen" type="file" accept="image/png,image/jpeg,image/gif" hidden ref={archivo} onChange={cargar} />{validacion.mensaje("imagen")}

<div className="campo-categoria-publicacion"><label className="opcion-publicacion">
<span aria-hidden="true">{" ◇ "}</span>
<select id="categoriaPublicacion" name="categoria" aria-label="Categoría de la publicación" required value={categoria} onChange={e => setCategoria(e.target.value)}>
<option value="">{" Etiquetar categoría "}</option>
{categoriasPublicacion.map(([id, nombre]) => <option key={id} value={id}>{` ${nombre} `}</option>)}
</select></label>{validacion.mensaje("categoria")}</div>

<label className="opcion-publicacion">
<span aria-hidden="true">{" ● "}</span>
<input id="ubicacionPublicacion" name="ubicacion" type="text" maxLength="50" placeholder="Ubicación (opcional)" value={ubicacion} onChange={e => setUbicacion(e.target.value)} />{validacion.mensaje("ubicacion")}
</label>

<div className="acciones-publicacion-proceso"><button className="boton-cancelar boton-cancelar-proceso" type="button" onClick={cancelarPublicacion}>Cancelar proceso</button>
<button className="boton-publicar peh-boton-fondo" type="submit">
<span aria-hidden="true">{" ➤ "}</span>{procesando?" Publicando… ":" Publicar "}</button></div>
</div>
<AvisoBorrador estado={bContenido}/><AvisoBorrador estado={bImagen}/><div className={"mensaje-publicacion " + mensaje.tipo} id="mensajePublicacion" role="status" aria-live="polite" hidden={!mensaje.visible}>{mensaje.texto}</div>
</fieldset>
</form>
</article>
 );
}

/* Publicacion */

export function Publicacion({publicacion:p,sesion,hidden,compartido,onCompartido,onEliminada,onEditada}){
 const { abiertos, setAbiertos, consulta, setIntento, texto, setTexto, bTexto, respuesta, bRespuesta, edicion, setEdicion, bEdicion, editando, setEditando, ocupado, error, campo, puedeModificar, enviar, borrarComentario, borrar, guardar, compartir, comentarioEditando, setComentarioEditando, textoEdicion, setTextoEdicion, guardarComentario, comentarios, cancelarEdicion, responderComentario, editarComentarioSeleccionado, cancelarComentario } = usePublicacion({ p, sesion, onCompartido, onEliminada, onEditada });

 return <article className={'publicacion publicacion-nueva'+(abiertos?' comentarios-abiertos':'')} id={`publicacion-${p.id}`} data-id={p.id} data-categoria={p.categoria} hidden={hidden}>
  <header className="publicacion-cabecera"><div className="avatar-publicacion" aria-hidden="true">👤</div><div className="datos-publicacion"><strong>{p.autor}{p.usuarioId===sesion.usuarioId?' (Tú)':''}</strong><div className="publicacion-meta"><span>{new Date(p.fechaCreacion).toLocaleDateString('es-CL')}</span>{p.ubicacion&&<><span>•</span><span>{p.ubicacion}</span></>}<span className={`etiqueta-publicacion etiqueta-${p.categoria}`}>{categorias[p.categoria]}</span></div></div>
   {puedeModificar&&<div><button className="boton-opciones-publicacion peh-enlace" type="button" disabled={Boolean(ocupado)} onClick={()=>setEditando(v=>!v)}>{editando?'Cerrar edición':'Editar'}</button><button className="boton-opciones-publicacion peh-enlace" type="button" aria-label="Eliminar publicación" disabled={Boolean(ocupado)} onClick={borrar}>Eliminar</button></div>}
  </header>
  {editando?<form className="formulario-publicacion" noValidate onSubmit={guardar}><fieldset disabled={Boolean(ocupado)} style={{border:0,padding:0,minWidth:0}}><legend>Editar publicación</legend><textarea aria-label="Editar contenido" rows="4" minLength="10" maxLength="500" required value={edicion.contenido} onChange={e=>setEdicion({...edicion,contenido:e.target.value})}/><select aria-label="Editar categoría" value={edicion.categoria} onChange={e=>setEdicion({...edicion,categoria:e.target.value})}>{Object.entries(categorias).map(([v,t])=><option key={v} value={v}>{t}</option>)}</select><input aria-label="Editar ubicación" maxLength="50" value={edicion.ubicacion} onChange={e=>setEdicion({...edicion,ubicacion:e.target.value})}/><div className="acciones-publicacion-proceso"><button type="button" className="boton-cancelar-proceso" onClick={cancelarEdicion}>Cancelar proceso</button><button className="boton-publicar peh-boton-fondo" type="submit">{ocupado==='editar'?'Guardando…':'Guardar cambios'}</button></div><AvisoBorrador estado={bEdicion}/></fieldset></form>:<div className="publicacion-contenido"><p>{p.contenido.split('\n').map((t,i,a)=><Fragment key={i}>{t}{i<a.length-1&&<br/>}</Fragment>)}</p>{p.imagen&&<div className="imagenes-publicacion imagen-unica"><img src={p.imagen} alt="Imagen compartida en la publicación" loading="lazy"/></div>}</div>}
  <footer className="publicacion-acciones"><button className={'accion-publicacion boton-compartir'+(compartido?' compartido':'')} type="button" onClick={compartir} disabled={Boolean(ocupado)}>{ocupado==='compartir'?'Compartiendo…':compartido?'Compartido ✓':'↗ Compartir'}</button><button className="accion-publicacion boton-comentarios" type="button" disabled={Boolean(ocupado)} aria-expanded={abiertos} onClick={()=>setAbiertos(v=>!v)}>{abiertos?'Cerrar comentarios':'Comentar'}</button></footer>
  {error&&<p className="error-formulario-general" role="alert">{error}</p>}
  <div className="seccion-comentarios" hidden={!abiertos}>
   {consulta.cargando&&<p role="status">Actualizando comentarios…</p>}{consulta.error&&<><p role="alert">{consulta.error}</p><button className="boton boton-secundario" type="button" onClick={()=>setIntento(n=>n+1)}>Reintentar comentarios</button></>}
   <div className="comentarios-lista">{comentarios.map(c=><div className={'comentario-comunidad'+(c.respuestaA?' es-respuesta':'')} key={c.id} data-comentario-id={c.id}><p><strong>{c.autor}{c.usuarioId===sesion.usuarioId?' (Tú)':''}: </strong>{c.texto}</p>{comentarioEditando===c.id&&<form className="edicion-comentario" onSubmit={guardarComentario}><label htmlFor={`editar-comentario-${c.id}`}>Editar comentario</label><textarea id={`editar-comentario-${c.id}`} value={textoEdicion} onChange={e=>setTextoEdicion(e.target.value)} maxLength={200} required rows={3} disabled={Boolean(ocupado)}/><div className="acciones-edicion"><button type="button" className="boton-cancelar-proceso" disabled={Boolean(ocupado)} onClick={()=>setComentarioEditando(null)}>Cancelar proceso</button><button type="submit" className="boton-publicar peh-boton-fondo" disabled={Boolean(ocupado)}>{ocupado==='editar comentario'?'Guardando…':'Guardar comentario'}</button></div></form>}<button className="boton-responder peh-enlace" type="button" disabled={Boolean(ocupado)} onClick={()=>responderComentario(c)}>Responder</button>{(c.usuarioId===sesion.usuarioId||sesion.rol==='ADMIN')&&<button className="boton-responder peh-enlace" type="button" disabled={Boolean(ocupado)} onClick={()=>editarComentarioSeleccionado(c)}>Editar comentario</button>}{(c.usuarioId===sesion.usuarioId||sesion.rol==='ADMIN')&&<button className="boton-responder peh-enlace" type="button" disabled={Boolean(ocupado)} onClick={()=>borrarComentario(c)}>Eliminar comentario</button>}</div>)}</div>
   {respuesta&&<div className="aviso-respuesta">Respondiendo a {respuesta.autor} <button type="button" disabled={Boolean(ocupado)} onClick={()=>bRespuesta.reiniciar(null)}>Cancelar respuesta</button></div>}
   <form className="formulario-comentario formulario-comentario-api" noValidate onSubmit={enviar} aria-busy={ocupado==='comentario'}><textarea name="comentario" aria-label="Comentario" rows="3" minLength="1" maxLength="200" ref={campo} value={texto} required disabled={Boolean(ocupado)} placeholder={respuesta?'Escribe tu respuesta…':'Escribe un comentario…'} onChange={e=>setTexto(e.target.value)}/><AvisoBorrador estado={bTexto}/><div className="acciones-comentario-proceso"><button className="boton-cancelar-proceso" type="button" disabled={Boolean(ocupado)} onClick={cancelarComentario}>Cancelar proceso</button><button type="submit" aria-label="Enviar comentario" disabled={Boolean(ocupado)}>{ocupado==='comentario'?'Enviando…':'Enviar'}</button></div></form>
  </div>
 </article>;
}

/* Presentación de Comunidad */

export function VistaComunidad({ sesion, publicaciones, buscar, setBuscar, mensaje, cargando, errorCarga, compartidos, errorCompartidos, categoria, destacados, refrescar, mostrarMensaje, cambiarCategoria, abrirTema, publicada, hayResultados, publicacionCompartida, publicacionEliminada, publicacionEditada }) {
return <><Navegacion pagina="comunidad" />
<main>

<section className="hero-comunidad">
<div className="contenedor">
<div className="hero-comunidad-contenido">
<div className="hero-comunidad-texto">
<span className="sobre-titulo">{" Comunidad "}</span>
<h1>{" Un espacio "}<span>{" para las patitas "}</span>
</h1>
<h2>{" Historias, consejos y personas con el mismo propósito. "}</h2>
<p>{" Comparte experiencias, resuelve dudas o ayuda difundiendo a patitas que aún esperan encontrar un hogar. "}</p>
<p className="hero-frase">{" Juntos podemos hacer la diferencia. 🐾 "}</p>
</div>
<div className="hero-comunidad-visual" aria-hidden="true">
<img className="imagen-comunidad" src="/img/comunidad.jpeg" alt="" />

</div>
</div>
</div>
</section>

<section className="seccion-filtros-comunidad">
<div className="contenedor">
<div className="barra-comunidad">
<div className="filtros-publicaciones" id="filtrosPublicaciones">
{filtrosComunidad.map(([id, icono, titulo, subtitulo]) => <button key={id} className={"filtro-publicacion" + (categoria === id ? " activo" : "")} type="button" data-filtro={id} onClick={() => cambiarCategoria(id)} aria-pressed={categoria === id}>
<span aria-hidden="true">{` ${icono} `}</span>
<span>{` ${titulo} `}{subtitulo && <small>{` ${subtitulo} `}</small>}</span>
</button>)}
</div>

<div className="buscador-comunidad">
<span aria-hidden="true">{" ⌕ "}</span>
<input id="buscarPublicaciones" type="search" placeholder="Buscar publicaciones..." aria-label="Buscar publicaciones" autoComplete="off" value={buscar} onChange={e => setBuscar(e.target.value)} />
</div>
</div>
</div>
</section>

<section className="seccion-comunidad">
<div className="contenedor">
<div className="comunidad-grid">

<div className="columna-publicaciones">

<NuevaPublicacion publicarServicio={crearPublicacion} onPublicada={publicada} mostrarMensaje={mostrarMensaje} mensaje={mensaje} />

<div className="acciones-publicacion-proceso"><button className="boton boton-secundario" type="button" disabled={cargando} onClick={refrescar}>{errorCarga?"Reintentar publicaciones":"Actualizar publicaciones"}</button></div>
{cargando&&<p role="status">Actualizando publicaciones…</p>}{errorCarga&&<p role="alert">{errorCarga}</p>}{errorCompartidos&&<p role="alert">No pudimos recuperar tus compartidos. {errorCompartidos}</p>}
<div className="lista-publicaciones" id="listaPublicaciones" aria-busy={cargando}>{publicaciones.map(p=><Publicacion key={p.id} publicacion={p} hidden={!coincidePublicacion(p,categoria,buscar)} sesion={sesion} compartido={compartidos.has(p.id)} onCompartido={publicacionCompartida} onEliminada={publicacionEliminada} onEditada={publicacionEditada}/>)}</div>

<div className="sin-publicaciones" id="sinPublicaciones" hidden={hayResultados || cargando || Boolean(errorCarga)}>
<span aria-hidden="true">{" 🐾 "}</span>
<h3>{" No encontramos publicaciones "}</h3>
<p>{" Prueba con otra búsqueda o categoría. "}</p>
</div>
</div>

<aside className="barra-lateral-comunidad">

<section className="tarjeta-comunidad peh-tarjeta-interactiva">
<div className="titulo-tarjeta-lateral">
<h2>{" 💬 Temas de la comunidad "}</h2>
</div>
<div className="lista-temas">
<button className="tema-comunidad" type="button" data-busqueda="primeros días en casa" onClick={() => abrirTema("todas","primeros días en casa")}>
<span className="icono-tema">{" 🏠 "}</span>
<span>
<strong>{" Primeros días en casa "}</strong>
<small>{" Adaptación y bienvenida "}</small>
</span>
</button>
<button className="tema-comunidad" type="button" data-busqueda="alimentación" onClick={() => abrirTema("todas","alimentación")}>
<span className="icono-tema">{" 🍽 "}</span>
<span>
<strong>{" Consejos de alimentación "}</strong>
<small>{" Cuidados cotidianos "}</small>
</span>
</button>
<button className="tema-comunidad" type="button" data-categoria="adopcion" onClick={() => abrirTema("adopcion","")}>
<span className="icono-tema">{" 🧡 "}</span>
<span>
<strong>{" Historias de adopción "}</strong>
<small>{" Experiencias de familias "}</small>
</span>
</button>
<button className="tema-comunidad" type="button" data-busqueda="gato" onClick={() => abrirTema("todas","gato")}>
<span className="icono-tema">{" 🐱 "}</span>
<span>
<strong>{" Adaptación de gatos "}</strong>
<small>{" Experiencias y consejos "}</small>
</span>
</button>
<button className="tema-comunidad" type="button" data-categoria="difusion" onClick={() => abrirTema("difusion","")}>
<span className="icono-tema">{" 📣 "}</span>
<span>
<strong>{" Difusión de patitas "}</strong>
<small>{" Ayuda a encontrar hogares "}</small>
</span>
</button>
</div>
</section>

<section className="tarjeta-comunidad peh-tarjeta-interactiva">
<div className="titulo-tarjeta-lateral">
<h2>{" 🐾 Buscan un hogar "}</h2>
<a href="#animales" className="boton-texto peh-enlace">{" Ver todos "}</a>
</div>
<p className="descripcion-patitas">{" Algunas patitas que actualmente esperan encontrar una familia. "}</p>
<div className="patitas-destacadas" id="patitasDestacadas" aria-label="Animales que llevan más tiempo esperando">{destacados.map(animal => <a className="patita-destacada" key={animal.id} href={`#animal/${encodeURIComponent(animal.slug)}`}><div className="foto-patita"><img src={animal.imagen} alt={`${animal.nombre}, ${animal.especie === "perro" ? "perro" : "gato"} en adopción`} loading="lazy" /></div><strong>{animal.nombre}</strong><small>En adopción</small></a>)}</div>
</section>

<section className="tarjeta-comunidad tarjeta-orientacion peh-tarjeta-interactiva">
<h2>{" ¿Necesitas orientación? "}</h2>
<p>{" Comparte, participa y ayuda a construir una comunidad consciente y comprometida con los animales. "}</p>
<a className="enlace-orientacion peh-enlace" href="#contacto">{" Contáctanos → "}</a>
</section>
</aside>
</div>
</div>
</section>
</main>

 </>;
}
