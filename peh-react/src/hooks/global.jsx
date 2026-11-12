import { useRef, useState, useId, useEffect, useMemo, useSyncExternalStore, useLayoutEffect, createContext, useContext } from 'react';
import PEH, { claveBorrador, leerBorrador, guardarBorrador, borrarBorrador, mensajeDeCampo, activarCatalogo, cargarCatalogo, obtenerEstadoCatalogo, suscribirCatalogo, obtenerSesion, cerrarSesionLocal, EVENTO_SESION, requiereSesion } from '../services/global.js';
/* Hooks compartidos por varias vistas o por la aplicación completa.
 * Cada hook conserva su responsabilidad y se importa por su nombre.
 * JSX se utiliza en los mensajes de validación y el aviso de borrador.
 */

/* BORRADORES — formularios, publicaciones y comentarios */
export function useBorrador(nombre,inicial,{activo=true,mostrarGuardado=true}={}) {
  const clave=claveBorrador(nombre);
  const habilitado=activo && Boolean(clave);
  const crear=()=>typeof inicial==='function'?inicial():inicial;
  const [datos,cambiarEstado]=useState(()=>{
    const defecto=crear(), guardado=habilitado?leerBorrador(clave):undefined;
    if(guardado===undefined)return defecto;
    if(defecto && typeof defecto==='object' && !Array.isArray(defecto))return {...defecto,...(guardado && typeof guardado==='object'&&!Array.isArray(guardado)?guardado:{})};
    if(defecto===null && (typeof guardado==="string" || guardado===null || typeof guardado==="object"))return guardado;
    return typeof guardado===typeof defecto?guardado:defecto;
  });
  const actual=useRef(datos);actual.current=datos;
  const [aviso,setAviso]=useState(()=>habilitado&&leerBorrador(clave)!==undefined?'Recuperamos tu solicitud sin enviar.':'');
  function setDatos(cambio) {
    const nuevo=typeof cambio==='function'?cambio(actual.current):cambio;
    actual.current=nuevo;cambiarEstado(nuevo);
    if(habilitado)setAviso(guardarBorrador(clave,nuevo)?(mostrarGuardado?'Borrador guardado.':''):'No pudimos guardar el borrador. Comprueba el almacenamiento del navegador.');
  }
  function borrar() {
    const ok=!habilitado||borrarBorrador(clave);
    setAviso(ok?'':'No pudimos eliminar el borrador. Inténtalo nuevamente.');return ok;
  }
  function reiniciar(nuevo=crear()) {
    if(!borrar())return false;
    actual.current=nuevo;cambiarEstado(nuevo);return true;
  }
  return [datos,setDatos,{borrar,reiniciar,aviso}];
}



/* VALIDACIÓN — mensajes y atributos de accesibilidad de formularios */
export function useValidacionFormulario() {
  const [errores,setErrores]=useState({});
  const prefijo="validacion-"+useId().replace(/[^a-zA-Z0-9_-]/g,"")+"-";
  function aplicar(control,form) {
    const nombre=control.name||control.id;if(!nombre)return '';
    const error=mensajeDeCampo(control,form);
    const relacionados=control.type==='radio'?Array.from(form.elements).filter(c=>c.name===control.name):[control];
    for(const campo of relacionados){campo.setAttribute('aria-invalid',String(Boolean(error)));campo.setAttribute('aria-describedby',prefijo+nombre);}
    return error;
  }
  function evento(e) {
    const control=e.target,form=control.form;if(!form)return;
    const nombre=control.name||control.id;if(!nombre)return;
    const error=aplicar(control,form);setErrores(actual=>({...actual,[nombre]:error}));
  }
  function validar(form) {
    if(!form)return true;
    const nuevos={};let primero;
    for(const control of Array.from(form.elements)){
      if(!['INPUT','TEXTAREA','SELECT'].includes(control.tagName))continue;
      const nombre=control.name||control.id;if(!nombre)continue;
      const error=aplicar(control,form);nuevos[nombre]=error;if(error&&!primero)primero=control;
    }
    setErrores(nuevos);primero?.focus();return !primero;
  }
  function mensaje(nombre) {return <small className="error-formulario-general" id={prefijo+nombre} aria-live="polite">{errores[nombre]||''}</small>;}
  function limpiar(){setErrores({});if(typeof document!=="undefined")for(const c of document.querySelectorAll('[aria-describedby^="'+prefijo+'"]'))c.setAttribute('aria-invalid','false');}
  function asignar(nombre,error){setErrores(actual=>({...actual,[nombre]:error}));if(typeof document!=="undefined")for(const c of document.querySelectorAll('[aria-describedby="'+prefijo+nombre+'"]'))c.setAttribute('aria-invalid',String(Boolean(error)));}
  return {errores,evento,validar,mensaje,limpiar,asignar};
}

/* CATÁLOGO — Inicio y Comunidad */
export function useEstadoCatalogo() {
  const estado = useSyncExternalStore(suscribirCatalogo, obtenerEstadoCatalogo, obtenerEstadoCatalogo);
  useEffect(activarCatalogo, []);
  const animales = useMemo(() => estado.animales.filter(a => ['disponible', 'en-proceso'].includes(a.estadoPerfil)), [estado.animales]);
  return { ...estado, animales, recargar: () => cargarCatalogo({ forzar: true }) };
}
// Conserva el contrato de array utilizado por Comunidad.
export function useCatalogo() { return useEstadoCatalogo().animales; }

/* NAVEGACIÓN — posición por cuenta y ruta */
const posiciones = new Map();
const claveDe = (cuenta,ruta) => `peh:scroll:${encodeURIComponent(cuenta)}:${encodeURIComponent(ruta)}`;
function leer(clave) {
  try {
    const valor = sessionStorage.getItem(clave);
    return valor === null ? null : Math.max(0,Number(valor) || 0);
  } catch { /* La navegación sigue funcionando sin almacenamiento disponible. */ }
  return posiciones.has(clave) ? posiciones.get(clave) : null;
}
function guardar(clave,valor) {
  const posicion = Math.max(0,Number(valor) || 0);
  posiciones.set(clave,posicion);
  try {sessionStorage.setItem(clave,String(posicion));} catch { /* Respaldo en memoria. */ }
}

export function useMemoriaNavegacion(ruta,cuenta) {
  useLayoutEffect(() => {
    if(!cuenta)return;
    const clave = claveDe(cuenta,ruta);
    // Los accesos a reservar, consultas o una publicación conservan su destino explícito.
    const destinoExplicito = ruta === 'veterinaria/reservar' || ruta === 'perfil/consultas' ||
      (ruta.startsWith('comunidad/') && Boolean(ruta.split('/')[2]));
    const recordada = leer(clave);
    const anclaInicial = ruta === 'animales' && recordada === null;
    const objetivo = destinoExplicito || anclaInicial ? null : recordada ?? 0;
    let restaurando = objetivo !== null, cerrado = false, frame, timer, observador, tamano;
    const actual = () => Math.max(0,window.scrollY || 0);
    let ultimaPosicion=actual();
    const alDesplazar = () => {if(!restaurando){ultimaPosicion=actual();guardar(clave,ultimaPosicion);}};
    function desconectar() {
      observador?.disconnect();tamano?.disconnect();
      clearTimeout(timer);cancelAnimationFrame(frame);
      window.removeEventListener('load',reintentar,true);
    }
    function terminar() {restaurando=false;desconectar();ultimaPosicion=actual();guardar(clave,ultimaPosicion);}
    function restaurar() {
      if(cerrado || !restaurando)return;
      window.scrollTo({top:objetivo,left:0,behavior:'instant'});
      const alto = Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);
      if(objetivo <= Math.max(0,alto-window.innerHeight))terminar();
    }
    function reintentar() {cancelAnimationFrame(frame);frame=requestAnimationFrame(restaurar);}
    // Una interacción real del usuario tiene prioridad sobre la restauración pendiente.
    const interrumpir = () => {if(restaurando)terminar();};
    window.addEventListener('scroll',alDesplazar,{passive:true});
    window.addEventListener('wheel',interrumpir,{passive:true});
    window.addEventListener('touchstart',interrumpir,{passive:true});
    window.addEventListener('pointerdown',interrumpir);
    window.addEventListener('keydown',interrumpir);
    if(restaurando) {
      const raiz = document.getElementById('root') || document.body;
      // Espera también al catálogo, listas lazy e imágenes que aumentan la altura de la vista.
      observador = new MutationObserver(reintentar);
      observador.observe(raiz,{childList:true,subtree:true});
      if(typeof ResizeObserver !== 'undefined') {tamano=new ResizeObserver(reintentar);tamano.observe(raiz);}
      window.addEventListener('load',reintentar,true);
      timer=setTimeout(terminar,4000);
      if(objetivo===0)restaurar();else reintentar();
    } else if(anclaInicial) {
      frame=requestAnimationFrame(()=>document.getElementById('animales')?.scrollIntoView({behavior:'instant'}));
    }
    return () => {
      // El DOM nuevo puede ser más bajo y limitar scrollY antes de desmontar esta vista.
      guardar(clave,restaurando ? objetivo : ultimaPosicion);
      cerrado=true;desconectar();
      window.removeEventListener('scroll',alDesplazar);
      window.removeEventListener('wheel',interrumpir);
      window.removeEventListener('touchstart',interrumpir);
      window.removeEventListener('pointerdown',interrumpir);
      window.removeEventListener('keydown',interrumpir);
    };
  },[ruta,cuenta]);
}

const rutaActual = () => window.location.hash.slice(1) || 'inicio';

/* App.jsx — App */
export function useAplicacion() {
useEffect(()=>{
  const abrir=e=>{
   const c=e.target;
   if(c instanceof HTMLInputElement && c.type==='date' && !c.disabled && !c.readOnly){
    try{c.showPicker?.();}catch{/* El navegador conserva su selector nativo. */}
   }
  };
  document.addEventListener('click',abrir);
  return()=>document.removeEventListener('click',abrir);
 },[]);
const [sesion,setSesion]=useState(obtenerSesion),[ruta,setRuta]=useState(rutaActual);
const [error,setError]=useState(''),[saliendo,setSaliendo]=useState(false);
useMemoriaNavegacion(ruta,sesion?.id);
useEffect(()=>{
  const actualizar=()=>setSesion(actual=>{const nueva=obtenerSesion();return JSON.stringify(actual)===JSON.stringify(nueva)?actual:nueva;});
  window.addEventListener('storage',actualizar);window.addEventListener('peh:actualizado',actualizar);window.addEventListener(EVENTO_SESION,actualizar);
  return ()=>{window.removeEventListener('storage',actualizar);window.removeEventListener('peh:actualizado',actualizar);window.removeEventListener(EVENTO_SESION,actualizar);};
 },[]);
useEffect(()=>{const cambiar=()=>{setRuta(rutaActual());};window.addEventListener('hashchange',cambiar);return ()=>window.removeEventListener('hashchange',cambiar);},[]);
useEffect(()=>{
  const pagina=ruta.split('/')[0];
  if(!sesion)document.title='PEH | Inicio de sesión';
  else if(requiereSesion(ruta,sesion))document.title='Debes iniciar sesión | PEH';
  else if(pagina!=='animal')document.title=({inicio:'PEH | Encuentra a tu compañero',animales:'PEH | Encuentra a tu compañero',comunidad:'Comunidad | PEH',veterinaria:'Veterinaria | PEH',contacto:'Contacto | PEH',perfil:'Mi perfil | PEH',desarrollador:'Administración | PEH'})[pagina]||'Página no encontrada | PEH';
  if(sesion&&!sesion.invitado&&ruta==='veterinaria/reservar'){const frame=requestAnimationFrame(()=>document.getElementById('reservar')?.scrollIntoView({block:'start'}));return ()=>cancelAnimationFrame(frame);}
 },[sesion,ruta]);
function volverAlAcceso(){setError('');setSesion(null);window.location.hash='inicio';}
function irAlLogin(){if(!PEH.sesion.cerrar())throw new Error('No pudimos abrir el inicio de sesión. Inténtalo nuevamente.');volverAlAcceso();}
async function salir(){if(saliendo)return;setSaliendo(true);setError('');try{await cerrarSesionLocal();volverAlAcceso();}catch(e){setError(e.message);}finally{setSaliendo(false);}}
return { sesion, setSesion, ruta, setRuta, error, saliendo, irAlLogin, salir };
}

export const ContextoCuentaCabecera = createContext(null);

import { enlacesNavegacion as enlaces } from '../data/global.js';

/* components/global.jsx — Navegacion */
export function useNavegacion({ cuentaProp }) {
const cuentaCompartida = useContext(ContextoCuentaCabecera);
const cuenta = cuentaProp || cuentaCompartida;
const barraDistribuida = Boolean(cuenta);
const esAdmin = PEH.admin.esAdmin();
const limiteMenu = esAdmin && barraDistribuida ? 1360 : barraDistribuida ? 1200 : 1000;
const enlacesVisibles = esAdmin ? [...enlaces, ["desarrollador", "Administración"]] : enlaces;
const [abierta, setAbierta] = useState(false);
useEffect(() => {
    const ajustar = () => { if (window.innerWidth > limiteMenu) setAbierta(false); };
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, [limiteMenu]);
useEffect(() => {
    if (!abierta) return;
    const cerrarConEscape = e => { if (e.key === "Escape") setAbierta(false); };
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [abierta]);
function tecladoMenu(e) { if (e.key === "Escape") setAbierta(false); }
return { cuenta, barraDistribuida, esAdmin, enlacesVisibles, abierta, setAbierta , tecladoMenu };
}

/* components/global.jsx — TarjetaAcceso */
export function useTarjetaAcceso({ onIniciarSesion }) {
const [error, setError] = useState('');
function iniciar() {
    setError('');
    try { onIniciarSesion(); }
    catch (fallo) { setError(fallo.message || 'No pudimos abrir el inicio de sesión. Inténtalo nuevamente.'); }
  }
return { error, iniciar };
}

/* components/global.jsx — AccesoRequerido */
export function useAccesoRequerido() {
const tituloId = useId();
return { tituloId };
}
