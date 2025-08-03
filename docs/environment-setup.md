# 🔧 Configuración de Variables de Entorno

## 📋 **Configuración Básica Requerida**

### 1. 🗄️ **Base de Datos (PostgreSQL)**

Crear archivo `.env` en la raíz del proyecto:

```bash
# Database URL
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nextjs_boilerplate"
```

### 2. 🔐 **Better Auth**

```bash
# Generar secret key con: openssl rand -base64 32
BETTER_AUTH_SECRET="tu-secret-key-super-seguro-aqui"

# URL de la aplicación
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

---

## 📁 **Configuración File Upload**

### ✅ **Opción 1: Storage Local (Recomendado para desarrollo)**

```bash
# Configuración para almacenamiento local
UPLOAD_PROVIDER="local"
UPLOAD_LOCAL_PATH="uploads"
UPLOAD_LOCAL_BASE_URL="http://localhost:3000/uploads"
UPLOAD_MAX_FILE_SIZE="10485760"  # 10MB en bytes
UPLOAD_ALLOWED_TYPES="image/*,application/pdf,text/*"
```

### ☁️ **Opción 2: Amazon S3 (Producción)**

```bash
# Configuración S3
UPLOAD_PROVIDER="s3"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="tu-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="tu-bucket-name"
UPLOAD_MAX_FILE_SIZE="52428800"  # 50MB para S3
UPLOAD_ALLOWED_TYPES="image/*,application/pdf,text/*,video/*"
```

### 🌥️ **Opción 3: Cloudinary**

```bash
# Configuración Cloudinary
UPLOAD_PROVIDER="cloudinary"
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="tu-api-secret"
CLOUDINARY_FOLDER="nextjs-boilerplate"
```

---

## 🚀 **Configuración Avanzada**

### 🔧 **Feature Flags**

```bash
# Habilitar/deshabilitar módulos
MODULE_FILE_UPLOAD="true"
MODULE_STRIPE_PAYMENTS="false"
MODULE_INVENTORY="false"
MODULE_ECOMMERCE="false"
```

### 🌍 **Deployment**

```bash
NODE_ENV="development"  # "production" en producción
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
```

---

## 🛠️ **Pasos de Setup**

### 1. **Crear archivo .env**

```bash
# Copiar template
cp .env.example .env

# Editar variables
nano .env
```

### 2. **Configurar PostgreSQL**

```bash
# Instalar PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Crear base de datos
createdb nextjs_boilerplate

# Ejecutar migraciones
npm run db:migrate
```

### 3. **Generar secret key**

```bash
# Generar BETTER_AUTH_SECRET
openssl rand -base64 32
```

### 4. **Crear directorio uploads (solo local)**

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

---

## ✅ **Verificar Configuración**

### Test de variables de entorno:

```bash
# Verificar conexión DB
npm run db:studio

# Verificar upload local
npm run dev
# Ir a http://localhost:3000/dashboard/files
```

---

## 🚨 **Troubleshooting**

### Problema: "image/png not allowed"

**Solución:** ✅ **ARREGLADO** - Wildcards como `image/*` ahora funcionan correctamente

### Problema: "Database connection failed"

**Solución:** Verificar `DATABASE_URL` y que PostgreSQL esté corriendo

### Problema: "Better Auth error"

**Solución:** Regenerar `BETTER_AUTH_SECRET` y verificar URLs

---

## 📚 **Variables de Entorno Completas**

```bash
# 🗄️ DATABASE
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nextjs_boilerplate"

# 🔐 BETTER AUTH
BETTER_AUTH_SECRET="tu-secret-key-seguro"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# 📁 FILE UPLOAD
UPLOAD_PROVIDER="local"
UPLOAD_LOCAL_PATH="uploads"
UPLOAD_LOCAL_BASE_URL="http://localhost:3000/uploads"
UPLOAD_MAX_FILE_SIZE="10485760"
UPLOAD_ALLOWED_TYPES="image/*,application/pdf,text/*"

# ☁️ AWS S3 (opcional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET=""

# 🌥️ CLOUDINARY (opcional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# 🔧 FEATURE FLAGS
MODULE_FILE_UPLOAD="true"
MODULE_STRIPE_PAYMENTS="false"
MODULE_INVENTORY="false"
MODULE_ECOMMERCE="false"

# 🚀 DEPLOYMENT
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🎯 **Configuración Rápida (5 minutos)**

1. **Copia este .env mínimo:**

```bash
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nextjs_boilerplate"
BETTER_AUTH_SECRET="cambiar-por-algo-seguro"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
UPLOAD_PROVIDER="local"
```

2. **Ejecuta:**

```bash
npm run db:migrate
npm run dev
```

3. **Prueba:** http://localhost:3000/dashboard/files

**¡Listo para subir archivos PNG, JPEG, PDF y más!** ✨
