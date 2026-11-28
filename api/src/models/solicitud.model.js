import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Solicitud = sequelize.define('Solicitud', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mensaje: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  estado: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: 'pendiente', 
    validate: { isIn: [['pendiente', 'aceptada', 'rechazada', 'retirada']] } 
  },
  fecha: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },
  fechaResolucion: { 
    type: DataTypes.DATEONLY 
  },
  motivo: { 
    type: DataTypes.TEXT, 
    defaultValue: '' 
  },
}, {
  tableName: 'solicitudes',
  timestamps: true,
  indexes: [
    { fields: ['trabajo_id', 'estado'] }, 
    { fields: ['asesor_id', 'estado'] }
  ]
})

export default Solicitud;
