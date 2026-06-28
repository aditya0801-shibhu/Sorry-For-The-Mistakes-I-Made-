import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Generate apology content using Gemini API
  app.post("/api/generate-apology", async (req, res) => {
    const { girlfriendName, boyfriendName, reason, style, customDetails } = req.body;

    const recipient = girlfriendName || "My Love";
    const sender = boyfriendName || "Your Partner";
    const mainReason = reason || "a silly misunderstanding";
    const selectedStyle = style || "Sincere";
    const extraDetails = customDetails ? `Additional context: ${customDetails}` : "";

    // Lazy initialization of Gemini API
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured or holds placeholder. Using creative local fallback builder.");
      // Provide a beautiful fallback based on the options selected!
      const fallbackText = getFallbackApology(recipient, sender, mainReason, selectedStyle, customDetails);
      return res.json({ text: fallbackText });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Write a beautiful, personalized apology from ${sender} to their girlfriend ${recipient}.
The reason for the apology is: ${mainReason}.
The desired vibe/style of the message is: ${selectedStyle} (could be Sincere, Poetic, Playful, or Cute).
${extraDetails}

Instructions:
- If the style is Poetic, write a moving, romantic poem (3-4 stanzas).
- If the style is Playful, keep it cheerful, sweet, with a few cute self-deprecating jokes, lighthearted.
- If the style is Sincere, write a deep, touching, heartfelt personal letter.
- If the style is Cute, write an adorable, warm letter filled with cute expressions and gentle affection.
- Ensure the tone is extremely loving and apologetic.
- Do NOT use markdown bold headers or bullet points. Use clean line breaks, standard paragraph flow, and simple spacing so it reads like a real letter or handwritten poem.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert romance letter writer and relationship healer. You write heartfelt, deeply touching, sweet, and customized apologies that help couples bridge gaps and celebrate their love.",
          temperature: 0.85,
        },
      });

      const text = response.text || getFallbackApology(recipient, sender, mainReason, selectedStyle, customDetails);
      res.json({ text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      // Fail gracefully and return the beautiful fallback
      const fallbackText = getFallbackApology(recipient, sender, mainReason, selectedStyle, customDetails);
      res.json({ text: fallbackText, note: "API call failed, served local sweet builder." });
    }
  });

  // Helper local apology builder for zero-dependency reliability
  function getFallbackApology(
    recipient: string,
    sender: string,
    reason: string,
    style: string,
    details: string
  ): string {
    const cleanReason = reason.toLowerCase();
    
    if (style === "Poetic") {
      return `To My Dearest ${recipient},

The stars grow dim when we're apart,
A heavy weight upon my heart.
For words I said, or things I missed,
I long to see your face sun-kissed.

I’m truly sorry for ${cleanReason},
My love for you has no season.
Please take my hand, let’s heal the line,
And let your bright light once more shine.

Forever Yours,
${sender}`;
    }

    if (style === "Playful") {
      return `Hey ${recipient}! 🥰

Your resident goofball here, currently standing in the designated "Time Out" corner with a very apologetic look on my face. 🥺

I am so, so incredibly sorry for ${cleanReason}! I promise my brain cells were temporarily on vacation, but they have now returned and are fully dedicated to apologizing to the most beautiful girl in the universe. 

To make it up to you, I am offering:
1. Unlimited tickles
2. Getting you your favorite snacks on demand
3. Listening to you complain about how silly I am (totally deserved!)

Can we make up? Pretty please with a cherry on top? 🍒

Love you tons,
${sender}`;
    }

    if (style === "Cute") {
      return `My sweet ${recipient},

I'm sending you this little letter with the biggest hug imaginable! 🤗💖

I feel so sad inside because I know I caused ${cleanReason}, and making you unhappy is the absolute last thing I ever want to do. You deserve all the cuddles, happy giggles, and sweet moments in the world. 

I’m super-duper sorry! I have wrapped up 1000 virtual hugs, 500 sweet kisses, and a basket of your favorite treats in this card just for you. 🧸🌸

Can you please forgive your silly ${sender}? Let's cuddle soon!

Love you to the moon and back,
${sender}`;
    }

    // Default Sincere
    return `Dearest ${recipient},

I am writing this from the bottom of my heart to tell you how deeply sorry I am for ${cleanReason}. 

Our relationship is the most precious thing in my life, and it hurts me deeply to know that I've caused you any pain, stress, or frustration. You deserve to be treated with nothing but the utmost love, care, and respect every single day. I made a mistake, and I want to own up to it and learn from it.

Thank you for your patience, your grace, and for being the wonderful person that you are. I hope you can find it in your heart to forgive me. I am fully committed to making things right and being the partner you truly deserve.

With all my love and sincerity,
${sender}`;
  }

  // Vite development vs production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
