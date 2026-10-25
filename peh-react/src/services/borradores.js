import PEH from './peh.js';

const omitidos = /contrasen|password|clave|^sal$|^iteraciones$|^actual$|^nueva$|^confirmar$|token/i;
export function limpiarBorrador(valor) {
  if (Array.isArray(valor)) return valor.map(limpiarBorrador);
  if (valor && typeof valor === 'object') return Object.fromEntries(Object.entries(valor).filter(([k]) => !omitidos.test(k) && !['__proto__','constructor','prototype'].includes(k)).map(([k,v])=>[k,limpiarBorrador(v)]));
  return ['string','number','boolean'].includes(typeof valor) || valor === null ? valor : null;
}
export function claveBorrador(formulario) {
  const usuario = PEH.sesion.obtener();
  if(usuario?.invitado)return null;
  if(!usuario?.id && formulario!=="acceso-registro")return null;
  return 'peh_borrador_v2:' + encodeURIComponent(usuario?.id || 'acceso-local') + ':' + encodeURIComponent(formulario);
}
function clavePermitida(clave) {
  const usuario=PEH.sesion.obtener();
  if(!clave || typeof clave!=="string" || usuario?.invitado)return false;
  if(!usuario?.id)return clave==='peh_borrador_v2:acceso-local:acceso-registro';
  return clave.startsWith('peh_borrador_v2:'+encodeURIComponent(usuario.id)+':');
}
export function leerBorrador(clave) {
  if(!clavePermitida(clave))return undefined;
  try { const texto=localStorage.getItem(clave); return texto === null ? undefined : limpiarBorrador(JSON.parse(texto)); } catch { return undefined; }
}
export function guardarBorrador(clave, datos) {
  if(!clavePermitida(clave))return false;
  try {localStorage.setItem(clave,JSON.stringify(limpiarBorrador(datos)));return true;}catch{return false;}
}
export function borrarBorrador(clave) {
  const accesoLocal=clave==='peh_borrador_v2:acceso-local:acceso-registro' && !PEH.sesion.obtener()?.invitado;
  if(!clavePermitida(clave) && !accesoLocal)return false;
  try {localStorage.removeItem(clave);return true;}catch{return false;}
}
