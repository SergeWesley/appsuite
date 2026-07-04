import { fetchWeatherTool } from "./fetchWeatherTool";
import { fetchRandomAnimeTool } from "./fetchRandomAnimeTool";

// Registre des outils pour interagir avec le backend (Forge)
export const getForgeTools = () => {
  return {
    fetchWeatherTool: fetchWeatherTool(),
    fetchRandomAnimeTool: fetchRandomAnimeTool(),
    // On pourra ajouter d'autres outils ici plus tard (fetchUsers, etc.)
  };
};
