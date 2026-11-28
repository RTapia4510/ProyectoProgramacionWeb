import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Usuario = sequelize.define('usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'activo'
  },
  nombres: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notif: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  motivoBloqueo: {
    type: DataTypes.TEXT,
    defaultValue: ''
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  indexes: [
    { fields: ['rol', 'estado'] }
  ]
})

export default Usuario;
