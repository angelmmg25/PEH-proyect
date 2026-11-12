import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { createElement } from 'react';
import { render, screen, within, cleanup, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import PEH, { guardarBorrador, claveBorrador } from '../src/services/global.js';
import { registrarCuenta, iniciarSesion } from '../src/services/login.js';
import { useFormularioAdopcion } from '../src/hooks/animal.js';
import { datosInicialesAdopcion, erroresSolicitud } from '../src/services/animal.js';
// @vitest-environment jsdom

describe('Operaciones, persistencia y permisos',()=>{
let PEH, auth, A, memoria;
const cred={nombre:'Ana',apellido:'Prueba',usuario:'ana_test',correo:'ana@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};
const formulario={nombreAdoptante:'Ana Prueba',edadAdoptante:'26',correoAdoptante:cred.correo,telefonoAdoptante:cred.telefono,comunaAdoptante:'Macul',tipoVivienda:'casa',situacionVivienda:'propia',viveConPersonas:'no',personasHogar:'',acuerdoFamiliar:'',otrosAnimales:'no',detalleAnimales:'',experienciaAnimales:'si',motivoAdopcion:'Quiero darle un hogar estable y seguro.',cuidadosAnimal:'Tendrá paseos diarios y controles veterinarios.',aceptaCompromiso:true};

const entrar=()=>auth.iniciarSesion(cred.correo,cred.contrasena);
beforeAll(async()=>{vi.stubGlobal("crypto",webcrypto);
 memoria=new Map();const storage={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
 const ventana=new EventTarget();ventana.crypto=crypto;ventana.alert=vi.fn();
 vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',storage);
 vi.stubGlobal('fetch',vi.fn(()=>{throw new Error('No se permite HTTP en el modo local.');}));
 auth=await import("./../src/services/login.js");PEH=auth.default;
 A=await import("./../src/services/animal.js");
});
beforeEach(async()=>{memoria.clear();fetch.mockClear();await auth.registrarCuenta(cred);await entrar();});
afterAll(()=>vi.unstubAllGlobals());

it('adopción conserva el formulario y su historial al cancelar y recargar datos',async()=>{
 const animal=PEH.catalogo.listar()[0],r=await A.enviarSolicitudLocal(animal,formulario);
 expect((await A.listarMisAdopciones())[0].formulario.motivoAdopcion).toBe(formulario.motivoAdopcion);
 await A.cancelarMiAdopcion(r.solicitud.id);await auth.cerrarSesionLocal();await entrar();
 expect((await A.listarMisAdopciones())[0]).toMatchObject({estado:'Cancelada',historialCambios:[{estado:'Cancelada'}]});
});

it('no permite duplicar adopciones activas pero admite otra después de cancelar',async()=>{
 const a=PEH.catalogo.listar()[0],r=await A.enviarSolicitudLocal(a,formulario);await expect(A.enviarSolicitudLocal(a,formulario)).rejects.toThrow('Ya tienes');await A.cancelarMiAdopcion(r.solicitud.id);expect((await A.enviarSolicitudLocal(a,formulario)).ok).toBe(true);
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
async function navegar(ruta){await act(async()=>{window.location.hash='#'+ruta;});}
async function preparar(ruta='inicio'){await registrarCuenta(cred);await iniciarSesion(cred.correo,cred.contrasena);window.history.replaceState(null,'','/#'+ruta);return userEvent.setup();}

it('el formulario de adopción mantiene campos, registra y permite cancelar desde el perfil',async()=>{
 const user=await preparar('animal/milo');render(createElement(App));await user.click(await screen.findByRole('button',{name:/Adoptar a Milo/i}));
 const f=document.getElementById('formularioAdopcion');
 for(const [k,v] of Object.entries({tipoVivienda:'casa'}))await user.selectOptions(f.elements.namedItem(k),v);
 for(const [k,v] of Object.entries({situacionVivienda:'propia',viveConPersonas:'no',otrosAnimales:'no',experienciaAnimales:'si'}))await user.click(f.querySelector(`input[name="${k}"][value="${v}"]`));
 for(const [k,v] of Object.entries({motivoAdopcion:'Quiero darle un hogar estable y responsable.',cuidadosAnimal:'Tendrá paseos diarios y controles veterinarios.'}))await user.type(f.elements.namedItem(k),v);
 await user.click(f.elements.namedItem('aceptaCompromiso'));await user.click(within(f).getByRole('button',{name:/Enviar solicitud/i}));expect(await screen.findByText(/¡Solicitud registrada!/)).toBeTruthy();
 await navegar('perfil');await user.click(await screen.findByRole('button',{name:'Cancelar solicitud de Milo'}));await user.click(screen.getByRole('button',{name:'Confirmar cancelación'}));expect(await screen.findByText('La solicitud fue cancelada.')).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
}, 15000);
});

describe('Persistencia y reglas por cuenta',()=>{
let PEH, enviarSolicitud, animales;
let memoria, descriptorOriginal;
const cuentaA = { id: 'TEST-A', nombre: 'Ana', apellido: 'Prueba', usuario: 'ana_test', correo: 'ana.test@gmail.com' };
const cuentaB = { id: 'TEST-B', nombre: 'Bruno', apellido: 'Prueba', usuario: 'bruno_test', correo: 'bruno.test@gmail.com' };

const datosAdopcion = () => ({ nombreAdoptante: 'Ana Prueba', correoAdoptante: 'ana.test@gmail.com', edadAdoptante: '25', telefonoAdoptante: '912345678', comunaAdoptante: 'Macul', tipoVivienda: 'casa', situacionVivienda: 'propia', viveConPersonas: 'si', personasHogar: '2', acuerdoFamiliar: 'si', otrosAnimales: 'no', detalleAnimales: '', experienciaAnimales: 'si', motivoAdopcion: 'Quiero ofrecer un hogar estable y mucho cariño.', cuidadosAnimal: 'Tendrá controles veterinarios, paseos y buena alimentación.', aceptaCompromiso: true });
function entrar(cuenta) { expect(PEH.sesion.iniciar(cuenta)).toBe(true); }
function volverAEntrar(cuenta) {
    // Cerrar la sesión y reconstruir el almacenamiento a partir de sus cadenas:
    // obliga a releer JSON; no basta con devolver un objeto en memoria del servicio.
    expect(PEH.sesion.cerrar()).toBe(true);
    memoria = new Map(JSON.parse(JSON.stringify([...memoria])));
    entrar(cuenta);
  }

beforeAll(async()=>{vi.stubGlobal("crypto",webcrypto);
    // Entorno mínimo para servicios: eventos reales de Node y crypto nativo.
    // No se simula el DOM. El caso 15 usa renderizado de React en servidor.
    const ventana = new EventTarget();
    ventana.crypto = globalThis.crypto;
    vi.stubGlobal('window', ventana);
    memoria = new Map();
    descriptorOriginal = Object.getOwnPropertyDescriptor(window, 'localStorage');
    const almacenamiento = {
      getItem: clave => memoria.get(String(clave)) ?? null,
      setItem: (clave, valor) => memoria.set(String(clave), String(valor)),
      removeItem: clave => memoria.delete(String(clave)),
      clear: () => memoria.clear(),
      key: indice => [...memoria.keys()][indice] ?? null,
      get length() { return memoria.size; }
    };
    Object.defineProperty(window, 'localStorage', { configurable: true, value: almacenamiento });
    vi.stubGlobal('localStorage', almacenamiento);
    PEH = (await import("./../src/services/login.js")).default;
    ({ enviarSolicitud } = await import("./../src/services/animal.js"));

    animales = (await import('../src/data/global.js')).animales;
  });
afterAll(() => {
    if (descriptorOriginal) Object.defineProperty(window, 'localStorage', descriptorOriginal);
    else delete window.localStorage;
    vi.unstubAllGlobals();
  });
beforeEach(() => {
    memoria = new Map();
    localStorage.setItem(PEH.CLAVES.cuentas, JSON.stringify([cuentaA, cuentaB]));
    PEH.catalogo.inicializar(animales);
    entrar(cuentaA);
  });

it('conserva la solicitud de adopción para el historial de su cuenta', () => {
    const animal = PEH.catalogo.listar().find(a => a.estadoPerfil === 'disponible');
    expect(animal).toBeDefined();
    const resultado = enviarSolicitud(animal, datosAdopcion());
    expect(resultado.ok).toBe(true);
    expect(JSON.parse(localStorage.getItem(PEH.CLAVES.adopciones))).toContainEqual(expect.objectContaining({ id: resultado.solicitud.id, usuarioId: cuentaA.id, animalNombre: animal.nombre }));
    volverAEntrar(cuentaA);
    expect(PEH.adopciones.listar()).toEqual([expect.objectContaining({ id: resultado.solicitud.id, animalNombre: animal.nombre, estado: 'Pendiente' })]);
  });

it('limpia los campos dependientes solo al responder No', async () => {
    const { limpiarCondicionales } = await import("./../src/services/animal.js");
    const d = {...datosAdopcion(),detalleAnimales:'Un gato adulto tranquilo.'};
    expect(limpiarCondicionales({...d,viveConPersonas:''}).personasHogar).toBe('2');
    expect(limpiarCondicionales({...d,viveConPersonas:'no',otrosAnimales:'no'})).toEqual(expect.objectContaining({personasHogar:'',acuerdoFamiliar:'',detalleAnimales:''}));
  });
});

describe('Validaciones y recuperación del proceso',()=>{

const credExtra={nombre:'Ana',apellido:'Prueba',usuario:'ana_extra',correo:'ana.extra@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};
async function entrarExtra(){await registrarCuenta(credExtra);await iniciarSesion(credExtra.correo,credExtra.contrasena);}
beforeEach(()=>{localStorage.clear();sessionStorage.clear();Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});window.history.replaceState(null,'','/#inicio');window.scrollTo=vi.fn();window.alert=vi.fn();window.confirm=vi.fn(()=>true);HTMLElement.prototype.scrollIntoView=vi.fn();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});

it('dos intentos pendientes del formulario de adopción envían una única solicitud',async()=>{
 await entrarExtra();const animal=PEH.catalogo.listar()[0],datos={nombreAdoptante:'Ana Prueba',edadAdoptante:'26',correoAdoptante:credExtra.correo,telefonoAdoptante:credExtra.telefono,comunaAdoptante:'Macul',tipoVivienda:'casa',situacionVivienda:'propia',viveConPersonas:'no',otrosAnimales:'no',experienciaAnimales:'si',motivoAdopcion:'Quiero dar un hogar estable y responsable.',cuidadosAnimal:'Tendrá paseos diarios y atención veterinaria.',aceptaCompromiso:true};guardarBorrador(claveBorrador('adopcion:'+animal.id),datos);let resolver;const enviarServicio=vi.fn(()=>new Promise(r=>{resolver=r;})),onEnviada=vi.fn();const {result}=renderHook(()=>useFormularioAdopcion({animal,enviarServicio,onEnviada,onCancelar:vi.fn(),onProcesando:vi.fn()}));let primera,segunda;
 act(()=>{primera=result.current.enviar({preventDefault(){},currentTarget:{querySelector(){return null;}}});segunda=result.current.enviar({preventDefault(){},currentTarget:{querySelector(){return null;}}});});expect(enviarServicio).toHaveBeenCalledTimes(1);await act(async()=>{resolver({ok:true,solicitud:{id:'unica'}});await Promise.all([primera,segunda]);});expect(onEnviada).toHaveBeenCalledTimes(1);
});

});

describe('Datos del responsable y convivencia',()=>{
 it('autocompleta la edad y rechaza cantidades de convivientes fuera del rango',()=>{
  localStorage.clear();const cuenta={id:'RESP',nombre:'Ana',apellido:'Prueba',correo:'ana@peh.cl',telefono:'912345678',comuna:'Macul',fechaNacimiento:'2000-01-15'};localStorage.setItem(PEH.CLAVES.cuentas,JSON.stringify([cuenta]));PEH.sesion.iniciar(cuenta);
  const datos={...datosInicialesAdopcion(new Date(2026,0,14)),tipoVivienda:'casa',situacionVivienda:'propia',viveConPersonas:'si',personasHogar:'2',acuerdoFamiliar:'si',otrosAnimales:'no',experienciaAnimales:'si',motivoAdopcion:'Quiero dar un hogar estable y responsable.',cuidadosAnimal:'Tendrá paseos diarios y atención veterinaria.',aceptaCompromiso:true};expect(datos.edadAdoptante).toBe('25');expect(erroresSolicitud(datos)).toEqual({});for(const personasHogar of ['0','11','100','1.5',''])expect(erroresSolicitud({...datos,personasHogar}).personasHogar).toBeTruthy();
 });
});
