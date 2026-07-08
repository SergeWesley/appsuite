import React from "react";
import { MapPin, Navigation } from "lucide-react";
import { motion } from "framer-motion";

export function NominatimMap({ result }: { result: any }) {
  if (!result || !result.data) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        Données géographiques indisponibles.
      </div>
    );
  }
  
  const { latitude, longitude, formattedAddress } = result.data;
  
  if (!latitude || !longitude) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        Position introuvable pour cette adresse.
      </div>
    );
  }

  // Calcul d'une bounding box approximative pour OpenStreetMap iframe
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const delta = 0.01;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white/50 backdrop-blur-xl shadow-lg dark:bg-black/40 dark:border-white/10"
    >
      <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-start gap-4 bg-white dark:bg-gray-800">
        <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
          <MapPin size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            Résultat de localisation
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {formattedAddress || result.address}
          </p>
        </div>
      </div>
      
      <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 relative group">
        <iframe
          width="100%"
          height="100%"
          src={mapUrl}
          className="border-none w-full h-full"
          title="Carte OpenStreetMap"
          loading="lazy"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 bg-transparent" />
      </div>
      
      <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-900/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3 text-xs font-mono text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5 bg-white dark:bg-black/40 px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-white/5 shadow-sm">
            <span className="opacity-70">Lat:</span> {lat.toFixed(5)}
          </div>
          <div className="flex items-center gap-1.5 bg-white dark:bg-black/40 px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-white/5 shadow-sm">
            <span className="opacity-70">Lng:</span> {lng.toFixed(5)}
          </div>
        </div>
        
        <a 
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg"
        >
          <Navigation size={16} />
          Ouvrir sur OSM
        </a>
      </div>
    </motion.div>
  );
}
