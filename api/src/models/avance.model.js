import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Cada avance registrado es una versión del entregable.
const Avance = sequelize.define('Avance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  version: { 
    type: DataTypes.INTEGER, 
    allowNull: false
  },
  enlace: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  descripcion: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  fechaEntrega: { 
    type: DataTypes.DATEONLY, 
    allowNull: false
  },
  estado: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: 'entregado', 
    validate: { isIn: [['entregado', 'observado', 'aprobado']] } 
  },
  retraso: { 
    type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    fechaRevision: { type: DataTypes.DATEONLY },
},{
  tableName: 'avances',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['entregable_id', 'version'] },
    { fields: ['estado'] }
  ]
})

export default Avance;
