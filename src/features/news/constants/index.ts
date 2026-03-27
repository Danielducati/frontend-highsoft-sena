import { Clock, AlertCircle, FileText, UserX, AlertTriangle } from "lucide-react";
import { NewsFormData } from "../types";

export const API_BASE = "http://localhost:3001";

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