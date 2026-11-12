import { useAplicacion } from './hooks/global.jsx';
import { PiePagina, AccesoRequerido, Navegacion, ProveedorCuentaCabecera } from './components/global.jsx';
import Desarrollador from './pages/Desarrollador.jsx';
import Perfil from './pages/Perfil.jsx';
import { lazy, Suspense } from 'react';
import Login from './pages/Login.jsx';
import Principal from './pages/Principal.jsx';
import Animal from './pages/Animal.jsx';
import Veterinaria from './pages/Veterinaria.jsx';
import Contacto from './pages/Contacto.jsx';
import { requiereSesion } from './services/global.js';
const Comunidad = lazy(() => import("./pages/Comunidad.jsx"));

export default function App() {
 const { sesion, setSesion, ruta, setRuta, error, saliendo, irAlLogin, salir } = useAplicacion();

 if(!sesion)return <Login onAcceso={setSesion}/>;
 const pagina=ruta.split('/')[0];
 const cuentaCabecera={sesion,saliendo,error,onCerrarSesion:salir};
 if(requiereSesion(ruta,sesion))return <ProveedorCuentaCabecera cuenta={cuentaCabecera}><AccesoRequerido pagina={pagina} onIniciarSesion={irAlLogin}/><PiePagina pagina={pagina}/></ProveedorCuentaCabecera>;
 let contenido;
 if(['inicio','animales'].includes(pagina))contenido=<Principal cuentaCabecera={cuentaCabecera}/>;
 else if(pagina==='animal')contenido=<Animal key={`${sesion.id}-${ruta}`} identificador={(()=>{try{return decodeURIComponent(ruta.split('/')[1]||'milo');}catch{return null;}})()} onIniciarSesion={irAlLogin}/>;
 else if(pagina==='comunidad')contenido=<Suspense fallback={<p role="status">Cargando comunidad…</p>}><Comunidad key={sesion.id} sesion={sesion} categoriaRuta={ruta.split('/')[1]} publicacionId={ruta.split('/')[2]} ruta={ruta} onRuta={setRuta}/></Suspense>;
 else if(pagina==='veterinaria')contenido=<Veterinaria key={sesion.id}/>;
 else if(pagina==='contacto')contenido=<Contacto key={sesion.id}/>;
 else if(pagina==='perfil')contenido=<Perfil key={sesion.id} sesion={sesion} seccionRuta={ruta.split('/')[1]}/>;
 else if(pagina==='desarrollador')contenido=<Desarrollador key={sesion.id} sesion={sesion}/>;
 else contenido=<><Navegacion pagina={pagina}/><main className="contenedor peh-pendiente"><h1>Página no encontrada</h1><p>No encontramos la página que buscas.</p><a className="boton boton-primario peh-boton-fondo" href="#inicio">Volver al inicio</a></main></>;
 return <ProveedorCuentaCabecera cuenta={cuentaCabecera}>{contenido}<PiePagina pagina={pagina}/></ProveedorCuentaCabecera>;
}
