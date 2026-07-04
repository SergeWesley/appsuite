"use client";

import { useChat } from "ai/react";
import { useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { ToolRenderer } from "@/components/forge/ToolRenderer";
import { AppHeader } from "@/components/AppHeader";
import { Hammer } from "lucide-react";

export default function ForgeBuilderPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/forge-chat",
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AppHeader
        title="Forge Builder"
        icon={Hammer}
        iconColor="text-indigo-600"
        currentModule="forge"
      />
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto p-4 md:p-6">
        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                <Bot size={48} className="text-indigo-600" />
                <p className="text-sm text-gray-500 max-w-[300px]">
                  Demandez-moi des informations (ex: "Météo à Paris") et je
                  construirai l'interface correspondante.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div
                    className={`flex flex-col max-w-[80%] ${m.role === "user" ? "items-end" : "items-start"}`}
                  >
                    {/* Texte du message (si présent) */}
                    {m.content && (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm ${
                          m.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-sm"
                            : "bg-gray-100 text-gray-800 rounded-tl-sm"
                        }`}
                      >
                        {m.content}
                      </div>
                    )}

                    {/* Rendu dynamique de l'UI (Generative UI) */}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(m as any).toolInvocations?.map((toolInvocation: any) => {
                      const { toolCallId, toolName, state, result } =
                        toolInvocation;

                      if (state === "call" || state === "partial-call") {
                        return (
                          <div
                            key={toolCallId}
                            className="mt-2 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                          >
                            <Loader2 size={12} className="animate-spin" />
                            Appel en cours... ({toolName})
                          </div>
                        );
                      }

                      if (state === "result") {
                        if (!result.success) {
                          return (
                            <div
                              key={toolCallId}
                              className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100"
                            >
                              Erreur: {result.error}
                            </div>
                          );
                        }

                        // Utilisation du Design Pattern Strategy via ToolRenderer
                        return (
                          <div key={toolCallId}>
                            <ToolRenderer toolName={toolName} result={result} />
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              ))
            )}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center">
                  <Loader2 size={16} className="animate-spin text-gray-500" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center"
            >
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Que voulez-vous afficher depuis le backend Forge ?"
                className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
