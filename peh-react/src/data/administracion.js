/* Secciones, valores iniciales y etiquetas de gestión administrativa.
 * Configuración fija; los datos escritos por usuarios se gestionan en services.
 */


export const seccionesAdministracion = [['animales','Animales'],['usuarios','Usuarios'],['adopciones','Adopciones'],['reservas','Reservas veterinarias'],['consultas','Consultas de contacto'],['publicaciones','Publicaciones'],['comentarios','Comentarios']];

export const camposListaAnimal = ['personalidad','hogar','convivencia','historia'];

export const animalAdminVacio = {slug:'',nombre:'',especie:'perro',sexo:'macho',edadMeses:12,tamano:'mediano',comuna:'',comunaValor:'',imagen:'',diasEsperando:0,cuidados:'',personalidad:[],hogar:[],convivencia:[],historia:[]};

export const estadosVisibilidadAnimal = {disponible:'Disponible','no-visible':'No visible'};

export const etiquetasAdministracion = {nombre:'Nombre',apellido:'Apellido',correo:'Correo',usuario:'Usuario',telefono:'Teléfono',comuna:'Comuna',fechaNacimiento:'Fecha de nacimiento',rol:'Rol',activo:'Cuenta activa',slug:'Identificador',especie:'Especie',sexo:'Sexo',edadMeses:'Edad en meses',tamano:'Tamaño',estadoPerfil:'Estado del perfil',imagen:'Imagen',diasEsperando:'Días esperando',cuidados:'Cuidados',personalidad:'Personalidad',hogar:'Hogar',convivencia:'Convivencia',historia:'Historia',animalNombre:'Animal',estado:'Estado',fechaCreacion:'Fecha de creación',observacionAdmin:'Observación administrativa',historialCambios:'Historial de cambios',formulario:'Formulario enviado',nombreAdoptante:'Nombre del solicitante',edadAdoptante:'Edad del solicitante',correoAdoptante:'Correo del solicitante',telefonoAdoptante:'Teléfono del solicitante',comunaAdoptante:'Comuna del solicitante',tipoVivienda:'Vivienda',situacionVivienda:'Situación de vivienda',viveConPersonas:'Vive con otras personas',personasHogar:'Personas adicionales',acuerdoFamiliar:'Acuerdo familiar',otrosAnimales:'Otros animales',detalleAnimales:'Detalle de otros animales',experienciaAnimales:'Experiencia con animales',motivoAdopcion:'Motivo de adopción',cuidadosAnimal:'Cuidados diarios',aceptaCompromiso:'Acepta compromiso',responsableNombre:'Responsable',responsableCorreo:'Correo del responsable',responsableTelefono:'Teléfono del responsable',responsableComuna:'Comuna del responsable',servicio:'Servicio',mascota:'Especie',mascotaNombre:'Mascota',fecha:'Fecha',hora:'Hora',observaciones:'Observaciones',motivo:'Motivo',asunto:'Asunto',mensaje:'Mensaje',respuesta:'Última respuesta',respuestas:'Respuestas',texto:'Texto',autor:'Autor',categoria:'Categoría',contenido:'Contenido',ubicacion:'Ubicación',respuestaA:'Respuesta al comentario',fechaEstado:'Fecha del estado actual',fechaAtencion:'Fecha de atención',horaTermino:'Hora de término',conclusionConsulta:'Conclusión de la consulta',recomendacionesVeterinario:'Recomendaciones del veterinario'};

export const camposOmitidosDetalle = new Set(['id','usuarioId','animalId','animalSlug','animalImagen','publicacionId','administradorId','edad','comunaValor','foto']);
