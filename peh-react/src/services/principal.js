/* Filtros exclusivos del catálogo de Inicio.
 * Las reglas y los datos compartidos se obtienen de global.js.
 */
import { obtenerEdadMeses } from './global.js';

// Filtros exclusivos del catálogo presentado en Inicio.
// Mismos valores y condiciones que principal.js del HTML.
export { filtrosIniciales } from '../data/principal.js';
export function cumpleFiltroEdad(animal, filtros) {

    switch (filtros.edad) {

        case "menos-2":

            return obtenerEdadMeses(animal) <= 24;


        case "2-7":

            return (
                obtenerEdadMeses(animal) > 24
                &&
                obtenerEdadMeses(animal) <= 84
            );


        case "mas-7":

            return obtenerEdadMeses(animal) > 84;


        default:

            return true;

    }

}

export function obtenerAnimalesFiltrados(animales, filtros) {

    return animales.filter(
        (animal) => {


            /* Especie */

            const cumpleEspecie =

                filtros.especie === "todos"
                ||
                animal.especie === filtros.especie;



            /* Comuna */

            const cumpleComuna =

                filtros.comuna === "todas"
                ||
                animal.comunaValor === filtros.comuna;



            /* Tamaño */

            const cumpleTamano =

                filtros.tamano === "todos"
                ||
                animal.tamano === filtros.tamano;



            /* Tipo de hogar */

            const cumpleHogar =

                filtros.hogar === "todos"
                ||
                animal.hogar.includes(
                    filtros.hogar
                );



            /* Convivencia */

            const cumpleConvivencia =

                filtros.convivencia === "todos"
                ||
                animal.convivencia.includes(
                    filtros.convivencia
                );



            /* Sexo */

            const cumpleSexo =

                filtros.sexo === "todos"
                ||
                animal.sexo === filtros.sexo;



            /* Edad */

            const cumpleEdad =
                cumpleFiltroEdad(animal, filtros);



            return (

                cumpleEspecie
                &&
                cumpleComuna
                &&
                cumpleTamano
                &&
                cumpleHogar
                &&
                cumpleConvivencia
                &&
                cumpleSexo
                &&
                cumpleEdad

            );

        }
    );

}

export function textoResultados(cantidad, especie) {
 if(especie === "otro") return "Otros animales: próximamente";
 if(cantidad === 0) return "No encontramos animales con esos filtros.";
 if(cantidad === 1) return "Encontramos 1 compañero que coincide con tu búsqueda.";
 return `Encontramos ${cantidad} compañeros que puedes conocer.`;
}
