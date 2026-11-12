import { VistaLogin } from '../components/login.jsx';
import { useLogin } from '../hooks/login.js';
export default function Login({onAcceso}) {
const { registro, valores, borrador, estados, mensaje, procesando, raiz, cambiarVista, cambiarCampo, iniciarSesion, entrarInvitado, crearCuenta, revisarAccesoAlSalir, cancelarRegistro } = useLogin({ onAcceso });
return <VistaLogin registro={registro} valores={valores} borrador={borrador} estados={estados} mensaje={mensaje} procesando={procesando} raiz={raiz} cambiarVista={cambiarVista} cambiarCampo={cambiarCampo} iniciarSesion={iniciarSesion} entrarInvitado={entrarInvitado} crearCuenta={crearCuenta} revisarAccesoAlSalir={revisarAccesoAlSalir} cancelarRegistro={cancelarRegistro} />;
}