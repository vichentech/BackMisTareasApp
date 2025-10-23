# ✅ CHECKLIST DE DESPLIEGUE

## 📋 Antes de Empezar

- [ ] Tengo acceso a una VPS (Ubuntu/Debian)
- [ ] Tengo las credenciales SSH de la VPS
- [ ] Conozco la IP de mi VPS: `___________________`
- [ ] Tengo Git instalado en mi PC
- [ ] Tengo el proyecto BackendMisPartes en mi PC

---

## 🖥️ FASE 1: Preparar la VPS

### Conexión Inicial
- [ ] Conectado a la VPS: `ssh usuario@tu-vps-ip`
- [ ] Sistema actualizado: `sudo apt update && sudo apt upgrade -y`

### Instalación de Docker
- [ ] Docker instalado: `curl -fsSL https://get.docker.com -o get-docker.sh`
- [ ] Script ejecutado: `sudo sh get-docker.sh`
- [ ] Usuario agregado al grupo: `sudo usermod -aG docker $USER`
- [ ] Sesión reiniciada (salir y volver a conectar)
- [ ] Docker verificado: `docker --version`
- [ ] Docker Compose verificado: `docker compose version`

### Configuración de Firewall
- [ ] UFW instalado: `sudo apt install -y ufw`
- [ ] Puerto SSH permitido: `sudo ufw allow 22/tcp`
- [ ] Puerto backend permitido: `sudo ufw allow 3000/tcp`
- [ ] Firewall habilitado: `sudo ufw enable`
- [ ] Estado verificado: `sudo ufw status`

---

## 📦 FASE 2: Transferir el Proyecto

### Opción A: Usando Git
- [ ] Repositorio clonado: `git clone <tu-repo> mispartes-backend`
- [ ] Directorio accedido: `cd mispartes-backend`

### Opción B: Usando SCP (desde Windows)
- [ ] Archivos transferidos: `scp -r * usuario@tu-vps-ip:~/mispartes-backend/`
- [ ] Directorio accedido en VPS: `cd ~/mispartes-backend`

### Verificación
- [ ] Archivos presentes: `ls -la`
- [ ] Dockerfile presente
- [ ] docker-compose.yml presente
- [ ] .env.example presente
- [ ] init-docker.sh presente

---

## ⚙️ FASE 3: Configurar Variables de Entorno

- [ ] Archivo .env creado: `cp .env.example .env`
- [ ] Archivo .env editado: `nano .env`

### Variables Configuradas
- [ ] `PORT=3000`
- [ ] `NODE_ENV=development` (o `production`)
- [ ] `ALLOWED_ORIGINS=http://TU-VPS-IP:3000` ⚠️ Cambiar TU-VPS-IP
- [ ] `MONGO_ROOT_USER=admin`
- [ ] `MONGO_ROOT_PASSWORD=___________` ⚠️ Cambiar por contraseña segura
- [ ] `MONGO_USERNAME=admin`
- [ ] `MONGO_PASSWORD=___________` ⚠️ Misma contraseña que arriba
- [ ] `JWT_SECRET=___________` ⚠️ Cambiar por clave segura (32+ caracteres)
- [ ] `JWT_EXPIRES_IN=24h`
- [ ] `BACKEND_PORT=3000`

### Guardar y Salir
- [ ] Guardado: `Ctrl + O`, `Enter`
- [ ] Salir: `Ctrl + X`

---

## 🚀 FASE 4: Iniciar la Aplicación

### Opción A: Script Automático
- [ ] Permisos dados: `chmod +x init-docker.sh`
- [ ] Script ejecutado: `./init-docker.sh`
- [ ] Script completado sin errores

### Opción B: Manual
- [ ] Imágenes construidas: `docker compose build`
- [ ] Servicios iniciados: `docker compose up -d`
- [ ] Esperado 10-15 segundos

### Verificación
- [ ] Estado verificado: `docker compose ps`
- [ ] Backend corriendo (status: Up)
- [ ] MongoDB corriendo (status: Up)
- [ ] Logs revisados: `docker compose logs backend --tail=20`
- [ ] Sin errores críticos en logs

---

## 🔍 FASE 5: Verificar Funcionamiento

### Desde la VPS
- [ ] Status OK: `curl http://localhost:3000/status`
- [ ] Respuesta JSON recibida

### Desde tu PC (Windows)
- [ ] Status OK desde navegador: `http://TU-VPS-IP:3000/status`
- [ ] O con PowerShell: `Invoke-WebRequest -Uri http://TU-VPS-IP:3000/status`
- [ ] Respuesta JSON recibida

### Verificar Setup
- [ ] Setup status: `curl http://localhost:3000/setup/status`
- [ ] Respuesta indica si necesita configuración

---

## 👤 FASE 6: Crear Usuario Administrador

### Desde la VPS
```bash
curl -X POST http://localhost:3000/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","email":"admin@example.com"}'
```

- [ ] Comando ejecutado
- [ ] Respuesta exitosa recibida
- [ ] Usuario creado

### Credenciales Anotadas
- [ ] Username: `___________`
- [ ] Password: `___________`
- [ ] Email: `___________`

---

## 🔐 FASE 7: Probar Login

### Desde la VPS
```bash
curl -X POST http://localhost:3000/auth/login-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

- [ ] Comando ejecutado
- [ ] Token JWT recibido
- [ ] Login exitoso

### Desde Windows (PowerShell)
- [ ] Script ejecutado: `.\test-backend.ps1 -VpsIp "TU-VPS-IP"`
- [ ] Todas las pruebas pasadas

---

## 📱 FASE 8: Configurar Aplicación

### En tu App (Android/iOS/Web)
- [ ] URL configurada: `http://TU-VPS-IP:3000`
- [ ] Conexión probada desde la app
- [ ] Login funciona desde la app
- [ ] Sincronización funciona

---

## 🧪 FASE 9: Pruebas Finales

### Endpoints Básicos
- [ ] `GET /status` - OK
- [ ] `GET /setup/status` - OK
- [ ] `POST /setup/create-admin` - OK
- [ ] `POST /auth/login-admin` - OK
- [ ] `POST /auth/verify` - OK (con token)

### Endpoints de Datos (con token)
- [ ] `GET /data/users` - OK
- [ ] `GET /data/timestamps/:username` - OK
- [ ] `GET /data/lists/:username` - OK

### Desde la Aplicación
- [ ] Login funciona
- [ ] Sincronización de datos funciona
- [ ] Listas personales funcionan
- [ ] Timestamps se actualizan

---

## 🔧 FASE 10: Configuración Adicional (Opcional)

### Monitoreo
- [ ] Script de monitoreo configurado
- [ ] Logs revisados regularmente

### Backups
- [ ] Script de backup de MongoDB creado
- [ ] Backup manual probado
- [ ] Cron job configurado (opcional)

### Seguridad Adicional
- [ ] SSH con clave (sin password)
- [ ] fail2ban instalado
- [ ] Contraseñas fuertes verificadas

### Producción (si aplica)
- [ ] Nginx instalado y configurado
- [ ] Certificado SSL instalado (Let's Encrypt)
- [ ] Dominio configurado
- [ ] `NODE_ENV=production` en .env
- [ ] `ALLOWED_ORIGINS` actualizado con dominio

---

## 📊 VERIFICACIÓN FINAL

### Estado del Sistema
- [ ] `docker compose ps` - Todos los servicios Up
- [ ] `docker compose logs -f` - Sin errores
- [ ] `docker stats` - Uso de recursos normal

### Conectividad
- [ ] Backend accesible desde VPS
- [ ] Backend accesible desde tu PC
- [ ] Backend accesible desde la app
- [ ] MongoDB solo accesible internamente

### Funcionalidad
- [ ] Autenticación funciona
- [ ] Endpoints protegidos requieren token
- [ ] Sincronización de datos funciona
- [ ] Listas personales funcionan
- [ ] Rate limiting activo

---

## 🎯 RESULTADO FINAL

### ✅ TODO LISTO SI:
- [x] Todos los servicios corriendo
- [x] Backend responde correctamente
- [x] Usuario admin creado
- [x] Login funciona
- [x] App conectada y funcionando
- [x] Sin errores en logs

### 📝 INFORMACIÓN IMPORTANTE

**URL del Backend:** `http://___________________:3000`

**Credenciales Admin:**
- Username: `___________`
- Password: `___________`

**Comandos Útiles:**
```bash
# Conectar a VPS
ssh usuario@tu-vps-ip

# Ver logs
docker compose logs -f

# Ver estado
docker compose ps

# Reiniciar
docker compose restart

# Detener
docker compose stop

# Actualizar
docker compose down
git pull
docker compose build
docker compose up -d
```

---

## 📞 SOPORTE

Si algo no funciona:

1. **Revisar logs:**
   ```bash
   docker compose logs -f backend
   docker compose logs -f mongodb
   ```

2. **Verificar estado:**
   ```bash
   docker compose ps
   docker stats
   ```

3. **Consultar documentación:**
   - DEPLOYMENT_GUIDE.md
   - QUICK_START.md
   - WINDOWS_GUIDE.md

4. **Problemas comunes:**
   - Backend no inicia → Revisar .env
   - No puedo acceder → Verificar firewall
   - MongoDB no conecta → Verificar contraseñas

---

## 🎉 ¡FELICIDADES!

Si completaste todos los pasos, tu backend está funcionando correctamente en Docker en tu VPS.

**Próximos pasos:**
1. Probar todas las funcionalidades desde tu app
2. Configurar backups automáticos
3. Monitorear logs regularmente
4. Considerar configurar HTTPS para producción

---

**Fecha de despliegue:** `___________`
**Versión:** `___________`
**Notas adicionales:**
```
___________________________________________
___________________________________________
___________________________________________
```
