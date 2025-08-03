# 🛠️ Lib - Biblioteca de Utilidades Comunes

> **Lógica reutilizable y constantes del sistema**

## 🎯 Propósito

El directorio `lib/` contiene **lógica ejecutable** y **constantes** que son utilizadas a lo largo de toda la aplicación. A diferencia de `shared/`, que se enfoca en recursos React/TypeScript, `lib/` contiene **funciones puras** y **configuraciones**.

## 📁 Estructura

```
lib/
├── 📊 constants/          # Constantes y configuraciones
│   ├── constants.ts       # Constantes globales del sistema
│   └── index.ts          # Exportaciones de constantes
├── 🔧 utils/             # Utilidades de lógica pura
│   ├── utils.ts          # Funciones de utilidad
│   └── index.ts          # Exportaciones de utils
└── 📤 index.ts           # API pública de lib
```

## 📊 Constantes del Sistema

### **🌍 Constantes Globales**

```typescript
import {
  DEFAULT_PAGINATION,
  API_ENDPOINTS,
  FILE_CONSTRAINTS,
  VALIDATION_RULES,
  UI_CONSTANTS,
} from "@/lib/constants";

// Ejemplo: Paginación estándar
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = DEFAULT_PAGINATION;

// Ejemplo: Configuración de archivos
const { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } = FILE_CONSTRAINTS;
```

### **🔧 API Endpoints**

```typescript
import { API_ENDPOINTS } from "@/lib/constants";

// Uso en servicios
const response = await fetch(`${API_ENDPOINTS.USERS}/profile`);
```

### **📏 Reglas de Validación**

```typescript
import { VALIDATION_RULES } from "@/lib/constants";

// Uso en formularios
const isValidEmail = email.length >= VALIDATION_RULES.EMAIL.MIN_LENGTH;
```

## 🔧 Utilidades Ejecutables

### **📅 Formateo de Fechas**

```typescript
import { formatDate, formatRelativeTime } from "@/lib/utils";

// Formatear fecha
const formatted = formatDate(new Date(), "dd/MM/yyyy");
// "15/12/2024"

// Tiempo relativo
const relative = formatRelativeTime(new Date(Date.now() - 3600000));
// "hace 1 hora"
```

### **📁 Formateo de Archivos**

```typescript
import { formatFileSize, getFileExtension, isImageFile } from "@/lib/utils";

// Tamaño legible
const size = formatFileSize(1024 * 1024); // "1.0 MB"

// Extensión de archivo
const ext = getFileExtension("document.pdf"); // "pdf"

// Verificar si es imagen
const isImg = isImageFile("photo.jpg"); // true
```

### **✅ Validaciones**

```typescript
import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  sanitizeInput,
} from "@/lib/utils";

// Validaciones
const validEmail = isValidEmail("user@example.com"); // true
const validPhone = isValidPhone("+1234567890"); // true
const validUrl = isValidUrl("https://example.com"); // true

// Sanitización
const clean = sanitizeInput("<script>alert('xss')</script>"); // "alert('xss')"
```

### **🎲 Generadores**

```typescript
import { generateId, generateSlug, generateApiKey } from "@/lib/utils";

// ID único
const id = generateId(); // "abc123def456"

// Slug para URLs
const slug = generateSlug("Mi Título Increíble"); // "mi-titulo-increible"

// API Key
const apiKey = generateApiKey(); // "sk_live_abc123..."
```

## 🚀 Cómo Usar Lib

### **🔍 Importar Utilidades**

```typescript
// ✅ Importar desde la API pública
import {
  DEFAULT_PAGINATION, // Constante
  formatDate, // Utilidad
  isValidEmail, // Validación
} from "@/lib";

// ✅ También funciona por categoría
import { DEFAULT_PAGINATION } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
```

### **📋 Casos de Uso Comunes**

```typescript
import {
  formatDate,
  formatFileSize,
  isValidEmail,
  DEFAULT_PAGINATION,
} from "@/lib";

function UserProfile({ user, files }) {
  // Formatear fecha de registro
  const joinDate = formatDate(user.createdAt, "MMMM yyyy");

  // Validar email antes de enviar
  const isEmailValid = isValidEmail(user.email);

  // Mostrar tamaño de archivos
  const fileInfo = files.map((file) => ({
    ...file,
    sizeFormatted: formatFileSize(file.size),
  }));

  return (
    <div>
      <p>Miembro desde {joinDate}</p>
      {!isEmailValid && <span>Email inválido</span>}
      {/* Renderizar archivos */}
    </div>
  );
}
```

## ➕ Agregar Nuevas Utilidades

### **📊 Nueva Constante**

```typescript
// 1. Agregar a lib/constants/constants.ts
export const NEW_FEATURE_CONFIG = {
  MAX_ITEMS: 100,
  DEFAULT_TIMEOUT: 5000,
  API_VERSION: "v2",
} as const;

// 2. Re-exportar en constants/index.ts
export { NEW_FEATURE_CONFIG } from "./constants";

// 3. Disponible automáticamente en lib/index.ts
```

### **🔧 Nueva Utilidad**

```typescript
// 1. Agregar a lib/utils/utils.ts
export function newUtilFunction(input: string): string {
  return input.trim().toLowerCase();
}

// 2. Re-exportar en utils/index.ts
export { newUtilFunction } from "./utils";

// 3. Disponible automáticamente en lib/index.ts
```

### **📁 Nueva Categoría de Utilidades**

```typescript
// 1. Crear nueva categoría
mkdir src/lib/validations
touch src/lib/validations/index.ts
touch src/lib/validations/user-validations.ts

// 2. Implementar utilidades
// validations/user-validations.ts
export function validateUserAge(age: number): boolean {
  return age >= 18 && age <= 120;
}

// 3. Exportar en validations/index.ts
export { validateUserAge } from "./user-validations";

// 4. Re-exportar en lib/index.ts
export * from "./validations";
```

## 📝 Convenciones de Lib

### **🏗️ Principios Fundamentales**

- **FUNCIONES PURAS** - Sin efectos secundarios
- **REUTILIZABLE** - Útil en múltiples contextos
- **WELL-TESTED** - Funciones críticas con tests
- **DOCUMENTADO** - JSDoc para funciones complejas

### **🚫 Qué NO incluir en Lib**

- ❌ Hooks de React (van en `shared/hooks`)
- ❌ Componentes React (van en `core/components`)
- ❌ Tipos TypeScript (van en `shared/types`)
- ❌ Lógica específica de módulos

### **✅ Qué SÍ incluir en Lib**

- ✅ Funciones de formateo/parsing
- ✅ Validaciones puras
- ✅ Constantes del sistema
- ✅ Generadores (IDs, slugs, etc.)
- ✅ Utilidades matemáticas/string

### **📂 Estructura Recomendada**

```typescript
lib/
├── constants/           # Configuraciones y constantes
├── utils/              # Utilidades generales
├── validations/        # Funciones de validación (futuro)
├── formatters/         # Funciones de formateo (futuro)
├── generators/         # Generadores de datos (futuro)
└── index.ts            # API pública unificada
```

## 🔧 Constantes Disponibles

### **📊 DEFAULT_PAGINATION**

```typescript
{
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGINATION_SIZES: [5, 10, 20, 50, 100]
}
```

### **🌐 API_ENDPOINTS**

```typescript
{
  USERS: "/api/users",
  AUTH: "/api/auth",
  UPLOADS: "/api/modules/file-upload",
  ADMIN: "/api/admin"
}
```

### **📁 FILE_CONSTRAINTS**

```typescript
{
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["jpg", "jpeg", "png", "gif", "webp"],
  ALLOWED_DOCUMENT_TYPES: ["pdf", "doc", "docx", "txt"]
}
```

### **📏 VALIDATION_RULES**

```typescript
{
  EMAIL: { MIN_LENGTH: 5, MAX_LENGTH: 254 },
  PASSWORD: { MIN_LENGTH: 8, MAX_LENGTH: 128 },
  USERNAME: { MIN_LENGTH: 3, MAX_LENGTH: 30 }
}
```

## 🛠️ Utilidades Disponibles

### **📅 Fechas**

- `formatDate(date, format)` - Formatear fechas
- `formatRelativeTime(date)` - Tiempo relativo
- `isValidDate(date)` - Validar fecha

### **📁 Archivos**

- `formatFileSize(bytes)` - Tamaño legible
- `getFileExtension(filename)` - Obtener extensión
- `isImageFile(filename)` - Verificar si es imagen

### **✅ Validaciones**

- `isValidEmail(email)` - Validar email
- `isValidPhone(phone)` - Validar teléfono
- `isValidUrl(url)` - Validar URL
- `sanitizeInput(input)` - Limpiar input

### **🎲 Generadores**

- `generateId()` - ID único
- `generateSlug(text)` - Slug para URL
- `generateApiKey()` - Clave API

### **🧮 Utilidades de String**

- `capitalize(text)` - Capitalizar
- `truncate(text, length)` - Truncar texto
- `slugify(text)` - Convertir a slug

## ⚠️ Consideraciones

### **🚫 NO crear subdirectorios sin necesidad**

- Solo crear nuevas categorías cuando tengas **5+ utilidades** relacionadas
- Preferir mantener todo en `constants.ts` y `utils.ts` inicialmente

### **✅ Cuándo crear nueva categoría**

- **Validations**: Cuando tengas 5+ funciones de validación
- **Formatters**: Cuando tengas 5+ funciones de formateo específicas
- **Generators**: Cuando tengas 5+ generadores diferentes

---

**💡 Tip:** Las funciones en `lib/` deben ser **puras** y **probables**. Si necesitas estado o hooks de React, probablemente debería ir en `shared/hooks`.
