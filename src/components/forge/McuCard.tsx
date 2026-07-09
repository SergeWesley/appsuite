import { motion } from "framer-motion";
import { Calendar, Clock, Film, Tv, ChevronRight } from "lucide-react";

interface McuProduction {
  id: number;
  title: string;
  type: string;
  release_date: string;
  days_until: number;
  overview: string;
  poster_url: string;
}

interface McuCountdownResponse extends McuProduction {
  following_production?: McuProduction;
}

interface McuCardProps {
  data: McuCountdownResponse;
}

export function McuCard({ data }: McuCardProps) {
  const isMovie = data.type?.toLowerCase() === "movie" || data.type === "Film";

  // Format date to something readable like "03 Mai 2024"
  const formattedDate = new Date(data.release_date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl w-full max-w-lg my-4 bg-slate-950 text-white border border-red-900/30"
    >
      {/* Background Poster Blur Effect */}
      {data.poster_url && (
        <div 
          className="absolute inset-0 opacity-20 blur-xl scale-110"
          style={{
            backgroundImage: `url(/api/image-proxy?url=${encodeURIComponent(data.poster_url)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      {/* Marvel Red Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-0" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0" />

      <div className="relative z-10 flex flex-col sm:flex-row h-full">
        {/* Poster Section */}
        {data.poster_url ? (
          <div className="sm:w-2/5 p-4 shrink-0 flex justify-center sm:justify-start">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative rounded-xl overflow-hidden shadow-[0_0_15px_rgba(220,38,38,0.3)] aspect-[2/3] w-40 sm:w-full"
            >
              <img 
                src={`/api/image-proxy?url=${encodeURIComponent(data.poster_url)}`} 
                alt={data.title}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-red-600/90 backdrop-blur-sm rounded text-[10px] font-black uppercase tracking-wider text-white">
                {isMovie ? "Film" : "Série"}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="w-full h-48 bg-slate-900 flex items-center justify-center">
            {isMovie ? <Film size={48} className="text-slate-700" /> : <Tv size={48} className="text-slate-700" />}
          </div>
        )}

        {/* Content Section */}
        <div className="p-5 sm:pl-0 sm:py-6 flex flex-col justify-between sm:w-3/5 flex-grow">
          <div>
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-2 text-red-500 font-bold tracking-widest text-[10px] uppercase"
            >
              <span>Marvel Studios</span>
            </motion.div>
            
            <motion.h3 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl sm:text-3xl font-black leading-none mb-3 text-white drop-shadow-md"
            >
              {data.title}
            </motion.h3>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed"
            >
              {data.overview || "Aucun synopsis disponible."}
            </motion.p>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-auto space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Calendar size={16} className="text-red-500" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="bg-slate-900/80 backdrop-blur-md rounded-lg p-3 border border-slate-800 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-red-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sortie dans</span>
              </div>
              <div className="text-xl font-black text-white">
                {data.days_until} <span className="text-sm text-red-500">Jours</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Following Production (if available) */}
      {data.following_production && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-slate-900/90 border-t border-slate-800 p-3 sm:px-5 flex items-center justify-between text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2 text-slate-400">
            <span className="uppercase text-[10px] font-bold tracking-wider text-slate-500">Ensuite</span>
            <span className="font-semibold text-slate-300 truncate max-w-[150px] sm:max-w-[200px]">{data.following_production.title}</span>
          </div>
          <div className="flex items-center text-red-500 font-medium">
            <span>{data.following_production.days_until} jours</span>
            <ChevronRight size={16} className="ml-1" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
