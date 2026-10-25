import {describe,it,expect,beforeAll,beforeEach,afterAll,vi} from 'vitest';
import {requiereSesion,vistaPermitidaInvitado} from '../src/services/accesoInvitado.js';

describe('Acceso global de invitados',()=>{
 let PEH,B,V,memoria;
 beforeAll(async()=>{
  memoria=new Map();const almacenamiento={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
  const ventana=new EventTarget();ventana.localStorage=almacenamiento;ventana.crypto=globalThis.crypto;
  vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',almacenamiento);
  PEH=(await import('../src/services/peh.js')).default;B=await import('../src/services/borradores.js');V=await import('../src/services/veterinaria.js');
 });
 afterAll(()=>vi.unstubAllGlobals());
 beforeEach(()=>{memoria.clear();localStorage.setItem(PEH.CLAVES.cuentas,JSON.stringify([{id:'A',nombre:'Ana',correo:'a@duocuc.cl'}]));PEH.sesion.iniciar({id:'INV',invitado:true});});
 it('permite inicio, catálogo y perfiles de animales',()=>{for(const ruta of ['inicio','animales','animal/milo','#animal/nala'])expect(vistaPermitidaInvitado(ruta)).toBe(true);});
 it('exige sesión en perfil y secciones restringidas, también rutas directas',()=>{for(const ruta of ['perfil','perfil/consultas','comunidad/perdidos','veterinaria','veterinaria/reservar','contacto','desarrollador'])expect(requiereSesion(ruta,PEH.sesion.obtener())).toBe(true);});
 it('no impone ese bloqueo a una cuenta registrada',()=>{PEH.sesion.iniciar({id:'A'});expect(requiereSesion('veterinaria',PEH.sesion.obtener())).toBe(false);});
 it('sin sesión solo admite borrador de acceso y registro sin contraseñas',()=>{PEH.sesion.cerrar();expect(B.claveBorrador('contacto')).toBeNull();const clave=B.claveBorrador('acceso-registro');expect(B.guardarBorrador(clave,{correo:'a@duocuc.cl',contrasena:'No guardar'})).toBe(true);expect(B.leerBorrador(clave)).toEqual({correo:'a@duocuc.cl'});});
 it('al pasar a una cuenta se puede limpiar el borrador de acceso previo',()=>{PEH.sesion.cerrar();const clave=B.claveBorrador('acceso-registro');B.guardarBorrador(clave,{correo:'a@duocuc.cl'});PEH.sesion.iniciar({id:'A'});expect(B.borrarBorrador(clave)).toBe(true);expect(localStorage.getItem(clave)).toBeNull();});
});
