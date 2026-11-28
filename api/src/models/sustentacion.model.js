import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Sustentacion = sequelize.define('Sustentacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },
  hora: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  sala: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  modalidad: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  estado: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: 'programada', 
    validate: { isIn: [['programada', 'reprogramada', 'realizada', 'desaprobada']] } 
  },
  programadaEl: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },
  acta: { 
    type: DataTypes.JSONB 
  },
  actaBorrador: { 
    type: DataTypes.JSONB 
  },
}, {
  tableName: 'sustentaciones',
  timestamps: true,
  indexes: [
    { fields: ['fecha', 'hora', 'sala'] }
  ]
})

export default Sustentacion;
