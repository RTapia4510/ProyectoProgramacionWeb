// Helpers de nombres de personas (usuarios, docentes, estudiantes).
export const nombreCompleto = (p) => `${p.nombres} ${p.apellidos}`;

/** "Diana Carolina Rojas Ttito" -> "Diana Rojas Ttito" (primer nombre + apellidos) */
export const nombreCorto = (p) => `${p.nombres.split(" ")[0]} ${p.apellidos}`;

export const iniciales = (p) => `${p.nombres[0]}${p.apellidos[0]}`;
