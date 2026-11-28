import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Tokens de un solo uso para restablecer la contraseña (vencen en 60 minutos).
const RecuperacionClave = sequelize.define('RecuperacionClave', {
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
  expiraEn: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  usado: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false, 
    defaultValue: false 
  },
}, {
  tableName: 'recuperaciones_clave',
  timestamps: true
})

export default RecuperacionClave;
