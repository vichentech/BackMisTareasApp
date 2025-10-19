/**
 * Middleware de logging para peticiones HTTP en desarrollo
 * Muestra información detallada de cada petición y respuesta
 */

const requestLogger = (req, res, next) => {
  // Solo activar en desarrollo
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (!isDevelopment) {
    return next();
  }

  // Capturar el tiempo de inicio
  const startTime = Date.now();
  
  // Obtener información de la petición
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent') || 'Unknown';

  // Colores para la consola
  const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    
    // Colores de texto
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    
    // Colores de fondo
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m'
  };

  // Función para obtener color según el método HTTP
  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return colors.green;
      case 'POST': return colors.yellow;
      case 'PUT': return colors.blue;
      case 'PATCH': return colors.cyan;
      case 'DELETE': return colors.red;
      case 'HEAD': return colors.magenta;
      default: return colors.white;
    }
  };

  // Función para obtener color según el código de estado
  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return colors.green;
    if (statusCode >= 300 && statusCode < 400) return colors.cyan;
    if (statusCode >= 400 && statusCode < 500) return colors.yellow;
    if (statusCode >= 500) return colors.red;
    return colors.white;
  };

  // Log de la petición entrante
  console.log('\n' + '═'.repeat(80));
  console.log(`${colors.bright}${colors.cyan}📥 PETICIÓN ENTRANTE${colors.reset}`);
  console.log('─'.repeat(80));
  console.log(`${colors.bright}Timestamp:${colors.reset} ${colors.dim}${timestamp}${colors.reset}`);
  console.log(`${colors.bright}Método:${colors.reset}    ${getMethodColor(method)}${colors.bright}${method}${colors.reset}`);
  console.log(`${colors.bright}URL:${colors.reset}       ${colors.cyan}${url}${colors.reset}`);
  console.log(`${colors.bright}IP:${colors.reset}        ${colors.dim}${ip}${colors.reset}`);
  
  // Mostrar headers importantes
  const authHeader = req.get('authorization');
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7, 27) + '...' 
      : authHeader.substring(0, 20) + '...';
    console.log(`${colors.bright}Auth:${colors.reset}      ${colors.yellow}${token}${colors.reset}`);
  }

  // Mostrar query params si existen
  if (Object.keys(req.query).length > 0) {
    console.log(`${colors.bright}Query:${colors.reset}     ${colors.magenta}${JSON.stringify(req.query)}${colors.reset}`);
  }

  // Mostrar params de ruta si existen
  if (Object.keys(req.params).length > 0) {
    console.log(`${colors.bright}Params:${colors.reset}    ${colors.magenta}${JSON.stringify(req.params)}${colors.reset}`);
  }

  // Mostrar body si existe (limitado para no saturar la consola)
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyStr = JSON.stringify(req.body, null, 2);
    const maxBodyLength = 500;
    
    if (bodyStr.length > maxBodyLength) {
      console.log(`${colors.bright}Body:${colors.reset}      ${colors.dim}${bodyStr.substring(0, maxBodyLength)}...${colors.reset}`);
      console.log(`${colors.dim}           (Body truncado - ${bodyStr.length} caracteres totales)${colors.reset}`);
    } else {
      console.log(`${colors.bright}Body:${colors.reset}`);
      console.log(colors.dim + bodyStr + colors.reset);
    }
  }

  // Capturar la respuesta
  const originalSend = res.send;
  const originalJson = res.json;
  let responseBody;

  // Interceptar res.json()
  res.json = function(data) {
    responseBody = data;
    return originalJson.call(this, data);
  };

  // Interceptar res.send()
  res.send = function(data) {
    responseBody = data;
    return originalSend.call(this, data);
  };

  // Cuando la respuesta termina
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const statusColor = getStatusColor(statusCode);

    console.log('─'.repeat(80));
    console.log(`${colors.bright}${colors.blue}📤 RESPUESTA ENVIADA${colors.reset}`);
    console.log('─'.repeat(80));
    console.log(`${colors.bright}Status:${colors.reset}    ${statusColor}${colors.bright}${statusCode}${colors.reset} ${getStatusText(statusCode)}`);
    console.log(`${colors.bright}Duración:${colors.reset}  ${colors.yellow}${duration}ms${colors.reset}`);

    // Mostrar el body de la respuesta (limitado)
    if (responseBody) {
      try {
        const bodyStr = typeof responseBody === 'string' 
          ? responseBody 
          : JSON.stringify(responseBody, null, 2);
        
        const maxResponseLength = 1000;
        
        if (bodyStr.length > maxResponseLength) {
          console.log(`${colors.bright}Response:${colors.reset}  ${colors.dim}${bodyStr.substring(0, maxResponseLength)}...${colors.reset}`);
          console.log(`${colors.dim}           (Respuesta truncada - ${bodyStr.length} caracteres totales)${colors.reset}`);
        } else {
          console.log(`${colors.bright}Response:${colors.reset}`);
          console.log(colors.dim + bodyStr + colors.reset);
        }
      } catch (error) {
        console.log(`${colors.bright}Response:${colors.reset}  ${colors.dim}[No se pudo parsear]${colors.reset}`);
      }
    }

    console.log('═'.repeat(80) + '\n');
  });

  next();
};

// Función auxiliar para obtener el texto del código de estado
function getStatusText(statusCode) {
  const statusTexts = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  };
  
  return statusTexts[statusCode] || '';
}

module.exports = requestLogger;