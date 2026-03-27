import { MODULE_COLORS, ACTION_COLORS } from "../constants";

export const getModuleColor = (module: string): string => {
  return MODULE_COLORS[module] || "bg-gray-100 text-gray-700";
};

export const getActionColor = (action: string): string => {
  return ACTION_COLORS[action] || "bg-gray-50 text-gray-600";
};