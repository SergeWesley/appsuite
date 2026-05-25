"use client";

import { WorkoutSession } from "@/types/workout-session";
import { Calendar, Activity, Clock, FileText } from "lucide-react";
import { formatDuration } from "@/lib/workout-utils";

interface SessionInfoCardProps {
  session: WorkoutSession;
  estimatedDuration: number;
  formatDate: (date: Date) => string;
}

export function SessionInfoCard({
  session,
  estimatedDuration,
  formatDate,
}: SessionInfoCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <Calendar size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-semibold text-gray-900 capitalize">
              {formatDate(session.date)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Activity size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Exercices</p>
            <p className="font-semibold text-gray-900">
              {session.totalExercises}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 rounded-lg">
            <Clock size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Durée estimée</p>
            <p className="font-semibold text-gray-900">
              {formatDuration(estimatedDuration)}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {session.notes && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={20} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">Notes</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{session.notes}</p>
        </div>
      )}
    </div>
  );
}
