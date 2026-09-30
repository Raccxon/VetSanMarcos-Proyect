// Para quitar tildes, dejar en minusculas y recortas espacios en blanco
export function normalizarTexto(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// filtrar por texto (nombre/especie) y categoria a la vez
export function filtrarServicios(servicios, busqueda = "", categoria = "Todas") {
  const texto = normalizarTexto(busqueda);

  return servicios.filter((item) => {
    const coincideTexto =
      normalizarTexto(item.nombre).includes(texto) ||
      normalizarTexto(item.especie).includes(texto);
    const coincideCategoria = categoria === "Todas" || item.categoria === categoria;
    return coincideTexto && coincideCategoria;
  });
}