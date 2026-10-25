import {describe,it,expect,beforeAll,afterAll,beforeEach,vi} from 'vitest';
import {correoValido,errorTelefono,errorComuna,edadDesdeFecha} from '../src/services/datosCuenta.js';
import {mensajeDeCampo} from '../src/services/reglasFormulario.js';

const campo = cambios => ({tagName:'INPUT',type:'text',name:'campo',value:'',required:false,disabled:false,minLength:-1,maxLength:-1,min:'',max:'',step:'',pattern:'',matches:()=>false,closest:()=>null,...cambios});
describe('Reglas comunes y borradores de formularios',()=>{
 let B,PEH,memoria;
 beforeAll(async()=>{
  memoria=new Map();const almacenamiento={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
  const ventana=new EventTarget();ventana.localStorage=almacenamiento;ventana.crypto=globalThis.crypto;
  vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',almacenamiento);
  B=await import('../src/services/borradores.js');PEH=(await import('../src/services/peh.js')).default;
 });
 afterAll(()=>vi.unstubAllGlobals());
 beforeEach(()=>{memoria.clear();localStorage.setItem(PEH.CLAVES.cuentas,JSON.stringify([{id:'A',nombre:'Ana',correo:'a@duocuc.cl'},{id:'B',nombre:'Bruno',correo:'b@profesor.duocuc.cl'}]));PEH.sesion.iniciar({id:'A'});});
 it('valida teléfono y comuna',()=>{expect(errorTelefono('+56 9 1234 5678')).toBe('');expect(errorTelefono('123')).toBeTruthy();expect(errorComuna('Viña del Mar')).toBe('');expect(errorComuna('123')).toBeTruthy();});
 it('explica un campo obligatorio vacío',()=>{expect(mensajeDeCampo(campo({required:true}),{elements:[]})).toBe('Completa este campo.');});
 it('explica un desplegable sin selección',()=>{expect(mensajeDeCampo(campo({tagName:'SELECT',required:true}),{elements:[]})).toBe('Selecciona una opción.');});
 it('explica un grupo de radio sin respuesta',()=>{const c=campo({type:'radio',name:'convivencia',required:true});expect(mensajeDeCampo(c,{elements:[c]})).toBeTruthy();});
 it('no exige campos deshabilitados u ocultos',()=>{expect(mensajeDeCampo(campo({required:true,disabled:true}),{elements:[]})).toBe('');expect(mensajeDeCampo(campo({required:true,closest:()=>({hidden:true})}),{elements:[]})).toBe('');});
 it('valida descripciones y límites numéricos',()=>{expect(mensajeDeCampo(campo({value:'corto',minLength:10}),{elements:[]})).toContain('10');expect(mensajeDeCampo(campo({type:'number',value:'11',max:'10'}),{elements:[]})).toContain('10');});
 it('valida confirmación de contraseña sin guardarla',()=>{const c=campo({type:'password',name:'confirmar',value:'Otra123!'});expect(mensajeDeCampo(c,{elements:[c,campo({name:'nueva',value:'Prueba123!'})]})).toContain('no coinciden');});
 it('excluye contraseñas y hashes incluso anidados',()=>{const c=B.limpiarBorrador({correo:'a@duocuc.cl',contrasena:'secreto',seguridad:{actual:'x',nueva:'y',claveDerivada:'z',sal:'s'},comuna:'Macul'});expect(c).toEqual({correo:'a@duocuc.cl',seguridad:{},comuna:'Macul'});});
 it('separa borradores por cuenta, formulario y animal',()=>{const a=B.claveBorrador('adopcion:milo');expect(B.guardarBorrador(a,{texto:'Solicitud A'})).toBe(true);PEH.sesion.iniciar({id:'B'});expect(B.leerBorrador(B.claveBorrador('adopcion:milo'))).toBeUndefined();PEH.sesion.iniciar({id:'A'});expect(B.leerBorrador(B.claveBorrador('adopcion:nala'))).toBeUndefined();expect(B.leerBorrador(a).texto).toBe('Solicitud A');});
 it('cancelar elimina solo el borrador elegido',()=>{const a=B.claveBorrador('contacto'),b=B.claveBorrador('adopcion:milo');B.guardarBorrador(a,{mensaje:'A'});B.guardarBorrador(b,{mensaje:'B'});expect(B.borrarBorrador(a)).toBe(true);expect(B.leerBorrador(a)).toBeUndefined();expect(B.leerBorrador(b).mensaje).toBe('B');});
 it('valida fechas reales y cumpleaños',()=>{expect(edadDesdeFecha('2000-10-25',new Date(2026,9,24))).toBe(25);expect(edadDesdeFecha('2000-02-30')).toBe(-1);expect(edadDesdeFecha('2999-01-01')).toBe(-1);});
 it('actualiza contacto/correo de la cuenta sin aceptar duplicados',()=>{expect(PEH.cuentas.actualizarPerfil({nombre:'Ana Prueba',correo:'ana.nueva@duocuc.cl',telefono:'912345678',comuna:'Macul'}).ok).toBe(true);expect(PEH.sesion.obtener().correo).toBe('ana.nueva@duocuc.cl');expect(PEH.cuentas.actualizarPerfil({nombre:'Ana Prueba',correo:'b@profesor.duocuc.cl',telefono:'912345678',comuna:'Macul'}).ok).toBe(false);});

});
