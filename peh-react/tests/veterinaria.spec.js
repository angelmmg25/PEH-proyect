import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, within, waitFor, renderHook } from '@testing-library/react';
import { ConsejosVeterinaria } from '../src/components/veterinaria.jsx';
import PEH from '../src/services/global.js';
import { consejos } from '../src/data/veterinaria.js';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import { registrarCuenta, iniciarSesion } from '../src/services/login.js';
import { guardarBorradorReserva } from '../src/services/veterinaria.js';
import { useFormularioVeterinaria } from '../src/hooks/veterinaria.js';
// @vitest-environment jsdom

describe('Interacciones y cancelación de procesos',()=>{
beforeEach(()=>{
 localStorage.clear();sessionStorage.clear();document.body.style.overflow='';
 HTMLElement.prototype.scrollIntoView=vi.fn();window.scrollTo=vi.fn();
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();document.body.style.overflow='';});

it.each(['alimentacion','ejercicio','controles'])('el consejo %s conserva apertura, teclado, foco y cierre',tipo=>{
 document.body.style.overflow='scroll';const ui=render(createElement(ConsejosVeterinaria));
 const tarjeta=ui.container.querySelector(`[data-consejo="${tipo}"]`);tarjeta.focus();
 fireEvent.click(tarjeta);expect(ui.getByRole('dialog').textContent).toContain(consejos[tipo].titulo);
 const cerrar=ui.getByRole('button',{name:'Cerrar consejo'});expect(document.activeElement).toBe(cerrar);expect(document.body.style.overflow).toBe('hidden');
 fireEvent.click(cerrar);expect(ui.queryByRole('dialog')).toBeNull();expect(document.activeElement).toBe(tarjeta);expect(document.body.style.overflow).toBe('scroll');
 fireEvent.keyDown(tarjeta,{key:'Enter'});expect(ui.getByRole('dialog')).toBeTruthy();
 fireEvent.click(ui.getByRole('button',{name:'Cerrar consejo'}));
 const enlace=tarjeta.querySelector('button');fireEvent.click(enlace);expect(ui.getByRole('dialog').textContent).toContain(consejos[tipo].titulo);
});
});

describe('Operaciones, persistencia y permisos',()=>{
let auth, V, P, admin, memoria;
const cred={nombre:'Ana',apellido:'Prueba',usuario:'ana_test',correo:'ana@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};

const reserva={responsableNombre:'Ana Prueba',responsableCorreo:cred.correo,responsableTelefono:cred.telefono,responsableComuna:'Macul',servicio:'consulta',mascota:'perro',mascotaNombre:'Milo',fecha:'2035-01-10',hora:'09:00',observaciones:'Control general de mi mascota.'};

const entrar=()=>auth.iniciarSesion(cred.correo,cred.contrasena);
beforeAll(async()=>{vi.stubGlobal("crypto",webcrypto);
 memoria=new Map();const storage={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
 const ventana=new EventTarget();ventana.crypto=crypto;ventana.alert=vi.fn();
 vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',storage);
 vi.stubGlobal('fetch',vi.fn(()=>{throw new Error('No se permite HTTP en el modo local.');}));
 auth=await import("./../src/services/login.js");
 V=await import("./../src/services/veterinaria.js");P=await import("./../src/services/perfil.js");admin=await import("./../src/services/administracion.js");
});
beforeEach(async()=>{memoria.clear();fetch.mockClear();await auth.registrarCuenta(cred);await entrar();});
afterAll(()=>vi.unstubAllGlobals());

it('reservas conservan fecha de Chile, evitan duplicados y permiten cancelar',async()=>{
 const r=V.registrarReserva(reserva,new Date('2026-11-06T15:00:00Z'));expect(r.ok).toBe(true);expect(V.registrarReserva(reserva).ok).toBe(false);
 expect((await V.listarMisReservas())[0]).toMatchObject({hora:'09:00',instanteCita:'2035-01-10T12:00:00.000Z'});
 await V.cancelarMiReserva(r.reserva.id);expect((await V.listarMisReservas())[0].estado).toBe('Cancelada');expect(V.registrarReserva(reserva).ok).toBe(true);
});

it('reservar confirma la hora y la vista simple usa el registro, no la cita agendada',async()=>{
 const resultado=V.registrarReserva(reserva);expect(resultado.ok).toBe(true);expect(resultado.reserva.estado).toBe('Confirmada');
 const e=P.eventoHistorial(resultado.reserva,'reservas');expect(e.etiquetaFecha).toBe('Fecha de reserva');expect(e.fecha).not.toContain('2035');expect(e.hora).toMatch(/hrs$/);
});

it('cerrar una atención guarda término, conclusión y recomendaciones sin perder la cita ni el historial',async()=>{
 vi.useFakeTimers({toFake:['Date']});
 try{
  vi.setSystemTime(new Date('2035-01-01T15:00:00Z'));
  const r=V.registrarReserva(reserva);expect(r.ok).toBe(true);
  await auth.cerrarSesionLocal();await auth.iniciarSesion('adminp@gmail.com','Admin1234!');
  vi.setSystemTime(new Date('2035-01-10T14:00:00Z'));
  const datos={estado:'Cerrada',fecha:reserva.fecha,hora:reserva.hora,fechaAtencion:'2035-01-10',horaTermino:'10:05',conclusionConsulta:'Control general realizado. Buen estado de salud.',recomendacionesVeterinario:'Mantener alimentación y próximo control en un mes.'};
  await expect(admin.guardarReservaAdmin(r.reserva.id,{...datos,horaTermino:''})).rejects.toThrow();
  await expect(admin.guardarReservaAdmin(r.reserva.id,{...datos,conclusionConsulta:''})).rejects.toThrow();
  await expect(admin.guardarReservaAdmin(r.reserva.id,{...datos,horaTermino:'18:00'})).rejects.toThrow();
  await admin.guardarReservaAdmin(r.reserva.id,datos);
  await expect(admin.guardarReservaAdmin(r.reserva.id,{...datos,estado:'Confirmada',fecha:'2035-01-11'})).rejects.toThrow();
  await entrar();const actual=(await V.listarMisReservas())[0];
  expect(actual).toMatchObject({...datos,historialCambios:[{estado:'Cerrada',horaTermino:'10:05'}]});
  const e=P.eventoHistorial(actual,'reservas');expect(e.etiquetaHora).toBe('Hora de término');expect(e.hora).toBe('10:05 hrs');expect(e.fecha).toContain('2035');expect(P.mensajeHistorial(actual,'reservas')).toContain('finalizó');
  expect(actual.fecha).toBe(reserva.fecha);expect(actual.hora).toBe(reserva.hora);
 }finally{vi.useRealTimers();}
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

it('veterinaria conserva formulario y confirmación, y permite cancelar la reserva',async()=>{
 const user=await preparar('veterinaria');render(createElement(App));await screen.findByRole('heading',{name:'Veterinaria',exact:true});
 for(const [id,v] of Object.entries({servicioReserva:'consulta',mascotaReserva:'gato',horaReserva:'10:30'}))await user.selectOptions(document.getElementById(id),v);
 await user.type(document.getElementById('nombreMascotaReserva'),'Michi');await user.type(document.getElementById('fechaReserva'),'2035-01-11');
 const f=document.getElementById('fechaReserva').form;await user.click(within(f).getByRole('button',{name:/Reservar hora/i}));
 await waitFor(()=>expect(PEH.reservas.listar()).toHaveLength(1));expect(document.querySelector('.resumen-reserva-vivo dd').textContent).toBe('Por indicar');await navegar('perfil');await user.click(await screen.findByRole('button',{name:'Cancelar reserva de Michi'}));await user.click(screen.getByRole('button',{name:'Confirmar cancelación'}));expect(await screen.findByText('La reserva fue cancelada.')).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
});

it('el panel veterinario refleja el formulario y el borrador sin añadir el nombre a Mascota',async()=>{
 const user=await preparar('veterinaria');render(createElement(App));
 const panel=screen.getByRole('complementary',{name:'Guía y resumen de la reserva'});
 const valor=etiqueta=>within(screen.getByRole('complementary',{name:'Guía y resumen de la reserva'})).getByText(etiqueta,{exact:true}).closest('div').querySelector('dd').textContent;
 expect(within(panel).getByRole('heading',{name:'Prepara tu visita'})).toBeTruthy();
 expect(panel.querySelectorAll('.recordatorios-visita li')).toHaveLength(3);
 expect(panel.querySelector('img').getAttribute('src')).toBe('/img/veterinaria-perro-gato.png');
 expect(valor('Mascota')).toBe('Por indicar');expect(valor('Servicio')).toBe('Por seleccionar');expect(valor('Fecha')).toBe('Por seleccionar');expect(valor('Hora')).toBe('Por seleccionar');
 await user.selectOptions(document.getElementById('mascotaReserva'),'gato');await user.selectOptions(document.getElementById('servicioReserva'),'consulta');
 await user.type(document.getElementById('nombreMascotaReserva'),'Pelusa');await user.type(document.getElementById('fechaReserva'),'2035-01-11');await user.selectOptions(document.getElementById('horaReserva'),'10:30');
 expect(valor('Mascota')).toBe('Gato');expect(valor('Mascota')).not.toContain('Pelusa');expect(valor('Servicio')).toBe('Consulta general');expect(valor('Fecha')).toContain('2035');expect(valor('Hora')).toBe('10:30');
 // Cambiar el formulario no registra una reserva por anticipado.
 expect(PEH.reservas.listar()).toHaveLength(0);
 await navegar('inicio');await navegar('veterinaria');
 expect(valor('Mascota')).toBe('Gato');expect(valor('Servicio')).toBe('Consulta general');expect(valor('Hora')).toBe('10:30');
 await user.click(screen.getByRole('button',{name:'Cancelar proceso',exact:true}));
 expect(valor('Mascota')).toBe('Por indicar');expect(valor('Servicio')).toBe('Por seleccionar');expect(valor('Fecha')).toBe('Por seleccionar');expect(valor('Hora')).toBe('Por seleccionar');
 expect(within(screen.getByRole('complementary',{name:'Guía y resumen de la reserva'})).getByRole('link',{name:'Ir a mi perfil →'}).getAttribute('href')).toBe('#perfil');
 expect(fetch).not.toHaveBeenCalled();
});
});

describe('Persistencia y reglas por cuenta',()=>{
let PEH, registrarReserva, animales;
let memoria, descriptorOriginal;
const cuentaA = { id: 'TEST-A', nombre: 'Ana', apellido: 'Prueba', usuario: 'ana_test', correo: 'ana.test@gmail.com' };
const cuentaB = { id: 'TEST-B', nombre: 'Bruno', apellido: 'Prueba', usuario: 'bruno_test', correo: 'bruno.test@gmail.com' };
const ahora = new Date(2035, 0, 10, 9, 0);
const datosReserva = () => ({ responsableNombre:'Ana Prueba', responsableCorreo:'ana.test@gmail.com', responsableTelefono:'912345678', responsableComuna:'Macul', servicio: 'consulta', mascota: 'perro', mascotaNombre: 'Firulais', fecha: '2035-01-11', hora: '10:30', observaciones: 'Control general de mi mascota.' });

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
    
    ({ registrarReserva } = await import("./../src/services/veterinaria.js"));
    
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

it('conserva la reserva veterinaria para el historial de su cuenta', () => {
    const resultado = registrarReserva(datosReserva(), ahora);
    expect(resultado.ok).toBe(true);
    expect(JSON.parse(localStorage.getItem(PEH.CLAVES.reservas))).toContainEqual(expect.objectContaining({ id: resultado.reserva.id, usuarioId: cuentaA.id }));
    volverAEntrar(cuentaA);
    expect(PEH.reservas.listar()).toEqual([expect.objectContaining({ id: resultado.reserva.id, mascotaNombre: 'Firulais', fecha: '2035-01-11', hora: '10:30' })]);
  });

it('bloquea una reserva duplicada incluso después de volver a entrar', () => {
    expect(registrarReserva(datosReserva(), ahora).ok).toBe(true);
    volverAEntrar(cuentaA);
    const duplicada = registrarReserva({ ...datosReserva(), mascotaNombre: '  FIRULAIS  ' }, ahora);
    expect(duplicada.ok).toBe(false);
    expect(duplicada.mensaje).toContain('Ya tienes una reserva');
    expect(PEH.reservas.listar().length).toBe(1);
    expect(JSON.parse(localStorage.getItem(PEH.CLAVES.reservas)).length).toBe(1);
  });

it('recupera el borrador tras reconstruir almacenamiento y separa cuentas', async () => {
    const {guardarBorradorReserva,leerBorradorReserva} = await import("./../src/services/veterinaria.js");
    expect(guardarBorradorReserva(datosReserva())).toBe(true);
    volverAEntrar(cuentaA);
    expect(leerBorradorReserva()).toEqual(datosReserva());
    entrar(cuentaB); expect(leerBorradorReserva()).toBeNull();
    volverAEntrar(cuentaA);expect(leerBorradorReserva().mascotaNombre).toBe('Firulais');
  });

it('rechaza servicio, horario y fecha que no corresponden', async () => {
    const {validarCampoReserva} = await import("./../src/services/veterinaria.js");
    for (const [campo,valor] of [['servicio','inventado'],['mascota','conejo'],['hora','10:00'],['fecha','2035-02-30'],['responsableTelefono','123']]) {
      expect(validarCampoReserva(campo,{...datosReserva(),[campo]:valor},ahora)).toBeTruthy();
    }
    expect(validarCampoReserva('hora',datosReserva(),ahora)).toBe('');
  });

it('cancelar el borrador conserva la reserva ya enviada', async () => {
    const {guardarBorradorReserva,eliminarBorradorReserva,leerBorradorReserva} = await import("./../src/services/veterinaria.js");
    const enviada=registrarReserva(datosReserva(),ahora);expect(enviada.ok).toBe(true);
    expect(guardarBorradorReserva({...datosReserva(),mascotaNombre:'Otra mascota'})).toBe(true);
    expect(eliminarBorradorReserva()).toBe(true);expect(leerBorradorReserva()).toBeNull();
    expect(PEH.reservas.listar().map(r=>r.id)).toEqual([enviada.reserva.id]);
  });

it('recupera y elimina el borrador veterinario histórico sin cambiar su clave', async () => {
    const V = await import("./../src/services/veterinaria.js");
    const B = await import("./../src/services/global.js");
    const clave = 'peh_borrador_veterinaria_v1:' + encodeURIComponent(cuentaA.id);
    localStorage.setItem(clave, JSON.stringify({...datosReserva(), campoAjeno:'No pertenece al formulario'}));
    expect(B.claveBorrador('veterinaria')).toBe(clave);
    expect(V.leerBorradorReserva()).toEqual(datosReserva());
    expect(V.guardarBorradorReserva({...datosReserva(), mascotaNombre:'Pelusa'})).toBe(true);
    expect(JSON.parse(localStorage.getItem(clave)).mascotaNombre).toBe('Pelusa');
    expect(V.eliminarBorradorReserva()).toBe(true);
    expect(localStorage.getItem(clave)).toBeNull();
  });

it('no permite leer ni borrar la clave veterinaria de otra cuenta mediante el servicio compartido', async () => {
    const B = await import("./../src/services/global.js");
    const claveA = B.claveBorrador('veterinaria');
    expect(B.guardarBorrador(claveA, datosReserva())).toBe(true);
    entrar(cuentaB);
    expect(B.leerBorrador(claveA)).toBeUndefined();
    expect(B.guardarBorrador(claveA, {mascotaNombre:'Otra'})).toBe(false);
    expect(B.borrarBorrador(claveA)).toBe(false);
    entrar(cuentaA);
    expect(B.leerBorrador(claveA)).toEqual(datosReserva());
  });
});

describe('Validaciones y recuperación del proceso',()=>{

const credExtra={nombre:'Ana',apellido:'Prueba',usuario:'ana_extra',correo:'ana.extra@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};
async function entrarExtra(){await registrarCuenta(credExtra);await iniciarSesion(credExtra.correo,credExtra.contrasena);}
beforeEach(()=>{localStorage.clear();sessionStorage.clear();Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});window.history.replaceState(null,'','/#inicio');window.scrollTo=vi.fn();window.alert=vi.fn();window.confirm=vi.fn(()=>true);HTMLElement.prototype.scrollIntoView=vi.fn();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});

it('dos intentos mientras se envía la reserva ejecutan una sola operación',async()=>{
 await entrarExtra();const datos={responsableNombre:'Ana Prueba',responsableCorreo:credExtra.correo,responsableTelefono:credExtra.telefono,responsableComuna:'Macul',servicio:'consulta',mascota:'gato',mascotaNombre:'Pelusa',fecha:'2035-01-11',hora:'10:30',observaciones:''};guardarBorradorReserva(datos);let resolver;const registrar=vi.fn(()=>new Promise(r=>{resolver=r;}));const {result,unmount}=renderHook(()=>useFormularioVeterinaria(registrar));
 let primera,segunda;act(()=>{primera=result.current.reservar({preventDefault(){}});segunda=result.current.reservar({preventDefault(){}});});expect(registrar).toHaveBeenCalledTimes(1);await act(async()=>{resolver({ok:true,reserva:{...datos,id:'unica'}});await Promise.all([primera,segunda]);});expect(result.current.mensaje.reserva.id).toBe('unica');unmount();
});

});
