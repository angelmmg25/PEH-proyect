import { VistaAdministracion } from '../components/administracion.jsx';
import { useAdministracion } from '../hooks/administracion.js';
export default function Desarrollador({sesion}) {
const { titulo, lista, estados, esAdmin, tipo, pagina, setIntento, abiertos, estado, busqueda, setBusqueda, filtro, setFiltro, modal, setModal, mensaje, alternarDetalle, seleccionar, guardado, abrir, paginaAnterior, paginaSiguiente } = useAdministracion({ sesion });
return <VistaAdministracion titulo={titulo} lista={lista} estados={estados} esAdmin={esAdmin} tipo={tipo} pagina={pagina} setIntento={setIntento} abiertos={abiertos} estado={estado} busqueda={busqueda} setBusqueda={setBusqueda} filtro={filtro} setFiltro={setFiltro} modal={modal} setModal={setModal} mensaje={mensaje} alternarDetalle={alternarDetalle} seleccionar={seleccionar} guardado={guardado} abrir={abrir} paginaAnterior={paginaAnterior} paginaSiguiente={paginaSiguiente} />;
}