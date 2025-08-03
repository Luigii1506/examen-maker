# 📁 File Upload Module - Gestión Completa de Archivos

> **Módulo completo para upload, gestión y visualización de archivos**

## 🎯 Propósito

El módulo `file-upload/` proporciona una **solución completa** para el manejo de archivos en la aplicación, incluyendo upload (local y S3), gestión, categorización, galerías y estadísticas.

## 📁 Estructura

```
file-upload/
├── 🧩 components/         # UI del módulo
│   ├── FileUploader.tsx  # Componente de upload
│   ├── FileManager.tsx   # Gestión completa de archivos
│   ├── FilesView.tsx     # Vista de lista de archivos
│   ├── FileStats.tsx     # Estadísticas de archivos
│   ├── ImageGallery.tsx  # Galería de imágenes
│   └── index.ts          # Exportaciones de componentes
├── 🪝 hooks/             # Lógica reutilizable
│   ├── useFileUpload.ts  # Hook de upload
│   ├── useFileManager.ts # Hook de gestión
│   └── index.ts          # Exportaciones de hooks
├── 🔧 services/          # Lógica de negocio
│   ├── upload-service.ts # Servicio principal
│   ├── local-upload.ts   # Provider local
│   ├── s3-upload.ts      # Provider S3
│   └── index.ts          # Exportaciones de servicios
├── 📝 types/             # Interfaces TypeScript
│   └── index.ts          # Tipos del módulo
├── ⚙️ config/            # Configuración
│   └── index.ts          # Settings del módulo
├── 🛠️ utils/             # Utilidades específicas
│   └── index.ts          # Helper functions
└── 📤 index.ts           # API PÚBLICA del módulo
```

## 🧩 Componentes Principales

### **📤 `FileUploader` - Componente de Upload**

```typescript
import { FileUploader } from "@/modules/file-upload";

function MyUploadPage() {
  const handleUpload = (files: File[]) => {
    console.log("Archivos subidos:", files);
  };

  return (
    <FileUploader
      onUpload={handleUpload}
      maxFiles={5}
      acceptedTypes={["image/*", "application/pdf"]}
      maxFileSize={10 * 1024 * 1024} // 10MB
      provider="s3" // "local" | "s3"
    />
  );
}
```

**🎯 Características:**

- **Drag & Drop** intuitivo
- **Múltiples archivos** simultáneos
- **Validación** de tipo y tamaño
- **Preview** de archivos
- **Progress bar** de upload
- **Soporte S3 y Local**

### **🗂️ `FileManager` - Gestión Completa**

```typescript
import { FileManager } from "@/modules/file-upload";

function FilesPage() {
  return (
    <FileManager
      showUploader={true}
      showStats={true}
      enableCategories={true}
      itemsPerPage={20}
      defaultView="grid" // "grid" | "list"
    />
  );
}
```

**🎯 Características:**

- **Vista grid/lista** intercambiable
- **Filtros avanzados** (tipo, categoría, fecha)
- **Búsqueda** por nombre
- **Categorización** automática
- **Estadísticas** integradas
- **Acciones masivas** (eliminar, mover)

### **🖼️ `ImageGallery` - Galería de Imágenes**

```typescript
import { ImageGallery } from "@/modules/file-upload";

function GalleryPage() {
  return (
    <ImageGallery
      category="products"
      enableLightbox={true}
      showMetadata={true}
      columns={4}
      sorting="newest"
    />
  );
}
```

**🎯 Características:**

- **Lightbox** para visualización
- **Grid responsivo** adaptable
- **Metadata** de imágenes
- **Filtros por categoría**
- **Lazy loading** automático

### **📊 `FileStats` - Estadísticas**

```typescript
import { FileStats } from "@/modules/file-upload";

function StatsPage() {
  return (
    <FileStats
      showCharts={true}
      timeRange="month" // "week" | "month" | "year"
      groupBy="category" // "category" | "type" | "user"
    />
  );
}
```

## 🪝 Hooks Disponibles

### **📤 `useFileUpload` - Hook de Upload**

```typescript
import { useFileUpload } from "@/modules/file-upload";

function UploadComponent() {
  const {
    uploadFile, // Función de upload único
    uploadMultiple, // Upload múltiple
    isUploading, // Estado de carga
    progress, // Progreso (0-100)
    error, // Errores de upload
    cancelUpload, // Cancelar upload
    uploadHistory, // Historial de uploads
  } = useFileUpload({
    provider: "s3",
    category: "documents",
    onSuccess: (file) => console.log("Archivo subido:", file),
    onError: (error) => console.error("Error:", error),
  });

  const handleDrop = async (files: File[]) => {
    if (files.length === 1) {
      await uploadFile(files[0]);
    } else {
      await uploadMultiple(files);
    }
  };

  return (
    <div>
      {isUploading && <p>Subiendo... {progress}%</p>}
      {error && <p>Error: {error}</p>}
      <input
        type="file"
        multiple
        onChange={(e) => handleDrop(Array.from(e.target.files || []))}
      />
    </div>
  );
}
```

### **🗂️ `useFileManager` - Hook de Gestión**

```typescript
import { useFileManager } from "@/modules/file-upload";

function FileManagerComponent() {
  const {
    files, // Lista de archivos
    isLoading, // Estado de carga
    error, // Errores
    deleteFile, // Eliminar archivo
    deleteMultiple, // Eliminar múltiples
    updateFile, // Actualizar archivo
    refreshFiles, // Recargar lista
    stats, // Estadísticas
    filters, // Filtros actuales
    setFilters, // Cambiar filtros
    pagination, // Info de paginación
    setPagination, // Cambiar página
  } = useFileManager({
    category: "images",
    pageSize: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const handleDelete = async (fileId: string) => {
    await deleteFile(fileId);
    await refreshFiles();
  };

  return (
    <div>
      {isLoading && <p>Cargando archivos...</p>}
      {files.map((file) => (
        <div key={file.id}>
          <span>{file.filename}</span>
          <button onClick={() => handleDelete(file.id)}>Eliminar</button>
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Servicios de Upload

### **🌐 Configuración de Providers**

```typescript
import { uploadService } from "@/modules/file-upload/services";

// Configurar provider S3
await uploadService.configure("s3", {
  bucket: "my-bucket",
  region: "us-east-1",
  accessKeyId: "xxx",
  secretAccessKey: "xxx",
});

// Configurar provider local
await uploadService.configure("local", {
  uploadDir: "/uploads",
  maxFileSize: 10 * 1024 * 1024,
  allowedTypes: ["image/*", "application/pdf"],
});
```

### **📤 Upload Programático**

```typescript
import { uploadService } from "@/modules/file-upload/services";

// Upload con S3
const s3Result = await uploadService.upload(file, {
  provider: "s3",
  category: "products",
  makePublic: true,
  generateThumbnail: true,
});

// Upload local
const localResult = await uploadService.upload(file, {
  provider: "local",
  category: "documents",
  preserveOriginalName: true,
});
```

## 📊 Tipos Principales

### **📁 File Types**

```typescript
import type {
  UploadedFile, // Archivo subido
  FileUploadOptions, // Opciones de upload
  FileStats, // Estadísticas
  FileCategory, // Categorías
  UploadProgress, // Progreso de upload
} from "@/modules/file-upload/types";

// Ejemplo de uso
const file: UploadedFile = {
  id: "file-123",
  filename: "document.pdf",
  originalName: "Mi Documento.pdf",
  size: 1024 * 1024, // 1MB
  mimeType: "application/pdf",
  category: "documents",
  url: "https://example.com/file.pdf",
  thumbnailUrl: "https://example.com/thumb.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "user-123",
};
```

## ⚙️ Configuración del Módulo

### **🎛️ Feature Flag**

```typescript
// En core/config/feature-flags.ts
export const FEATURE_FLAGS = {
  FILE_UPLOAD: true, // ✅ Módulo activo
} as const;
```

### **🔧 Configuración Global**

```typescript
// En modules/file-upload/config/index.ts
export const FILE_UPLOAD_CONFIG = {
  DEFAULT_PROVIDER: "s3", // "s3" | "local"
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/plain",
  ],
  CATEGORIES: ["images", "documents", "videos", "audio", "others"],
  S3_CONFIG: {
    BUCKET: process.env.AWS_S3_BUCKET,
    REGION: process.env.AWS_REGION,
  },
  LOCAL_CONFIG: {
    UPLOAD_DIR: "./public/uploads",
    SERVE_PATH: "/uploads",
  },
};
```

## 🌐 API Endpoints

### **📤 Upload Endpoints**

```typescript
// POST /api/modules/file-upload
// Subir archivo(s)

// GET /api/modules/file-upload
// Listar archivos con filtros

// GET /api/modules/file-upload/[id]
// Obtener archivo específico

// DELETE /api/modules/file-upload/[id]
// Eliminar archivo

// GET /api/modules/file-upload/stats
// Estadísticas de archivos

// GET /api/modules/file-upload/categories
// Listar categorías disponibles

// POST /api/modules/file-upload/s3/signed-url
// Obtener URL firmada para S3
```

### **📋 Ejemplos de Uso de API**

```typescript
// Subir archivo
const formData = new FormData();
formData.append("file", file);
formData.append("category", "images");

const response = await fetch("/api/modules/file-upload", {
  method: "POST",
  body: formData,
});

// Listar archivos con filtros
const files = await fetch(
  "/api/modules/file-upload?" +
    new URLSearchParams({
      category: "images",
      page: "1",
      limit: "20",
      sortBy: "createdAt",
      sortOrder: "desc",
    })
);

// Obtener estadísticas
const stats = await fetch("/api/modules/file-upload/stats");
```

## 🛡️ Seguridad y Validaciones

### **✅ Validaciones de Archivo**

- **Tipo de archivo** - Solo tipos permitidos
- **Tamaño máximo** - Configurable por provider
- **Nombre de archivo** - Sanitización automática
- **Virus scanning** - Integración con servicios externos (opcional)

### **🔐 Control de Acceso**

```typescript
import { PermissionGate } from "@/core/auth";
import { FileUploader } from "@/modules/file-upload";

function ProtectedUpload() {
  return (
    <PermissionGate requiredPermissions={["files.upload"]}>
      <FileUploader />
    </PermissionGate>
  );
}
```

### **🏷️ Metadata de Archivos**

- **Usuario** que subió el archivo
- **Fecha** de upload y última modificación
- **Categoría** del archivo
- **Tags** personalizados (opcional)
- **Información EXIF** para imágenes

## 🚀 Casos de Uso Comunes

### **🖼️ Galería de Productos**

```typescript
import { ImageGallery } from "@/modules/file-upload";

function ProductGallery({ productId }) {
  return (
    <ImageGallery
      category="products"
      filters={{ productId }}
      enableLightbox={true}
      columns={3}
    />
  );
}
```

### **📄 Documentos de Usuario**

```typescript
import { FileManager } from "@/modules/file-upload";

function UserDocuments({ userId }) {
  return (
    <FileManager
      filters={{ userId, category: "documents" }}
      showUploader={true}
      allowedTypes={["application/pdf", "image/*"]}
    />
  );
}
```

### **📊 Dashboard de Archivos**

```typescript
import { FileStats, FileManager } from "@/modules/file-upload";

function FilesDashboard() {
  return (
    <div>
      <FileStats showCharts={true} timeRange="month" />
      <FileManager showStats={false} defaultView="list" />
    </div>
  );
}
```

## ⚡ Optimizaciones

### **🖼️ Imágenes**

- **Thumbnails** automáticos
- **Compresión** configurable
- **Múltiples tamaños** (small, medium, large)
- **WebP conversion** automática

### **📦 Performance**

- **Lazy loading** en galerías
- **Infinite scroll** en listas largas
- **Caching** de metadata
- **CDN integration** para S3

## 🔗 Integraciones

### **🎛️ Con Feature Flags**

```typescript
import { useFeatureFlag } from "@/shared/hooks";

function ConditionalFileUpload() {
  const canUpload = useFeatureFlag("FILE_UPLOAD");
  const canUseS3 = useFeatureFlag("S3_UPLOAD");

  if (!canUpload) return <div>Upload no disponible</div>;

  return <FileUploader provider={canUseS3 ? "s3" : "local"} />;
}
```

### **👤 Con Sistema de Usuarios**

```typescript
import { useAuth } from "@/shared/hooks";

function UserFileManager() {
  const { user } = useAuth();

  return <FileManager filters={{ userId: user?.id }} showUploader={true} />;
}
```

---

**💡 Tip:** Este módulo es **completamente opcional** y puede activarse/desactivarse via feature flags. Perfecto para aplicaciones que necesitan gestión de archivos robusta.
