/* ==========================================================
   PEH - PRINCIPAL
   Patitas Esperando un Hogar
   ========================================================== */


/* ==========================================================
   DATOS TEMPORALES DE ANIMALES

   Más adelante estos datos podrán venir desde una API
   o una base de datos.
   ========================================================== */

const animales = window.PEH_ANIMALES;



/* ==========================================================
   ESTADO ACTUAL DE LOS FILTROS
   ========================================================== */

const filtros = {

    especie: "todos",

    comuna: "todas",

    tamano: "todos",

    hogar: "todos",

    convivencia: "todos",

    sexo: "todos",

    edad: "todas"

};



/* ==========================================================
   ELEMENTOS DEL DOM
   ========================================================== */

const catalogoAnimales =
    document.getElementById("catalogoAnimales");


const animalesEspera =
    document.getElementById("animalesEspera");


const textoResultados =
    document.getElementById("textoResultados");


const sinResultados =
    document.getElementById("sinResultados");


const botonesEspecie =
    document.querySelectorAll(".filtro-especie");


const filtroComuna =
    document.getElementById("filtroComuna");


const botonMasFiltros =
    document.getElementById("botonMasFiltros");


const panelFiltros =
    document.getElementById("panelFiltros");


const filtroTamano =
    document.getElementById("filtroTamano");


const filtroHogar =
    document.getElementById("filtroHogar");


const filtroConvivencia =
    document.getElementById("filtroConvivencia");


const filtroSexo =
    document.getElementById("filtroSexo");


const filtroEdad =
    document.getElementById("filtroEdad");


const botonLimpiarFiltros =
    document.getElementById("botonLimpiarFiltros");


const botonRestablecerFiltros =
    document.getElementById("botonRestablecerFiltros");


const botonMenu =
    document.getElementById("botonMenu");


const navegacionPrincipal =
    document.querySelector(".navegacion-principal");



/* ==========================================================
   UTILIDADES
   ========================================================== */


/*
   Convierte el valor utilizado internamente
   para mostrarlo de una forma más amigable.
*/

function formatearSexo(sexo) {

    if (sexo === "macho") {
        return "Macho";
    }

    if (sexo === "hembra") {
        return "Hembra";
    }

    return sexo;

}



/*
   Devuelve la edad de una forma natural.
*/

function formatearEdad(edad) {

    if (edad === 1) {
        return "1 año";
    }

    return `${edad} años`;

}



/*
   Formatea el tamaño.
*/

function formatearTamano(tamano) {

    const tamanos = {

        pequeno: "Pequeño",

        mediano: "Mediano",

        grande: "Grande"

    };


    return tamanos[tamano] || tamano;

}



/*
   Nombre de especie para accesibilidad.
*/

function formatearEspecie(animal) {

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



/* ==========================================================
   CREAR TARJETA DE ANIMAL
   ========================================================== */

function crearTarjetaAnimal(animal) {

    const articulo =
        document.createElement("article");


    articulo.className =
        "tarjeta-animal";


    articulo.dataset.animal = animal.slug;


    articulo.tabIndex = 0;


    articulo.setAttribute(
        "role",
        "link"
    );


    articulo.setAttribute(
        "aria-label",
        `Conocer a ${animal.nombre}`
    );



    /* ------------------------------------------------------
       IMAGEN
       ------------------------------------------------------ */

    const contenedorImagen =
        document.createElement("div");


    contenedorImagen.className =
        "contenedor-imagen-animal";


    const imagen =
        document.createElement("img");


    imagen.className =
        "animal-imagen";


    imagen.src =
        animal.imagen;


    imagen.alt =
        `${animal.nombre}, ${formatearEspecie(animal)} en adopción`;


    imagen.loading =
        "lazy";


    /*
       Si todavía no tienes alguna imagen,
       evitamos que aparezca el icono de imagen rota.
    */

    imagen.addEventListener(
        "error",
        () => {

            imagen.style.display =
                "none";


            contenedorImagen.classList.add(
                "imagen-no-disponible"
            );


            if (
                !contenedorImagen.querySelector(
                    ".texto-imagen-no-disponible"
                )
            ) {

                const texto =
                    document.createElement("span");


                texto.className =
                    "texto-imagen-no-disponible";


                texto.textContent =
                    animal.nombre.charAt(0);


                contenedorImagen.appendChild(
                    texto
                );

            }

        }
    );


    contenedorImagen.appendChild(
        imagen
    );



    /* ------------------------------------------------------
       INFORMACIÓN
       ------------------------------------------------------ */

    const informacion =
        document.createElement("div");


    informacion.className =
        "animal-informacion";



    /* Nombre */

    const nombre =
        document.createElement("h3");


    nombre.className =
        "animal-nombre";


    nombre.textContent =
        animal.nombre;



    /* Personalidad */

    const personalidad =
        document.createElement("p");


    personalidad.className =
        "animal-personalidad";


    personalidad.textContent =
        animal.personalidad
            .slice(0, 2)
            .join(" · ");



    /* Ubicación */

    const ubicacion =
        document.createElement("p");


    ubicacion.className =
        "animal-ubicacion";


    ubicacion.innerHTML =
        `<span aria-hidden="true">⌖</span> ${animal.comuna}`;



    /* Datos secundarios */

    const datos =
        document.createElement("div");


    datos.className =
        "animal-datos";


    datos.innerHTML = `

        <span>
            ${formatearSexo(animal.sexo)}
        </span>

        <span>
            ${formatearTamano(animal.tamano)}
        </span>

        <span>
            ${formatearEdad(animal.edad)}
        </span>

    `;



    /* Acción */

    const accion =
        document.createElement("span");


    accion.className =
        "animal-accion";


    accion.innerHTML =
        `Conocer a ${animal.nombre} <span aria-hidden="true">→</span>`;



    /* ------------------------------------------------------
       ARMAMOS LA TARJETA
       ------------------------------------------------------ */

    informacion.appendChild(
        nombre
    );


    informacion.appendChild(
        personalidad
    );


    informacion.appendChild(
        ubicacion
    );


    informacion.appendChild(
        datos
    );


    informacion.appendChild(
        accion
    );


    articulo.appendChild(
        contenedorImagen
    );


    articulo.appendChild(
        informacion
    );



    /* ------------------------------------------------------
       NAVEGACIÓN AL PERFIL
       ------------------------------------------------------ */

    articulo.addEventListener(
        "click",
        () => {

            abrirPerfilAnimal(
                animal.slug
            );

        }
    );


    articulo.addEventListener(
        "keydown",
        (evento) => {

            if (
                evento.key === "Enter"
                ||
                evento.key === " "
            ) {

                evento.preventDefault();


                abrirPerfilAnimal(
                    animal.slug
                );

            }

        }
    );


    return articulo;

}



/* ==========================================================
   ABRIR PERFIL DEL ANIMAL
   ========================================================== */

function abrirPerfilAnimal(slug) {

    /*
       Todavía no hemos creado animal.html.

       Cuando lo hagamos recibirá algo como:

       animal.html?id=milo
    */

    window.location.href =
        `animal.html?id=${encodeURIComponent(slug)}`;

}



/* ==========================================================
   COMPROBAR FILTRO DE EDAD
   ========================================================== */

function cumpleFiltroEdad(animal) {

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



/* ==========================================================
   FILTRAR ANIMALES
   ========================================================== */

function obtenerAnimalesFiltrados() {

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
                cumpleFiltroEdad(animal);



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



/* ==========================================================
   MOSTRAR CATÁLOGO
   ========================================================== */

function mostrarAnimales() {

    if (filtros.especie === "otro") {
        catalogoAnimales.innerHTML = "";
        sinResultados.hidden = true;
        const aviso = document.createElement("p");
        aviso.className = "aviso-proximamente";
        aviso.textContent = "Otros animales · Próximamente. Por ahora puedes conocer a nuestros perros y gatos.";
        catalogoAnimales.appendChild(aviso);
        textoResultados.textContent = "Otros animales: próximamente";
        return;
    }
    const resultados =
        obtenerAnimalesFiltrados();


    catalogoAnimales.innerHTML =
        "";


    /* ------------------------------------------------------
       NO HAY RESULTADOS
       ------------------------------------------------------ */

    if (resultados.length === 0) {

        sinResultados.hidden =
            false;


        textoResultados.textContent =
            "No encontramos animales con esos filtros.";


        return;

    }



    /* ------------------------------------------------------
       SÍ HAY RESULTADOS
       ------------------------------------------------------ */

    sinResultados.hidden =
        true;



    resultados.forEach(
        (animal) => {

            const tarjeta =
                crearTarjetaAnimal(animal);


            catalogoAnimales.appendChild(
                tarjeta
            );

        }
    );



    actualizarTextoResultados(
        resultados.length
    );

}



/* ==========================================================
   TEXTO DE RESULTADOS
   ========================================================== */

function actualizarTextoResultados(cantidad) {

    if (cantidad === 1) {

        textoResultados.textContent =
            "Encontramos 1 compañero que coincide con tu búsqueda.";

        return;

    }


    textoResultados.textContent =
        `Encontramos ${cantidad} compañeros que puedes conocer.`;

}



/* ==========================================================
   ANIMALES QUE LLEVAN MÁS TIEMPO ESPERANDO
   ========================================================== */

function mostrarAnimalesEspera() {

    /*
       Conservamos la selección y el orden originales.
       Reutilizamos la tarjeta del catálogo para su presentación.
    */

    const seleccionados =
        [...animales]

            .sort(
                (a, b) =>
                    b.diasEsperando
                    -
                    a.diasEsperando
            )

            .slice(
                0,
                4
            );


    animalesEspera.replaceChildren(

        ...seleccionados.map(
            (animal) => {

                const tarjeta =
                    crearTarjetaAnimal(animal);


                tarjeta.classList.add(
                    "tarjeta-animal-compacta"
                );


                return tarjeta;

            }
        )

    );

}



/* ==========================================================
   FILTRO POR ESPECIE
   ========================================================== */

botonesEspecie.forEach(
    (boton) => {

        boton.addEventListener(
            "click",
            () => {


                /* Quitamos activo de todos */

                botonesEspecie.forEach(
                    (otroBoton) => {

                        otroBoton.classList.remove(
                            "activo"
                        );

                    }
                );


                /* Activamos el seleccionado */

                boton.classList.add(
                    "activo"
                );


                filtros.especie =
                    boton.dataset.especie;


                mostrarAnimales();

            }
        );

    }
);



/* ==========================================================
   FILTRO POR COMUNA
   ========================================================== */

filtroComuna.addEventListener(
    "change",
    () => {

        filtros.comuna =
            filtroComuna.value;


        mostrarAnimales();

    }
);



/* ==========================================================
   MOSTRAR / OCULTAR FILTROS AVANZADOS
   ========================================================== */

botonMasFiltros.addEventListener(
    "click",
    () => {

        const estaOculto =
            panelFiltros.hidden;


        panelFiltros.hidden =
            !estaOculto;


        botonMasFiltros.setAttribute(
            "aria-expanded",
            String(estaOculto)
        );


        const simbolo =
            botonMasFiltros.querySelector(
                "span"
            );


        if (simbolo) {

            simbolo.textContent =
                estaOculto
                    ? "−"
                    : "+";

        }

    }
);



/* ==========================================================
   FILTROS AVANZADOS
   ========================================================== */

filtroTamano.addEventListener(
    "change",
    () => {

        filtros.tamano =
            filtroTamano.value;


        mostrarAnimales();

    }
);


filtroHogar.addEventListener(
    "change",
    () => {

        filtros.hogar =
            filtroHogar.value;


        mostrarAnimales();

    }
);


filtroConvivencia.addEventListener(
    "change",
    () => {

        filtros.convivencia =
            filtroConvivencia.value;


        mostrarAnimales();

    }
);


filtroSexo.addEventListener(
    "change",
    () => {

        filtros.sexo =
            filtroSexo.value;


        mostrarAnimales();

    }
);


filtroEdad.addEventListener(
    "change",
    () => {

        filtros.edad =
            filtroEdad.value;


        mostrarAnimales();

    }
);



/* ==========================================================
   LIMPIAR FILTROS
   ========================================================== */

function limpiarFiltros() {

    /* Estado interno */

    filtros.especie =
        "todos";


    filtros.comuna =
        "todas";


    filtros.tamano =
        "todos";


    filtros.hogar =
        "todos";


    filtros.convivencia =
        "todos";


    filtros.sexo =
        "todos";


    filtros.edad =
        "todas";



    /* Selects */

    filtroComuna.value =
        "todas";


    filtroTamano.value =
        "todos";


    filtroHogar.value =
        "todos";


    filtroConvivencia.value =
        "todos";


    filtroSexo.value =
        "todos";


    filtroEdad.value =
        "todas";



    /* Botones de especie */

    botonesEspecie.forEach(
        (boton) => {

            const esTodos =
                boton.dataset.especie
                ===
                "todos";


            boton.classList.toggle(
                "activo",
                esTodos
            );

        }
    );



    mostrarAnimales();

}



/* Botón dentro de filtros */

botonLimpiarFiltros.addEventListener(
    "click",
    limpiarFiltros
);



/* Botón cuando no existen resultados */

botonRestablecerFiltros.addEventListener(
    "click",
    limpiarFiltros
);



/* ==========================================================
   MENÚ RESPONSIVE
   ========================================================== */

if (
    botonMenu
    &&
    navegacionPrincipal
) {

    botonMenu.addEventListener(
        "click",
        () => {

            const menuAbierto =

                navegacionPrincipal.classList.toggle(
                    "abierta"
                );


            botonMenu.classList.toggle(
                "activo",
                menuAbierto
            );


            botonMenu.setAttribute(
                "aria-expanded",
                String(menuAbierto)
            );

        }
    );



    /*
       Cerramos el menú después de seleccionar
       una sección en dispositivos pequeños.
    */

    navegacionPrincipal
        .querySelectorAll("a")
        .forEach(
            (enlace) => {

                enlace.addEventListener(
                    "click",
                    () => {

                        navegacionPrincipal
                            .classList.remove(
                                "abierta"
                            );


                        botonMenu
                            .classList.remove(
                                "activo"
                            );


                        botonMenu.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );

}



/* ==========================================================
   INICIALIZACIÓN
   ========================================================== */

function iniciarPrincipal() {

    mostrarAnimales();

    mostrarAnimalesEspera();

}


iniciarPrincipal();
// Mantiene los filtros al refrescar el catálogo desde administración.
window.addEventListener("peh:actualizado", evento => {
    if (evento.detail?.clave === PEH.admin.CLAVES.catalogo) { mostrarAnimales(); mostrarAnimalesEspera(); }
});
window.addEventListener("storage", evento => {
    if (evento.key === PEH.admin.CLAVES.catalogo || evento.key === null) { mostrarAnimales(); mostrarAnimalesEspera(); }
});
