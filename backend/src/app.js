const express = require('express');
const cors = require('cors');
const oportunidades = require('./data/oportunidades.json');

/**
 * Registro de intereses en memoria.
 * La actividad NO exige base de datos ni persistencia definitiva,
 * por lo que los registros viven solo mientras el servidor está activo.
 */
const intereses = [];

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:4200';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NOMBRE = 100;
const MAX_CORREO = 254;

/**
 * Convierte un identificador a entero de forma ESTRICTA.
 * Number() es demasiado permisivo (Number(true) === 1, Number([3]) === 3, Number('0x3') === 3),
 * así que solo se aceptan enteros reales o cadenas formadas únicamente por dígitos.
 * Retorna null si el valor no es un identificador válido.
 */
function parseId(valor) {
  if (typeof valor === 'number' && Number.isInteger(valor) && valor >= 0) return valor;
  if (typeof valor === 'string' && /^\d+$/.test(valor)) return Number(valor);
  return null;
}

function crearApp() {
  const app = express();

  // CORS: permite que Angular (puerto 4200) consuma esta API (puerto 3000)
  app.use(cors({ origin: FRONTEND_ORIGIN, methods: ['GET', 'POST'] }));
  app.use(express.json());

  // --- Estado del servidor ------------------------------------------------
  app.get('/api', (_req, res) => {
    res.json({ servicio: 'Radar TIC API', estado: 'activo' });
  });

  // --- 2. Consulta de oportunidades --------------------------------------
  app.get('/api/oportunidades', (_req, res) => {
    res.status(200).json(oportunidades);
  });

  // --- 3. Consulta individual --------------------------------------------
  app.get('/api/oportunidades/:id', (req, res) => {
    const id = parseId(req.params.id);
    const oportunidad = id === null ? undefined : oportunidades.find((o) => o.id === id);

    if (!oportunidad) {
      return res
        .status(404)
        .json({ error: `No existe una oportunidad con el identificador "${req.params.id}".` });
    }
    res.status(200).json(oportunidad);
  });

  // --- 4 y 5. Registro de interés con validación -------------------------
  app.post('/api/intereses', (req, res) => {
    const { nombre, correo, oportunidadId } = req.body || {};

    // (a) Campos obligatorios
    const faltantes = [];
    if (typeof nombre !== 'string' || nombre.trim() === '') faltantes.push('nombre');
    if (typeof correo !== 'string' || correo.trim() === '') faltantes.push('correo');
    if (oportunidadId === undefined || oportunidadId === null || oportunidadId === '') {
      faltantes.push('oportunidadId');
    }
    if (faltantes.length > 0) {
      return res.status(400).json({
        error: `Faltan campos obligatorios: ${faltantes.join(', ')}.`,
        camposFaltantes: faltantes,
      });
    }

    // Formato y longitud de los datos
    if (nombre.trim().length > MAX_NOMBRE) {
      return res.status(400).json({ error: `El nombre no puede superar ${MAX_NOMBRE} caracteres.` });
    }
    if (correo.trim().length > MAX_CORREO || !EMAIL_REGEX.test(correo.trim())) {
      return res.status(400).json({ error: 'El correo electrónico no tiene un formato válido.' });
    }
    const id = parseId(oportunidadId);
    if (id === null) {
      return res.status(400).json({ error: 'oportunidadId debe ser un número entero.' });
    }

    // (b) La oportunidad debe existir
    const oportunidad = oportunidades.find((o) => o.id === id);
    if (!oportunidad) {
      return res
        .status(404)
        .json({ error: `La oportunidad con id ${oportunidadId} no existe.` });
    }

    // (c) La oportunidad debe estar disponible
    if (!oportunidad.disponible) {
      return res.status(409).json({
        error: `La oportunidad "${oportunidad.titulo}" ya no se encuentra disponible.`,
      });
    }

    const interes = {
      id: intereses.length + 1,
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      oportunidadId: oportunidad.id,
      fechaRegistro: new Date().toISOString(),
    };
    intereses.push(interes);

    res.status(201).json({
      mensaje: `¡Listo, ${interes.nombre}! Registramos tu interés en "${oportunidad.titulo}".`,
      interes,
    });
  });

  // --- Rutas inexistentes y errores --------------------------------------
  app.use((req, res) => {
    res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
  });

  // JSON mal formado u otros errores no controlados
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'El cuerpo de la solicitud no es un JSON válido.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  });

  return app;
}

module.exports = { crearApp };
