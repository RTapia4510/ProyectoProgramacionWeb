import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { opcionesTabla } from './columnas.js';

// Tabla intermedia: integrantes de cada trabajo (equipo de 1 a 3 estudiantes).
const TrabajoIntegrante = sequelize.define('TrabajoIntegrante', {
  trabajoId: { type: DataTypes.STRING(60), primaryKey: true },
  usuarioId: { type: DataTypes.STRING(60), primaryKey: true },
}, opcionesTabla('trabajo_integrantes'));

export default TrabajoIntegrante;
