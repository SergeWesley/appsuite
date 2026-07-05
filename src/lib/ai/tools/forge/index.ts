import { fetchWeatherTool } from "./fetchWeatherTool";
import { fetchRandomAnimeTool } from "./fetchRandomAnimeTool";
import { searchArtTool } from "./searchArtTool";

// Registre des outils pour interagir avec le backend (Forge)
export const getForgeTools = () => {
  return {
    fetchWeatherTool: fetchWeatherTool(),
    fetchRandomAnimeTool: fetchRandomAnimeTool(),
    searchArtTool: searchArtTool(),
  };
};
