# API de Sincronización - Documentación

## Resumen de Endpoints

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| POST | /sync/check | Comprobar actualizaciones |
| POST | /sync/push | Enviar actualizaciones |
| GET | /status | Comprobar estado |
| HEAD | / | Probar conexión |

---

## 1. Comprobar Actualizaciones

**Endpoint:** `POST /sync/check`

**Descripción:** El frontend envía los metadatos de su data local y el backend responde con los datos completos de los meses que necesita actualizar.

### Request

```json
{
  "username": "nombre.de.usuario",
  "db": "work_reports_db",
  "collection": "monthly_data",
  "timestamps": {
    "2024-05": "2024-05-30T10:00:00.000Z",
    "2024-06": "2024-06-28T15:30:00.000Z"
  }
}