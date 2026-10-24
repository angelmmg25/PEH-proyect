import { useEffect, useState } from "react";
import PEH from "../services/peh.js";

export default function useCatalogo() {
  const [animales, setAnimales] = useState(() => PEH.catalogo.listar());
  useEffect(() => {
    const actualizar = evento => {
      const clave = evento.type === "storage" ? evento.key : evento.detail?.clave;
      if (clave === null || clave === PEH.admin.CLAVES.catalogo) setAnimales(PEH.catalogo.listar());
    };
    window.addEventListener("peh:actualizado", actualizar);
    window.addEventListener("storage", actualizar);
    return () => {
      window.removeEventListener("peh:actualizado", actualizar);
      window.removeEventListener("storage", actualizar);
    };
  }, []);
  return animales;
}
