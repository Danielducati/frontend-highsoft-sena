import { Clock, AlertCircle, FileText, UserX, AlertTriangle } from "lucide-react";
import { NewsFormData } from "../types";

export const API_BASE = "http://localhost:3001";

export const TIME_SLOTS = [
    "08:00","08:30","09:00","09:30","10:00","10:30",
    "11:00","11:30","12:00","12:30","13:00","13:30",
    "14:00","14:30","15:00","15:30","16:00","16:30",
    "17:00","17:30","18:00","18:30",
  ];

export const NEWS_TYPES = [
{ value: "incapacidad", label: "Incapacidad", icon: UserX,         color: "text-red-600"    },
{ value: "retraso",     label: "Retraso",      icon: Clock,         color: "text-yellow-600" },
{ value: "permiso",     label: "Permiso",       icon: FileText,      color: "text-blue-600"   },
{ value: "percance",    label: "Percance",      icon: AlertTriangle, color: "text-orange-600" },
{ value: "ausencia",    label: "Ausencia",      icon: AlertCircle,   color: "text-purple-600" },
{ value: "otro",        label: "Otro",          icon: FileText,      color: "text-gray-600"   },
];

export const EMPTY_FORM: NewsFormData = {
employeeId:   "",
employeeName: "",
type:         "retraso",
date:         "",
fechaFinal:   "",
startTime:    "",
endTime:      "",
description:  "",
status:       "pendiente",
};