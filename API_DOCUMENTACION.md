## Requisitos de Credenciales

### Username:
- Mínimo 3 caracteres
- Máximo 50 caracteres
- Solo puede contener letras, números, guiones (-) y guiones bajos (_)
- Debe ser único en el sistema

### Password:
- **Mínimo 3 caracteres** ✨ (actualizado)
- Máximo 100 caracteres
- Se almacena hasheada con bcrypt (nunca en texto plano)




### 5. POST /auth/change-password
**Propósito:** Permite a un usuario cambiar su propia contraseña.

**Request Body:**
```json
{
  "username": "nombre_del_usuario_actual",
  "currentPassword": "la_contraseña_actual",
  "newPassword": "la_nueva_contraseña"
}

Respuesta Exitosa (200 OK):
{
  "success": true,
  "message": "Contraseña actualizada correctamente."
}

Respuesta de Error (403 Forbidden):
{
  "success": false,
  "message": "La contraseña actual es incorrecta."
}

Respuesta de Error (404 Not Found):
{
  "success": false,
  "message": "Usuario no encontrado."
}

Respuesta de Error (400 Bad Request):
{
  "success": false,
  "message": "La nueva contraseña debe ser diferente a la actual."
}

6. POST /auth/admin-change-password
Propósito: Permite a un administrador cambiar la contraseña de cualquier usuario.

Request Body:
{
  "targetUsername": "usuario_a_modificar",
  "newPassword": "la_nueva_contraseña_para_ese_usuario"
}

Respuesta Exitosa (200 OK):
{
  "success": true,
  "message": "Contraseña del usuario actualizada por el administrador."
}

Respuesta de Error (404 Not Found):
{
  "success": false,
  "message": "Usuario no encontrado."
}

Respuesta de Error (400 Bad Request):
{
  "success": false,
  "message": "La nueva contraseña no cumple los requisitos."
}


---

---

## Endpoints de Configuración - Listas Maestras

### 1. GET /config/master-lists
**Propósito:** Obtener las listas maestras globales (Proyectos, Tareas Principales, Vehículos).

**Autenticación:** No requerida (público)

**Respuesta Exitosa (200 OK):**
```json
{
  "projects": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "pnr": "PROJ-001",
      "pnm": "Proyecto Principal"
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "pnr": "PROJ-002",
      "pnm": "Proyecto Secundario"
    }
  ],
  "mainTasks": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "name": "Mantenimiento General"
    },
    {
      "id": "8f14e45f-ceea-467a-9538-1c83e6c52e7a",
      "name": "Revisión de Problemas"
    }
  ],
  "vehicles": [
    {
      "id": "9b2d5b4e-3f8a-4c7d-9e1f-2a3b4c5d6e7f",
      "name": "Furgoneta-01"
    },
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Camión-01"
    }
  ],
  "updatedAt": "2024-08-15T12:30:00.000Z"
}