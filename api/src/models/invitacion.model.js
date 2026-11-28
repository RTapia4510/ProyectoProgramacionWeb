import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Invitaciones para registrar coordinadores (administradores).
const Invitacion = sequelize.define('Invitacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
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
    allowNull: false 
  },
  estado: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: 'pendiente', 
    validate: { isIn: [['pendiente', 'aceptada']] } 
  },
  fecha: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },
}, {
  tableName: 'invitaciones',
  timestamps: true
})

export default Invitacion;
