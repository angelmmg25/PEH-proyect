import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { createElement } from 'react';
import { render, screen, within, cleanup, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import PEH from '../src/services/global.js';
import { registrarCuenta, iniciarSesion } from '../src/services/login.js';
import { enviarSolicitudLocal } from '../src/services/animal.js';
import { registrarReserva } from '../src/services/veterinaria.js';
import { registrarConsulta } from '../src/services/contacto.js';
import { crearPublicacion, comentar } from '../src/services/comunidad.js';
import { listarAdmin, guardarAnimalAdmin } from '../src/services/administracion.js';
// @vitest-environment jsdom

describe('Panel y navegación administrativa',()=>{
const cred={nombre:'Ana',apellido:'Prueba',usuario:'ana_admin_vista',correo:'ana.admin.vista@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};
beforeAll(()=>{
 Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});
 Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});
 HTMLElement.prototype.scrollIntoView=vi.fn();
 HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
});
beforeEach(()=>{
 localStorage.clear();sessionStorage.clear();window.history.replaceState(null,'','/#desarrollador');window.scrollTo=vi.fn();window.confirm=vi.fn(()=>true);
 vi.stubGlobal('fetch',vi.fn(()=>Promise.reject(new Error('HTTP prohibido'))));
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
async function admin(){await registrarCuenta(cred);return iniciarSesion('adminp@gmail.com','Admin1234!');}
async function navegar(ruta){await act(async()=>{window.location.hash='#'+ruta;});}
async function sembrar(){
 await registrarCuenta(cred);await iniciarSesion(cred.correo,cred.contrasena);
 const animal=PEH.catalogo.listar().find(a=>a.slug==='milo');
 await enviarSolicitudLocal(animal,{nombreAdoptante:'Ana Prueba',edadAdoptante:'26',correoAdoptante:cred.correo,telefonoAdoptante:cred.telefono,comunaAdoptante:'Macul',tipoVivienda:'casa',situacionVivienda:'propia',viveConPersonas:'no',otrosAnimales:'no',experienciaAnimales:'si',motivoAdopcion:'Quiero darle un hogar estable y responsable.',cuidadosAnimal:'Tendrá paseos y controles veterinarios.',aceptaCompromiso:true});
 expect(registrarReserva({responsableNombre:'Ana Prueba',responsableCorreo:cred.correo,responsableTelefono:cred.telefono,responsableComuna:'Macul',servicio:'consulta',mascota:'perro',mascotaNombre:'Michi',fecha:'2035-01-10',hora:'09:00',observaciones:'Control general de mi mascota.'}).ok).toBe(true);
 expect(registrarConsulta({nombre:'Ana Prueba',correo:cred.correo,motivo:'soporte',asunto:'Ayuda con mi cuenta',mensaje:'Necesito orientación sobre mi cuenta y sus reservas.'}).ok).toBe(true);
 const p=await crearPublicacion({contenido:'Publicación para comprobar los detalles administrativos.',categoria:'consejos',ubicacion:'Macul',imagen:null});await comentar(p.id,'Comentario para comprobar el detalle.');
 await iniciarSesion('adminp@gmail.com','Admin1234!');
}

it('el panel ofrece siete iconos, Mi perfil y fotos reales, y despliega los datos debajo de la fila',async()=>{
 await admin();const user=userEvent.setup();render(createElement(App));
 await screen.findByRole('region',{name:'Tabla de Animales'});
 const menu=screen.getByRole('complementary',{name:'Secciones administrativas'});
 const botones=within(menu).getAllByRole('button');expect(botones).toHaveLength(7);
 for(const b of botones)expect(b.querySelector('svg')).toBeTruthy();
 const perfil=within(menu).getByRole('link',{name:'Mi perfil'});expect(perfil.classList.contains('admin-mi-perfil')).toBe(true);expect(perfil.getAttribute('href')).toBe('#perfil');
 const tabla=screen.getByRole('region',{name:'Tabla de Animales'});const foto=within(tabla).getByAltText('Milo');expect(foto.getAttribute('src')).toBe(PEH.admin.listar('animales').find(a=>a.slug==='milo').imagen);
 const fila=foto.closest('tr');const control=within(fila).getByRole('button',{name:'Ver detalles'});expect(control.getAttribute('aria-expanded')).toBe('false');
 await user.click(control);expect(control.getAttribute('aria-expanded')).toBe('true');
 const detalle=document.getElementById(control.getAttribute('aria-controls'));expect(detalle.previousElementSibling).toBe(fila);expect(detalle.hidden).toBe(false);expect(detalle.querySelector('td').colSpan).toBe(4);
 expect(within(detalle).getByText('Identificador')).toBeTruthy();expect(within(detalle).getByText('milo')).toBeTruthy();
 fireEvent.error(foto);expect(fila.querySelector('img')).toBeNull();expect(fila.querySelector('.admin-registro-avatar svg')).toBeTruthy();
 await user.click(control);expect(detalle.hidden).toBe(true);
});

it('las siete listas conservan detalles, acciones y los tipos de imagen acordados',async()=>{
 await sembrar();const user=userEvent.setup();render(createElement(App));const menu=screen.getByRole('complementary',{name:'Secciones administrativas'});
 const tipos=[['Animales','foto'],['Usuarios','silueta'],['Adopciones','foto'],['Reservas veterinarias','vacuna'],['Consultas de contacto','silueta'],['Publicaciones','silueta'],['Comentarios','silueta']];
 for(const [nombre,imagen] of tipos){
  await user.click(within(menu).getByRole('button',{name:nombre,exact:true}));
  const tabla=await screen.findByRole('region',{name:'Tabla de '+nombre});
  const fila=tabla.querySelector('.admin-fila-registro');expect(fila).toBeTruthy();
  if(imagen==='foto')expect(fila.querySelector('.admin-registro-foto img')).toBeTruthy();
  else if(imagen==='silueta')expect(fila.querySelector('.admin-silueta-oscura')).toBeTruthy();
  else expect(fila.querySelector('.admin-registro-avatar .icono-admin')).toBeTruthy();
  const control=within(fila).getByRole('button',{name:'Ver detalles'});await user.click(control);
  const detalle=document.getElementById(control.getAttribute('aria-controls'));expect(detalle.hidden).toBe(false);expect(detalle.querySelectorAll('.admin-detalles-campo').length).toBeGreaterThan(0);
  if(nombre==='Adopciones')expect(within(detalle).getByText('Quiero darle un hogar estable y responsable.')).toBeTruthy();
  if(nombre==='Reservas veterinarias')expect(within(fila).getByRole('button',{name:'Gestionar'})).toBeTruthy();
  if(nombre==='Consultas de contacto')expect(within(fila).getByRole('button',{name:'Responder'})).toBeTruthy();
  if(['Publicaciones','Comentarios'].includes(nombre))expect(within(fila).getByRole('button',{name:'Eliminar'})).toBeTruthy();
 }
 expect(fetch).not.toHaveBeenCalled();
});

it('al salir y volver recuerda reservas, búsqueda, filtro y el detalle abierto',async()=>{
 await sembrar();const user=userEvent.setup();render(createElement(App));
 const menu=screen.getByRole('complementary',{name:'Secciones administrativas'});await user.click(within(menu).getByRole('button',{name:'Reservas veterinarias',exact:true}));
 let tabla=await screen.findByRole('region',{name:'Tabla de Reservas veterinarias'});
 await user.type(screen.getByLabelText('Buscar en esta página'),'Michi');await user.selectOptions(screen.getByLabelText('Estado o categoría en esta página'),'Confirmada');
 await user.click(within(tabla).getByRole('button',{name:'Ver detalles'}));
 await navegar('inicio');await navegar('desarrollador');
 tabla=await screen.findByRole('region',{name:'Tabla de Reservas veterinarias'});
 expect(screen.getByLabelText('Buscar en esta página').value).toBe('Michi');expect(screen.getByLabelText('Estado o categoría en esta página').value).toBe('Confirmada');
 expect(within(tabla).getByRole('button',{name:'Ver detalles'}).getAttribute('aria-expanded')).toBe('true');
 expect(within(screen.getByRole('complementary',{name:'Secciones administrativas'})).getByRole('button',{name:'Reservas veterinarias',exact:true}).getAttribute('aria-current')).toBe('page');
});

it('una sección guardada inválida se ignora y un usuario normal no obtiene acceso administrativo',async()=>{
 const cuenta=await admin();sessionStorage.setItem('peh:admin-vista:'+cuenta.id,JSON.stringify({tipo:'seccion-inexistente'}));render(createElement(App));
 await screen.findByRole('region',{name:'Tabla de Animales'});cleanup();await iniciarSesion(cred.correo,cred.contrasena);render(createElement(App));
 expect(await screen.findByRole('heading',{name:'Acceso restringido'})).toBeTruthy();expect(screen.queryByRole('complementary',{name:'Secciones administrativas'})).toBeNull();
});
});

describe('Operaciones, persistencia y permisos',()=>{
let PEH, auth, A, V, M, admin, memoria;
const cred={nombre:'Ana',apellido:'Prueba',usuario:'ana_test',correo:'ana@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};
const formulario={nombreAdoptante:'Ana Prueba',edadAdoptante:'26',correoAdoptante:cred.correo,telefonoAdoptante:cred.telefono,comunaAdoptante:'Macul',tipoVivienda:'casa',situacionVivienda:'propia',viveConPersonas:'no',personasHogar:'',acuerdoFamiliar:'',otrosAnimales:'no',detalleAnimales:'',experienciaAnimales:'si',motivoAdopcion:'Quiero darle un hogar estable y seguro.',cuidadosAnimal:'Tendrá paseos diarios y controles veterinarios.',aceptaCompromiso:true};
const reserva={responsableNombre:'Ana Prueba',responsableCorreo:cred.correo,responsableTelefono:cred.telefono,responsableComuna:'Macul',servicio:'consulta',mascota:'perro',mascotaNombre:'Milo',fecha:'2035-01-10',hora:'09:00',observaciones:'Control general de mi mascota.'};

const publicar=()=>M.crearPublicacion({contenido:'Contenido de prueba suficientemente largo.',categoria:'consejos',ubicacion:'Macul',imagen:null});
const entrar=()=>auth.iniciarSesion(cred.correo,cred.contrasena);
beforeAll(async()=>{vi.stubGlobal("crypto",webcrypto);
 memoria=new Map();const storage={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
 const ventana=new EventTarget();ventana.crypto=crypto;ventana.alert=vi.fn();
 vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',storage);
 vi.stubGlobal('fetch',vi.fn(()=>{throw new Error('No se permite HTTP en el modo local.');}));
 auth=await import("./../src/services/login.js");PEH=auth.default;
 A=await import("./../src/services/animal.js");V=await import("./../src/services/veterinaria.js");M=await import("./../src/services/comunidad.js");admin=await import("./../src/services/administracion.js");
});
beforeEach(async()=>{memoria.clear();fetch.mockClear();await auth.registrarCuenta(cred);await entrar();});
afterAll(()=>vi.unstubAllGlobals());

it('aprobar y completar una adopción cambia la ficha y la retira del catálogo',async()=>{
 const animal=PEH.catalogo.listar()[0],r=await A.enviarSolicitudLocal(animal,formulario);
 await auth.cerrarSesionLocal();await auth.iniciarSesion('adminp@gmail.com','Admin1234!');
 const fila=(await admin.listarAdmin('adopciones'))[0];expect(fila.formulario.nombreAdoptante).toBe('Ana Prueba');
 await admin.cambiarEstadoAdmin('adopciones',r.solicitud.id,{estado:'Aprobada',observacionAdmin:'Revisión completada.'});expect(PEH.catalogo.obtener(animal.id).estadoPerfil).toBe('en-proceso');
 await admin.cambiarEstadoAdmin('adopciones',r.solicitud.id,{estado:'Completada',observacionAdmin:'Adopción finalizada.'});expect(PEH.catalogo.obtener(animal.id).estadoPerfil).toBe('adoptado');expect(PEH.catalogo.listar().some(a=>a.id===animal.id)).toBe(false);
 await entrar();await expect(A.cancelarMiAdopcion(r.solicitud.id)).rejects.toThrow();expect(fetch).not.toHaveBeenCalled();
});

it('el administrador modera respuestas y no permite elevar roles',async()=>{
 const p=await publicar(),c=await M.comentar(p.id,'Comentario de prueba.');await M.comentar(p.id,'Respuesta de prueba.',c.id);const id=PEH.sesion.obtener().id;
 await auth.cerrarSesionLocal();await auth.iniciarSesion('adminp@gmail.com','Admin1234!');await admin.eliminarAdmin('comentarios',c.id);expect(await M.listarComentarios(p.id)).toEqual([]);
 await admin.guardarUsuarioAdmin(id,{nombre:'Ana',apellido:'Prueba',usuario:'ana_test',correo:cred.correo,rol:'ADMIN'});await entrar();expect(PEH.sesion.obtener().rol).toBe('USUARIO');await expect(admin.listarAdmin('usuarios')).rejects.toMatchObject({estado:403});
});

it('desactivar cuenta cancela trámites y bloquea el acceso conservando historiales',async()=>{
 const r=V.registrarReserva(reserva),a=await A.enviarSolicitudLocal(PEH.catalogo.listar()[0],formulario),id=PEH.sesion.obtener().id;
 await auth.cerrarSesionLocal();await auth.iniciarSesion('adminp@gmail.com','Admin1234!');await admin.eliminarAdmin('usuarios',id);
 expect((await admin.listarAdmin('usuarios')).find(u=>u.id===id).activo).toBe(false);expect((await admin.listarAdmin('reservas')).find(x=>x.id===r.reserva.id).estado).toBe('Cancelada');expect((await admin.listarAdmin('adopciones')).find(x=>x.id===a.solicitud.id).estado).toBe('Cancelada');await expect(entrar()).rejects.toThrow();
});

it('administra animales iniciales sin alterar su edad y permite archivar y recuperar visibilidad',async()=>{
 const anterior=PEH.adopciones.guardar({...formulario,animalId:'milo',animalNombre:'Milo'});
 await auth.cerrarSesionLocal();await auth.iniciarSesion('adminp@gmail.com','Admin1234!');const milo=(await admin.listarAdmin('animales')).find(a=>a.slug==='milo');expect(milo.edadMeses).toBe(24);
 await admin.guardarAnimalAdmin(milo.id,{...milo,nombre:'Milo Local',slug:'milo-local'});expect(PEH.catalogo.obtener(milo.id)).toMatchObject({nombre:'Milo Local',edadMeses:24});expect((await admin.listarAdmin('adopciones')).find(a=>a.id===anterior.id).animalId).toBe(milo.id);
 await admin.cambiarEstadoAdmin('animales',milo.id,{estado:'no-visible'});expect(PEH.catalogo.obtener(milo.id)).toBeNull();
 await admin.cambiarEstadoAdmin('animales',milo.id,{estado:'disponible'});expect(PEH.catalogo.obtener(milo.id).edadMeses).toBe(24);
 expect((await admin.listarAdmin('usuarios')).some(u=>u.rol==='ADMIN')).toBe(true);
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

it('administración permite responder una consulta desde su formulario',async()=>{
 await registrarCuenta(cred);await iniciarSesion(cred.correo,cred.contrasena);const {registrarConsulta}=await import("./../src/services/contacto.js");const consulta=registrarConsulta({nombre:'Ana Prueba',correo:cred.correo,motivo:'otro',asunto:'Consulta para administración',mensaje:'Necesito información sobre el proceso de adopción.'});expect(consulta.ok).toBe(true);
 await iniciarSesion('adminp@gmail.com','Admin1234!');window.history.replaceState(null,'','/#desarrollador');const user=userEvent.setup();render(createElement(App));
 await user.click(await screen.findByRole('button',{name:'Consultas de contacto',exact:true}));await user.click(await screen.findByRole('button',{name:'Responder',exact:true}));const respuesta=await screen.findByLabelText('Nueva respuesta');await user.type(respuesta,'Tu consulta fue revisada por administración.');await user.click(screen.getByRole('button',{name:'Guardar cambios'}));expect(await screen.findByText('El cambio se guardó. Se está actualizando la lista.')).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
});
});

describe('Validaciones y recuperación del proceso',()=>{

const credExtra={nombre:'Ana',apellido:'Prueba',usuario:'ana_extra',correo:'ana.extra@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};
async function entrarExtra(){await registrarCuenta(credExtra);await iniciarSesion(credExtra.correo,credExtra.contrasena);}
beforeEach(()=>{localStorage.clear();sessionStorage.clear();Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});window.history.replaceState(null,'','/#inicio');window.scrollTo=vi.fn();window.alert=vi.fn();window.confirm=vi.fn(()=>true);HTMLElement.prototype.scrollIntoView=vi.fn();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});

it('una edad inválida se rechaza sin modificar el animal existente',async()=>{
 await entrarExtra();await iniciarSesion('adminp@gmail.com','Admin1234!');const animal=(await listarAdmin('animales'))[0],antes=JSON.stringify(animal);await expect(guardarAnimalAdmin(animal.id,{...animal,edadMeses:-1})).rejects.toThrow();expect(JSON.stringify((await listarAdmin('animales')).find(a=>a.id===animal.id))).toBe(antes);
});

});
