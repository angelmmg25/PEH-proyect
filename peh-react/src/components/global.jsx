/* Componentes compartidos por la aplicación.
 * La lógica de estado y procesos se obtiene de hooks.
 */
import { useTarjetaAcceso, useAccesoRequerido, ContextoCuentaCabecera, useNavegacion } from '../hooks/global.jsx';
import { mensajesAcceso, frasesPiePagina as frases } from '../data/global.js';
/* AccesoRequerido */

export function TarjetaAcceso({ descripcion, onIniciarSesion, onCerrar, tituloId }) {
  const { error, iniciar } = useTarjetaAcceso({ onIniciarSesion });
  
  return <section className="acceso-requerido-tarjeta" aria-labelledby={tituloId}>
    {onCerrar && <button type="button" className="acceso-requerido-cerrar" onClick={onCerrar} aria-label="Cerrar aviso y volver al animal">×</button>}
    <span className="acceso-requerido-icono" aria-hidden="true"><span className="acceso-requerido-candado-cuerpo"><span className="acceso-requerido-candado-llave"/></span></span>
    <h1 id={tituloId}>Debes iniciar sesión</h1>
    <p>{descripcion}</p>
    <button type="button" className="acceso-requerido-iniciar" autoFocus onClick={iniciar}>Iniciar sesión</button>
    {error && <p className="acceso-requerido-error" role="alert">{error}</p>}
  </section>;
}

export function AccesoRequerido({ pagina, onIniciarSesion }) {
  const { tituloId } = useAccesoRequerido();
  return <><Navegacion pagina={pagina}/><main className="acceso-requerido-pagina">
    <TarjetaAcceso tituloId={tituloId} descripcion={mensajesAcceso[pagina] || 'Accede a tu cuenta para entrar a esta sección.'} onIniciarSesion={onIniciarSesion}/>
  </main></>;
}

/* IconoPerfil */
export function IconoPerfil({tipo}) {
  const dibujos = {
    adopciones: <><ellipse cx="8" cy="7" rx="2" ry="2.7"/><ellipse cx="15" cy="6" rx="2" ry="2.7"/><ellipse cx="3.5" cy="12" rx="1.8" ry="2.4"/><ellipse cx="20" cy="11" rx="1.8" ry="2.4"/><path d="M6 19c-2-3 2-8 6-8s8 5 6 8c-1 2-4 0-6 0s-5 2-6 0Z"/></>,
    reservas: <><path d="M5 3H3v7a5 5 0 0 0 10 0V3h-2M8 15v2a5 5 0 0 0 10 0v-2"/><circle cx="18" cy="12" r="3"/></>,
    consultas: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></>,
    datos: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2Z"/></>,
    preferencias: <><path d="M3 5h18M3 12h18M3 19h18"/><circle cx="8" cy="5" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="9" cy="19" r="2"/></>,
    seguridad: <><rect x="5" y="10" width="14" height="12" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 15v3"/></>
  };
  return <svg className="icono-perfil-unificado" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{dibujos[tipo] || dibujos.consultas}</svg>;
}

/* Navegacion */

export function ProveedorCuentaCabecera({ cuenta, children }) {
  return <ContextoCuentaCabecera.Provider value={cuenta}>{children}</ContextoCuentaCabecera.Provider>;
}
export function Navegacion({ pagina, cuenta: cuentaProp = null }) {
  const { cuenta, barraDistribuida, esAdmin, enlacesVisibles, abierta, setAbierta , tecladoMenu } = useNavegacion({ cuentaProp });

  return <header className={"cabecera-global" + (barraDistribuida ? " cabecera-distribuida" : "") + (esAdmin && barraDistribuida ? " cabecera-administrador" : "")}><div className="contenedor cabecera-contenido">
    <a className="marca marca-principal" href="#inicio" onClick={() => setAbierta(false)} aria-label="Ir al inicio de PEH"><span className="simbolo-marca">PEH</span><span className="nombre-marca">Patitas Esperando<span>un Hogar</span></span></a>
    <nav id="navegacionGlobal" className={`navegacion-principal${abierta ? " abierta" : ""}`} aria-label="Navegación principal" onKeyDown={tecladoMenu}>
      {enlacesVisibles.map(([ruta, nombre]) => <a key={ruta} className={`enlace-navegacion${pagina === ruta ? " activo" : ""}`} href={`#${ruta}`} aria-current={pagina === ruta ? "page" : undefined} onClick={() => setAbierta(false)}>{nombre}</a>)}
    </nav>
    {cuenta && <div className="cuenta-cabecera">
      {!cuenta.sesion.invitado && <><span className="saludo-cabecera" title={`Hola, ${cuenta.sesion.nombre}`}>Hola, {cuenta.sesion.nombre}{cuenta.sesion.usuario && <small className="usuario-cabecera">{cuenta.sesion.usuario}</small>}</span>
        <button className="cerrar-sesion-cabecera" type="button" disabled={cuenta.saliendo} onClick={cuenta.onCerrarSesion}>{cuenta.saliendo ? "Cerrando sesión…" : "Cerrar sesión"}</button>
        {cuenta.error && <p className="error-cuenta-cabecera" role="alert">{cuenta.error}</p>}</>}
    </div>}
    <button id="botonMenu" className="boton-menu" type="button" aria-label={abierta ? "Cerrar menú" : "Abrir menú"} aria-controls="navegacionGlobal" aria-expanded={abierta} onClick={() => setAbierta(!abierta)}><span /><span /><span /></button>
  </div></header>;
}

/* PiePagina */

export function PiePagina({pagina = 'inicio'}) {
  const [inicio, destacado] = frases[pagina] || frases.comunidad;
  return <footer className="peh-pie-global" aria-label="Pie de página PEH">
    <div className="peh-pie-interior">
      <div className="peh-pie-marca">
        <strong><span className="peh-pie-huellas" aria-hidden="true">🐾</span> PEH</strong>
        <span className="peh-pie-nombre">Patitas Esperando un Hogar</span>
      </div>
      <div className="peh-pie-centro">
        <p className="peh-pie-frase">{inicio}<strong>{destacado}</strong></p>
        <nav className="peh-pie-enlaces" aria-label="Enlaces del pie de página">
          <a href="#inicio">Inicio</a>
          <a href="#comunidad">Comunidad</a>
          <a href="#veterinaria">Veterinaria</a>
          <a href="#contacto">Ayuda</a>
        </nav>
      </div>
      <div className="peh-pie-final">
        <div className="peh-pie-mascotas" aria-hidden="true"><span>♡</span><span>🐕</span><span>🐈</span></div>
        <p className="peh-pie-copyright">© 2026 PEH</p>
      </div>
    </div>
  </footer>;
}

export function AvisoBorrador({estado}) {return estado.aviso?<p className="aviso-borrador-general" role="status">{estado.aviso}</p>:null;}
