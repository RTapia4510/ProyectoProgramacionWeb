// Catálogos y datos semilla (contrato de datos: usuario, trabajo, solicitud, entregable, avance, sustentación).
import { addDays, cap } from '../services/dates.jsx';

export const LINEAS = ['Ciencia de datos aplicada', 'Gestión de operaciones', 'Automatización y control', 'Innovación educativa', 'Sostenibilidad urbana', 'Ingeniería de software'];
export const DEPARTAMENTOS = ['Ingeniería de Sistemas', 'Ingeniería Industrial', 'Ingeniería Civil', 'Estudios Generales'];
export const CARRERAS = ['Ingeniería de Sistemas', 'Ingeniería Industrial', 'Ingeniería Civil'];
export const CICLOS = ['Séptimo', 'Octavo', 'Noveno', 'Décimo'];
export const GRADOS = ['Ingeniero', 'Magíster', 'Doctor'];
export const TITULOS = { Ingeniero: 'Ing.', 'Magíster': 'Mg.', Doctor: 'Dr.' };
export const SALAS = ['A-402', 'A-403', 'B-201', 'B-205'];
export const SALA_LABEL = { 'A-402': 'A-402 · pabellón A · 30 asientos', 'A-403': 'A-403 · pabellón A · 24 asientos', 'B-201': 'B-201 · pabellón B · 40 asientos', 'B-205': 'B-205 · pabellón B · 20 asientos' };
export const HORAS = ['08:00', '09:00', '10:00', '11:00', '15:00', '16:00'];
export const MODALIDADES = ['Presencial', 'Virtual', 'Híbrida'];
export const SEMESTRE = { ini: '2026-08-10', fin: '2026-12-19' };
export const VENTANA_SUST = { ini: '2026-12-07', fin: '2026-12-19' };
export const ETAPAS = [
  { n: 1, nombre: 'Registro de propuestas', ini: '2026-08-10', fin: '2026-08-28' },
  { n: 2, nombre: 'Asignación de asesores', ini: '2026-08-31', fin: '2026-09-11' },
  { n: 3, nombre: 'Desarrollo y entregables', ini: '2026-09-14', fin: '2026-11-20' },
  { n: 4, nombre: 'Informe final', ini: '2026-11-23', fin: '2026-12-04' },
  { n: 5, nombre: 'Sustentaciones', ini: '2026-12-07', fin: '2026-12-19' },
];
export const PLANTILLA = [
  { nombre: 'Plan de investigación', peso: 15, descripcion: 'Alcance, justificación y cronograma del trabajo.' },
  { nombre: 'Marco teórico', peso: 20, descripcion: 'Revisión de literatura y fundamentos conceptuales.' },
  { nombre: 'Diseño metodológico', peso: 20, descripcion: 'Método, muestra, técnicas e instrumentos.' },
  { nombre: 'Resultados preliminares', peso: 20, descripcion: 'Primeros resultados y análisis.' },
  { nombre: 'Informe final', peso: 25, descripcion: 'Documento completo del trabajo de fin de carrera.' },
];
export const FECHAS_PLANTILLA = ['2026-09-18', '2026-10-02', '2026-10-23', '2026-11-13', '2026-11-27'];
export const CRITERIOS = [
  { id: 'rigor', nombre: 'Rigor metodológico', peso: 30 },
  { id: 'resultados', nombre: 'Resultados y análisis', peso: 30 },
  { id: 'informe', nombre: 'Calidad del informe', peso: 20 },
  { id: 'exposicion', nombre: 'Exposición y defensa', peso: 20 },
];
export const REQ_ADMIN = { nombre: 'Entrega de informe impreso', fecha: '2026-09-18', descripcion: 'Requisito administrativo de la oficina TFC · no tiene peso' };

const base = { password: 'Demo1234', estado: 'activo' };
const est = (id, nombres, apellidos, mail, codigo, carrera, ciclo = 'Décimo', extra = {}) => ({
  ...base, id, rol: 'estudiante', nombres, apellidos, email: `${mail}@aloe.ulima.edu.pe`, codigo, carrera, ciclo, telefono: '987 654 321', ...extra,
});
const ase = (id, titulo, grado, nombres, apellidos, mail, depto, lineas, cupoMax, ocupadosBase, tiempoRevision, asesorados, experiencia, extra = {}) => ({
  ...base, id, rol: 'asesor', titulo, grado, nombres, apellidos, email: `${mail}@ulima.edu.pe`, telefono: '999 111 222', departamento: depto,
  lineas, cupoMax, ocupadosBase, tiempoRevision, asesorados, concluidos: Math.round(asesorados * 0.85), jurados: 6, juradosBase: 0, experiencia, conflictos: {}, ...extra,
});

export function createSeed() {
  const usuarios = [
    est('e1', 'Rosa Elena', 'Quispe Mendoza', 'rquispe', '20211357', 'Ingeniería de Sistemas'),
    est('e2', 'Diego Alonso', 'Ramírez Puente', 'dramirez', '20210984', 'Ingeniería de Sistemas'),
    est('e3', 'Bruno Matías', 'Palomino Chávez', 'bpalomino', '20211044', 'Ingeniería de Sistemas', 'Noveno'),
    est('e4', 'Diana Carolina', 'Rojas Ttito', 'drojas', '20210466', 'Ingeniería Industrial'),
    est('e5', 'Jorge Luis', 'Tapia Bendezú', 'jtapia', '20210771', 'Ingeniería Industrial'),
    est('e6', 'Ana Lucía', 'Ferreyra Loza', 'aferreyra', '20211120', 'Ingeniería Industrial'),
    est('e7', 'Karla Sofía', 'Aguirre Ynga', 'kaguirre', '20211203', 'Ingeniería Civil'),
    est('e8', 'Milagros Beatriz', 'Ccahuana Solís', 'mccahuana', '20211311', 'Ingeniería de Sistemas'),
    est('e9', 'Renzo', 'Alvarado Pinto', 'ralvarado', '20211402', 'Ingeniería de Sistemas'),
    est('e10', 'Camila', 'Ninahuanca Soto', 'cninahuanca', '20211255', 'Ingeniería Civil'),
    est('e11', 'Luis', 'Mendoza Quiroz', 'lmendoza', '20210877', 'Ingeniería Civil'),
    est('e12', 'Valeria', 'Ynga Torres', 'vynga', '20211018', 'Ingeniería Civil'),
    est('e13', 'Marco', 'Bustamante Villa', 'mbustamante', '20210932', 'Ingeniería Industrial'),
    est('e14', 'Paola', 'Solís Aguilar', 'psolis', '20211077', 'Ingeniería Industrial'),
    est('e15', 'Andrea', 'Ttito Salas', 'attito', '20211166', 'Ingeniería Industrial'),
    est('e16', 'Mateo', 'Cárcamo Rivas', 'mcarcamo', '20210845', 'Ingeniería Industrial'),
    est('e17', 'Sofía', 'Ocampo Díaz', 'socampo', '20210799', 'Ingeniería Civil'),
    est('e18', 'Rafael', 'Loza Paredes', 'rloza', '20210812', 'Ingeniería Civil'),
    est('e19', 'Lucero', 'Paredes Quiroz', 'lparedes', '20211290', 'Ingeniería de Sistemas'),
    est('e20', 'Joaquín', 'Rivera Tello', 'jrivera', '20211333', 'Ingeniería de Sistemas', 'Noveno'),
    est('e21', 'Ricardo', 'Neyra Huerta', 'rneyra', '20210655', 'Ingeniería Civil', 'Décimo', { estado: 'bloqueado', motivoBloqueo: 'Retiro del semestre solicitado por la Secretaría Académica.' }),
    ase('a1', 'Dra.', 'Doctor', 'Mariela', 'Quispe Ramos', 'mquispe', 'Ingeniería de Sistemas', ['Ciencia de datos aplicada', 'Innovación educativa', 'Ingeniería de software'], 6, 0, 2.4, 34,
      'Doce años como docente investigadora en analítica educativa. Ha asesorado 34 trabajos de fin de carrera, con publicaciones sobre predicción de rendimiento académico y minería de datos en plataformas virtuales.', { concluidos: 29, jurados: 11, juradosBase: 0 }),
    ase('a2', 'Mg.', 'Magíster', 'Julio César', 'Vargas Aliaga', 'jvargas', 'Ingeniería Industrial', ['Gestión de operaciones'], 5, 1, 1.9, 15,
      'Simulación de procesos y logística urbana. Consultor en cadenas de suministro para pymes de Lima.'),
    ase('a3', 'Dra.', 'Doctor', 'Gabriela', 'Torres Anchante', 'gtorres', 'Estudios Generales', ['Automatización y control', 'Innovación educativa'], 5, 2, 2.7, 6,
      'Instrumentación para laboratorios y didáctica de la ingeniería.', { conflictos: { t012: 'dictó clases al equipo en 2026-1', t006: 'dictó clases al equipo en 2026-1' } }),
    ase('a4', 'Mg.', 'Magíster', 'Andrés', 'Chávez Ninahuanca', 'achavez', 'Ingeniería Industrial', ['Automatización y control'], 6, 2, 2.2, 8,
      'Visión artificial en líneas de producción y control estadístico de calidad.'),
    ase('a5', 'Dr.', 'Doctor', 'Pedro', 'Salazar Huamán', 'psalazar', 'Ingeniería de Sistemas', ['Automatización y control', 'Ingeniería de software'], 5, 3, 2.0, 12,
      'Sistemas embebidos, sensórica e internet de las cosas.', { juradosBase: 1 }),
    ase('a6', 'Mg.', 'Magíster', 'Sandra', 'Bustamante Ríos', 'sbustamante', 'Ingeniería Industrial', ['Automatización y control', 'Gestión de operaciones'], 4, 2, 3.8, 15,
      'Simulación de procesos y mejora continua.', { juradosBase: 2 }),
    ase('a7', 'Ing.', 'Ingeniero', 'Luis Fernando', 'Ocampo Salas', 'locampo', 'Ingeniería Civil', ['Automatización y control'], 5, 4, 5.1, 20,
      'Monitoreo estructural y ambiental con sensores.', { juradosBase: 3 }),
    ase('a8', 'Dr.', 'Doctor', 'Ricardo', 'Cárdenas Loyza', 'rcardenas', 'Ingeniería Civil', ['Sostenibilidad urbana'], 4, 3, 2.8, 18,
      'Resiliencia urbana y gestión de riesgos en laderas.', { juradosBase: 1 }),
    ase('a9', 'Mg.', 'Magíster', 'Héctor', 'Mendoza Cárcamo', 'hmendoza', 'Ingeniería Civil', ['Automatización y control', 'Sostenibilidad urbana'], 6, 5, 3.1, 9,
      'Monitoreo ambiental con sensores de bajo costo.'),
    ase('a10', 'Dr.', 'Doctor', 'Hugo', 'Lazo Medina', 'hlazo', 'Ingeniería de Sistemas', [], 0, 0, 0, 0, '', { estado: 'por_validar', solicitadoEl: '2026-09-02' }),
    ase('a11', 'Mg.', 'Magíster', 'Carolina', 'Ibáñez Ruiz', 'cibanez', 'Ingeniería Industrial', [], 0, 0, 0, 0, '', { estado: 'por_validar', solicitadoEl: '2026-09-04' }),
    { ...base, id: 'ad1', rol: 'admin', nombres: 'Carmen Rosa', apellidos: 'Velásquez Ayala', email: 'cvelasquez@ulima.edu.pe', telefono: '999 000 111', departamento: 'Coordinación TFC' },
  ];

  const T = (n, titulo, linea, carrera, estado, responsableId, integrantes, asesorId, resumen, extra = {}) => ({
    id: `t${n}`, codigo: `TFC-2026-2-${n}`, titulo, linea, carrera, estado, responsableId, integrantes, asesorId,
    resumen, objetivos: '1. Construir la base de información. 2. Desarrollar y comparar alternativas. 3. Validar con el usuario final.',
    palabras: ['investigación', 'ingeniería', 'análisis'], registrado: '2026-08-20', motivoEstado: '', cerradoEn: null, ...extra,
  });
  const trabajos = [
    T('047', 'Modelo predictivo de deserción en estudiantes de primer ciclo', 'Ciencia de datos aplicada', 'Ingeniería de Sistemas', 'en_desarrollo', 'e1', ['e1', 'e2'], 'a1',
      'Se propone un modelo de clasificación que estime la probabilidad de deserción de estudiantes de primer ciclo a partir de datos académicos y de asistencia del periodo 2022-2025, con el fin de anticipar intervenciones de tutoría.',
      { registrado: '2026-08-18', palabras: ['deserción', 'aprendizaje automático', 'primer ciclo'], objetivos: '1. Construir la base analítica del periodo 2022-2025. 2. Entrenar y comparar tres modelos de clasificación. 3. Validar el modelo con la Oficina de Tutoría.' }),
    T('012', 'Optimización de rutas de reparto para comercios de Lima Metropolitana', 'Gestión de operaciones', 'Ingeniería Industrial', 'concluido', 'e4', ['e4', 'e5'], 'a2',
      'Se diseñó un modelo de ruteo con ventanas de tiempo para 42 comercios de abarrotes de Lima Metropolitana, con una reducción simulada de 18% en distancia recorrida frente a la operación actual.',
      { registrado: '2026-08-12', cerradoEn: '2026-09-05', motivoEstado: 'Informe final aprobado por el asesor.', palabras: ['ruteo', 'logística', 'Lima'] }),
    T('051', 'Automatización del control de calidad en líneas de envasado de conservas', 'Automatización y control', 'Ingeniería Industrial', 'propuesta', 'e5', ['e5', 'e6'], null,
      'Se propone un sistema de visión artificial que detecte defectos de sellado en latas de conserva sobre la línea de envasado, con alertas en tiempo real al operario y registro histórico para control estadístico de calidad.',
      { registrado: '2026-08-26', palabras: ['visión artificial', 'control de calidad', 'envasado'] }),
    T('029', 'Detección temprana de fallas en bombas de agua mediante señales de vibración', 'Ciencia de datos aplicada', 'Ingeniería Civil', 'propuesta', 'e7', ['e7', 'e3'], null,
      'Análisis de señales de vibración para anticipar fallas en bombas de agua de una planta de tratamiento.', { registrado: '2026-08-25' }),
    T('018', 'Plataforma de tutoría entre pares para cursos de matemática básica', 'Innovación educativa', 'Ingeniería de Sistemas', 'en_desarrollo', 'e8', ['e8'], 'a1',
      'Plataforma web que conecta estudiantes avanzados con ingresantes para tutorías de matemática básica.', { registrado: '2026-08-14' }),
    T('006', 'Clasificación automática de reclamos ciudadanos en municipalidades distritales', 'Ciencia de datos aplicada', 'Ingeniería de Sistemas', 'concluido', 'e3', ['e3', 'e6'], 'a1',
      'Modelo de clasificación de texto para derivar reclamos ciudadanos al área municipal correspondiente.', { registrado: '2026-08-11', cerradoEn: '2026-09-05', motivoEstado: 'Informe final aprobado por la asesora.' }),
    T('033', 'Tablero de indicadores de asistencia para colegios públicos de Lima Sur', 'Innovación educativa', 'Ingeniería de Sistemas', 'propuesta', 'e9', ['e9'], null,
      'Tablero de indicadores de asistencia escolar para apoyar la gestión de directores de colegios públicos.', { registrado: '2026-08-27' }),
    T('021', 'Evaluación de techos verdes en la reducción de isla de calor en San Isidro', 'Sostenibilidad urbana', 'Ingeniería Civil', 'en_desarrollo', 'e11', ['e11', 'e12'], 'a7',
      'Medición del efecto de techos verdes sobre la temperatura superficial en edificios de San Isidro.', { registrado: '2026-08-15' }),
    T('040', 'Reducción de mermas en almacenes de productos perecibles en Lima Norte', 'Gestión de operaciones', 'Ingeniería Industrial', 'en_desarrollo', 'e13', ['e13', 'e14'], 'a2',
      'Propuesta de mejora de inventarios y rotación para reducir mermas en almacenes de perecibles.', { registrado: '2026-08-13' }),
    T('055', 'Monitoreo de calidad del aire con sensores de bajo costo en Ate', 'Automatización y control', 'Ingeniería Civil', 'propuesta', 'e10', ['e10'], null,
      'Red de sensores de bajo costo para monitoreo de material particulado en Ate.', { registrado: '2026-08-28' }),
    T('024', 'Programación de turnos en policlínicos municipales con simulación discreta', 'Gestión de operaciones', 'Ingeniería Industrial', 'en_desarrollo', 'e15', ['e15', 'e16'], 'a6',
      'Simulación discreta para programar turnos de personal en policlínicos municipales.', { registrado: '2026-08-16' }),
    T('009', 'Refuerzo estructural de viviendas autoconstruidas en laderas de Carabayllo', 'Sostenibilidad urbana', 'Ingeniería Civil', 'desistido', 'e17', ['e17', 'e18'], 'a8',
      'Alternativas de refuerzo para viviendas autoconstruidas en laderas.', { registrado: '2026-08-10', cerradoEn: '2026-09-01', motivoEstado: 'El equipo no logró acceso a las viviendas para la toma de datos en campo.' }),
  ];

  const entregables = [];
  const avances = [];
  const C = (id, autorId, rol, texto, fecha) => ({ id, autorId, rol, texto, fecha });
  const mk = (eid, v, descripcion, fechaEntrega, estado, fechaRevision, comentarios, retraso = false) =>
    avances.push({ id: `${eid}-v${v}`, entregableId: eid, version: v, enlace: `https://drive.google.com/file/d/${eid}-v${v}`, descripcion, fechaEntrega, estado, retraso, fechaRevision, comentarios });
  const plan = (tid, aid, fechas, aprobados) =>
    PLANTILLA.forEach((p, i) => {
      const id = `${tid}-e${i + 1}`;
      entregables.push({ id, trabajoId: tid, orden: i + 1, nombre: p.nombre, descripcion: p.descripcion, fechaLimite: fechas[i], peso: p.peso, obligatorio: true });
      if (i < aprobados) {
        const ent = cap(addDays(fechas[i], -3));
        const rev = cap(addDays(ent, 2));
        mk(id, 1, 'Primera versión del entregable.', ent, 'aprobado', rev, [C(`${id}-c1`, aid, 'asesor', 'Aprobado. Cumple con lo solicitado.', rev)]);
      }
    });
  const EARLY = ['2026-08-14', '2026-08-21', '2026-08-28', '2026-09-04', '2026-11-27'];
  const FIN = ['2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-04'];

  // 047 (Rosa): 55%, con un entregable vencido sin presentar
  plan('t047', 'a1', ['2026-08-28', '2026-09-18', '2026-10-09', '2026-08-30', '2026-11-27'], 0);
  mk('t047-e1', 1, 'Versión inicial con alcance y cronograma.', '2026-08-14', 'observado', '2026-08-16', [C('k1', 'a1', 'asesor', 'Falta delimitar el alcance a una sola facultad y agregar el cronograma Gantt.', '2026-08-16')]);
  mk('t047-e1', 2, 'Se agregó el cronograma Gantt.', '2026-08-20', 'observado', '2026-08-22', [C('k2', 'a1', 'asesor', 'El alcance sigue siendo muy amplio; limítalo a una facultad.', '2026-08-22')]);
  mk('t047-e1', 3, 'Se incorporó el cronograma Gantt y se ajustó el alcance a una sola facultad, según lo observado en la versión 2.', '2026-08-26', 'aprobado', '2026-08-29', [C('k3', 'a1', 'asesor', 'Aprobado. Alcance y cronograma coherentes con el semestre.', '2026-08-29')]);
  mk('t047-e2', 1, 'Marco teórico con 24 fuentes de los últimos cinco años.', '2026-08-30', 'aprobado', '2026-09-02', [C('k4', 'a1', 'asesor', 'Aprobado. Buena revisión de literatura.', '2026-09-02')]);
  mk('t047-e3', 1, 'Diseño metodológico con partición simple de los datos.', '2026-08-26', 'observado', '2026-08-30', [C('k5', 'a1', 'asesor', 'Falta justificar el tamaño de muestra y precisar la técnica de validación. Revisa también la definición operativa de «deserción».', '2026-08-30')]);
  mk('t047-e3', 2, 'Se añadió el cálculo del tamaño de muestra (n=384) y se reemplazó la partición simple por validación cruzada de 5 pliegues, según lo observado en la versión 1.', '2026-09-01', 'aprobado', '2026-09-04', [
    C('k6', 'e1', 'estudiante', 'Corregido en la versión 2. Adoptamos la definición de la Oficina de Registro: dos ciclos consecutivos sin matrícula.', '2026-09-01'),
    C('k7', 'a1', 'asesor', 'Metodología correcta. Pasa a resultados preliminares con la muestra estratificada por carrera.', '2026-09-04')]);

  plan('t012', 'a2', FIN, 5);
  plan('t006', 'a1', FIN, 5);
  plan('t018', 'a1', ['2026-08-21', '2026-08-24', '2026-09-04', '2026-09-25', '2026-11-27'], 1);
  mk('t018-e2', 1, 'Marco teórico sobre tutoría entre pares.', '2026-08-25', 'entregado', null, [], true);
  mk('t018-e3', 1, 'Diseño metodológico del piloto con 40 estudiantes.', '2026-09-02', 'entregado', null, []);
  plan('t021', 'a7', EARLY, 2);
  plan('t040', 'a2', EARLY, 4);
  plan('t024', 'a6', EARLY, 1);
  plan('t009', 'a8', EARLY, 1);

  const S = (id, trabajoId, asesorId, fecha, estado, mensaje, extra = {}) => ({ id, trabajoId, asesorId, fecha, estado, mensaje, fechaResolucion: null, motivo: '', ...extra });
  const OK = { fechaResolucion: '2026-08-21' };
  const solicitudes = [
    S('s1', 't029', 'a1', '2026-09-01', 'pendiente', 'Su trabajo sobre analítica predictiva en mantenimiento fue el punto de partida de nuestra propuesta. Contamos con 14 meses de registros de vibración de la planta de Lurín.'),
    S('s2', 't033', 'a1', '2026-09-03', 'pendiente', 'Trabajo con la UGEL 01 y necesito orientación metodológica para validar los indicadores con los directores de tres colegios.'),
    S('s3', 't055', 'a3', '2026-09-02', 'pendiente', 'Buscamos asesoría en instrumentación; contamos con tres sensores y acceso a la estación de Ate.'),
    S('s4', 't047', 'a1', '2026-08-19', 'aceptada', 'Nos interesa su línea de analítica educativa.', OK),
    S('s5', 't018', 'a1', '2026-08-15', 'aceptada', 'Queremos validar la plataforma con estudiantes de primer ciclo.', OK),
    S('s6', 't006', 'a1', '2026-08-12', 'aceptada', 'Clasificación de texto aplicada a gestión pública.', OK),
    S('s7', 't012', 'a2', '2026-08-13', 'aceptada', 'Optimización de rutas con datos reales.', OK),
    S('s8', 't040', 'a2', '2026-08-14', 'aceptada', 'Mermas en perecibles.', OK),
    S('s9', 't021', 'a7', '2026-08-16', 'aceptada', 'Techos verdes y confort térmico.', OK),
    S('s10', 't024', 'a6', '2026-08-17', 'aceptada', 'Simulación de turnos.', OK),
    S('s11', 't009', 'a8', '2026-08-11', 'aceptada', 'Refuerzo estructural en laderas.', OK),
    S('s12', 't051', 'a7', '2026-08-30', 'rechazada', 'Visión artificial en conservas.', { fechaResolucion: '2026-09-03', motivo: 'Cupo completo desde el 03/09/2026.' }),
  ];

  const sustentaciones = [
    { id: 'su1', trabajoId: 't012', fecha: '2026-12-11', hora: '10:00', sala: 'A-402', modalidad: 'Presencial', jurado: ['a8', 'a6', 'a7'], presidenteId: 'a8', estado: 'programada', programadaEl: '2026-09-05', acta: null },
  ];

  return { usuarios, trabajos, solicitudes, entregables, avances, sustentaciones, borradores: {} };
}
