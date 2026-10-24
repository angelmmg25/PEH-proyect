import base from "./pehBase.js";
import { crearAdministracion } from "./administracion.js";
import animales from "../data/animales.js";
import { publicacionesDemo } from "../data/comunidad.js";

const comentariosDemo = publicacionesDemo.flatMap(p => (p.comentarios || []).map(c => ({ ...c, demo: true, autor: c.autor.replace(/:$/, "") })));
const PEH = crearAdministracion(base, animales, comentariosDemo);
export default PEH;
