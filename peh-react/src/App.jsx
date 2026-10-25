import AccesoRequerido from "./components/AccesoRequerido.jsx";
import { requiereSesion } from "./services/accesoInvitado.js";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Principal from "./pages/Principal";
import Animal from "./pages/Animal";
import Comunidad from "./pages/Comunidad";
import Veterinaria from "./pages/Veterinaria";
import Perfil from "./pages/Perfil";
import Contacto from "./pages/Contacto";
import Navegacion from "./components/Navegacion";
import PEH from "./services/peh";
import useCatalogo from "./hooks/useCatalogo";
import Desarrollador from "./pages/Desarrollador";

function animalDeRuta(ruta, animales = PEH.catalogo.listar()) {
  let identificador = ruta.split("/")[1] || "milo";
  try {
    identificador = decodeURIComponent(identificador);
  } catch {
    return null;
  }
  return animales.find(animal => animal.slug === identificador || String(animal.id) === identificador) || null;
}

function rutaActual() {
  return window.location.hash.slice(1) || "inicio";
}

function tituloDeRuta(ruta) {
  const pagina = ruta.split("/")[0];
  if (["inicio", "animales"].includes(pagina)) return "PEH | Encuentra a tu compañero";
  if (pagina === "animal") {
    const animal = animalDeRuta(ruta);
    return animal ? `${animal.nombre} | PEH` : "Animal no disponible | PEH";
  }
  const titulos = {
    comunidad: "Comunidad | PEH",
    veterinaria: "Veterinaria | PEH",
    perfil: "Mi perfil | PEH",
    contacto: "Contacto | PEH",
    desarrollador: "Administración | PEH"
  };
  return titulos[pagina] || "Página no encontrada | PEH";
}

export default function App() {
  const [sesion, setSesion] = useState(() => PEH.sesion.obtener());
  const [ruta, setRuta] = useState(rutaActual);
  const [error, setError] = useState("");
  const catalogo = useCatalogo();

  useEffect(() => {
    const cambiar = () => {
      setRuta(rutaActual());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", cambiar);
    return () => window.removeEventListener("hashchange", cambiar);
  }, []);

  useEffect(() => {
    document.title = requiereSesion(ruta,sesion) ? "Debes iniciar sesión | PEH" : sesion ? tituloDeRuta(ruta) : "PEH | Inicio de sesión";
    if (sesion && !sesion.invitado && ruta === "veterinaria/reservar") {
      const frame = requestAnimationFrame(() => document.getElementById("reservar")?.scrollIntoView({ block: "start" }));
      return () => cancelAnimationFrame(frame);
    }
  }, [sesion, ruta, catalogo]);

  useEffect(() => {
    const sincronizar = evento => {
      const clave = evento.type === "storage" ? evento.key : evento.detail?.clave;
      if (clave !== null && ![PEH.CLAVES.sesion, PEH.CLAVES.cuentas].includes(clave)) return;
      const nueva = PEH.sesion.obtener();
      setSesion(actual => JSON.stringify(actual) === JSON.stringify(nueva) ? actual : nueva);
    };
    window.addEventListener("storage", sincronizar);
    window.addEventListener("peh:actualizado", sincronizar);
    return () => { window.removeEventListener("storage", sincronizar); window.removeEventListener("peh:actualizado", sincronizar); };
  }, []);

  function volverAlAcceso() {
    setError("");
    setSesion(null);
    window.location.hash = "inicio";
  }

  function irAlLogin() {
    if (!PEH.sesion.cerrar()) throw new Error("No pudimos abrir el inicio de sesión. Inténtalo nuevamente.");
    volverAlAcceso();
  }

  function cerrarSesion() {
    if (!PEH.sesion.cerrar()) {
      setError("No pudimos cerrar la sesión. Inténtalo otra vez.");
      return;
    }
    volverAlAcceso();
  }

  if (!sesion) return <Login onAcceso={setSesion} />;

  const pagina = ruta.split("/")[0];
  if (requiereSesion(ruta,sesion)) return <AccesoRequerido pagina={pagina} onIniciarSesion={irAlLogin}/>;
  if (["inicio", "animales"].includes(pagina)) return <Principal soloAnimales={pagina === "animales"} />;
  if (pagina === "animal") return <Animal key={`${sesion.id}-${ruta}`} animal={animalDeRuta(ruta, catalogo)} onIniciarSesion={irAlLogin} />;
  if (pagina === "comunidad") return <Comunidad key={sesion.id} sesion={sesion} categoriaRuta={ruta.split("/")[1]} publicacionId={ruta.split("/")[2]} ruta={ruta} onRuta={setRuta} />;
  if (pagina === "veterinaria") return <Veterinaria key={sesion.id} />;
  if (pagina === "perfil") return <Perfil key={sesion.id} onCerrarSesion={volverAlAcceso} />;
  if (pagina === "contacto") return <Contacto key={sesion.id} />;

  if (pagina === "desarrollador") return <Desarrollador key={sesion.id} onCerrarSesion={volverAlAcceso} />;
  return (
    <div className={`peh-app peh-vista-${pagina}`}>
      <Navegacion pagina={pagina} />
      <div className="contenedor peh-sesion">
        <span>{sesion.invitado ? "Explorando como invitado" : `Hola, ${sesion.nombre}`}</span>
        <button type="button" className="boton boton-secundario" onClick={cerrarSesion}>
          {sesion.invitado ? "Volver al acceso" : "Cerrar sesión"}
        </button>
      </div>
      {error && <p className="contenedor" role="alert">{error}</p>}
      <main className="contenedor peh-pendiente">
        <h1>Página no encontrada</h1>
        <p>No encontramos la página que buscas.</p>
        <a className="boton boton-primario" href="#inicio">Volver al inicio</a>
      </main>
      <footer className="peh-pie">
        <div className="contenedor peh-footer-contenido">
          <div><strong>🐾 PEH</strong><p>Patitas Esperando un Hogar</p></div>
          <p>Construyendo nuevas historias,<br />una patita a la vez. ♡</p>
          <nav aria-label="Enlaces del pie"><a href="#inicio">Inicio</a><a href="#comunidad">Comunidad</a><a href="#contacto">Contacto</a></nav>
        </div>
        <div className="contenedor peh-footer-final">© 2026 PEH · Una comunidad para ayudar.</div>
      </footer>
    </div>
  );
}
