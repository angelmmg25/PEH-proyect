export const patronCorreo = /^[A-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:com|cl)$/i;
export const correoValido = valor => String(valor ?? "").trim().length <= 100 && patronCorreo.test(String(valor ?? "").trim());
export function normalizarTelefono(valor) { return String(valor ?? "").trim().replace(/[ ()-]/g, ""); }
export function errorTelefono(valor) {
 const t=normalizarTelefono(valor);
 return /^(?:\+?56)?[2-9]\d{8}$/.test(t) ? "" : "Ingresa un teléfono chileno de 9 dígitos, con +56 opcional.";
}
export function errorComuna(valor) {
 const t=String(valor ?? "").trim();
 return t.length >= 2 && t.length <= 60 && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(t) ? "" : "Ingresa una comuna válida, entre 2 y 60 caracteres.";
}

export function edadDesdeFecha(valor, hoy=new Date()) {
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valor || ""));
 if(!m)return -1;
 const a=Number(m[1]),mes=Number(m[2]),dia=Number(m[3]),fecha=new Date(a,mes-1,dia);
 if(fecha.getFullYear()!==a || fecha.getMonth()!==mes-1 || fecha.getDate()!==dia || fecha>hoy)return -1;
 return hoy.getFullYear()-a-(hoy.getMonth()<mes-1 || (hoy.getMonth()===mes-1&&hoy.getDate()<dia)?1:0);
}
export function errorNombrePersona(valor,maximo=60) {
 const t=String(valor || "").trim();
 return t.length<=maximo && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(t) && (t.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g)||[]).length>=2 ? "" : `Escribe un nombre válido, con al menos 2 letras y un máximo de ${maximo} caracteres.`;
}
