import { VistaVeterinaria } from '../components/veterinaria.jsx';
import { useFormularioVeterinaria } from '../hooks/veterinaria.js';
export default function Veterinaria({registrar}) {
const { datos, procesando, errores, avisoBorrador, registrado, mensaje, fechaMinima, momentoHoras, formulario, aviso, revisarAlSalir, cancelarSolicitud, cambiar, elegirServicio, irReserva, reservar } = useFormularioVeterinaria(registrar);
return <VistaVeterinaria datos={datos} procesando={procesando} errores={errores} avisoBorrador={avisoBorrador} registrado={registrado} mensaje={mensaje} fechaMinima={fechaMinima} momentoHoras={momentoHoras} formulario={formulario} aviso={aviso} revisarAlSalir={revisarAlSalir} cancelarSolicitud={cancelarSolicitud} cambiar={cambiar} elegirServicio={elegirServicio} irReserva={irReserva} reservar={reservar} />;
}