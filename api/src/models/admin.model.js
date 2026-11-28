import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Admin = sequelize.define('Admin', {
  idUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  }

}, {
  tableName: 'admins',
  timestamps: true
});

export default Admin;
