import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { createElement } from 'react';
import { render, screen, within, cleanup, waitFor, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import PEH from '../src/services/global.js';
import { registrarCuenta, iniciarSesion } from '../src/services/login.js';
import { ListaAdopciones, ListaReservas, MisConsultas } from '../src/components/perfil.jsx';
import { ordenarPorRegistroReciente } from '../src/services/perfil.js';
import * as consultasOrden from '../src/services/contacto.js';
import { useHistorialPerfil } from '../src/hooks/perfil.js';
// @vitest-environment jsdom

describe('Operaciones, persistencia y permisos',()=>{
let PEH, auth, V, P, memoria;
const cred={nombre:'Ana',apellido:'Prueba',usuario:'ana_test',correo:'ana@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};

const reserva={responsableNombre:'Ana Prueba',responsableCorreo:cred.correo,responsableTelefono:cred.telefono,responsableComuna:'Macul',servicio:'consulta',mascota:'perro',mascotaNombre:'Milo',fecha:'2035-01-10',hora:'09:00',observaciones:'Control general de mi mascota.'};

const entrar=()=>auth.iniciarSesion(cred.correo,cred.contrasena);
beforeAll(async()=>{vi.stubGlobal("crypto",webcrypto);
 memoria=new Map();const storage={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
 const ventana=new EventTarget();ventana.crypto=crypto;ventana.alert=vi.fn();
 vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',storage);
 vi.stubGlobal('fetch',vi.fn(()=>{throw new Error('No se permite HTTP en el modo local.');}));
 auth=await import("./../src/services/login.js");PEH=auth.default;
 V=await import("./../src/services/veterinaria.js");P=await import("./../src/services/perfil.js");
});
beforeEach(async()=>{memoria.clear();fetch.mockClear();await auth.registrarCuenta(cred);await entrar();});
afterAll(()=>vi.unstubAllGlobals());

it('edita cuenta y preferencias y recupera ambas al volver a iniciar sesión',async()=>{
 await P.guardarPerfil({...cred,nombre:'Andrea',apellido:'Nueva',correo:'andrea@peh.cl',foto:''});
 await P.guardarPreferencias({notificaciones:{adopcion:false,veterinaria:true},adopcion:{tipoAnimal:'gato'}});
 await auth.cerrarSesionLocal();const s=await auth.iniciarSesion('andrea@peh.cl',cred.contrasena);
 expect(s).toMatchObject({nombre:'Andrea',apellido:'Nueva',correo:'andrea@peh.cl'});expect(await P.leerPreferencias()).toMatchObject({adopcion:{tipoAnimal:'gato'}});
});

it('cambiar contraseña cierra la sesión y exige la contraseña nueva',async()=>{
 await P.cambiarContrasena(cred.contrasena,'Nueva123!','Nueva123!');expect(PEH.sesion.obtener()).toBeNull();await expect(entrar()).rejects.toThrow();expect(await auth.iniciarSesion(cred.correo,'Nueva123!')).toMatchObject({nombre:'Ana'});
});

it('las fechas visibles de cancelación y aprobación corresponden al evento y no al envío',async()=>{
 const r=V.registrarReserva(reserva);const cancelada=await V.cancelarMiReserva(r.reserva.id);
 expect(P.eventoHistorial(cancelada,'reservas').etiquetaFecha).toBe('Fecha de cancelación');
 const s={estado:'Aprobada',fechaCreacion:'2026-11-01T15:00:00Z',historialCambios:[{estado:'En revisión',fechaCreacion:'2026-11-02T15:00:00Z'},{estado:'Aprobada',fechaCreacion:'2026-11-03T16:20:00Z'}]};
 const e=P.eventoHistorial(s,'adopciones');expect(e.fecha).toContain('03');expect(e.hora).toBe('13:20 hrs');expect(e.etiquetaFecha).toBe('Fecha de aprobación');
 expect(P.eventoHistorial({...s,estado:'Rechazada'},'adopciones').fecha).toBe('No registrada');
});

it('los mensajes cambian según estado y las fechas pasadas no cierran una reserva',()=>{
 const r={estado:'Confirmada',fecha:'2026-11-01',hora:'09:00'};
 expect(P.mensajeHistorial(r,'reservas',new Date('2026-11-08T15:00:00Z'))).toContain('ya pasó');expect(r.estado).toBe('Confirmada');
 expect(P.mensajeHistorial({estado:'Cancelada'},'reservas')).toContain('cancelada');
 expect(P.mensajeHistorial({estado:'En revisión'},'adopciones')).toContain('revisando');
 expect(P.mensajeHistorial({estado:'Respondida'},'consultas')).toContain('respuesta');
});

it('el evento de estado no cambia al editar otros datos y muestra la última respuesta de contacto',()=>{
 const s={estado:'Aprobada',fechaCreacion:'2026-11-01T15:00:00Z',fechaEstado:'2026-11-03T16:20:00Z',fechaActualizacion:'2026-11-07T20:00:00Z'};
 expect(P.eventoHistorial(s,'adopciones').hora).toBe('13:20 hrs');
 expect(P.eventoHistorial({estado:'Respondida',respuestas:[{fechaCreacion:'2026-11-04T14:45:00Z'}]},'consultas').hora).toBe('11:45 hrs');
 expect(P.eventoHistorial({estado:'Completada',fecha:'2026-11-01',hora:'09:00'},'reservas').hora).toBe('No registrada');
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

it('la configuración del perfil guarda datos personales sin cambiar de cuenta',async()=>{
 const user=await preparar('perfil');render(createElement(App));const nombre=await screen.findByLabelText('Nombre',{exact:true});await user.clear(nombre);await user.type(nombre,'Andrea');await user.click(screen.getByRole('button',{name:'Guardar datos'}));expect(await screen.findByText('Tus datos fueron actualizados.')).toBeTruthy();expect(PEH.sesion.obtener().nombre).toBe('Andrea');expect(screen.getByText('Hola, Andrea')).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
});

it('el perfil inicia compacto, elimina la miga y mantiene seis accesos que abren los historiales',async()=>{
 const user=await preparar('perfil');render(createElement(App));
 await waitFor(()=>expect(document.getElementById('consultasPerfil')).toBeTruthy());
 const menu=screen.getByRole('navigation',{name:'Secciones del perfil'});
 expect(within(menu).getAllByRole('button')).toHaveLength(6);
 expect(within(menu).queryAllByRole('link')).toHaveLength(0);
 expect(document.querySelector('.miga-navegacion')).toBeNull();
 for(const id of ['misAdopcionesApi','misReservasApi','consultasPerfil'])expect(document.getElementById(id).open).toBe(false);
 await user.click(within(menu).getByRole('button',{name:'Mis reservas',exact:true}));
 expect(document.getElementById('misReservasApi').open).toBe(true);
 await user.click(within(menu).getByRole('button',{name:'Mis adopciones',exact:true}));
 expect(document.getElementById('misAdopcionesApi').open).toBe(true);
 // Cada acordeón se controla por separado y no cierra los demás.
 await user.click(document.querySelector('#misAdopcionesApi > summary'));
 expect(document.getElementById('misAdopcionesApi').open).toBe(false);
 expect(document.getElementById('misReservasApi').open).toBe(true);
 await user.click(within(menu).getByRole('button',{name:'Mis consultas',exact:true}));
 expect(document.getElementById('consultasPerfil').open).toBe(true);
 expect(fetch).not.toHaveBeenCalled();
});

it('adopciones conserva todos los datos dentro del detalle anidado y permite filtrar',async()=>{
 const user=await preparar('perfil');
 const {enviarSolicitudLocal}=await import("./../src/services/animal.js");
 await enviarSolicitudLocal(PEH.catalogo.listar()[0],{nombreAdoptante:'Ana Prueba',edadAdoptante:'26',correoAdoptante:cred.correo,telefonoAdoptante:cred.telefono,comunaAdoptante:'Macul',tipoVivienda:'casa',situacionVivienda:'propia',viveConPersonas:'no',otrosAnimales:'no',experienciaAnimales:'si',motivoAdopcion:'Quiero darle un hogar estable y responsable.',cuidadosAnimal:'Tendrá paseos y controles veterinarios.',aceptaCompromiso:true});
 render(createElement(App));await user.click(document.querySelector('#misAdopcionesApi > summary'));
 const seccion=document.getElementById('misAdopcionesApi');
 await within(seccion).findByRole('button',{name:/Cancelar solicitud de/});
 const detalle=seccion.querySelector('.perfil-detalle');expect(detalle.open).toBe(false);
 await user.click(detalle.querySelector('summary'));expect(detalle.open).toBe(true);
 expect(within(detalle).getByText(cred.correo)).toBeTruthy();
 expect(within(detalle).getByText('Quiero darle un hogar estable y responsable.')).toBeTruthy();
 await user.click(within(seccion).getByRole('button',{name:/Rechazadas/}));
 expect(await within(seccion).findByRole('heading',{name:'No hay solicitudes en esta categoría'})).toBeTruthy();
 await user.click(within(seccion).getByRole('button',{name:/Todas/}));
 expect(await within(seccion).findByRole('button',{name:/Cancelar solicitud de/})).toBeTruthy();
});

it('reservas muestra su formulario e historial dentro del detalle sin perder los datos guardados',async()=>{
 const user=await preparar('perfil');const {registrarReserva}=await import("./../src/services/veterinaria.js");
 expect(registrarReserva({responsableNombre:'Ana Prueba',responsableCorreo:cred.correo,responsableTelefono:cred.telefono,responsableComuna:'Macul',servicio:'consulta',mascota:'perro',mascotaNombre:'Michi',fecha:'2035-01-10',hora:'09:00',observaciones:'Control general de mi mascota.'}).ok).toBe(true);
 render(createElement(App));await waitFor(()=>expect(document.getElementById('misReservasApi')).toBeTruthy());
 await user.click(document.querySelector('#misReservasApi > summary'));
 const seccion=document.getElementById('misReservasApi');await within(seccion).findByRole('button',{name:'Cancelar reserva de Michi'});
 const detalle=seccion.querySelector('.perfil-detalle');expect(detalle.open).toBe(false);await user.click(detalle.querySelector('summary'));
 expect(detalle.open).toBe(true);expect(within(detalle).getByText(cred.correo)).toBeTruthy();expect(within(detalle).getByText('Control general de mi mascota.')).toBeTruthy();
 await user.click(document.querySelector('#misReservasApi > summary'));expect(seccion.open).toBe(false);
 await user.click(document.querySelector('#misReservasApi > summary'));expect(detalle.open).toBe(true);
});

it('la ruta de consultas abre su sección y conserva el mensaje y las respuestas en el detalle',async()=>{
 const user=await preparar('perfil/consultas');const {registrarConsulta}=await import("./../src/services/contacto.js");
 const c=registrarConsulta({nombre:'Ana Prueba',correo:cred.correo,motivo:'soporte',asunto:'Ayuda con mi cuenta',mensaje:'Necesito orientación sobre mi perfil y sus reservas.'});
 expect(c.ok).toBe(true);await iniciarSesion('adminp@gmail.com','Admin1234!');
 const {responderConsultaAdmin}=await import("./../src/services/administracion.js");await responderConsultaAdmin(c.consulta.id,'Puedes revisar los estados en tu perfil.');await iniciarSesion(cred.correo,cred.contrasena);
 render(createElement(App));await screen.findByRole('heading',{name:'Ayuda con mi cuenta'});
 const seccion=document.getElementById('consultasPerfil');expect(seccion.open).toBe(true);
 const detalle=seccion.querySelector('.perfil-detalle');expect(detalle.open).toBe(false);await user.click(detalle.querySelector('summary'));
 expect(within(detalle).getByText('Necesito orientación sobre mi perfil y sus reservas.')).toBeTruthy();
 expect(within(detalle).getByText('Puedes revisar los estados en tu perfil.')).toBeTruthy();
 expect(fetch).not.toHaveBeenCalled();
});

it('las tres configuraciones conservan Guardar primero y Cancelar después, y cancelar restaura los datos',async()=>{
 const user=await preparar('perfil');render(createElement(App));
 await screen.findByRole('button',{name:'Guardar preferencias'});
 const parejas=document.querySelectorAll('.perfil-acciones-formulario');expect(parejas).toHaveLength(3);
 for(const pareja of parejas){const botones=within(pareja).getAllByRole('button');expect(botones).toHaveLength(2);expect(botones[0].type).toBe('submit');expect(botones[1].textContent).toBe('Cancelar proceso');expect(botones[1].type).toBe('button');}
 const nombre=screen.getByLabelText('Nombre',{exact:true});await user.clear(nombre);await user.type(nombre,'Cambio sin guardar');
 await user.click(within(document.getElementById('datosPerfilApi')).getByRole('button',{name:'Cancelar proceso'}));expect(nombre.value).toBe('Ana');expect(PEH.sesion.obtener().nombre).toBe('Ana');
 const tipo=screen.getByLabelText('Tipo de animal');const original=tipo.value;await user.selectOptions(tipo,'gato');
 await user.click(within(document.getElementById('preferenciasPerfilApi')).getByRole('button',{name:'Cancelar proceso'}));expect(tipo.value).toBe(original);
 const clave=screen.getByLabelText('Contraseña actual');await user.type(clave,'Borrador123!');
 await user.click(within(document.getElementById('seguridadPerfilApi')).getByRole('button',{name:'Cancelar proceso'}));expect(clave.value).toBe('');
});

it('los tres historiales vacíos comparten formato y ocultan sus filtros',async()=>{
 const user=await preparar('perfil');render(createElement(App));
 await waitFor(()=>expect(document.getElementById('consultasPerfil')).toBeTruthy());
 const datos=[['misAdopcionesApi','Todavía no tienes solicitudes','Conocer animales'],['misReservasApi','Todavía no tienes reservas','Reservar una hora'],['consultasPerfil','Todavía no tienes consultas','Realizar una consulta']];
 for(const [id,titulo,boton] of datos){
  const seccion=document.getElementById(id);await user.click(seccion.querySelector('summary'));
  expect(await within(seccion).findByRole('heading',{name:titulo})).toBeTruthy();
  expect(within(seccion).getByRole('link',{name:boton})).toBeTruthy();
  expect(seccion.querySelector('.historial-vacio-unificado')).toBeTruthy();
  expect(seccion.querySelector('.filtros-historial-adopciones')).toBeNull();
 }
});

it('adopciones separa pendientes y revisión y enlaza al animal de la solicitud',async()=>{
 const user=await preparar('perfil'),a=PEH.catalogo.listar()[0],b=PEH.catalogo.listar()[1];
 PEH.adopciones.guardar({animalId:a.id,animalNombre:a.nombre,estado:'Pendiente'});
 PEH.adopciones.guardar({animalId:b.id,animalNombre:b.nombre,estado:'En revisión',historialCambios:[{estado:'En revisión',fechaCreacion:'2026-11-08T15:00:00Z'}]});
 render(createElement(App));const seccion=await waitFor(()=>{const e=document.getElementById('misAdopcionesApi');expect(e).toBeTruthy();return e;});
 await user.click(seccion.querySelector('summary'));
 await user.click(await within(seccion).findByRole('button',{name:'Pendientes 1'}));
 expect(within(seccion).getByRole('heading',{name:a.nombre})).toBeTruthy();expect(within(seccion).queryByRole('heading',{name:b.nombre})).toBeNull();
 expect(within(seccion).getByRole('link',{name:'Ir al perfil'}).getAttribute('href')).toBe('#animal/'+a.slug);
 await user.click(within(seccion).getByRole('button',{name:'En revisión 1'}));
 expect(within(seccion).getByRole('heading',{name:b.nombre})).toBeTruthy();
 expect(seccion.querySelector('.mensaje-estado-historial').textContent).toContain('revisando');
});

it('reservas filtra confirmadas, cerradas y canceladas y conserva el informe dentro del detalle',async()=>{
 const user=await preparar('perfil');
 const base={mascota:'gato',fecha:'2026-11-07',hora:'09:00',servicio:'consulta'};
 PEH.reservas.guardar({...base,mascotaNombre:'Confirmada prueba',estado:'Confirmada'});
 PEH.reservas.guardar({...base,mascotaNombre:'Cerrada prueba',estado:'Cerrada',fechaAtencion:'2026-11-07',horaTermino:'09:50',conclusionConsulta:'Control realizado sin novedades.',recomendacionesVeterinario:'Mantener control anual.'});
 PEH.reservas.guardar({...base,mascotaNombre:'Cancelada prueba',estado:'Cancelada',historialCambios:[{estado:'Cancelada',fechaCreacion:'2026-11-08T15:00:00Z'}]});
 render(createElement(App));await waitFor(()=>expect(document.getElementById('misReservasApi')).toBeTruthy());const seccion=document.getElementById('misReservasApi');await user.click(seccion.querySelector('summary'));
 await user.click(await within(seccion).findByRole('button',{name:'Cerradas 1'}));
 expect(within(seccion).queryByRole('heading',{name:'Confirmada prueba'})).toBeNull();
 expect(within(seccion).getByRole('heading',{name:'Cerrada prueba'})).toBeTruthy();
 expect(within(seccion).getByText('09:50 hrs')).toBeTruthy();
 const detalle=seccion.querySelector('.perfil-detalle');await user.click(detalle.querySelector('summary'));
 expect(within(detalle).getByText('Control realizado sin novedades.')).toBeTruthy();expect(within(detalle).getByText('Mantener control anual.')).toBeTruthy();expect(within(detalle).getByText('09:00')).toBeTruthy();
 await user.click(within(seccion).getByRole('button',{name:'Canceladas 1'}));
 expect(within(seccion).getByRole('heading',{name:'Cancelada prueba'})).toBeTruthy();expect(seccion.querySelector('.mensaje-estado-historial').textContent).toContain('cancelada');
});
});

describe('Orden de los historiales',()=>{
const fechas=['2026-11-01T12:00:00Z','2026-11-03T12:00:00Z','2026-11-02T12:00:00Z'];
beforeEach(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});});
afterEach(()=>cleanup());
afterEach(()=>vi.restoreAllMocks());

it('el orden reciente usa el registro, conserva el array original y deja fechas desconocidas al final',()=>{
 const datos=[{id:'sin-fecha'},{id:'antigua',fechaCreacion:fechas[0]},{id:'nueva',fechaCreacion:fechas[1]},{id:'intermedia',fechaRegistro:fechas[2]}];
 expect(ordenarPorRegistroReciente(datos).map(r=>r.id)).toEqual(['nueva','intermedia','antigua','sin-fecha']);
 expect(datos.map(r=>r.id)).toEqual(['sin-fecha','antigua','nueva','intermedia']);
});

it('Todas en adopciones muestra la última solicitud primero aunque la entrada llegue desordenada',()=>{
 const datos=fechas.map((fechaCreacion,i)=>({id:String(i),animalNombre:['Antigua','Nueva','Intermedia'][i],fechaCreacion,estado:'Pendiente'}));
 const {container}=render(createElement(ListaAdopciones,{solicitudes:datos,filtro:'todas',onFiltro:vi.fn()}));
 expect([...container.querySelectorAll('.item-historial-adopcion h3')].map(e=>e.textContent)).toEqual(['Nueva','Intermedia','Antigua']);
 expect(datos.map(r=>r.id)).toEqual(['0','1','2']);
});

it('Todas las reservas respeta la creación por encima de fecha de cita o estado',()=>{
 const datos=fechas.map((fechaCreacion,i)=>({id:String(i),mascotaNombre:['Antigua','Nueva','Intermedia'][i],fechaCreacion,estado:i===1?'Cancelada':'Pendiente',fecha:['2035-01-02','2035-01-01','2035-01-03'][i],hora:'09:00',servicio:'Consulta general',mascota:'perro'}));
 const {container}=render(createElement(ListaReservas,{reservas:datos}));
 expect([...container.querySelectorAll('.item-historial-reserva h3')].map(e=>e.textContent)).toEqual(['Nueva','Intermedia','Antigua']);
 expect(container.querySelectorAll('.item-historial-reserva')).toHaveLength(3);
 expect(datos.map(r=>r.id)).toEqual(['0','1','2']);
});

it('consultas muestra todos los registros desde el último enviado hasta el primero',async()=>{
 vi.spyOn(consultasOrden,'listarMisConsultas').mockResolvedValue(fechas.map((fechaCreacion,i)=>({id:String(i),asunto:['Antigua','Nueva','Intermedia'][i],fechaCreacion,estado:'Pendiente',motivo:'soporte',nombre:'Ana',correo:'ana@peh.cl',mensaje:'Mensaje de la consulta.',respuestas:[]})));
 const {container}=render(createElement(MisConsultas,{usuarioId:'prueba'}));
 await waitFor(()=>expect(container.querySelectorAll('.consulta-api')).toHaveLength(3));
 expect([...container.querySelectorAll('.consulta-api h3')].map(e=>e.textContent)).toEqual(['Nueva','Intermedia','Antigua']);
});
});

describe('Validación y borradores',()=>{

let PEH, memoria;
beforeAll(async()=>{vi.stubGlobal("crypto",webcrypto);
  memoria=new Map();const almacenamiento={getItem:k=>memoria.get(k)??null,setItem:(k,v)=>memoria.set(k,String(v)),removeItem:k=>memoria.delete(k)};
  const ventana=new EventTarget();ventana.localStorage=almacenamiento;ventana.crypto=globalThis.crypto;
  vi.stubGlobal('window',ventana);vi.stubGlobal('localStorage',almacenamiento);
  PEH=(await import("./../src/services/login.js")).default;
 });
afterAll(()=>vi.unstubAllGlobals());
beforeEach(()=>{memoria.clear();localStorage.setItem(PEH.CLAVES.cuentas,JSON.stringify([{id:'A',nombre:'Ana',correo:'a@duocuc.cl'},{id:'B',nombre:'Bruno',correo:'b@profesor.duocuc.cl'}]));PEH.sesion.iniciar({id:'A'});});

it('actualiza contacto/correo de la cuenta sin aceptar duplicados',()=>{expect(PEH.cuentas.actualizarPerfil({nombre:'Ana Prueba',correo:'ana.nueva@duocuc.cl',telefono:'912345678',comuna:'Macul'}).ok).toBe(true);expect(PEH.sesion.obtener().correo).toBe('ana.nueva@duocuc.cl');expect(PEH.cuentas.actualizarPerfil({nombre:'Ana Prueba',correo:'b@profesor.duocuc.cl',telefono:'912345678',comuna:'Macul'}).ok).toBe(false);});
});

describe('Actualización asíncrona de historiales',()=>{

beforeEach(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});});
afterEach(()=>{cleanup();vi.useRealTimers();});
afterEach(()=>vi.restoreAllMocks());

it('el historial comparte la actualización periódica sin cargar oculto o durante una cancelación',async()=>{
 vi.useFakeTimers();
 const mutando={current:false},listar=vi.fn().mockResolvedValue([]);
 const {unmount}=renderHook(()=>useHistorialPerfil('A','solicitudes',listar,mutando));
 await act(async()=>{});
 expect(listar).toHaveBeenCalledTimes(1);
 await act(async()=>{vi.advanceTimersByTime(30_000);});
 expect(listar).toHaveBeenCalledTimes(2);
 mutando.current=true;
 await act(async()=>{window.dispatchEvent(new Event('focus'));vi.advanceTimersByTime(30_000);});
 expect(listar).toHaveBeenCalledTimes(2);
 mutando.current=false;
 Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});
 await act(async()=>{vi.advanceTimersByTime(30_000);});
 expect(listar).toHaveBeenCalledTimes(2);
 Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});
 await act(async()=>{document.dispatchEvent(new Event('visibilitychange'));});
 expect(listar).toHaveBeenCalledTimes(3);
 const signal=listar.mock.calls.at(-1)[0].signal;
 unmount();
 expect(signal.aborted).toBe(true);
 await act(async()=>{window.dispatchEvent(new Event('focus'));vi.advanceTimersByTime(30_000);});
 expect(listar).toHaveBeenCalledTimes(3);
});

it('un resultado anterior no sustituye el historial al cambiar de cuenta',async()=>{
 const pendientes=[];
 const listar=vi.fn(({signal})=>new Promise(resolve=>pendientes.push({resolve,signal})));
 const {result,rerender,unmount}=renderHook(({cuenta})=>useHistorialPerfil(cuenta,'reservas',listar),{initialProps:{cuenta:'A'}});
 rerender({cuenta:'B'});
 expect(pendientes[0].signal.aborted).toBe(true);
 await act(async()=>{pendientes[1].resolve([{id:'reserva-B'}]);});
 await act(async()=>{pendientes[0].resolve([{id:'reserva-A'}]);});
 expect(result.current.estado.reservas).toEqual([{id:'reserva-B'}]);
 unmount();
});
});

describe('Validaciones y recuperación del proceso',()=>{

const credExtra={nombre:'Ana',apellido:'Prueba',usuario:'ana_extra',correo:'ana.extra@peh.cl',contrasena:'Prueba123!',fechaNacimiento:'2000-01-15',telefono:'912345678',comuna:'Macul'};
async function entrarExtra(){await registrarCuenta(credExtra);await iniciarSesion(credExtra.correo,credExtra.contrasena);}
beforeEach(()=>{localStorage.clear();sessionStorage.clear();Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});window.history.replaceState(null,'','/#inicio');window.scrollTo=vi.fn();window.alert=vi.fn();window.confirm=vi.fn(()=>true);HTMLElement.prototype.scrollIntoView=vi.fn();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});

async function completarClave(user,actual,nueva,confirmar=nueva){await user.type(await screen.findByLabelText('Contraseña actual'),actual);await user.type(screen.getByLabelText('Nueva contraseña'),nueva);await user.type(screen.getByLabelText('Confirmar nueva contraseña'),confirmar);await user.click(screen.getByRole('button',{name:'Actualizar contraseña'}));}
it('cambia la contraseña desde el formulario y permite entrar con la nueva',async()=>{
 await entrarExtra();window.history.replaceState(null,'','/#perfil');const user=userEvent.setup();render(createElement(App));await completarClave(user,credExtra.contrasena,'Nueva123!');await screen.findByRole('heading',{name:'Bienvenido a PEH'});
 await user.type(document.getElementById('correo'),credExtra.correo);await user.type(document.getElementById('contrasena'),'Nueva123!');await user.click(document.getElementById('botonIniciarSesion'));expect(await screen.findByText('Hola, Ana')).toBeTruthy();expect(window.alert).toHaveBeenCalled();
});
it('rechaza la contraseña actual incorrecta y conserva la sesión y la contraseña anterior',async()=>{
 await entrarExtra();const id=PEH.sesion.obtener().id;window.history.replaceState(null,'','/#perfil');const user=userEvent.setup();render(createElement(App));await completarClave(user,'Otra123!','Nueva123!');expect(await within(document.getElementById('seguridadPerfilApi')).findByRole('alert')).toBeTruthy();expect(PEH.sesion.obtener().id).toBe(id);expect((await iniciarSesion(credExtra.correo,credExtra.contrasena)).id).toBe(id);
});
it('rechaza desde Perfil un correo ocupado sin alterar la cuenta ni borrar lo escrito',async()=>{
 await entrarExtra();const id=PEH.sesion.obtener().id;await registrarCuenta({...credExtra,usuario:'otra_extra',correo:'otra.extra@peh.cl'});window.history.replaceState(null,'','/#perfil');const user=userEvent.setup();render(createElement(App));const correo=await screen.findByLabelText('Correo',{exact:true});await user.clear(correo);await user.type(correo,'otra.extra@peh.cl');await user.click(screen.getByRole('button',{name:'Guardar datos'}));expect(await within(document.getElementById('datosPerfilApi')).findByText('Ese correo ya pertenece a otra cuenta.')).toBeTruthy();expect(PEH.sesion.obtener()).toMatchObject({id,correo:credExtra.correo});expect(correo.value).toBe('otra.extra@peh.cl');
});

});
