import React, { useState } from "react";
import {
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Share,
  Copy,
  Calendar,
  HardDrive,
  Image,
  File,
  Video,
  Music,
  FileText,
} from "lucide-react";
import type { UploadFile } from "../types";

interface FileManagerProps {
  files: UploadFile[];
  onFileSelect?: (file: UploadFile) => void;
  onFileDelete?: (file: UploadFile) => void;
  onFileDownload?: (file: UploadFile) => void;
  viewMode?: "grid" | "list";
  selectable?: boolean;
}

const FileManager: React.FC<FileManagerProps> = ({
  files,
  onFileSelect,
  onFileDelete,
  onFileDownload,
  viewMode = "grid",
  selectable = false,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const getFileIcon = (mimeType: string, size: number = 24) => {
    const iconProps = { size, className: "flex-shrink-0" };

    if (mimeType.startsWith("image/"))
      return <Image {...iconProps} className="text-blue-500" />;
    if (mimeType.startsWith("video/"))
      return <Video {...iconProps} className="text-purple-500" />;
    if (mimeType.startsWith("audio/"))
      return <Music {...iconProps} className="text-green-500" />;
    if (mimeType.includes("pdf") || mimeType.includes("document"))
      return <FileText {...iconProps} className="text-red-500" />;
    return <File {...iconProps} className="text-slate-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFileClick = (file: UploadFile) => {
    if (selectable) {
      const newSelected = new Set(selectedFiles);
      if (newSelected.has(file.id)) {
        newSelected.delete(file.id);
      } else {
        newSelected.add(file.id);
      }
      setSelectedFiles(newSelected);
    }
    onFileSelect?.(file);
  };

  const handleMenuAction = (action: string, file: UploadFile) => {
    setShowMenu(null);

    switch (action) {
      case "download":
        onFileDownload?.(file);
        break;
      case "delete":
        onFileDelete?.(file);
        break;
      case "copy":
        navigator.clipboard.writeText(file.url);
        break;
      case "view":
        window.open(file.url, "_blank");
        break;
    }
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-600">
            <div className="col-span-5">Nombre</div>
            <div className="col-span-2">Tamaño</div>
            <div className="col-span-2">Tipo</div>
            <div className="col-span-2">Fecha</div>
            <div className="col-span-1"></div>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {files.map((file) => (
            <div
              key={file.id}
              className={`px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                selectedFiles.has(file.id)
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : ""
              }`}
              onClick={() => handleFileClick(file)}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  {getFileIcon(file.mimeType, 20)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {file.originalName}
                    </p>
                    {file.metadata &&
                      typeof file.metadata.width === "number" &&
                      typeof file.metadata.height === "number" && (
                        <p className="text-xs text-slate-500">
                          {file.metadata.width} × {file.metadata.height}
                        </p>
                      )}
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="text-sm text-slate-600">
                    {formatFileSize(file.size)}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-sm text-slate-600 capitalize">
                    {file.mimeType.split("/")[0]}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-sm text-slate-600">
                    {formatDate(file.createdAt)}
                  </span>
                </div>

                <div className="col-span-1 flex justify-end">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(showMenu === file.id ? null : file.id);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={16} className="text-slate-400" />
                    </button>

                    {showMenu === file.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMenu(null)}
                        />
                        <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-48 z-20">
                          <button
                            onClick={() => handleMenuAction("view", file)}
                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                          >
                            <Eye size={16} />
                            Ver archivo
                          </button>
                          <button
                            onClick={() => handleMenuAction("download", file)}
                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                          >
                            <Download size={16} />
                            Descargar
                          </button>
                          <button
                            onClick={() => handleMenuAction("copy", file)}
                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                          >
                            <Copy size={16} />
                            Copiar URL
                          </button>
                          <div className="border-t border-slate-100 my-2" />
                          <button
                            onClick={() => handleMenuAction("delete", file)}
                            className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {files.map((file) => (
        <div
          key={file.id}
          className={`group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${
            selectedFiles.has(file.id)
              ? "ring-2 ring-blue-500 border-blue-500"
              : ""
          }`}
          onClick={() => handleFileClick(file)}
        >
          {/* Preview */}
          <div className="aspect-square bg-slate-50 flex items-center justify-center relative overflow-hidden">
            {file.mimeType.startsWith("image/") ? (
              <img
                src={file.url}
                alt={file.originalName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                {getFileIcon(file.mimeType, 32)}
              </div>
            )}

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuAction("view", file);
                }}
                className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
              >
                <Eye size={16} className="text-slate-700" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuAction("download", file);
                }}
                className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
              >
                <Download size={16} className="text-slate-700" />
              </button>
            </div>

            {/* File Type Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-lg backdrop-blur-sm">
                {file.mimeType.split("/")[1].toUpperCase()}
              </span>
            </div>

            {/* Menu Button */}
            <div className="absolute top-3 right-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(showMenu === file.id ? null : file.id);
                }}
                className="p-2 bg-black/70 hover:bg-black/80 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical size={16} className="text-white" />
              </button>

              {showMenu === file.id && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(null)}
                  />
                  <div className="absolute right-0 top-12 bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-48 z-20">
                    <button
                      onClick={() => handleMenuAction("view", file)}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                    >
                      <Eye size={16} />
                      Ver archivo
                    </button>
                    <button
                      onClick={() => handleMenuAction("download", file)}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                    >
                      <Download size={16} />
                      Descargar
                    </button>
                    <button
                      onClick={() => handleMenuAction("copy", file)}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                    >
                      <Copy size={16} />
                      Copiar URL
                    </button>
                    <button
                      onClick={() => handleMenuAction("share", file)}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                    >
                      <Share size={16} />
                      Compartir
                    </button>
                    <div className="border-t border-slate-100 my-2" />
                    <button
                      onClick={() => handleMenuAction("delete", file)}
                      className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* File Info */}
          <div className="p-4">
            <h3 className="font-medium text-slate-900 truncate mb-1">
              {file.originalName}
            </h3>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{formatFileSize(file.size)}</span>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{formatDate(file.createdAt)}</span>
              </div>
            </div>
            {file.metadata &&
            typeof file.metadata.width === "number" &&
            typeof file.metadata.height === "number" ? (
              <div className="mt-2 text-xs text-slate-500">
                {file.metadata.width} × {file.metadata.height} px
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileManager;
