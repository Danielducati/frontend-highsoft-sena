import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Category, CategoryFormData } from "../types";
import { fetchCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi, } from "../services/categoriesService";
import { DEFAULT_COLOR } from "../constants";

const EMPTY_FORM: CategoryFormData = { name: "", description: "", color: DEFAULT_COLOR };

export function useCategories() {
  const [categories,        setCategories]        = useState<Category[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [searchTerm,        setSearchTerm]        = useState("");
  const [isDialogOpen,      setIsDialogOpen]      = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory,   setEditingCategory]   = useState<Category | null>(null);
  const [viewingCategory,   setViewingCategory]   = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [sortField,         setSortField]         = useState<"name" | "servicesCount">("name");
  const [sortOrder,         setSortOrder]         = useState<"asc" | "desc">("asc");
  const [currentPage,       setCurrentPage]       = useState(1);
  const [formData,          setFormData]          = useState<CategoryFormData>(EMPTY_FORM);
  const [filterStatus, setFilterStatus]           = useState("all");
  const [filterServices, setFilterServices]       = useState("all");

  useEffect(() => { loadCategories(); }, []);

  const filteredCategories = categories.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && c.isActive) ||
      (filterStatus === "inactive" && !c.isActive);
  
    return matchSearch && matchStatus;
  });


  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategoriesApi();
      setCategories(data);
    } catch (error: any) {
      console.log("ERROR REAL:", error);
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };
  const getErrorMessage = (error: any): string => {
    console.log("ERROR COMPLETO:", error);
  
    // Axios (backend típico)
    if (error.response?.data) {
      const data = error.response.data;
  
      if (data.error) return data.error;
      if (data.message) return data.message;
  
      // Si viene como string plano
      if (typeof data === "string") return data;
    }
  
    // Si el mensaje viene como string JSON (MUY común)
    if (typeof error.message === "string") {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.error) return parsed.error;
      } catch {
        return error.message;
      }
    }
  
    return "Ocurrió un error inesperado";
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.name) {
      toast.error("Por favor ingresa el nombre de la categoría");
      return;
    }
    try {
      if (editingCategory) {
        await updateCategoryApi(editingCategory.id, formData);
        toast.success("Categoría actualizada exitosamente");
      } else {
        await createCategoryApi(formData);
        toast.success("Categoría creada exitosamente");
      }
      await loadCategories();
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData(EMPTY_FORM);
    } catch (error: any) {
      console.log("ERROR REAL:", error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategoryId) return;
    try {
      await deleteCategoryApi(deletingCategoryId);
      toast.success("Categoría eliminada");
      await loadCategories();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la categoría");
    
    } finally {
      setDeletingCategoryId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await updateCategoryApi(category.id, {
        name: category.name,
        description: category.description,
        color: category.color,
        estado: category.isActive ? "Inactivo" : "Activo",
      });
      toast.success("Estado actualizado");
      await loadCategories();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el estado");
      
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description, color: category.color });
    setIsDialogOpen(true);
  };

  const handleViewDetail = (category: Category) => {
    setViewingCategory(category);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingCategoryId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSort = (field: "name" | "servicesCount") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleNewClick = () => {
    setEditingCategory(null);
    setFormData(EMPTY_FORM);
  };

  return {
    categories, loading,
    searchTerm, handleSearchChange,
    isDialogOpen, setIsDialogOpen,
    isDetailDialogOpen, setIsDetailDialogOpen,
    isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingCategory, viewingCategory,
    formData, setFormData,
    sortField, sortOrder,
    currentPage, setCurrentPage,
    handleCreateOrUpdate, handleDeleteConfirm,
    handleToggleStatus, handleEdit,
    handleViewDetail, handleDeleteClick,
    handleSort, handleNewClick,
    filteredCategories,
    filterStatus, setFilterStatus,
    filterServices, setFilterServices,
  };
}