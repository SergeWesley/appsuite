"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, X, Sparkles, Send, Loader2 } from "lucide-react";
import { useAgent } from "./AgentProvider";
import { usePathname, useRouter } from "next/navigation";
import { getModuleByPath, defaultTheme } from "@/config/modules";
import { supabase } from "@/lib/supabase";

export function AgentChatModal() {
  const { isOpen, closeAgent, openAgent, options } = useAgent();
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname() || "";

  // Déterminer le thème actuel à partir de l'URL via la configuration centralisée
  const currentModule = getModuleByPath(pathname);
  const theme = currentModule?.theme || defaultTheme;

  // Récupérer le token d'accès Supabase pour l'authentification côté serveur
  const [accessToken, setAccessToken] = useState<string>("");
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAccessToken(session?.access_token || "");
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setAccessToken(session?.access_token || "");
    });
    return () => subscription.unsubscribe();
  }, []);

  // Détecter automatiquement si on est dans le contexte d'une note (URL: /notes/[folderId]/[noteId])
  const noteMatch = pathname.match(/^\/notes\/([^/]+)\/([^/]+)$/);
  const detectedNoteId = noteMatch?.[2] || null;

  // Construire le contexte système enrichi avec l'ID de note si disponible
  const buildSystemContext = () => {
    const base =
      options?.systemContext ||
      `L'utilisateur se trouve dans le module: ${currentModule?.name || "Général"}`;
    if (detectedNoteId) {
      return `${base}\nL'utilisateur consulte actuellement une note (ID: ${detectedNoteId}). Utilise l'outil getNoteContentTool avec cet ID pour récupérer son contenu avant de répondre à toute question sur cette note.`;
    }
    return base;
  };

  // État d'erreur enrichi (le error de useChat est souvent trop générique)
  const [customError, setCustomError] = useState<string | null>(null);

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChat({
    api: "/api/chat",
    body: {
      accessToken,
      data: {
        systemContext: buildSystemContext(),
      },
    },
    onResponse: async (response) => {
      // Si la réponse HTTP est en erreur, parser le body pour le vrai message
      if (!response.ok) {
        try {
          const body = await response.json();
          setCustomError(
            body?.error || `Erreur ${response.status} : ${response.statusText}`,
          );
        } catch {
          setCustomError(`Erreur ${response.status} : ${response.statusText}`);
        }
      } else {
        setCustomError(null);
      }
    },
    onError: (err) => {
      console.error("[AgentChat] Erreur:", err);
      setCustomError(err.message || "Erreur de connexion au serveur.");
    },
  });

  const router = useRouter();

  // Gérer l'injection du message initial à l'ouverture
  useEffect(() => {
    if (isOpen && options?.initialMessage) {
      setInput(options.initialMessage);
    }
  }, [isOpen, options?.initialMessage, setInput]);

  // Focus automatique sur l'input quand on ouvre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Refresh de l'UI à la fermeture si l'IA a effectué des actions
  const hasToolActions = messages.some(
    (m) => m.role === "assistant" && (m as any).toolInvocations?.length > 0,
  );

  useEffect(() => {
    if (!isOpen && hasToolActions) {
      router.refresh();
      window.dispatchEvent(new Event("appsuite:refresh-data"));
    }
  }, [isOpen, hasToolActions, router]);

  const handleClose = () => {
    closeAgent();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleClose()}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />

            {/* Modal de chat */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-[10%] md:top-[15%] -translate-x-1/2 z-[101] w-[95%] max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
              style={{ maxHeight: "80vh", height: "600px" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`${theme.bgSoft} p-2 rounded-xl ${theme.textDark}`}
                  >
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      Assistant IA
                    </h2>
                    <p className="text-xs text-gray-500">
                      {options?.systemContext ||
                        (detectedNoteId
                          ? "L'utilisateur est dans le module Notes, en train d'éditer une note."
                          : "Posez vos questions ou demandez une action")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs text-gray-500 font-mono">
                    <span className="text-[10px]">⌘</span>K
                  </kbd>
                  <button
                    onClick={() => handleClose()}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Bandeau d'erreur */}
                {(customError || error) && (
                  <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <span className="mt-0.5 flex-shrink-0 text-red-500">
                      ⚠
                    </span>
                    <div>
                      <p className="font-medium">
                        {customError ||
                          error?.message ||
                          "Une erreur inconnue s'est produite."}
                      </p>
                      {error && !customError && error.message && (
                        <p className="mt-1 text-xs text-red-500 opacity-75">
                          Détails : {error.toString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                    <Bot size={48} className={theme.text} />
                    <p className="text-sm text-gray-500 max-w-[250px]">
                      Je suis là pour vous aider à gérer vos données et naviguer
                      dans l'application.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-4 ${
                        m.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          m.role === "user"
                            ? `${theme.bg} text-white`
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
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          m.role === "user"
                            ? `${theme.bg} text-white rounded-tr-sm`
                            : "bg-gray-100 text-gray-800 rounded-tl-sm"
                        }`}
                      >
                        {m.content}
                        {/* Indicateur discret si l'outil a été appelé */}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(m as any).toolInvocations?.map(
                          (toolInvocation: any) => {
                            const { toolCallId, state, result } =
                              toolInvocation;
                            const isSuccess = result?.success !== false;
                            const isRunning =
                              state === "call" || state === "partial-call";

                            return (
                              <div
                                key={toolCallId}
                                className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                  isRunning
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : isSuccess
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-red-50 text-red-600 border border-red-200"
                                }`}
                              >
                                {isRunning ? (
                                  <Loader2 size={11} className="animate-spin" />
                                ) : isSuccess ? (
                                  <span>✓</span>
                                ) : (
                                  <span>✕</span>
                                )}
                                {isRunning
                                  ? "Action en cours…"
                                  : isSuccess
                                    ? "Action effectuée"
                                    : result?.error || "Échec de l'action"}
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center">
                      <Loader2
                        size={16}
                        className="animate-spin text-gray-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                <form
                  onSubmit={(e) => {
                    handleSubmit(e);
                    // Si l'option initialMessage est présente, on peut la réinitialiser ici si nécessaire
                  }}
                  className="relative flex items-center"
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Demandez à l'assistant..."
                    className={`w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ${theme.ring} transition-all text-sm`}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={`absolute right-2 p-2 text-white ${theme.bg} rounded-lg ${theme.bgSolidHover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
