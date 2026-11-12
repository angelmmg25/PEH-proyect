/* Veterinaria: formulario de reserva y consejos en modal. */
import PEH from '../services/global.js';
import { useEffect, useRef, useState } from 'react';
import { fechaLocal, horarioFuturo, validarCampoReserva, registrarReserva, datosInicialesReserva, responsableInicialReserva, guardarBorradorReserva, eliminarBorradorReserva, leerBorradorReserva } from '../services/veterinaria.js';
import { camposReserva, reservaVacia } from '../data/veterinaria.js';
import { consejos } from '../data/veterinaria.js';
/* Estado, validación y envío del formulario exclusivo de Veterinaria. */

const vacio=reservaVacia;
import { nombresCampoReserva as nombresCampo } from '../data/veterinaria.js';
export function useFormularioVeterinaria(registrar=registrarReserva) {
 const [datos,setDatos]=useState(datosInicialesReserva);
 const [procesando,setProcesando]=useState(false);
 const vivo=useRef(false);
 const [errores,setErrores]=useState({});
 const [avisoBorrador,setAvisoBorrador]=useState(()=>leerBorradorReserva() ? "Recuperamos tu solicitud sin enviar." : "");
 const [registrado,setRegistrado]=useState(()=>Boolean(PEH.sesion.obtener()?.id && !PEH.sesion.obtener()?.invitado));
 const usuarioFormulario=useRef(PEH.sesion.obtener()?.id);
 const [mensaje,setMensaje]=useState({texto:" ",tipo:"",reserva:null});
 const [fechaMinima,setFechaMinima]=useState(()=>fechaLocal());
 const [momentoHoras,setMomentoHoras]=useState(()=>new Date());
 const formulario=useRef(null),aviso=useRef(null),bloqueo=useRef(false);
 useEffect(()=>{
  vivo.current=true;document.body.classList.add("pagina-veterinaria");document.title="Veterinaria | PEH";
  return ()=>{vivo.current=false;document.body.classList.remove("pagina-veterinaria");};
 },[]);
 useEffect(()=>{
  const sincronizar=()=>{
   const usuario=PEH.sesion.obtener(), id=usuario?.id;
   setRegistrado(Boolean(id && !usuario.invitado));
   if(id!==usuarioFormulario.current){usuarioFormulario.current=id;setDatos(datosInicialesReserva());setErrores({});setMensaje({texto:"",tipo:"",reserva:null});setAvisoBorrador(leerBorradorReserva()?"Recuperamos tu solicitud sin enviar.":"");}
  };
  window.addEventListener("peh:actualizado",sincronizar);window.addEventListener("storage",sincronizar);
  return ()=>{window.removeEventListener("peh:actualizado",sincronizar);window.removeEventListener("storage",sincronizar);};
 },[]);
 function comprobarSesion(){
  if(bloqueo.current)return false;
  const usuario=PEH.sesion.obtener();
  if(!usuario?.id || usuario.invitado){setRegistrado(false);window.alert("Debes iniciar sesión con una cuenta para reservar una atención veterinaria.");return false;}
  if(usuario.id!==usuarioFormulario.current){usuarioFormulario.current=usuario.id;setDatos(datosInicialesReserva());setErrores({});return false;}
  return true;
 }
 function guardarCambio(nuevos){
  if(!comprobarSesion())return;
  setDatos(nuevos);
  setAvisoBorrador(guardarBorradorReserva(nuevos)?"Borrador guardado.":"No pudimos guardar el borrador. Revisa el almacenamiento de tu navegador.");
 }
 function revisarAlSalir(e){const campo=nombresCampo[e.target.id];if(campo)setErrores(actual=>({...actual,[campo]:validarCampoReserva(campo,datos)}));}
 function cancelarSolicitud(){
  if(!comprobarSesion())return;
  if(!eliminarBorradorReserva()){setAvisoBorrador("No pudimos eliminar el borrador. Inténtalo nuevamente.");return;}
  setDatos({...vacio,...responsableInicialReserva()});setErrores({});setMensaje({texto:"",tipo:"",reserva:null});setAvisoBorrador("");setFechaMinima(fechaLocal());setMomentoHoras(new Date());
 }
 function cambiar(e) {
  if(!comprobarSesion())return;
  const campo=nombresCampo[e.target.id];
  if(!campo)return;
  const nuevos={...datos,[campo]:e.target.value};
  const ahora=new Date();
  if(campo==="fecha") {
   setFechaMinima(fechaLocal(ahora));setMomentoHoras(ahora);
   if(nuevos.fecha===fechaLocal(ahora) && nuevos.hora && !horarioFuturo(nuevos.fecha,nuevos.hora,ahora)) nuevos.hora="";
  }
  guardarCambio(nuevos);
  const cambios={[campo]:validarCampoReserva(campo,nuevos,ahora)};
  if(campo==="fecha" && nuevos.hora)cambios.hora=validarCampoReserva("hora",nuevos,ahora);
  setErrores(actual=>({...actual,...cambios}));
 }
 function elegirServicio(servicio) {
  if(!comprobarSesion())return;
  const nuevos={...datos,servicio};guardarCambio(nuevos);
  setErrores(actual=>({...actual,servicio:validarCampoReserva("servicio",nuevos)}));
  document.getElementById("reservar")?.scrollIntoView({behavior:"smooth",block:"center"});
 }
 function irReserva(e) {e.preventDefault();if(!comprobarSesion())return;document.getElementById("reservar")?.scrollIntoView();}
 async function reservar(e) {
  e.preventDefault();if(bloqueo.current || !comprobarSesion())return;
  const ahora=new Date();setFechaMinima(fechaLocal(ahora));
  setMensaje({texto:"",tipo:"",reserva:null});
  const nuevosErrores=Object.fromEntries(camposReserva.map(campo=>[campo,validarCampoReserva(campo,datos,ahora)]));
  setErrores(nuevosErrores);
  if(Object.values(nuevosErrores).some(Boolean)) {
   setMensaje({texto:"Revisa los campos marcados antes de continuar.",tipo:"error",reserva:null});
   const primero=Object.keys(nombresCampo).find(id=>nuevosErrores[nombresCampo[id]]);
   document.getElementById(primero)?.focus();return;
  }
  bloqueo.current=true;setProcesando(true);
  try {
   const resultado=await registrar(datos,ahora);
   if(!vivo.current)return;
   if(!resultado.ok) {setMensaje({texto:resultado.mensaje,tipo:"error",reserva:null});return;}
   setMensaje({texto:"",tipo:"exito",reserva:resultado.reserva});
   const borrado=eliminarBorradorReserva();setAvisoBorrador(borrado?"":"La reserva se registró, pero no pudimos eliminar el borrador guardado. Pulsa Cancelar proceso para intentarlo nuevamente.");
   setDatos({...vacio,...responsableInicialReserva()});setErrores(Object.fromEntries(camposReserva.map(campo=>[campo,""])));setFechaMinima(fechaLocal());setMomentoHoras(new Date());
   requestAnimationFrame(()=>aviso.current?.scrollIntoView({behavior:"smooth",block:"nearest"}));
  } catch(error) {
   if(vivo.current && error.name !== 'AbortError') {setErrores(actual=>({...actual,...error.errores}));setMensaje({texto:error.message || "No pudimos completar la reserva. Consulta tu perfil antes de reenviarla.",tipo:"error",reserva:null});}
  } finally {bloqueo.current=false;if(vivo.current)setProcesando(false);}
 }
 return { datos, procesando, errores, avisoBorrador, registrado, mensaje, fechaMinima, momentoHoras, formulario, aviso, revisarAlSalir, cancelarSolicitud, cambiar, elegirServicio, irReserva, reservar };
}

/* components/veterinaria.jsx — ConsejosVeterinaria */
export function useConsejosVeterinaria() {
const [tipo,setTipo]=useState(null);
const [abierto,setAbierto]=useState(false);
const disparador=useRef(null),cerrarBoton=useRef(null);
const consejo=consejos[tipo];
useEffect(()=>{
  if(!abierto)return;
  const overflowAnterior=document.body.style.overflow;
  document.body.style.overflow="hidden";cerrarBoton.current?.focus();
  function teclado(e){
   if(e.key==="Escape"){e.preventDefault();return;}
   if(e.key==="Tab"){e.preventDefault();cerrarBoton.current?.focus();}
  }
  document.addEventListener("keydown",teclado);
  return ()=>{document.removeEventListener("keydown",teclado);document.body.style.overflow=overflowAnterior;disparador.current?.focus();};
 },[abierto]);
function abrir(tipo,elemento){disparador.current=elemento;setTipo(tipo);setAbierto(true);}
function cerrar(){setAbierto(false);}
function tecladoConsejo(e,tipo) { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(tipo, e.currentTarget); } }
function abrirDesdeEnlaceConsejo(e) {e.stopPropagation();abrir(e.currentTarget.closest("[data-consejo]").dataset.consejo,e.currentTarget);}
return { abierto, cerrarBoton, consejo, abrir, cerrar , tecladoConsejo, abrirDesdeEnlaceConsejo };
}
