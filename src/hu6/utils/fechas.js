// Las fechas se guardan como texto ISO "YYYY-MM-DD" y las horas como "HH:MM".
// Así evitamos problemas de zona horaria al mostrarlas.

export const aDDMMYYYY = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

export const aDDMM = (iso) => aDDMMYYYY(iso).slice(0, 5);

export const horaDeFechaHora = (isoFechaHora) => (isoFechaHora ? isoFechaHora.slice(11, 16) : "");

export const diaSemana = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  const texto = new Date(y, m - 1, d).toLocaleDateString("es-PE", { weekday: "long" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

export const sumarMinutos = (hora, minutos) => {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export const dentroDeVentana = (iso, ventana) => !!iso && iso >= ventana.fechaInicio && iso <= ventana.fechaFin;

export const diasFaltantes = (iso, hoy = new Date()) => {
  const [y, m, d] = iso.split("-").map(Number);
  const objetivo = new Date(y, m - 1, d);
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.max(0, Math.round((objetivo - base) / 86400000));
};

export const ahoraLocalISO = () => {
  const n = new Date();
  const p = (x) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}T${p(n.getHours())}:${p(n.getMinutes())}`;
};
