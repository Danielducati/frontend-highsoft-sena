export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
export const ITEMS_PER_PAGE = 5;

export const DOCUMENT_TYPES = [
  { value: "CC",  label: "Cédula de Ciudadanía" },
  { value: "CE",  label: "Cédula de Extranjería" },
  { value: "TI",  label: "Tarjeta de Identidad"  },
  { value: "PP",  label: "Pasaporte"              },
  { value: "NIT", label: "NIT"                    },
];