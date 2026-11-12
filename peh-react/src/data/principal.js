/* Contenido y filtros iniciales exclusivos de Inicio.
 * Configuración fija; los datos escritos por usuarios se gestionan en services.
 */


// Contenido exclusivo del carrusel de Inicio.
export const diapositivas = [
 { etiqueta: "Patitas Esperando un Hogar", titulo: "Encuentra a quien", destacado: "estaba esperando por ti.", texto: "Conoce animales que buscan una nueva oportunidad y descubre quién podría convertirse en tu próximo compañero.", boton: "Conocerlos", enlace: "#animales", imagen: "/img/Loign.jpg", flecha: "↓" },
 { etiqueta: "Comunidad", titulo: "Únete a nuestra comunidad.", destacado: "", texto: "Comparte historias, consejos y avisos para ayudar a los animales de tu comunidad.", frase: "Juntos ayudamos a más patitas.", boton: "Comunidad", enlace: "#comunidad", imagen: "/img/comunidad.jpeg", flecha: "→" },
 { etiqueta: "Veterinaria", titulo: "Recuerda cuidar de su salud.", destacado: "", texto: "Acompaña su bienestar con atención veterinaria y cuidados en cada etapa de su vida.", frase: "Reserva una hora en veterinaria.", boton: "Veterinaria", enlace: "#veterinaria", imagen: "/img/veterinaria.jpg", flecha: "→" },
 { etiqueta: "Contacto", titulo: "Comunícate con nosotros.", destacado: "", texto: "Resuelve tus dudas, comparte sugerencias o cuéntanos si algo no funciona como esperabas.", frase: "Tu mensaje nos ayuda a mejorar.", boton: "Contacto", enlace: "#contacto", imagen: "/img/contacto.jpg", flecha: "→" },
];

export const filtrosIniciales = Object.freeze({especie:"todos", comuna:"todas", tamano:"todos", hogar:"todos", convivencia:"todos", sexo:"todos", edad:"todas"});
