import React from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";

export function ArtMosaic({ result }: { result: any }) {
  const data = result.data || [];
  const query = result.query || "";

  if (data.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500">
        Aucune œuvre trouvée pour la recherche : "{query}"
      </div>
    );
  }

  return (
    <div className="w-full my-4">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon size={18} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-gray-800">
          Résultats pour "{query}"
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4">
        {data.map((art: any, index: number) => (
          <motion.div
            key={art.id || index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="aspect-square w-full bg-gray-100 relative overflow-hidden group">
              {art.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/image-proxy?url=${encodeURIComponent(art.imageUrl)}`}
                  alt={art.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
            <div className="p-3">
              <h4 className="font-bold text-gray-900 text-xs mb-1 line-clamp-1" title={art.title}>
                {art.title}
              </h4>
              <p className="text-[10px] text-gray-500 line-clamp-1" title={art.artist}>
                {art.artist || "Artiste inconnu"}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
