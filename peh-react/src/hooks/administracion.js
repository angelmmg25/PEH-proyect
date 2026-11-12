/* Administración: listado, filtros, paginación y formularios de gestión. */
import {estadoReserva} from '../services/global.js';
import PEH, { cargarCatalogo } from '../services/global.js';
import { useEffect, useRef, useState } from 'react';
import { listarAdmin, horaAdmin, guardarAnimalAdmin, guardarUsuarioAdmin, cambiarEstadoAdmin, guardarReservaAdmin, responderConsultaAdmin, eliminarAdmin, subirImagenAdmin, estadosAdopcion } from '../services/administracion.js';
import { horarios } from '../data/global.js';
import { useBorrador } from './global.jsx';
function leerVistaAdmin(id) {
  try {
    const v=JSON.parse(sessionStorage.getItem('peh:admin-vista:'+id));
    if(!v || !secciones.some(([k])=>k===v.tipo))return {tipo:'animales'};
    return {tipo:v.tipo,pagina:Number.isInteger(v.pagina)&&v.pagina>=0?v.pagina:0,busqueda:typeof v.busqueda==='string'?v.busqueda:'',filtro:typeof v.filtro==='string'?v.filtro:'',abiertos:Array.isArray(v.abiertos)?v.abiertos.filter(k=>typeof k==='string'):[]};
  } catch {return {tipo:'animales'};}
}

import { seccionesAdministracion as secciones } from '../data/administracion.js';
export { seccionesAdministracion as secciones } from '../data/administracion.js';

/* pages/Desarrollador.jsx — Desarrollador */
export function useAdministracion({ sesion }) {
const esAdmin=sesion.rol==='ADMIN';
const [vistaInicial]=useState(()=>leerVistaAdmin(sesion.id));
const [tipo,setTipo]=useState(vistaInicial.tipo),[pagina,setPagina]=useState(vistaInicial.pagina||0),[intento,setIntento]=useState(0);
const [abiertos,setAbiertos]=useState(()=>new Set(vistaInicial.abiertos||[]));
const [carga,setEstado]=useState({tipo:'animales',pagina:0,lista:[],cargando:true,error:''});
const estado=carga.tipo===tipo && carga.pagina===pagina?carga:{lista:[],cargando:true,error:''};
const [busqueda,setBusqueda]=useState(vistaInicial.busqueda||''),[filtro,setFiltro]=useState(vistaInicial.filtro||''),[modal,setModal]=useState(null),[mensaje,setMensaje]=useState('');
const peticion=useRef(null);
useEffect(()=>{if(!esAdmin)return;document.body.classList.add('pagina-desarrollador');return ()=>document.body.classList.remove('pagina-desarrollador');},[esAdmin]);
useEffect(()=>{
    if(!esAdmin)return;
    const controller=new AbortController();peticion.current=controller;
    setEstado({tipo,pagina,lista:[],cargando:true,error:''});
    listarAdmin(tipo,{pagina,signal:controller.signal}).then(lista=>{if(!controller.signal.aborted)setEstado({tipo,pagina,lista,cargando:false,error:''});})
      .catch(error=>{if(!controller.signal.aborted && error.name!=='AbortError')setEstado({tipo,pagina,lista:[],cargando:false,error:error.message});});
    return ()=>controller.abort();
  },[tipo,pagina,intento,esAdmin,sesion.id]);
useEffect(()=>{
    if(!esAdmin)return;
    try {sessionStorage.setItem('peh:admin-vista:'+sesion.id,JSON.stringify({tipo,pagina,busqueda,filtro,abiertos:[...abiertos]}));} catch { /* No bloquea la administración si el navegador no permite recordar la vista. */ }
  },[esAdmin,sesion.id,tipo,pagina,busqueda,filtro,abiertos]);
function alternarDetalle(id) {setAbiertos(prev=>{const siguiente=new Set(prev);if(siguiente.has(id))siguiente.delete(id);else siguiente.add(id);return siguiente;});}
function seleccionar(nuevo) {if(modal)return;setTipo(nuevo);setPagina(0);setBusqueda('');setFiltro('');setMensaje('');setAbiertos(new Set());}
function guardado() {
    setModal(null);setMensaje('El cambio se guardó. Se está actualizando la lista.');setIntento(n=>n+1);
    if(tipo==='animales' || tipo==='adopciones')void cargarCatalogo({forzar:true}).catch(()=>{});
  }
function abrir(accion,registro=null) {peticion.current?.abort();setMensaje('');setModal({tipo,accion,registro});}
function paginaAnterior() {setPagina(n=>n-1);setFiltro('');}
function paginaSiguiente() {setPagina(n=>n+1);setFiltro('');}
const titulo=secciones.find(([k])=>k===tipo)[1];
const lista=estado.lista.filter(r=>JSON.stringify(r).toLocaleLowerCase('es').includes(busqueda.toLocaleLowerCase('es')) && (!filtro || estadoFila(tipo,r)===filtro));
const estados=[...new Set(estado.lista.map(r=>estadoFila(tipo,r)))];
return { esAdmin, tipo, pagina, setPagina, setIntento, abiertos, estado, busqueda, setBusqueda, filtro, setFiltro, modal, setModal, mensaje, alternarDetalle, seleccionar, guardado, abrir , paginaAnterior, paginaSiguiente , titulo, lista, estados };
}

function principal(tipo,r) {
  if(tipo==='animales')return [r.nombre,`${r.especie} · ${r.edadMeses<1?'menos de 1 mes':`${r.edadMeses} meses`} · ${r.comuna}`];
  if(tipo==='usuarios')return [`${r.nombre} ${r.apellido}`,`${r.correo} · ${r.rol}`];
  if(tipo==='adopciones')return [r.animalNombre,r.formulario?.nombreAdoptante||`Cuenta ${r.usuarioId}`];
  if(tipo==='reservas')return [r.mascotaNombre,`${r.responsableNombre} · ${r.servicio} · ${r.fecha||'Sin fecha'} ${horaAdmin(r.hora)||'Sin hora'}`];
  if(tipo==='consultas')return [r.asunto,`${r.nombre} · ${r.correo}`];
  return [r.autor,tipo==='comentarios'?r.texto:r.contenido];
}

/* pages/Desarrollador.jsx — RegistroAdmin */
export function useRegistroAdmin({ tipo, r }) {
const [fallida,setFallida]=useState(null);
const [nombre,descripcion]=principal(tipo,r);
const animal=tipo==='animales'?r:tipo==='adopciones'?PEH.admin.listar('animales').find(a=>String(a.id)===String(r.animalId)||a.slug===r.animalId||a.slug===r.animalSlug):null;
const foto=animal?.imagen || r.animalImagen;
return { fallida, setFallida, nombre, descripcion, foto };
}

function configurar({tipo,accion,registro:r}) {
  if(accion==='eliminar')return {titulo:{animales:'Archivar animal',usuarios:'Desactivar cuenta',comentarios:'Eliminar comentario',publicaciones:'Eliminar publicación'}[tipo],inicial:{},campos:[]};
  if(tipo==='animales' && accion==='editar') {
    const a={...animalVacio,...r};return {titulo:r?'Editar animal':'Agregar animal',inicial:{...a,...Object.fromEntries(listas.map(k=>[k,(a[k]||[]).join('\n')]))},campos:[
      campo('nombre','Nombre','text',50,null,2),campo('slug','Identificador del perfil (por ejemplo: nala)','text',80),
      campo('especie','Especie','select',0,['perro','gato']),campo('sexo','Sexo','select',0,['macho','hembra']),
      campo('edadMeses','Edad','edad'),campo('tamano','Tamaño','select',0,[['pequeno','Pequeño'],['mediano','Mediano'],['grande','Grande']]),
      campo('comuna','Comuna','text',60,null,2),campo('comunaValor','Identificador de comuna (por ejemplo: la-florida)','text',60),
      campo('imagen','Imagen (URL HTTPS o ruta /img/)','text',500),campo('diasEsperando','Días esperando','number',30000,null,0),
      campo('cuidados','Cuidados','textarea',2000),campo('personalidad','Personalidad: un elemento por línea (máximo 15)','textarea',1600),
      campo('hogar','Hogar: un elemento por línea (máximo 10)','textarea',1100),campo('convivencia','Convivencia: un elemento por línea (máximo 10)','textarea',1100),
      campo('historia','Historia: un párrafo por línea (máximo 10)','textarea',20009)
    ]};
  }
  if(tipo==='animales')return {titulo:'Visibilidad del animal',inicial:{estado:r.estadoPerfil,observacionAdmin:''},campos:[campo('estado','Estado','select',0,Object.entries(estadosAnimal))]};
  if(tipo==='usuarios')return {titulo:'Editar usuario',inicial:{nombre:r.nombre,apellido:r.apellido,usuario:r.usuario,correo:r.correo},campos:[campo('nombre','Nombre','text',30,null,2),campo('apellido','Apellido','text',30,null,2),campo('usuario','Usuario','text',16,null,4),campo('correo','Correo','email',100)]};
  if(tipo==='adopciones')return {titulo:'Gestionar adopción',inicial:{estado:estadosAdopcion(r.estado)[0]||'',observacionAdmin:r.observacionAdmin||''},campos:[campo('estado','Nuevo estado','select',0,estadosAdopcion(r.estado)),campo('observacionAdmin','Observación para el solicitante','textarea',1500)]};
  if(tipo==='reservas')return {titulo:'Gestionar reserva',inicial:{estado:r.estado==='Pendiente'?'Confirmada':r.estado==='Completada'?'Cerrada':r.estado==='Rechazada'?'Cancelada':r.estado,fecha:r.fecha,hora:horaAdmin(r.hora),observacionAdmin:r.observacionAdmin||'',fechaAtencion:r.fechaAtencion||r.fecha,horaTermino:r.horaTermino||'',conclusionConsulta:r.conclusionConsulta||'',recomendacionesVeterinario:r.recomendacionesVeterinario||''},campos:[campo('estado','Estado','select',0,['Confirmada','Cerrada','Cancelada']),campo('fecha','Fecha de la cita agendada','date'),campo('hora','Hora de la cita agendada','select',0,horarios),campo('observacionAdmin','Observación (obligatoria si cambias fecha u hora)','textarea',1500),campo('fechaAtencion','Fecha de atención realizada','date'),campo('horaTermino','Hora de término de la atención','time'),campo('conclusionConsulta','Conclusión de la consulta','textarea',2000),campo('recomendacionesVeterinario','Recomendaciones del veterinario','textarea',2000)]};
  if(accion==='responder')return {titulo:'Responder consulta',inicial:{respuesta:''},campos:[campo('respuesta','Nueva respuesta','textarea',2000,null,10)]};
  return {titulo:'Estado de consulta',inicial:{estado:r.estado,observacionAdmin:''},campos:[campo('estado','Estado','select',0,['Pendiente','En revisión',...(r.respuestas?.length?['Respondida']:[]),'Cerrada','Cancelada'])]};
}

import { camposListaAnimal as listas } from '../data/administracion.js';

import { animalAdminVacio as animalVacio } from '../data/administracion.js';

const campo=(nombre,titulo,tipo='text',max=100,opciones=null,min=null)=>({nombre,titulo,tipo,max,opciones,min});

import { estadosVisibilidadAnimal as estadosAnimal } from '../data/administracion.js';

/* components/administracion.jsx — FormulariosAdmin */
export function useFormularioAdmin({ modal, onGuardado , onCerrar }) {
const {tipo,accion,registro}=modal, config=configurar(modal);
const [datos,setDatos,borrador]=useBorrador(`admin-api:${tipo}:${registro?.id||'nuevo'}:${accion}`,()=>config.inicial,{activo:accion!=='eliminar'});
const [mensaje,setMensaje]=useState(''),[errores,setErrores]=useState({}),[ocupado,setOcupado]=useState(false),[subiendo,setSubiendo]=useState(false);
const dialogo=useRef(null),bloqueo=useRef(false),vivo=useRef(false);
useEffect(()=>{
    vivo.current=true;const anterior=document.activeElement;
    dialogo.current.showModal();document.body.classList.add('modal-abierto');
    return ()=>{vivo.current=false;document.body.classList.remove('modal-abierto');anterior?.focus();};
  },[]);
async function elegirImagen(e) {
    const archivo=e.target.files?.[0];if(!archivo || bloqueo.current)return;
    bloqueo.current=true;setSubiendo(true);setMensaje('');
    try {const url=await subirImagenAdmin(archivo);if(vivo.current)setDatos(d=>({...d,imagen:url}));}
    catch(error){if(vivo.current && error.name!=='AbortError')setMensaje(error.message);}
    finally{bloqueo.current=false;if(vivo.current)setSubiendo(false);}
  }
async function guardar(e) {
    e.preventDefault();if(bloqueo.current)return;
    bloqueo.current=true;setOcupado(true);setMensaje('');setErrores({});
    try {
      if(accion==='eliminar')await eliminarAdmin(tipo,registro.id);
      else if(tipo==='animales' && accion==='editar') {
        const d={...datos,edadMeses:Number(datos.edadMeses),diasEsperando:Number(datos.diasEsperando)};
        for(const k of listas)d[k]=String(datos[k]||'').split('\n').map(s=>s.trim()).filter(Boolean);
        for(const k of listas){const max=k==='personalidad'?15:10, largo=k==='historia'?2000:100;if(d[k].length>max || d[k].some(s=>s.length>largo))throw new Error(`${k}: máximo ${max} elementos de ${largo} caracteres.`);}
        if(!d.historia.length)throw new Error('Escribe al menos un párrafo de historia.');
        await guardarAnimalAdmin(registro?.id,d);
      } else if(tipo==='usuarios')await guardarUsuarioAdmin(registro.id,datos);
      else if(tipo==='reservas') {
        if((datos.fecha!==registro.fecha || datos.hora!==horaAdmin(registro.hora)) && !datos.observacionAdmin.trim())throw new Error('Explica el cambio de fecha u hora en la observación.');
        await guardarReservaAdmin(registro.id,datos);
      } else if(tipo==='consultas' && accion==='responder')await responderConsultaAdmin(registro.id,datos.respuesta);
      else await cambiarEstadoAdmin(tipo,registro.id,datos);
      if(vivo.current){borrador.borrar();onGuardado();}
    }catch(error){if(vivo.current && error.name!=='AbortError'){setMensaje(error.message+' Si hubo un problema de conexión, comprueba el registro antes de repetir la operación.');setErrores(error.errores||{});}}
    finally{bloqueo.current=false;if(vivo.current)setOcupado(false);}
  }
const edades=[...Array.from({length:12},(_,i)=>i),...Array.from({length:157},(_,i)=>12+i*3)];
function cerrarFormulario() {if(borrador.borrar())onCerrar();}
function impedirCierre(e) {e.preventDefault();}
return { tipo, accion, registro, config, datos, setDatos, borrador, mensaje, errores, ocupado, subiendo, dialogo, elegirImagen, guardar, edades , cerrarFormulario, impedirCierre };
}

export const estadoFila=(tipo,r)=>tipo==='animales'?({'no-visible':'No visible',disponible:'Disponible','en-proceso':'En proceso',adoptado:'Adoptado'}[r.estadoPerfil]):tipo==='usuarios'?(r.activo?'Activa':'Desactivada'):tipo==='reservas'?estadoReserva(r.estado).texto:r.estado||r.categoria||'—';
