import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { idColumna, opcionesTabla } from './columnas.js';

const Trabajo = sequelize.define('Trabajo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  titulo: { 
    type: DataTypes.STRING,
     allowNull: false 
  },
  linea: { type: DataTypes.STRING(80), allowNull: false },
  carrera: { type: DataTypes.STRING(80), allowNull: false },
  estado: { type: DataTypes.STRING(14), allowNull: false, defaultValue: 'propuesta', validate: { isIn: [['propuesta', 'en_desarrollo', 'concluido', 'desistido']] } },
  resumen: { type: DataTypes.TEXT, allowNull: false },
  objetivos: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  palabras: { type: DataTypes.ARRAY(DataTypes.STRING(60)), allowNull: false, defaultValue: [] },
  registrado: { type: DataTypes.DATEONLY, allowNull: false },
  motivoEstado: { type: DataTypes.TEXT, defaultValue: '' },
  cerradoEn: { type: DataTypes.DATEONLY },
  historialAsesoria: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
}, opcionesTabla('trabajos', { indexes: [{ fields: ['estado'] }] }));

export default Trabajo;
