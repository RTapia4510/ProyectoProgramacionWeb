import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Comentario = sequelize.define('Comentario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rol: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  texto: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  fecha: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },
}, {
  tableName: 'comentarios',
  timestamps: true
});

export default Comentario;
