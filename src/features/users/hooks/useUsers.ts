// src/features/users/hooks/useUsers.ts
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { User, Role, UserFormData } from "../types";
import { ITEMS_PER_PAGE, MAX_IMAGE_SIZE_MB, EMPTY_FORM } from "../constants";
import { splitFullName } from "../utils";
import {
  fetchUsersApi, fetchRolesApi,
  createUserApi, updateUserApi,
  toggleUserStatusApi, deleteUserApi,
  uploadUserPhotoApi,
} from "../services/usersService";

const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digitsOnly = (v: string) => v.replace(/\D/g, "");

export function useUsers() {
  const [users,            setUsers]            = useState<User[]>([]);
  const [roles,            setRoles]            = useState<Role[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [filterRole,       setFilterRole]       = useState("all");
  const [filterStatus,     setFilterStatus]     = useState("all");
  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [editingUser,      setEditingUser]      = useState<User | null>(null);
  const [viewingUser,      setViewingUser]      = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete,     setUserToDelete]     = useState<number | null>(null);
  const [imagePreview,     setImagePreview]     = useState("");
  const [selectedFile,     setSelectedFile]     = useState<File | null>(null);
  const [formData,         setFormData]         = useState<UserFormData>({ ...EMPTY_FORM });
  const [currentPage,      setCurrentPage]      = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUsers(await fetchUsersApi());
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      setRoles(await fetchRolesApi());
    } catch {
      toast.error("Error al cargar roles");
    }
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreateOrUpdate = async () => {
    const firstName    = formData.firstName.trim();
    const lastName     = formData.lastName.trim();
    const email        = formData.email.trim().toLowerCase();
    const phone        = formData.phone.trim();
    const documentType = formData.documentType.trim();
    const document     = formData.document.trim();
    const roleId       = formData.roleId.trim();

    // ── Validaciones frontend ──────────────────────────────
    if (!firstName || firstName.length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres");
      return;
    }
    if (!lastName || lastName.length < 2) {
      toast.error("El apellido debe tener al menos 2 caracteres");
      return;
    }
    if (!email || !EMAIL_RE.test(email)) {
      toast.error("Ingresa un correo válido");
      return;
    }
    if (!roleId) {
      toast.error("Selecciona un rol");
      return;
    }
    if (!documentType) {
      toast.error("El tipo de documento es obligatorio");
      return;
    }
    if (!document) {
      toast.error("El número de documento es obligatorio");
      return;
    }
    if (digitsOnly(document).length < 5) {
      toast.error("Ingresa un número de documento válido (mínimo 5 dígitos)");
      return;
    }
    if (phone && digitsOnly(phone).length < 7) {
      toast.error("Ingresa un teléfono válido (mínimo 7 dígitos)");
      return;
    }

    // ── Verificar email duplicado ──────────────────────────
    const existingEmail = users.find(u =>
      u.email?.toLowerCase() === email && (!editingUser || u.id !== editingUser.id)
    );
    if (existingEmail) {
      toast.error("Ya existe un usuario con este correo");
      return;
    }

    // ── Buscar nombre del rol ──────────────────────────────
    const selectedRole = roles.find(r => String(r.id) === roleId);
    if (!selectedRole) {
      toast.error("El rol seleccionado no es válido");
      return;
    }

    const body: Record<string, any> = {
      firstName,
      lastName,
      documentType,
      document: digitsOnly(document),
      email,
      phone,
      role: selectedRole.nombre,
      contrasena: formData.contrasena?.trim() || undefined,
    };

    try {
      if (selectedFile) {
        try {
          body.photo = await uploadUserPhotoApi(selectedFile);
        } catch {
          toast.error("Error al subir la imagen, se guardará sin foto");
        }
      }

      if (editingUser) {
        await updateUserApi(editingUser.id, body);
        toast.success("Usuario actualizado");
      } else {
        await createUserApi(body);
        toast.success("Usuario creado exitosamente");
      }
      await loadUsers();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar usuario");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleUserStatusApi(user.id, !user.isActive);
      toast.success("Estado actualizado");
      await loadUsers();
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    const user = users.find(u => u.id === userToDelete);
    
    if (user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "administrador") {
      toast.error("No se puede eliminar un usuario con rol de administrador");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      return;
    }
    
    try {
      await deleteUserApi(userToDelete);
      toast.success("Usuario eliminado exitosamente");
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar usuario");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const confirmDelete = (id: number) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const { firstName, lastName } = splitFullName(user.name);
    setFormData({
      firstName,
      lastName,
      documentType: user.documentType || "",
      document:     user.document     || "",
      email:        user.email,
      phone:        user.phone,
      roleId:       String(user.roleId ?? user.rolId ?? ""),
      image:        "",
    });
    setSelectedFile(null);
    setImagePreview(user.photo || "");
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({ ...EMPTY_FORM });
    setImagePreview("");
    setSelectedFile(null);
  };

  // ── Imagen ────────────────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`La imagen no debe superar los ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview("");
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, image: "" }));
  };

  // ── Filtros / paginación ──────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.phone?.includes(searchTerm);
    const matchRole   = filterRole   === "all" || u.role === filterRole;
    const matchStatus = filterStatus === "all" ||
                        (filterStatus === "active"   &&  u.isActive) ||
                        (filterStatus === "inactive" && !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages     = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex     = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const activeUsers    = users.filter(u => u.isActive).length;

  return {
    users, roles, loading, activeUsers,
    searchTerm, setSearchTerm,
    filterRole, setFilterRole,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    editingUser, viewingUser, setViewingUser,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, fileInputRef,
    currentPage, setCurrentPage, totalPages, startIndex,
    filteredUsers, paginatedUsers,
    handleCreateOrUpdate, handleDelete, handleToggleStatus,
    confirmDelete, handleEdit, resetForm,
    handleImageUpload, clearImage,
  };
}