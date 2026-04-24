// src/features/news/hooks/useNewsFormV2.ts
import { useState, useCallback } from "react";
import { NewsFormDataV2 } from "../types/schedule";
import { scheduleService } from "../services/scheduleService";

const EMPTY_FORM_V2: NewsFormDataV2 = {
  employeeId: "",
  employeeName: "",
  type: "retraso",
  selectedWeekStart: scheduleService.getCurrentWeekStart(),
  selectedDays: [],
  affectationType: "full_day",
  startTime: "",
  endTime: "",
  description: "",
  status: "pendiente",
};

export function useNewsFormV2() {
  const [formData, setFormData] = useState<NewsFormDataV2>(EMPTY_FORM_V2);

  const resetForm = useCallback(() => {
    setFormData({
      ...EMPTY_FORM_V2,
      selectedWeekStart: scheduleService.getCurrentWeekStart()
    });
  }, []);

  const initializeFormForEdit = useCallback((newsItem: any) => {
    // Convertir datos existentes al nuevo formato
    const startDate = new Date(newsItem.date);
    const weekStart = scheduleService.getCurrentWeekStart(); // Simplificado por ahora
    
    setFormData({
      employeeId: newsItem.employeeId,
      employeeName: newsItem.employeeName,
      type: newsItem.type,
      selectedWeekStart: weekStart,
      selectedDays: [startDate.getDay() === 0 ? 6 : startDate.getDay() - 1], // Convertir a índice de lunes=0
      affectationType: newsItem.startTime && newsItem.endTime ? "partial_hours" : "full_day",
      startTime: newsItem.startTime || "",
      endTime: newsItem.endTime || "",
      description: newsItem.description,
      status: newsItem.status,
    });
  }, []);

  const convertToApiFormat = useCallback(() => {
    // Convertir el formato del formulario al formato esperado por la API
    const selectedDates = formData.selectedDays.map(dayIndex => {
      const weekStart = new Date(formData.selectedWeekStart);
      const targetDate = new Date(weekStart);
      targetDate.setDate(weekStart.getDate() + dayIndex);
      return targetDate.toISOString().split('T')[0];
    });

    return {
      employeeId: formData.employeeId,
      type: formData.type,
      date: selectedDates[0], // Fecha principal
      fechaFinal: selectedDates.length > 1 ? selectedDates[selectedDates.length - 1] : "",
      startTime: formData.affectationType === "partial_hours" ? formData.startTime : "",
      endTime: formData.affectationType === "partial_hours" ? formData.endTime : "",
      description: formData.description,
      status: formData.status,
      // Campos adicionales para la nueva API
      selectedDates,
      affectationType: formData.affectationType,
    };
  }, [formData]);

  const validateForm = useCallback(() => {
    const errors: string[] = [];

    if (!formData.employeeId) {
      errors.push("Debe seleccionar un empleado");
    }

    if (!formData.type) {
      errors.push("Debe seleccionar un tipo de novedad");
    }

    if (formData.selectedDays.length === 0) {
      errors.push("Debe seleccionar al menos un día");
    }

    if (formData.affectationType === "partial_hours") {
      if (!formData.startTime || !formData.endTime) {
        errors.push("Debe especificar hora de inicio y fin para horario específico");
      }
      
      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        errors.push("La hora de inicio debe ser menor que la hora de fin");
      }
    }

    if (!formData.description.trim()) {
      errors.push("Debe proporcionar una descripción");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [formData]);

  return {
    formData,
    setFormData,
    resetForm,
    initializeFormForEdit,
    convertToApiFormat,
    validateForm,
    EMPTY_FORM_V2
  };
}