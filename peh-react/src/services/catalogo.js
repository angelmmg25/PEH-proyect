// Mismos valores y condiciones que principal.js del HTML.
export const filtrosIniciales = Object.freeze({especie:"todos", comuna:"todas", tamano:"todos", hogar:"todos", convivencia:"todos", sexo:"todos", edad:"todas"});
export function formatearSexo(sexo) {

    if (sexo === "macho") {
        return "Macho";
    }

    if (sexo === "hembra") {
        return "Hembra";
    }

    return sexo;

}

export function formatearEdad(edad) {

    if (edad === 1) {
        return "1 año";
    }

    return `${edad} años`;

}

export function formatearTamano(tamano) {

    const tamanos = {

        pequeno: "Pequeño",

        mediano: "Mediano",

        grande: "Grande"

    };


    return tamanos[tamano] || tamano;

}

export function formatearEspecie(animal) {

    if (animal.especie === "perro") {
        return "Perro";
    }

    if (animal.especie === "gato") {
        return "Gato";
    }

    if (animal.tipo) {

        return animal.tipo
            .charAt(0)
            .toUpperCase()
            + animal.tipo.slice(1);

    }

    return "Animal";

}

export function cumpleFiltroEdad(animal, filtros) {

    switch (filtros.edad) {

        case "menos-2":

            return animal.edad <= 2;


        case "2-7":

            return (
                animal.edad > 2
                &&
                animal.edad <= 7
            );


        case "mas-7":

            return animal.edad > 7;


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
export function animalesConMasEspera(animales) {
 return [...animales].sort((a,b) => b.diasEsperando - a.diasEsperando).slice(0,4);
}
