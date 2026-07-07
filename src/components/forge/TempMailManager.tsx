import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Copy,
  Check,
  X,
  Inbox,
  ChevronRight,
  ShieldCheck,
  Clock
} from "lucide-react";

interface TempMailManagerProps {
  result: any;
}

export function TempMailManager({ result }: TempMailManagerProps) {
  const data = result.data || {};
  
  // On déduit le mode (Génération vs Vérification)
  const isGenerate = !!data.email_addr;
  const isCheck = !!data.list;

  const email = isGenerate ? data.email_addr : data.email;
  const token = isGenerate ? data.sid_token : data.sid_token;
  const emailList = isCheck ? data.list : [];

  useEffect(() => {
    if (isGenerate && token) {
      try {
        const existingContext = JSON.parse(localStorage.getItem("forge-system-context") || "{}");
        const newContext = { 
          ...existingContext, 
          "Jeton d'e-mail temporaire actuel (sid_token)": token 
        };
        localStorage.setItem("forge-system-context", JSON.stringify(newContext));
        window.dispatchEvent(new CustomEvent("forgeContextUpdated", { detail: newContext }));
      } catch (e) {
        console.error("Erreur lors de la sauvegarde du contexte", e);
      }
    }
  }, [isGenerate, token]);

  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedMail, setSelectedMail] = useState<any>(null);

  const handleCopy = (text: string, type: "email" | "token") => {
    if (text) {
      navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl my-4 space-y-4 font-sans">
      {/* 1. En-tête / Carte Principale */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <ShieldCheck size={160} className="transform rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/30 p-2.5 rounded-xl border border-indigo-400/30">
              {isGenerate ? <Mail size={24} className="text-indigo-200" /> : <Inbox size={24} className="text-indigo-200" />}
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                {isGenerate ? "Adresse E-mail Temporaire" : "Boîte de Réception"}
              </h3>
              <p className="text-indigo-200 text-xs font-medium">
                {isGenerate ? "Votre adresse jetable est prête à l'emploi." : "Consultation des messages reçus."}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col overflow-hidden pr-4">
                <span className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-0.5">E-mail</span>
                <span className="text-base font-mono font-bold text-white truncate">{email || "En attente..."}</span>
              </div>
              <button
                onClick={() => handleCopy(email, "email")}
                className="shrink-0 p-2 bg-white/5 hover:bg-white/20 rounded-lg border border-white/10 transition-colors"
                title="Copier l'email"
              >
                {copiedEmail ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-indigo-200" />}
              </button>
            </div>
            
            <div className="h-px w-full bg-white/10" />
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col overflow-hidden pr-4">
                <span className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-0.5">Jeton de session (Token)</span>
                <span className="text-xs font-mono text-indigo-100 truncate">{token || "En attente..."}</span>
              </div>
              <button
                onClick={() => handleCopy(token, "token")}
                className="shrink-0 p-2 bg-white/5 hover:bg-white/20 rounded-lg border border-white/10 transition-colors"
                title="Copier le jeton"
              >
                {copiedToken ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-indigo-200" />}
              </button>
            </div>
          </div>
          
          {isGenerate && (
            <div className="bg-blue-500/20 border border-blue-400/20 rounded-lg p-3 flex items-center gap-3">
              <Clock size={18} className="text-blue-300 shrink-0" />
              <p className="text-xs text-blue-100 leading-relaxed">
                Utilisez cette adresse pour vous inscrire. Demandez-moi ensuite : <strong className="text-white">"Vérifie ma boîte mail"</strong> pour lire les messages reçus.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* 2. Liste des e-mails (Mode Vérification) */}
      {isCheck && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Inbox size={16} className="text-indigo-500" />
              Messages reçus
            </h4>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {emailList.length}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {emailList.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-3 text-gray-500">
                <Mail size={32} className="text-gray-300" />
                <p className="text-sm font-medium">La boîte de réception est vide.</p>
              </div>
            ) : (
              emailList.map((mail: any, idx: number) => (
                <div
                  key={mail.mail_id || idx}
                  onClick={() => setSelectedMail(mail)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 text-sm">
                    {mail.mail_from ? mail.mail_from.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-sm font-bold text-gray-900 truncate pr-4">
                        {mail.mail_from}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                        {mail.mail_date}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 truncate">
                      {mail.mail_subject || "(Sans objet)"}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {mail.mail_excerpt}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* 3. Modale de lecture d'e-mail */}
      <AnimatePresence>
        {selectedMail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-200"
            >
              {/* Header Modale */}
              <div className="p-5 border-b border-gray-100 bg-gray-50/80 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2">
                    {selectedMail.mail_subject || "(Sans objet)"}
                  </h3>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-12 shrink-0">De :</span>
                      <strong className="text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200 truncate">
                        {selectedMail.mail_from}
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-12 shrink-0">Date :</span>
                      <span className="text-gray-600">{selectedMail.mail_date}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMail(null)}
                  className="p-2 bg-white hover:bg-gray-100 rounded-full border border-gray-200 transition-colors shrink-0"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Corps Modale */}
              <div className="p-6 overflow-y-auto flex-1 bg-white">
                <div 
                  className="prose prose-sm max-w-none text-gray-800 break-words font-sans"
                  dangerouslySetInnerHTML={{ 
                    __html: (selectedMail.mail_body || selectedMail.mail_excerpt)
                      ? String(selectedMail.mail_body || selectedMail.mail_excerpt).replace(/\r\n|\r|\n/g, '<br/>') 
                      : "<em>Aucun contenu</em>" 
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
