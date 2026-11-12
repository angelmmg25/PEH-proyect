/* Perfil animal: ficha, acceso a adopción y formulario de solicitud. */
import { useEffect, useState, useRef, useId } from 'react';
import PEH, { obtenerAnimal } from '../services/global.js';
import { useBorrador } from './global.jsx';
import { datosInicialesAdopcion, erroresSolicitud, limpiarCondicionales } from '../services/animal.js';
/* Carga y actualización de la ficha en la vista Perfil animal. */

export function useAnimal(identificador) {
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ identificador, animal: null, cargando: identificador !== undefined, error: '', noEncontrado: false });
  useEffect(() => {
    if (identificador === undefined) return;
    let activo = true;
    const cargar = () => {
      if (document.visibilityState === 'hidden') return;
      // Cada actualización cancela la anterior para no mostrar una respuesta vieja.
      peticion?.abort(); peticion = new AbortController();
      const actual = peticion;
      setEstado(previo => ({ ...previo, identificador, cargando: !previo.animal, error: '' }));
      obtenerAnimal(identificador, { signal: actual.signal }).then(animal => {
        if (activo && !actual.signal.aborted) setEstado({ identificador, animal, cargando: false, error: '', noEncontrado: false });
      }).catch(error => {
        if (activo && !actual.signal.aborted) setEstado({ identificador, animal: null, cargando: false, error: error.message, noEncontrado: error.estado === 404 });
      });
    };
    let peticion;
    cargar();
    window.addEventListener('focus', cargar);
    document.addEventListener('visibilitychange', cargar);
    const intervalo = setInterval(cargar, 30_000);
    return () => { activo = false; peticion?.abort(); clearInterval(intervalo); window.removeEventListener('focus', cargar); document.removeEventListener('visibilitychange', cargar); };
  }, [identificador, intento]);
  const estadoActual = estado.identificador === identificador ? estado : { animal: null, cargando: true, error: '', noEncontrado: false };
  return { ...estadoActual, recargar: () => setIntento(n => n + 1) };
}

/* pages/Animal.jsx — Animal */
export function usePerfilAnimal({ animalLocal, identificador }) {
const consulta = useAnimal(identificador);
const animal = identificador === undefined ? animalLocal : consulta.animal;
const [mensajeAdopcion, setMensajeAdopcion] = useState("");
const [enviandoAdopcion,setEnviandoAdopcion] = useState(false);
const [adoptando, setAdoptando] = useState(false);
const [avisoInvitado,setAvisoInvitado] = useState(false);
const sesionAnimal=PEH.sesion.obtener();
const puedeCompletar=Boolean(sesionAnimal?.id && !sesionAnimal.invitado);
useEffect(() => {
  document.body.classList.add("pagina-animal");
  document.title = animal ? `${animal.nombre} | PEH` : "Animal no disponible | PEH";
  return () => { document.body.classList.remove("pagina-animal", "adopcion-activa"); };
 }, [animal]);
useEffect(() => {
  document.body.classList.toggle("adopcion-activa", adoptando);
  return () => document.body.classList.remove("adopcion-activa");
 }, [adoptando]);
function abrirAdopcion() { if (animal.estadoPerfil !== "disponible") return; const usuario = PEH.sesion.obtener(); if (!usuario?.id || usuario.invitado) { setAvisoInvitado(true); return; } if (identificador !== undefined && usuario.origen !== "local") { setMensajeAdopcion("Inicia sesión para enviar tu solicitud."); return; } setAdoptando(true); window.scrollTo({top:0,behavior:"smooth"}); }
function cerrarAdopcion() { if(enviandoAdopcion)return; setAdoptando(false); window.scrollTo({top:0,behavior:"smooth"}); }
function verHistoria(e) {
  // Un ancla local no debe sustituir la ruta #animal/... de la aplicación.
  e.preventDefault(); document.getElementById("historiaAnimal")?.scrollIntoView();
 }
function adopcionEnviada() { setAdoptando(false); setMensajeAdopcion("¡Solicitud registrada! Puedes revisar su estado en tu perfil."); window.scrollTo({top:0,behavior:"smooth"}); }
return { consulta, animal, mensajeAdopcion, setMensajeAdopcion, enviandoAdopcion, setEnviandoAdopcion, adoptando, setAdoptando, avisoInvitado, setAvisoInvitado, sesionAnimal, puedeCompletar, abrirAdopcion, cerrarAdopcion, verHistoria , adopcionEnviada };
}

import { formularioAdopcionVacio as formularioVacio } from '../data/animal.js';

/* components/animal.jsx — FormularioAdopcion */
export function useFormularioAdopcion({ animal, onEnviada, enviarServicio, onProcesando , onCancelar }) {
const [datos,setDatos,borrador] = useBorrador("adopcion:" + animal.id, () => ({...formularioVacio, ...datosInicialesAdopcion()}));
const [errores,setErrores] = useState({}), [mensaje,setMensaje] = useState("");
const [procesando,setProcesando] = useState(false);
const [revisado,setRevisado] = useState(false);
const enviando = useRef(false);
function cambiar(e) {
  const {name,type,value,checked} = e.target;
  const nuevos = limpiarCondicionales({...datos,[name]:type === "checkbox" ? checked : value});
  setDatos(nuevos);
  const validacion = erroresSolicitud(nuevos);
  setErrores(actual => revisado ? validacion : {...actual,[name]:validacion[name] || "", ...(name === "viveConPersonas" && value === "no" ? {personasHogar:"",acuerdoFamiliar:""} : {}), ...(name === "otrosAnimales" && value === "no" ? {detalleAnimales:""} : {})});
 }
function revisarAlSalir(e) {
  const campo = e.target.name;
  if (!campo) return;
  const validacion = erroresSolicitud(datos);
  setErrores(actual => ({...actual,[campo]:validacion[campo] || ""}));
 }
async function enviar(e) {
  e.preventDefault();
  if(enviando.current) return;
  const nuevosErrores = erroresSolicitud(datos);setErrores(nuevosErrores);setRevisado(true);setMensaje("");
  if(Object.keys(nuevosErrores).length) {
   setMensaje("Revisa los campos indicados antes de enviar la solicitud.");
   e.currentTarget.elements.namedItem(Object.keys(nuevosErrores)[0])?.focus?.();
   const campo = e.currentTarget.querySelector('[name="' + Object.keys(nuevosErrores)[0] + '"]');campo?.focus();return;
  }
  enviando.current = true; setProcesando(true); onProcesando?.(true);
  try {
   const resultado = await enviarServicio(animal,datos);
   if(!resultado.ok) { setMensaje(resultado.mensaje); return; }

   borrador.reiniciar({...formularioVacio,...datosInicialesAdopcion()});
   onEnviada(resultado.solicitud);
  } catch (error) {
   setErrores(actual => ({...actual,...error.errores}));
   setMensaje(error.message || "Ocurrió un problema al registrar tu solicitud. Consulta tu perfil antes de volver a enviarla.");
  } finally { enviando.current = false; setProcesando(false); onProcesando?.(false); }
 }
function cancelarAdopcion() {if(borrador.reiniciar({...formularioVacio,...datosInicialesAdopcion()})){setErrores({});setMensaje("");onCancelar();}}
return { datos, borrador, errores, setErrores, mensaje, setMensaje, procesando, cambiar, revisarAlSalir, enviar , cancelarAdopcion };
}

/* components/animal.jsx — AvisoAdopcionInvitado */
export function useAvisoAdopcionInvitado() {
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
return { dialogo, tituloId };
}
