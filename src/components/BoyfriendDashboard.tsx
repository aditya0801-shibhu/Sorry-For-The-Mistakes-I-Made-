import React, { useState } from "react";
import { 
  Heart, 
  Sparkles, 
  Copy, 
  Eye, 
  Wand2, 
  Gift, 
  FileText, 
  Check, 
  Loader2, 
  ArrowRight,
  Info,
  ChevronRight,
  Settings,
  Calendar,
  Camera,
  MessageCircle,
  Award
} from "lucide-react";
import { ApologyState, GIFT_DETAILS } from "../types";

interface BoyfriendDashboardProps {
  state: ApologyState;
  onChange: (newState: ApologyState) => void;
  onPreview: () => void;
  onGenerateShareLink: () => string;
}

export default function BoyfriendDashboard({ 
  state, 
  onChange, 
  onPreview, 
  onGenerateShareLink 
}: BoyfriendDashboardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "memories" | "gift" | "extra">("general");

  // Call backend server for Gemini AI letter generation
  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-apology", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          girlfriendName: state.girlfriendName,
          boyfriendName: state.boyfriendName,
          reason: state.reason,
          style: state.style,
          customDetails: state.customDetails,
        }),
      });

      const data = await response.json();
      if (data && data.text) {
        onChange({
          ...state,
          generatedText: data.text
        });
      }
    } catch (error) {
      console.error("Failed to generate apology:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle individual memory edits
  const handleMemoryChange = (id: number, field: "title" | "content", value: string) => {
    const updatedMemories = state.memories.map((m) => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    });
    onChange({
      ...state,
      memories: updatedMemories
    });
  };

  const handleCopyLink = () => {
    const link = onGenerateShareLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 md:p-8 bg-[#121214] rounded-2xl shadow-2xl border border-gold-500/15 z-10 text-[#e2e2e2]">
      
      {/* Dashboard Top Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gold-500/10 pb-6 mb-8 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-sans font-light tracking-widest text-white uppercase flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" /> Card Workshop
          </h1>
          <p className="text-xs text-[#b4b4b4] max-w-lg font-light leading-relaxed">
            Customize an interactive apology card experience. Generate custom AI poems/letters, pack claimable peace offerings, craft flip-slide memory slots, and copy the magic link to send.
          </p>
        </div>

        {/* Action Button: Live Preview Card */}
        <button
          onClick={onPreview}
          className="px-5 py-2.5 rounded-full border border-gold-500/30 text-gold-300 font-sans uppercase tracking-widest text-[10px] font-semibold hover:bg-[#18181c] transition flex items-center gap-2 cursor-pointer"
          id="preview-card-trigger"
        >
          <Eye className="w-4 h-4 text-gold-400" /> Preview Card
        </button>
      </div>

      {/* QUICK STEP SHARE LINK BANNER */}
      <div className="bg-gradient-to-r from-rose-950/20 to-rose-900/10 rounded-2xl p-6 border border-rose-500/10 flex flex-col md:flex-row items-center justify-between gap-4 mb-8 shadow-inner">
        <div className="space-y-1 text-center md:text-left">
          <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-sans font-bold text-[9px] tracking-widest uppercase">
            Shareable Card Link
          </span>
          <h3 className="font-sans font-medium text-white text-sm tracking-wide mt-1">
            Ready to send to her?
          </h3>
          <p className="text-xs text-[#b4b4b4] max-w-md font-light leading-relaxed">
            This card is fully customized instantly inside the link! No registration or databases required. Simply copy the link below and text it to her.
          </p>
        </div>

        <button
          onClick={handleCopyLink}
          className={`px-6 py-3 rounded-full font-sans uppercase tracking-widest text-xs font-semibold shadow-md flex items-center gap-2 transition duration-300 w-full md:w-auto justify-center cursor-pointer ${
            copied 
              ? "bg-emerald-600 text-white shadow-emerald-950/20" 
              : "bg-gradient-to-r from-rose-600 to-pink-500 text-white hover:opacity-90"
          }`}
          id="dashboard-copy-link-btn"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" /> Copied magic link! 💖
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy Apology Link
            </>
          )}
        </button>
      </div>

      {/* FOUR STEP CUSTOMIZER MENU */}
      <div className="flex flex-wrap border-b border-gold-500/10 mb-6 font-sans text-[10px] md:text-xs uppercase tracking-widest text-[#666]">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 min-w-[120px] py-3 text-center border-b-2 font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "general" 
              ? "border-rose-500 text-rose-400" 
              : "border-transparent hover:text-white"
          }`}
          id="tab-general"
        >
          <FileText className="w-4 h-4" /> 1. Letter & AI
        </button>
        <button
          onClick={() => setActiveTab("memories")}
          className={`flex-1 min-w-[120px] py-3 text-center border-b-2 font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "memories" 
              ? "border-rose-500 text-rose-400" 
              : "border-transparent hover:text-white"
          }`}
          id="tab-memories"
        >
          <Sparkles className="w-4 h-4" /> 2. Memories
        </button>
        <button
          onClick={() => setActiveTab("gift")}
          className={`flex-1 min-w-[120px] py-3 text-center border-b-2 font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "gift" 
              ? "border-rose-500 text-rose-400" 
              : "border-transparent hover:text-white"
          }`}
          id="tab-gift"
        >
          <Gift className="w-4 h-4" /> 3. Kiss Tickets
        </button>
        <button
          onClick={() => setActiveTab("extra")}
          className={`flex-1 min-w-[120px] py-3 text-center border-b-2 font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "extra" 
              ? "border-rose-500 text-rose-400" 
              : "border-transparent hover:text-white"
          }`}
          id="tab-extra"
        >
          <Settings className="w-4 h-4" /> 4. Milestone & Dates
        </button>
      </div>

      {/* TAB CONTENT - GENERAL SETTINGS & AI GENERATOR */}
      {activeTab === "general" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Names configuration */}
            <div className="space-y-4">
              <h3 className="font-sans font-medium text-white text-sm border-b border-gold-500/10 pb-1.5 uppercase tracking-wider">
                Names & Roles
              </h3>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gold-400 uppercase tracking-widest block">
                  Her Name (Girlfriend)
                </label>
                <input
                  type="text"
                  value={state.girlfriendName}
                  onChange={(e) => onChange({ ...state, girlfriendName: e.target.value })}
                  placeholder="e.g. Sweety"
                  className="w-full px-4 py-2.5 rounded-xl border border-gold-500/15 bg-dark-bg text-white text-sm focus:border-gold-500/30 focus:outline-none transition"
                  id="input-gf-name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gold-400 uppercase tracking-widest block">
                  Your Name (Boyfriend)
                </label>
                <input
                  type="text"
                  value={state.boyfriendName}
                  onChange={(e) => onChange({ ...state, boyfriendName: e.target.value })}
                  placeholder="e.g. Aditya"
                  className="w-full px-4 py-2.5 rounded-xl border border-gold-500/15 bg-dark-bg text-white text-sm focus:border-gold-500/30 focus:outline-none transition"
                  id="input-bf-name"
                />
              </div>
            </div>

            {/* Apology context */}
            <div className="space-y-4">
              <h3 className="font-sans font-medium text-white text-sm border-b border-gold-500/10 pb-1.5 uppercase tracking-wider">
                The Misunderstanding
              </h3>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gold-400 uppercase tracking-widest block">
                  What happened? (Reason)
                </label>
                <input
                  type="text"
                  value={state.reason}
                  onChange={(e) => onChange({ ...state, reason: e.target.value })}
                  placeholder="e.g. our silly argument"
                  className="w-full px-4 py-2.5 rounded-xl border border-gold-500/15 bg-dark-bg text-white text-sm focus:border-gold-500/30 focus:outline-none transition"
                  id="input-reason"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gold-400 uppercase tracking-widest block">
                  Apology Letter Style
                </label>
                <select
                  value={state.style}
                  onChange={(e: any) => onChange({ ...state, style: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gold-500/15 bg-dark-bg text-white text-sm focus:border-gold-500/30 focus:outline-none transition"
                  id="select-style"
                >
                  <option value="Sincere">Sincere & Heartfelt Letter 💌</option>
                  <option value="Poetic">Romantic Love Poem 🌹</option>
                  <option value="Playful">Playful & Cute Pleading 🧸</option>
                  <option value="Cute">Cute & Sweet Emoticons 💖</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Generator prompt booster */}
          <div className="space-y-4 pt-4 border-t border-gold-500/10">
            <h3 className="font-sans font-medium text-white text-sm flex items-center gap-1.5 uppercase tracking-wider">
              <Wand2 className="w-4 h-4 text-rose-400" /> AI Apology Draftsman (Gemini-Powered)
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest block">
                Extra Custom Details (Optional context for Gemini to make it extremely personal)
              </label>
              <textarea
                value={state.customDetails}
                onChange={(e) => onChange({ ...state, customDetails: e.target.value })}
                placeholder="e.g. We fought because I forgot to text back while playing video games, and she felt ignored. Make sure to promise I will buy her ice cream tonight."
                className="w-full h-24 px-4 py-3 rounded-xl border border-gold-500/15 bg-dark-bg text-white text-sm focus:border-gold-500/30 focus:outline-none transition resize-none"
                id="textarea-custom-details"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 text-white font-sans uppercase tracking-widest text-xs font-semibold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
                id="ai-generate-btn"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Drafting custom letter with Gemini...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" /> Draft Letter with AI ✨
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Current written letter display */}
          <div className="space-y-2 pt-4 border-t border-gold-500/10">
            <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest block">
              Active Apology Letter Content (You can also type & edit this manually)
            </label>
            <textarea
              value={state.generatedText}
              onChange={(e) => onChange({ ...state, generatedText: e.target.value })}
              placeholder="Click 'Draft Letter' above, or type your own custom handwritten letter here..."
              className="w-full h-64 p-6 rounded-2xl border border-gold-500/15 bg-dark-bg text-[#e2e2e2] font-serif leading-relaxed italic text-base focus:border-gold-500/30 focus:outline-none transition"
              id="textarea-letter-content"
            />
          </div>

          {/* Prompt Next Arrow */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setActiveTab("memories")}
              className="px-5 py-2.5 rounded-full border border-gold-500/20 text-[#b4b4b4] font-sans uppercase tracking-widest text-[10px] font-semibold hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              Step 2: Memories <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT - MEMORY MANAGER */}
      {activeTab === "memories" && (
        <div className="space-y-6">
          <div className="bg-gold-950/20 rounded-xl p-4 border border-gold-500/10 flex gap-3 text-xs text-gold-300">
            <Info className="w-4 h-4 shrink-0 text-gold-400 mt-0.5" />
            <p className="font-light leading-relaxed">
              These represent the 3 interactive story paragraphs on her main scroll. Customize their titles and edit the happy narrative text hidden on the flip side of each card!
            </p>
          </div>

          <div className="space-y-8">
            {state.memories.map((memory, index) => (
              <div 
                key={memory.id} 
                className="p-6 rounded-2xl border border-gold-500/10 bg-[#18181c]/50 space-y-4"
              >
                <span className="font-sans font-bold text-[10px] tracking-widest uppercase text-rose-400 bg-rose-950/20 border border-rose-500/15 px-2.5 py-1 rounded">
                  Paragraph Slot #{index + 1}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest block">
                      Topic Title
                    </label>
                    <input
                      type="text"
                      value={memory.title}
                      onChange={(e) => handleMemoryChange(memory.id, "title", e.target.value)}
                      placeholder="e.g. Our Happy Spot"
                      className="w-full px-3 py-2 rounded-lg border border-gold-500/15 bg-dark-bg text-white text-sm focus:border-gold-500/30 focus:outline-none transition"
                      id={`memory-title-${memory.id}`}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest block">
                      Story Content
                    </label>
                    <textarea
                      value={memory.content}
                      onChange={(e) => handleMemoryChange(memory.id, "content", e.target.value)}
                      placeholder="e.g. Remember when we got completely drenched in the unexpected rain storm?"
                      className="w-full h-20 px-3 py-2 rounded-lg border border-gold-500/15 bg-dark-bg text-white text-sm focus:border-gold-500/30 focus:outline-none transition resize-none"
                      id={`memory-content-${memory.id}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab navigation */}
          <div className="flex justify-between pt-6 border-t border-gold-500/10">
            <button
              onClick={() => setActiveTab("general")}
              className="px-5 py-2.5 rounded-full text-[#888] font-sans uppercase tracking-widest text-[10px] font-semibold hover:text-[#e2e2e2] transition cursor-pointer"
            >
              Back to General
            </button>
            <button
              onClick={() => setActiveTab("gift")}
              className="px-5 py-2.5 rounded-full border border-gold-500/20 text-[#b4b4b4] font-sans uppercase tracking-widest text-[10px] font-semibold hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              Step 3: Pack Kiss Ticket <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT - GIFT SELECTOR */}
      {activeTab === "gift" && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-sans font-medium text-white text-base uppercase tracking-wider">
              Select Her Virtual Kiss Ticket
            </h3>
            <p className="text-xs text-[#b4b4b4] max-w-md mx-auto font-light">
              This kiss ticket is packed directly into the unwrappable gift box inside her apology card, rendering a gorgeous claimable coupon ticket!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            {(Object.keys(GIFT_DETAILS) as Array<keyof typeof GIFT_DETAILS>).map((key) => {
              const gift = GIFT_DETAILS[key];
              const isSelected = state.giftType === key;

              return (
                <div
                  key={key}
                  onClick={() => onChange({ ...state, giftType: key })}
                  className={`p-5 rounded-2xl border cursor-pointer text-center flex flex-col justify-between h-56 transition-all duration-300 ${
                    isSelected 
                      ? "border-rose-500 bg-rose-950/20 shadow-md shadow-pink-950 scale-105" 
                      : "border-gold-500/10 hover:border-gold-500/25 bg-dark-bg"
                  }`}
                >
                  <div>
                    <span className="text-4xl block mb-2 filter drop-shadow-sm">{gift.emoji}</span>
                    <h4 className="font-sans font-bold text-white text-sm">
                      {gift.title}
                    </h4>
                  </div>
                  <p className="text-[10px] text-[#b4b4b4] leading-relaxed italic font-light">
                    {gift.description}
                  </p>
                  <div className="pt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-sans uppercase tracking-widest font-bold transition ${
                      isSelected ? "bg-rose-500 text-white" : "bg-[#18181c] text-[#888]"
                    }`}>
                      {isSelected ? "Packed 🎁" : "Select Offer"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tab navigation & preview */}
          <div className="flex justify-between pt-8 border-t border-gold-500/10">
            <button
              onClick={() => setActiveTab("memories")}
              className="px-5 py-2.5 rounded-full text-[#888] font-sans uppercase tracking-widest text-[10px] font-semibold hover:text-[#e2e2e2] transition cursor-pointer"
            >
              Back to Memories
            </button>
            
            <button
              onClick={() => setActiveTab("extra")}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-sans font-bold uppercase tracking-widest text-xs shadow-lg flex items-center gap-2 cursor-pointer"
            >
              Step 4: Milestones & Dates <ChevronRight className="w-4 h-4 animate-pulse" />
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT - EXTRA MILESTONES & DATES */}
      {activeTab === "extra" && (
        <div className="space-y-8">
          
          <div className="bg-rose-950/20 rounded-xl p-4 border border-rose-500/10 flex gap-3 text-xs text-rose-300">
            <Calendar className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <p className="font-light leading-relaxed">
              Fine-tune her romantic experience! Set your specific anniversary date to drive the live ticker, write custom captions for the 4 interactive Polaroids, customize the typing phrases, and outline your milestones.
            </p>
          </div>

          {/* 1. ANNIVERSARY DATE PICKER */}
          <div className="p-6 rounded-2xl border border-gold-500/10 bg-[#18181c]/50 space-y-4">
            <h3 className="font-sans font-medium text-white text-sm border-b border-rose-500/10 pb-1.5 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-400" /> 1. Special Anniversary Date
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest block">
                  Select Your Date (Together Since)
                </label>
                <input
                  type="datetime-local"
                  value={state.anniversaryDate ? (state.anniversaryDate.includes("T") ? state.anniversaryDate.substring(0, 16) : `${state.anniversaryDate}T00:00`) : "2024-09-09T23:48"}
                  onChange={(e) => onChange({ ...state, anniversaryDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gold-500/15 bg-dark-bg text-white text-sm focus:border-rose-500/30 focus:outline-none transition"
                  id="anniversary-date-input"
                />
              </div>
              <p className="text-xs text-[#b4b4b4] leading-relaxed font-light flex items-center">
                This date is used to calculate the exact, live ticking timer on her card showing how many days, hours, minutes, and seconds you've shared!
              </p>
            </div>
          </div>

          {/* 2. POLAROID CAPTIONS */}
          <div className="p-6 rounded-2xl border border-gold-500/10 bg-[#18181c]/50 space-y-4">
            <h3 className="font-sans font-medium text-white text-sm border-b border-rose-500/10 pb-1.5 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-rose-400" /> 2. Polaroid Polaroid Captions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5 p-3 rounded-xl bg-black/25 border border-rose-500/5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">
                    First Selfie Caption
                  </label>
                  <input
                    type="text"
                    value={state.galleryFirstSelfieCaption}
                    onChange={(e) => onChange({ ...state, galleryFirstSelfieCaption: e.target.value })}
                    placeholder="Still my absolute favourite smile."
                    className="w-full px-3 py-2 rounded-lg border border-gold-500/15 bg-dark-bg text-white text-xs focus:border-rose-500/30 focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-rose-300/60 uppercase tracking-widest block">
                    First Selfie Image URL
                  </label>
                  <input
                    type="text"
                    value={state.galleryFirstSelfieUrl || ""}
                    onChange={(e) => onChange({ ...state, galleryFirstSelfieUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 rounded-lg border border-gold-500/15 bg-dark-bg/60 text-white/80 text-[11px] focus:border-rose-500/30 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2.5 p-3 rounded-xl bg-black/25 border border-rose-500/5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">
                    Favourite Picture Caption
                  </label>
                  <input
                    type="text"
                    value={state.galleryFavPicCaption}
                    onChange={(e) => onChange({ ...state, galleryFavPicCaption: e.target.value })}
                    placeholder="The prettiest soul and face."
                    className="w-full px-3 py-2 rounded-lg border border-gold-500/15 bg-dark-bg text-white text-xs focus:border-rose-500/30 focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-rose-300/60 uppercase tracking-widest block">
                    Favourite Pic Image URL
                  </label>
                  <input
                    type="text"
                    value={state.galleryFavPicUrl || ""}
                    onChange={(e) => onChange({ ...state, galleryFavPicUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 rounded-lg border border-gold-500/15 bg-dark-bg/60 text-white/80 text-[11px] focus:border-rose-500/30 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2.5 p-3 rounded-xl bg-black/25 border border-rose-500/5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">
                    Funny Photo Caption
                  </label>
                  <input
                    type="text"
                    value={state.galleryFunnyPicCaption}
                    onChange={(e) => onChange({ ...state, galleryFunnyPicCaption: e.target.value })}
                    placeholder="I love your goofy side more than anything."
                    className="w-full px-3 py-2 rounded-lg border border-gold-500/15 bg-dark-bg text-white text-xs focus:border-rose-500/30 focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-rose-300/60 uppercase tracking-widest block">
                    Funny Photo Image URL
                  </label>
                  <input
                    type="text"
                    value={state.galleryFunnyPicUrl || ""}
                    onChange={(e) => onChange({ ...state, galleryFunnyPicUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 rounded-lg border border-gold-500/15 bg-dark-bg/60 text-white/80 text-[11px] focus:border-rose-500/30 focus:outline-none transition font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. DYNAMIC CYCLING WHISPERS */}
          <div className="p-6 rounded-2xl border border-gold-500/10 bg-[#18181c]/50 space-y-4">
            <h3 className="font-sans font-medium text-white text-sm border-b border-rose-500/10 pb-1.5 uppercase tracking-wider flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-rose-400" /> 3. Typewriter Whispers ("Things I Want To Say")
            </h3>
            
            <p className="text-[11px] text-[#b4b4b4] leading-relaxed font-light">
              List the sweet confessions that cycle automatically with typing animations. Type each phrase on a new line!
            </p>

            <textarea
              value={state.thingsIWantToSay.join("\n")}
              onChange={(e) => onChange({ ...state, thingsIWantToSay: e.target.value.split("\n").filter(Boolean) })}
              placeholder="Type each sentence on a new line..."
              className="w-full h-32 px-4 py-3 rounded-xl border border-gold-500/15 bg-dark-bg text-white text-xs font-mono focus:border-rose-500/30 focus:outline-none transition resize-none"
            />
          </div>

          {/* 4. REALISTIC PROMISES */}
          <div className="p-6 rounded-2xl border border-gold-500/10 bg-[#18181c]/50 space-y-4">
            <h3 className="font-sans font-medium text-white text-sm border-b border-rose-500/10 pb-1.5 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-400" /> 4. Sincere Promises
            </h3>
            
            <p className="text-[11px] text-[#b4b4b4] leading-relaxed font-light">
              Edit the 4 custom promises that show under the "If you give me another chance..." checklist. Type each on a new line!
            </p>

            <textarea
              value={state.promises.join("\n")}
              onChange={(e) => onChange({ ...state, promises: e.target.value.split("\n").filter(Boolean) })}
              placeholder="Type each promise on a new line..."
              className="w-full h-32 px-4 py-3 rounded-xl border border-gold-500/15 bg-dark-bg text-white text-xs font-mono focus:border-rose-500/30 focus:outline-none transition resize-none"
            />
          </div>

          {/* 5. TIMELINE MILESTONES */}
          <div className="p-6 rounded-2xl border border-gold-500/10 bg-[#18181c]/50 space-y-4">
            <h3 className="font-sans font-medium text-white text-sm border-b border-rose-500/10 pb-1.5 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-400" /> 5. Love Milestone Timeline Messages
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">We Met (Detail text)</label>
                <input
                  type="text"
                  value={state.timelineMeet}
                  onChange={(e) => onChange({ ...state, timelineMeet: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gold-500/15 bg-dark-bg text-white text-xs focus:border-rose-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">First Conversation (Detail text)</label>
                <input
                  type="text"
                  value={state.timelineConvo}
                  onChange={(e) => onChange({ ...state, timelineConvo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gold-500/15 bg-dark-bg text-white text-xs focus:border-rose-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">Our First Icecream Date</label>
                <input
                  type="text"
                  value={state.timelineLove}
                  onChange={(e) => onChange({ ...state, timelineLove: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gold-500/15 bg-dark-bg text-white text-xs focus:border-rose-500/30"
                />
              </div>


            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-gold-500/10">
            <button
              onClick={() => setActiveTab("gift")}
              className="px-5 py-2.5 rounded-full text-[#888] font-sans uppercase tracking-widest text-[10px] font-semibold hover:text-[#e2e2e2] transition cursor-pointer"
            >
              Back to Gift Selector
            </button>
            <button
              onClick={onPreview}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-sans font-bold uppercase tracking-widest text-xs shadow-lg flex items-center gap-2 cursor-pointer"
            >
              Go Preview Card <ArrowRight className="w-4 h-4 animate-pulse" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
