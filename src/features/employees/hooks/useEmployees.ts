import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Employee, EmployeeFormData } from "../types";
import { ITEMS_PER_PAGE, ROL_MAP } from "../constants";
import { fetchEmployeesApi, createEmployeeApi, updateEmployeeApi, deleteEmployeeApi } from "../services/employeesService";

const EMPTY_FORM: EmployeeFormData = {
  firstName: "", lastName: "", documentType: "", document: "",
  email: "", phone: "", city: "", address: "", specialty: "", contrasena: "", image: "",
};

export function useEmployees() {
  const [employees,      setEmployees]      = useState<Employee[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [isDialogOpen,   setIsDialogOpen]   = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const [imagePreview,   setImagePreview]   = useState("");
  const [currentPage,    setCurrentPage]    = useState(1);
  const [formData,       setFormData]       = useState<EmployeeFormData>(EMPTY_FORM);

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployeesApi();
      setEmployees(data);
    } catch {
      toast.error("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data?: EmployeeFormData) => {
    const d = data ?? formData;  // ← usa los datos pasados o el estado
    if (!d.firstName || !d.lastName || !d.email || !d.specialty) {
      toast.error("Nombre, apellido, correo y especialidad son requeridos");
      return;
    }
    setSaving(true);
    const body = {
      nombre:           d.firstName,
      apellido:         d.lastName,
      tipo_documento:   d.documentType || null,
      numero_documento: d.document     || null,
      correo:           d.email,
      telefono:         d.phone        || null,
      ciudad:           d.city         || null,
      especialidad:     d.specialty,
      direccion:        d.address      || null,
      foto_perfil:      d.image        || null,
      contrasena:       d.contrasena   || "empleado123",
      id_rol:           ROL_MAP[d.specialty] || 2,
      Estado:           editingEmployee ? editingEmployee.estado : "Activo",
    };
    try {
      if (editingEmployee) {
        await updateEmployeeApi(editingEmployee.id, body);
        toast.success("Empleado actualizado exitosamente");
      } else {
        await createEmployeeApi(body);
        toast.success("Empleado creado exitosamente");
      }
      await loadEmployees();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar empleado");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    try {
      const nuevoEstado = employee.isActive ? "Inactivo" : "Activo";
      await updateEmployeeApi(employee.id, { Estado: nuevoEstado });
      toast.success(`Empleado ${employee.isActive ? "desactivado" : "activado"} exitosamente`);
      await loadEmployees();
    } catch (err: any) {
      console.error("Error toggle:", err);
      toast.error(err.message || "Error al actualizar estado");
    }
  };
  const handleDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployeeApi(employeeToDelete);
      toast.success("Empleado desactivado exitosamente");
      await loadEmployees();
    } catch {
      toast.error("Error al eliminar empleado");
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleEdit = (employee: Employee) => {
    if (!employee.isActive) {
      toast.error("No puedes editar un empleado inactivo");
      return;
    }
    setEditingEmployee(employee);
    setFormData({
      firstName:    employee.nombre,
      lastName:     employee.apellido,
      documentType: employee.tipoDocumento || "",
      document:     employee.numeroDocumento || "",
      email:        employee.email || "",
      phone:        employee.phone || "",
      city:         employee.ciudad || "",
      address:      employee.direccion || "",
      specialty:    employee.specialty || "",
      contrasena:   "",
      image:        employee.image || "",
    });
    setImagePreview(employee.image || "");
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: number) => {
    const emp = employees.find(e => e.id === id);

    if (!emp?.isActive) {
      toast.error("No puedes eliminar un empleado inactivo");
      return;
    }
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
    setFormData(EMPTY_FORM);
    setImagePreview("");
  };

  // ── Filtros ──
  const filteredEmployees = employees.filter(e => {
    const matchSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.specialty || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpecialty = filterSpecialty === "all" || e.specialty === filterSpecialty;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active"   && e.isActive)  ||
      (filterStatus === "inactive" && !e.isActive);
    return matchSearch && matchSpecialty && matchStatus;
  });

  const totalPages        = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const specialties    = Array.from(new Set(employees.map(e => e.specialty).filter(Boolean)));
  const activeEmployees = employees.filter(e => e.isActive).length;

  return {
    employees, loading, saving,
    searchTerm, setSearchTerm,
    filterSpecialty, setFilterSpecialty,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    viewingEmployee, setViewingEmployee,
    editingEmployee,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, setImagePreview,
    currentPage, setCurrentPage, totalPages,
    filteredEmployees, paginatedEmployees,
    specialties, activeEmployees,
    handleCreateOrUpdate, handleToggleStatus,
    handleDelete, handleEdit,
    confirmDelete, resetForm,
  };
}