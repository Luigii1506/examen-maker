import React, { useState } from "react";
import {
  Upload,
  Grid,
  List,
  Search,
  Filter,
  Download,
  Trash2,
  Plus,
  MoreHorizontal,
  Image,
  File,
  Video,
  Music,
} from "lucide-react";
import type { UploadFile, UploadConfig } from "../types";
import { useFileManager, useFileStats } from "../hooks";
import FileUploader from "./FileUploader";
import FileManager from "./FileManager";
import FileStats from "./FileStats";
import ImageGallery from "./ImageGallery";

// Tipo para FileStats (ya que no existe en los tipos actuales)
interface FileStatsType {
  totalFiles: number;
  totalSize: number;
  storageLimit: number;
  storageUsed: number;
  filesByType: Record<string, number>;
  recentUploads: number;
  imageCount: number;
  documentCount: number;
  videoCount: number;
  audioCount: number;
}

interface FilesViewProps {
  onViewChange?: (view: string) => void;
}

const FilesView: React.FC<FilesViewProps> = ({ onViewChange }) => {
  // Usar hooks reales del módulo
  const { files, refreshFiles } = useFileManager();
  const { stats } = useFileStats();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<
    "upload" | "manager" | "stats" | "gallery"
  >("manager");
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Upload configuration
  const uploadConfig: UploadConfig = {
    provider: "s3",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/*",
      "application/pdf",
      "text/*",
      "video/*",
      "audio/*",
    ],
    multiple: true,
  };

  // Stats calculation - combinamos stats reales con calculados
  const calculatedStats: FileStatsType = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    imageCount: files.filter((f) => f.mimeType.startsWith("image/")).length,
    documentCount: files.filter(
      (f) => f.mimeType.includes("pdf") || f.mimeType.includes("document")
    ).length,
    videoCount: files.filter((f) => f.mimeType.startsWith("video/")).length,
    audioCount: files.filter((f) => f.mimeType.startsWith("audio/")).length,
    storageUsed: files.reduce((sum, file) => sum + file.size, 0),
    storageLimit: 100 * 1024 * 1024 * 1024, // 100GB
    filesByType: {},
    recentUploads: files.length,
  };

  // Filter files
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.originalName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" ||
      (filterType === "images" && file.mimeType.startsWith("image/")) ||
      (filterType === "documents" &&
        (file.mimeType.includes("pdf") ||
          file.mimeType.includes("document"))) ||
      (filterType === "videos" && file.mimeType.startsWith("video/")) ||
      (filterType === "audio" && file.mimeType.startsWith("audio/"));

    return matchesSearch && matchesType;
  });

  // Get only images for gallery
  const imageFiles = files.filter((file) => file.mimeType.startsWith("image/"));

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUploadComplete = (uploadedFiles: UploadFile[]) => {
    refreshFiles(); // Refrescar archivos usando el hook real
    showNotification(
      "success",
      `${uploadedFiles.length} archivo(s) subido(s) exitosamente`
    );
  };

  const handleUploadError = (error: string) => {
    showNotification("error", `Error: ${error}`);
  };

  const handleFileDelete = (file: UploadFile) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar "${file.originalName}"?`
      )
    ) {
      // En una app real, aquí se llamaría a la API de eliminación
      showNotification("success", `Archivo "${file.originalName}" eliminado`);
      refreshFiles(); // Refrescar después de eliminar
    }
  };

  const handleFileDownload = (file: UploadFile) => {
    // In a real app, this would handle S3 signed URLs for private files
    window.open(file.url, "_blank");
    showNotification("info", `Descargando "${file.originalName}"`);
  };

  const tabs = [
    { id: "upload", label: "Subir Archivos", icon: Upload },
    { id: "manager", label: "Mis Archivos", icon: File },
    { id: "stats", label: "Estadísticas", icon: MoreHorizontal },
    { id: "gallery", label: "Galería", icon: Image },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            📁 Gestión de Archivos
          </h1>
          <p className="text-slate-600 mt-1">
            Sistema completo de gestión de archivos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Download size={18} />
            Exportar
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Subir Archivos
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : notification.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <File className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {calculatedStats.totalFiles}
              </div>
              <div className="text-sm text-slate-500">Total Archivos</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {calculatedStats.imageCount}
              </div>
              <div className="text-sm text-slate-500">Imágenes</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {calculatedStats.videoCount}
              </div>
              <div className="text-sm text-slate-500">Videos</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {calculatedStats.audioCount}
              </div>
              <div className="text-sm text-slate-500">Audio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="border-b border-slate-200">
          <nav className="flex px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as "upload" | "manager" | "stats" | "gallery"
                    )
                  }
                  className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "upload" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  📤 Subir Archivos
                </h2>
                <p className="text-slate-600">
                  Arrastra archivos aquí o haz clic para seleccionar. Máximo
                  10MB por archivo.
                </p>
              </div>
              <FileUploader
                config={uploadConfig}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
            </div>
          )}

          {activeTab === "manager" && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Buscar archivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los archivos</option>
                    <option value="images">Imágenes</option>
                    <option value="documents">Documentos</option>
                    <option value="videos">Videos</option>
                    <option value="audio">Audio</option>
                  </select>

                  <div className="flex bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "grid"
                          ? "bg-white shadow-sm"
                          : "hover:bg-slate-200"
                      }`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "list"
                          ? "bg-white shadow-sm"
                          : "hover:bg-slate-200"
                      }`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Mostrando{" "}
                  <span className="font-medium">{filteredFiles.length}</span> de{" "}
                  <span className="font-medium">{files.length}</span> archivos
                </p>
              </div>

              <FileManager
                files={filteredFiles}
                onFileSelect={(file) =>
                  showNotification(
                    "info",
                    `Archivo seleccionado: ${file.originalName}`
                  )
                }
                onFileDelete={handleFileDelete}
                onFileDownload={handleFileDownload}
                viewMode={viewMode}
                selectable={true}
              />
            </div>
          )}

          {activeTab === "stats" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                📊 Estadísticas Detalladas
              </h2>
              <FileStats stats={calculatedStats} showDetails={true} />
            </div>
          )}

          {activeTab === "gallery" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  🖼️ Galería de Imágenes
                </h2>
                <p className="text-slate-600">
                  {imageFiles.length} imagen(es) encontrada(s)
                </p>
              </div>
              {imageFiles.length > 0 ? (
                <ImageGallery
                  images={imageFiles}
                  onImageSelect={(image) =>
                    showNotification(
                      "info",
                      `Imagen seleccionada: ${image.originalName}`
                    )
                  }
                  onImageDelete={handleFileDelete}
                  onImageDownload={handleFileDownload}
                  columns={4}
                />
              ) : (
                <div className="text-center py-12">
                  <Image className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No hay imágenes
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Sube algunas imágenes para verlas en la galería
                  </p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Subir imágenes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilesView;
