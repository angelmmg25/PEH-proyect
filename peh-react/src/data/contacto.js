/* Preguntas frecuentes y configuración del formulario de contacto.
 * Configuración fija; los datos escritos por usuarios se gestionan en services.
 */


// El selector incluye «Otro»; los accesos rápidos usan solo los tres motivos principales.


export const preguntas = [
  [
    "¿Cómo inicio un proceso de adopción?",
    "Puedes ingresar a la sección de animales, seleccionar la mascota que te interese y revisar su perfil para comenzar el proceso de adopción."
  ],
  [
    "¿Cómo puedo reservar una atención veterinaria?",
    "Desde la sección Veterinaria puedes elegir el tipo de atención y completar el formulario de reserva disponible en la plataforma."
  ],
  [
    "Tengo un problema con PEH, ¿qué hago?",
    "Selecciona “Soporte general” en el formulario de contacto y descríbenos el problema con la mayor claridad posible."
  ],
  [
    "¿Puedo hacer una consulta que no aparezca aquí?",
    "Claro. Selecciona “Otro” como motivo de contacto y cuéntanos tu consulta mediante el formulario."
  ]
];
export const asuntosSugeridos = {adopcion:"Consulta sobre adopción",veterinaria:"Consulta veterinaria",soporte:"Consulta de soporte"};

export const contactoVacio = { nombre: "", correo: "", motivo: "", asunto: "", mensaje: "" };

export const camposContacto = ["nombre", "correo", "motivo", "asunto", "mensaje"];
