const vistasPublicas = new Set(['inicio', 'animales', 'animal']);

export function vistaPermitidaInvitado(ruta) {
  const pagina = String(ruta || 'inicio').replace(/^#/, '').split('/')[0];
  return vistasPublicas.has(pagina);
}

export function requiereSesion(ruta, sesion) {
  return sesion?.invitado === true && !vistaPermitidaInvitado(ruta);
}
