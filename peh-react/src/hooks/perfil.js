/* Perfil: secciones, cuenta, preferencias e historiales de trámites. */
import { useEffect, useState, useRef } from 'react';
import { listarMisAdopciones, cancelarMiAdopcion } from '../services/animal.js';
import { useBorrador } from './global.jsx';
import { guardarPerfil, guardarPreferencias, cambiarContrasena, leerPreferencias } from '../services/perfil.js';
import { listarMisConsultas, cancelarMiConsulta } from '../services/contacto.js';
import { listarMisReservas, cancelarMiReserva } from '../services/veterinaria.js';
/* Hooks exclusivos de Perfil: carga de historiales y proceso de adopciones. */

/* Actualización de los tres historiales de Perfil. */
// Actualización compartida por los tres historiales de Perfil.
// Cada proceso conserva sus operaciones y su bloqueo durante cancelaciones.
export function useHistorialPerfil(usuarioId, campo, listar, mutando = null) {
  const [estado,setEstado] = useState(() => ({[campo]:[],cargando:true,error:''}));
  const [intento,setIntento] = useState(0);
  useEffect(() => {
    let activo = true, peticion;
    function cargar() {
      if (document.visibilityState === 'hidden' || mutando?.current) return;
      peticion?.abort();
      const controller = new AbortController();
      peticion = controller;
      setEstado(actual => ({...actual,cargando:true,error:''}));
      listar({signal:controller.signal}).then(registros => {
        if (activo && !controller.signal.aborted) setEstado({[campo]:registros,cargando:false,error:''});
      }).catch(error => {
        if (activo && !controller.signal.aborted && error.name !== 'AbortError') {
          setEstado({[campo]:[],cargando:false,error:error.message});
        }
      });
    }
    cargar();
    const timer = setInterval(cargar,30_000);
    window.addEventListener('focus',cargar);
    document.addEventListener('visibilitychange',cargar);
    return () => {
      activo = false;
      peticion?.abort();
      clearInterval(timer);
      window.removeEventListener('focus',cargar);
      document.removeEventListener('visibilitychange',cargar);
    };
  },[usuarioId,campo,listar,mutando,intento]);
  return {estado,setEstado,setIntento};
}

/* Filtro, confirmación y cancelación de solicitudes de adopción. */
export function useAdopcionesPerfil(usuarioId) {
  const [filtro,setFiltro] = useState('todas');
  const [confirmar,setConfirmar] = useState(null), [cancelando,setCancelando] = useState(null), [mensaje,setMensaje] = useState('');
  const vivo = useRef(false), mutando = useRef(false), focoAnterior = useRef(null), botonConfirmar = useRef(null);
  useEffect(() => {
    vivo.current = true;
    return () => { vivo.current = false; };
  }, []);
  const {estado,setEstado,setIntento} = useHistorialPerfil(usuarioId, 'solicitudes', listarMisAdopciones, mutando);
  useEffect(()=>{
    if (!confirmar) return;
    focoAnterior.current=document.activeElement;botonConfirmar.current?.focus();
    const teclado=e=>{
      if(e.key==='Escape' && !mutando.current)setConfirmar(null);
      if(e.key==='Tab'){
        const botones=botonConfirmar.current?.closest('[role="dialog"]')?.querySelectorAll('button:not(:disabled)');
        if(!botones?.length)return;
        const primero=botones[0],ultimo=botones[botones.length-1];
        if(e.shiftKey&&document.activeElement===primero){e.preventDefault();ultimo.focus();}
        else if(!e.shiftKey&&document.activeElement===ultimo){e.preventDefault();primero.focus();}
      }
    };
    document.body.classList.add('modal-abierto');document.addEventListener('keydown',teclado);
    return ()=>{document.body.classList.remove('modal-abierto');document.removeEventListener('keydown',teclado);focoAnterior.current?.focus();};
  },[confirmar]);
  async function cancelar() {
    if(mutando.current || !confirmar)return;
    mutando.current=true;setCancelando(confirmar.id);setMensaje('');
    try {
      const actual=await cancelarMiAdopcion(confirmar.id);
      if(vivo.current){setEstado(prev=>({...prev,solicitudes:prev.solicitudes.map(s=>s.id===actual.id?actual:s)}));setMensaje('La solicitud fue cancelada.');setConfirmar(null);}
    }catch(error){if(vivo.current && error.name !== 'AbortError'){setMensaje(error.message+' Actualiza el historial para comprobar su estado.');setConfirmar(null);}}
    finally{mutando.current=false;if(vivo.current){setCancelando(null);setIntento(n=>n+1);}}
  }
  function solicitarCancelacion(solicitud) {setMensaje('');setConfirmar(solicitud);}
return { estado, setEstado, filtro, setFiltro, confirmar, setConfirmar, cancelando, mensaje, setMensaje, setIntento, botonConfirmar, cancelar , solicitarCancelacion };
}

/* pages/Perfil.jsx — Perfil */
export function usePerfil({ sesion, seccionRuta }) {
const [seccionActiva,setSeccionActiva] = useState(seccionRuta==='consultas'?'consultasPerfil':'misAdopcionesApi');
const adopciones = useAdopcionesPerfil(sesion.id);
useEffect(() => {
    document.body.classList.add('pagina-perfil');
    return () => document.body.classList.remove('pagina-perfil');
  }, []);
function seleccionarSeccion(id) {setSeccionActiva(id);irASeccionPerfil(id);}
return { seccionActiva, setSeccionActiva, adopciones , seleccionarSeccion };
}

import { camposDatosPersonales as campos } from '../data/perfil.js';
export { camposDatosPersonales as campos } from '../data/perfil.js';

/* components/perfil.jsx — DatosPersonales */
export function useDatosPersonales({ sesion }) {
const inicial = () => Object.fromEntries(campos.map(([k]) => [k, sesion[k] || '']));
const [datos, setDatos, borrador] = useBorrador('perfil-api:datos', inicial);
const [errores, setErrores] = useState({});
const [mensaje, setMensaje] = useState('');
const [ocupado, setOcupado] = useState(false);
const bloqueo = useRef(false), vivo = useRef(false);
useEffect(() => { vivo.current = true; return () => { vivo.current = false; }; }, []);
async function guardar(e) {
    e.preventDefault(); if (bloqueo.current) return;
    bloqueo.current = true; setOcupado(true); setErrores({}); setMensaje('');
    try {
      const usuario = await guardarPerfil(datos);
      if (vivo.current) { borrador.reiniciar(Object.fromEntries(campos.map(([k]) => [k, usuario[k] || '']))); setMensaje('Tus datos fueron actualizados.'); }
    } catch (error) {
      if (vivo.current && error.name !== 'AbortError') { setMensaje(error.message); setErrores(error.errores || {}); }
    } finally { bloqueo.current = false; if (vivo.current) setOcupado(false); }
  }
function cancelarDatos() {borrador.reiniciar(inicial());setErrores({});setMensaje('');}
return { inicial, datos, setDatos, borrador, errores, setErrores, mensaje, setMensaje, ocupado, guardar , cancelarDatos };
}

/* components/perfil.jsx — Preferencias */
export function usePreferenciasPerfil({ inicial }) {
const [datos,setDatos,borrador] = useBorrador('perfil-api:preferencias', () => ({notificaciones:{...inicial.notificaciones},adopcion:{...inicial.adopcion}}));
const [guardadas,setGuardadas] = useState(inicial);
const [mensaje,setMensaje] = useState(''), [ocupado,setOcupado] = useState(false);
const bloqueo = useRef(false), vivo = useRef(false);
useEffect(() => {vivo.current=true;return () => {vivo.current=false;};},[]);
function cambiar(grupo,k,valor) {setDatos(d=>({...d,[grupo]:{...d[grupo],[k]:valor}}));}
async function guardar(e) {
    e.preventDefault();if(bloqueo.current)return;
    bloqueo.current=true;setOcupado(true);setMensaje('');
    try {
      const resultado=await guardarPreferencias(datos);
      if(vivo.current){setGuardadas(resultado);borrador.reiniciar(resultado);setMensaje('Preferencias guardadas.');}
    }catch(error){if(vivo.current && error.name!=='AbortError')setMensaje(error.message);}
    finally{bloqueo.current=false;if(vivo.current)setOcupado(false);}
  }
function cancelarPreferencias() {borrador.reiniciar(guardadas);setMensaje('');}
return { datos, borrador, guardadas, mensaje, setMensaje, ocupado, cambiar, guardar , cancelarPreferencias };
}

/* components/perfil.jsx — Seguridad */
export function useSeguridadPerfil() {
const [datos,setDatos]=useState({actual:'',nueva:'',confirmar:''});
const [mensaje,setMensaje]=useState(''),[ocupado,setOcupado]=useState(false);
const bloqueo=useRef(false),vivo=useRef(false);
useEffect(()=>{vivo.current=true;return ()=>{vivo.current=false;};},[]);
async function guardar(e) {
    e.preventDefault();if(bloqueo.current)return;
    bloqueo.current=true;setOcupado(true);setMensaje('');
    try{await cambiarContrasena(datos.actual,datos.nueva,datos.confirmar);}
    catch(error){if(vivo.current && error.name!=='AbortError')setMensaje(error.message);}
    finally{bloqueo.current=false;if(vivo.current)setOcupado(false);}
  }
function cancelarContrasena() {setDatos({actual:'',nueva:'',confirmar:''});setMensaje('');}
return { datos, setDatos, mensaje, setMensaje, ocupado, guardar , cancelarContrasena };
}

import { preferenciasVacias as vacias } from '../data/perfil.js';

/* components/perfil.jsx — ConfiguracionPerfil */
export function useConfiguracionPerfil({ sesion }) {
const [estado,setEstado]=useState({datos:null,error:''}),[intento,setIntento]=useState(0);
useEffect(()=>{
    const controller=new AbortController();
    setEstado({datos:null,error:''});
    leerPreferencias({signal:controller.signal}).then(datos=>{if(!controller.signal.aborted)setEstado({datos:{...vacias,...datos},error:''});})
      .catch(error=>{if(!controller.signal.aborted)setEstado({datos:null,error:error.message});});
    return ()=>controller.abort();
  },[sesion.id,intento]);
return { estado, setIntento };
}

/* components/perfil.jsx — ListaReservas */
export function useFiltroReservas() {
const [filtro,setFiltro]=useState('todas');
return { filtro, setFiltro };
}

/* components/perfil.jsx — MisConsultas */
export function useConsultasPerfil({ usuarioId, enfocar }) {
const [filtro,setFiltro]=useState('Todas'),[cancelando,setCancelando]=useState(false),[mensaje,setMensaje]=useState('');
async function cancelar(c){
  if(cancelando||!window.confirm('¿Cancelar esta consulta? Quedará registrada como Cancelada en tu historial.'))return;
  setCancelando(true);setMensaje('');
  try{const nueva=await cancelarMiConsulta(c.id);setEstado(prev=>({...prev,consultas:prev.consultas.map(x=>x.id===nueva.id?nueva:x)}));setMensaje('La consulta fue cancelada.');}
  catch(e){setMensaje(e.message);}finally{setCancelando(false);}
 }
const {estado,setEstado,setIntento} = useHistorialPerfil(usuarioId, 'consultas', listarMisConsultas);
const enfocado=useRef(false),seccion=useRef(null);
useEffect(()=>{
  if(!enfocar){enfocado.current=false;return;}
  if(estado.cargando||enfocado.current)return;
  const frame=requestAnimationFrame(()=>{seccion.current?.scrollIntoView({block:'start'});enfocado.current=true;});
  return ()=>cancelAnimationFrame(frame);
 },[enfocar,estado.cargando]);
return { filtro, setFiltro, cancelando, mensaje, cancelar, estado, setIntento, seccion };
}

/* components/perfil.jsx — MisReservas */
export function useReservasPerfil({ usuarioId }) {
const [confirmar,setConfirmar]=useState(null),[cancelando,setCancelando]=useState(false),[mensaje,setMensaje]=useState('');
const vivo=useRef(false),mutando=useRef(false),volver=useRef(null);
useEffect(()=>{vivo.current=true;return ()=>{vivo.current=false;};},[]);
const {estado,setEstado,setIntento} = useHistorialPerfil(usuarioId, 'reservas', listarMisReservas, mutando);
useEffect(()=>{
  if(!confirmar)return;
  const anterior=document.activeElement,raiz=document.getElementById('root'),eraInerte=raiz?.inert;
  const habiaModal=document.body.classList.contains('modal-abierto');
  if(raiz)raiz.inert=true;document.body.classList.add('modal-abierto');volver.current?.focus();
  function teclado(e){
   if(e.key==='Escape'&&!mutando.current)setConfirmar(null);
   if(e.key!=='Tab')return;
   const botones=volver.current?.closest('[role="dialog"]')?.querySelectorAll('button:not(:disabled)');
   if(!botones?.length){e.preventDefault();return;}
   const primero=botones[0],ultimo=botones[botones.length-1];
   if(e.shiftKey&&document.activeElement===primero){e.preventDefault();ultimo.focus();}
   else if(!e.shiftKey&&document.activeElement===ultimo){e.preventDefault();primero.focus();}
  }
  document.addEventListener('keydown',teclado);
  return ()=>{if(raiz)raiz.inert=eraInerte;if(!habiaModal)document.body.classList.remove('modal-abierto');document.removeEventListener('keydown',teclado);anterior?.focus();};
 },[confirmar]);
async function cancelar(){
  if(mutando.current||!confirmar)return;
  mutando.current=true;setCancelando(true);setMensaje('');
  try {
   const actual=await cancelarMiReserva(confirmar.id);
   if(vivo.current){setEstado(prev=>({...prev,reservas:prev.reservas.map(r=>r.id===actual.id?actual:r)}));setMensaje('La reserva fue cancelada.');setConfirmar(null);}
  }catch(error){if(vivo.current&&error.name!=='AbortError'){setMensaje(error.message+' Actualiza el historial para comprobar su estado.');setConfirmar(null);}}
  finally{mutando.current=false;if(vivo.current){setCancelando(false);setIntento(n=>n+1);}}
 }
function solicitarCancelacionReserva(r) {setMensaje('');setConfirmar(r);}
return { confirmar, setConfirmar, cancelando, mensaje, setMensaje, volver, estado, setIntento, cancelar , solicitarCancelacionReserva };
}

/* components/perfil.jsx — SeccionPerfil */
export function useSeccionPerfil({ id, enfocar }) {
const [abierta,setAbierta] = useState(enfocar);
useEffect(() => {
    const abrir = e => {if(e.detail === id)setAbierta(true);};
    window.addEventListener('peh:abrir-seccion-perfil',abrir);
    return () => window.removeEventListener('peh:abrir-seccion-perfil',abrir);
  },[id]);
useEffect(() => {
    // La ruta externa #perfil/consultas debe abrir el acordeón aunque ya esté montado.
    // eslint-disable-next-line react/set-state-in-effect
    if(enfocar)setAbierta(true);
  },[enfocar]);
function alternarSeccion(e) {e.preventDefault();setAbierta(v=>!v);}
return { abierta, setAbierta , alternarSeccion };
}

function irASeccionPerfil(id) {
  window.dispatchEvent(new CustomEvent('peh:abrir-seccion-perfil', {detail:id}));
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}));
}
