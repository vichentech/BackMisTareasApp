# 🚀 Backend MisPartes - API de Sincronización

Backend Node.js con Express y MongoDB para la aplicación de gestión de partes de trabajo.

## 📋 Características

- ✅ Autenticación JWT con roles (admin/user)
- ✅ Sincronización de datos de usuario
- ✅ Gestión de listas personales (proyectos, tareas, vehículos)
- ✅ Listas maestras configurables
- ✅ Rate limiting y seguridad con Helmet
- ✅ Logging detallado en desarrollo
- ✅ Configuración inicial automática
- ✅ Docker y Docker Compose
- ✅ Healthchecks integrados

## 🛠️ Tecnologías

- **Node.js** 18+
- **Express** 4.x
- **MongoDB** 7.0
- **JWT** para autenticación
- **Docker** para contenedorización
- **Bcrypt** para encriptación de contraseñas

## 📦 Instalación Local

### Requisitos
- Node.js 18+
- MongoDB 7.0+
- npm o yarn

### Pasos

```bash
# Clonar repositorio
git clone <tu-repo>
cd BackendMisPartes

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env

# Iniciar servidor
npm start

# O en modo desarrollo
npm run dev
```

## 🐳 Instalación con Docker (Recomendado)

### 🚀 Inicio Rápido

```bash
# Configurar variables de entorno
cp .env.example .env
nano .env

# Iniciar con script automático (Linux/Mac)
chmod +x init-docker.sh
./init-docker.sh

# O manualmente
docker compose up -d
```

### Comandos Docker

```bash
# Ver logs
docker compose logs -f

# Reiniciar
docker compose restart

# Detener
docker compose stop

# Eliminar todo
docker compose down -v
```

## 📚 Documentación

### 📖 Guías de Instalación y Despliegue
- **[DOCKER_SETUP_SUMMARY.md](DOCKER_SETUP_SUMMARY.md)** - 📋 Resumen ejecutivo con todos los pasos
- **[QUICK_START.md](QUICK_START.md)** - ⚡ Guía rápida de despliegue (5 minutos)
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - 📚 Guía completa de despliegue en VPS
- **[WINDOWS_GUIDE.md](WINDOWS_GUIDE.md)** - 🪟 Guía específica para Windows

### 📡 Documentación de API
- **[DOCUMENTACION_ENDPOINTS_LISTAS.md](DOCUMENTACION_ENDPOINTS_LISTAS.md)** - Endpoints de listas personales
- **[Ejemplos_Uso_Endpoints.txt](Ejemplos_Uso_Endpoints.txt)** - Ejemplos de uso de endpoints

### 🛠️ Scripts Disponibles
- **`init-docker.sh`** - Script de inicialización automática (Linux/Mac)
- **`test-backend.ps1`** - Script de prueba para Windows PowerShell

## 🔌 Endpoints Principales

### Health Check
- `HEAD /` - Prueba de conexión
- `GET /status` - Estado del servidor

### Configuración Inicial
- `GET /setup/status` - Verificar si necesita configuración
- `POST /setup/create-admin` - Crear primer administrador

### Autenticación
- `POST /auth/login` - Login de usuario
- `POST /auth/login-admin` - Login de administrador
- `POST /auth/refresh` - Refrescar token
- `POST /auth/verify` - Verificar token

### Datos de Usuario (Requiere JWT)
- `GET /data/timestamps/:username` - Obtener timestamps
- `POST /data/months/:username` - Obtener datos de meses
- `PUT /data/months/:username` - Actualizar datos de meses
- `GET /data/users` - Listar usuarios

### Listas Personales (Requiere JWT)
- `GET /data/lists/:username` - Obtener listas personales
- `POST /data/lists/:username` - Actualizar listas personales

### Configuración (Requiere JWT)
- `GET /config/master-lists` - Obtener listas maestras
- `POST /config/master-lists` - Actualizar listas maestras (Admin)

### Administración (Requiere JWT Admin)
- `POST /admin/users` - Crear nuevo usuario

## 🔐 Variables de Entorno

```env
# Servidor
PORT=3000
NODE_ENV=development

# MongoDB
MONGO_CONNECTION_STRING=mongodb://localhost:27017
MONGO_USERNAME=admin
MONGO_PASSWORD=password
AUTH_DB_NAME=authDB

# JWT
JWT_SECRET=tu-clave-secreta
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Ver `.env.example` para configuración completa.

## 🧪 Testing

```bash
# Probar endpoint de status
curl http://localhost:3000/status

# Crear usuario admin
curl -X POST http://localhost:3000/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","email":"admin@example.com"}'

# Login
curl -X POST http://localhost:3000/auth/login-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Scripts de prueba
node test-admin-create-user.js
node test-lists-endpoints.js
```

## 📁 Estructura del Proyecto

```
BackendMisPartes/
├── controllers/        # Controladores de rutas
├── middleware/         # Middlewares personalizados
├── models/            # Modelos de datos
├── routes/            # Definición de rutas
├── scripts/           # Scripts de utilidad
├── services/          # Lógica de negocio
├── server.js          # Punto de entrada
├── Dockerfile         # Configuración Docker
├── docker-compose.yml # Orquestación de servicios
└── .env              # Variables de entorno
```

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Rate limiting
- ✅ Helmet para headers de seguridad
- ✅ CORS configurable
- ✅ Validación de entrada
- ✅ Roles de usuario (admin/user)

## 🚀 Despliegue en Producción

### VPS con Docker

1. Sigue la guía en [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Configura Nginx como reverse proxy
3. Instala certificado SSL con Let's Encrypt
4. Configura backups automáticos

### Variables de Producción

```env
NODE_ENV=production
ALLOWED_ORIGINS=https://tu-dominio.com
JWT_SECRET=clave-super-segura-aleatoria
MONGO_ROOT_PASSWORD=password-muy-segura
```

## 📊 Monitoreo

```bash
# Ver logs
docker compose logs -f backend

# Ver recursos
docker stats

# Estado de servicios
docker compose ps
```

## 🔄 Actualización

```bash
# Detener servicios
docker compose down

# Actualizar código
git pull

# Reconstruir y reiniciar
docker compose build
docker compose up -d
```

## 🐛 Solución de Problemas

Ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) sección "Solución de Problemas"

## 📝 Licencia

ISC

## 👥 Autor

Tu nombre/organización

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📞 Soporte

Para problemas o preguntas:
- Revisa la documentación
- Consulta los logs: `docker compose logs -f`
- Abre un issue en GitHub

---

**¡Listo para usar!** 🎉
