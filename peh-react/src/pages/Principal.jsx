import { VistaPrincipal } from '../components/principal.jsx';
import { usePrincipal } from '../hooks/principal.js';
export default function Principal({ cuentaCabecera = null }) {
const { cargando, error, recargar, filtros, filtrosAbiertos, setFiltrosAbiertos, cambiarFiltro, limpiarFiltros, resultados, espera } = usePrincipal();
return <VistaPrincipal cuentaCabecera={cuentaCabecera} cargando={cargando} error={error} recargar={recargar} filtros={filtros} filtrosAbiertos={filtrosAbiertos} setFiltrosAbiertos={setFiltrosAbiertos} cambiarFiltro={cambiarFiltro} limpiarFiltros={limpiarFiltros} resultados={resultados} espera={espera} />;
}