import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { createElement } from 'react';
import { act, cleanup, render, renderHook, screen, within, waitFor } from '@testing-library/react';
import { useNuevaPublicacion } from '../src/hooks/comunidad.js';
import PEH, { claveBorrador } from '../src/services/global.js';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import { registrarCuenta, iniciarSesion } from '../src/services/login.js';
import { crearPublicacion, listarComentarios, coincidePublicacion } from '../src/services/comunidad.js';
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

it('cancelar una publicación impide que una imagen pendiente vuelva a poblar el borrador',()=>{
 cuenta();let lector;vi.stubGlobal('FileReader',class{constructor(){lector=this;}readAsDataURL(){}});
 const {result}=renderHook(()=>useNuevaPublicacion({publicarServicio:vi.fn(),mostrarMensaje:vi.fn(),onPublicada:vi.fn()}));
 act(()=>result.current.setContenido('Una publicación pendiente'));
 act(()=>result.current.cargar({target:{files:[new File(['foto'],'foto.png',{type:'image/png'})]}}));
 act(()=>result.current.cancelarPublicacion());
 act(()=>{lector.result='data:image/png;base64,Zm90bw==';lector.onload();});
 expect(result.current.contenido).toBe('');expect(result.current.imagen).toBeNull();expect(localStorage.getItem(claveBorrador('publicacion:imagen'))).toBeNull();
});
});

describe('Operaciones, persistencia y permisos',()=>{
let PEH, auth, M, memoria;
const cred={nombre:'Ana',apellido:'Prueba',usuario:'ana_test',correo:'ana@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};

const publicar=()=>M.crearPublicacion({contenido:'Contenido de prueba suficientemente largo.',categoria:'consejos',ubicacion:'Macul',imagen:null});
const entrar=()=>auth.iniciarSesion(cred.correo,cred.contrasena);
beforeAll(async()=>{vi.stubGlobal("crypto",webcrypto);
 memoria=new Map();const storage={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
 const ventana=new EventTarget();ventana.crypto=crypto;ventana.alert=vi.fn();
 vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',storage);
 vi.stubGlobal('fetch',vi.fn(()=>{throw new Error('No se permite HTTP en el modo local.');}));
 auth=await import("./../src/services/login.js");PEH=auth.default;
 M=await import("./../src/services/comunidad.js");
});
beforeEach(async()=>{memoria.clear();fetch.mockClear();await auth.registrarCuenta(cred);await entrar();});
afterAll(()=>vi.unstubAllGlobals());

it('publica, edita y conserva imágenes locales sin subirlas a un servidor',async()=>{
 const p=await M.crearPublicacion({contenido:'Publicación con una fotografía de prueba.',categoria:'consejos',ubicacion:'Macul',imagen:'data:image/png;base64,aG9sYQ=='});
 const editada=await M.editarPublicacion(p.id,{...p,contenido:'Contenido de publicación editado correctamente.'});expect(editada.imagen).toBe(p.imagen);await auth.cerrarSesionLocal();await entrar();expect((await M.listarPublicaciones())[0].contenido).toBe(editada.contenido);expect(fetch).not.toHaveBeenCalled();
});

it('eliminar una publicación borra también sus comentarios y respuestas',async()=>{
 const p=await publicar(),c=await M.comentar(p.id,'Comentario inicial.');await M.comentar(p.id,'Respuesta al comentario.',c.id);await M.eliminarPublicacion(p.id);expect(PEH.comentarios.listar(p.id)).toEqual([]);expect(await M.listarPublicaciones()).toEqual([]);
});

it('separa identidad y compartidos y elimina respuestas ajenas al borrar un comentario propio',async()=>{
 const p=await publicar(),c=await M.comentar(p.id,'Comentario de Ana.');await M.marcarCompartido(p.id);const ana=PEH.sesion.obtener().id;
 await auth.registrarCuenta({...cred,nombre:'Bruno',usuario:'bruno_test',correo:'bruno@peh.cl'});await auth.iniciarSesion('bruno@peh.cl',cred.contrasena);expect(await M.listarCompartidos()).toEqual([]);
 await expect(M.editarPublicacion(p.id,{...p,contenido:'No debería editar una publicación ajena.'})).rejects.toMatchObject({estado:403});await M.comentar(p.id,'Respuesta de Bruno.',c.id);
 await entrar();await M.eliminarComentario(c.id);const comentarios=await M.listarComentarios(p.id);expect(comentarios).toEqual([]);expect(await M.listarCompartidos()).toEqual([p.id]);expect(PEH.sesion.obtener().id).toBe(ana);
});

it('un fallo de almacenamiento no confirma una publicación que no se guardó',async()=>{
 const original=localStorage.setItem;localStorage.setItem=()=>{throw new Error('Sin espacio');};try{await expect(publicar()).rejects.toThrow('No pudimos guardar');}finally{localStorage.setItem=original;}expect(await M.listarPublicaciones()).toEqual([]);
});

it('edita comentarios propios, valida el texto y rechaza la edición de otra cuenta',async()=>{
 const p=await publicar(),c=await M.comentar(p.id,'Comentario inicial.');
 await M.editarComentario(c.id,'Comentario corregido.');
 expect((await M.listarComentarios(p.id))[0]).toMatchObject({texto:'Comentario corregido.',id:c.id});
 await expect(M.editarComentario(c.id,'   ')).rejects.toThrow();
 await auth.registrarCuenta({...cred,usuario:'otra_test',correo:'otra@peh.cl'});await auth.iniciarSesion('otra@peh.cl',cred.contrasena);
 await expect(M.editarComentario(c.id,'Texto ajeno.')).rejects.toMatchObject({estado:403});
});

it('elimina respuestas encadenadas sin borrar comentarios de otra rama',async()=>{
 const p=await publicar(),c=await M.comentar(p.id,'Raíz.'),h=await M.comentar(p.id,'Respuesta.',c.id);
 await M.comentar(p.id,'Respuesta anidada.',h.id);const otra=await M.comentar(p.id,'Otra rama.');
 await M.eliminarComentario(c.id);expect((await M.listarComentarios(p.id)).map(c=>c.id)).toEqual([otra.id]);
});

it('los ejemplos agregan dos publicaciones en tres categorías sin reemplazar las existentes ni duplicarse',async()=>{
 const propia=await publicar();
 M.inicializarPublicacionesEjemplo();
 M.inicializarPublicacionesEjemplo();
 const lista=await M.listarPublicaciones(),ejemplos=lista.filter(p=>p.demo);
 expect(lista.find(p=>p.id===propia.id)).toMatchObject({contenido:propia.contenido,usuarioId:propia.usuarioId});
 expect(ejemplos).toHaveLength(6);
 expect(Object.fromEntries(['adopcion','consejos','preguntas'].map(c=>[c,ejemplos.filter(p=>p.categoria===c).length]))).toEqual({adopcion:2,consejos:2,preguntas:2});
 expect(new Set(lista.map(p=>p.id)).size).toBe(7);
 const ejemplo=ejemplos[0];
 await expect(M.detallePublicacion(ejemplo.id)).resolves.toMatchObject({id:ejemplo.id});
 const comentario=await M.comentar(ejemplo.id,'Comentario en una publicación de ejemplo.');
 expect(await M.listarComentarios(ejemplo.id)).toEqual([expect.objectContaining({id:comentario.id})]);
});

it('los ejemplos eliminados no reaparecen y los datos dañados no se sobrescriben',()=>{
 M.inicializarPublicacionesEjemplo();
 const clave=PEH.CLAVES.publicaciones,guardadas=JSON.parse(localStorage.getItem(clave));
 const eliminada=guardadas.pop();
 localStorage.setItem(clave,JSON.stringify(guardadas));
 M.inicializarPublicacionesEjemplo();
 expect(JSON.parse(localStorage.getItem(clave)).some(p=>p.id===eliminada.id)).toBe(false);
 localStorage.removeItem('peh_publicaciones_ejemplo_ci_v1');
 localStorage.setItem(clave,'datos dañados');
 expect(()=>M.inicializarPublicacionesEjemplo()).toThrow();
 expect(localStorage.getItem(clave)).toBe('datos dañados');
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

it('el textarea vigente admite escritura y envío, y conserva comentarios al volver',async()=>{
 const user=await preparar('comunidad');const p=await crearPublicacion({contenido:'Publicación local para comprobar el cuadro de comentarios.',categoria:'consejos',ubicacion:'Macul',imagen:null});render(createElement(App));
 await user.click(await within(await screen.findByText('Publicación local para comprobar el cuadro de comentarios.', {}, {timeout:5000}).then(texto=>texto.closest('article'))).findByRole('button',{name:'Comentar',exact:true}));const textarea=screen.getByRole('textbox',{name:'Comentario',exact:true});expect(textarea.tagName).toBe('TEXTAREA');expect(textarea.closest('form').classList.contains('formulario-comentario-api')).toBe(true);expect(textarea.rows).toBe(3);
 await user.type(textarea,'Este comentario se ve y se guarda.');expect(textarea.value).toBe('Este comentario se ve y se guarda.');await user.click(screen.getByRole('button',{name:'Enviar comentario'}));expect(await screen.findByText('Este comentario se ve y se guarda.')).toBeTruthy();expect(await listarComentarios(p.id)).toHaveLength(1);
 await navegar('inicio');await navegar('comunidad');await user.click(await within(await screen.findByText('Publicación local para comprobar el cuadro de comentarios.', {}, {timeout:5000}).then(texto=>texto.closest('article'))).findByRole('button',{name:'Comentar',exact:true}));expect(await screen.findByText('Este comentario se ve y se guarda.')).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
}, 15000);
});

describe('Persistencia y reglas por cuenta',()=>{
let PEH, animales;
let memoria, descriptorOriginal;
const cuentaA = { id: 'TEST-A', nombre: 'Ana', apellido: 'Prueba', usuario: 'ana_test', correo: 'ana.test@gmail.com' };
const cuentaB = { id: 'TEST-B', nombre: 'Bruno', apellido: 'Prueba', usuario: 'bruno_test', correo: 'bruno.test@gmail.com' };

function entrar(cuenta) { expect(PEH.sesion.iniciar(cuenta)).toBe(true); }
function volverAEntrar(cuenta) {
    // Cerrar la sesión y reconstruir el almacenamiento a partir de sus cadenas:
    // obliga a releer JSON; no basta con devolver un objeto en memoria del servicio.
    expect(PEH.sesion.cerrar()).toBe(true);
    memoria = new Map(JSON.parse(JSON.stringify([...memoria])));
    entrar(cuenta);
  }
function publicar() {
    const p = PEH.publicaciones.agregar({ texto: 'Encontramos un perro en Macul.', categoria: 'encontrados', comuna: 'Macul' });
    expect(p).not.toBeNull();
    return p;
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

it('conserva comentarios y permite leerlos desde otra cuenta', () => {
    const p = publicar();
    const comentario = PEH.comentarios.agregar(p.id, 'Puedo ayudar a encontrar a su familia.');
    expect(comentario).not.toBeNull();
    volverAEntrar(cuentaB);
    expect(PEH.comentarios.listar(p.id)).toEqual([expect.objectContaining({ id: comentario.id, usuarioId: cuentaA.id, texto: 'Puedo ayudar a encontrar a su familia.' })]);
    expect(PEH.comentarios.listar('publicacion-inexistente')).toEqual([]);
  });

it('conserva publicaciones y permite leerlas desde otra cuenta', () => {
    const p = publicar();
    volverAEntrar(cuentaB);
    expect(PEH.publicaciones.listar()).toEqual([expect.objectContaining({ id: p.id, usuarioId: cuentaA.id, texto: p.texto })]);
  });

it('elimina la publicación propia del almacenamiento sin borrar las demás', () => {
    const propia = publicar();
    entrar(cuentaB); const ajena = publicar(); entrar(cuentaA);
    expect(PEH.publicaciones.eliminar(propia.id)).toBe(true);
    volverAEntrar(cuentaA);
    expect(PEH.publicaciones.listar().map(p => p.id)).toEqual([ajena.id]);
    expect(JSON.parse(localStorage.getItem(PEH.CLAVES.publicaciones)).map(p => p.id)).toEqual([ajena.id]);
  });

it('conserva Compartido solamente para la cuenta que compartió', () => {
    const p = publicar();
    expect(PEH.compartidos.marcar(p.id, cuentaA.id)).toBe(true);
    volverAEntrar(cuentaA); expect(PEH.compartidos.contiene(p.id)).toBe(true);
    volverAEntrar(cuentaB); expect(PEH.compartidos.contiene(p.id)).toBe(false);
    expect(PEH.compartidos.marcar(p.id, cuentaA.id)).toBe(false);
    volverAEntrar(cuentaA); expect(PEH.compartidos.contiene(p.id)).toBe(true);
  });

it('impide eliminar la publicación de otra cuenta y conserva sus datos', () => {
    const p = publicar();
    const antes = localStorage.getItem(PEH.CLAVES.publicaciones);
    entrar(cuentaB);
    expect(PEH.publicaciones.eliminar(p.id)).toBe(false);
    expect(localStorage.getItem(PEH.CLAVES.publicaciones)).toBe(antes);
    volverAEntrar(cuentaA);
    expect(PEH.publicaciones.listar().map(p => p.id)).toEqual([p.id]);
  });
});

describe('Validaciones y recuperación del proceso',()=>{

const credExtra={nombre:'Ana',apellido:'Prueba',usuario:'ana_extra',correo:'ana.extra@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};
async function entrarExtra(){await registrarCuenta(credExtra);await iniciarSesion(credExtra.correo,credExtra.contrasena);}
beforeEach(()=>{localStorage.clear();sessionStorage.clear();Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});window.history.replaceState(null,'','/#inicio');window.scrollTo=vi.fn();window.alert=vi.fn();window.confirm=vi.fn(()=>true);HTMLElement.prototype.scrollIntoView=vi.fn();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});

it('permite crear, editar y eliminar una publicación propia desde la interfaz',async()=>{
 await entrarExtra();window.history.replaceState(null,'','/#comunidad');const user=userEvent.setup();render(createElement(App));await waitFor(()=>expect(document.getElementById('contenidoPublicacion')).toBeTruthy());
 await user.type(document.getElementById('contenidoPublicacion'),'Publicación propia creada desde el formulario.');await user.selectOptions(document.getElementById('categoriaPublicacion'),'consejos');await user.click(within(document.getElementById('crearPublicacion')).getByRole('button',{name:/Publicar/}));
 const articulo=(await screen.findByText('Publicación propia creada desde el formulario.')).closest('article');await user.click(within(articulo).getByRole('button',{name:'Editar',exact:true}));const campo=within(articulo).getByRole('textbox',{name:'Editar contenido'});await user.clear(campo);await user.type(campo,'Publicación propia editada desde el formulario.');await user.click(within(articulo).getByRole('button',{name:'Guardar cambios'}));await screen.findByText('Publicación propia editada desde el formulario.');await user.click(within(articulo).getByRole('button',{name:'Eliminar publicación',exact:true}));await waitFor(()=>expect(screen.queryByText('Publicación propia editada desde el formulario.')).toBeNull());expect(PEH.publicaciones.listar().filter(p=>!p.demo)).toHaveLength(0);
});
it('búsqueda y categoría encuentran contenido con diferencias de mayúsculas y acentos',()=>{
 const publicacion={contenido:'Adopción responsable de un gatito',categoria:'adopcion',ubicacion:'Ñuñoa'};expect(coincidePublicacion(publicacion,'adopcion','ADOPCION')).toBe(true);expect(coincidePublicacion(publicacion,'todas','nunoa')).toBe(true);expect(coincidePublicacion(publicacion,'consejos','gatito')).toBe(false);expect(coincidePublicacion(publicacion,'todas','inexistente')).toBe(false);
});

});
