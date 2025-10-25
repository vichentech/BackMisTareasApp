# Guía para Sincronizar Archivos con Git

## 📊 Estado Actual

Según `git status`, tienes los siguientes archivos listos para commit:

```
Changes to be committed:
  ✅ new file:   README.md
  ✅ new file:   TROUBLESHOOTING.md
  ✅ modified:   middleware/errorHandler.js
  ✅ modified:   package-lock.json
  ✅ modified:   package.json
  ✅ modified:   server.js
  ✅ modified:   services/mongoService.js
  ✅ new file:   test-connection.js
```

Los archivos ya están en el área de staging (staged), lo que significa que están listos para hacer commit.

## 🔍 Posibles Problemas y Soluciones

### Problema 1: Usuario de Git no configurado

Si no has configurado tu usuario de Git, necesitas hacerlo antes de hacer commit.

**Solución:**

```bash
# Configurar tu nombre (usa tu nombre real o usuario de GitHub)
git config --global user.name "Tu Nombre"

# Configurar tu email (usa el email de tu cuenta de GitHub)
git config --global user.email "tu_email@ejemplo.com"
```

**Ejemplo:**
```bash
git config --global user.name "vichentech"
git config --global user.email "tu_email@gmail.com"
```

### Problema 2: Archivo .env en el repositorio

⚠️ **IMPORTANTE**: El archivo `.env` contiene información sensible (contraseñas, credenciales) y **NO DEBE** subirse a GitHub.

**Solución:**

1. **Verificar si .env está en staging:**
   ```bash
   git status
   ```

2. **Si .env aparece en la lista, quítalo del staging:**
   ```bash
   git reset HEAD .env
   ```

3. **Crear/actualizar .gitignore:**
   ```bash
   echo .env >> .gitignore
   ```

4. **Si .env ya fue commiteado antes, eliminarlo del historial:**
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from repository"
   ```

### Problema 3: Autenticación con GitHub

GitHub ya no permite autenticación con contraseña. Necesitas usar un **Personal Access Token (PAT)** o **SSH**.

#### Opción A: Usar Personal Access Token (Recomendado para principiantes)

1. **Crear un token en GitHub:**
   - Ve a: https://github.com/settings/tokens
   - Click en "Generate new token" → "Generate new token (classic)"
   - Dale un nombre descriptivo (ej: "BackendMisPartes")
   - Selecciona los permisos: `repo` (todos los sub-permisos)
   - Click en "Generate token"
   - **¡COPIA EL TOKEN INMEDIATAMENTE!** (no podrás verlo de nuevo)

2. **Usar el token al hacer push:**
   ```bash
   git push
   ```
   - Cuando te pida usuario: ingresa tu usuario de GitHub
   - Cuando te pida contraseña: **pega el token** (no tu contraseña)

3. **Guardar el token para no ingresarlo cada vez:**
   ```bash
   # Windows
   git config --global credential.helper wincred
   
   # Mac
   git config --global credential.helper osxkeychain
   
   # Linux
   git config --global credential.helper store
   ```

#### Opción B: Usar SSH (Más seguro)

1. **Generar clave SSH:**
   ```bash
   ssh-keygen -t ed25519 -C "tu_email@ejemplo.com"
   ```
   - Presiona Enter para aceptar la ubicación por defecto
   - Opcionalmente, ingresa una contraseña

2. **Copiar la clave pública:**
   ```bash
   # Windows (PowerShell)
   Get-Content ~/.ssh/id_ed25519.pub | clip
   
   # Mac/Linux
   cat ~/.ssh/id_ed25519.pub
   ```

3. **Agregar la clave a GitHub:**
   - Ve a: https://github.com/settings/keys
   - Click en "New SSH key"
   - Pega la clave pública
   - Dale un nombre descriptivo

4. **Cambiar la URL del repositorio a SSH:**
   ```bash
   git remote set-url origin git@github.com:vichentech/BackendMisPartes.git
   ```

## 🚀 Pasos para Sincronizar (Orden Correcto)

### 1. Verificar que .env NO esté en staging

```bash
git status
```

Si ves `.env` en la lista, quítalo:
```bash
git reset HEAD .env
echo .env >> .gitignore
```

### 2. Configurar usuario de Git (si no lo has hecho)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu_email@ejemplo.com"
```

### 3. Hacer commit de los cambios

```bash
git commit -m "Mejoras de robustez: manejo de errores, reintentos de conexión y documentación"
```

### 4. Hacer push a GitHub

```bash
git push origin main
```

Si te pide autenticación:
- **Usuario**: tu usuario de GitHub
- **Contraseña**: tu Personal Access Token (NO tu contraseña de GitHub)

## 🔧 Comandos Útiles

### Ver el estado actual
```bash
git status
```

### Ver los commits recientes
```bash
git log --oneline -5
```

### Ver las diferencias de un archivo
```bash
git diff nombre_archivo
```

### Deshacer cambios en staging (antes de commit)
```bash
git reset HEAD nombre_archivo
```

### Ver la configuración actual
```bash
git config --list
```

### Ver la URL del repositorio remoto
```bash
git remote -v
```

## ❌ Errores Comunes

### Error: "fatal: unable to access... Could not resolve host"
**Causa**: Problema de conexión a internet o DNS

**Solución**:
- Verifica tu conexión a internet
- Intenta: `ping github.com`

### Error: "Support for password authentication was removed"
**Causa**: Intentando usar contraseña en lugar de token

**Solución**:
- Usa un Personal Access Token en lugar de tu contraseña
- O configura SSH (ver arriba)

### Error: "Permission denied (publickey)"
**Causa**: Problema con la clave SSH

**Solución**:
- Verifica que la clave SSH esté agregada a GitHub
- O usa HTTPS con Personal Access Token

### Error: "Updates were rejected because the remote contains work"
**Causa**: El repositorio remoto tiene cambios que no tienes localmente

**Solución**:
```bash
# Opción 1: Hacer pull primero
git pull origin main

# Opción 2: Forzar push (¡CUIDADO! Sobrescribe el remoto)
git push -f origin main
```

## 📝 Resumen Rápido

```bash
# 1. Verificar estado
git status

# 2. Asegurarse de que .env NO esté incluido
git reset HEAD .env
echo .env >> .gitignore

# 3. Configurar usuario (si es necesario)
git config --global user.name "Tu Nombre"
git config --global user.email "tu_email@ejemplo.com"

# 4. Hacer commit
git commit -m "Descripción de los cambios"

# 5. Hacer push
git push origin main
```

## 🆘 ¿Necesitas Ayuda?

Si sigues teniendo problemas:

1. **Copia el mensaje de error completo**
2. **Ejecuta estos comandos y comparte el resultado:**
   ```bash
   git status
   git remote -v
   git config user.name
   git config user.email
   ```

3. **Verifica:**
   - ¿Tienes acceso a internet?
   - ¿Puedes acceder a https://github.com/vichentech/BackendMisPartes?
   - ¿Has configurado autenticación (token o SSH)?
