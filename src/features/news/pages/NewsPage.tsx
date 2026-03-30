import { useState } from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../shared/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Plus, Search, Filter, AlertCircle } from "lucide-react";
import { useNews } from "../hooks/useNews";
import { NewsForm } from "../components/NewsForm";
import { NewsTable } from "../components/NewsTable";
import { NewsDetailDialog } from "../components/NewsDetailDialog";
import { NewsStatusDialog } from "../components/NewsStatusDialog";
import { NewsConflictDialog } from "../components/NewsConflictDialog"; // ← CAMBIO 1: import
import { NEWS_TYPES, EMPTY_FORM } from "../constants";
import { EmployeeNews, NewsFormData, NewsModuleProps } from "../types";
import { SpaPage } from "../../../shared/components/layout/SpaPage";


export function NewsPage({ userRole }: NewsModuleProps) {
  // ← CAMBIO 2: desestructurar conflict, resolveConflict, dismissConflict del hook
  const { employees, newsList, loading, createOrUpdate, remove, updateStatus, conflict, resolveConflict, dismissConflict} = useNews();

  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterType,   setFilterType]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage,  setCurrentPage]  = useState(1);
  const itemsPerPage = 5;

  const [isDialogOpen,       setIsDialogOpen]      = useState(false);
  const [editingNews,        setEditingNews]        = useState<EmployeeNews | null>(null);
  const [viewingNews,        setViewingNews]        = useState<EmployeeNews | null>(null);
  const [deleteDialogOpen,   setDeleteDialogOpen]   = useState(false);
  const [newsToDelete,       setNewsToDelete]       = useState<number | null>(null);
  const [statusDialogOpen,   setStatusDialogOpen]   = useState(false);
  const [newsToChangeStatus, setNewsToChangeStatus] = useState<EmployeeNews | null>(null);
  const [newStatus,          setNewStatus]          = useState<EmployeeNews["status"]>("pendiente");
  const [formData,           setFormData]           = useState<NewsFormData>(EMPTY_FORM);

  const filteredNews = newsList.filter(item => {
    const matchSearch  = item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType    = filterType   === "all" || item.type   === filterType;
    const matchStatus  = filterStatus === "all" || item.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages    = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingNews(null);
    setFormData(EMPTY_FORM);
  };

  const handleEdit = (item: EmployeeNews) => {
    setEditingNews(item);
    setFormData({
      employeeId:   item.employeeId,
      employeeName: item.employeeName,
      type:         item.type,
      date:         item.date,
      fechaFinal:   item.fechaFinal ?? "",
      startTime:    item.startTime  ?? "",
      endTime:      item.endTime    ?? "",
      description:  item.description,
      status:       item.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const ok = await createOrUpdate(formData, editingNews?.id);
    if (ok) resetForm();
    // Si hay conflicto, el hook abre NewsConflictDialog automáticamente
    // El form se queda abierto para que el usuario pueda volver si elige "Volver"
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;
    await remove(newsToDelete);
    setDeleteDialogOpen(false);
    setNewsToDelete(null);
  };



  const handleStatusConfirm = async () => {
    if (newsToChangeStatus) await updateStatus(newsToChangeStatus.id, newStatus);
    setStatusDialogOpen(false);
    setNewsToChangeStatus(null);
  };

  // Cuando el usuario resuelve el conflicto, cerramos también el form
  const handleResolveConflict = async (action: any) => {
    const ok = await resolveConflict(action);
    if (ok) resetForm();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">Cargando novedades...</div>
  );

  return (
    <SpaPage
      title="Novedades de Empleados"
      subtitle="Gestión de incapacidades, retrasos, permisos y percances"
      icon={<AlertCircle className="w-5 h-5 text-[#F87171]" />}
      action={
        (userRole === "admin" || userRole === "employee") ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 10,
                  backgroundColor: "#1a3a2a",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "sans-serif",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
                onClick={() => { setEditingNews(null); setFormData(EMPTY_FORM); }}
              >
                <Plus className="w-4 h-4" />
                Nueva Novedad
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNews ? "Editar Novedad" : "Registrar Nueva Novedad"}</DialogTitle>
                <DialogDescription>
                  {editingNews ? "Actualiza la información de la novedad" : "Completa los detalles de la novedad"}
                </DialogDescription>
              </DialogHeader>
              <NewsForm
                formData={formData}
                setFormData={setFormData}
                employees={employees}
                editingNews={editingNews}
                onSubmit={handleSubmit}
                onCancel={resetForm}
              />
            </DialogContent>
          </Dialog>
        ) : undefined
      }
    >
      <div className="space-y-4">

      {/* Filtros */}
      <Card className="border-gray-200 shadow-sm rounded-2xl">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200" />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterType} onValueChange={v => { setFilterType(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-sm rounded-lg border-gray-200"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {NEWS_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-sm rounded-lg border-gray-200"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                  <SelectItem value="resuelta">Resuelta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card className="border-gray-200 shadow-sm overflow-hidden rounded-2xl">
        <NewsTable
          news={paginatedNews}
          userRole={userRole}
          onView={setViewingNews}
          onEdit={handleEdit}
          onDelete={id => { setNewsToDelete(id); setDeleteDialogOpen(true); }}
          onUpdateStatus={updateStatus}
        />
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Mostrando {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredNews.length)} de {filteredNews.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 text-sm">Anterior</Button>
            <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 text-sm">Siguiente</Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <NewsDetailDialog news={viewingNews} onClose={() => setViewingNews(null)} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F87171]" />¿Eliminar Novedad?
            </AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#F87171] hover:bg-[#EF4444]">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NewsStatusDialog
        open={statusDialogOpen}
        news={newsToChangeStatus}
        status={newStatus}
        onStatusChange={setNewStatus}
        onConfirm={handleStatusConfirm}
        onCancel={() => { setStatusDialogOpen(false); setNewsToChangeStatus(null); }}
      />

      {/* ← CAMBIO 3: agregar el dialog de conflicto al final */}
      <NewsConflictDialog
        conflict={conflict}
        employees={employees}
        currentEmployeeId={formData.employeeId}
        onCancel={dismissConflict}
        onConfirm={handleResolveConflict}
      />
      </div>
    </SpaPage>
  );
}