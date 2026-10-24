export const categorias = {"adopcion": "Historia de adopción", "consejos": "Consejos y cuidados", "preguntas": "Preguntas de la comunidad", "difusion": "Ayuda y difusión", "perdidos": "Animales perdidos", "encontrados": "Animales encontrados", "jornadas": "Jornadas y actividades"};
export const publicacionesDemo = [
  {
    "id": "peh-demo-0",
    "demo": true,
    "autor": "Sofía Ramírez",
    "avatar": "👩",
    "categoria": "adopcion",
    "textoBusqueda": "luna adopcion gata historia familia",
    "tiempo": "hace 2 horas",
    "titulo": "",
    "parrafos": [
      "Hoy quiero compartirles que Luna ya lleva 2 meses con nosotros. 🧡 Cuando la adoptamos era muy tímida, pero ahora no se despega de nosotros. ¡Gracias PEH por ayudarnos a encontrarla! 🐾"
    ],
    "contenido": "Hoy quiero compartirles que Luna ya lleva 2 meses con nosotros. 🧡 Cuando la adoptamos era muy tímida, pero ahora no se despega de nosotros. ¡Gracias PEH por ayudarnos a encontrarla! 🐾",
    "imagenesEjemplo": [
      "🐱",
      "😺"
    ],
    "comentarios": [
      {
        "id": "peh-demo-0-comentario-0",
        "publicacionId": "peh-demo-0",
        "autor": "Valentina:",
        "texto": "¡Qué hermosa Luna! Me alegra mucho que haya encontrado familia. 🧡",
        "respuestaA": null
      }
    ],
    "imagen": null
  },
  {
    "id": "peh-demo-1",
    "demo": true,
    "autor": "Matías León",
    "avatar": "👨",
    "categoria": "consejos",
    "textoBusqueda": "gato nuevo hogar consejos preparar adaptacion",
    "tiempo": "hace 5 horas",
    "titulo": "¿Cómo preparar el hogar para un nuevo gato?",
    "parrafos": [
      "Hola a todos. Estoy pensando en adoptar un gatito y me gustaría saber qué cosas son esenciales para que se sienta cómodo desde el primer día.",
      "¡Cualquier consejo es bienvenido! 🐱"
    ],
    "contenido": "Hola a todos. Estoy pensando en adoptar un gatito y me gustaría saber qué cosas son esenciales para que se sienta cómodo desde el primer día.\n\n¡Cualquier consejo es bienvenido! 🐱",
    "imagenesEjemplo": [],
    "comentarios": [
      {
        "id": "peh-demo-1-comentario-0",
        "publicacionId": "peh-demo-1",
        "autor": "Daniela:",
        "texto": "Dale un espacio tranquilo durante los primeros días y deja que explore a su ritmo.",
        "respuestaA": null
      }
    ],
    "imagen": null
  },
  {
    "id": "peh-demo-2",
    "demo": true,
    "autor": "Camila Torres",
    "avatar": "👩",
    "categoria": "difusion",
    "textoBusqueda": "max perro busca hogar adopcion difusion familia",
    "tiempo": "hace 1 día",
    "titulo": "Max busca un hogar",
    "parrafos": [
      "Este perrito fue encontrado cerca de mi casa. Es muy cariñoso y está en busca de una familia responsable. Si alguien está interesado o puede compartir esta publicación, ¡se los agradecería mucho! 🧡"
    ],
    "contenido": "Este perrito fue encontrado cerca de mi casa. Es muy cariñoso y está en busca de una familia responsable. Si alguien está interesado o puede compartir esta publicación, ¡se los agradecería mucho! 🧡",
    "imagenesEjemplo": [
      "🐶",
      "🐕"
    ],
    "comentarios": [
      {
        "id": "peh-demo-2-comentario-0",
        "publicacionId": "peh-demo-2",
        "autor": "Francisca:",
        "texto": "Compartido. Ojalá Max encuentre una familia pronto. 🐾",
        "respuestaA": null
      }
    ],
    "imagen": null
  },
  {
    "id": "peh-demo-3",
    "demo": true,
    "autor": "Javier Morales",
    "avatar": "👨",
    "categoria": "preguntas",
    "textoBusqueda": "perro rescatado desconfiado miedo adaptacion pregunta",
    "tiempo": "hace 2 días",
    "titulo": "¿Es normal que un perro rescatado sea desconfiado al inicio?",
    "parrafos": [
      "Adoptamos hace poco y aún le cuesta acercarse a nosotros. Queremos darle su tiempo, pero nos gustaría saber si este comportamiento es habitual y qué podemos hacer para ayudarlo. ¡Gracias! 😊"
    ],
    "contenido": "Adoptamos hace poco y aún le cuesta acercarse a nosotros. Queremos darle su tiempo, pero nos gustaría saber si este comportamiento es habitual y qué podemos hacer para ayudarlo. ¡Gracias! 😊",
    "imagenesEjemplo": [],
    "comentarios": [
      {
        "id": "peh-demo-3-comentario-0",
        "publicacionId": "peh-demo-3",
        "autor": "Paula:",
        "texto": "Sí, algunos necesitan bastante tiempo para sentirse seguros. Mucha paciencia. 🧡",
        "respuestaA": null
      }
    ],
    "imagen": null
  }
];
export function categoriaValida(valor) {
 return valor === "actividades" ? "jornadas" : Object.hasOwn(categorias,valor) ? valor : "todas";
}
export function normalizarTexto(texto) {
 return String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
}
export function textoBusquedaPublicacion(p) {
 return p.demo ? p.textoBusqueda : normalizarTexto(`${p.contenido} ${p.ubicacion || ""} ${categorias[p.categoria] || "Comunidad"}`);
}
export function coincidePublicacion(p,categoria,busqueda) {
 return (categoria === "todas" || p.categoria === categoria) && normalizarTexto(textoBusquedaPublicacion(p)).includes(normalizarTexto(busqueda));
}
