import {correoValido,errorTelefono,errorComuna} from "./datosCuenta.js";
export function mensajeDeCampo(control,formulario) {
  if(!control || control.disabled || control.matches?.(':disabled') || ['hidden','submit','button','reset'].includes(control.type) || control.closest?.('[hidden]'))return '';
  const nombre=control.name||control.id, tipo=control.type, valor=String(control.value??'').trim();
  const lista=Array.from(formulario?.elements||[]);
  if(tipo==='radio')return lista.some(c=>c.name===control.name&&c.required)&&!lista.some(c=>c.name===control.name&&c.checked)?'Selecciona una opción.':'';
  if(tipo==='checkbox')return control.required&&!control.checked?'Debes aceptar esta opción para continuar.':'';
  if(control.required&&!valor)return control.tagName==='SELECT'?'Selecciona una opción.':tipo==='file'?'Selecciona una imagen.':'Completa este campo.';
  if(tipo==='file' && control.files?.length){
    const archivo=control.files[0], aceptados=String(control.accept||'').split(',').map(v=>v.trim()).filter(Boolean);
    if(aceptados.length&&!aceptados.some(t=>t==='image/*'?archivo.type.startsWith('image/'):t===archivo.type))return 'Selecciona una imagen con un formato permitido.';
    const maximo=control.id==='admin-foto'?1:3;
    if(archivo.size>maximo*1024*1024)return `La imagen no puede superar ${maximo} MB.`;
  }
  if(!valor)return '';
  if(control.tagName==='SELECT'&&!Array.from(control.options).some(o=>o.value===control.value&&!o.disabled))return 'Selecciona una opción válida.';
  if((tipo==='email'||/correo/i.test(nombre))&&!correoValido(valor))return 'Ingresa un correo válido con terminación .com o .cl.';
  if(/telefono/i.test(nombre)&&errorTelefono(valor))return errorTelefono(valor);
  if(/comuna/i.test(nombre)&&errorComuna(valor))return errorComuna(valor);
  if(control.minLength>0&&valor.length<control.minLength)return `Escribe al menos ${control.minLength} caracteres.`;
  if(control.maxLength>0&&valor.length>control.maxLength)return `El máximo es de ${control.maxLength} caracteres.`;
  if(tipo==='number'){
    const n=Number(valor);
    if(!Number.isFinite(n))return 'Escribe un número válido.';
    if(control.min!==''&&n<Number(control.min))return `El mínimo permitido es ${control.min}.`;
    if(control.max!==''&&n>Number(control.max))return `El máximo permitido es ${control.max}.`;
    if((control.step===''||control.step==='1')&&!Number.isInteger(n))return 'Escribe un número entero.';
  }
  if(control.pattern){try{if(!new RegExp('^(?:'+control.pattern+')$').test(valor))return 'Revisa el formato de este campo.';}catch{}}
  if(tipo==='password'&&/nueva|^nueva$/.test(nombre)&&!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/.test(valor))return 'Usa al menos 8 caracteres, mayúscula, minúscula, número y símbolo.';
  if(tipo==='password'&&/confirmar/i.test(nombre)){
    const nueva=lista.find(c=>c.name==='nueva'||c.id==='nuevaContrasena');
    if(nueva&&control.value!==nueva.value)return 'Las contraseñas no coinciden.';
  }
  if(control.validity?.badInput)return 'Ingresa un valor válido.';
  if(control.validity?.rangeUnderflow)return `El mínimo permitido es ${control.min}.`;
  if(control.validity?.rangeOverflow)return `El máximo permitido es ${control.max}.`;
  if(control.validity?.customError)return control.validationMessage;
  return '';
}
