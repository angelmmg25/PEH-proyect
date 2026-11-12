import * as accesoExtra from '../src/services/login.js';
import { registrarCuenta } from '../src/services/login.js';
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { createElement } from 'react';
import { render, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import PEH from '../src/services/global.js';
// @vitest-environment jsdom

describe('Operaciones, persistencia y permisos',()=>{
let PEH, auth, memoria;
const cred={nombre:'Ana',apellido:'Prueba',usuario:'ana_test',correo:'ana@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};

const entrar=()=>auth.iniciarSesion(cred.correo,cred.contrasena);
beforeAll(async()=>{vi.stubGlobal("crypto",webcrypto);
 memoria=new Map();const storage={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
 const ventana=new EventTarget();ventana.crypto=crypto;ventana.alert=vi.fn();
 vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',storage);
 vi.stubGlobal('fetch',vi.fn(()=>{throw new Error('No se permite HTTP en el modo local.');}));
 auth=await import("./../src/services/login.js");PEH=auth.default;
 
});
beforeEach(async()=>{memoria.clear();fetch.mockClear();await auth.registrarCuenta(cred);await entrar();});
afterAll(()=>vi.unstubAllGlobals());

it('registro, login, cierre y reapertura funcionan sin token ni solicitudes HTTP',async()=>{
 const s=PEH.sesion.obtener();expect(s).toMatchObject({nombre:'Ana',origen:'local',usuarioId:s.id});expect(s).not.toHaveProperty('token');
 await auth.cerrarSesionLocal();expect(PEH.sesion.obtener()).toBeNull();expect((await entrar()).id).toBe(s.id);expect(fetch).not.toHaveBeenCalled();
});

it('las credenciales se derivan y nunca se guarda la contraseña en claro',()=>{
 expect([...memoria.values()].join('')).not.toContain(cred.contrasena);const cuenta=PEH.lista(PEH.CLAVES.cuentas)[0];expect(cuenta.claveDerivada).toHaveLength(64);expect(PEH.cuentas.listar()[0]).not.toHaveProperty('claveDerivada');
});

it('rechaza correo y usuario duplicados sin reemplazar la cuenta',async()=>{
 const antes=memoria.get(PEH.CLAVES.cuentas);await expect(auth.registrarCuenta(cred)).rejects.toThrow();expect(memoria.get(PEH.CLAVES.cuentas)).toBe(antes);
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

it('el formulario real inicia sesión local, muestra animales y permite cerrar sesión',async()=>{
 await registrarCuenta(cred);const user=userEvent.setup();render(createElement(App));
 const f=document.getElementById('formularioInicioSesion');await user.type(f.querySelector('#correo'),cred.correo);await user.type(f.querySelector('#contrasena'),cred.contrasena);await user.click(within(f).getByRole('button',{name:/Iniciar sesión/i}));
 expect(await screen.findByText('Hola, Ana')).toBeTruthy();await waitFor(()=>expect(document.querySelectorAll('.tarjeta-animal').length).toBeGreaterThan(0));
 await user.click(screen.getByRole('button',{name:'Cerrar sesión',exact:true}));expect(await screen.findByRole('heading',{name:'Bienvenido a PEH'})).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
});
});

describe('Validaciones y recuperación del proceso',()=>{

const credExtra={nombre:'Ana',apellido:'Prueba',usuario:'ana_extra',correo:'ana.extra@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};

beforeEach(()=>{localStorage.clear();sessionStorage.clear();Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});window.history.replaceState(null,'','/#inicio');window.scrollTo=vi.fn();window.alert=vi.fn();window.confirm=vi.fn(()=>true);HTMLElement.prototype.scrollIntoView=vi.fn();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});

it.each([['inicio','formularioInicioSesion','botonIniciarSesion'],['registro','formularioRegistro','botonRegistrar']])('el formulario de %s vacío muestra los errores y no crea una sesión',async(tipo,id,boton)=>{
 const user=userEvent.setup();render(createElement(App));if(tipo==='registro')await user.click(document.getElementById('botonMostrarRegistro'));
 fireEvent.submit(document.getElementById(id));
 expect(document.getElementById(id).querySelectorAll('[aria-invalid="true"]').length).toBeGreaterThan(0);expect(PEH.sesion.obtener()).toBeNull();expect(PEH.cuentas.listar()).toHaveLength(0);
 const campo=tipo==='registro'?'errorNombreRegistro':'errorCorreoInicio';expect(document.getElementById(campo).textContent.trim()).not.toBe('');expect(document.getElementById(boton).disabled).toBe(false);
});
it('las credenciales incorrectas muestran un error sin iniciar sesión',async()=>{
 await registrarCuenta(credExtra);const user=userEvent.setup();render(createElement(App));await user.type(document.getElementById('correo'),credExtra.correo);await user.type(document.getElementById('contrasena'),'Incorrecta123!');await user.click(document.getElementById('botonIniciarSesion'));
 await waitFor(()=>expect(document.getElementById('errorContrasenaInicio').textContent).toMatch(/incorrect|contraseña|credencial/i));expect(PEH.sesion.obtener()).toBeNull();
});
it('el registro real admite un solo envío y conserva la identidad elegida al iniciar sesión',async()=>{
 const registrar=vi.spyOn(accesoExtra,'registrarCuenta');const user=userEvent.setup();render(createElement(App));await user.click(document.getElementById('botonMostrarRegistro'));await waitFor(()=>expect(document.activeElement).toBe(document.getElementById('nombreRegistro')));
 for(const[id,value]of Object.entries({nombreRegistro:credExtra.nombre,apellidoRegistro:credExtra.apellido,usuarioRegistro:credExtra.usuario,correoRegistro:credExtra.correo,telefonoRegistro:'+56 9 1234 5678',comunaRegistro:credExtra.comuna,contrasenaRegistro:credExtra.contrasena,confirmarContrasenaRegistro:credExtra.contrasena}))await user.type(document.getElementById(id),value);
 fireEvent.change(document.getElementById('fechaNacimientoRegistro'),{target:{value:credExtra.fechaNacimiento}});await user.click(document.getElementById('terminosRegistro'));
 fireEvent.submit(document.getElementById('formularioRegistro'));fireEvent.submit(document.getElementById('formularioRegistro'));
 await waitFor(()=>expect(PEH.cuentas.listar()).toHaveLength(1));expect(registrar).toHaveBeenCalledTimes(1);expect(PEH.cuentas.listar()[0].telefono).toBe('+56912345678');await waitFor(()=>expect(document.getElementById('formularioInicioSesion').getAttribute('aria-hidden')).toBe('false'),{timeout:2500});
 await user.type(document.getElementById('contrasena'),credExtra.contrasena);await user.click(document.getElementById('botonIniciarSesion'));
 expect(await screen.findByText('Hola, Ana')).toBeTruthy();expect(document.querySelector('.usuario-cabecera').textContent).toBe(credExtra.usuario);
});

});
