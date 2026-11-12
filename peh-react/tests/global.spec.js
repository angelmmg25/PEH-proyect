import { URL as NodeURL } from 'node:url';
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { createElement } from 'react';
import { render, screen, within, cleanup, waitFor, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import PEH, { correoValido, claveBorrador, guardarBorrador, leerBorrador } from '../src/services/global.js';
import { registrarCuenta, iniciarSesion } from '../src/services/login.js';
import { useMemoriaNavegacion } from '../src/hooks/global.jsx';
// @vitest-environment jsdom

describe('Permisos de invitado y borradores de acceso',()=>{
let requiereSesion, vistaPermitidaInvitado;
let PEH, B, memoria;
beforeAll(async()=>{vi.stubGlobal("crypto",webcrypto);
  memoria=new Map();const almacenamiento={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
  const ventana=new EventTarget();ventana.localStorage=almacenamiento;ventana.crypto=globalThis.crypto;
  vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',almacenamiento);
  PEH=(await import("./../src/services/login.js")).default;B=await import("./../src/services/global.js");({requiereSesion,vistaPermitidaInvitado}=B);
 });
afterAll(()=>vi.unstubAllGlobals());
beforeEach(()=>{memoria.clear();localStorage.setItem(PEH.CLAVES.cuentas,JSON.stringify([{id:'A',nombre:'Ana',correo:'a@duocuc.cl'}]));PEH.sesion.iniciar({id:'INV',invitado:true});});

it('permite inicio, catálogo y perfiles de animales',()=>{for(const ruta of ['inicio','animales','animal/milo','#animal/nala'])expect(vistaPermitidaInvitado(ruta)).toBe(true);});

it('exige sesión en perfil y secciones restringidas, también rutas directas',()=>{for(const ruta of ['perfil','perfil/consultas','comunidad/perdidos','veterinaria','veterinaria/reservar','contacto','desarrollador'])expect(requiereSesion(ruta,PEH.sesion.obtener())).toBe(true);});

it('no impone ese bloqueo a una cuenta registrada',()=>{PEH.sesion.iniciar({id:'A'});expect(requiereSesion('veterinaria',PEH.sesion.obtener())).toBe(false);});

it('sin sesión solo admite borrador de acceso y registro sin contraseñas',()=>{PEH.sesion.cerrar();expect(B.claveBorrador('contacto')).toBeNull();const clave=B.claveBorrador('acceso-registro');expect(B.guardarBorrador(clave,{correo:'a@duocuc.cl',contrasena:'No guardar'})).toBe(true);expect(B.leerBorrador(clave)).toEqual({correo:'a@duocuc.cl'});});

it('al pasar a una cuenta se puede limpiar el borrador de acceso previo',()=>{PEH.sesion.cerrar();const clave=B.claveBorrador('acceso-registro');B.guardarBorrador(clave,{correo:'a@duocuc.cl'});PEH.sesion.iniciar({id:'A'});expect(B.borrarBorrador(clave)).toBe(true);expect(localStorage.getItem(clave)).toBeNull();});
});

describe('Organización de estilos',()=>{
const carpeta=new NodeURL('../src/styles/',import.meta.url);

it('carga exactamente ocho estilos de vista y uno global desde una única entrada',()=>{
 const archivos=readdirSync(carpeta).filter(n=>n.endsWith('.css')).sort();
 expect(archivos).toEqual(['administracion.css','animal.css','comunidad.css','contacto.css','global.css','login.css','perfil.css','principal.css','veterinaria.css']);
 const entrada=readFileSync(new NodeURL('../src/main.jsx',import.meta.url),'utf8');
 for(const archivo of archivos)expect(entrada.split(`./styles/${archivo}`).length-1,archivo).toBe(1);
});
});

describe('Operaciones, persistencia y permisos',()=>{
let PEH, auth, A, V, C, M, memoria;
const cred={nombre:'Ana',apellido:'Prueba',usuario:'ana_test',correo:'ana@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};
const formulario={nombreAdoptante:'Ana Prueba',edadAdoptante:'26',correoAdoptante:cred.correo,telefonoAdoptante:cred.telefono,comunaAdoptante:'Macul',tipoVivienda:'casa',situacionVivienda:'propia',viveConPersonas:'no',personasHogar:'',acuerdoFamiliar:'',otrosAnimales:'no',detalleAnimales:'',experienciaAnimales:'si',motivoAdopcion:'Quiero darle un hogar estable y seguro.',cuidadosAnimal:'Tendrá paseos diarios y controles veterinarios.',aceptaCompromiso:true};
const reserva={responsableNombre:'Ana Prueba',responsableCorreo:cred.correo,responsableTelefono:cred.telefono,responsableComuna:'Macul',servicio:'consulta',mascota:'perro',mascotaNombre:'Milo',fecha:'2035-01-10',hora:'09:00',observaciones:'Control general de mi mascota.'};
const consulta={nombre:'Ana Prueba',correo:cred.correo,motivo:'otro',asunto:'Consulta de prueba',mensaje:'Necesito información sobre el proceso de adopción.'};
const publicar=()=>M.crearPublicacion({contenido:'Contenido de prueba suficientemente largo.',categoria:'consejos',ubicacion:'Macul',imagen:null});
const entrar=()=>auth.iniciarSesion(cred.correo,cred.contrasena);
beforeAll(async()=>{vi.stubGlobal("crypto",webcrypto);
 memoria=new Map();const storage={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
 const ventana=new EventTarget();ventana.crypto=crypto;ventana.alert=vi.fn();
 vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',storage);
 vi.stubGlobal('fetch',vi.fn(()=>{throw new Error('No se permite HTTP en el modo local.');}));
 auth=await import("./../src/services/login.js");PEH=auth.default;
 A=await import("./../src/services/animal.js");V=await import("./../src/services/veterinaria.js");C=await import("./../src/services/contacto.js");M=await import("./../src/services/comunidad.js");
});
beforeEach(async()=>{memoria.clear();fetch.mockClear();await auth.registrarCuenta(cred);await entrar();});
afterAll(()=>vi.unstubAllGlobals());

it('el invitado no guarda contacto, reservas, adopciones, publicaciones ni borradores',async()=>{
 await auth.cerrarSesionLocal();PEH.sesion.iniciar({id:'INV',invitado:true});const antes=[...memoria];
 expect(C.registrarConsulta(consulta).ok).toBe(false);expect(V.registrarReserva(reserva).ok).toBe(false);expect(A.enviarSolicitud(PEH.catalogo.listar()[0],formulario).ok).toBe(false);await expect(publicar()).rejects.toThrow('Inicia sesión');const B=await import("./../src/services/global.js");expect(B.claveBorrador('contacto')).toBeNull();expect([...memoria]).toEqual(antes);
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

it('el invitado ve el catálogo y sus filtros, y recibe el bloqueo al abrir contacto',async()=>{
 const user=userEvent.setup();render(createElement(App));await user.click(screen.getByRole('button',{name:/invitado/i}));
 await waitFor(()=>expect(document.querySelectorAll('.tarjeta-animal').length).toBeGreaterThan(0));
 await user.click(screen.getByRole('button',{name:'Perros',exact:true}));expect([...document.querySelectorAll('#catalogoAnimales .tarjeta-animal img')].every(i=>i.alt.includes('Perro'))).toBe(true);
 await navegar('contacto');expect(await screen.findByRole('heading',{name:'Debes iniciar sesión'})).toBeTruthy();expect(document.querySelector('form')).toBeNull();expect(fetch).not.toHaveBeenCalled();
});

it.each(['inicio','animales','animal/milo','comunidad','veterinaria','perfil','contacto','ruta-inexistente'])('la barra compartida integra la sesión en %s y permite cerrar desde esa vista',async(ruta)=>{
 const user=await preparar(ruta);render(createElement(App));
 await waitFor(()=>expect(document.querySelector('header.cabecera-distribuida')).toBeTruthy());
 const cabecera=document.querySelector('header.cabecera-distribuida');
 expect(within(cabecera).getByText('Hola, Ana')).toBeTruthy();
 expect(screen.getAllByRole('button',{name:'Cerrar sesión',exact:true})).toHaveLength(1);
 expect(document.querySelector('.peh-sesion')).toBeNull();
 expect(Boolean(document.querySelector('.hero-mensaje'))).toBe(['inicio','animales'].includes(ruta));
 await user.click(within(cabecera).getByRole('button',{name:'Cerrar sesión',exact:true}));
 expect(await screen.findByRole('heading',{name:'Bienvenido a PEH'})).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
});

it.each(['inicio','perfil','desarrollador'])('administración también utiliza la misma barra en %s',async(ruta)=>{
 await registrarCuenta(cred);await iniciarSesion('adminp@gmail.com','Admin1234!');window.history.replaceState(null,'','/#'+ruta);const user=userEvent.setup();render(createElement(App));
 await waitFor(()=>expect(document.querySelector('header.cabecera-distribuida.cabecera-administrador')).toBeTruthy());
 const cabecera=document.querySelector('header.cabecera-distribuida');
 expect(within(cabecera).getByRole('link',{name:'Administración',exact:true})).toBeTruthy();
 expect(screen.getAllByRole('button',{name:'Cerrar sesión',exact:true})).toHaveLength(1);expect(document.querySelector('.peh-sesion')).toBeNull();
 await user.click(within(cabecera).getByRole('button',{name:'Cerrar sesión',exact:true}));expect(await screen.findByRole('heading',{name:'Bienvenido a PEH'})).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
});

it('el menú compartido conserva apertura, cierre con Escape y navegación',async()=>{
 const user=await preparar('contacto');render(createElement(App));const menu=await screen.findByRole('button',{name:'Abrir menú'});
 await user.click(menu);expect(menu.getAttribute('aria-expanded')).toBe('true');await user.keyboard('{Escape}');expect(menu.getAttribute('aria-expanded')).toBe('false');
 await user.click(menu);await user.click(screen.getByRole('link',{name:'Perfil',exact:true}));await screen.findByRole('heading',{name:'Mis solicitudes de adopción'});expect(screen.getByRole('button',{name:'Abrir menú'}).getAttribute('aria-expanded')).toBe('false');
});

it('el pie compartido aparece una sola vez, cambia la frase y conserva los destinos de sus enlaces',async()=>{
 const user=await preparar('inicio');render(createElement(App));
 const frases={inicio:'Ellos esperan por ti, conócelos.',animales:'Ellos esperan por ti, conócelos.',comunidad:'Más que una plataforma, una comunidad.',veterinaria:'Su salud también es importante. Cuídalos bien.','animal/milo':'Él podría ser tu próximo amigo.',contacto:'Escríbenos, estamos para ayudarte.',perfil:'Cuida bien de tu nuevo amigo.'};
 for(const [ruta,frase] of Object.entries(frases)){
  await navegar(ruta);
  const pie=await screen.findByRole('contentinfo',{name:'Pie de página PEH'});
  expect(document.querySelectorAll('.peh-pie-global')).toHaveLength(1);
  expect(document.querySelectorAll('footer.pie-pagina')).toHaveLength(0);
  expect(pie.querySelector('.peh-pie-frase').textContent).toBe(frase);
  expect(within(pie).getByText('© 2026 PEH')).toBeTruthy();
  expect(within(pie).getAllByRole('link')).toHaveLength(4);
 }
 for(const [nombre,ruta] of [['Inicio','inicio'],['Comunidad','comunidad'],['Veterinaria','veterinaria'],['Ayuda','contacto']]){
  await user.click(within(screen.getByRole('contentinfo',{name:'Pie de página PEH'})).getByRole('link',{name:nombre,exact:true}));
  await waitFor(()=>expect(window.location.hash).toBe('#'+ruta));
  await waitFor(()=>expect(document.querySelector('.peh-pie-frase').textContent).toBe(frases[ruta]));
 }
 expect(fetch).not.toHaveBeenCalled();
});

it.each([['veterinaria','Reservar hora'],['contacto','Registrar consulta']])('las acciones de %s presentan Cancelar antes de Enviar en el DOM',async(ruta,accion)=>{
 await preparar(ruta);render(createElement(App));
 const principal=await screen.findByRole('button',{name:new RegExp(accion)});
 const grupo=principal.closest('.acciones-formulario-pagina');expect(grupo).toBeTruthy();
 const botones=within(grupo).getAllByRole('button');expect(botones).toHaveLength(2);
 expect(botones[0].textContent).toBe('Cancelar proceso');expect(botones[0].type).toBe('button');
 expect(botones[1]).toBe(principal);expect(principal.type).toBe('submit');
});
});

describe('Restauración del desplazamiento',()=>{
let y,alto,observadores;
const clave=(cuenta,ruta)=>`peh:scroll:${encodeURIComponent(cuenta)}:${encodeURIComponent(ruta)}`;
beforeEach(()=>{
 sessionStorage.clear();y=0;alto=3000;observadores=[];
 Object.defineProperty(window,'scrollY',{configurable:true,get:()=>y});Object.defineProperty(window,'innerHeight',{configurable:true,value:600});
 Object.defineProperty(document.documentElement,'scrollHeight',{configurable:true,get:()=>alto});Object.defineProperty(document.body,'scrollHeight',{configurable:true,get:()=>alto});
 window.scrollTo=vi.fn(opts=>{y=Math.min(opts.top,Math.max(0,alto-600));});
 vi.stubGlobal('MutationObserver',class{constructor(cb){this.cb=cb;this.activo=true;observadores.push(this);}observe(){}disconnect(){this.activo=false;}});
 HTMLElement.prototype.scrollIntoView=vi.fn();
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});

it('recuerda posiciones independientes por vista y por cuenta',async()=>{
 const {rerender}=renderHook(({ruta,cuenta})=>useMemoriaNavegacion(ruta,cuenta),{initialProps:{ruta:'inicio',cuenta:'A'}});
 act(()=>{y=800;window.dispatchEvent(new Event('scroll'));});
 // Simula que el DOM de destino limita scrollY durante el cambio de vista.
 y=40;rerender({ruta:'contacto',cuenta:'A'});expect(y).toBe(0);
 act(()=>{y=250;window.dispatchEvent(new Event('scroll'));});rerender({ruta:'inicio',cuenta:'A'});await waitFor(()=>expect(y).toBe(800));
 rerender({ruta:'inicio',cuenta:'B'});expect(y).toBe(0);rerender({ruta:'contacto',cuenta:'A'});await waitFor(()=>expect(y).toBe(250));
});

it('espera a que el contenido asíncrono tenga altura suficiente antes de terminar de restaurar',async()=>{
 alto=700;sessionStorage.setItem(clave('A','inicio'),'1200');renderHook(()=>useMemoriaNavegacion('inicio','A'));
 await waitFor(()=>expect(y).toBe(100));
 act(()=>{alto=2400;for(const o of observadores)if(o.activo)o.cb();});await waitFor(()=>expect(y).toBe(1200));
});

it('una interacción del usuario cancela una restauración aún pendiente',async()=>{
 alto=700;sessionStorage.setItem(clave('A','inicio'),'1200');renderHook(()=>useMemoriaNavegacion('inicio','A'));
 await waitFor(()=>expect(y).toBe(100));
 act(()=>{window.dispatchEvent(new Event('wheel'));y=50;window.dispatchEvent(new Event('scroll'));alto=2400;for(const o of observadores)if(o.activo)o.cb();});
 expect(y).toBe(50);expect(sessionStorage.getItem(clave('A','inicio'))).toBe('50');
});

it.each(['veterinaria/reservar','perfil/consultas','comunidad/todas/publicacion-1'])('respeta el destino explícito de %s',ruta=>{
 sessionStorage.setItem(clave('A',ruta),'900');renderHook(()=>useMemoriaNavegacion(ruta,'A'));expect(window.scrollTo).not.toHaveBeenCalled();
});

it('Animales mantiene su ancla inicial y al volver restaura la posición recordada',async()=>{
 const ancla=document.createElement('section');ancla.id='animales';document.body.append(ancla);
 const {rerender}=renderHook(({ruta})=>useMemoriaNavegacion(ruta,'A'),{initialProps:{ruta:'animales'}});
 await waitFor(()=>expect(ancla.scrollIntoView).toHaveBeenCalledWith({behavior:'instant'}));
 act(()=>{y=1100;window.dispatchEvent(new Event('scroll'));});rerender({ruta:'contacto'});ancla.scrollIntoView.mockClear();rerender({ruta:'animales'});
 await waitFor(()=>expect(y).toBe(1100));expect(ancla.scrollIntoView).not.toHaveBeenCalled();ancla.remove();
});
});

describe('Persistencia y reglas por cuenta',()=>{
let PEH, enviarSolicitud, registrarReserva, animales;
let memoria, descriptorOriginal;
const cuentaA = { id: 'TEST-A', nombre: 'Ana', apellido: 'Prueba', usuario: 'ana_test', correo: 'ana.test@gmail.com' };
const cuentaB = { id: 'TEST-B', nombre: 'Bruno', apellido: 'Prueba', usuario: 'bruno_test', correo: 'bruno.test@gmail.com' };
const ahora = new Date(2035, 0, 10, 9, 0);
const datosReserva = () => ({ responsableNombre:'Ana Prueba', responsableCorreo:'ana.test@gmail.com', responsableTelefono:'912345678', responsableComuna:'Macul', servicio: 'consulta', mascota: 'perro', mascotaNombre: 'Firulais', fecha: '2035-01-11', hora: '10:30', observaciones: 'Control general de mi mascota.' });
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

it('separa solicitudes y reservas entre las dos cuentas y el invitado', () => {
    const animal = PEH.catalogo.listar()[0];
    const adopcionA = enviarSolicitud(animal, datosAdopcion()).solicitud;
    const reservaA = registrarReserva(datosReserva(), ahora).reserva;
    expect(adopcionA).toBeDefined(); expect(reservaA).toBeDefined();
    entrar(cuentaB);
    expect(PEH.adopciones.listar()).toEqual([]);
    expect(PEH.reservas.listar()).toEqual([]);
    const adopcionB = enviarSolicitud(animal, datosAdopcion()).solicitud;
    const reservaB = registrarReserva({ ...datosReserva(), mascotaNombre: 'Luna' }, ahora).reserva;
    expect(adopcionB).toBeDefined(); expect(reservaB).toBeDefined();
    expect(PEH.adopciones.listar().map(s => s.id)).toEqual([adopcionB.id]);
    expect(PEH.reservas.listar().map(r => r.id)).toEqual([reservaB.id]);
    expect(PEH.adopciones.listar(cuentaA.id)).toEqual([]);
    expect(PEH.reservas.listar(cuentaA.id)).toEqual([]);
    volverAEntrar(cuentaA);
    expect(PEH.adopciones.listar().map(s => s.id)).toEqual([adopcionA.id]);
    expect(PEH.reservas.listar().map(r => r.id)).toEqual([reservaA.id]);
    entrar({ id: 'TEST-INVITADO', invitado: true });
    expect(PEH.adopciones.listar()).toEqual([]);
    expect(PEH.reservas.listar()).toEqual([]);
  });

it('Impide completar formularios como invitado', async () => {
    const { createElement } = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { default: App } = await import('../src/App.jsx');
    const ubicacionAnterior = Object.getOwnPropertyDescriptor(window, 'location');
    const ubicacion = { hash: '#inicio', href: 'https://peh.test/#inicio' };
    Object.defineProperty(window, 'location', { configurable: true, value: ubicacion });
    entrar({id:'TEST-INVITADO',invitado:true});
    try {
      // Verifica el bloqueo global que decide qué vistas puede montar el invitado.
      // No necesita jsdom: React genera el HTML, sin simular clics del navegador.
      for (const ruta of ['perfil', 'perfil/consultas', 'comunidad', 'comunidad/perdidos', 'veterinaria', 'veterinaria/reservar', 'contacto', 'desarrollador']) {
        ubicacion.hash = '#' + ruta;
        const html = renderToStaticMarkup(createElement(App));
        expect(html).toContain('Debes iniciar sesión');
        expect(html).toContain('Iniciar sesión');
        expect(html).not.toContain('<form');
      }
      // El perfil del animal sigue disponible, pero tampoco monta su formulario.
      ubicacion.hash = '#animal/' + encodeURIComponent(PEH.catalogo.listar()[0].slug);
      const perfilAnimal = renderToStaticMarkup(createElement(App));
      expect(perfilAnimal).not.toContain('formularioAdopcion');
      expect(perfilAnimal).not.toContain('<form');
      expect(enviarSolicitud(PEH.catalogo.listar()[0],datosAdopcion()).ok).toBe(false);
      expect(registrarReserva(datosReserva(),ahora).ok).toBe(false);
    } finally {
      if (ubicacionAnterior) Object.defineProperty(window, 'location', ubicacionAnterior);
      else delete window.location;
    }
  });
});

describe('Validación y borradores',()=>{
let errorTelefono, errorComuna, edadDesdeFecha, mensajeDeCampo;
const campo = cambios => ({tagName:'INPUT',type:'text',name:'campo',value:'',required:false,disabled:false,minLength:-1,maxLength:-1,min:'',max:'',step:'',pattern:'',matches:()=>false,closest:()=>null,...cambios});
let B,PEH,memoria;
beforeAll(async()=>{vi.stubGlobal("crypto",webcrypto);
  memoria=new Map();const almacenamiento={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
  const ventana=new EventTarget();ventana.localStorage=almacenamiento;ventana.crypto=globalThis.crypto;
  vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',almacenamiento);
  B=await import("./../src/services/global.js");({errorTelefono,errorComuna,edadDesdeFecha,mensajeDeCampo}=B);PEH=(await import("./../src/services/login.js")).default;
 });
afterAll(()=>vi.unstubAllGlobals());
beforeEach(()=>{memoria.clear();localStorage.setItem(PEH.CLAVES.cuentas,JSON.stringify([{id:'A',nombre:'Ana',correo:'a@duocuc.cl'},{id:'B',nombre:'Bruno',correo:'b@profesor.duocuc.cl'}]));PEH.sesion.iniciar({id:'A'});});

it('valida teléfono y comuna',()=>{expect(errorTelefono('+56 9 1234 5678')).toBe('');expect(errorTelefono('123')).toBeTruthy();expect(errorComuna('Viña del Mar')).toBe('');expect(errorComuna('123')).toBeTruthy();});

it('explica un campo obligatorio vacío',()=>{expect(mensajeDeCampo(campo({required:true}),{elements:[]})).toBe('Completa este campo.');});

it('explica un desplegable sin selección',()=>{expect(mensajeDeCampo(campo({tagName:'SELECT',required:true}),{elements:[]})).toBe('Selecciona una opción.');});

it('explica un grupo de radio sin respuesta',()=>{const c=campo({type:'radio',name:'convivencia',required:true});expect(mensajeDeCampo(c,{elements:[c]})).toBeTruthy();const respondido={...c,checked:true};expect(mensajeDeCampo(respondido,{elements:[respondido]})).toBe('');});

it('no exige campos deshabilitados u ocultos',()=>{expect(mensajeDeCampo(campo({required:true,disabled:true}),{elements:[]})).toBe('');expect(mensajeDeCampo(campo({required:true,closest:()=>({hidden:true})}),{elements:[]})).toBe('');});

it('valida descripciones y límites numéricos',()=>{expect(mensajeDeCampo(campo({value:'corto',minLength:10}),{elements:[]})).toContain('10');expect(mensajeDeCampo(campo({type:'number',value:'11',max:'10'}),{elements:[]})).toContain('10');});

it('explica que las contraseñas no coinciden',()=>{const c=campo({type:'password',name:'confirmar',value:'Otra123!'});expect(mensajeDeCampo(c,{elements:[c,campo({name:'nueva',value:'Prueba123!'})]})).toContain('no coinciden');});

it('excluye contraseñas y hashes incluso anidados',()=>{const c=B.limpiarBorrador({correo:'a@duocuc.cl',contrasena:'secreto',seguridad:{actual:'x',nueva:'y',claveDerivada:'z',sal:'s'},comuna:'Macul'});expect(c).toEqual({correo:'a@duocuc.cl',seguridad:{},comuna:'Macul'});});

it('separa borradores por cuenta, formulario y animal',()=>{const a=B.claveBorrador('adopcion:milo');expect(B.guardarBorrador(a,{texto:'Solicitud A'})).toBe(true);PEH.sesion.iniciar({id:'B'});expect(B.leerBorrador(B.claveBorrador('adopcion:milo'))).toBeUndefined();PEH.sesion.iniciar({id:'A'});expect(B.leerBorrador(B.claveBorrador('adopcion:nala'))).toBeUndefined();expect(B.leerBorrador(a).texto).toBe('Solicitud A');});

it('cancelar elimina solo el borrador elegido',()=>{const a=B.claveBorrador('contacto'),b=B.claveBorrador('adopcion:milo');B.guardarBorrador(a,{mensaje:'A'});B.guardarBorrador(b,{mensaje:'B'});expect(B.borrarBorrador(a)).toBe(true);expect(B.leerBorrador(a)).toBeUndefined();expect(B.leerBorrador(b).mensaje).toBe('B');});

it('valida fechas reales y cumpleaños',()=>{expect(edadDesdeFecha('2000-10-25',new Date(2026,9,24))).toBe(25);expect(edadDesdeFecha('2000-02-30')).toBe(-1);expect(edadDesdeFecha('2999-01-01')).toBe(-1);});
});

describe('Validaciones y recuperación del proceso',()=>{

beforeEach(()=>{localStorage.clear();sessionStorage.clear();Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});window.history.replaceState(null,'','/#inicio');window.scrollTo=vi.fn();window.alert=vi.fn();window.confirm=vi.fn(()=>true);HTMLElement.prototype.scrollIntoView=vi.fn();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});

it('aplica la misma regla de correo en todos los formularios',()=>{
 for(const correo of ['a@duocuc.cl','a@profesor.duocuc.cl','a@empresa.com'])expect(correoValido(correo),correo).toBe(true);for(const correo of ['a@@duocuc.cl','a@x..cl','a@-x.cl','a@x.org',''])expect(correoValido(correo),correo).toBe(false);
});

});

// Estas comprobaciones necesitan Chromium real. npm test las identifica como omitidas;
// npm run test:navegador las ejecuta sin confundir jsdom con un navegador.
describe.runIf(process.env.PEH_NAVEGADOR==='1')('Navegador real: familias de interacción',()=>{
 let servidor,navegador,contexto,pagina,base;
 beforeAll(async()=>{
  const {createServer}=await import('vite');
  const {fileURLToPath}=await import('node:url');
  const {createRequire}=await import('node:module');
  const {chromium}=createRequire(import.meta.url)('playwright');
  servidor=await createServer({root:fileURLToPath(new NodeURL('..',import.meta.url)),server:{host:'127.0.0.1',port:0},logLevel:'silent'});
  await servidor.listen();base='http://127.0.0.1:'+servidor.httpServer.address().port;
  try{navegador=await chromium.launch({headless:true,...(process.env.PEH_CHROMIUM_PATH?{executablePath:process.env.PEH_CHROMIUM_PATH}:{})});}
  catch(error){await servidor.close();servidor=null;throw error;}
 },30000);
 beforeEach(async()=>{
  contexto=await navegador.newContext({viewport:{width:1440,height:1100}});pagina=await contexto.newPage();await pagina.goto(base);
  await pagina.evaluate(async({modulo,datos})=>{const acceso=await import(/* @vite-ignore */modulo);await acceso.registrarCuenta(datos);await acceso.iniciarSesion(datos.correo,datos.contrasena);},{modulo:'/src/services/login.js',datos:{nombre:'Ana',apellido:'Prueba',usuario:'ana_browser',correo:'ana.browser@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'}});
  await pagina.waitForSelector('header.cabecera-distribuida');
 });
 afterEach(async()=>{await contexto?.close();});
 afterAll(async()=>{await navegador?.close();await servidor?.close();});
 async function ir(ruta){await pagina.evaluate(r=>{location.hash=r;},ruta);await pagina.waitForSelector('body.pagina-'+ruta);await pagina.mouse.move(0,0);}
 async function estilo(selector){return pagina.locator(selector).first().evaluate(el=>{const s=getComputedStyle(el);return{transform:s.transform,filter:s.filter,fondo:s.backgroundColor,peso:Number(s.fontWeight),subrayado:s.textDecorationLine,cursor:s.cursor};});}
 async function esperarTransformacion(selector){await pagina.waitForFunction(sel=>getComputedStyle(document.querySelector(sel)).transform!=='none',selector);}
 it('botones con fondo se levantan y oscurecen; cancelar queda plano y los enlaces se subrayan',async()=>{
  await ir('veterinaria');
  const boton='a[href="#reservar"].peh-boton-fondo',cancelar='.acciones-formulario-pagina .boton-cancelar-proceso',enlace='.enlace-reservas-perfil';
  await pagina.locator(boton).hover();await esperarTransformacion(boton);const activo=await estilo(boton);expect(Number(activo.filter.match(/brightness\(([^)]+)/)?.[1])).toBeLessThan(1);expect(Number(activo.transform.match(/matrix\([^)]+\)/)[0].slice(7,-1).split(',').at(-1))).toBeLessThan(0);
  await pagina.locator(cancelar).hover();const plano=await estilo(cancelar);expect(plano.transform).toBe('none');expect(plano.filter).toBe('none');
  await pagina.mouse.move(0,0);const normal=await estilo(enlace);await pagina.locator(enlace).hover();const hover=await estilo(enlace);expect(hover.subrayado).toContain('underline');expect(hover.peso).toBeGreaterThan(normal.peso);expect(hover.cursor).toBe('pointer');
 },15000);
 it('las tarjetas de Contacto se levantan y oscurecen sin anular las acciones interiores',async()=>{
  await ir('contacto');
  for(const selector of ['.tarjeta-ayuda-contacto','#preguntasFrecuentes']){await pagina.mouse.move(0,0);const normal=await estilo(selector);await pagina.locator(selector).hover({position:{x:12,y:12}});await esperarTransformacion(selector);const hover=await estilo(selector);expect(hover.fondo).not.toBe(normal.fondo);expect(Number(hover.transform.match(/matrix\([^)]+\)/)[0].slice(7,-1).split(',').at(-1))).toBeLessThan(0);}
  await pagina.locator('.acceso-ayuda').first().hover();await esperarTransformacion('.acceso-ayuda');expect((await estilo('.tarjeta-ayuda-contacto')).transform).not.toBe('none');
  await pagina.locator('#preguntasFrecuentes .pregunta-boton').first().click();expect(await pagina.locator('#preguntasFrecuentes .pregunta-boton').first().getAttribute('aria-expanded')).toBe('true');
 },15000);
 it('los selectores conservan el foco y no se levantan, y la vista estrecha permite navegar',async()=>{
  await ir('contacto');const selector='#motivoContacto';await pagina.locator(selector).hover();expect((await estilo(selector)).transform).toBe('none');expect((await estilo(selector)).cursor).toBe('pointer');
  await pagina.locator('#correoContacto').focus();await pagina.keyboard.press('Tab');expect(await pagina.locator(selector).evaluate(el=>el===document.activeElement)).toBe(true);expect(await pagina.locator(selector).evaluate(el=>parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThan(0);
  await pagina.setViewportSize({width:390,height:844});await pagina.locator('#botonMenu').click();expect(await pagina.locator('#botonMenu').getAttribute('aria-expanded')).toBe('true');await pagina.keyboard.press('Escape');expect(await pagina.locator('#botonMenu').getAttribute('aria-expanded')).toBe('false');expect(await pagina.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 },15000);
});

describe('Almacenamiento no disponible',()=>{
 afterEach(()=>vi.restoreAllMocks());
 it('informa que no guardó el borrador y conserva la versión anterior',()=>{
  localStorage.clear();const cuenta={id:'DRAFT',nombre:'Ana',correo:'ana@peh.cl'};localStorage.setItem(PEH.CLAVES.cuentas,JSON.stringify([cuenta]));PEH.sesion.iniciar(cuenta);const clave=claveBorrador('contacto');expect(guardarBorrador(clave,{mensaje:'Versión anterior'})).toBe(true);
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('Sin espacio');});expect(guardarBorrador(clave,{mensaje:'Cambio sin guardar'})).toBe(false);expect(leerBorrador(clave)).toEqual({mensaje:'Versión anterior'});
 });
});
