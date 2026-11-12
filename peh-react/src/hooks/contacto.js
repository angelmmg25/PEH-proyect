/* Contacto: formulario de consulta y preguntas frecuentes. */
import { useBorrador } from './global.jsx';
import { useEffect, useRef, useState } from 'react';
import { asuntosSugeridos } from '../data/contacto';
import { validarContacto, datosInicialesContacto } from '../services/contacto.js';
import { camposContacto } from '../data/contacto.js';
/* pages/Contacto.jsx — Contacto */
export function useContacto({ registrar }) {
const [datos, setDatos, borrador] = useBorrador("contacto", datosInicialesContacto);
const [errores, setErrores] = useState({});
const [procesando, setProcesando] = useState(false);
const [confirmacion, setConfirmacion] = useState(false);
const [consultaRegistrada, setConsultaRegistrada] = useState(null);
const [errorEnvio, setErrorEnvio] = useState("");
const contador = datos.mensaje.length;
const formulario = useRef(null), aviso = useRef(null), bloqueo = useRef(false);
const frame = useRef(null), vivo=useRef(false);
useEffect(() => {
    vivo.current=true;document.body.classList.add("pagina-contacto");
    document.title = "Contacto | PEH";
    return () => {
      vivo.current=false;
      cancelAnimationFrame(frame.current);
      document.body.classList.remove("pagina-contacto");
    };
  }, []);
function cambiar(e) {
    if(bloqueo.current)return;
    const { name, value } = e.target;
    setDatos(actual => ({ ...actual, [name]: value }));
    setErrorEnvio("");
    setErrores(actual => ({...actual,[name]:validarContacto({...datos,[name]:value})[name]}));
  }
function elegir(motivo) {
    if(bloqueo.current)return;
    setDatos(actual => ({ ...actual, motivo, asunto: actual.asunto.trim() ? actual.asunto : asuntosSugeridos[motivo] || actual.asunto }));
    setErrores(actual => ({ ...actual, motivo: "" }));
    formulario.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
async function enviar(e) {
    e.preventDefault();
    if (bloqueo.current) return;
    setConfirmacion(false);
    setErrorEnvio("");
    const nuevos = validarContacto(datos);
    setErrores(nuevos);
    const primero = camposContacto.find(campo => nuevos[campo]);
    if (primero) {
      document.getElementById(primero + "Contacto")?.focus();
      return;
    }
    bloqueo.current = true;
    setProcesando(true);
    try {
      const resultado = await registrar(datos);
      if(!vivo.current)return;
      if (!resultado.ok) {
        setErrorEnvio(resultado.mensaje);
        return;
      }
      setConsultaRegistrada(resultado.consulta);
      setConfirmacion(true);
      borrador.reiniciar(datosInicialesContacto());
      setErrores({});
      frame.current = requestAnimationFrame(() => aviso.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));

    } catch(error) {
      if(vivo.current&&error.name!=="AbortError"){setErrores(actual=>({...actual,...error.errores}));setErrorEnvio(error.message||"No pudimos confirmar el envío. Consulta tu perfil antes de reenviarlo.");}
    } finally {
      bloqueo.current = false;
      if(vivo.current)setProcesando(false);
    }
  }
function revisarContactoAlSalir(e) {if(e.target.name)setErrores(actual=>({...actual,[e.target.name]:validarContacto(datos)[e.target.name]}));}
function cancelarConsulta() {if(borrador.reiniciar(datosInicialesContacto())){setErrores({});setErrorEnvio("");setConfirmacion(false);}}
return { datos, borrador, errores, setErrores, procesando, confirmacion, setConfirmacion, consultaRegistrada, errorEnvio, setErrorEnvio, contador, formulario, aviso, cambiar, elegir, enviar , revisarContactoAlSalir, cancelarConsulta };
}

/* components/contacto.jsx — PreguntasContacto */
export function usePreguntasContacto() {
const [abierta,setAbierta]=useState(null);
function alternarPregunta(indice) {setAbierta(actual=>actual===indice?null:indice);}
return { abierta, setAbierta , alternarPregunta };
}
