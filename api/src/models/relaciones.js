import Usuario from './Usuario.js';
import Admin from './Admin.js';
import Estudiante from './Estudiante.js';
import Asesor from './Asesor.js';

// Relación Usuario - Admin
Usuario.hasOne(Admin, {
  foreignKey: 'idUsuario',
  as: 'admin',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Admin.belongsTo(Usuario, {
  foreignKey: 'idUsuario',
  as: 'usuario'
});

// Relación Usuario - Estudiante
Usuario.hasOne(Estudiante, {
  foreignKey: 'idUsuario',
  as: 'estudiante',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Estudiante.belongsTo(Usuario, {
  foreignKey: 'idUsuario',
  as: 'usuario'
});

// Relación Usuario - Asesor
Usuario.hasOne(Asesor, {
  foreignKey: 'idUsuario',
  as: 'asesor',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Asesor.belongsTo(Usuario, {
  foreignKey: 'idUsuario',
  as: 'usuario'
});

export {Usuario, Admin, Estudiante, Asesor}
