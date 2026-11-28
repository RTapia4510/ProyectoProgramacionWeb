import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIn: [['estudiante', 'asesor', 'admin']] }
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'activo',
    validate: { isIn: [['activo', 'bloqueado', 'por_validar']] }
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
