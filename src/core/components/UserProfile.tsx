// 🧩 USER PROFILE COMPONENT
// =========================
// Componente que usa hooks para demostrar integration testing

import React, { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserProfileProps {
  userId: string;
  onUserLoad?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onUserLoad,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  // Simular carga de usuario (en app real sería una API call)
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simular delay de API
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Simular datos de usuario
        const userData: User = {
          id: userId,
          name: `Usuario ${userId}`,
          email: `user${userId}@example.com`,
          avatar: "https://via.placeholder.com/100",
        };

        setUser(userData);
        onUserLoad?.(userData);
      } catch (err) {
        setError("Error loading user");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId, onUserLoad]);

  const handleEdit = () => {
    if (user) {
      setEditName(user.name);
      setEditing(true);
    }
  };

  const handleSave = () => {
    if (user && editName.trim()) {
      setUser({ ...user, name: editName.trim() });
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditName("");
  };

  if (loading) {
    return (
      <div data-testid="user-profile-loading" className="p-4">
        <div data-testid="loading-spinner">Cargando usuario...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="user-profile-error" className="p-4 text-red-500">
        <div data-testid="error-message">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div data-testid="user-profile-not-found" className="p-4">
        Usuario no encontrado
      </div>
    );
  }

  return (
    <div data-testid="user-profile" className="p-4 border rounded">
      <div className="flex items-center space-x-4">
        {user.avatar && (
          <img
            data-testid="user-avatar"
            src={user.avatar}
            alt="Avatar"
            className="w-16 h-16 rounded-full"
          />
        )}

        <div className="flex-1">
          {editing ? (
            <div data-testid="edit-form" className="space-y-2">
              <input
                data-testid="edit-name-input"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border rounded px-2 py-1"
                placeholder="Nombre del usuario"
              />
              <div className="space-x-2">
                <button
                  data-testid="save-button"
                  onClick={handleSave}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Guardar
                </button>
                <button
                  data-testid="cancel-button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 data-testid="user-name" className="text-xl font-bold">
                {user.name}
              </h2>
              <p data-testid="user-email" className="text-gray-600">
                {user.email}
              </p>
              <button
                data-testid="edit-button"
                onClick={handleEdit}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
              >
                Editar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
