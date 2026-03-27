import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Category, CategoryFormData } from "../types";
import { fetchCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from "../services/categoriesService";
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

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategoriesApi();
      setCategories(data);
    } catch {
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
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
    } catch {
      toast.error("Error al guardar la categoría");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategoryId) return;
    try {
      await deleteCategoryApi(deletingCategoryId);
      toast.success("Categoría eliminada");
      await loadCategories();
    } catch {
      toast.error("Error al eliminar la categoría");
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
    } catch {
      toast.error("Error al actualizar el estado");
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
  };
}