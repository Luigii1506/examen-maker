"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  Shield,
  Download,
  MoreHorizontal,
} from "lucide-react";
import { User, UserFormData, UserStats } from "@/shared/types/user";
import { authClient } from "@/core/auth/auth-client";
import { type RoleName } from "@/core/auth/config/permissions";
import UserCard from "./UserCard";
import UserModal from "./UserModal";

// Interface for API user response
interface ApiUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role?: string | null;
  image?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastLogin?: Date | string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | string | null;
}

// Adapter function to convert API user to our User type
const adaptApiUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: apiUser.name,
  email: apiUser.email,
  emailVerified: apiUser.emailVerified,
  role: (apiUser.role as RoleName) || "user", // ✅ Preserve all roles
  status: apiUser.banned ? "banned" : "active",
  image: apiUser.image,
  createdAt: new Date(apiUser.createdAt).toISOString(),
  updatedAt: new Date(apiUser.updatedAt).toISOString(),
  lastLogin: apiUser.lastLogin
    ? new Date(apiUser.lastLogin).toISOString()
    : undefined,
  banned: apiUser.banned,
  banReason: apiUser.banReason,
  banExpires: apiUser.banExpires
    ? new Date(apiUser.banExpires).toISOString()
    : undefined,
});

const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const usersPerPage = 12; // Better for card layout

  // Load users from API
  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await authClient.admin.listUsers({
        query: {
          limit: usersPerPage,
          offset: (currentPage - 1) * usersPerPage,
          ...(searchTerm && {
            searchValue: searchTerm,
            searchField: "email",
            searchOperator: "contains",
          }),
        },
      });

      if (response.data) {
        const adaptedUsers = response.data.users.map(adaptApiUser);
        setUsers(adaptedUsers);
        setTotalUsers(response.data.total);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm]);

  // Filter users based on current filters (local filtering for role and status only)
  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesRole && matchesStatus;
  });

  // Calculate stats
  const stats: UserStats = {
    total: totalUsers,
    active: users.filter((u) => u.status === "active").length,
    banned: users.filter((u) => u.status === "banned").length,
    admins: users.filter((u) => u.role === "admin" || u.role === "super_admin")
      .length,
  };

  // Create user
  const handleCreateUser = async (userData: UserFormData) => {
    try {
      setIsActionLoading(true);
      await authClient.admin.createUser({
        email: userData.email,
        name: userData.name,
        password: userData.password!,
        role: userData.role as "admin" | "user", // Better Auth API constraint
      });
      await loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Edit user
  const handleEditUser = async (userData: UserFormData) => {
    if (!editingUser) return;

    try {
      setIsActionLoading(true);

      // Update role if changed
      if (userData.role !== editingUser.role) {
        await authClient.admin.setRole({
          userId: editingUser.id,
          role:
            userData.role === "super_admin"
              ? "admin"
              : (userData.role as "admin" | "user"),
        });
      }

      // Note: better-auth doesn't have direct user update API
      // In a real implementation, you might need additional API calls

      await loadUsers();
      setEditingUser(null);
    } catch (error) {
      console.error("Error editing user:", error);
      throw error;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      setIsActionLoading(true);
      await authClient.admin.removeUser({ userId });
      await loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle ban status
  const handleToggleBan = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    try {
      setIsActionLoading(true);

      if (user.status === "banned") {
        await authClient.admin.unbanUser({ userId });
      } else {
        const reason = prompt("Razón del baneo:");
        if (!reason) return;

        await authClient.admin.banUser({
          userId,
          banReason: reason,
        });
      }

      await loadUsers();
    } catch (error) {
      console.error("Error toggling ban:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Change user role
  const handleChangeRole = async (userId: string, role: User["role"]) => {
    try {
      setIsActionLoading(true);
      await authClient.admin.setRole({
        userId,
        role: role === "super_admin" ? "admin" : (role as "admin" | "user"),
      });
      await loadUsers();
    } catch (error) {
      console.error("Error changing role:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión de Usuarios
          </h1>
          <p className="text-slate-600 mt-1">
            Administra todos los usuarios del sistema
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Activos</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Baneados</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.banned}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Admins</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.admins}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="sm:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="banned">Baneados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={(user) => {
                setEditingUser(user);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteUser}
              onToggleBan={handleToggleBan}
              onChangeRole={handleChangeRole}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">
            Mostrando {(currentPage - 1) * usersPerPage + 1} a{" "}
            {Math.min(currentPage * usersPerPage, totalUsers)} de {totalUsers}{" "}
            usuarios
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSave={editingUser ? handleEditUser : handleCreateUser}
        user={editingUser}
      />
    </div>
  );
};

export default UsersView;
