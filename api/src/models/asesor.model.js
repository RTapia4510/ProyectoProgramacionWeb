import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Asesor = sequelize.define('Asesor', {
  idUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },

  titulo: {
    type: DataTypes.STRING
  },

  grado: {
    type: DataTypes.STRING
  },

  departamento: {
    type: DataTypes.STRING
  },

  lineas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },

  experiencia: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },

  cupoMax: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },

  ocupadosBase: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  tiempoRevision: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },

  asesorados: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  concluidos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  jurados: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  juradosBase: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  conflictos: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },

  solicitadoEl: {
    type: DataTypes.DATEONLY
  }

}, {
  tableName: 'asesores',
  timestamps: true
});

export default Asesor;
