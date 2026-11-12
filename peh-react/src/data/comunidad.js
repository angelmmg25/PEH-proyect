/* Filtros, opciones de publicación y publicaciones de ejemplo.
 * Configuración fija; los datos escritos por usuarios se gestionan en services.
 */
import {categorias} from './global.js';

// Presentación propia de los filtros y del formulario; conserva sus textos y orden.
export const filtrosComunidad = [
  [
    "todas",
    "⌂",
    "Todas",
    "las publicaciones"
  ],
  [
    "adopcion",
    "♥",
    "Historias",
    "de adopción"
  ],
  [
    "consejos",
    "💡",
    "Consejos",
    "y cuidados"
  ],
  [
    "preguntas",
    "●●●",
    "Preguntas",
    "de la comunidad"
  ],
  [
    "difusion",
    "📣",
    "Ayuda",
    "y difusión"
  ],
  [
    "perdidos",
    "⌕",
    "Animales perdidos",
    null
  ],
  [
    "encontrados",
    "🐾",
    "Animales encontrados",
    null
  ],
  [
    "jornadas",
    "📅",
    "Jornadas y actividades",
    null
  ]
];

export const categoriasPublicacion = ["adopcion","consejos","preguntas","perdidos","encontrados","jornadas","difusion"].map(id => [id, id === "preguntas" ? "Pregunta a la comunidad" : categorias[id]]);

// Seis ejemplos: dos por categoría, independientes de las cuentas registradas.
export const publicacionesDemo = [
  {
    "id": "peh-ejemplo-001",
    "demo": true,
    "usuarioId": "PEH-EJEMPLO-AUTOR-1",
    "autor": "Sofía Ramírez",
    "categoria": "adopcion",
    "contenido": "Luna ya lleva dos meses con nosotros. Al principio buscaba un rincón tranquilo y ahora se acerca para acompañarnos cada tarde. Respetar su ritmo hizo toda la diferencia. ¡Gracias por ayudarnos a encontrarnos!",
    "ubicacion": "Macul",
    "imagen": null,
    "fechaCreacion": "2026-11-01T15:00:00.000Z",
    "textoBusqueda": "Luna ya lleva dos meses con nosotros. Al principio buscaba un rincón tranquilo y ahora se acerca para acompañarnos cada tarde. Respetar su ritmo hizo toda la diferencia. ¡Gracias por ayudarnos a encontrarnos! Macul adopcion",
    "comentarios": []
  },
  {
    "id": "peh-ejemplo-002",
    "demo": true,
    "usuarioId": "PEH-EJEMPLO-AUTOR-2",
    "autor": "Matías León",
    "categoria": "consejos",
    "contenido": "Preparamos un rincón tranquilo para la llegada de nuestro gato: agua, alimento y un lugar donde esconderse. Le dejamos explorar a su ritmo y ha ido ganando confianza. ¿Qué les ayudó durante los primeros días?",
    "ubicacion": "Ñuñoa",
    "imagen": null,
    "fechaCreacion": "2026-11-02T15:00:00.000Z",
    "textoBusqueda": "Preparamos un rincón tranquilo para la llegada de nuestro gato: agua, alimento y un lugar donde esconderse. Le dejamos explorar a su ritmo y ha ido ganando confianza. ¿Qué les ayudó durante los primeros días? Ñuñoa consejos",
    "comentarios": []
  },
  {
    "id": "peh-ejemplo-003",
    "demo": true,
    "usuarioId": "PEH-EJEMPLO-AUTOR-3",
    "autor": "Camila Torres",
    "categoria": "preguntas",
    "contenido": "Estamos preparando la llegada de una perrita adoptada y queremos organizar bien la primera semana. ¿Cómo hicieron ustedes para presentarle su nuevo hogar sin agobiarla? Nos gustaría conocer sus experiencias.",
    "ubicacion": "La Florida",
    "imagen": null,
    "fechaCreacion": "2026-11-03T15:00:00.000Z",
    "textoBusqueda": "Estamos preparando la llegada de una perrita adoptada y queremos organizar bien la primera semana. ¿Cómo hicieron ustedes para presentarle su nuevo hogar sin agobiarla? Nos gustaría conocer sus experiencias. La Florida preguntas",
    "comentarios": []
  },
  {
    "id": "peh-ejemplo-004",
    "demo": true,
    "usuarioId": "PEH-EJEMPLO-AUTOR-4",
    "autor": "Diego Fuentes",
    "categoria": "adopcion",
    "contenido": "Hace un mes adoptamos a Bruno. Empezamos con paseos cortos y una rutina tranquila; hoy ya reconoce su cama y nos recibe moviendo la cola. Todavía seguimos aprendiendo juntos, pero estamos felices de darle un hogar.",
    "ubicacion": "Puente Alto",
    "imagen": null,
    "fechaCreacion": "2026-11-04T15:00:00.000Z",
    "textoBusqueda": "Hace un mes adoptamos a Bruno. Empezamos con paseos cortos y una rutina tranquila; hoy ya reconoce su cama y nos recibe moviendo la cola. Todavía seguimos aprendiendo juntos, pero estamos felices de darle un hogar. Puente Alto adopcion",
    "comentarios": []
  },
  {
    "id": "peh-ejemplo-005",
    "demo": true,
    "usuarioId": "PEH-EJEMPLO-AUTOR-5",
    "autor": "Valentina Soto",
    "categoria": "consejos",
    "contenido": "Nos sirvió acordar en familia quién se ocupa de los paseos, la limpieza y las visitas veterinarias antes de adoptar. Tener una rutina compartida nos ayuda a cuidar mejor a nuestra mascota y a no olvidar sus necesidades.",
    "ubicacion": "San Miguel",
    "imagen": null,
    "fechaCreacion": "2026-11-05T15:00:00.000Z",
    "textoBusqueda": "Nos sirvió acordar en familia quién se ocupa de los paseos, la limpieza y las visitas veterinarias antes de adoptar. Tener una rutina compartida nos ayuda a cuidar mejor a nuestra mascota y a no olvidar sus necesidades. San Miguel consejos",
    "comentarios": []
  },
  {
    "id": "peh-ejemplo-006",
    "demo": true,
    "usuarioId": "PEH-EJEMPLO-AUTOR-6",
    "autor": "Javier Morales",
    "categoria": "preguntas",
    "contenido": "Nuestro gato disfruta mucho jugar con cajas y juguetes sencillos. Queremos sumar actividades dentro de casa y nos gustaría saber cuáles prefieren los suyos. ¿Tienen alguna idea que les haya funcionado?",
    "ubicacion": "Peñalolén",
    "imagen": null,
    "fechaCreacion": "2026-11-06T15:00:00.000Z",
    "textoBusqueda": "Nuestro gato disfruta mucho jugar con cajas y juguetes sencillos. Queremos sumar actividades dentro de casa y nos gustaría saber cuáles prefieren los suyos. ¿Tienen alguna idea que les haya funcionado? Peñalolén preguntas",
    "comentarios": []
  }
];
