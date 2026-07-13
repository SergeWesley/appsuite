import React from "react";
import { WeatherCard } from "@/components/forge/WeatherCard";
import { AnimeCard } from "@/components/forge/AnimeCard";
import { DogCard } from "@/components/forge/DogCard";
import { ArtMosaic } from "@/components/forge/ArtMosaic";
import { MealList } from "@/components/forge/MealList";
import { CryptoCard } from "@/components/forge/CryptoCard";
import { TempMailManager } from "@/components/forge/TempMailManager";
import { NominatimMap } from "@/components/forge/NominatimMap";
import { McuCard } from "@/components/forge/McuCard";
import { SncfBoard } from "@/components/forge/SncfBoard";
import { SncfJourneyWrapper } from "@/components/forge/SncfJourneyWrapper";

const toolRegistry: Record<string, React.FC<{ result: any }>> = {
  fetchWeatherTool: ({ result }) => (
    <WeatherCard data={result.data} city={result.city} />
  ),
  fetchRandomAnimeTool: ({ result }) => (
    <AnimeCard data={result.data} />
  ),
  fetchRandomDogTool: ({ result }) => (
    <DogCard data={result.data || result} />
  ),
  searchArtTool: ({ result }) => (
    <ArtMosaic result={result} />
  ),
  searchMealTool: ({ result }) => (
    <MealList result={result} />
  ),
  fetchCryptoMarketTool: ({ result }) => (
    <CryptoCard data={result.data} currency={result.currency} />
  ),
  generateTempEmailTool: ({ result }) => (
    <TempMailManager result={result} />
  ),
  checkTempEmailTool: ({ result }) => (
    <TempMailManager result={result} />
  ),
  geocodeAddressTool: ({ result }) => (
    <NominatimMap result={result} />
  ),
  fetchMcuNextTool: ({ result }) => (
    <McuCard data={result.data} />
  ),
  fetchSncfDeparturesTool: ({ result }) => (
    <SncfBoard data={result.data} station={result.station} mode="departures" />
  ),
  fetchSncfArrivalsTool: ({ result }) => (
    <SncfBoard data={result.data} station={result.station} mode="arrivals" />
  ),
  fetchSncfJourneysTool: ({ result }) => (
    <SncfJourneyWrapper data={result.data} from={result.from} to={result.to} />
  ),
};

interface ToolRendererProps {
  toolName: string;
  result: any;
}

export function ToolRenderer({ toolName, result }: ToolRendererProps) {
  const Component = toolRegistry[toolName];

  if (Component) {
    return <Component result={result} />;
  }

  // Fallback générique si le composant n'est pas encore implémenté
  return (
    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono overflow-x-auto max-w-full">
      <div className="mb-2 font-semibold text-gray-700">
        Données brutes ({toolName})
      </div>
      <pre>{JSON.stringify(result.data || result, null, 2)}</pre>
    </div>
  );
}
