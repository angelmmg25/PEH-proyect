/* Login: acceso, registro, validación y cancelación del proceso. */
import { iniciarSesion as accederCuenta, registrarCuenta, iniciarSesionInvitado, validarAcceso } from '../services/login.js';
import { camposInicio, camposRegistro } from '../data/login.js';
import { useBorrador } from './global.jsx';
import { useEffect, useRef, useState } from 'react';
/* pages/Login.jsx — Login */
export function useLogin({ onAcceso }) {
const [registro, setRegistro] = useState(false);
const [valores, setValores, borrador] = useBorrador("acceso-registro", {});
const [estados, setEstados] = useState({});
const [mensaje, setMensaje] = useState({texto:"", tipo:""});
const [procesando, setProcesando] = useState(false);
const bloqueo = useRef(false);
const raiz = useRef(null);
const temporizadores = useRef(new Set());
function despues(fn, ms) { const timer = setTimeout(() => { temporizadores.current.delete(timer); fn(); }, ms); temporizadores.current.add(timer); }
useEffect(() => {
  document.body.classList.add("cuerpo-inicio-sesion");
  document.title = "PEH | Inicio de sesión";
  const timers = temporizadores.current;
  return () => { document.body.classList.remove("cuerpo-inicio-sesion"); timers.forEach(clearTimeout); timers.clear(); };
 }, []);
function cambiarVista(valor) {
  setRegistro(valor);
  despues(() => raiz.current?.querySelector(valor ? "#nombreRegistro" : "#correo")?.focus(), 380);
 }
function validarCampo(id, nuevos = valores) {
  const error = validarAcceso(id, nuevos);
  setEstados(actual => ({...actual, [id]:error}));
  return !error;
 }
function cambiarCampo(e) {
  const {id, value, checked, type} = e.target;
  const nuevos = {...valores, [id]:type === "checkbox" ? checked : value};
  setValores(nuevos);
  validarCampo(id, nuevos);
  if(id === "contrasenaRegistro" && nuevos.confirmarContrasenaRegistro) validarCampo("confirmarContrasenaRegistro", nuevos);
 }
function validarFormulario(ids) {
  const nuevos = Object.fromEntries(ids.map(id => [id, validarAcceso(id, valores)]));
  setEstados(actual => ({...actual, ...nuevos}));
  return ids.every(id => !nuevos[id]);
 }
async function iniciarSesion(e) {
  e.preventDefault();
  if(bloqueo.current || !validarFormulario(camposInicio)) return;
  bloqueo.current = true; setProcesando(true);
  try {
   const sesion = await accederCuenta(valores.correo, valores.contrasena);
   borrador.borrar();
   window.location.hash = "inicio";
   onAcceso(sesion);
  } catch (error) { setEstados(actual => ({...actual, contrasena:error.message || "Ocurrió un problema al iniciar sesión."})); }
  finally { bloqueo.current = false; setProcesando(false); }
 }
function entrarInvitado() {
  if (bloqueo.current) return;
  try {
   const sesion = iniciarSesionInvitado();
   window.location.hash = "inicio"; onAcceso(sesion);
  } catch (error) { alert(error.message); }
 }
async function crearCuenta(e) {
  e.preventDefault();
  if(bloqueo.current) return;
  if(!validarFormulario(camposRegistro)) {
   setMensaje({texto:"Revisa los campos marcados antes de crear tu cuenta.", tipo:"error"});
   const primerError = camposRegistro.find(id => validarAcceso(id, valores));
   raiz.current?.querySelector("#" + primerError)?.focus(); return;
  }
  bloqueo.current = true; setProcesando(true);
  const datos = {nombre:valores.nombreRegistro.trim(), apellido:valores.apellidoRegistro.trim(), usuario:valores.usuarioRegistro.trim(), correo:valores.correoRegistro.trim(), fechaNacimiento:valores.fechaNacimientoRegistro, telefono:valores.telefonoRegistro, comuna:valores.comunaRegistro, contrasena:valores.contrasenaRegistro};
  try {
   setMensaje({texto:"Estamos creando tu cuenta...", tipo:"info"});
   await registrarCuenta(datos);
   borrador.borrar();
   setMensaje({texto:"¡Bienvenido a PEH! Tu cuenta fue creada correctamente.", tipo:"exito"});
   despues(() => {
    borrador.reiniciar({correo:datos.correo, contrasena:""});
    setEstados(actual => ({contrasena:actual.contrasena}));
    setMensaje({texto:"", tipo:""}); cambiarVista(false);
   }, 900);
  } catch (error) { setMensaje({texto:error.message || "Ocurrió un problema al crear tu cuenta.", tipo:"error"}); }
  finally { bloqueo.current = false; setProcesando(false); }
 }
function revisarAccesoAlSalir(e) {if([...camposInicio,...camposRegistro].includes(e.target.id))validarCampo(e.target.id);}
function cancelarRegistro() {if(borrador.reiniciar({})){setEstados({});setMensaje({texto:"",tipo:""});}}
return { registro, valores, borrador, estados, setEstados, mensaje, setMensaje, procesando, raiz, cambiarVista, validarCampo, cambiarCampo, iniciarSesion, entrarInvitado, crearCuenta , revisarAccesoAlSalir, cancelarRegistro };
}
