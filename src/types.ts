import firstSelfie from "./assets/images/regenerated_image_1782674594978.jpg";
import favPic from "./assets/images/regenerated_image_1782674698107.jpg";
import funnyPic from "./assets/images/regenerated_image_1782674783860.jpg";

export interface MemoryItem {
  id: number;
  title: string;
  content: string;
}

export interface ApologyState {
  girlfriendName: string;
  boyfriendName: string;
  reason: string;
  style: "Sincere" | "Poetic" | "Playful" | "Cute";
  customDetails: string;
  generatedText: string;
  giftType: "hugs" | "boba" | "roses" | "dinner";
  memories: MemoryItem[];
  
  // Custom interactive sections
  anniversaryDate: string; // e.g., "2024-01-01"
  galleryFirstSelfieCaption: string;
  galleryFavPicCaption: string;
  galleryFunnyPicCaption: string;
  galleryRandomPicCaption: string;
  galleryFirstSelfieUrl?: string;
  galleryFavPicUrl?: string;
  galleryFunnyPicUrl?: string;
  galleryRandomPicUrl?: string;
  
  thingsIWantToSay: string[];
  promises: string[];
  
  // Timeline dates/messages
  timelineMeet: string;
  timelineConvo: string;
  timelineCall: string;
  timelineLove: string;
  timelineSpecial: string;
  timelineFuture: string;
}

export const DEFAULT_STATE: ApologyState = {
  girlfriendName: "My Love",
  boyfriendName: "Aditya",
  reason: "our silly argument",
  style: "Sincere",
  customDetails: "",
  generatedText: "", // Starts empty, will be populated on first load or generated
  giftType: "hugs",
  memories: [
    {
      id: 1,
      title: "Our Sweetest Day",
      content: "No matter how silly our fights are, nothing can ever overshadow how much I cherish our laughs and the warm days we spend together. You are my sunshine."
    },
    {
      id: 2,
      title: "Why You Are Special",
      content: "You have the most beautiful smile that instantly brightens my entire world. Your kindness, your voice, and your sweet heart mean everything to me."
    },
    {
      id: 3,
      title: "My Promise to You",
      content: "I promise to listen more, hug you tighter, hold your hand through every storm, and never let go. I love you more with every passing day."
    }
  ],
  
  // New section defaults
  anniversaryDate: "2024-09-09T23:48:00", // default sweet date
  galleryFirstSelfieCaption: "Still my absolute favourite smile in the world.",
  galleryFavPicCaption: "The prettiest soul and most beautiful face.",
  galleryFunnyPicCaption: "I love your crazy, silly side more than anything.",
  galleryRandomPicCaption: "Every single ordinary moment with you is precious.",
  galleryFirstSelfieUrl: firstSelfie,
  galleryFavPicUrl: favPic,
  galleryFunnyPicUrl: funnyPic,
  galleryRandomPicUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
  
  thingsIWantToSay: [
    "I am so, so sorry for hurting you.",
    "I miss hearing your laughter every single second.",
    "I never, ever wanted to bring tears to your eyes.",
    "Thank you for being patient with me, even when I fail.",
    "You are the best thing that has ever happened to me."
  ],
  
  promises: [
    "I will communicate with absolute transparency.",
    "I will value your feelings over being right.",
    "I will always try to become a best partner for you that you deserve,every day"
  ],
  
  timelineMeet: "The magical day our eyes met and my world shifted 🌸",
  timelineConvo: "Our first conversation where we talked about everything and forgot about sleep 💬",
  timelineCall: "Hearing your voice for the first time, calming all my fears 📞",
  timelineLove: "On 10 October 2024 That Butter skotch flavour icecream that we both ate and roam around tha pandal's little mela and at last sharing my last bite of the icecream i hope i can reshare that last bite once again with you 🥺",
  timelineSpecial: "All the sweet dates, late night ice creams, and cozy memories 🎂",
  timelineFuture: "Growing old, facing storms together, and building our dream house 🌍"
};

export const GIFT_DETAILS = {
  hugs: {
    title: "Kiss Ticket",
    emoji: "😘",
    color: "from-pink-400 to-rose-400",
    description: "Redeemable for 100+ gentle, warm kisses that make you feel completely safe, protected, and deeply loved.",
    couponCode: "COUPON-KISSES"
  },
  boba: {
    title: "Cheek Kiss Ticket",
    emoji: "🥰",
    color: "from-amber-400 to-orange-500",
    description: "Redeemable for infinite sweet cheek kisses, cozy soft cuddles, and warm whispers whenever you feel sad or down.",
    couponCode: "COUPON-CHEEK-KISSES"
  },
  roses: {
    title: "Deep Loving Kiss Ticket",
    emoji: "💋",
    color: "from-red-500 to-rose-600",
    description: "Redeemable for the warmest, most passionate kiss that melts away all your anger, stress, and restores full peace to your heart.",
    couponCode: "COUPON-DEEP-KISSES"
  },
  dinner: {
    title: "Infinite Kiss Tickets Pack",
    emoji: "💖",
    color: "from-indigo-400 to-purple-500",
    description: "The ultimate coupon pack redeemable for unlimited sweet kisses, tightest hugs, and absolute devotion from your partner, valid forever.",
    couponCode: "COUPON-INFINITE-KISSES"
  }
};
