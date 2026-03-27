export const API_URL = "http://localhost:3001";
export const ITEMS_PER_PAGE = 5;

export const ROL_MAP: Record<string, number> = {
  Barbero:     4,
  Cosmetologa: 5,
  Estilista:   6,
  Masajista:   7,
  Manicurista: 8,
};

export const SPECIALTIES = [
  { value: "Barbero",     label: "Barbero"      },
  { value: "Estilista",   label: "Estilista"    },
  { value: "Manicurista", label: "Manicurista"  },
  { value: "Cosmetologa", label: "Cosmetóloga"  },
  { value: "Masajista",   label: "Masajista"    },
];

export const DOCUMENT_TYPES = [
  { value: "CC",  label: "Cédula de Ciudadanía"  },
  { value: "CE",  label: "Cédula de Extranjería"  },
  { value: "PAS", label: "Pasaporte"              },
  { value: "TI",  label: "Tarjeta de Identidad"   },
];