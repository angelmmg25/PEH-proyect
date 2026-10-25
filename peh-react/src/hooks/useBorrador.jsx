import {useRef,useState} from 'react';
import {claveBorrador,leerBorrador,guardarBorrador,borrarBorrador} from '../services/borradores.js';

export default function useBorrador(nombre,inicial,{activo=true,mostrarGuardado=true}={}) {
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

export function AvisoBorrador({estado}) {return estado.aviso?<p className="aviso-borrador-general" role="status">{estado.aviso}</p>:null;}
