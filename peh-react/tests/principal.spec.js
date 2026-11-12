import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { TarjetaAnimal } from '../src/components/principal.jsx';
import { animales } from '../src/data/global.js';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import { registrarCuenta, iniciarSesion } from '../src/services/login.js';
import { obtenerAnimalesFiltrados } from '../src/services/principal.js';
import { filtrosIniciales } from '../src/data/principal.js';
// @vitest-environment jsdom

describe('Interacciones y cancelación de procesos',()=>{
beforeEach(()=>{
 localStorage.clear();sessionStorage.clear();document.body.style.overflow='';
 HTMLElement.prototype.scrollIntoView=vi.fn();window.scrollTo=vi.fn();
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();document.body.style.overflow='';});

it('la tarjeta animal conserva el acceso por teclado y el reemplazo de una imagen fallida',()=>{
 const animal=animales[0],ui=render(createElement(TarjetaAnimal,{animal}));
 const enlace=ui.getByRole('link');const evento=new KeyboardEvent('keydown',{key:' ',bubbles:true,cancelable:true});
 fireEvent(enlace,evento);expect(evento.defaultPrevented).toBe(true);expect(window.location.hash).toBe('#animal/'+encodeURIComponent(animal.slug));
 fireEvent.error(ui.getByRole('img'));expect(ui.queryByRole('img')).toBeNull();expect(ui.container.querySelector('.texto-imagen-no-disponible').textContent).toBe(animal.nombre.charAt(0));
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

it('Inicio recupera su scroll al volver desde Contacto sin que su montaje lo fuerce de nuevo arriba',async()=>{
 await preparar('inicio');let y=0;
 const scroll=vi.spyOn(window,'scrollY','get').mockImplementation(()=>y);
 const alto=vi.spyOn(document.documentElement,'scrollHeight','get').mockReturnValue(10000);
 window.scrollTo=vi.fn((opciones,valor)=>{y=typeof opciones==='object'?opciones.top:valor;});
 try{
  render(createElement(App));await waitFor(()=>expect(document.querySelectorAll('.tarjeta-animal').length).toBeGreaterThan(0));
  await act(async()=>{y=740;window.dispatchEvent(new Event('scroll'));});
  await navegar('contacto');expect(y).toBe(0);
  await act(async()=>{y=280;window.dispatchEvent(new Event('scroll'));});
  await navegar('inicio');await waitFor(()=>expect(y).toBe(740));
  await act(async()=>{await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
  expect(y).toBe(740);expect(fetch).not.toHaveBeenCalled();
 }finally{cleanup();scroll.mockRestore();alto.mockRestore();}
});

it('el carrusel cambia texto, imagen y destino juntos, respeta el orden y vuelve al inicio',async()=>{
 const user=await preparar();render(createElement(App));
 const hero=screen.getByRole('region',{name:'Destacados de PEH'});
 expect(within(hero).getByRole('link',{name:/Conocerlos/}).getAttribute('href')).toBe('#animales');
 expect(hero.querySelector('.hero-mensaje').textContent).toContain('Una nueva historia');
 for(const [seccion,imagen] of [['Comunidad','comunidad.jpeg'],['Veterinaria','veterinaria.jpg'],['Contacto','contacto.jpg']]){
  await user.click(within(hero).getByRole('button',{name:'Diapositiva siguiente'}));
  expect(hero.querySelector('.carrusel-diapositiva .hero-etiqueta').textContent).toBe(seccion);
  const titulos={Comunidad:'Únete a nuestra comunidad.',Veterinaria:'Recuerda cuidar de su salud.',Contacto:'Comunícate con nosotros.'};
  expect(within(hero).getByRole('heading',{level:1}).textContent.trim()).toBe(titulos[seccion]);
  const finales={Comunidad:'Juntos ayudamos a más patitas.',Veterinaria:'Reserva una hora en veterinaria.',Contacto:'Tu mensaje nos ayuda a mejorar.'};
  expect(hero.querySelector('.carrusel-diapositiva .hero-texto p').textContent).not.toContain(finales[seccion]);
  expect(hero.querySelector('.carrusel-diapositiva .hero-frase-imagen').textContent).toBe(finales[seccion]);
  expect(hero.querySelector('.carrusel-diapositiva .hero-imagen').style.backgroundImage).toContain('/img/'+imagen);
  expect(within(hero).getByRole('link',{name:seccion,exact:true}).getAttribute('href')).toBe('#'+seccion.toLowerCase());
  expect(hero.querySelector('.hero-mensaje')).toBeNull();
 }
 await user.click(within(hero).getByRole('button',{name:'Diapositiva siguiente'}));
 expect(hero.querySelector('.carrusel-diapositiva .hero-imagen').style.backgroundImage).toContain('/img/Loign.jpg');
 await user.click(within(hero).getByRole('button',{name:'Diapositiva anterior'}));
 expect(hero.querySelector('.carrusel-diapositiva .hero-etiqueta').textContent).toBe('Contacto');
 await user.click(within(hero).getByRole('button',{name:'Mostrar Veterinaria'}));
 expect(within(hero).getByRole('button',{name:'Mostrar Veterinaria'}).getAttribute('aria-current')).toBe('true');
 await user.click(within(hero).getByRole('link',{name:'Veterinaria',exact:true}));
 expect(await screen.findByRole('heading',{name:'Veterinaria',exact:true})).toBeTruthy();
 expect(fetch).not.toHaveBeenCalled();
});
});

describe('Persistencia y reglas por cuenta',()=>{
let PEH, filtrar, filtrosIniciales, animales;
let memoria, descriptorOriginal;
const cuentaA = { id: 'TEST-A', nombre: 'Ana', apellido: 'Prueba', usuario: 'ana_test', correo: 'ana.test@gmail.com' };
const cuentaB = { id: 'TEST-B', nombre: 'Bruno', apellido: 'Prueba', usuario: 'bruno_test', correo: 'bruno.test@gmail.com' };

function entrar(cuenta) { expect(PEH.sesion.iniciar(cuenta)).toBe(true); }

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

    ({ obtenerAnimalesFiltrados: filtrar, filtrosIniciales } = await import("./../src/services/principal.js"));
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

it('filtra perros y gatos con la misma función que usa el catálogo', () => {
    const catalogo = PEH.catalogo.listar();
    for (const especie of ['perro', 'gato']) {
      const resultado = filtrar(catalogo, { ...filtrosIniciales, especie });
      expect(resultado.length).toBeGreaterThan(0);
      expect(resultado.map(a => a.id).sort()).toEqual(catalogo.filter(a => a.especie === especie).map(a => a.id).sort());
      expect(resultado.every(a => a.especie === especie)).toBe(true);
    }
    expect(filtrar(catalogo, filtrosIniciales)).toEqual(catalogo);
  });
});

describe('Validaciones y recuperación del proceso',()=>{

beforeEach(()=>{localStorage.clear();sessionStorage.clear();Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});window.history.replaceState(null,'','/#inicio');window.scrollTo=vi.fn();window.alert=vi.fn();window.confirm=vi.fn(()=>true);HTMLElement.prototype.scrollIntoView=vi.fn();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});

it('combina comuna, tamaño, hogar, convivencia, sexo y edad y devuelve vacío si no coinciden',()=>{
 const a={id:'A',especie:'perro',comunaValor:'macul',tamano:'mediano',hogar:['casa'],convivencia:['ninos'],sexo:'macho',edadMeses:18},b={...a,id:'B',especie:'gato',comunaValor:'nunoa',tamano:'pequeno',hogar:['departamento'],convivencia:['gatos'],sexo:'hembra',edadMeses:60},c={...a,id:'C',edadMeses:120},lista=[a,b,c];
 const combinados={...filtrosIniciales,comuna:'macul',tamano:'mediano',hogar:'casa',convivencia:'ninos',sexo:'macho',edad:'menos-2'};expect(obtenerAnimalesFiltrados(lista,combinados).map(a=>a.id)).toEqual(['A']);expect(obtenerAnimalesFiltrados(lista,{...combinados,comuna:'nunoa'})).toEqual([]);
 for(const[edad,ids]of [['menos-2',['A']],['2-7',['B']],['mas-7',['C']]])expect(obtenerAnimalesFiltrados(lista,{...filtrosIniciales,edad}).map(a=>a.id)).toEqual(ids);expect(obtenerAnimalesFiltrados(lista,filtrosIniciales)).toEqual(lista);
});

});
