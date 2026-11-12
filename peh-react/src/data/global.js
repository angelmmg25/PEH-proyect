/* Datos compartidos: catálogo de ejemplo, categorías, motivos, horarios y navegación.
 * Configuración fija; los datos escritos por usuarios se gestionan en services.
 */


export const animales = [
  {
    "id": 1,
    "slug": "milo",
    "nombre": "Milo",
    "especie": "perro",
    "sexo": "macho",
    "edad": 2,
    "tamano": "mediano",
    "comuna": "Macul",
    "comunaValor": "macul",
    "personalidad": [
      "Cariñoso",
      "Juguetón",
      "Sociable"
    ],
    "hogar": [
      "casa",
      "departamento"
    ],
    "convivencia": [
      "ninos",
      "perros"
    ],
    "imagen": "/img/animales/milo.webp",
    "diasEsperando": 74,
    "historia": [
      "Milo disfruta explorar y compartir paseos en compañía. Busca una familia que lo incluya en sus actividades diarias.",
      "Los juegos y una rutina de paseos son su forma favorita de pasar tiempo contigo."
    ],
    "cuidados": "Rutina de paseos y actividad adaptada a su edad."
  },
  {
    "id": 2,
    "slug": "luna",
    "nombre": "Luna",
    "especie": "gato",
    "sexo": "hembra",
    "edad": 1,
    "tamano": "pequeno",
    "comuna": "Ñuñoa",
    "comunaValor": "nunoa",
    "personalidad": [
      "Curiosa",
      "Tranquila",
      "Independiente"
    ],
    "hogar": [
      "departamento",
      "casa"
    ],
    "convivencia": [
      "gatos"
    ],
    "imagen": "/img/animales/luna.jpg",
    "diasEsperando": 42,
    "historia": [
      "Luna prefiere observar antes de acercarse. Un ambiente tranquilo le permite mostrar su lado curioso y cariñoso.",
      "Disfruta descansar junto a una ventana y explorar a su propio ritmo."
    ],
    "cuidados": "Hogar protegido, ventanas con malla y enriquecimiento ambiental."
  },
  {
    "id": 3,
    "slug": "benito",
    "nombre": "Benito",
    "especie": "perro",
    "sexo": "macho",
    "edad": 4,
    "tamano": "grande",
    "comuna": "La Florida",
    "comunaValor": "la-florida",
    "personalidad": [
      "Regalón",
      "Noble",
      "Sociable"
    ],
    "hogar": [
      "casa",
      "espacio-amplio"
    ],
    "convivencia": [
      "ninos",
      "perros"
    ],
    "imagen": "/img/animales/benito.webp",
    "diasEsperando": 183,
    "historia": [
      "Benito tiene una presencia imponente y un carácter regalón. Busca un hogar con espacio y compañía.",
      "Disfruta los paseos tranquilos y compartir momentos con su familia."
    ],
    "cuidados": "Rutina de paseos y actividad adaptada a su edad."
  },
  {
    "id": 4,
    "slug": "simba",
    "nombre": "Simba",
    "especie": "gato",
    "sexo": "macho",
    "edad": 3,
    "tamano": "mediano",
    "comuna": "Puente Alto",
    "comunaValor": "puente-alto",
    "personalidad": [
      "Juguetón",
      "Cariñoso",
      "Curioso"
    ],
    "hogar": [
      "departamento",
      "casa"
    ],
    "convivencia": [
      "gatos",
      "ninos"
    ],
    "imagen": "/img/animales/simba.jpg",
    "diasEsperando": 91,
    "historia": [
      "Simba es un explorador curioso al que le encantan los juegos. Busca un hogar donde pueda entretenerse con seguridad.",
      "Los juguetes y los lugares altos para observar lo ayudan a mantenerse activo."
    ],
    "cuidados": "Hogar protegido, ventanas con malla y enriquecimiento ambiental."
  },
  {
    "id": 5,
    "slug": "nala",
    "nombre": "Nala",
    "especie": "perro",
    "sexo": "hembra",
    "edad": 5,
    "tamano": "mediano",
    "comuna": "Peñalolén",
    "comunaValor": "penalolen",
    "personalidad": [
      "Tranquila",
      "Noble",
      "Compañera"
    ],
    "hogar": [
      "casa",
      "departamento"
    ],
    "convivencia": [
      "ninos",
      "gatos"
    ],
    "imagen": "/img/animales/nala.jpg",
    "diasEsperando": 226,
    "historia": [
      "Nala disfruta de la compañía y de las rutinas tranquilas. Busca una familia con la que compartir el día a día.",
      "Le gustan los paseos pausados y descansar cerca de quienes la cuidan."
    ],
    "cuidados": "Rutina de paseos y actividad adaptada a su edad."
  },
  {
    "id": 6,
    "slug": "tomy",
    "nombre": "Tomy",
    "especie": "gato",
    "sexo": "macho",
    "edad": 2,
    "tamano": "mediano",
    "comuna": "San Miguel",
    "comunaValor": "san-miguel",
    "personalidad": [
      "Regalón",
      "Observador",
      "Independiente"
    ],
    "hogar": [
      "departamento",
      "casa"
    ],
    "convivencia": [
      "gatos"
    ],
    "imagen": "/img/animales/tomy.jpg",
    "diasEsperando": 58,
    "historia": [
      "Tomy observa todo lo que pasa a su alrededor. Necesita tiempo para conocer su nuevo hogar y ganar confianza.",
      "Una vez cómodo, disfruta las caricias y los rincones acogedores."
    ],
    "cuidados": "Hogar protegido, ventanas con malla y enriquecimiento ambiental."
  },
  {
    "id": 7,
    "slug": "kira",
    "nombre": "Kira",
    "especie": "gato",
    "sexo": "hembra",
    "edad": 8,
    "tamano": "pequeno",
    "comuna": "Macul",
    "comunaValor": "macul",
    "personalidad": [
      "Tranquila",
      "Dulce",
      "Dormilona"
    ],
    "hogar": [
      "departamento",
      "casa"
    ],
    "convivencia": [
      "gatos"
    ],
    "imagen": "/img/animales/kira.jpg",
    "diasEsperando": 318,
    "historia": [
      "Kira busca un hogar sereno para disfrutar de su etapa adulta. Es una compañera dulce que valora el descanso.",
      "Prefiere los juegos suaves y las caricias respetando sus tiempos."
    ],
    "cuidados": "Hogar protegido, ventanas con malla y enriquecimiento ambiental."
  },
  {
    "id": 8,
    "slug": "rocky",
    "nombre": "Rocky",
    "especie": "perro",
    "sexo": "macho",
    "edad": 7,
    "tamano": "grande",
    "comuna": "San Miguel",
    "comunaValor": "san-miguel",
    "personalidad": [
      "Leal",
      "Tranquilo",
      "Compañero"
    ],
    "hogar": [
      "casa",
      "espacio-amplio"
    ],
    "convivencia": [
      "ninos"
    ],
    "imagen": "/img/animales/rocky.jpg",
    "diasEsperando": 284,
    "historia": [
      "Rocky es un compañero leal y tranquilo. Busca un hogar con espacio y una familia que disfrute acompañarlo.",
      "Le gustan los paseos sin apuro y tener un lugar cómodo para descansar."
    ],
    "cuidados": "Rutina de paseos y actividad adaptada a su edad."
  },
  {
    "id": 9,
    "slug": "mia",
    "nombre": "Mía",
    "especie": "gato",
    "sexo": "hembra",
    "edad": 6,
    "tamano": "mediano",
    "comuna": "Peñalolén",
    "comunaValor": "penalolen",
    "personalidad": [
      "Cariñosa",
      "Serena",
      "Curiosa"
    ],
    "hogar": [
      "departamento",
      "casa"
    ],
    "convivencia": [
      "gatos",
      "ninos"
    ],
    "imagen": "/img/animales/mia.jpg",
    "diasEsperando": 251,
    "historia": [
      "Mía tiene una personalidad serena y curiosa. Busca una familia que le dé tiempo y cariño para adaptarse.",
      "Disfruta observar su entorno y compartir juegos suaves."
    ],
    "cuidados": "Hogar protegido, ventanas con malla y enriquecimiento ambiental."
  },
  {
    "id": 10,
    "slug": "coco",
    "nombre": "Coco",
    "especie": "perro",
    "sexo": "macho",
    "edad": 9,
    "tamano": "pequeno",
    "comuna": "La Florida",
    "comunaValor": "la-florida",
    "personalidad": [
      "Regalón",
      "Calmado",
      "Apegado"
    ],
    "hogar": [
      "departamento",
      "casa"
    ],
    "convivencia": [
      "ninos"
    ],
    "imagen": "/img/animales/coco.avif",
    "diasEsperando": 347,
    "historia": [
      "Coco busca compañía y una rutina tranquila. Su tamaño pequeño no le impide disfrutar de los paseos y las atenciones.",
      "Un hogar donde pueda descansar y sentirse acompañado será ideal para él."
    ],
    "cuidados": "Rutina de paseos y actividad adaptada a su edad."
  },
  {
    "id": 11,
    "slug": "copito",
    "nombre": "Copito",
    "especie": "gato",
    "sexo": "macho",
    "edad": 5,
    "tamano": "grande",
    "comuna": "San Miguel",
    "comunaValor": "san-miguel",
    "personalidad": [
      "Regalón",
      "Tranquilo",
      "Dormilón"
    ],
    "hogar": [
      "departamento",
      "casa"
    ],
    "convivencia": [
      "gatos"
    ],
    "imagen": "/img/animales/copito.jpg",
    "diasEsperando": 165,
    "historia": [
      "Copito es un gatito gordito, regalón y amante de las siestas. Busca una familia que disfrute de su compañía tranquila.",
      "Le gustan las caricias y los lugares cómodos. Necesita juego diario y porciones indicadas por un veterinario para cuidar su peso."
    ],
    "cuidados": "Control veterinario de peso y alimentación; juego suave diario."
  }
];

export const categorias = {"adopcion": "Historia de adopción", "consejos": "Consejos y cuidados", "preguntas": "Preguntas de la comunidad", "difusion": "Ayuda y difusión", "perdidos": "Animales perdidos", "encontrados": "Animales encontrados", "jornadas": "Jornadas y actividades"};

export const motivos = {
  "adopcion": {
    "nombre": "Adopciones",
    "descripcion": "Dudas sobre solicitudes, requisitos o el proceso de adopción."
  },
  "veterinaria": {
    "nombre": "Veterinaria",
    "descripcion": "Consultas relacionadas con reservas o atención veterinaria."
  },
  "soporte": {
    "nombre": "Soporte general",
    "descripcion": "Problemas con tu cuenta, publicaciones o funcionamiento de PEH."
  }
};

export const nombresMotivos = {
  ...Object.fromEntries(Object.entries(motivos).map(([id, motivo]) => [id, motivo.nombre])),
  otro: "Otro"
};

export const horarios = ["09:00", "10:30", "12:00", "15:00", "16:30", "18:00"];

export const enlacesNavegacion = [["inicio", "Inicio"], ["animales", "Animales"], ["comunidad", "Comunidad"], ["veterinaria", "Veterinaria"], ["perfil", "Perfil"], ["contacto", "Contacto"]];

export const mensajesAcceso = {
  perfil: 'Accede a tu cuenta para ver tu perfil.',
  comunidad: 'Accede a tu cuenta para ingresar a la comunidad.',
  veterinaria: 'Accede a tu cuenta para ingresar a Veterinaria.',
  contacto: 'Accede a tu cuenta para contactarnos.',
  desarrollador: 'Accede a tu cuenta para ingresar a Administración.'
};

export const frasesPiePagina = {
  inicio: ['Ellos esperan por ti, ', 'conócelos.'],
  animales: ['Ellos esperan por ti, ', 'conócelos.'],
  comunidad: ['Más que una plataforma, ', 'una comunidad.'],
  veterinaria: ['Su salud también es importante. ', 'Cuídalos bien.'],
  animal: ['Él podría ser ', 'tu próximo amigo.'],
  contacto: ['Escríbenos, ', 'estamos para ayudarte.'],
  perfil: ['Cuida bien de ', 'tu nuevo amigo.']
};
