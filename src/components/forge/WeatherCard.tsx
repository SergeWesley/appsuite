import { motion } from "framer-motion";
import { Cloud, Droplets, Wind, Sun, MapPin } from "lucide-react";

interface WeatherCardProps {
  data: any;
  city: string;
}

export function WeatherCard({ data, city }: WeatherCardProps) {
  // Extraction des données (le backend renvoie les données directement, mais on gère aussi le cas imbriqué)
  const source = data?.current || data?.current_weather || data || {};
  const temp = source?.temperature ?? source?.temp ?? "--";
  const windspeed = source?.windspeed ?? source?.wind_speed ?? "--";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl max-w-sm w-full my-4"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-blue-100" />
          <h3 className="text-xl font-bold tracking-tight">{city}</h3>
        </div>
        <Sun size={28} className="text-yellow-300" />
      </div>

      <div className="flex items-end gap-2 mb-8">
        <span className="text-5xl font-black">{temp}°</span>
        <span className="text-lg font-medium text-blue-100 mb-1">C</span>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-blue-400/30 pt-4">
        <div className="flex items-center gap-2">
          <Wind size={18} className="text-blue-200" />
          <div className="flex flex-col">
            <span className="text-xs text-blue-200 uppercase font-semibold">
              Vent
            </span>
            <span className="text-sm font-medium">{windspeed} km/h</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Cloud size={18} className="text-blue-200" />
          <div className="flex flex-col">
            <span className="text-xs text-blue-200 uppercase font-semibold">
              Conditions
            </span>
            <span className="text-sm font-medium">Temps clair</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
