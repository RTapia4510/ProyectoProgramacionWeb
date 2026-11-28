import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Tabla intermedia: miembros del jurado de cada sustentación.
const SustentacionJurado = sequelize.define('SustentacionJurado', {
  sustentacionId: { 
    type: DataTypes.STRING, 
    primaryKey: true 
  },
  usuarioId: {
     type: DataTypes.STRING, 
     primaryKey: true 
    },
}, {
  tableName: 'sustentacion_jurado',
  timestamps: true
})

export default SustentacionJurado;
