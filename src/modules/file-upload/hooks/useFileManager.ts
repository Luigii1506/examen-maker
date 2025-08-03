// 🗂️ USE FILE MANAGER HOOK
// ========================
// Hook para gestión de archivos usando API endpoints

"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import type { UploadFile, FileCategory, UseFileManagerReturn } from "../types";

export function useFileManager(): UseFileManagerReturn {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Cargar archivos del usuario
  const loadFiles = useCallback(
    async (filters?: {
      search?: string;
      provider?: string;
      mimeType?: string;
      categoryId?: string;
      page?: number;
      limit?: number;
    }) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (filters?.search) params.append("search", filters.search);
        if (filters?.provider) params.append("provider", filters.provider);
        if (filters?.mimeType) params.append("mimeType", filters.mimeType);
        if (filters?.categoryId)
          params.append("categoryId", filters.categoryId);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());

        const response = await fetch(`/api/uploads?${params.toString()}`);

        if (response.ok) {
          const data = await response.json();
          setFiles(data.files || []);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Error cargando archivos");
        }
      } catch (err) {
        setError("Error de conexión al cargar archivos");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/uploads/categories");

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.warn("Error loading categories:", err);
    }
  }, [user]);

  // Eliminar archivo
  const deleteFile = useCallback(
    async (fileId: string): Promise<void> => {
      if (!user) return;

      try {
        const response = await fetch(`/api/uploads/${fileId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Remover archivo de la lista local
          setFiles((prev) => prev.filter((file) => file.id !== fileId));
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Error eliminando archivo");
        }
      } catch (err) {
        setError("Error de conexión al eliminar archivo");
      }
    },
    [user]
  );

  // Descargar archivo
  const downloadFile = useCallback(async (file: UploadFile) => {
    try {
      if (file.isPublic) {
        // Archivo público - usar URL directa
        window.open(file.url, "_blank");
      } else if (file.provider === "s3") {
        // Archivo privado en S3 - generar URL firmada
        const response = await fetch("/api/uploads/s3/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId: file.id, expiresIn: 300 }),
        });

        if (response.ok) {
          const { url } = await response.json();
          window.open(url, "_blank");
        } else {
          setError("Error generando enlace de descarga");
        }
      } else {
        // Archivo local - usar URL directa
        window.open(file.url, "_blank");
      }
    } catch (err) {
      setError("Error al descargar archivo");
    }
  }, []);

  // Buscar archivos
  const searchFiles = useCallback(
    (query: string) => {
      loadFiles({ search: query, categoryId: selectedCategory || undefined });
    },
    [loadFiles, selectedCategory]
  );

  // Cambiar categoría seleccionada
  const handleCategoryChange = useCallback(
    (categoryId: string | null) => {
      setSelectedCategory(categoryId);
      loadFiles({ categoryId: categoryId || undefined });
    },
    [loadFiles]
  );

  // Refrescar archivos
  const refreshFiles = useCallback(async (): Promise<void> => {
    await loadFiles({ categoryId: selectedCategory || undefined });
  }, [loadFiles, selectedCategory]);

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      loadFiles();
      loadCategories();
    }
  }, [user, loadFiles, loadCategories]);

  return {
    files,
    loading,
    error,
    categories,
    selectedCategory,
    setSelectedCategory: handleCategoryChange,
    refreshFiles,
    deleteFile,
    downloadFile,
    searchFiles,
  };
}

// Hook para estadísticas de archivos
export function useFileStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    byProvider: {} as Record<string, number>,
    byType: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/uploads/stats");

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error cargando estadísticas");
      }
    } catch (err) {
      setError("Error de conexión al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refrescar estadísticas
  const refreshStats = useCallback(() => {
    loadStats();
  }, [loadStats]);

  // Formatear tamaño total
  const formattedTotalSize = `${
    Math.round(((stats.totalSize || 0) / (1024 * 1024)) * 100) / 100
  } MB`;

  // Cargar estadísticas al montar
  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user, loadStats]);

  return {
    stats,
    loading,
    error,
    refreshStats,
    formattedTotalSize,
  };
}
