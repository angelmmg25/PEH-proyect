/* Publicaciones, comentarios, búsquedas y ejemplos de Comunidad.
 * Las reglas y los datos compartidos se obtienen de global.js.
 */
import PEH from './global.js';
import { categorias } from '../data/global.js';
import { publicacionesDemo } from '../data/comunidad.js';
function exigirUsuario(){const s=PEH.sesion.obtener();if(!s||s.invitado)throw new Error('Inicia sesión para continuar.');return s;}
export function imagenComunidad(url){
 if(!url)return '';
 if(/^\/img\/[A-Za-z0-9_./-]+$/.test(url)||/^data:image\/(png|jpeg|gif);base64,[A-Za-z0-9+/=]+$/.test(url))return url;
 try{const u=new URL(url);return u.protocol==='https:'?u.href:'';}catch{return '';}
}
function normalizarPublicacion(p){return {...p,contenido:String(p.contenido??p.texto??''),imagen:imagenComunidad(p.imagen),imagenOriginal:p.imagen||null};}
export async function listarPublicaciones(){return PEH.publicaciones.listar().map(normalizarPublicacion).sort((a,b)=>String(b.fechaCreacion).localeCompare(String(a.fechaCreacion)));}
export async function detallePublicacion(id){
 const p=PEH.publicaciones.listar().find(p=>String(p.id)===String(id));
 if(!p)throw Object.assign(new Error('Esta publicación ya no está disponible.'),{estado:404});return normalizarPublicacion(p);
}
export async function listarComentarios(id){await detallePublicacion(id);return PEH.comentarios.listar(id);}
export async function listarCompartidos(){exigirUsuario();return PEH.publicaciones.listar().filter(p=>PEH.compartidos.contiene(p.id)).map(p=>p.id);}
export function validarPublicacion(datos){
 const contenido=String(datos.contenido??'').trim(),ubicacion=String(datos.ubicacion??'').trim(),errores={};
 if(contenido.length<10||contenido.length>500)errores.contenido='Escribe entre 10 y 500 caracteres.';
 if(!Object.hasOwn(categorias,datos.categoria))errores.categoria='Selecciona una categoría válida.';
 if(ubicacion.length>50)errores.ubicacion='La ubicación no puede superar 50 caracteres.';
 if(datos.imagen && !imagenComunidad(datos.imagen))errores.imagen='Selecciona una imagen PNG, JPG o GIF.';
 if(datos.imagen?.startsWith('data:')){
  const bytes=atob(datos.imagen.split(',')[1]).length;
  if(bytes>3*1024*1024)errores.imagen='La imagen no puede superar 3 MB.';
 }
 if(Object.keys(errores).length)throw Object.assign(new Error('Revisa los campos de tu publicación.'),{errores});
 return {contenido,categoria:datos.categoria,ubicacion,imagen:datos.imagen||null};
}
export async function crearPublicacion(datos){exigirUsuario();const p=PEH.publicaciones.agregar(validarPublicacion(datos));if(!p)throw new Error('No pudimos guardar la publicación. Revisa el espacio disponible del navegador.');return normalizarPublicacion(p);}
export async function editarPublicacion(id,datos){exigirUsuario();return normalizarPublicacion(PEH.publicaciones.editar(id,validarPublicacion(datos)));}
export async function eliminarPublicacion(id){exigirUsuario();if(!PEH.publicaciones.eliminar(id))throw new Error('No pudimos eliminar esta publicación.');}
export async function comentar(id,texto,respuestaA=null){
 const usuario=exigirUsuario();texto=String(texto??'').trim();if(!texto||texto.length>200)throw new Error('Escribe entre 1 y 200 caracteres.');
 const p=await detallePublicacion(id);if(PEH.sesion.obtener()?.id!==usuario.id)throw new DOMException('La sesión cambió.','AbortError');const c=PEH.comentarios.agregar(p.id,texto,respuestaA);
 if(!c)throw new Error('No pudimos guardar el comentario. Comprueba que la publicación y la respuesta sigan disponibles.');return c;
}
export async function eliminarComentario(id){exigirUsuario();PEH.comentarios.eliminar(id);}
export async function marcarCompartido(id){const s=exigirUsuario();if(!PEH.compartidos.marcar(id,s.id))throw new Error('No pudimos conservar el estado de compartido.');}
// Conserva las respuestas huérfanas y tolera un orden de entrada distinto.
export function ordenarComentarios(lista){
 const nodos=new Map(lista.map(c=>[c.id,{...c,hijos:[]}])),raices=[];
 for(const c of nodos.values()){const padre=nodos.get(c.respuestaA);if(padre&&padre!==c)padre.hijos.push(c);else raices.push(c);}
 const resultado=[],vistos=new Set(),pila=raices.toReversed();
 while(pila.length){const c=pila.pop();if(vistos.has(c.id))continue;vistos.add(c.id);resultado.push(c);pila.push(...c.hijos.toReversed());}
 return [...resultado,...[...nodos.values()].filter(c=>!vistos.has(c.id))];
}

export async function editarComentario(id,texto){exigirUsuario();return PEH.comentarios.editar(id,texto);}

// Reglas de búsqueda y selección: los datos de Comunidad no ejecutan filtros.
export function categoriaValida(valor) {
 return valor === "actividades" ? "jornadas" : Object.hasOwn(categorias,valor) ? valor : "todas";
}
export function normalizarTexto(texto) {
 return String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
}
export function textoBusquedaPublicacion(p) {
 return p.demo ? p.textoBusqueda : normalizarTexto(`${p.contenido} ${p.ubicacion || ""} ${categorias[p.categoria] || "Comunidad"}`);
}
export function coincidePublicacion(p,categoria,busqueda) {
 return (categoria === "todas" || p.categoria === categoria) && normalizarTexto(textoBusquedaPublicacion(p)).includes(normalizarTexto(busqueda));
}

// Solo se llama al abrir Comunidad. La marca evita reponer ejemplos eliminados.
export function inicializarPublicacionesEjemplo() {
 const clave = PEH.CLAVES.publicaciones;
 const marca = 'peh_publicaciones_ejemplo_ci_v1';
 const anterior = localStorage.getItem(clave);
 const inicializado = localStorage.getItem(marca);
 if (inicializado !== null) return;
 const guardadas = anterior === null ? [] : JSON.parse(anterior);
 if (!Array.isArray(guardadas)) throw new Error('No pudimos leer las publicaciones guardadas. Sus datos se conservaron.');
 const ids = new Set(guardadas.map(publicacion => publicacion.id));
 const nuevas = publicacionesDemo.filter(publicacion => !ids.has(publicacion.id));
 try {
  localStorage.setItem(clave, JSON.stringify([...guardadas, ...nuevas]));
  localStorage.setItem(marca, '1');
 } catch {
  try {
   if (anterior === null) localStorage.removeItem(clave); else localStorage.setItem(clave, anterior);
   localStorage.removeItem(marca);
  } catch {
   throw new Error('No pudimos completar la carga de ejemplos. Actualiza Comunidad para revisar las publicaciones guardadas.');
  }
  throw new Error('No pudimos guardar las publicaciones de ejemplo. Revisa el almacenamiento del navegador.');
 }
 window.dispatchEvent(new CustomEvent('peh:actualizado', {detail:{clave}}));
}
