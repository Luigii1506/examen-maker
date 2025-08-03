// 🔧 FILE UPLOAD UTILITIES
// ========================
// Utilidades adicionales para el módulo de file upload

/**
 * Crea un preview de imagen para mostrar antes del upload
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo no es una imagen"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Error leyendo el archivo"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Redimensiona una imagen manteniendo el aspect ratio
 */
export function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo no es una imagen"));
      return;
    }

    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      // Calcular nuevas dimensiones
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Redimensionar
      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error("No se pudo crear el contexto del canvas"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Error generando imagen redimensionada"));
            return;
          }

          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          resolve(resizedFile);
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error("Error cargando la imagen"));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convierte bytes a formato legible
 */
export function humanFileSize(bytes: number, si = false, dp = 1): string {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

/**
 * Genera un nombre de archivo único
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");

  return `${nameWithoutExt}-${timestamp}-${random}.${extension}`;
}

/**
 * Valida múltiples archivos
 */
export function validateFiles(
  files: File[],
  config: {
    maxFiles?: number;
    maxSize?: number;
    allowedTypes?: string[];
    maxTotalSize?: number;
  }
): { valid: File[]; invalid: Array<{ file: File; error: string }> } {
  const valid: File[] = [];
  const invalid: Array<{ file: File; error: string }> = [];

  // Validar número máximo de archivos
  if (config.maxFiles && files.length > config.maxFiles) {
    return {
      valid: [],
      invalid: files.map((file) => ({
        file,
        error: `Máximo ${config.maxFiles} archivos permitidos`,
      })),
    };
  }

  // Validar tamaño total
  if (config.maxTotalSize) {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > config.maxTotalSize) {
      return {
        valid: [],
        invalid: files.map((file) => ({
          file,
          error: `El tamaño total excede el límite de ${humanFileSize(
            config.maxTotalSize!
          )}`,
        })),
      };
    }
  }

  // Validar cada archivo individualmente
  files.forEach((file) => {
    let error = "";

    // Validar tamaño
    if (config.maxSize && file.size > config.maxSize) {
      error = `Archivo muy grande. Máximo: ${humanFileSize(config.maxSize)}`;
    }
    // Validar tipo
    else if (config.allowedTypes) {
      const isValidType =
        config.allowedTypes.includes(file.type) ||
        config.allowedTypes.some((allowedType) => {
          if (allowedType.endsWith("/*")) {
            const baseType = allowedType.slice(0, -2);
            return file.type.startsWith(baseType + "/");
          }
          return false;
        });

      if (!isValidType) {
        error = `Tipo de archivo no permitido: ${file.type}`;
      }
    }

    if (error) {
      invalid.push({ file, error });
    } else {
      valid.push(file);
    }
  });

  return { valid, invalid };
}

/**
 * Extrae metadatos de un archivo
 */
export async function extractFileMetadata(
  file: File
): Promise<Record<string, unknown>> {
  const metadata: Record<string, unknown> = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };

  // Para imágenes, extraer dimensiones
  if (file.type.startsWith("image/")) {
    try {
      const dimensions = await getImageDimensions(file);
      metadata.width = dimensions.width;
      metadata.height = dimensions.height;
      metadata.aspectRatio = dimensions.width / dimensions.height;
    } catch (error) {
      console.warn("Error extracting image dimensions:", error);
    }
  }

  return metadata;
}

/**
 * Obtiene las dimensiones de una imagen
 */
function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error("Error loading image"));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}
