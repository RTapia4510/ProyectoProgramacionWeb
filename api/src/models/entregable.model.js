import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Entregable = sequelize.define('Entregable', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orden: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  nombre: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  descripcion: { 
    type: DataTypes.TEXT, 
    allowNull: false, 
    defaultValue: '' 
  },
  fechaLimite: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },
  peso: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    validate: { min: 1, max: 100 } 
  },
  obligatorio: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false, 
    defaultValue: true 
  },
},{
  tableName: 'entregables',
  timestamps: true,
  indexes: [
    { fields: ['trabajo_id', 'orden'] }
  ]
})

export default Entregable;
