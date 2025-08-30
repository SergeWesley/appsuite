"use client";

import React from "react";
import { WorkoutScatterChart } from "./WorkoutScatterChart";
import { WorkoutSession, Exercise } from "@/types/workout-session";

// Données de test pour la démonstration
const createTestSession = (): WorkoutSession => {
  const testExercises: Exercise[] = [
    {
      id: "1",
      name: "Développé Couché",
      muscleGroup: "upper_body",
      isCustom: false,
      dateCreated: new Date(),
    },
    {
      id: "2", 
      name: "Curl Biceps",
      muscleGroup: "upper_body",
      isCustom: false,
      dateCreated: new Date(),
    },
    {
      id: "3",
      name: "Élévations Latérales",
      muscleGroup: "upper_body", 
      isCustom: false,
      dateCreated: new Date(),
    },
    {
      id: "4",
      name: "Squat",
      muscleGroup: "lower_body",
      isCustom: false,
      dateCreated: new Date(),
    },
    {
      id: "5",
      name: "Rowing Barre",
      muscleGroup: "upper_body",
      isCustom: false,
      dateCreated: new Date(),
    },
  ];

  return {
    id: "demo-session",
    date: new Date(),
    notes: "Séance de démonstration pour tester le graphique scatter plot",
    exercises: [
      {
        id: "we1",
        exerciseId: "1",
        exercise: testExercises[0],
        sets: 4,
        reps: 10,
        weight: 80,
        order: 1,
      },
      {
        id: "we2",
        exerciseId: "2", 
        exercise: testExercises[1],
        sets: 3,
        reps: 12,
        weight: 15,
        order: 2,
      },
      {
        id: "we3",
        exerciseId: "3",
        exercise: testExercises[2],
        sets: 3,
        reps: 15,
        weight: 8,
        order: 3,
      },
      {
        id: "we4",
        exerciseId: "4",
        exercise: testExercises[3],
        sets: 4,
        reps: 8,
        weight: 100,
        order: 4,
      },
      {
        id: "we5",
        exerciseId: "5",
        exercise: testExercises[4],
        sets: 3,
        reps: 10,
        weight: 60,
        order: 5,
      },
    ],
    totalExercises: 5,
    duration: 75,
    userId: "demo-user",
    dateCreated: new Date(),
    dateUpdated: new Date(),
  };
};

export function WorkoutScatterChartDemo() {
  const testSession = createTestSession();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📊 Démonstration du Graphique de Séance
        </h1>
        <p className="text-lg text-gray-600">
          Voici un aperçu du graphique scatter plot pour visualiser les séries d'une séance de sport.
        </p>
      </div>

      {/* Informations sur la séance de test */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          📋 Séance de Démonstration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Date:</span>
            <span className="ml-2 text-blue-700">Aujourd'hui</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Exercices:</span>
            <span className="ml-2 text-blue-700">{testSession.totalExercises}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Durée:</span>
            <span className="ml-2 text-blue-700">{testSession.duration} min</span>
          </div>
        </div>
        
        <div className="mt-4">
          <span className="font-medium text-blue-800">Exercices inclus:</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {testSession.exercises.map((ex) => (
              <span
                key={ex.id}
                className="bg-white text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-200"
              >
                {ex.exercise?.name} ({ex.sets}×{ex.reps} @ {ex.weight}kg)
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Le graphique */}
      <WorkoutScatterChart session={testSession} />

      {/* Explication */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📖 Comment Lire ce Graphique
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">🏃 Axe Horizontal (X)</h3>
            <p className="text-gray-600 text-sm">
              Chaque position représente un exercice différent. Les exercices sont ordonnés selon leur apparition dans la séance.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">⚖️ Axe Vertical (Y)</h3>
            <p className="text-gray-600 text-sm">
              La hauteur de chaque point indique le poids utilisé pour cette série en kilogrammes.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">📏 Taille des Points</h3>
            <p className="text-gray-600 text-sm">
              Plus le point est gros, plus le nombre de répétitions est élevé pour cette série.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">🌈 Couleur des Points</h3>
            <p className="text-gray-600 text-sm">
              La couleur indique le volume (poids × répétitions). Bleu = faible volume, Rouge = volume élevé.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
