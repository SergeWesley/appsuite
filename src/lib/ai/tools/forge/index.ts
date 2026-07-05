import { fetchWeatherTool } from "./fetchWeatherTool";
import { fetchRandomAnimeTool } from "./fetchRandomAnimeTool";
import { searchArtTool } from "./searchArtTool";
import { searchMealTool } from "./searchMealTool";

// Registre des outils pour interagir avec le backend (Forge)
export const getForgeTools = () => {
  return {
    fetchWeatherTool: fetchWeatherTool(),
    fetchRandomAnimeTool: fetchRandomAnimeTool(),
    searchArtTool: searchArtTool(),
    searchMealTool: searchMealTool(),
  };
};
