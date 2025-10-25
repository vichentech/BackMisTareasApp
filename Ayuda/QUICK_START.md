# 🚀 GUÍA RÁPIDA DE DESPLIEGUE

## Pasos para Desplegar en VPS (Modo Desarrollo)

### 1️⃣ Preparar la VPS

```bash
# Conectar a la VPS
ssh usuario@tu-vps-ip

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Cerrar sesión y volver a conectar
exit
ssh usuario@tu-vps-ip

# Verificar Docker
docker --version
docker compose version
```

### 2️⃣ Configurar Firewall

```bash
sudo apt install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
sudo ufw status
```

### 3️⃣ Transferir el Proyecto

**Opción A: Usando Git**
```bash
cd ~
git clone https://github.com/tu-usuario/tu-repo.git mispartes-backend
cd mispartes-backend
```

**Opción B: Usando SCP (desde tu máquina local)**
```bash
# En tu máquina local
cd /ruta/a/BackendMisPartes
scp -r * usuario@tu-vps-ip:~/mispartes-backend/
```

### 4️⃣ Configurar Variables de Entorno

```bash
cd ~/mispartes-backend
cp .env.example .env
nano .env
```

**Configuración mínima:**
```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://tu-vps-ip:3000,http://localhost:3000

MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=CambiarEsto123!
MONGO_DATABASE=authDB
MONGO_USERNAME=admin
MONGO_PASSWORD=CambiarEsto123!

JWT_SECRET=tu-clave-super-secreta-cambiar-esto-12345
JWT_EXPIRES_IN=24h

BACKEND_PORT=3000
```

**⚠️ IMPORTANTE**: Cambia `MONGO_ROOT_PASSWORD` y `JWT_SECRET`

### 5️⃣ Iniciar la Aplicación

**Opción A: Script Automático**
```bash
chmod +x init-docker.sh
./init-docker.sh
```

**Opción B: Manual**
```bash
docker compose build
docker compose up -d
docker compose logs -f
```

### 6️⃣ Verificar que Funciona

```bash
# Verificar estado
docker compose ps

# Ver logs
docker compose logs backend

# Probar endpoint
curl http://localhost:3000/status
```

### 7️⃣ Crear Usuario Administrador

```bash
curl -X POST http://localhost:3000/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com"
  }'
```

### 8️⃣ Probar Login

```bash
curl -X POST http://localhost:3000/auth/login-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## 📱 Acceder desde tu Aplicación

Configura la URL del backend en tu aplicación:
```
http://tu-vps-ip:3000
```

---

## 🛠️ Comandos Útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Reiniciar servicios
docker compose restart

# Detener servicios
docker compose stop

# Iniciar servicios
docker compose start

# Detener y eliminar todo
docker compose down

# Ver estado
docker compose ps

# Acceder al contenedor
docker compose exec backend sh
```

---

## 🔧 Solución de Problemas Comunes

### Backend no inicia
```bash
docker compose logs backend
docker compose restart backend
```

### No puedo acceder desde fuera
```bash
# Verificar firewall
sudo ufw status

# Verificar que el puerto está abierto
sudo netstat -tulpn | grep 3000
```

### MongoDB no conecta
```bash
docker compose logs mongodb
docker compose restart mongodb
```

### Actualizar la aplicación
```bash
docker compose down
git pull  # o transferir archivos nuevos
docker compose build
docker compose up -d
```

---

## 📊 Monitoreo

```bash
# Ver uso de recursos
docker stats

# Ver logs de las últimas 100 líneas
docker compose logs backend --tail=100

# Seguir logs
docker compose logs -f backend
```

---

## 🔐 Seguridad

✅ Cambiar contraseñas por defecto
✅ Usar JWT_SECRET fuerte
✅ Configurar firewall
✅ No exponer MongoDB (puerto 27017)
✅ Hacer backups regulares

---

## 📞 ¿Necesitas Ayuda?

1. Revisa `DEPLOYMENT_GUIDE.md` para guía completa
2. Consulta los logs: `docker compose logs -f`
3. Verifica el estado: `docker compose ps`

---

## 🎯 Checklist Rápido

- [ ] Docker instalado
- [ ] Firewall configurado
- [ ] Proyecto transferido
- [ ] .env configurado
- [ ] Contenedores corriendo
- [ ] /status responde
- [ ] Admin creado
- [ ] Login funciona

**¡Listo para usar!** 🎉
