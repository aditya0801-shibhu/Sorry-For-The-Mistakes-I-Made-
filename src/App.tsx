import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DEFAULT_STATE, ApologyState } from "./types";
import BoyfriendDashboard from "./components/BoyfriendDashboard";
import GirlfriendCard from "./components/GirlfriendCard";
import { Heart, Edit, ArrowRight, Settings, X } from "lucide-react";

export default function App() {
  const [activeState, setActiveState] = useState<ApologyState>(DEFAULT_STATE);
  const [isShared, setIsShared] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Load state from URL parameters on initialization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("c");

    if (code) {
      try {
        const decodedJson = decodeURIComponent(atob(code));
        const parsedState = JSON.parse(decodedJson) as ApologyState;
        
        if (parsedState && parsedState.girlfriendName) {
          setActiveState(parsedState);
          setIsShared(true); // Girlfriend Mode: pure immersive apology webpage
        }
      } catch (error) {
        console.error("Failed to parse apology card link:", error);
      }
    } else {
      // Support readable individual query params if someone manually edits URL
      const to = params.get("to");
      const from = params.get("from");
      const reason = params.get("reason");
      const gift = params.get("gift");
      const text = params.get("text");

      if (to || from) {
        setActiveState({
          ...DEFAULT_STATE,
          girlfriendName: to || DEFAULT_STATE.girlfriendName,
          boyfriendName: from || DEFAULT_STATE.boyfriendName,
          reason: reason || DEFAULT_STATE.reason,
          giftType: (gift as any) || DEFAULT_STATE.giftType,
          generatedText: text || DEFAULT_STATE.generatedText,
        });
        setIsShared(true);
      }
    }
  }, []);

  // Pack the current state into a secure Base64 query parameter URL
  const handleGenerateShareLink = (): string => {
    try {
      const jsonStr = JSON.stringify(activeState);
      const b64 = btoa(encodeURIComponent(jsonStr));
      return `${window.location.origin}${window.location.pathname}?c=${b64}`;
    } catch (e) {
      console.error("Failed to serialize state:", e);
      return window.location.href;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-sans text-[#e2e2e2] antialiased bg-dark-bg relative overflow-x-hidden">
      
      {/* Pure Immersive Apology Page */}
      <div className="flex-1 w-full">
        <GirlfriendCard state={activeState} />
      </div>

      {/* CREATOR WORKSHOP FLOATING TRIGGER BUTTON (Hidden for your girl's shared link) */}
      {!isShared && (
        <>
          {/* Real-time Customizer Drawer Sidebar */}
          <AnimatePresence>
            {isCustomizeOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCustomizeOpen(false)}
                  className="fixed inset-0 bg-black z-45"
                />

                {/* Glassmorphic sliding drawer */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 180 }}
                  className="fixed top-0 right-0 h-full w-full sm:w-[460px] md:w-[560px] bg-[#0c0c0e]/95 backdrop-blur-2xl border-l border-rose-500/15 p-6 shadow-2xl overflow-y-auto z-50 text-[#e2e2e2]"
                >
                  <div className="flex items-center justify-between border-b border-rose-500/10 pb-4 mb-6">
                    <div className="flex items-center gap-2 text-rose-400">
                      <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
                      <h2 className="text-sm font-bold uppercase tracking-widest font-sans">
                        Customize Sorry Content
                      </h2>
                    </div>
                    <button
                      onClick={() => setIsCustomizeOpen(false)}
                      className="p-1.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed font-light mb-6">
                    Modify names, reason, milestone stories, polaroid pictures captions and countdown dates in real-time. The live page behind this panel will update immediately as you type! Once ready, click "Copy Link" to share.
                  </p>

                  <BoyfriendDashboard
                    state={activeState}
                    onChange={setActiveState}
                    onPreview={() => setIsCustomizeOpen(false)}
                    onGenerateShareLink={handleGenerateShareLink}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* FOOTER FOOTPRINT (Only shown if shared link) */}
      {isShared && (
        <div className="w-full text-center py-6 bg-[#0c0c0e] border-t border-rose-950/40 z-20 flex flex-col items-center justify-center gap-2">
          <p className="text-[10px] text-rose-300/40 font-mono tracking-widest uppercase">
            Designed with infinite care and devotion ❤️
          </p>
        </div>
      )}

    </div>
  );
}
