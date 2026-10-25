import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

/* Casos Vitest sobre servicios reales y bloqueo global de formularios de PEH.
 * El único sustituto es localStorage: se conservan cadenas JSON en memoria.
 * Las cuentas son fixtures; no se prueba el registro ni el hash de contraseñas.
 * No se reemplazan las funciones que guardan, filtran o verifican permisos.
 */
describe('PEH — persistencia y reglas por cuenta', () => {
  let PEH, enviarSolicitud, registrarReserva, filtrar, filtrosIniciales, animales;
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
  function publicar() {
    const p = PEH.publicaciones.agregar({ texto: 'Encontramos un perro en Macul.', categoria: 'encontrados', comuna: 'Macul' });
    expect(p).not.toBeNull();
    return p;
  }
  beforeAll(async () => {
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
    PEH = (await import('../src/services/peh.js')).default;
    ({ enviarSolicitud } = await import('../src/services/adopcion.js'));
    ({ registrarReserva } = await import('../src/services/veterinaria.js'));
    ({ obtenerAnimalesFiltrados: filtrar, filtrosIniciales } = await import('../src/services/catalogo.js'));
    animales = (await import('../src/data/animales.js')).default;
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

  it('01 — conserva la solicitud de adopción para el historial de su cuenta', () => {
    const animal = PEH.catalogo.listar().find(a => a.estadoPerfil === 'disponible');
    expect(animal).toBeDefined();
    const resultado = enviarSolicitud(animal, datosAdopcion());
    expect(resultado.ok).toBe(true);
    expect(JSON.parse(localStorage.getItem(PEH.CLAVES.adopciones))).toContainEqual(expect.objectContaining({ id: resultado.solicitud.id, usuarioId: cuentaA.id, animalNombre: animal.nombre }));
    volverAEntrar(cuentaA);
    expect(PEH.adopciones.listar()).toEqual([expect.objectContaining({ id: resultado.solicitud.id, animalNombre: animal.nombre, estado: 'Pendiente' })]);
  });

  it('02 — conserva la reserva veterinaria para el historial de su cuenta', () => {
    const resultado = registrarReserva(datosReserva(), ahora);
    expect(resultado.ok).toBe(true);
    expect(JSON.parse(localStorage.getItem(PEH.CLAVES.reservas))).toContainEqual(expect.objectContaining({ id: resultado.reserva.id, usuarioId: cuentaA.id }));
    volverAEntrar(cuentaA);
    expect(PEH.reservas.listar()).toEqual([expect.objectContaining({ id: resultado.reserva.id, mascotaNombre: 'Firulais', fecha: '2035-01-11', hora: '10:30' })]);
  });

  it('03 — conserva comentarios y permite leerlos desde otra cuenta', () => {
    const p = publicar();
    const comentario = PEH.comentarios.agregar(p.id, 'Puedo ayudar a encontrar a su familia.');
    expect(comentario).not.toBeNull();
    volverAEntrar(cuentaB);
    expect(PEH.comentarios.listar(p.id)).toEqual([expect.objectContaining({ id: comentario.id, usuarioId: cuentaA.id, texto: 'Puedo ayudar a encontrar a su familia.' })]);
    expect(PEH.comentarios.listar('publicacion-inexistente')).toEqual([]);
  });

  it('04 — conserva publicaciones y permite leerlas desde otra cuenta', () => {
    const p = publicar();
    volverAEntrar(cuentaB);
    expect(PEH.publicaciones.listar()).toEqual([expect.objectContaining({ id: p.id, usuarioId: cuentaA.id, texto: p.texto })]);
  });

  it('05 — separa solicitudes y reservas entre las dos cuentas y el invitado', () => {
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

  it('06 — elimina la publicación propia del almacenamiento sin borrar las demás', () => {
    const propia = publicar();
    entrar(cuentaB); const ajena = publicar(); entrar(cuentaA);
    expect(PEH.publicaciones.eliminar(propia.id)).toBe(true);
    volverAEntrar(cuentaA);
    expect(PEH.publicaciones.listar().map(p => p.id)).toEqual([ajena.id]);
    expect(JSON.parse(localStorage.getItem(PEH.CLAVES.publicaciones)).map(p => p.id)).toEqual([ajena.id]);
  });

  it('07 — bloquea una reserva duplicada incluso después de volver a entrar', () => {
    expect(registrarReserva(datosReserva(), ahora).ok).toBe(true);
    volverAEntrar(cuentaA);
    const duplicada = registrarReserva({ ...datosReserva(), mascotaNombre: '  FIRULAIS  ' }, ahora);
    expect(duplicada.ok).toBe(false);
    expect(duplicada.mensaje).toContain('Ya tienes una reserva');
    expect(PEH.reservas.listar().length).toBe(1);
    expect(JSON.parse(localStorage.getItem(PEH.CLAVES.reservas)).length).toBe(1);
  });

  it('08 — filtra perros y gatos con la misma función que usa el catálogo', () => {
    const catalogo = PEH.catalogo.listar();
    for (const especie of ['perro', 'gato']) {
      const resultado = filtrar(catalogo, { ...filtrosIniciales, especie });
      expect(resultado.length).toBeGreaterThan(0);
      expect(resultado.map(a => a.id).sort()).toEqual(catalogo.filter(a => a.especie === especie).map(a => a.id).sort());
      expect(resultado.every(a => a.especie === especie)).toBe(true);
    }
    expect(filtrar(catalogo, filtrosIniciales)).toEqual(catalogo);
  });

  it('09 — conserva Compartido solamente para la cuenta que compartió', () => {
    const p = publicar();
    expect(PEH.compartidos.marcar(p.id, cuentaA.id)).toBe(true);
    volverAEntrar(cuentaA); expect(PEH.compartidos.contiene(p.id)).toBe(true);
    volverAEntrar(cuentaB); expect(PEH.compartidos.contiene(p.id)).toBe(false);
    expect(PEH.compartidos.marcar(p.id, cuentaA.id)).toBe(false);
    volverAEntrar(cuentaA); expect(PEH.compartidos.contiene(p.id)).toBe(true);
  });

  it('10 — impide eliminar la publicación de otra cuenta y conserva sus datos', () => {
    const p = publicar();
    const antes = localStorage.getItem(PEH.CLAVES.publicaciones);
    entrar(cuentaB);
    expect(PEH.publicaciones.eliminar(p.id)).toBe(false);
    expect(localStorage.getItem(PEH.CLAVES.publicaciones)).toBe(antes);
    volverAEntrar(cuentaA);
    expect(PEH.publicaciones.listar().map(p => p.id)).toEqual([p.id]);
  });
  it('12 — solo No elimina los datos dependientes', async () => {
    const { limpiarCondicionales } = await import('../src/services/adopcion.js');
    const d = {...datosAdopcion(),detalleAnimales:'Un gato adulto tranquilo.'};
    expect(limpiarCondicionales({...d,viveConPersonas:''}).personasHogar).toBe('2');
    expect(limpiarCondicionales({...d,viveConPersonas:'no',otrosAnimales:'no'})).toEqual(expect.objectContaining({personasHogar:'',acuerdoFamiliar:'',detalleAnimales:''}));
  });
  it('15 — Impide completar formularios como invitado', async () => {
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
  it('17 — recupera el borrador tras reconstruir almacenamiento y separa cuentas', async () => {
    const {guardarBorradorReserva,leerBorradorReserva} = await import('../src/services/veterinaria.js');
    expect(guardarBorradorReserva(datosReserva())).toBe(true);
    volverAEntrar(cuentaA);
    expect(leerBorradorReserva()).toEqual(datosReserva());
    entrar(cuentaB); expect(leerBorradorReserva()).toBeNull();
    volverAEntrar(cuentaA);expect(leerBorradorReserva().mascotaNombre).toBe('Firulais');
  });
  it('19 — rechaza servicio, horario y fecha que no corresponden', async () => {
    const {validarCampoReserva} = await import('../src/services/veterinaria.js');
    for (const [campo,valor] of [['servicio','inventado'],['hora','10:00'],['fecha','2035-02-30'],['responsableTelefono','123']]) {
      expect(validarCampoReserva(campo,{...datosReserva(),[campo]:valor},ahora)).toBeTruthy();
    }
    expect(validarCampoReserva('hora',datosReserva(),ahora)).toBe('');
  });
  it('20 — cancelar el borrador conserva la reserva ya enviada', async () => {
    const {guardarBorradorReserva,eliminarBorradorReserva,leerBorradorReserva} = await import('../src/services/veterinaria.js');
    const enviada=registrarReserva(datosReserva(),ahora);expect(enviada.ok).toBe(true);
    expect(guardarBorradorReserva({...datosReserva(),mascotaNombre:'Otra mascota'})).toBe(true);
    expect(eliminarBorradorReserva()).toBe(true);expect(leerBorradorReserva()).toBeNull();
    expect(PEH.reservas.listar().map(r=>r.id)).toEqual([enviada.reserva.id]);
  });

});
