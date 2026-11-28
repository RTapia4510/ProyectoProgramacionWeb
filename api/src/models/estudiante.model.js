import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Estudiante = sequelize.define('Estudiante', {
  idUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  carrera: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ciclo: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'estudiantes',
  timestamps: true
});

export default Estudiante;
