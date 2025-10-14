const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', err);

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      message: 'Error de base de datos',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
  }

  if (err.message.includes('conexión') || err.message.includes('connection')) {
    return res.status(503).json({
      success: false,
      message: 'Error de conexión con la base de datos',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Servicio no disponible'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      error: err.message
    });
  }

  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado por política CORS',
      error: 'Origen no permitido'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = {
  errorHandler
};