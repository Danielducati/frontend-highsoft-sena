export const API_URL = "http://localhost:3001";
export const ITEMS_PER_PAGE = 5;
export const DEFAULT_PASSWORD = "Highlife2024*";
export const MAX_IMAGE_SIZE_MB = 5;

export const DOCUMENT_TYPES = [
  { value: "CC", label: "Cédula de Ciudadanía"  },
  { value: "CE", label: "Cédula de Extranjería"  },
  { value: "TI", label: "Tarjeta de Identidad"   },
  { value: "PP", label: "Pasaporte"               },
];

export const ROLE_BADGE_COLORS: Record<string, string> = {
  Administrador:  "bg-purple-100 text-purple-700 border-purple-200",
  Empleado:       "bg-blue-100 text-blue-700 border-blue-200",
  Recepcionista:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  Terapeuta:      "bg-pink-100 text-pink-700 border-pink-200",
  Cliente:        "bg-gray-100 text-gray-700 border-gray-200",
};

export const EMPTY_FORM = {
  firstName: "", lastName: "", documentType: "",
  document: "", email: "", phone: "", roleId: "", image: "", contrasena: "",
};