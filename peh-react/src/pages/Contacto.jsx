import { VistaContacto } from '../components/contacto.jsx';
import { useContacto } from '../hooks/contacto.js';
import { registrarConsulta } from '../services/contacto.js';
export default function Contacto({registrar=registrarConsulta}) {
const { datos, borrador, errores, procesando, confirmacion, consultaRegistrada, errorEnvio, contador, formulario, aviso, cambiar, elegir, enviar, revisarContactoAlSalir, cancelarConsulta } = useContacto({ registrar });
return <VistaContacto datos={datos} borrador={borrador} errores={errores} procesando={procesando} confirmacion={confirmacion} consultaRegistrada={consultaRegistrada} errorEnvio={errorEnvio} contador={contador} formulario={formulario} aviso={aviso} cambiar={cambiar} elegir={elegir} enviar={enviar} revisarContactoAlSalir={revisarContactoAlSalir} cancelarConsulta={cancelarConsulta} />;
}