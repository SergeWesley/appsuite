import { fetchWeatherTool } from "./fetchWeatherTool";
import { fetchRandomAnimeTool } from "./fetchRandomAnimeTool";
import { searchArtTool } from "./searchArtTool";
import { searchMealTool } from "./searchMealTool";
import { fetchCryptoMarketTool } from "./fetchCryptoMarketTool";
import { generateTempEmailTool } from "./generateTempEmailTool";
import { checkTempEmailTool } from "./checkTempEmailTool";
import { geocodeAddressTool } from "./geocodeAddressTool";
import { fetchMcuNextTool } from "./fetchMcuNextTool";
import { fetchSncfDeparturesTool } from "./fetchSncfDeparturesTool";
import { fetchSncfArrivalsTool } from "./fetchSncfArrivalsTool";

// Registre des outils pour interagir avec le backend (Forge)
export const getForgeTools = () => {
  return {
    fetchWeatherTool: fetchWeatherTool(),
    fetchRandomAnimeTool: fetchRandomAnimeTool(),
    searchArtTool: searchArtTool(),
    searchMealTool: searchMealTool(),
    fetchCryptoMarketTool: fetchCryptoMarketTool(),
    generateTempEmailTool: generateTempEmailTool(),
    checkTempEmailTool: checkTempEmailTool(),
    geocodeAddressTool: geocodeAddressTool(),
    fetchMcuNextTool: fetchMcuNextTool(),
    fetchSncfDeparturesTool: fetchSncfDeparturesTool(),
    fetchSncfArrivalsTool: fetchSncfArrivalsTool(),
  };
};
