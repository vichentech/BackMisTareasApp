# ENDPOINTS DE LISTAS PERSONALES DE USUARIO

## Descripción General

Los endpoints de listas personales permiten a los usuarios sincronizar sus listas locales (proyectos, tareas principales y vehículos) con el servidor. Utiliza un modelo de "última escritura gana" (last-write-wins) basado en marcas de tiempo.

---

## 1. OBTENER LISTAS DE USUARIO

### Endpoint
```
GET /data/lists/:username
```

### Descripción
Recupera las listas personales de un usuario específico. Si el usuario no tiene listas guardadas, devuelve una estructura vacía por defecto.

### Autenticación
- **Requerida**: Sí (Bearer Token)
- **Permisos**:
  - Usuario `admin`: Puede obtener listas de cualquier usuario
  - Usuario `user`: Solo puede obtener sus propias listas

### Parámetros de URL
- `username` (string, requerido): Nombre del usuario

### Respuesta Exitosa (200 OK)

#### Usuario sin listas (primera vez):
```json
{
  "updatedAt": "1970-01-01T00:00:00.000Z",
  "projects": [],
  "mainTasks": [],
  "vehicles": []
}
```

#### Usuario con listas:
```json
{
  "updatedAt": "2023-10-27T10:00:00.000Z",
  "projects": [
    {
      "id": "uuid-proj-1",
      "pnr": "PRJ-LOCAL-1",
      "pnm": "Proyecto Local A"
    },
    {
      "id": "uuid-proj-2",
      "pnr": "PRJ-LOCAL-2",
      "pnm": "Proyecto Local B"
    }
  ],
  "mainTasks": [
    {
      "id": "uuid-task-1",
      "name": "Mantenimiento Preventivo"
    },
    {
      "id": "uuid-task-2",
      "name": "Reparación"
    }
  ],
  "vehicles": [
    {
      "id": "uuid-veh-1",
      "name": "1234-XYZ"
    }
  ]
}
```

### Errores Posibles

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token no válido o no proporcionado"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "No tienes permisos para acceder a las listas de este usuario"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

### Ejemplo de Uso (cURL)
```bash
curl -X GET http://localhost:3000/data/lists/testuser \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Ejemplo de Uso (JavaScript/Axios)
```javascript
const response = await axios.get('http://localhost:3000/data/lists/testuser', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

console.log(response.data);
```

---

## 2. ACTUALIZAR LISTAS DE USUARIO

### Endpoint
```
POST /data/lists/:username
```

### Descripción
Crea o actualiza completamente las listas personales de un usuario. El servidor reemplaza todo el documento con el contenido enviado y actualiza la marca de tiempo.

### Autenticación
- **Requerida**: Sí (Bearer Token)
- **Permisos**:
  - Usuario `admin`: Puede actualizar listas de cualquier usuario
  - Usuario `user`: Solo puede actualizar sus propias listas

### Parámetros de URL
- `username` (string, requerido): Nombre del usuario

### Body de la Petición
```json
{
  "updatedAt": "2023-10-27T11:30:00.000Z",
  "projects": [
    {
      "id": "uuid-proj-1",
      "pnr": "PRJ-LOCAL-1",
      "pnm": "Proyecto Local A"
    }
  ],
  "mainTasks": [
    {
      "id": "uuid-task-1",
      "name": "Mantenimiento Preventivo"
    }
  ],
  "vehicles": [
    {
      "id": "uuid-veh-1",
      "name": "1234-ABC"
    }
  ]
}
```

### Campos Requeridos
- `projects` (array): Lista de proyectos
- `mainTasks` (array): Lista de tareas principales
- `vehicles` (array): Lista de vehículos

**Nota**: Todos los campos deben ser arrays, aunque estén vacíos.

### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "updatedAt": "2023-10-27T11:30:05.123Z"
}
```

**Importante**: El servidor devuelve su propia marca de tiempo (`updatedAt`), que debe ser utilizada por el cliente para futuras sincronizaciones.

### Errores Posibles

#### 400 Bad Request (Body inválido)
```json
{
  "success": false,
  "message": "El cuerpo de la petición debe ser un objeto JSON válido"
}
```

#### 400 Bad Request (Campos no son arrays)
```json
{
  "success": false,
  "message": "Los campos projects, mainTasks y vehicles deben ser arrays"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token no válido o no proporcionado"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "No tienes permisos para actualizar las listas de este usuario"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

### Ejemplo de Uso (cURL)
```bash
curl -X POST http://localhost:3000/data/lists/testuser \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "updatedAt": "2023-10-27T11:30:00.000Z",
    "projects": [
      {"id": "proj-1", "pnr": "PRJ-001", "pnm": "Proyecto Test"}
    ],
    "mainTasks": [
      {"id": "task-1", "name": "Mantenimiento"}
    ],
    "vehicles": [
      {"id": "veh-1", "name": "1234-ABC"}
    ]
  }'
```

### Ejemplo de Uso (JavaScript/Axios)
```javascript
const listsData = {
  updatedAt: new Date().toISOString(),
  projects: [
    { id: 'proj-1', pnr: 'PRJ-001', pnm: 'Proyecto Test' }
  ],
  mainTasks: [
    { id: 'task-1', name: 'Mantenimiento' }
  ],
  vehicles: [
    { id: 'veh-1', name: '1234-ABC' }
  ]
};

const response = await axios.post(
  'http://localhost:3000/data/lists/testuser',
  listsData,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

console.log('Nueva marca de tiempo del servidor:', response.data.updatedAt);
```

---

## LÓGICA DE SINCRONIZACIÓN (Cliente)

### Flujo Recomendado

1. **Al iniciar la aplicación**:
   ```javascript
   // Obtener listas del servidor
   const serverLists = await getLists(username);
   
   // Comparar marca de tiempo con la local
   if (serverLists.updatedAt > localLists.updatedAt) {
     // El servidor tiene datos más recientes
     localLists = serverLists;
     saveToLocalStorage(localLists);
   } else if (localLists.updatedAt > serverLists.updatedAt) {
     // Los datos locales son más recientes
     const result = await updateLists(username, localLists);
     localLists.updatedAt = result.updatedAt; // Actualizar con timestamp del servidor
     saveToLocalStorage(localLists);
   }
   ```

2. **Al modificar listas localmente**:
   ```javascript
   // Actualizar marca de tiempo local
   localLists.updatedAt = new Date().toISOString();
   
   // Guardar localmente
   saveToLocalStorage(localLists);
   
   // Sincronizar con el servidor
   const result = await updateLists(username, localLists);
   localLists.updatedAt = result.updatedAt; // Usar timestamp del servidor
   saveToLocalStorage(localLists);
   ```

---

## MODELO DE DATOS

### Colección MongoDB: `userlists`

```javascript
{
  username: String,      // Único, indexado
  updatedAt: Date,       // Marca de tiempo de última actualización
  projects: [
    {
      id: String,        // UUID generado por el cliente
      pnr: String,       // Project Number
      pnm: String        // Project Name
    }
  ],
  mainTasks: [
    {
      id: String,        // UUID generado por el cliente
      name: String       // Nombre de la tarea
    }
  ],
  vehicles: [
    {
      id: String,        // UUID generado por el cliente
      name: String       // Identificador del vehículo (ej: matrícula)
    }
  ]
}
```

---

## PRUEBAS

Para probar los endpoints, ejecuta:

```bash
node test-lists-endpoints.js
```

Este script realiza las siguientes pruebas:
1. Login como admin y usuario normal
2. Obtener listas vacías (primera vez)
3. Actualizar listas
4. Obtener listas actualizadas
5. Admin accede a listas de otro usuario
6. Usuario intenta acceder a listas de otro usuario (debe fallar)
7. Intento de actualización sin autenticación (debe fallar)
8. Intento de actualización con datos inválidos (debe fallar)

---

## NOTAS IMPORTANTES

1. **Marca de Tiempo**: Siempre usa la marca de tiempo devuelta por el servidor después de una actualización.

2. **Estructura por Defecto**: Si un usuario no tiene listas, el servidor devuelve una estructura vacía con fecha epoch (1970-01-01), no un error 404.

3. **Reemplazo Completo**: El endpoint POST reemplaza completamente las listas. No hay actualización parcial.

4. **Permisos**: Los usuarios solo pueden acceder a sus propias listas, excepto los administradores que pueden acceder a cualquier lista.

5. **Validación**: Todos los campos (projects, mainTasks, vehicles) deben ser arrays, aunque estén vacíos.
