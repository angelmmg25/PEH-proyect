// edadMeses es la unidad nueva; edad conserva compatibilidad con datos en años.
export function obtenerEdadMeses(animal) {
  if (animal.edadMeses !== undefined && animal.edadMeses !== null && animal.edadMeses !== "") return Number(animal.edadMeses);
  if (animal.edad === undefined || animal.edad === null || animal.edad === "") return NaN;
  return Math.round(Number(animal.edad) * 12);
}
export function edadMesesValida(valor) {
  if (typeof valor !== "number" && typeof valor !== "string") return false;
  if (String(valor).trim() === "") return false;
  const meses = Number(valor);
  return Number.isInteger(meses) && meses >= 0 && meses <= 480 && (meses < 12 || meses % 3 === 0);
}
export function textoEdadMeses(meses) {
  if (!Number.isFinite(meses) || meses < 0) return "Edad por confirmar";
  if (meses === 0) return "Menos de 1 mes";
  if (meses < 12) return meses === 1 ? "1 mes" : `${meses} meses`;
  const anios = Math.floor(meses / 12), resto = Math.floor((meses % 12) / 3) * 3;
  return `${anios} ${anios === 1 ? "año" : "años"}${resto ? ` y ${resto} meses` : ""}`;
}
export const opcionesEdad = [0, ...Array.from({length: 11}, (_, i) => i + 1), ...Array.from({length: 157}, (_, i) => 12 + i * 3)].map(meses => [String(meses), textoEdadMeses(meses)]);
