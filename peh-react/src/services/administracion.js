/* Acciones y comprobaciones de la vista Administración.
 * Las reglas y los datos compartidos se obtienen de global.js.
 */
import PEH, { obtenerEdadMeses } from './global.js';


function administrador() {
 if(!PEH.admin.esAdmin())throw Object.assign(new Error('Esta sección requiere una cuenta administradora.'),{estado:403});
 return PEH;
}
function resultadoAdmin(r){if(!r.ok)throw new Error(r.mensaje);return r.registro||r;}
function solicitudLocal(r){
 const campos=['nombreAdoptante','edadAdoptante','correoAdoptante','telefonoAdoptante','comunaAdoptante','tipoVivienda','situacionVivienda','viveConPersonas','personasHogar','acuerdoFamiliar','otrosAnimales','detalleAnimales','experienciaAnimales','motivoAdopcion','cuidadosAnimal','aceptaCompromiso'];
 return {...r,formulario:r.formulario||Object.fromEntries(campos.map(k=>[k,r[k]]))};
}
export async function listarAdmin(tipo,{pagina=0,tamano=20}={}) {
 const p=administrador();
 if(!['animales','usuarios','adopciones','reservas','consultas','publicaciones','comentarios'].includes(tipo)||!Number.isInteger(pagina)||pagina<0||!Number.isInteger(tamano)||tamano<1||tamano>100)throw new Error('Página inválida.');
 let lista=tipo==='publicaciones'?p.publicaciones.listar():tipo==='usuarios'?p.cuentas.listar():p.admin.listar(tipo);
 if(tipo==='animales')lista=lista.map(r=>({...r,edadMeses:obtenerEdadMeses(r)}));
 if(tipo==='comentarios'){const ids=new Set(p.publicaciones.listar().map(r=>r.id));lista=lista.filter(c=>ids.has(c.publicacionId));}
 if(tipo==='adopciones')lista=lista.map(solicitudLocal);
 if(tipo==='usuarios')lista=lista.map(r=>({...r,activo:r.activo!==false,rol:r.rol||'USUARIO'}));
 return lista.sort((a,b)=>String(b.fechaCreacion||b.fechaRegistro||'').localeCompare(String(a.fechaCreacion||a.fechaRegistro||''))).slice(pagina*tamano,(pagina+1)*tamano);
}
export async function guardarAnimalAdmin(id,datos) {
 const p=administrador();
 const anterior=id==null?null:p.admin.listar('animales').find(a=>a.id===id);
 if(id!=null&&!anterior)throw new Error('El animal ya no está disponible.');
 return resultadoAdmin(p.admin.guardarAnimal({...anterior,...datos,id:anterior?.id,slug:datos.slug||anterior?.slug,estadoPerfil:anterior?.estadoPerfil||'disponible'}));
}
export async function guardarUsuarioAdmin(id,datos) {const p=administrador();return resultadoAdmin(p.admin.guardarUsuario({...datos,id}));}
export async function cambiarEstadoAdmin(tipo,id,datos) {
 const p=administrador();
 if(tipo==='adopciones')return resultadoAdmin(p.admin.guardarAdopcion(id,datos));
 if(tipo==='consultas')return resultadoAdmin(p.admin.guardarConsulta(id,{estado:datos.estado}));
 if(tipo==='animales'){
  if(!['disponible','no-visible'].includes(datos.estado))throw new Error('Estado del animal no válido.');
  const r=p.admin.listar('animales').find(a=>a.id===id);if(!r)throw new Error('Animal no disponible.');
  return resultadoAdmin(p.admin.guardarAnimal({...r,edadMeses:obtenerEdadMeses(r),estadoPerfil:datos.estado}));
 }
 throw new Error('Operación de estado no válida.');
}
export async function guardarReservaAdmin(id,datos){const p=administrador();return resultadoAdmin(p.admin.guardarReserva(id,datos));}
export async function responderConsultaAdmin(id,respuesta){const p=administrador();return resultadoAdmin(p.admin.guardarConsulta(id,{respuesta}));}
export async function eliminarAdmin(tipo,id){
 const p=administrador();
 if(tipo==='animales')return resultadoAdmin(p.admin.eliminarAnimal(id));
 if(tipo==='usuarios')return resultadoAdmin(p.admin.eliminarUsuario(id));
 if(tipo==='comentarios')return resultadoAdmin(p.admin.eliminarComentario(id));
 if(tipo==='publicaciones'){
  if(!PEH.publicaciones.eliminar(id))throw new Error('No pudimos eliminar la publicación.');return;
 }
 throw new Error('No se puede eliminar este tipo de registro.');
}
export async function subirImagenAdmin(archivo){
 administrador();
 if(!archivo||!['image/png','image/jpeg','image/gif'].includes(archivo.type)||archivo.size>3*1024*1024||archivo.size<1)throw new Error('Selecciona una imagen PNG, JPG o GIF de hasta 3 MB.');
 return new Promise((resolve,reject)=>{const lector=new FileReader();lector.onload=()=>resolve(String(lector.result));lector.onerror=()=>reject(new Error('No pudimos leer la imagen.'));lector.readAsDataURL(archivo);});
}
export function horaAdmin(valor){return typeof valor==='string'&&/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/.test(valor)?valor.slice(0,5):'';}

export function estadosAdopcion(estado) {
  if(['Completada','Rechazada','Cancelada'].includes(estado))return [];
  return estado==='Aprobada'?['Completada','Rechazada','Cancelada']:['En revisión','Aprobada','Rechazada','Cancelada'];
}
