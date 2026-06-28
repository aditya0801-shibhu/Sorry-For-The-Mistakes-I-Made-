import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { 
  Heart, 
  Sparkles, 
  Gift, 
  Ticket, 
  Smile, 
  Frown, 
  RotateCcw, 
  Check, 
  Camera, 
  Calendar,
  Compass,
  Volume2,
  VolumeX,
  Sparkle,
  Hourglass,
  CheckCircle2,
  Send,
  HelpCircle
} from "lucide-react";
import { ApologyState, GIFT_DETAILS } from "../types";

// Dynamic floating particle item definition
interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  color: string;
  type: "heart" | "petal" | "sparkle";
}

const formatAnniversaryDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    
    const day = d.getDate();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    
    // If we have time information (or if it contains a T or a colon)
    if (dateStr.includes('T') || dateStr.includes(':') || (d.getHours() !== 0 || d.getMinutes() !== 0)) {
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'P.M.' : 'A.M.';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minStr = minutes < 10 ? '0' + minutes : minutes;
      return `${day} ${month} ${year} ${hours}:${minStr} ${ampm}`;
    }
    
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
};

interface GirlfriendCardProps {
  state: ApologyState;
  onBackToDashboard?: () => void;
  isPreview?: boolean;
}

export default function GirlfriendCard({ state, onBackToDashboard, isPreview = false }: GirlfriendCardProps) {
  const [isWelcome, setIsWelcome] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [forgiven, setForgiven] = useState(false);
  const [noClicks, setNoClicks] = useState(0);
  const [yesScale, setYesScale] = useState(1);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [currentNoMessage, setCurrentNoMessage] = useState("No");
  const [isGiftUnwrapped, setIsGiftUnwrapped] = useState(false);
  const [couponRedeemed, setCouponRedeemed] = useState(false);
  const [loveMeterValue, setLoveMeterValue] = useState(50);
  const [flippedPolaroid, setFlippedPolaroid] = useState<number | null>(null);
  
  // Custom states for rich features
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeSayIndex, setActiveSayIndex] = useState(0);
  const [showSurpriseModal, setShowSurpriseModal] = useState(false);
  
  // Audio & Cursor Trail states
  const [isMuted, setIsMuted] = useState(true);
  const [trail, setTrail] = useState<{ id: number; x: number; y: number }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Background particles & rain
  const [rainDrops, setRainDrops] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

  // Generate stable particle configurations once using useMemo to prevent unnecessary React renders
  const backgroundParticles = React.useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * -20, // Negative delay so some start half-way through the animation
      duration: Math.random() * 8 + 12, // 12s to 20s
      size: Math.random() * 10 + 6,
      opacity: Math.random() * 0.2 + 0.1,
      color: ["#f43f5e", "#fda4af", "#ec4899", "#fb7185", "#a88d60", "#ffffff"][Math.floor(Math.random() * 6)],
      type: (Math.random() > 0.65 ? "petal" : Math.random() > 0.3 ? "sparkle" : "heart") as "petal" | "sparkle" | "heart"
    }));
  }, []);

  const noButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch((err) => console.log("Audio play failed:", err));
        audioRef.current.muted = false;
        setIsMuted(false);
      } else {
        audioRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const startMusic = () => {
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.play()
        .then(() => setIsMuted(false))
        .catch((err) => console.log("Autoplay prevented:", err));
    }
  };

  // Cursor following hearts trail listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle trail creation to keep it elegant and performance-friendly
      if (Math.random() > 0.85) {
        const newHeart = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
        };
        setTrail((prev) => [...prev.slice(-12), newHeart]); // Keep max 12 trailing hearts
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Phrases for the typewriter / cycler "Things I Want to Say"
  const defaultSayPhrases = state.thingsIWantToSay && state.thingsIWantToSay.length > 0 
    ? state.thingsIWantToSay 
    : [
        "I'm sorry.",
        "I miss talking to you.",
        "I never wanted to hurt you.",
        "Thank you for staying with me."
      ];

  // Funny pleading responses for the "No" button
  const pleadMessages = [
    "No",
    "Are you sure? 🥺",
    "Our virtual puppy is crying... 🐶🐾",
    "What if I promise 100 cuddles? 🧸",
    "I'll buy you chocolate! Still no? 🍫",
    "I will do all your chores for a week! 🧹",
    "Okay, what about infinite kisses? 😘",
    "No is temporarily out of order! 😉",
    "Error 404: Option disabled! 🚫",
    "Please say yes... I'm looking at you with puppy eyes!",
    "I promise to never eat the last slice again! 🍕",
    "Just click the golden button! It's so pretty! ✨"
  ];

  // Build rain drops for the Welcome page
  useEffect(() => {
    const drops = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: Math.random() * 1.5 + 1.5
    }));
    setRainDrops(drops);
  }, []);

  // Anniversary Live Countdown ticking
  useEffect(() => {
    const updateCountdown = () => {
      const annDate = new Date(state.anniversaryDate || "2024-09-09T23:48:00");
      const now = new Date();
      // Calculate absolute difference
      const diffMs = Math.abs(now.getTime() - annDate.getTime());
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [state.anniversaryDate]);

  // "Things I want to say" phrase cycler
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSayIndex((prev) => (prev + 1) % defaultSayPhrases.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [defaultSayPhrases]);

  // Burst confetti function using canvas-confetti
  const triggerConfettiBurst = () => {
    confetti({
      particleCount: 125,
      spread: 80,
      origin: { y: 0.65 },
      colors: ["#f43f5e", "#ec4899", "#fda4af", "#a88d60", "#facc15", "#60a5fa", "#34d399"]
    });
  };

  // Safe backup if tapped on mobile directly
  const handleNoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleNoHover();
  };

  const handleNoHover = () => {
    if (forgiven) return;
    
    // Choose a random message
    const nextMsgIdx = Math.min(noClicks + 1, pleadMessages.length - 1);
    setCurrentNoMessage(pleadMessages[nextMsgIdx]);
    setNoClicks((prev) => prev + 1);
    
    // Grow the YES button scale with each dodge/click
    setYesScale((prev) => Math.min(prev + 0.15, 3.0));

    // Teleport NO button to random coordinates inside parent container boundaries
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 60;
      const randomX = Math.random() * (rect.width - 150 - padding * 2) + padding;
      const randomY = Math.random() * (rect.height - 80 - padding * 2) + padding;
      
      setNoPosition({
        x: randomX - rect.width / 2 + 75,
        y: randomY - rect.height / 2 + 40
      });
    }
  };

  const handleYesClick = () => {
    setForgiven(true);
    triggerConfettiBurst();
    setLoveMeterValue(100);
  };

  const handleUnwrap = () => {
    setIsGiftUnwrapped(true);
    triggerConfettiBurst();
  };

  const giftDetails = GIFT_DETAILS[state.giftType] || GIFT_DETAILS.hugs;

  // Render Rain overlay for welcome/rain screen
  const renderRainOverlay = () => {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {rainDrops.map((drop) => (
          <div
            key={drop.id}
            className="absolute bg-gradient-to-b from-rose-400/20 to-pink-500/40 w-[1.5px] h-[30px] rounded-full animate-rain"
            style={{
              left: `${drop.left}%`,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
              top: `-40px`
            }}
          />
        ))}
      </div>
    );
  };

  // Unified return that wraps both Welcome Screen and Main Scroll so Audio & Cursor trailing hearts operate globally
  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden bg-gradient-to-b from-[#060004] via-[#0f020a] to-[#1e0310] text-[#e2e2e2] scroll-smooth"
    >
      {/* Soft Background Audio Element */}
      <audio
        ref={audioRef}
        src="https://assets.codepen.io/4358584/Anitek_-_01_-_Kisses.mp3"
        loop
      />



      {/* Sunshine/Glow Ending Background Layer */}
      <div 
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-[3000ms] ${
          forgiven ? "opacity-35" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-pink-500/10 to-amber-300/30 blur-3xl" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-amber-300/20 blur-[150px] animate-pulse" style={{ animationDuration: "10s" }} />
      </div>

      {/* Cursor Following Hearts Trail */}
      <AnimatePresence>
        {trail.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0.8, scale: 0.5, y: 0 }}
            animate={{ opacity: 0, scale: 1.4, y: -50, rotate: Math.random() * 40 - 20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="fixed pointer-events-none z-50 text-rose-500/85 drop-shadow-[0_2px_8px_rgba(244,63,94,0.5)]"
            style={{ left: t.x - 8, top: t.y - 8 }}
          >
            <Heart className="w-4.5 h-4.5 fill-current" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Screen Router */}
      {isWelcome ? (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-black via-[#0d040a] to-[#250314] overflow-hidden text-[#e2e2e2]">
          
          {/* Soft Pink Ambient Glow & Rain */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-rose-900/10 blur-[120px]" />
          {renderRainOverlay()}

          {/* Gentle heart floating particles */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {backgroundParticles.slice(0, 12).map((p) => (
              <div
                key={`welcome-${p.id}`}
                className="absolute animate-float-up"
                style={{
                  left: `${p.left}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  transform: `scale(${p.size / 20})`,
                  opacity: p.opacity * 0.7,
                  color: p.color,
                  top: `100%`,
                  ["--target-opacity" as any]: p.opacity * 0.7,
                  ["--float-duration" as any]: `${p.duration}s`
                }}
              >
                <Heart className="fill-current w-5 h-5 text-rose-500/40" />
              </div>
            ))}
          </div>

          {/* Welcome Glass Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-lg w-full text-center p-8 md:p-12 bg-[#121214]/60 backdrop-blur-xl border border-rose-500/15 rounded-3xl shadow-2xl space-y-8 z-20"
          >
            {/* Heart pulse */}
            <div className="inline-flex relative">
              <div className="absolute -inset-4 bg-rose-500/20 rounded-full blur animate-ping" />
              <div className="p-4 bg-gradient-to-tr from-rose-600 to-pink-500 text-white rounded-full shadow-lg relative">
                <Heart className="w-8 h-8 fill-current text-white animate-heartbeat" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-sans font-light tracking-wide text-white leading-relaxed">
                Before you close this page... <br/>
                <span className="font-semibold text-rose-400">please give me 2 minutes. ❤️</span>
              </h1>
              <p className="text-xs text-rose-200/60 leading-relaxed font-light max-w-md mx-auto">
                I know you are upset with me, and you have every right to be. I made this website just for you, to convey what is hard to put in normal texts.
              </p>
            </div>

            <div className="w-16 h-0.5 bg-rose-500/30 mx-auto rounded-full" />

            <button
              onClick={() => {
                setIsWelcome(false);
                triggerConfettiBurst();
                startMusic();
              }}
              className="w-full py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:opacity-95 text-white font-sans text-xs tracking-[0.25em] font-bold uppercase shadow-lg shadow-pink-900/30 transition transform hover:scale-102 active:scale-98 cursor-pointer"
              id="open-heart-welcome-btn"
            >
              Open My Heart 🌹
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
          
          {/* Floating Sparkles & Hearts in main card */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {backgroundParticles.map((p) => (
              <div
                key={p.id}
                className="absolute animate-float-up"
                style={{
                  left: `${p.left}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  transform: `scale(${p.size / 20})`,
                  opacity: p.opacity,
                  color: p.color,
                  top: `100%`,
                  ["--target-opacity" as any]: p.opacity,
                  ["--float-duration" as any]: `${p.duration}s`
                }}
              >
                {p.type === "heart" && <Heart className="fill-current w-5 h-5 text-rose-500/40" />}
                {p.type === "petal" && <span className="text-pink-400/35 text-xs">🌸</span>}
                {p.type === "sparkle" && <Sparkles className="w-4 h-4 text-amber-300/30" />}
              </div>
            ))}
          </div>



      {/* Live Love Meter Value Status on Desktop Top Right */}
      {isOpen && (
        <div className="fixed top-4 right-4 z-40 bg-black/80 backdrop-blur-md border border-rose-500/20 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Heart className={`w-4 h-4 ${loveMeterValue === 100 ? "text-rose-500 fill-rose-500 animate-bounce" : "text-pink-400 animate-pulse"}`} />
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-rose-300">
            Love Level: {loveMeterValue}%
          </span>
        </div>
      )}

      {/* ENVELOPE ENTRANCE BEFORE MAIN PAGE */}
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.82, opacity: 0, y: -60 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-full max-w-lg z-10"
            id="envelope-container"
          >
            {/* Elegant dark pink & black glassmorphism envelope */}
            <div className="bg-[#121214]/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-500/20 overflow-hidden relative p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[420px] cursor-pointer group hover:border-rose-500/40 hover:shadow-rose-500/5 transition-all duration-300">
              
              {/* Decorative Diagonal Envelope Flap border */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 shadow-md" />
              
              <div className="relative mt-4 mb-6">
                {/* Pulsating Seal Heart */}
                <div className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping opacity-75" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-xl relative transform group-hover:scale-110 transition duration-300">
                  <Heart className="w-10 h-10 fill-current text-white" />
                </div>
              </div>

              <h1 className="text-xl font-sans font-light tracking-[0.25em] text-white mb-2 uppercase">
                A Letter For You
              </h1>
              <p className="text-rose-400 font-serif italic text-2xl mb-6">
                Dearest {state.girlfriendName} ❤️
              </p>

              <div className="w-24 h-[1px] bg-rose-500/20 mb-6" />

              <p className="text-rose-100/60 text-xs font-light max-w-xs mb-8 leading-relaxed">
                I packaged all our memories, special dates, future promises, and a heart-crafted message into this interactive page. 
              </p>

              <button
                onClick={() => {
                  setIsOpen(true);
                  triggerConfettiBurst();
                }}
                className="px-10 py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-sans uppercase tracking-[0.15em] text-xs font-bold shadow-lg shadow-pink-950/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                id="open-letter-btn"
              >
                Open with Love 💌
              </button>
            </div>
          </motion.div>
        ) : (
          /* MAIN GREETING LAYOUT (SCROLLABLE TIMELINE & DISCLOSURE) */
          <motion.div
            key="card-content"
            initial={{ scale: 0.96, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 14 }}
            className="w-full max-w-3xl z-10 space-y-12 my-8"
            id="apology-card-main"
          >
            
            {/* SECTION 2: HERO HEADER WITH HEARTBEAT */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-rose-500/15 bg-black/40 backdrop-blur-md p-8 text-center space-y-6">
              {/* Couple Atmospheric Graphic Frame */}
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <img 
                  src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200" 
                  alt="Cozy atmosphere" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f020a] via-black/80 to-transparent" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="inline-block p-4 bg-rose-950/40 border border-rose-500/25 rounded-full shadow-lg">
                  <Heart className="w-10 h-10 text-rose-500 fill-rose-500 animate-heartbeat" />
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-light text-white tracking-tight leading-none">
                  I'm Sorry ❤️
                </h1>
                <p className="text-rose-100/80 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed italic">
                  "I know I made mistakes, and I don't expect everything to become okay instantly. I just wanted you to know how much you mean to me."
                </p>
              </div>
            </div>

            {/* SECTION: ANNIVERSARY TIMER (⏳ COUNTDOWN SECTION) */}
            <div className="bg-[#121214]/65 backdrop-blur-md border border-rose-500/10 rounded-3xl p-6 md:p-8 shadow-xl text-center space-y-6">
              <div className="space-y-1.5">
                <span className="px-3 py-1 rounded-full bg-rose-950/30 border border-rose-500/15 text-rose-300 text-[10px] font-sans font-bold tracking-widest uppercase inline-flex items-center gap-1.5">
                  <Hourglass className="w-3 h-3 text-pink-400 animate-spin" style={{ animationDuration: "8s" }} /> Counting Every Sweet Second
                </span>
                <h3 className="text-lg md:text-xl font-serif text-white italic">
                  Time We've Shared Together
                </h3>
              </div>

              {/* Grid of Ticking Clock Units */}
              <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto font-mono text-center">
                <div className="bg-black/40 border border-rose-500/10 p-3 rounded-2xl">
                  <span className="block text-2xl md:text-3xl font-extrabold text-white">{countdown.days}</span>
                  <span className="text-[9px] text-rose-300/60 uppercase tracking-widest font-sans">Days</span>
                </div>
                <div className="bg-black/40 border border-rose-500/10 p-3 rounded-2xl">
                  <span className="block text-2xl md:text-3xl font-extrabold text-white">{countdown.hours}</span>
                  <span className="text-[9px] text-rose-300/60 uppercase tracking-widest font-sans">Hours</span>
                </div>
                <div className="bg-black/40 border border-rose-500/10 p-3 rounded-2xl">
                  <span className="block text-2xl md:text-3xl font-extrabold text-white">{countdown.minutes}</span>
                  <span className="text-[9px] text-rose-300/60 uppercase tracking-widest font-sans">Mins</span>
                </div>
                <div className="bg-black/40 border border-rose-500/10 p-3 rounded-2xl">
                  <span className="block text-2xl md:text-3xl font-extrabold text-rose-400">{countdown.seconds}</span>
                  <span className="text-[9px] text-rose-400 uppercase tracking-widest font-sans">Secs</span>
                </div>
              </div>

              <p className="text-[11px] text-rose-200/50 italic font-sans max-w-xs mx-auto">
                Every single moment is a treasure since we committed on {formatAnniversaryDate(state.anniversaryDate)}.
              </p>
            </div>

            {/* SECTION 3: THE HEARTFELT LETTER SCROLL / FLIPBOOK */}
            <motion.div
              layout
              className="bg-[#121214]/90 backdrop-blur-md rounded-3xl shadow-2xl border border-rose-500/15 overflow-hidden relative"
            >
              <div className="h-1.5 bg-gradient-to-r from-rose-600 via-pink-400 to-rose-600" />
              <div className="p-8 md:p-12 space-y-6">
                
                {/* Scroll header decoration */}
                <div className="flex justify-between items-center border-b border-rose-500/10 pb-4">
                  <span className="font-sans text-[10px] text-rose-400 font-bold tracking-widest uppercase">
                    Handwritten Scroll For {state.girlfriendName}
                  </span>
                  <span className="text-xs text-rose-300/50 italic font-serif">
                    Straight from my soul
                  </span>
                </div>

                {/* Sincere letter addressing feelings directly without excuses */}
                <div className="font-serif text-lg md:text-xl leading-relaxed text-[#f4f2f3] whitespace-pre-wrap italic pl-4 md:pl-6 border-l-2 border-rose-500/35">
                  {state.generatedText ? (
                    state.generatedText
                  ) : (
                    `To My Sweetest ${state.girlfriendName},

I know I hurt you, and I am not here to make excuses. I took your feelings lightly, and knowing that I am the reason behind your sadness makes me feel incredibly heavy.

I want to promise you that I will try my best to listen more and work hard on ourselves. Please find it in your heart to forgive me.

Pleasee Merii naggin maaf krdoo 😭

With all my love,
${state.boyfriendName}`
                  )}
                </div>

                <div className="pt-6 border-t border-rose-500/10 flex justify-between items-center text-xs text-rose-300/60 font-sans">
                  <span className="uppercase tracking-widest text-[9px]">Infinite Devotion,</span>
                  <span className="font-serif text-lg text-rose-400 italic font-semibold">{state.boyfriendName} ❤️</span>
                </div>
              </div>
            </motion.div>

            {/* SECTION 8: THINGS I WANT TO SAY (TYPING & CYCLER SECTION) */}
            <div className="bg-[#121214]/50 backdrop-blur-md rounded-2xl p-6 border border-rose-500/10 text-center min-h-[110px] flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase tracking-widest text-rose-400 font-sans font-bold mb-2">Whispers of my Heart</span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeSayIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.5 }}
                  className="font-serif text-lg md:text-xl text-white italic font-medium tracking-wide max-w-md"
                >
                  “{defaultSayPhrases[activeSayIndex]}”
                </motion.p>
              </AnimatePresence>
            </div>

            {/* SECTION 4: POLAROID MEMORY LANE GALLERY */}
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <span className="px-4 py-1 rounded-full bg-rose-950/40 border border-rose-500/15 text-rose-300 text-xs font-semibold tracking-widest uppercase inline-flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> 4. Our Sweet Memories
                </span>
                <p className="text-xs text-rose-200/50 font-light">Tap a photo card to flip it and read the happy story behind it!</p>
              </div>

              {/* 2x2 Grid of Polaroids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                
                {/* 1. First Selfie Polaroid */}
                <div 
                  className={`relative min-h-[260px] transition-all duration-500 cursor-pointer -rotate-1 hover:rotate-0`}
                  onClick={() => setFlippedPolaroid(flippedPolaroid === 101 ? null : 101)}
                >
                  <AnimatePresence mode="wait">
                    {flippedPolaroid !== 101 ? (
                      <motion.div
                        key="front"
                        initial={{ rotateY: 180, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -180, opacity: 0 }}
                        className="absolute inset-0 bg-[#121214] p-4 pb-6 rounded-sm shadow-xl border border-rose-500/10 flex flex-col justify-between"
                      >
                        <div className="w-full aspect-[4/3] bg-black/40 rounded-sm relative overflow-hidden">
                          <img 
                            src={state.galleryFirstSelfieUrl || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=600"} 
                            alt="First Selfie" 
                            className="w-full h-full object-cover opacity-80"
                          />
                        </div>
                        <div className="mt-4 text-center space-y-1">
                          <h4 className="font-cursive text-2xl text-rose-400">Our First Selfie</h4>
                          <p className="text-[10px] text-rose-200/60 italic font-serif">
                            "{state.galleryFirstSelfieCaption || "Still my absolute favourite smile in the world."}"
                          </p>
                          <span className="text-[8px] tracking-widest uppercase text-rose-500/50 block font-sans">Tap to read memories 🔄</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        initial={{ rotateY: -180, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: 180, opacity: 0 }}
                        className="absolute inset-0 bg-[#18181c] p-6 rounded-sm shadow-xl border border-rose-500/20 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <h4 className="font-serif italic text-rose-400 text-xs border-b border-rose-500/10 pb-1.5 uppercase tracking-wider flex items-center justify-between">
                            <span>First Selfie Memories</span>
                            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          </h4>
                          <p className="font-serif text-[#c5c5c5] text-xs leading-relaxed italic">
                            Remember when we took our first photo together? I was so incredibly nervous my hands were shaking, but your sweet laugh immediately put me at ease. I still get butterflies looking at this.
                          </p>
                        </div>
                        <span className="text-[8px] text-center text-rose-500/50 font-sans uppercase tracking-widest block">Tap to flip back 🔄</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Favourite Picture Polaroid */}
                <div 
                  className={`relative min-h-[260px] transition-all duration-500 cursor-pointer rotate-2 hover:rotate-0`}
                  onClick={() => setFlippedPolaroid(flippedPolaroid === 102 ? null : 102)}
                >
                  <AnimatePresence mode="wait">
                    {flippedPolaroid !== 102 ? (
                      <motion.div
                        key="front"
                        initial={{ rotateY: 180, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -180, opacity: 0 }}
                        className="absolute inset-0 bg-[#121214] p-4 pb-6 rounded-sm shadow-xl border border-rose-500/10 flex flex-col justify-between"
                      >
                        <div className="w-full aspect-[4/3] bg-black/40 rounded-sm relative overflow-hidden">
                          <img 
                            src={state.galleryFavPicUrl || "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600"} 
                            alt="Favourite Pic" 
                            className="w-full h-full object-cover opacity-80"
                          />
                        </div>
                        <div className="mt-4 text-center space-y-1">
                          <h4 className="font-cursive text-2xl text-rose-400">Favourite Picture</h4>
                          <p className="text-[10px] text-rose-200/60 italic font-serif">
                            "{state.galleryFavPicCaption || "The prettiest soul and most beautiful face."}"
                          </p>
                          <span className="text-[8px] tracking-widest uppercase text-rose-500/50 block font-sans">Tap to read memories 🔄</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        initial={{ rotateY: -180, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: 180, opacity: 0 }}
                        className="absolute inset-0 bg-[#18181c] p-6 rounded-sm shadow-xl border border-rose-500/20 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <h4 className="font-serif italic text-rose-400 text-xs border-b border-rose-500/10 pb-1.5 uppercase tracking-wider flex items-center justify-between">
                            <span>Favorite Day Memories</span>
                            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          </h4>
                          <p className="font-serif text-[#c5c5c5] text-xs leading-relaxed italic">
                            This is still my absolute favorite shot. You were glowing so bright, looking completely untroubled by the world. It reminds me of why I need to protect your happiness and stand by your side.
                          </p>
                        </div>
                        <span className="text-[8px] text-center text-rose-500/50 font-sans uppercase tracking-widest block">Tap to flip back 🔄</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. Funny Photo Polaroid */}
                <div 
                  className={`relative min-h-[260px] transition-all duration-500 cursor-pointer -rotate-2 hover:rotate-0`}
                  onClick={() => setFlippedPolaroid(flippedPolaroid === 103 ? null : 103)}
                >
                  <AnimatePresence mode="wait">
                    {flippedPolaroid !== 103 ? (
                      <motion.div
                        key="front"
                        initial={{ rotateY: 180, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -180, opacity: 0 }}
                        className="absolute inset-0 bg-[#121214] p-4 pb-6 rounded-sm shadow-xl border border-rose-500/10 flex flex-col justify-between"
                      >
                        <div className="w-full aspect-[4/3] bg-black/40 rounded-sm relative overflow-hidden">
                          <img 
                            src={state.galleryFunnyPicUrl || "https://images.unsplash.com/photo-1501901609772-df0848060b33?auto=format&fit=crop&q=80&w=600"} 
                            alt="Funny Photo" 
                            className="w-full h-full object-cover opacity-80"
                          />
                        </div>
                        <div className="mt-4 text-center space-y-1">
                          <h4 className="font-cursive text-2xl text-rose-400">Our Funny Goofy Side</h4>
                          <p className="text-[10px] text-rose-200/60 italic font-serif">
                            "{state.galleryFunnyPicCaption || "I love your crazy, silly side more than anything."}"
                          </p>
                          <span className="text-[8px] tracking-widest uppercase text-rose-500/50 block font-sans">Tap to read memories 🔄</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        initial={{ rotateY: -180, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: 180, opacity: 0 }}
                        className="absolute inset-0 bg-[#18181c] p-6 rounded-sm shadow-xl border border-rose-500/20 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <h4 className="font-serif italic text-rose-400 text-xs border-b border-rose-500/10 pb-1.5 uppercase tracking-wider flex items-center justify-between">
                            <span>Silly Outtakes</span>
                            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          </h4>
                          <p className="font-serif text-[#c5c5c5] text-xs leading-relaxed italic">
                            There's nobody else on this planet I can act completely foolish with. You embrace my goofy side, and your funny faces are the absolute highlight of my camera roll. Our silliness is our superpower.
                          </p>
                        </div>
                        <span className="text-[8px] text-center text-rose-500/50 font-sans uppercase tracking-widest block">Tap to flip back 🔄</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>

            {/* SECTION 7: TIMELINE SECTION */}
            <div className="space-y-6">
              <div className="text-center">
                <span className="px-4 py-1 rounded-full bg-rose-950/40 border border-rose-500/15 text-rose-300 text-xs font-semibold tracking-widest uppercase inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 animate-bounce" /> Our Love Milestone Timeline
                </span>
                <p className="text-xs text-rose-200/50 mt-1 font-light">Look at how far we have walked together ❤️</p>
              </div>

              {/* Styled Timeline */}
              <div className="relative border-l border-rose-500/20 ml-4 md:ml-10 space-y-8 py-2">
                
                {/* Milestone 1: We Met */}
                <div className="relative pl-8 group">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-black group-hover:scale-125 transition" />
                  <div className="bg-[#121214]/60 backdrop-blur-md border border-rose-500/10 p-4 rounded-2xl space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🌸</span>
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">We Met</h4>
                    </div>
                    <p className="text-xs text-rose-200/70 font-light leading-relaxed">
                      {state.timelineMeet}
                    </p>
                  </div>
                </div>

                {/* Milestone 2: First Conversation */}
                <div className="relative pl-8 group">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-rose-400 border-2 border-black group-hover:scale-125 transition" />
                  <div className="bg-[#121214]/60 backdrop-blur-md border border-rose-500/10 p-4 rounded-2xl space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">💬</span>
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">First Conversation</h4>
                    </div>
                    <p className="text-xs text-rose-200/70 font-light leading-relaxed">
                      {state.timelineConvo}
                    </p>
                  </div>
                </div>

                {/* Milestone 4: Our First Icecream Date */}
                <div className="relative pl-8 group">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-rose-600 border-2 border-black group-hover:scale-125 transition" />
                  <div className="bg-[#121214]/60 backdrop-blur-md border border-rose-500/10 p-4 rounded-2xl space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🍦</span>
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Our First Icecream Date</h4>
                    </div>
                    <p className="text-xs text-rose-200/70 font-light leading-relaxed">
                      {state.timelineLove}
                    </p>
                  </div>
                </div>



              </div>
            </div>

            {/* INTERACTIVE FORGIVENESS SLIDER */}
            <div className="bg-[#121214]/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-rose-500/10 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-sans font-medium text-white text-sm flex items-center gap-2 tracking-wide uppercase">
                  <Smile className="w-4 h-4 text-rose-400" /> Forgiveness Meter
                </h3>
                <span className="text-xs text-rose-300 font-bold bg-rose-950/40 border border-rose-500/15 px-3 py-1 rounded-full">
                  {loveMeterValue === 100 ? "Fully Forgiven! 🥰" : `${loveMeterValue}%`}
                </span>
              </div>
              
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={loveMeterValue}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setLoveMeterValue(val);
                    if (val === 100 && !forgiven) {
                      handleYesClick();
                    }
                  }}
                  className="w-full h-2 bg-[#0a0a0b] border border-rose-500/10 rounded-lg cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-rose-300/40 font-medium tracking-wider uppercase font-sans">
                  <span>Slightly Grumpy 🥺</span>
                  <span>Softening 🌸</span>
                  <span>Fully Forgiven! 😍</span>
                </div>
              </div>
            </div>

            {/* SECTION 9: FUTURE PROMISES GRID */}
            <div className="bg-[#121214]/85 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-rose-500/10 space-y-6">
              <div className="text-center space-y-1">
                <h3 className="font-sans font-medium text-white text-base uppercase tracking-wider">
                  If you give me another chance... ✨
                </h3>
                <p className="text-xs text-rose-200/50 font-light">Here are my realistic promises to you</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(state.promises && state.promises.length > 0 ? state.promises : [
                  "I will communicate with transparency.",
                  "I will value your feelings over being right."
                ]).map((promise, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-xl bg-black/40 border border-rose-500/10 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-100 font-light leading-relaxed">
                      {promise}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* COUPON PRESENT BOX SECTION */}
            <div className="bg-[#121214]/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-rose-500/10 text-center space-y-6">
              {!isGiftUnwrapped ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <div className="absolute -inset-1.5 rounded-full bg-rose-500/10 animate-ping opacity-70" />
                    <div className="w-16 h-16 bg-gradient-to-tr from-rose-600 to-pink-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md relative cursor-pointer hover:scale-105 active:scale-95 transition">
                      <Gift className="w-8 h-8 animate-wiggle" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-sans font-medium text-white text-sm uppercase tracking-wider">
                      Claim Your Sweet Peace Offering
                    </h3>
                    <p className="text-xs text-[#b4b4b4] mt-1 font-light">
                      I packed a claimable virtual coupon just for you.
                    </p>
                  </div>
                  <button
                    onClick={handleUnwrap}
                    className="px-8 py-2.5 rounded-full border border-rose-500/30 text-rose-300 font-sans uppercase tracking-widest text-[10px] font-bold hover:bg-rose-500 hover:text-white transition-all duration-300 cursor-pointer"
                    id="unwrap-gift-btn"
                  >
                    Click to Unwrap 🎁
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-4"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 bg-rose-950/40 border border-rose-500/10 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" /> Virtual Love Ticket
                  </span>

                  {/* Elegant Golden Coupon Card */}
                  <div className="max-w-md mx-auto rounded-xl overflow-hidden border border-dashed border-rose-500/30 bg-[#18181c] p-6 shadow-inner relative">
                    {/* Corner ticket punches */}
                    <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-[#0a0a0b] border border-rose-500/10 -translate-y-1/2 z-10" />
                    <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[#0a0a0b] border border-rose-500/10 -translate-y-1/2 z-10" />

                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{giftDetails.emoji}</span>
                      <div className="text-left space-y-1 flex-1">
                        <h4 className="font-sans font-bold text-white text-base">
                          {giftDetails.title}
                        </h4>
                        <p className="text-xs text-[#b4b4b4] leading-relaxed font-light">
                          {giftDetails.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-dashed border-rose-500/20 flex justify-between items-center">
                      <div className="text-left">
                        <span className="text-[8px] text-[#666] block font-sans uppercase tracking-wider">COUPON CODE</span>
                        <span className="font-mono text-xs font-bold text-rose-400 tracking-wider">
                          {giftDetails.couponCode}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setCouponRedeemed(true)}
                        disabled={couponRedeemed}
                        className={`px-5 py-2 rounded-full text-xs font-semibold shadow-md transition font-sans uppercase tracking-wider ${
                          couponRedeemed 
                            ? "bg-emerald-600 text-white" 
                            : "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white hover:opacity-90 font-bold cursor-pointer"
                        }`}
                        id="redeem-coupon-btn"
                      >
                        {couponRedeemed ? (
                          <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Claimed!</span>
                        ) : "Claim Ticket"}
                      </button>
                    </div>
                  </div>

                  {couponRedeemed && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-emerald-400 font-medium font-sans"
                    >
                      🎉 Ticket claimed! Take a screenshot and send it to {state.boyfriendName} to instantly redeem your reward!
                    </motion.p>
                  )}
                </motion.div>
              )}
            </div>

            {/* SECTION 10: FINAL MESSAGE DECISION CORNER */}
            <div className="bg-[#121214]/90 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-rose-500/10 text-center relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-rose-950/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-950/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative space-y-6 z-10">
                <div className="space-y-2">
                  <h3 className="font-serif italic text-white text-xl">
                    {forgiven ? "Thank you for forgiving me! ❤️" : "So, do you forgive me? 🥺"}
                  </h3>
                  <p className="text-xs text-[#b4b4b4] max-w-sm mx-auto font-light leading-relaxed">
                    {forgiven 
                      ? "I am the happiest person alive! I promise to give you the biggest, longest hug as soon as I see you."
                      : "I made this whole page just to ask you this. Please click the golden button below!"}
                  </p>
                </div>

                {/* YES/NO BUTTON CONTAINER */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 min-h-[140px] relative">
                  {forgiven ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="p-4 rounded-full bg-rose-950/40 border border-rose-500/25 text-rose-400 animate-bounce">
                        <Heart className="w-12 h-12 fill-rose-500 text-rose-500" />
                      </div>
                      <span className="font-serif italic text-lg text-rose-300">
                        Our hearts are fully connected again. I love you! 💕
                      </span>
                    </motion.div>
                  ) : (
                    <>
                      {/* YES BUTTON (Grows dynamically as she hesitates) */}
                      <motion.button
                        animate={{ scale: yesScale }}
                        transition={{ type: "spring", stiffness: 180, damping: 9 }}
                        onClick={handleYesClick}
                        className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-sans font-bold uppercase tracking-wider text-xs shadow-lg relative z-30 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                        id="forgive-yes-btn"
                      >
                        <Heart className="w-4.5 h-4.5 fill-current text-white animate-heartbeat" />
                        Yes, I Forgive You!
                      </motion.button>

                      {/* NO BUTTON (Dodges cursor on desktop / pleading prompts on mobile) */}
                      <motion.button
                        ref={noButtonRef}
                        animate={{ 
                          x: noPosition.x, 
                          y: noPosition.y 
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        onMouseEnter={handleNoHover}
                        onClick={handleNoClick}
                        className="px-6 py-3 rounded-full bg-[#18181c] text-rose-300/40 font-semibold border border-rose-500/10 hover:bg-[#222] hover:text-white transition z-20 cursor-pointer text-xs select-none max-w-[220px]"
                        id="forgive-no-btn"
                      >
                        {currentNoMessage}
                      </motion.button>
                    </>
                  )}
                </div>

                {noClicks > 0 && !forgiven && (
                  <p className="text-[10px] text-rose-400 font-mono italic animate-pulse">
                    Psst... Notice how the YES button keeps growing? Click it to claim your smile! 🥰
                  </p>
                )}
              </div>
            </div>

            {/* SECTION 11: SURPRISE ENDING ("One Last Click ❤️") */}
            <div className="bg-[#121214]/90 backdrop-blur-md rounded-2xl p-8 border border-rose-500/10 text-center space-y-6">
              <div className="space-y-1.5">
                <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-rose-400">The Ultimate Peace Offering</span>
                <h3 className="font-serif italic text-white text-lg">I have one final tiny message...</h3>
              </div>
              <button
                onClick={() => {
                  setShowSurpriseModal(true);
                  triggerConfettiBurst();
                  triggerConfettiBurst();
                }}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-sans font-bold uppercase tracking-widest text-xs shadow-lg shadow-pink-900/30 animate-pulse cursor-pointer"
                id="one-last-click-btn"
              >
                One Last Click ❤️
              </button>
            </div>



          </motion.div>
        )}
      </AnimatePresence>
        </div>
      )}

      {/* SURPRISE ENDING POPUP/MODAL */}
      <AnimatePresence>
        {showSurpriseModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            
            {/* Ambient glows inside popup */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-rose-600/10 blur-[130px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-pink-600/10 blur-[130px]" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121214]/80 border border-rose-500/15 rounded-3xl p-8 md:p-12 max-w-xl w-full text-center space-y-8 relative shadow-2xl"
            >
              <div className="inline-block relative">
                <div className="absolute -inset-4 bg-rose-500/20 rounded-full blur animate-ping" />
                <div className="p-5 bg-gradient-to-tr from-rose-600 to-pink-500 text-white rounded-full shadow-lg relative">
                  <Heart className="w-12 h-12 fill-current text-white animate-heartbeat" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-serif font-light text-white italic">
                  I Love You.
                </h2>
                <div className="w-20 h-0.5 bg-rose-500/40 mx-auto rounded-full" />
                <p className="text-rose-100/80 text-sm md:text-base leading-relaxed font-serif italic">
                  "Whether you forgive me today, later, or not at all, I wanted to sincerely apologize and thank you for every beautiful moment we've shared."
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowSurpriseModal(false)}
                  className="px-6 py-2.5 rounded-full border border-rose-500/20 text-rose-300 font-sans uppercase tracking-widest text-[10px] font-bold hover:bg-rose-500 hover:text-white transition cursor-pointer"
                >
                  Close Message ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
