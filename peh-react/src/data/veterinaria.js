/* Servicios, consejos y configuración del formulario de reserva.
 * Configuración fija; los datos escritos por usuarios se gestionan en services.
 */


export const servicios = [
  {
    "id": "consulta",
    "nombre": "Consulta general",
    "descripcion": "Revisión del estado de salud y orientación veterinaria."
  },
  {
    "id": "vacunacion",
    "nombre": "Vacunación",
    "descripcion": "Aplicación de vacunas según edad y condición."
  },
  {
    "id": "desparasitacion",
    "nombre": "Desparasitación",
    "descripcion": "Control interno y externo para una mejor calidad de vida."
  },
  {
    "id": "esterilizacion",
    "nombre": "Esterilización",
    "descripcion": "Procedimiento seguro para ayudar a prevenir camadas no deseadas."
  },
  {
    "id": "control",
    "nombre": "Control post-adopción",
    "descripcion": "Seguimiento de salud para animales adoptados."
  }
];


export const consejos = {
        alimentacion: {
            titulo: "Alimentación adecuada",
            icono: "🥣",
            contenido: [
                "Una alimentación equilibrada debe adaptarse a la especie, edad, tamaño y estado de salud de tu mascota.",
                "Proporciona siempre agua fresca y mantén horarios regulares para sus comidas.",
                "Evita ofrecer alimentos que puedan resultar tóxicos para su especie.",
                "Consulta con un veterinario antes de realizar cambios importantes en su alimentación."
            ]
        },

        ejercicio: {
            titulo: "Ejercicio regular",
            icono: "🐾",
            contenido: [
                "La actividad física ayuda a mantener un peso saludable y favorece el bienestar emocional.",
                "Los perros necesitan paseos y actividades adaptadas a su edad, energía y condición física.",
                "Los gatos también necesitan jugar, explorar y disponer de espacios de estimulación.",
                "Evita actividades demasiado intensas durante temperaturas extremas."
            ]
        },

        controles: {
            titulo: "Visitas periódicas",
            icono: "🩺",
            contenido: [
                "Los controles veterinarios permiten detectar problemas de salud de manera temprana.",
                "Mantén al día las vacunas y los tratamientos antiparasitarios indicados por el profesional.",
                "Presta atención a cambios en el apetito, comportamiento o nivel de actividad.",
                "Ante dificultades respiratorias, convulsiones u otros signos graves, busca atención veterinaria urgente."
            ]
        }
    };

export const camposReserva = ["responsableNombre","responsableCorreo","responsableTelefono","responsableComuna","servicio","mascota","mascotaNombre","fecha","hora","observaciones"];

export const reservaVacia = Object.freeze(Object.fromEntries(camposReserva.map(c=>[c, ""])));

export const nombresCampoReserva = {responsableNombreReserva:"responsableNombre",responsableCorreoReserva:"responsableCorreo",responsableTelefonoReserva:"responsableTelefono",responsableComunaReserva:"responsableComuna",servicioReserva:"servicio",mascotaReserva:"mascota",nombreMascotaReserva:"mascotaNombre",fechaReserva:"fecha",horaReserva:"hora",observacionesReserva:"observaciones"};
