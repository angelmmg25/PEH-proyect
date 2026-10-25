import PEH from "./peh.js";

import { correoValido, errorTelefono, errorComuna, normalizarTelefono, errorNombrePersona } from "./datosCuenta.js";

export function datosInicialesAdopcion(ahora = new Date()) {
 const sesion = PEH.sesion.obtener();
 if (!sesion?.id || sesion.invitado) return {};
 const cuenta = PEH.cuentas.obtenerPorId(sesion.id) || {};
 const perfil = PEH.perfil.obtener();
 const nombreCuenta = [cuenta.nombre, cuenta.apellido].filter(Boolean).join(" ");
 const nombre = perfil.nombre && perfil.nombre !== cuenta.nombre ? perfil.nombre : nombreCuenta;
 const fecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(cuenta.fechaNacimiento || "");
 let edad = "";
 if (fecha) {
  const [, a, m, d] = fecha.map(Number), nacimiento = new Date(a, m - 1, d);
  if (nacimiento.getFullYear() === a && nacimiento.getMonth() === m - 1 && nacimiento.getDate() === d && nacimiento <= ahora) {
   edad = ahora.getFullYear() - a - (ahora.getMonth() < m - 1 || (ahora.getMonth() === m - 1 && ahora.getDate() < d) ? 1 : 0);
  }
 }
 return {nombreAdoptante:nombre || "", correoAdoptante:perfil.correo || cuenta.correo || "", telefonoAdoptante:perfil.telefono ?? cuenta.telefono ?? "", comunaAdoptante:perfil.comuna ?? cuenta.comuna ?? "", edadAdoptante:edad === "" ? "" : String(edad)};
}
export function limpiarCondicionales(datos) {
 const limpios = {...datos};
 if (limpios.viveConPersonas === "no") { limpios.personasHogar = ""; limpios.acuerdoFamiliar = ""; }
 if (limpios.otrosAnimales === "no") limpios.detalleAnimales = "";
 return limpios;
}
export function erroresSolicitud(datos) {
 const e = {}, texto = c => String(datos[c] ?? "").trim();
 if (texto("nombreAdoptante").length < 3 || errorNombrePersona(texto("nombreAdoptante"))) e.nombreAdoptante = "Ingresa tu nombre completo, entre 3 y 60 caracteres.";
 if (!correoValido(texto("correoAdoptante"))) e.correoAdoptante = "Ingresa un correo válido con terminación .com o .cl.";
 const edad = Number(texto("edadAdoptante"));
 if (!Number.isInteger(edad) || edad < 18 || edad > 120) e.edadAdoptante = "Ingresa una edad entre 18 y 120 años.";
 if (!texto("telefonoAdoptante")) e.telefonoAdoptante = "Escribe tu número de teléfono.";
 else if (errorTelefono(texto("telefonoAdoptante"))) e.telefonoAdoptante = errorTelefono(texto("telefonoAdoptante"));
 if (!texto("comunaAdoptante")) e.comunaAdoptante = "Escribe la comuna donde vives.";
 else if (errorComuna(texto("comunaAdoptante"))) e.comunaAdoptante = errorComuna(texto("comunaAdoptante"));
 if (!["casa","departamento","parcela","otro"].includes(datos.tipoVivienda)) e.tipoVivienda = "Selecciona una opción: casa, departamento, parcela u otro.";
 if (!["propia","arrendada","familiar"].includes(datos.situacionVivienda)) e.situacionVivienda = "Selecciona una opción: propia, arrendada o familiar.";
 if (!["si","no"].includes(datos.viveConPersonas)) e.viveConPersonas = "Selecciona Sí o No para indicar si vives con otras personas.";
 if (datos.viveConPersonas !== "no") {
  if (!/^(?:[1-9]|10)$/.test(texto("personasHogar"))) e.personasHogar = "Selecciona entre 1 y 10 personas adicionales.";
  if (!["si","no"].includes(datos.acuerdoFamiliar)) e.acuerdoFamiliar = "Selecciona Sí o No para indicar si todos están de acuerdo con la adopción.";
 }
 if (!["si","no"].includes(datos.otrosAnimales)) e.otrosAnimales = "Selecciona Sí o No para indicar si tienes otros animales.";
 if (datos.otrosAnimales !== "no" && (texto("detalleAnimales").length < 10 || texto("detalleAnimales").length > 1000)) e.detalleAnimales = "Describe a tus animales, entre 10 y 1000 caracteres.";
 if (!["si","no"].includes(datos.experienciaAnimales)) e.experienciaAnimales = "Selecciona Sí o No para indicar si has cuidado animales anteriormente.";
 for (const campo of ["motivoAdopcion","cuidadosAnimal"]) {
  if (!texto(campo)) e[campo] = campo === "motivoAdopcion" ? "Escribe por qué quieres adoptar a este animal." : "Describe cómo organizarías sus cuidados diarios.";
  else if (texto(campo).length < 20 || texto(campo).length > 2000) e[campo] = "Escribe una descripción entre 20 y 2000 caracteres.";
 }
 if (datos.aceptaCompromiso !== true) e.aceptaCompromiso = "Debes aceptar el compromiso de adopción.";
 return e;
}
export function validarSolicitud(datos) { return Object.values(erroresSolicitud(datos))[0] || ""; }
export function solicitudActiva(animalId) {
 return PEH.adopciones.listar().find(s => s.animalId === animalId && ["pendiente","en revisión","en revision","aprobada"].includes(String(s.estado || "").toLowerCase().trim()));
}
export function enviarSolicitud(animal,datos) {
 const usuario = PEH.sesion.obtener();
 if(!usuario?.id || usuario.invitado) return {ok:false,mensaje:"Debes iniciar sesión para enviar una solicitud de adopción."};
 if (!animal?.id) return {ok:false,mensaje:"No se pudo identificar el animal."};
 const vigente = PEH.catalogo.obtener(animal.id);
 if(!vigente || vigente.estadoPerfil !== "disponible") return {ok:false,mensaje:"Este animal ya no está disponible para una nueva solicitud de adopción."};
 const error = validarSolicitud(datos);
 if(error) return {ok:false,mensaje:error};
 if(solicitudActiva(animal.slug)) return {ok:false,mensaje:"Ya tienes una solicitud activa para adoptar a " + animal.nombre + ".\n\nPuedes consultar su estado en tu perfil."};
 const campos=["nombreAdoptante","correoAdoptante","telefonoAdoptante","comunaAdoptante","tipoVivienda","situacionVivienda","viveConPersonas","personasHogar","acuerdoFamiliar","otrosAnimales","detalleAnimales","experienciaAnimales","motivoAdopcion","cuidadosAnimal"];
 const condicionales = limpiarCondicionales(datos);
 const limpios=Object.fromEntries(campos.map(campo=>[campo,String(condicionales[campo] || "").trim()]));
 limpios.telefonoAdoptante = normalizarTelefono(limpios.telefonoAdoptante);
 limpios.correoAdoptante = limpios.correoAdoptante.toLowerCase();
 const solicitud=PEH.adopciones.guardar({...limpios, usuarioId:usuario.id, animalId:animal.slug, animalNombre:animal.nombre, animalImagen:animal.imagen, edadAdoptante:Number(datos.edadAdoptante), aceptaCompromiso:datos.aceptaCompromiso===true, estado:"Pendiente"});
 return solicitud ? {ok:true,solicitud} : {ok:false,mensaje:"No fue posible guardar tu solicitud. Inténtalo nuevamente."};
}
