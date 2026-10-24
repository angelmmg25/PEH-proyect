import PEH from "./peh.js";

// Validaciones adicionales del animal.js original. Las reglas HTML de campos
// obligatorios, tipo de correo y edad mínima se conservan en el formulario.
export function validarSolicitud(datos) {
 const obtener = campo => String(datos[campo] || "").trim();
 if(obtener("nombreAdoptante").length < 3) return "Ingresa tu nombre completo.";
 if(!PEH.validar.correo(obtener("correoAdoptante"))) return "Ingresa un correo electrónico válido.";
 const edad = Number(obtener("edadAdoptante"));
 if(!Number.isInteger(edad) || edad < 18) return "Debes tener al menos 18 años para realizar una solicitud.";
 if(obtener("telefonoAdoptante").replace(/\D/g, "").length < 9) return "Ingresa un teléfono válido.";
 if(obtener("comunaAdoptante").length < 2) return "Ingresa una comuna válida.";
 if(obtener("motivoAdopcion").length < 20) return "Cuéntanos un poco más sobre por qué deseas adoptar. Escribe al menos 20 caracteres.";
 if(obtener("cuidadosAnimal").length < 20) return "Describe cómo cuidarías a tu mascota. Escribe al menos 20 caracteres.";
 return "";
}
export function solicitudActiva(animalId) {
 return PEH.adopciones.listar().find(s => s.animalId === animalId && ["pendiente","en revisión","en revision","aprobada"].includes(String(s.estado || "").toLowerCase().trim()));
}
export function enviarSolicitud(animal,datos) {
 const usuario = PEH.sesion.obtener();
 if(!usuario?.id || usuario.invitado) return {ok:false,mensaje:"Debes iniciar sesión para enviar una solicitud de adopción."};
 const vigente = PEH.catalogo.obtener(animal.id);
 if(!vigente || vigente.estadoPerfil !== "disponible") return {ok:false,mensaje:"Este animal ya no está disponible para una nueva solicitud de adopción."};
 const error = validarSolicitud(datos);
 if(error) return {ok:false,mensaje:error};
 if(solicitudActiva(animal.slug)) return {ok:false,mensaje:"Ya tienes una solicitud activa para adoptar a " + animal.nombre + ".\n\nPuedes consultar su estado en tu perfil."};
 const campos=["nombreAdoptante","correoAdoptante","telefonoAdoptante","comunaAdoptante","tipoVivienda","situacionVivienda","personasHogar","acuerdoFamiliar","otrosAnimales","detalleAnimales","experienciaAnimales","motivoAdopcion","cuidadosAnimal"];
 const limpios=Object.fromEntries(campos.map(campo=>[campo,String(datos[campo] || "").trim()]));
 const solicitud=PEH.adopciones.guardar({...limpios, usuarioId:usuario.id, animalId:animal.slug, animalNombre:animal.nombre, animalImagen:animal.imagen, edadAdoptante:Number(datos.edadAdoptante), aceptaCompromiso:datos.aceptaCompromiso===true, estado:"Pendiente"});
 return solicitud ? {ok:true,solicitud} : {ok:false,mensaje:"No fue posible guardar tu solicitud. Inténtalo nuevamente."};
}
