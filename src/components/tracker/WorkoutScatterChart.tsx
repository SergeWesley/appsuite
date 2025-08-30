"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import { WorkoutSession } from "@/types/workout-session";
import { convertToDetailedSession, DetailedWorkoutSession } from "@/types/detailed-workout";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

interface WorkoutScatterChartProps {
  session: WorkoutSession;
  className?: string;
}

interface ScatterDataPoint {
  x: number; // Index de l'exercice
  y: number; // Poids
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  volume: number; // poids * reps
  setNumber: number; // Numéro de la série
}

// Fonction pour générer une couleur basée sur le volume
const getColorFromVolume = (volume: number, minVolume: number, maxVolume: number) => {
  // Normaliser le volume entre 0 et 1
  const normalized = maxVolume > minVolume ? (volume - minVolume) / (maxVolume - minVolume) : 0.5;
  
  // Créer un dégradé du bleu (faible volume) au rouge (fort volume)
  const hue = (1 - normalized) * 240; // 240 = bleu, 0 = rouge
  return `hsla(${hue}, 70%, 50%, 0.7)`;
};

export function WorkoutScatterChart({ session, className }: WorkoutScatterChartProps) {
  const { chartData, exerciseLabels } = useMemo(() => {
    // Convertir la session en version détaillée
    const detailedSession = convertToDetailedSession(session);

    // Filtrer les exercices qui ont des séries avec poids défini
    const exercicesWithSets = detailedSession.exercises.filter(
      (ex) => ex.sets.length > 0 && ex.sets.some(set => set.weight > 0 && set.reps > 0 && set.completed)
    );

    if (exercicesWithSets.length === 0) {
      return { chartData: null, exerciseLabels: [] };
    }

    const dataPoints: ScatterDataPoint[] = [];
    const exerciseLabels: string[] = [];

    exercicesWithSets.forEach((exercise, exerciseIndex) => {
      const exerciseName = exercise.exercise?.name || "Exercice inconnu";
      exerciseLabels.push(exerciseName);

      // Créer un point pour chaque série complétée
      exercise.sets
        .filter(set => set.completed && set.weight > 0 && set.reps > 0)
        .forEach((set) => {
          const volume = set.weight * set.reps;

          dataPoints.push({
            x: exerciseIndex,
            y: set.weight,
            exerciseName,
            sets: exercise.sets.length,
            reps: set.reps,
            weight: set.weight,
            volume,
            setNumber: set.setNumber,
          });
        });
    });

    if (dataPoints.length === 0) {
      return { chartData: null, exerciseLabels };
    }

    // Calculer les volumes min et max pour la couleur
    const volumes = dataPoints.map(p => p.volume);
    const minVolume = Math.min(...volumes);
    const maxVolume = Math.max(...volumes);

    // Préparer les données pour Chart.js
    const chartData = {
      datasets: [
        {
          label: "Séries",
          data: dataPoints.map((point) => ({
            x: point.x,
            y: point.y,
          })),
          backgroundColor: dataPoints.map((point) =>
            getColorFromVolume(point.volume, minVolume, maxVolume)
          ),
          borderColor: dataPoints.map((point) =>
            getColorFromVolume(point.volume, minVolume, maxVolume).replace("0.7", "1")
          ),
          borderWidth: 2,
          pointRadius: dataPoints.map((point) => {
            // Taille du point basée sur les répétitions (min 4, max 20)
            return Math.max(4, Math.min(20, point.reps * 1.5));
          }),
          pointHoverRadius: dataPoints.map((point) => {
            return Math.max(6, Math.min(25, point.reps * 1.8));
          }),
        },
      ],
      dataPoints, // Stockage des données pour le tooltip
    };

    return { chartData, exerciseLabels };
  }, [session]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2, // Pour une meilleure qualité sur les écrans haute résolution
    plugins: {
      title: {
        display: true,
        text: "📊 Analyse de la séance par série",
        font: {
          size: window.innerWidth < 768 ? 14 : 18,
          weight: "bold" as const,
          family: "system-ui, -apple-system, sans-serif",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
        color: "#1f2937",
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: () => "",
          label: (context: any) => {
            const dataPoint = chartData?.dataPoints?.[context.dataIndex];
            if (!dataPoint) return "";

            return [
              `🏋️ ${dataPoint.exerciseName}`,
              `📊 Série ${dataPoint.setNumber}/${dataPoint.sets}`,
              `⚖️ ${dataPoint.weight} kg × ${dataPoint.reps} reps`,
              `💪 Volume: ${dataPoint.volume} kg`,
            ];
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 2,
        cornerRadius: 12,
        padding: 16,
        bodyFont: {
          size: 13,
          weight: "500",
        },
        displayColors: false,
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        position: "bottom" as const,
        title: {
          display: true,
          text: "🏃 Exercices",
          font: {
            size: window.innerWidth < 768 ? 12 : 14,
            weight: "600" as const,
            family: "system-ui, -apple-system, sans-serif",
          },
          color: "#374151",
          padding: {
            top: 15,
          },
        },
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            const index = Math.round(value);
            const label = exerciseLabels[index] || "";
            // Tronquer les noms longs sur mobile
            if (window.innerWidth < 768 && label.length > 12) {
              return label.substring(0, 12) + "...";
            }
            return label;
          },
          maxRotation: window.innerWidth < 768 ? 65 : 45,
          minRotation: window.innerWidth < 768 ? 45 : 0,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
            weight: "500" as const,
          },
          color: "#6b7280",
          padding: 8,
        },
        min: -0.5,
        max: exerciseLabels.length - 0.5,
        grid: {
          display: true,
          color: "rgba(107, 114, 128, 0.1)",
          lineWidth: 1,
        },
        border: {
          color: "#d1d5db",
          width: 1,
        },
      },
      y: {
        title: {
          display: true,
          text: "⚖️ Poids (kg)",
          font: {
            size: window.innerWidth < 768 ? 12 : 14,
            weight: "600" as const,
            family: "system-ui, -apple-system, sans-serif",
          },
          color: "#374151",
          padding: {
            bottom: 15,
          },
        },
        beginAtZero: true,
        grace: "5%", // Ajouter un peu d'espace en haut
        grid: {
          display: true,
          color: "rgba(107, 114, 128, 0.1)",
          lineWidth: 1,
        },
        border: {
          color: "#d1d5db",
          width: 1,
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
            weight: "500" as const,
          },
          color: "#6b7280",
          padding: 8,
          callback: function(value: any) {
            return value + " kg";
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "point" as const,
    },
  };

  if (!chartData) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className || ""}`}>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune donnée à afficher
          </h3>
          <p className="text-gray-600">
            Cette séance ne contient pas d'exercices avec poids et répétitions définis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 ${className || ""}`}>
      {/* En-tête avec statistiques rapides */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
            📊 Visualisation des Séries
          </h3>
          <div className="flex flex-wrap gap-3 text-xs md:text-sm">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              {chartData.dataPoints.length} séries
            </div>
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
              {exerciseLabels.length} exercices
            </div>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-80 md:h-96 lg:h-[28rem] mb-6">
        <Scatter data={chartData} options={options} />
      </div>

      {/* Légende personnalisée améliorée */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">📖 Légende</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-red-400 shadow-sm"></div>
            <div>
              <div className="text-sm font-medium text-gray-900">Couleur des points</div>
              <div className="text-xs text-gray-600">Volume (poids × répétitions)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Taille des points</div>
              <div className="text-xs text-gray-600">Nombre de répétitions</div>
            </div>
          </div>
        </div>

        {/* Note explicative */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs md:text-sm text-blue-800">
            💡 <strong>Astuce :</strong> Passez votre souris sur les points pour voir les détails de chaque série.
            Les points plus gros indiquent plus de répétitions, et les couleurs chaudes (rouge/orange) indiquent un volume plus élevé.
          </p>
        </div>
      </div>
    </div>
  );
}
