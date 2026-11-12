import { VistaPerfil, MisConsultas as PanelConsultas, MisReservas as PanelReservas } from '../components/perfil.jsx';
import { usePerfil } from '../hooks/perfil.js';
import { lazy } from 'react';
// Conserva los límites asíncronos de los paneles, ahora agrupados en un módulo.
const MisConsultas = lazy(() => Promise.resolve({default:PanelConsultas}));
const MisReservas = lazy(() => Promise.resolve({default:PanelReservas}));
export default function Perfil({sesion,seccionRuta}) {
const { seccionActiva, adopciones, seleccionarSeccion } = usePerfil({ sesion, seccionRuta });
return <VistaPerfil sesion={sesion} seccionRuta={seccionRuta} seccionActiva={seccionActiva} adopciones={adopciones} seleccionarSeccion={seleccionarSeccion} MisConsultas={MisConsultas} MisReservas={MisReservas} />;
}
