/* Campos, preferencias, filtros y etiquetas de los historiales del usuario.
 * Configuración fija; los datos escritos por usuarios se gestionan en services.
 */


export const camposDatosPersonales = [
  ['nombre','Nombre','text',30], ['apellido','Apellido','text',30],
  ['correo','Correo','email',100], ['telefono','Teléfono','tel',20],
  ['comuna','Comuna','text',60], ['foto','Foto (URL HTTPS o ruta /img/)','text',500]
];

export const preferenciasVacias = { notificaciones: {}, adopcion: {} };

export const opcionesPreferencias = [
  ['tipoAnimal','Tipo de animal',[['','Sin preferencia'],['perro','Perro'],['gato','Gato']]],
  ['tamano','Tamaño',[['','Sin preferencia'],['pequeno','Pequeño'],['mediano','Mediano'],['grande','Grande']]],
  ['vivienda','Tipo de vivienda',[['','Prefiero no indicar'],['casa','Casa'],['departamento','Departamento']]],
  ['experiencia','Experiencia cuidando animales',[['','Prefiero no indicar'],['primera','Sería mi primera adopción'],['experiencia','Ya he cuidado animales']]]
];

export const filtrosAdopciones = [['todas','Todas'],['pendientes','Pendientes',['pendiente']],['revision','En revisión',['revision']],['aprobadas','Aprobadas',['aprobada']],['rechazadas','Rechazadas',['rechazada']],['canceladas','Canceladas',['cancelada']]];

export const filtrosReservas = [['todas','Todas'],['confirmadas','Confirmadas',['confirmada','revision']],['cerradas','Cerradas',['cerrada']],['canceladas','Canceladas',['cancelada','rechazada']]];

export const filtrosConsultas = [['Todas','Todas'],['Pendientes','Pendientes',['Pendiente']],['En revisión','En revisión',['En revisión']],['Respondidas','Respondidas',['Respondida']],['Cerradas','Cerradas',['Cerrada']],['Canceladas','Canceladas',['Cancelada']]];

export const etiquetasSolicitud = { nombreAdoptante:'Nombre completo', edadAdoptante:'Edad', correoAdoptante:'Correo', telefonoAdoptante:'Teléfono', comunaAdoptante:'Comuna', tipoVivienda:'Vivienda', situacionVivienda:'Situación de vivienda', viveConPersonas:'Vive con otras personas', personasHogar:'Personas adicionales', acuerdoFamiliar:'Acuerdo familiar', otrosAnimales:'Otros animales', detalleAnimales:'Detalle de otros animales', experienciaAnimales:'Experiencia con animales', motivoAdopcion:'Motivo de adopción', cuidadosAnimal:'Cuidados diarios', aceptaCompromiso:'Compromiso aceptado' };
