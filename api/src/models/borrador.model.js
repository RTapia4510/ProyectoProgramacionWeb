import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Borrador del formulario de registro de trabajo (uno por estudiante).
const Borrador = sequelize.define('Borrador', {
  usuarioId: { 
    type: DataTypes.STRING, 
    primaryKey: true, 
    references: { model: 'usuarios', key: 'id' }, 
    onDelete: 'CASCADE' 
  },
  datos: { 
    type: DataTypes.JSONB, 
    allowNull: false 
  },
},{
  tableName: 'borradores',
  timestamps: true
})

export default Borrador;
