import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { createElement } from 'react';
import { act, cleanup, render, renderHook, screen, within } from '@testing-library/react';
import { useContacto } from '../src/hooks/contacto.js';
import PEH, { claveBorrador } from '../src/services/global.js';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import { registrarCuenta, iniciarSesion } from '../src/services/login.js';
import Contacto from '../src/pages/Contacto.jsx';
// @vitest-environment jsdom

describe('Interacciones y cancelación de procesos',()=>{
beforeEach(()=>{
 localStorage.clear();sessionStorage.clear();document.body.style.overflow='';
 HTMLElement.prototype.scrollIntoView=vi.fn();window.scrollTo=vi.fn();
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();document.body.style.overflow='';});
function cuenta(){
 const usuario={id:'HOOK-A',nombre:'Ana',apellido:'Prueba',usuario:'ana',correo:'ana@example.cl',telefono:'912345678',comuna:'Macul'};
 localStorage.setItem(PEH.CLAVES.cuentas,JSON.stringify([usuario]));PEH.sesion.iniciar(usuario);return usuario;
}

it('cancelar Contacto elimina el borrador y los errores conservando los datos de la cuenta',()=>{
 cuenta();const {result}=renderHook(()=>useContacto({registrar:vi.fn()}));const clave=claveBorrador('contacto');
 act(()=>result.current.cambiar({target:{name:'asunto',value:'Necesito ayuda'}}));
 act(()=>result.current.revisarContactoAlSalir({target:{name:'mensaje'}}));
 expect(result.current.errores.mensaje).toBeTruthy();expect(localStorage.getItem(clave)).not.toBeNull();
 act(()=>result.current.cancelarConsulta());
 expect(result.current.datos.asunto).toBe('');expect(result.current.datos.nombre).toBe('Ana Prueba');expect(result.current.errores).toEqual({});expect(localStorage.getItem(clave)).toBeNull();
});
});

describe('Operaciones, persistencia y permisos',()=>{
let auth, C, admin, memoria;
const cred={nombre:'Ana',apellido:'Prueba',usuario:'ana_test',correo:'ana@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};

const consulta={nombre:'Ana Prueba',correo:cred.correo,motivo:'otro',asunto:'Consulta de prueba',mensaje:'Necesito información sobre el proceso de adopción.'};

const entrar=()=>auth.iniciarSesion(cred.correo,cred.contrasena);
beforeAll(async()=>{vi.stubGlobal("crypto",webcrypto);
 memoria=new Map();const storage={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
 const ventana=new EventTarget();ventana.crypto=crypto;ventana.alert=vi.fn();
 vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',storage);
 vi.stubGlobal('fetch',vi.fn(()=>{throw new Error('No se permite HTTP en el modo local.');}));
 auth=await import("./../src/services/login.js");
 C=await import("./../src/services/contacto.js");admin=await import("./../src/services/administracion.js");
});
beforeEach(async()=>{memoria.clear();fetch.mockClear();await auth.registrarCuenta(cred);await entrar();});
afterAll(()=>vi.unstubAllGlobals());

it('contacto y respuestas administrativas reaparecen en el perfil del remitente',async()=>{
 const r=C.registrarConsulta(consulta);expect(r.ok).toBe(true);await auth.cerrarSesionLocal();await auth.iniciarSesion('adminp@gmail.com','Admin1234!');
 await admin.responderConsultaAdmin(r.consulta.id,'Tu consulta fue revisada correctamente.');await admin.cambiarEstadoAdmin('consultas',r.consulta.id,{estado:'Cerrada'});
 await entrar();expect((await C.listarMisConsultas())[0]).toMatchObject({estado:'Cerrada',respuestas:[{texto:'Tu consulta fue revisada correctamente.'}]});
});

it('cancelar consulta conserva datos e historial y respeta la propiedad y los estados finales',async()=>{
 const c=C.registrarConsulta(consulta).consulta;
 await auth.registrarCuenta({...cred,usuario:'otra_test',correo:'otra@peh.cl'});await auth.iniciarSesion('otra@peh.cl',cred.contrasena);
 await expect(C.cancelarMiConsulta(c.id)).rejects.toThrow();await entrar();
 await C.cancelarMiConsulta(c.id);await auth.cerrarSesionLocal();await entrar();
 expect((await C.listarMisConsultas())[0]).toMatchObject({id:c.id,mensaje:consulta.mensaje,estado:'Cancelada',historialCambios:[{estado:'Cancelada'}]});
 await expect(C.cancelarMiConsulta(c.id)).rejects.toThrow();
});
});

describe('Interfaz y navegación',()=>{
const cred={nombre:'Ana',apellido:'Prueba',usuario:'ana_vista',correo:'ana.vista@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};
beforeAll(()=>{
 Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});
 Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});
 HTMLElement.prototype.scrollIntoView=vi.fn();
 HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
});
beforeEach(()=>{
 localStorage.clear();sessionStorage.clear();window.history.replaceState(null,'','/#inicio');
 vi.stubGlobal('fetch',vi.fn(()=>Promise.reject(new Error('HTTP prohibido'))));
 window.scrollTo=vi.fn();window.alert=vi.fn();window.confirm=vi.fn(()=>true);
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});

async function preparar(ruta='inicio'){await registrarCuenta(cred);await iniciarSesion(cred.correo,cred.contrasena);window.history.replaceState(null,'','/#'+ruta);return userEvent.setup();}

it('contacto mantiene autocompletado, registra la consulta y la muestra en el perfil',async()=>{
 const user=await preparar('contacto');render(createElement(App));const nombre=await screen.findByLabelText('Nombre completo');expect(nombre.value).toBe('Ana Prueba');
 await user.selectOptions(screen.getByLabelText('Motivo de contacto'),'otro');await user.type(screen.getByLabelText('Asunto'),'Consulta desde la vista');await user.type(screen.getByLabelText('Mensaje'),'Necesito información sobre las próximas jornadas de adopción.');await user.click(screen.getByRole('button',{name:/Registrar consulta/i}));expect(await screen.findByText('¡Consulta registrada!')).toBeTruthy();
 await user.click(screen.getByRole('link',{name:'Ver mis consultas y respuestas'}));expect(await screen.findByRole('heading',{name:'Consulta desde la vista'})).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
}, 15000);

it('Contacto reubica una sola lista de preguntas en la ayuda lateral y conserva los desplegables y su acceso',async()=>{
 const user=await preparar('contacto');render(createElement(App));
 const faq=screen.getByRole('region',{name:'Preguntas frecuentes',exact:true});
 expect(faq.closest('aside.contacto-ayuda')).toBeTruthy();
 expect(faq.previousElementSibling.classList.contains('tarjeta-compromiso')).toBe(true);
 expect(document.querySelectorAll('#preguntasFrecuentes')).toHaveLength(1);
 expect(document.querySelectorAll('.lista-preguntas')).toHaveLength(1);
 expect(faq.querySelectorAll('.pregunta-frecuente')).toHaveLength(4);
 expect(document.getElementById('formularioContacto').contains(faq)).toBe(false);
 const botones=within(faq).getAllByRole('button');expect(botones.every(b=>b.getAttribute('aria-expanded')==='false')).toBe(true);
 await user.click(within(faq).getByRole('button',{name:/Tengo un problema con PEH/}));
 expect(botones[2].getAttribute('aria-expanded')).toBe('true');
 expect(faq.querySelectorAll('.pregunta-respuesta:not([hidden])')).toHaveLength(1);
 await user.click(botones[0]);expect(botones[0].getAttribute('aria-expanded')).toBe('true');expect(botones[2].getAttribute('aria-expanded')).toBe('false');
 await user.click(botones[0]);expect(faq.querySelectorAll('.pregunta-respuesta:not([hidden])')).toHaveLength(0);
 await user.click(document.getElementById('botonPreguntas'));expect(faq.scrollIntoView).toHaveBeenCalledWith({behavior:'smooth',block:'start'});
 expect(screen.getByRole('button',{name:/Registrar consulta/}).closest('.acciones-formulario-pagina')).toBeTruthy();
 expect(fetch).not.toHaveBeenCalled();
});
});

describe('Validaciones y recuperación del proceso',()=>{

const credExtra={nombre:'Ana',apellido:'Prueba',usuario:'ana_extra',correo:'ana.extra@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};
async function entrarExtra(){await registrarCuenta(credExtra);await iniciarSesion(credExtra.correo,credExtra.contrasena);}
beforeEach(()=>{localStorage.clear();sessionStorage.clear();Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});window.history.replaceState(null,'','/#inicio');window.scrollTo=vi.fn();window.alert=vi.fn();window.confirm=vi.fn(()=>true);HTMLElement.prototype.scrollIntoView=vi.fn();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});

it('un fallo de guardado informa el error y conserva los datos y el borrador para reintentar',async()=>{
 await entrarExtra();const registrar=vi.fn().mockResolvedValue({ok:false,mensaje:'No se pudo guardar la consulta.'}),user=userEvent.setup();render(createElement(Contacto,{registrar}));await user.selectOptions(screen.getByLabelText('Motivo de contacto'),'otro');await user.type(screen.getByLabelText('Asunto'),'Consulta importante');await user.type(screen.getByLabelText('Mensaje'),'Este texto debe permanecer si el guardado falla.');await user.click(screen.getByRole('button',{name:/Registrar consulta/}));expect(await screen.findByRole('alert')).toHaveProperty('textContent','No se pudo guardar la consulta.');expect(screen.getByLabelText('Mensaje').value).toContain('debe permanecer');expect(PEH.consultas.listar()).toHaveLength(0);expect(registrar).toHaveBeenCalledTimes(1);expect(document.getElementById('estadoEnvio').hidden).toBe(true);
});

});
