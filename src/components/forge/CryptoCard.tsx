import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";

interface CryptoCardProps {
  data: {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    price_change_percentage_24h: number;
    high_24h: number;
    low_24h: number;
  };
  currency: string;
}

function formatPrice(value: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)} T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)} Md`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)} M`;
  return value.toLocaleString("fr-FR");
}

export function CryptoCard({ data, currency }: CryptoCardProps) {
  const isPositive = data.price_change_percentage_24h >= 0;
  const changePercent = Math.abs(data.price_change_percentage_24h).toFixed(2);
  const range24h = data.high_24h - data.low_24h;
  const positionInRange =
    range24h > 0 ? ((data.current_price - data.low_24h) / range24h) * 100 : 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl max-w-sm w-full my-4"
    >
      {/* Background gradient based on performance */}
      <div
        className={`absolute inset-0 ${
          isPositive
            ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800"
            : "bg-gradient-to-br from-rose-950 via-rose-900 to-red-800"
        }`}
      />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Glow effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 0.3 }}
        className={`absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl ${
          isPositive ? "bg-emerald-400" : "bg-rose-400"
        }`}
      />

      <div className="relative z-10 p-6">
        {/* Header: Coin identity */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 p-1.5 flex items-center justify-center"
            >
              <img
                src={`/api/image-proxy?url=${encodeURIComponent(data.image)}`}
                alt={data.name}
                className="w-full h-full rounded-full object-contain"
              />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
                {data.name}
              </h3>
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                {data.symbol}
              </span>
            </div>
          </div>

          {/* Change badge */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${
              isPositive
                ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/20"
                : "bg-rose-400/20 text-rose-300 border border-rose-400/20"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={14} strokeWidth={2.5} />
            ) : (
              <ArrowDownRight size={14} strokeWidth={2.5} />
            )}
            {changePercent}%
          </motion.div>
        </div>

        {/* Current price */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
            Prix actuel
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tight">
              {formatPrice(data.current_price, currency)}
            </span>
          </div>
        </motion.div>

        {/* 24h Range bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">
            <span>Min 24h</span>
            <span>Max 24h</span>
          </div>
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${positionInRange}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className={`absolute inset-y-0 left-0 rounded-full ${
                isPositive
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-300"
                  : "bg-gradient-to-r from-rose-500 to-rose-300"
              }`}
            />
            {/* Indicator dot */}
            <motion.div
              initial={{ left: 0, opacity: 0 }}
              animate={{ left: `${positionInRange}%`, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 shadow-lg ${
                isPositive
                  ? "bg-emerald-300 border-emerald-100"
                  : "bg-rose-300 border-rose-100"
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-white/70 mt-2">
            <span>{formatPrice(data.low_24h, currency)}</span>
            <span>{formatPrice(data.high_24h, currency)}</span>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-3 border border-white/[0.06]">
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 size={12} className="text-white/40" />
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                Capitalisation
              </span>
            </div>
            <span className="text-sm font-bold text-white">
              {formatMarketCap(data.market_cap)} $
            </span>
          </div>
          <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-3 border border-white/[0.06]">
            <div className="flex items-center gap-1.5 mb-1">
              {isPositive ? (
                <TrendingUp size={12} className="text-emerald-400" />
              ) : (
                <TrendingDown size={12} className="text-rose-400" />
              )}
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                Variation 24h
              </span>
            </div>
            <span
              className={`text-sm font-bold ${
                isPositive ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {isPositive ? "+" : "-"}{changePercent}%
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
