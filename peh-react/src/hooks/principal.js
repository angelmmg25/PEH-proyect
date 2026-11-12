/* Inicio: filtros del catálogo, carrusel y navegación de las tarjetas animales. */
import { useEffect, useState } from 'react';
import { useEstadoCatalogo } from './global.jsx';
import { animalesConMasEspera } from '../services/global.js';
import { filtrosIniciales } from '../data/principal.js';
import { obtenerAnimalesFiltrados } from '../services/principal.js';
import { diapositivas } from '../data/principal.js';
/* pages/Principal.jsx — Principal */
export function usePrincipal() {
const { animales, cargando, error, recargar } = useEstadoCatalogo();
const [filtros, setFiltros] = useState({...filtrosIniciales});
const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
useEffect(() => {
  document.body.classList.add("pagina-principal");
  document.title = "PEH | Encuentra a tu compañero";
  return () => document.body.classList.remove("pagina-principal");
 }, []);
function cambiarFiltro(campo, valor) { setFiltros(actual => ({...actual, [campo]:valor})); }
function limpiarFiltros() { setFiltros({...filtrosIniciales}); }
const resultados = obtenerAnimalesFiltrados(animales, filtros);
const espera = animalesConMasEspera(animales);
return { cargando, error, recargar, filtros, filtrosAbiertos, setFiltrosAbiertos, cambiarFiltro, limpiarFiltros, resultados, espera };
}

/* components/principal.jsx — CarruselPrincipal */
export function useCarruselPrincipal() {
const [diapositiva, setDiapositiva] = useState(0);
const actual = diapositivas[diapositiva];
function desplazar(paso) {
  setDiapositiva(indice => (indice + paso + diapositivas.length) % diapositivas.length);
 }
return { diapositiva, setDiapositiva, actual, desplazar };
}

/* components/principal.jsx — TarjetaAnimal */
export function useTarjetaAnimal({ animal }) {
const [sinImagen, setSinImagen] = useState(false);
function abrirPerfil() { window.location.hash = `animal/${encodeURIComponent(animal.slug)}`; }
function tecladoTarjeta(e) { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirPerfil(); } }
function abrirDesdeBoton(e) {e.stopPropagation();abrirPerfil();}
return { sinImagen, setSinImagen, abrirPerfil , tecladoTarjeta, abrirDesdeBoton };
}
