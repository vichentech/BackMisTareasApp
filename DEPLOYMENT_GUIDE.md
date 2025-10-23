# 🚀 GUÍA DE DESPLIEGUE EN VPS CON DOCKER

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Preparación del Servidor VPS](#preparación-del-servidor-vps)
3. [Instalación de Docker](#instalación-de-docker)
4. [Configuración del Proyecto](#configuración-del-proyecto)
5. [Despliegue en Modo Desarrollo](#despliegue-en-modo-desarrollo)
6. [Despliegue en Modo Producción](#despliegue-en-modo-producción)
7. [Comandos Útiles](#comandos-útiles)
8. [Solución de Problemas](#solución-de-problemas)

---

## 📦 Requisitos Previos

### En tu máquina local:
- Git instalado
- Acceso SSH a la VPS
- Cliente SFTP/SCP (opcional, para transferir archivos)

### En la VPS:
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Mínimo 2GB RAM
- Mínimo 20GB espacio en disco
- Acceso root o sudo
- Puertos disponibles: 3000 (backend), 27017 (MongoDB)

---

## 🖥️ Preparación del Servidor VPS

### 1. Conectarse a la VPS

```bash
ssh usuario@tu-vps-ip
```

### 2. Actualizar el sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Instalar herramientas básicas

```bash
sudo apt install -y curl wget git nano ufw
```

### 4. Configurar Firewall (UFW)

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir puerto del backend
sudo ufw allow 3000/tcp

# Permitir MongoDB (solo si necesitas acceso externo)
# sudo ufw allow 27017/tcp

# Habilitar firewall
sudo ufw enable
sudo ufw status
```

---

## 🐳 Instalación de Docker

### Opción 1: Script Automático (Recomendado)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Importante**: Cierra sesión y vuelve a conectarte para que los cambios surtan efecto.

### Opción 2: Instalación Manual (Ubuntu/Debian)

```bash
# Instalar dependencias
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Agregar clave GPG de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar repositorio
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

### Verificar instalación

```bash
docker --version
docker compose version
```

---

## ⚙️ Configuración del Proyecto

### 1. Crear directorio del proyecto

```bash
mkdir -p ~/mispartes-backend
cd ~/mispartes-backend
```

### 2. Transferir archivos al servidor

**Opción A: Usando Git (Recomendado)**

```bash
# Si tienes el proyecto en un repositorio Git
git clone https://github.com/tu-usuario/tu-repo.git .
```

**Opción B: Usando SCP desde tu máquina local**

```bash
# Desde tu máquina local (no en la VPS)
cd /ruta/a/tu/proyecto/local
scp -r * usuario@tu-vps-ip:~/mispartes-backend/
```

**Opción C: Usando SFTP**

```bash
# Desde tu máquina local
sftp usuario@tu-vps-ip
put -r /ruta/local/proyecto/* /home/usuario/mispartes-backend/
```

### 3. Configurar variables de entorno

```bash
cd ~/mispartes-backend

# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env
nano .env
```

**Configuración mínima para desarrollo:**

```env
# Servidor
PORT=3000
NODE_ENV=development

# CORS - Agregar la IP de tu VPS
ALLOWED_ORIGINS=http://tu-vps-ip:3000,http://localhost:3000

# MongoDB
MONGO_CONNECTION_STRING=mongodb://mongodb:27017
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=TuPasswordSegura123!
MONGO_DATABASE=authDB
MONGO_PORT=27017
MONGO_USERNAME=admin
MONGO_PASSWORD=TuPasswordSegura123!
MONGO_TIMEOUT=10000
AUTH_DB_NAME=authDB

# JWT - CAMBIAR ESTOS VALORES
JWT_SECRET=tu-clave-secreta-muy-segura-cambiar-en-produccion-12345
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Docker
BACKEND_PORT=3000
```

**⚠️ IMPORTANTE**: Cambia los valores de `MONGO_ROOT_PASSWORD` y `JWT_SECRET` por valores seguros.

---

## 🔧 Despliegue en Modo Desarrollo

### 1. Construir y levantar los contenedores

```bash
cd ~/mispartes-backend

# Construir las imágenes
docker compose build

# Levantar los servicios
docker compose up -d
```

### 2. Verificar que los contenedores están corriendo

```bash
docker compose ps
```

Deberías ver algo como:

```
NAME                    STATUS              PORTS
mispartes-backend       Up 30 seconds       0.0.0.0:3000->3000/tcp
mispartes-mongodb       Up 30 seconds       0.0.0.0:27017->27017/tcp
```

### 3. Ver los logs

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs solo del backend
docker compose logs -f backend

# Ver logs solo de MongoDB
docker compose logs -f mongodb
```

### 4. Verificar que el backend está funcionando

```bash
# Desde la VPS
curl http://localhost:3000/status

# Desde tu máquina local
curl http://tu-vps-ip:3000/status
```

Deberías recibir una respuesta JSON con el estado del servidor.

### 5. Crear el primer usuario administrador

```bash
# Opción 1: Usando el endpoint de setup
curl -X POST http://localhost:3000/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com"
  }'

# Opción 2: Ejecutar script dentro del contenedor
docker compose exec backend node scripts/createAdminUser.js
```

### 6. Probar el login

```bash
curl -X POST http://localhost:3000/auth/login-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## 🚀 Despliegue en Modo Producción

### 1. Modificar el archivo .env

```bash
nano .env
```

Cambiar:

```env
NODE_ENV=production
ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

### 2. Reconstruir y reiniciar

```bash
docker compose down
docker compose build
docker compose up -d
```

### 3. Configurar Nginx como Reverse Proxy (Recomendado)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/mispartes
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/mispartes /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 4. Configurar SSL con Let's Encrypt (Opcional pero recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Renovación automática (ya está configurada por defecto)
sudo certbot renew --dry-run
```

---

## 🛠️ Comandos Útiles

### Gestión de contenedores

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Reiniciar servicios
docker compose restart

# Detener servicios
docker compose stop

# Iniciar servicios
docker compose start

# Detener y eliminar contenedores
docker compose down

# Detener y eliminar contenedores + volúmenes (⚠️ BORRA LA BASE DE DATOS)
docker compose down -v

# Reconstruir imágenes
docker compose build --no-cache

# Actualizar y reiniciar
docker compose up -d --build
```

### Acceso a contenedores

```bash
# Acceder al contenedor del backend
docker compose exec backend sh

# Acceder a MongoDB
docker compose exec mongodb mongosh -u admin -p TuPassword

# Ver archivos del backend
docker compose exec backend ls -la

# Ejecutar comandos en el backend
docker compose exec backend node scripts/createAdminUser.js
```

### Monitoreo

```bash
# Ver uso de recursos
docker stats

# Ver logs de un servicio específico
docker compose logs backend --tail=100

# Seguir logs de un servicio
docker compose logs -f backend
```

### Backup de MongoDB

```bash
# Crear backup
docker compose exec mongodb mongodump \
  --username=admin \
  --password=TuPassword \
  --authenticationDatabase=admin \
  --out=/data/backup

# Copiar backup a la máquina host
docker cp mispartes-mongodb:/data/backup ./backup-$(date +%Y%m%d)

# Restaurar backup
docker compose exec mongodb mongorestore \
  --username=admin \
  --password=TuPassword \
  --authenticationDatabase=admin \
  /data/backup
```

---

## 🔍 Solución de Problemas

### El backend no se conecta a MongoDB

```bash
# Verificar que MongoDB está corriendo
docker compose ps mongodb

# Ver logs de MongoDB
docker compose logs mongodb

# Verificar la red
docker network ls
docker network inspect mispartes-backend_app-network

# Reiniciar MongoDB
docker compose restart mongodb
```

### Error de permisos

```bash
# Verificar permisos del directorio
ls -la ~/mispartes-backend

# Cambiar propietario si es necesario
sudo chown -R $USER:$USER ~/mispartes-backend
```

### El contenedor se reinicia constantemente

```bash
# Ver logs para identificar el error
docker compose logs backend

# Verificar el healthcheck
docker inspect mispartes-backend | grep -A 10 Health
```

### No puedo acceder desde fuera de la VPS

```bash
# Verificar que el puerto está abierto
sudo ufw status

# Verificar que el servicio está escuchando
sudo netstat -tulpn | grep 3000

# Verificar que Docker está exponiendo el puerto
docker compose ps
```

### Actualizar la aplicación

```bash
# Detener servicios
docker compose down

# Actualizar código (si usas Git)
git pull

# Reconstruir y reiniciar
docker compose build
docker compose up -d

# Verificar logs
docker compose logs -f
```

### Limpiar Docker (liberar espacio)

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes no usadas
docker image prune -a

# Eliminar volúmenes no usados
docker volume prune

# Limpiar todo (⚠️ cuidado)
docker system prune -a --volumes
```

---

## 📊 Monitoreo y Mantenimiento

### Configurar reinicio automático

Los contenedores ya están configurados con `restart: unless-stopped`, lo que significa que se reiniciarán automáticamente si fallan o si el servidor se reinicia.

### Logs rotativos

```bash
# Configurar límite de logs en docker-compose.yml
# Agregar a cada servicio:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Monitoreo con cron

```bash
# Crear script de monitoreo
nano ~/check-backend.sh
```

Contenido:

```bash
#!/bin/bash
if ! curl -f http://localhost:3000/status > /dev/null 2>&1; then
    echo "Backend down, restarting..."
    cd ~/mispartes-backend && docker compose restart backend
fi
```

```bash
# Dar permisos
chmod +x ~/check-backend.sh

# Agregar a crontab (cada 5 minutos)
crontab -e
# Agregar: */5 * * * * /home/usuario/check-backend.sh
```

---

## 🎯 Checklist de Despliegue

- [ ] VPS configurada y actualizada
- [ ] Docker y Docker Compose instalados
- [ ] Firewall configurado
- [ ] Proyecto transferido al servidor
- [ ] Archivo .env configurado con valores seguros
- [ ] Contenedores construidos y corriendo
- [ ] Backend responde en /status
- [ ] Usuario administrador creado
- [ ] Login funciona correctamente
- [ ] Endpoints probados
- [ ] Nginx configurado (producción)
- [ ] SSL configurado (producción)
- [ ] Backup de MongoDB configurado
- [ ] Monitoreo configurado

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker compose logs -f`
2. Verifica el estado: `docker compose ps`
3. Consulta la documentación de endpoints
4. Revisa los archivos de configuración

---

## 🔐 Seguridad

### Recomendaciones importantes:

1. **Cambiar contraseñas por defecto**
2. **Usar JWT_SECRET fuerte y único**
3. **Configurar firewall correctamente**
4. **Usar HTTPS en producción**
5. **Mantener Docker actualizado**
6. **Hacer backups regulares**
7. **Monitorear logs de acceso**
8. **Limitar acceso SSH**
9. **Usar fail2ban para proteger SSH**
10. **No exponer MongoDB al exterior**

---

**¡Listo! Tu aplicación debería estar corriendo en Docker en tu VPS.**
