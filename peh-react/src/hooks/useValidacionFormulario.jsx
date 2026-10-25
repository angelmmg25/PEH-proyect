import {useId,useState} from 'react';
import {mensajeDeCampo} from '../services/reglasFormulario.js';

export default function useValidacionFormulario() {
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
