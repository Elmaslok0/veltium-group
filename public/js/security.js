/**
 * Utilidades de seguridad para el sitio web de Veltium Group
 * Este archivo contiene funciones para proteger datos sensibles y prevenir vulnerabilidades comunes
 */

// Importar módulos necesarios
const crypto = require('crypto');
const xss = require('xss');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const validator = require('validator');

// Función para sanitizar entradas de texto (prevenir XSS)
const sanitizeInput = (input) => {
  if (!input) return '';
  
  // Usar la librería xss para eliminar scripts maliciosos
  return xss(input);
};

// Función para validar y sanitizar un objeto completo
const sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
  }
  
  return sanitized;
};

// Función para encriptar datos sensibles
const encryptData = (data, encryptionKey) => {
  if (!data) return null;
  
  try {
    // Generar un IV aleatorio
    const iv = crypto.randomBytes(16);
    
    // Crear cipher con AES-256-CBC
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
    
    // Encriptar los datos
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Devolver IV y datos encriptados
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Error al encriptar datos:', error);
    return null;
  }
};

// Función para desencriptar datos
const decryptData = (encryptedData, encryptionKey) => {
  if (!encryptedData) return null;
  
  try {
    // Separar IV y datos encriptados
    const parts = encryptedData.split(':');
    if (parts.length !== 2) return null;
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Crear decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
    
    // Desencriptar los datos
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error al desencriptar datos:', error);
    return null;
  }
};

// Función para generar una clave de encriptación segura
const generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Función para validar datos según tipo
const validateData = (data, type) => {
  if (data === undefined || data === null) return false;
  
  switch (type) {
    case 'email':
      return validator.isEmail(data);
    case 'phone':
      return validator.isMobilePhone(data, 'any');
    case 'url':
      return validator.isURL(data);
    case 'date':
      return validator.isDate(data);
    case 'number':
      return validator.isNumeric(data);
    case 'alpha':
      return validator.isAlpha(data);
    case 'alphanumeric':
      return validator.isAlphanumeric(data);
    default:
      return true;
  }
};

// Configuración de Helmet para seguridad HTTP
const configureHelmet = (app) => {
  app.use(helmet());
  
  // Configurar Content Security Policy
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  }));
  
  // Configurar X-XSS-Protection
  app.use(helmet.xssFilter());
  
  // Prevenir clickjacking
  app.use(helmet.frameguard({ action: 'deny' }));
  
  // Prevenir MIME type sniffing
  app.use(helmet.noSniff());
  
  // Configurar Referrer Policy
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
};

// Configuración de limitador de tasa para prevenir ataques de fuerza bruta
const configureRateLimit = (app) => {
  // Limitador general
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 solicitudes por ventana
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente después de 15 minutos'
  });
  
  // Limitador para autenticación
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // Límite de 5 intentos por hora
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiados intentos de inicio de sesión, por favor intente nuevamente después de 1 hora'
  });
  
  // Aplicar limitadores
  app.use('/', generalLimiter);
  app.use('/admin/login', authLimiter);
};

// Configuración de protección CSRF
const configureCsrf = (app) => {
  // Configurar middleware CSRF
  app.use(csrf({ cookie: true }));
  
  // Manejar errores CSRF
  app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    
    // Manejar error CSRF
    res.status(403).json({
      success: false,
      message: 'Error de validación CSRF. Por favor, recargue la página e intente nuevamente.'
    });
  });
  
  // Proporcionar token CSRF a las vistas
  app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });
};

// Función para validar y sanitizar archivos
const validateFile = (file, allowedTypes, maxSizeMB) => {
  if (!file) return { valid: false, message: 'No se proporcionó ningún archivo' };
  
  // Validar tamaño
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      message: `El archivo excede el tamaño máximo permitido de ${maxSizeMB}MB`
    };
  }
  
  // Validar tipo MIME
  if (!allowedTypes.includes(file.mimetype)) {
    return { 
      valid: false, 
      message: 'Tipo de archivo no permitido'
    };
  }
  
  // Validar extensión
  const extension = file.originalname.split('.').pop().toLowerCase();
  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'];
  
  if (!allowedExtensions.includes(extension)) {
    return { 
      valid: false, 
      message: 'Extensión de archivo no permitida'
    };
  }
  
  return { valid: true, message: 'Archivo válido' };
};

// Función para generar nombres de archivo seguros
const generateSecureFilename = (originalFilename) => {
  // Extraer extensión
  const extension = originalFilename.split('.').pop().toLowerCase();
  
  // Generar nombre aleatorio
  const randomName = crypto.randomBytes(16).toString('hex');
  
  // Devolver nombre seguro con extensión original
  return `${randomName}.${extension}`;
};

// Exportar funciones
module.exports = {
  sanitizeInput,
  sanitizeObject,
  encryptData,
  decryptData,
  generateEncryptionKey,
  validateData,
  configureHelmet,
  configureRateLimit,
  configureCsrf,
  validateFile,
  generateSecureFilename
};
