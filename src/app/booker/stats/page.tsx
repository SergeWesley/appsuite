"use client";

import { useState } from "react";
// Framer motion retiré
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  BookOpen,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { useReadingAnalytics } from "@/hooks/booker/useReadingAnalytics";
import { ReadingTimeChart } from "@/components/booker/ReadingTimeChart";
import { ReadingProgressChart } from "@/components/booker/ReadingProgressChart";
import { ReadingHeatmap } from "@/components/booker/ReadingHeatmap";
import { BookStatsCard } from "@/components/booker/BookStatsCard";

export default function BookerStatsPage() {
  const router = useRouter();
  const {
    dailyStats,
    weeklyStats,
    monthlyStats,
    yearlyStats,
    topBooks,
    recentSessions,
    globalStats,
    loading,
    error,
  } = useReadingAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Chargement des statistiques...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/booker"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour à la bibliothèque
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      title="Statistiques de lecture"
      icon={BarChart3}
      iconColor="text-blue-600"
      currentModule="booker"
      onBack={() => router.push("/booker")}
      bgClass="min-h-screen bg-gray-50 overflow-x-hidden"
    >
        {/* Statistiques globales */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temps total de lecture</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.floor(globalStats.totalReadingTime / 3600)}h{" "}
                  {Math.floor((globalStats.totalReadingTime % 3600) / 60)}m
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500 bg-opacity-10">
                <Clock size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sessions de lecture</p>
                <p className="text-2xl font-bold text-green-600">
                  {globalStats.totalSessions}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500 bg-opacity-10">
                <BookOpen size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jours de lecture</p>
                <p className="text-2xl font-bold text-purple-600">
                  {globalStats.activeDays}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500 bg-opacity-10">
                <Calendar size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Moyenne quotidienne</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.floor(globalStats.averageDailyTime / 60)}m
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500 bg-opacity-10">
                <TrendingUp size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Graphique du temps de lecture quotidien */}
          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Temps de lecture quotidien (30 derniers jours)
            </h3>
            <ReadingTimeChart data={dailyStats} />
          </div>

          {/* Graphique de progression de lecture */}
          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Courbe de progression (12 derniers mois)
            </h3>
            <ReadingProgressChart data={monthlyStats} />
          </div>
        </div>

        {/* Heatmap et livres les plus lus */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Heatmap des jours de lecture */}
          <div
            className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Calendrier de lecture (30 derniers jours)
            </h3>
            <ReadingHeatmap data={dailyStats} />
          </div>

          {/* Top livres */}
          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Livres les plus lus
            </h3>
            <div className="space-y-4">
              {topBooks.slice(0, 5).map((book, index) => (
                <BookStatsCard key={book.id} book={book} rank={index + 1} />
              ))}
            </div>
          </div>
        </div>

        {/* Sessions récentes */}
        <div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sessions récentes
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Livre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pages
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSessions.slice(0, 10).map((session: any) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {session.bookTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.startTime).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor(session.duration / 60)}m{" "}
                      {session.duration % 60}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.pagesRead || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </AppLayout>
  );
}
