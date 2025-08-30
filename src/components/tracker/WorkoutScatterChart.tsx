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
    plugins: {
      title: {
        display: true,
        text: "Analyse de la séance par série",
        font: {
          size: 16,
          weight: "bold" as const,
        },
        padding: 20,
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
              `${dataPoint.exerciseName}`,
              `Série ${dataPoint.setNumber}/${dataPoint.sets}`,
              `${dataPoint.weight} kg × ${dataPoint.reps} reps`,
              `Volume: ${dataPoint.volume} kg`,
            ];
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        position: "bottom" as const,
        title: {
          display: true,
          text: "Exercices",
          font: {
            size: 14,
            weight: "bold" as const,
          },
        },
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            const index = Math.round(value);
            return exerciseLabels[index] || "";
          },
          maxRotation: 45,
          font: {
            size: 12,
          },
        },
        min: -0.5,
        max: exerciseLabels.length - 0.5,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Poids (kg)",
          font: {
            size: 14,
            weight: "bold" as const,
          },
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          font: {
            size: 12,
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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className || ""}`}>
      <div className="h-80 md:h-96">
        <Scatter data={chartData} options={options} />
      </div>
      
      {/* Légende personnalisée */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-red-400"></div>
            <span>Couleur : Volume (kg × reps)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
            </div>
            <span>Taille : Nombre de répétitions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
