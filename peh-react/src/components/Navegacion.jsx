import "../styles/navegacion.css";
import { useEffect, useState } from "react";
import PEH from "../services/peh";
const enlaces = [["inicio", "Inicio"], ["animales", "Animales"], ["comunidad", "Comunidad"], ["veterinaria", "Veterinaria"], ["perfil", "Perfil"], ["contacto", "Contacto"]];
export default function Navegacion({ pagina }) {
  const enlacesVisibles = PEH.admin.esAdmin() ? [...enlaces, ["desarrollador", "Administración"]] : enlaces;
  const [abierta, setAbierta] = useState(false);
  useEffect(() => {
    const ajustar = () => { if (window.innerWidth > 1000) setAbierta(false); };
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, []);
  useEffect(() => {
    if (!abierta) return;
    const cerrarConEscape = e => { if (e.key === "Escape") setAbierta(false); };
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [abierta]);
  return <header className="cabecera-global"><div className="contenedor cabecera-contenido">
    <a className="marca marca-principal" href="#inicio" onClick={() => setAbierta(false)} aria-label="Ir al inicio de PEH"><span className="simbolo-marca">PEH</span><span className="nombre-marca">Patitas Esperando<span>un Hogar</span></span></a>
    <nav id="navegacionGlobal" className={`navegacion-principal${abierta ? " abierta" : ""}`} aria-label="Navegación principal" onKeyDown={e => { if (e.key === "Escape") setAbierta(false); }}>
      {enlacesVisibles.map(([ruta, nombre]) => <a key={ruta} className={`enlace-navegacion${pagina === ruta ? " activo" : ""}`} href={`#${ruta}`} aria-current={pagina === ruta ? "page" : undefined} onClick={() => setAbierta(false)}>{nombre}</a>)}
    </nav>
    <button id="botonMenu" className="boton-menu" type="button" aria-label={abierta ? "Cerrar menú" : "Abrir menú"} aria-controls="navegacionGlobal" aria-expanded={abierta} onClick={() => setAbierta(!abierta)}><span /><span /><span /></button>
  </div></header>;
}
