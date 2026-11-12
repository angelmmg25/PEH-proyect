import { VistaAnimal } from '../components/animal.jsx';
import { usePerfilAnimal } from '../hooks/animal.js';
export default function Animal({animal: animalLocal,identificador,onIniciarSesion}) {
const { consulta, animal, mensajeAdopcion, enviandoAdopcion, setEnviandoAdopcion, adoptando, avisoInvitado, setAvisoInvitado, sesionAnimal, puedeCompletar, abrirAdopcion, cerrarAdopcion, verHistoria, adopcionEnviada } = usePerfilAnimal({ animalLocal, identificador });
return <VistaAnimal identificador={identificador} onIniciarSesion={onIniciarSesion} consulta={consulta} animal={animal} mensajeAdopcion={mensajeAdopcion} enviandoAdopcion={enviandoAdopcion} setEnviandoAdopcion={setEnviandoAdopcion} adoptando={adoptando} avisoInvitado={avisoInvitado} setAvisoInvitado={setAvisoInvitado} sesionAnimal={sesionAnimal} puedeCompletar={puedeCompletar} abrirAdopcion={abrirAdopcion} cerrarAdopcion={cerrarAdopcion} verHistoria={verHistoria} adopcionEnviada={adopcionEnviada} />;
}