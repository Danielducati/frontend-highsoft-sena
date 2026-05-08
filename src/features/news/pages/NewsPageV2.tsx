// src/features/news/pages/NewsPageV2.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/ui/dialog";
import { Plus, AlertCircle } from "lucide-react";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { NewsFormV2 } from "../components/NewsFormV2";
import { useNewsFormV2 } from "../hooks/useNewsFormV2";
import { useNews } from "../hooks/useNews";
import { NewsModuleProps } from "../types";

export function NewsPageV2({ userRole }: NewsModuleProps) {
  const { employees, loading } = useNews();
  const {
    formData,
    setFormData,
    resetForm,
    convertToApiFormat,
    validateForm
  } = useNewsFormV2();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<any | null>(null);

  const handleSubmit = async () => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      console.error("Errores de validación:", validation.errors);
      return;
    }

    try {
      const apiData = convertToApiFormat();
      console.log("Datos para enviar a la API:", apiData);
      
      // Aquí iría la llamada a la API
      // await createOrUpdateNews(apiData, editingNews?.id);
      
      // Por ahora solo mostramos los datos en consola
      alert("Novedad creada exitosamente!\nRevisa la consola para ver los datos.");
      
      handleCancel();
    } catch (error) {
      console.error("Error al crear novedad:", error);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingNews(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Cargando novedades...
      </div>
    );
  }

  return (
    <SpaPage
      title="Novedades de Empleados (V2)"
      subtitle="Nueva interfaz basada en horarios semanales"
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
                  fontFamily: "var(--font-body)",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
                onClick={() => { 
                  setEditingNews(null); 
                  resetForm(); 
                }}
              >
                <Plus className="w-4 h-4" />
                Nueva Novedad
              </button>
            </DialogTrigger>
            <DialogContent className="hl-form-dialog max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNews ? "Editar Novedad" : "Registrar Nueva Novedad"}
                </DialogTitle>
                <DialogDescription>
                  {editingNews 
                    ? "Actualiza la información de la novedad basada en el horario semanal" 
                    : "Selecciona el empleado y los días de su horario semanal que se verán afectados"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <NewsFormV2
                formData={formData}
                setFormData={setFormData}
                employees={employees}
                editingNews={editingNews}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </DialogContent>
          </Dialog>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {/* Información sobre la nueva interfaz */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            🚀 Nueva Interfaz de Novedades
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Selección basada en horarios semanales del empleado</p>
            <p>• Visualización clara de días laborales disponibles</p>
            <p>• Validación automática contra el horario establecido</p>
            <p>• Soporte para novedades de día completo o horario específico</p>
          </div>
        </div>

        {/* Aquí iría el resto del contenido de la página */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Interfaz en Desarrollo</h3>
            <p className="text-sm">
              Esta es una demostración del nuevo formulario de novedades.<br />
              Haz clic en "Nueva Novedad" para probar la nueva interfaz.
            </p>
          </div>
        </div>
      </div>
    </SpaPage>
  );
}