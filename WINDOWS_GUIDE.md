# 🪟 GUÍA PARA WINDOWS - Despliegue en VPS

## 📋 Requisitos en tu PC Windows

- Git Bash o PowerShell
- Cliente SSH (incluido en Windows 10+)
- WinSCP o FileZilla (opcional, para transferir archivos)

---

## 🚀 PASOS DESDE WINDOWS

### 1️⃣ Conectar a la VPS desde Windows

**Opción A: PowerShell**
```powershell
ssh usuario@tu-vps-ip
```

**Opción B: Git Bash**
```bash
ssh usuario@tu-vps-ip
```

**Opción C: PuTTY**
- Descargar PuTTY desde https://www.putty.org/
- Configurar conexión con IP de la VPS
- Conectar

---

### 2️⃣ Preparar la VPS (ejecutar en la VPS)

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Salir y volver a conectar
exit
```

Volver a conectar:
```powershell
ssh usuario@tu-vps-ip
```

---

### 3️⃣ Configurar Firewall (en la VPS)

```bash
sudo apt install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
sudo ufw status
```

---

### 4️⃣ Transferir Proyecto desde Windows

**Opción A: Git (Recomendado)**

En la VPS:
```bash
cd ~
git clone https://github.com/tu-usuario/tu-repo.git mispartes-backend
cd mispartes-backend
```

**Opción B: SCP desde PowerShell**

En tu PC Windows (PowerShell):
```powershell
# Navegar a tu proyecto
cd C:\Proyectos\IA\BackendMisPartes

# Transferir archivos
scp -r * usuario@tu-vps-ip:~/mispartes-backend/
```

**Opción C: WinSCP (GUI)**

1. Descargar WinSCP: https://winscp.net/
2. Conectar a tu VPS:
   - Host: tu-vps-ip
   - Usuario: tu-usuario
   - Password: tu-password
3. Arrastrar carpeta del proyecto a `/home/usuario/mispartes-backend/`

**Opción D: FileZilla (GUI)**

1. Descargar FileZilla: https://filezilla-project.org/
2. Conectar usando SFTP:
   - Host: sftp://tu-vps-ip
   - Usuario: tu-usuario
   - Password: tu-password
   - Puerto: 22
3. Subir archivos del proyecto

---

### 5️⃣ Configurar Variables de Entorno (en la VPS)

```bash
cd ~/mispartes-backend

# Copiar ejemplo
cp .env.example .env

# Editar con nano
nano .env
```

**Configuración mínima:**
```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://TU-VPS-IP:3000

MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=CambiarEsto123!
MONGO_USERNAME=admin
MONGO_PASSWORD=CambiarEsto123!

JWT_SECRET=clave-super-secreta-cambiar-12345

BACKEND_PORT=3000
```

**Guardar en nano:**
- `Ctrl + O` (guardar)
- `Enter` (confirmar)
- `Ctrl + X` (salir)

---

### 6️⃣ Iniciar Aplicación (en la VPS)

```bash
# Dar permisos al script
chmod +x init-docker.sh

# Ejecutar
./init-docker.sh
```

O manualmente:
```bash
docker compose build
docker compose up -d
```

---

### 7️⃣ Verificar desde Windows

**Desde PowerShell en tu PC:**
```powershell
# Probar endpoint de status
curl http://TU-VPS-IP:3000/status

# O con Invoke-WebRequest
Invoke-WebRequest -Uri http://TU-VPS-IP:3000/status
```

**Desde el navegador:**
```
http://TU-VPS-IP:3000/status
```

---

### 8️⃣ Crear Usuario Admin

**Desde PowerShell en tu PC:**
```powershell
$body = @{
    username = "admin"
    password = "admin123"
    email = "admin@example.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://TU-VPS-IP:3000/setup/create-admin `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**O desde Git Bash:**
```bash
curl -X POST http://TU-VPS-IP:3000/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","email":"admin@example.com"}'
```

**O usando Postman:**
1. Descargar Postman: https://www.postman.com/
2. Crear nueva request POST
3. URL: `http://TU-VPS-IP:3000/setup/create-admin`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "username": "admin",
  "password": "admin123",
  "email": "admin@example.com"
}
```

---

### 9️⃣ Probar Login

**Desde PowerShell:**
```powershell
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://TU-VPS-IP:3000/auth/login-admin `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**Desde Git Bash:**
```bash
curl -X POST http://TU-VPS-IP:3000/auth/login-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🛠️ Comandos Útiles desde Windows

### Conectar a VPS
```powershell
ssh usuario@tu-vps-ip
```

### Ver logs (una vez conectado a VPS)
```bash
docker compose logs -f
```

### Reiniciar servicios (en VPS)
```bash
docker compose restart
```

### Detener servicios (en VPS)
```bash
docker compose stop
```

### Actualizar código (en VPS)
```bash
docker compose down
git pull
docker compose build
docker compose up -d
```

---

## 📱 Configurar en tu App

En tu aplicación (Android/iOS/Web), configura:

```
URL del Backend: http://TU-VPS-IP:3000
```

Reemplaza `TU-VPS-IP` con la IP real de tu VPS.

---

## 🔧 Herramientas Recomendadas para Windows

### Terminal
- **Windows Terminal** (Recomendado): https://aka.ms/terminal
- **Git Bash**: Incluido con Git for Windows
- **PowerShell 7**: https://github.com/PowerShell/PowerShell

### Transferencia de Archivos
- **WinSCP**: https://winscp.net/ (GUI, fácil de usar)
- **FileZilla**: https://filezilla-project.org/ (GUI)
- **SCP** (línea de comandos, incluido en Windows 10+)

### Cliente SSH
- **OpenSSH** (incluido en Windows 10+)
- **PuTTY**: https://www.putty.org/
- **MobaXterm**: https://mobaxterm.mobatek.net/ (todo en uno)

### Testing de APIs
- **Postman**: https://www.postman.com/
- **Insomnia**: https://insomnia.rest/
- **Thunder Client** (extensión de VS Code)

### Editor de Texto
- **VS Code**: https://code.visualstudio.com/
- **Notepad++**: https://notepad-plus-plus.org/

---

## 🐛 Solución de Problemas en Windows

### No puedo conectar por SSH

**Error: "Connection refused"**
```powershell
# Verificar que el puerto 22 está abierto
Test-NetConnection -ComputerName TU-VPS-IP -Port 22
```

**Error: "Permission denied"**
- Verifica usuario y contraseña
- Asegúrate de tener permisos SSH en la VPS

### SCP no funciona

**Alternativa con PowerShell:**
```powershell
# Usar PSCP (PuTTY SCP)
# Descargar desde: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
pscp -r C:\Proyectos\IA\BackendMisPartes\* usuario@tu-vps-ip:/home/usuario/mispartes-backend/
```

### curl no funciona en PowerShell

**Usar Invoke-WebRequest:**
```powershell
Invoke-WebRequest -Uri http://TU-VPS-IP:3000/status
```

**O instalar curl real:**
```powershell
# Con Chocolatey
choco install curl

# O usar Git Bash que incluye curl
```

### No puedo acceder al backend desde mi PC

1. **Verificar firewall de la VPS:**
```bash
sudo ufw status
sudo ufw allow 3000/tcp
```

2. **Verificar que el servicio está corriendo:**
```bash
docker compose ps
```

3. **Verificar desde la VPS:**
```bash
curl http://localhost:3000/status
```

4. **Verificar firewall de Windows:**
- Abrir "Firewall de Windows Defender"
- Permitir conexiones salientes al puerto 3000

---

## 📊 Monitoreo desde Windows

### Ver logs en tiempo real
```bash
# Conectar a VPS
ssh usuario@tu-vps-ip

# Ver logs
docker compose logs -f backend
```

### Ver estado de servicios
```bash
ssh usuario@tu-vps-ip "docker compose ps"
```

### Script de monitoreo (PowerShell)

Crear archivo `monitor.ps1`:
```powershell
while ($true) {
    try {
        $response = Invoke-WebRequest -Uri http://TU-VPS-IP:3000/status -TimeoutSec 5
        Write-Host "✅ Backend OK - $(Get-Date)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Backend DOWN - $(Get-Date)" -ForegroundColor Red
    }
    Start-Sleep -Seconds 30
}
```

Ejecutar:
```powershell
.\monitor.ps1
```

---

## 🔐 Configurar SSH con Clave (Más Seguro)

### 1. Generar clave SSH en Windows

```powershell
# Generar clave
ssh-keygen -t rsa -b 4096 -C "tu-email@example.com"

# Guardar en: C:\Users\TuUsuario\.ssh\id_rsa
```

### 2. Copiar clave a VPS

```powershell
# Copiar clave pública
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh usuario@tu-vps-ip "cat >> ~/.ssh/authorized_keys"
```

### 3. Conectar sin contraseña

```powershell
ssh usuario@tu-vps-ip
```

---

## 📝 Checklist para Windows

- [ ] Git Bash o PowerShell instalado
- [ ] Cliente SSH funcionando
- [ ] Conexión a VPS exitosa
- [ ] Docker instalado en VPS
- [ ] Firewall configurado en VPS
- [ ] Proyecto transferido a VPS
- [ ] .env configurado
- [ ] Contenedores corriendo
- [ ] Backend responde desde Windows
- [ ] Usuario admin creado
- [ ] Login funciona
- [ ] App configurada con URL correcta

---

## 🎯 Próximos Pasos

1. **Probar todos los endpoints** desde Postman
2. **Configurar tu aplicación** con la URL del backend
3. **Hacer pruebas** de sincronización
4. **Configurar backups** automáticos
5. **Monitorear logs** regularmente

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs en la VPS:**
   ```bash
   ssh usuario@tu-vps-ip
   docker compose logs -f
   ```

2. **Verifica el estado:**
   ```bash
   docker compose ps
   ```

3. **Consulta la documentación:**
   - DEPLOYMENT_GUIDE.md
   - QUICK_START.md
   - README.md

---

**¡Listo para usar desde Windows!** 🎉
