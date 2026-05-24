# 🏨 Sistema de Gestión de Hotel - Hotel Grand Azure

## Grupo 4 — Lab 5: Pruebas de Software

Sistema completo de gestión hotelera desarrollado en **Node.js** con **Express**, diseñado con validaciones exhaustivas y manejo robusto de errores.

---

## 📋 Descripción del Sistema

El sistema permite gestionar las operaciones principales de un hotel:

| Módulo | Funcionalidades |
|--------|----------------|
| **Huéspedes** | Registro, consulta, actualización y eliminación de huéspedes |
| **Habitaciones** | Gestión de habitaciones (Individual, Doble, Suite) con estados |
| **Reservaciones** | Crear, cancelar y completar reservaciones con cálculo automático |
| **Facturación** | Generación de facturas con IGV (18%), descuentos y métodos de pago |

---

## 🚀 Cómo Ejecutar

### Requisitos
- **Node.js** v18 o superior
- **npm** v9 o superior

### Instalación
```bash
cd hotel-management
npm install
```

### Ejecutar el servidor
```bash
npm start
```

El sistema estará disponible en: **http://localhost:3000**

### Ejecutar tests
```bash
npm test
```

---

## 📡 API Endpoints

### Huéspedes (`/api/huespedes`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/huespedes` | Listar todos los huéspedes |
| `GET` | `/api/huespedes/:id` | Obtener huésped por ID |
| `POST` | `/api/huespedes` | Registrar nuevo huésped |
| `PUT` | `/api/huespedes/:id` | Actualizar huésped |
| `DELETE` | `/api/huespedes/:id` | Eliminar huésped |

### Habitaciones (`/api/habitaciones`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/habitaciones` | Listar habitaciones (filtros: tipo, estado, piso) |
| `GET` | `/api/habitaciones/:id` | Obtener habitación por ID |
| `POST` | `/api/habitaciones` | Crear nueva habitación |
| `PUT` | `/api/habitaciones/:id` | Actualizar habitación |
| `DELETE` | `/api/habitaciones/:id` | Eliminar habitación |

### Reservaciones (`/api/reservaciones`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/reservaciones` | Listar reservaciones |
| `GET` | `/api/reservaciones/:id` | Obtener reservación por ID |
| `POST` | `/api/reservaciones` | Crear nueva reservación |
| `PATCH` | `/api/reservaciones/:id/cancelar` | Cancelar reservación |
| `PATCH` | `/api/reservaciones/:id/completar` | Check-out |

### Facturación (`/api/facturacion`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/facturacion` | Listar facturas |
| `GET` | `/api/facturacion/:id` | Obtener factura por ID |
| `POST` | `/api/facturacion` | Generar nueva factura |
| `PATCH` | `/api/facturacion/:id/pagar` | Pagar factura |
| `PATCH` | `/api/facturacion/:id/anular` | Anular factura |

---

## ✅ Validaciones del Sistema

### Huéspedes
| Campo | Regla | Rango/Formato |
|-------|-------|---------------|
| Nombre | Solo letras y espacios | 2-100 caracteres |
| DNI | Solo dígitos | Exactamente 8 dígitos |
| Edad | Entero | 18-120 años |
| Teléfono | Empieza con 9 | 9 dígitos |
| Email | Formato válido | Máximo 254 caracteres |

### Habitaciones
| Campo | Regla | Rango/Formato |
|-------|-------|---------------|
| Número | Entero único | 100-999 |
| Tipo | Valor fijo | individual, doble, suite |
| Precio | Decimal (2 dec.) | S/ 50.00 - S/ 5,000.00 |
| Piso | Entero | 1-20 |

### Reservaciones
| Campo | Regla | Restricción |
|-------|-------|-------------|
| Check-in | Fecha futura | Formato YYYY-MM-DD |
| Check-out | Después de check-in | Máximo 365 noches |
| Huéspedes | Según tipo habitación | Individual: 1, Doble: 2, Suite: 4 |

### Facturación
| Campo | Regla | Valores |
|-------|-------|---------|
| Método de pago | Valor fijo | efectivo, tarjeta, transferencia |
| Descuento | Porcentaje | 0-50% |
| IGV | Automático | 18% |

---

## 🛡️ Manejo de Errores

El sistema implementa **5 capas de defensa**:

1. **Frontend (HTML5)**: Validación con atributos `required`, `min`, `max`, `pattern`
2. **Middleware de validación**: Verifica estructura y tipos del request
3. **Validadores específicos**: Reglas detalladas por campo
4. **Servicios de negocio**: Reglas de dominio (disponibilidad, unicidad)
5. **Error handler global**: Captura excepciones no previstas

### Códigos de Respuesta
| Código | Significado |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 400 | Error de validación |
| 404 | Recurso no encontrado |
| 409 | Conflicto (duplicado) |
| 422 | Error de regla de negocio |
| 500 | Error interno (nunca expone detalles) |

---

## 🧪 Datos Válidos para Pruebas

### Huésped de ejemplo
```json
{
  "nombre": "María García López",
  "dni": "12345678",
  "edad": 30,
  "telefono": "987654321",
  "email": "maria@correo.com"
}
```

### Habitación de ejemplo
```json
{
  "numero": 401,
  "tipo": "doble",
  "precio": 200.00,
  "piso": 4
}
```

---

## 📁 Estructura del Proyecto

```
hotel-management/
├── src/
│   ├── app.js                         # Servidor Express principal
│   ├── config/constants.js            # Constantes y reglas
│   ├── middleware/
│   │   ├── errorHandler.js            # Manejo global de errores
│   │   └── validateRequest.js         # Middleware de validación
│   ├── validators/                    # Validadores por entidad
│   ├── services/                      # Lógica de negocio
│   ├── controllers/                   # Controladores HTTP
│   ├── routes/                        # Definición de rutas
│   └── data/store.js                  # Almacenamiento en memoria
├── public/                            # Interfaz web
├── tests/                             # Tests (Jest + Supertest)
├── package.json
└── README.md
```
