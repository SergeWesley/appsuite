"use client";

import { useChat } from "ai/react";
import { useRef, useEffect, useState } from "react";
import { Send, Bot, User, Loader2, BookOpen, Hammer, PlusCircle } from "lucide-react";
import { ToolRenderer } from "@/components/forge/ToolRenderer";
import { AppHeader } from "@/components/AppHeader";
import { ApiCatalog } from "@/components/forge/ApiCatalog";

export default function ForgeBuilderPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages } =
    useChat({
      api: "/api/forge-chat",
    });

  const [showCatalog, setShowCatalog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restauration de l'historique au chargement
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("forge-chat-history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Erreur de parsing de l'historique", e);
      }
    }
  }, [setMessages]);

  // Sauvegarde à chaque changement (uniquement après le montage pour ne pas écraser l'existant)
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("forge-chat-history", JSON.stringify(messages));
    }
  }, [messages, isMounted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = () => {
    setMessages([]);
    localStorage.removeItem("forge-chat-history");
    setInput("");
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <AppHeader
        title="Forge Builder"
        icon={Hammer}
        iconColor="text-indigo-600"
        currentModule="forge"
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleNewChat}
              className="p-2 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:bg-gray-100"
              aria-label="Nouvelle discussion"
              title="Nouvelle discussion"
            >
              <PlusCircle size={20} />
              <span className="hidden sm:inline text-sm font-medium">Nouveau</span>
            </button>
            <button
              onClick={() => setShowCatalog(!showCatalog)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${showCatalog ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-100"}`}
              aria-label="Afficher le catalogue d'actions"
            >
              <BookOpen size={20} />
              <span className="hidden sm:inline text-sm font-medium">Catalogue API</span>
            </button>
          </div>
        }
      />
      <div className="flex-1 flex w-full overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto w-full space-y-8">
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
                      {m.role === "user" ? (
                        <User size={16} />
                      ) : (
                        <Bot size={16} />
                      )}
                    </div>

                    <div
                      className={`flex flex-col w-full md:max-w-[80%] ${
                        m.role === "user" 
                          ? "max-w-[85%] items-end" 
                          : "max-w-[95%] items-start"
                      }`}
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
                      {(m as any).toolInvocations?.map(
                        (toolInvocation: any) => {
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
                                <ToolRenderer
                                  toolName={toolName}
                                  result={result}
                                />
                              </div>
                            );
                          }

                          return null;
                        },
                      )}
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
            </div>

            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-100 p-4 md:p-6">
            <div className="max-w-5xl mx-auto w-full">
              <form
                onSubmit={handleSubmit}
                className="relative flex items-center"
              >
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Que voulez-vous afficher depuis Forge ?"
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

        {/* Catalogue: Modal (Mobile) ou Sidebar (Desktop) */}
        {showCatalog && (
          <>
            {/* Overlay Modal pour Mobile */}
            <div 
              className="md:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCatalog(false)}
            >
              <div 
                className="bg-white w-full max-w-sm max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <ApiCatalog 
                  onActionClick={(text) => {
                    setInput(text);
                    setShowCatalog(false);
                  }} 
                />
              </div>
            </div>

            {/* Sidebar pour Desktop */}
            <div className="hidden md:block w-[350px] flex-shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 transition-all border-l border-gray-100 bg-gray-50">
              <ApiCatalog onActionClick={(text) => setInput(text)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
