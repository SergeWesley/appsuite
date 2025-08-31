"use client";

import { Droppable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { Media, MediaStatus } from "@/types/media";
import { DraggableMediaCard } from "./DraggableMediaCard";

interface DroppableStatusColumnProps {
  status: MediaStatus;
  title: string;
  medias: Media[];
  onEdit: (media: Media) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: MediaStatus) => void;
  onOpenTimer: (media: Media) => void;
  icon: React.ElementType;
  color: string;
}

const statusConfig = {
  watching: { bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  completed: { bgColor: "bg-green-50", borderColor: "border-green-200" },
  towatch: { bgColor: "bg-gray-50", borderColor: "border-gray-200" },
  wishlist: { bgColor: "bg-pink-50", borderColor: "border-pink-200" },
  dropped: { bgColor: "bg-red-50", borderColor: "border-red-200" },
};

export function DroppableStatusColumn({
  status,
  title,
  medias,
  onEdit,
  onDelete,
  onStatusChange,
  onOpenTimer,
  icon: Icon,
  color,
}: DroppableStatusColumnProps) {
  const config = statusConfig[status];

  return (
    <div className={`flex flex-col min-h-[500px] rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-4`}>
      {/* En-tête de la colonne */}
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${color}`} />
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
          {medias.length}
        </span>
      </div>

      {/* Zone droppable */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-4 min-h-[400px] rounded-lg transition-colors ${
              snapshot.isDraggingOver 
                ? "bg-white/50 border-2 border-dashed border-purple-300" 
                : ""
            }`}
          >
            {medias.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                Glissez des médias ici
              </div>
            ) : (
              medias.map((media, index) => (
                <DraggableMediaCard
                  key={media.id}
                  media={media}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onOpenTimer={onOpenTimer}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
