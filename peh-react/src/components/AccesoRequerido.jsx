import { useEffect, useId, useRef, useState } from 'react';
import Navegacion from './Navegacion';
import '../styles/accesoRequerido.css';

const mensajesAcceso = {
  perfil: 'Accede a tu cuenta para ver tu perfil.',
  comunidad: 'Accede a tu cuenta para ingresar a la comunidad.',
  veterinaria: 'Accede a tu cuenta para ingresar a Veterinaria.',
  contacto: 'Accede a tu cuenta para contactarnos.',
  desarrollador: 'Accede a tu cuenta para ingresar a Administración.'
};

function TarjetaAcceso({ descripcion, onIniciarSesion, onCerrar, tituloId }) {
  const [error, setError] = useState('');
  function iniciar() {
    setError('');
    try { onIniciarSesion(); }
    catch (fallo) { setError(fallo.message || 'No pudimos abrir el inicio de sesión. Inténtalo nuevamente.'); }
  }
  return <section className="acceso-requerido-tarjeta" aria-labelledby={tituloId}>
    {onCerrar && <button type="button" className="acceso-requerido-cerrar" onClick={onCerrar} aria-label="Cerrar aviso y volver al animal">×</button>}
    <span className="acceso-requerido-icono" aria-hidden="true"><span className="acceso-requerido-candado-cuerpo"><span className="acceso-requerido-candado-llave"/></span></span>
    <h1 id={tituloId}>Debes iniciar sesión</h1>
    <p>{descripcion}</p>
    <button type="button" className="acceso-requerido-iniciar" autoFocus onClick={iniciar}>Iniciar sesión</button>
    {error && <p className="acceso-requerido-error" role="alert">{error}</p>}
  </section>;
}

export default function AccesoRequerido({ pagina, onIniciarSesion }) {
  const tituloId = useId();
  return <><Navegacion pagina={pagina}/><main className="acceso-requerido-pagina">
    <TarjetaAcceso tituloId={tituloId} descripcion={mensajesAcceso[pagina] || 'Accede a tu cuenta para entrar a esta sección.'} onIniciarSesion={onIniciarSesion}/>
  </main></>;
}

export function AvisoAdopcionInvitado({ onIniciarSesion, onCerrar }) {
  const dialogo = useRef(null), tituloId = useId();
  useEffect(() => {
    const elemento = dialogo.current, anterior = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!elemento.open) elemento.showModal();
    elemento.querySelector(".acceso-requerido-iniciar")?.focus();
    return () => {
      elemento.close(); document.body.style.overflow = overflow;
      if (anterior?.isConnected) anterior.focus();
    };
  }, []);
  return <dialog className="acceso-requerido-modal" style={{padding:0,border:0,borderRadius:"16px",background:"#fff",width:"min(400px, calc(100vw - 32px))",maxWidth:"calc(100vw - 32px)",boxSizing:"border-box",margin:"auto",overflow:"auto",outline:"none"}} ref={dialogo} aria-labelledby={tituloId} onCancel={e => e.preventDefault()}>
    <TarjetaAcceso tituloId={tituloId} descripcion="Accede a tu cuenta para continuar con la adopción." onIniciarSesion={onIniciarSesion} onCerrar={onCerrar}/>
  </dialog>;
}
