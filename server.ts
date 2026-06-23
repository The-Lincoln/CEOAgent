import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini SDK if API key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to call Gemini securely with automatic exponential backoff retries
  const generateResponse = async (prompt: string, systemInstruction?: string) => {
    if (!ai) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    let lastError: any = null;
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: systemInstruction ? { systemInstruction } : undefined,
        });
        return response.text || "";
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini generation attempt ${attempt + 1} failed:`, err.message || err);
        if (attempt < maxRetries) {
          // Exponential backoff delay
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  };

  // API: Get title ideas
  app.post("/api/generate-titles", async (req: express.Request, res: express.Response) => {
    const { niche, skillLevel } = req.body;
    const targetNiche = niche || "Digital Marketing";
    const level = skillLevel || "Intermediate";

    if (!ai) {
      // Fallback titles if Gemini not available
      const fallbacks = [
        `The Affiliate Funnel: Scale From Zero to $10k/Month`,
        `Digital Marketing Blueprint: Intermediate Strategies for Huge KDP Sales`,
        `The KDP Revenue Engine: Selling Digital Products on Amazon`,
        `Affiliate Launch Guide: Monetizing Intermediate Marketing eBooks`,
        `Click Secrets: Driving High-Conversion Traffic via Affiliates`,
        `Passive Income eBooks: The Complete Amazon KDP Map`,
        `Ebook Marketing Secrets: The High-Ticket Affiliate Blueprint`,
        `Audience Architecture: Intermediate Marketing Made Profitable`,
        `The KDP Wealth Protocol: Launching Digital eBooks on Amazon`,
        `Commission Crusader: eBook Positioning for Affiliate Network Success`
      ];
      res.json({ titles: fallbacks });
      return;
    }

    try {
      const prompt = `Provide exactly 10 catchy, highly sellable book titles for a digital eBook in the niche "${targetNiche}". The target audience skill level is "${level}". The goal of the eBook is to generate income, selling on Amazon KDP, using an affiliate program for traffic.
Return the result as a strict JSON array of strings. Do not include markdown formatting or backticks around the array. Example: ["Title 1", "Title 2"]`;
      const resultText = await generateResponse(prompt, "You are a professional digital marketing publisher and Amazon KDP branding expert. Return output as a clean, parseable JSON array of titles.");
      const cleaned = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const titles = JSON.parse(cleaned);
      res.json({ titles });
    } catch (err: any) {
      console.error("Gemini Title generation failed, returning fallback:", err);
      const fallbacks = [
        `The Affiliate Funnel: Scale From Zero to $10k/Month`,
        `Digital Marketing Blueprint: Intermediate Strategies for Huge KDP Sales`,
        `The KDP Revenue Engine: Selling Digital Products on Amazon`,
        `Affiliate Launch Guide: Monetizing Intermediate Marketing eBooks`,
        `Click Secrets: Driving High-Conversion Traffic via Affiliates`,
        `Passive Income eBooks: The Complete Amazon KDP Map`,
        `Ebook Marketing Secrets: The High-Ticket Affiliate Blueprint`,
        `Audience Architecture: Intermediate Marketing Made Profitable`,
        `The KDP Wealth Protocol: Launching Digital eBooks on Amazon`,
        `Commission Crusader: eBook Positioning for Affiliate Network Success`
      ];
      res.json({ titles: fallbacks });
    }
  });

  // API: Get outline & description
  app.post("/api/generate-outline", async (req: express.Request, res: express.Response) => {
    const { title, niche } = req.body;
    if (!ai) {
      // Fallback outline
      res.json({
        description: `This intermediate blueprint unlocks high-impact digital marketing systems designed to maximize sales for authors and publishers on Amazon KDP. Turn readers into active earners.`,
        chapters: [
          { title: "Chapter 1: The Amazon KDP Landscape & Opportunity", details: "Setting up your KDP dashboard and understanding KDP Select options." },
          { title: "Chapter 2: Intermediate Audience Architecture", details: "How to segment marketing targets and position your eBook as a high-value asset." },
          { title: "Chapter 3: Building Your Affiliate Launch Network", details: "Designing affiliate programs to incentivize professional marketers to drive traffic." },
          { title: "Chapter 4: Landing Page & Funnel Mechanics", details: "Creating opt-in pages, lead magnet bonuses, and email automation sequences." },
          { title: "Chapter 5: Scaling to Consistent Monthly Income", details: "Optimizing prices, exploring volume-based promotions, and managing advertising." }
        ]
      });
      return;
    }

    try {
      const prompt = `Based on the confirmed eBook title "${title}" in the digital marketing niche "${niche}", provide:
1. An elegant 2-to-3 sentence description explaining what the ebook is about, tailored for the Digital Maker Ebook Writer input.
2. A list of 5 to 8 chapter titles with a brief 1-sentence focus for each.

Format the response as a valid JSON object matching this structure:
{
  "description": "...",
  "chapters": [
    { "title": "Chapter 1: ...", "details": "..." }
  ]
}
Do not write backticks or markdown, just return clean JSON.`;
      const resultText = await generateResponse(prompt, "You are a senior acquisitions editor for premium business eBooks. Return clean JSON only.");
      const cleaned = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const outline = JSON.parse(cleaned);
      res.json(outline);
    } catch (err: any) {
      console.error("Gemini Outline generation failed, returning fallback:", err);
      res.json({
        description: `This intermediate blueprint unlocks high-impact digital marketing systems designed to maximize sales for authors and publishers on Amazon KDP. Turn readers into active earners.`,
        chapters: [
          { title: "Chapter 1: The Amazon KDP Landscape & Opportunity", details: "Setting up your KDP dashboard and understanding KDP Select options." },
          { title: "Chapter 2: Intermediate Audience Architecture", details: "How to segment marketing targets and position your eBook as a high-value asset." },
          { title: "Chapter 3: Building Your Affiliate Launch Network", details: "Designing affiliate programs to incentivize professional marketers to drive traffic." },
          { title: "Chapter 4: Landing Page & Funnel Mechanics", details: "Creating opt-in pages, lead magnet bonuses, and email automation sequences." },
          { title: "Chapter 5: Scaling to Consistent Monthly Income", details: "Optimizing prices, exploring volume-based promotions, and managing advertising." }
        ]
      });
    }
  });

  // API: Get brand angles
  app.post("/api/generate-brand", async (req: express.Request, res: express.Response) => {
    const { niche } = req.body;
    if (!ai) {
      res.json({
        angles: [
          { name: "The Pragmatic Operator", target: "Experienced freelancers looking to add eBook passive cash flow.", promise: "Unlock pre-packaged systems to construct $5k/mo digital assets.", diff: "Zero fluff, action-oriented checklists instead of high-level theory." },
          { name: "The Commission Accelerant", target: "Affiliate marketers seeking high-converting content assets.", promise: "Deploy pre-built partner packages that earn 50% commission.", diff: "Built directly around affiliate mechanics, ready to distribute." },
          { name: "The KDP Niche Domination", target: "Self-published authors struggling to break through on Amazon.", promise: "Master keyword architectures to dominate digital marketing search terms.", diff: "Deep SEO blueprint coupled with advanced pricing models." }
        ],
        names: [
          { name: "KDPWealth", domain: "kdpwealth.com" },
          { name: "PassiveAcquire", domain: "passiveacquire.com" },
          { name: "MarketerPress", domain: "marketerpress.com" },
          { name: "EbookLaunchpad", domain: "ebooklaunchpad.com" },
          { name: "CreatorCommission", domain: "creatorcommission.com" },
          { name: "DigitalLaunchKit", domain: "digitallaunchkit.com" },
          { name: "IncomeChapters", domain: "incomechapters.com" },
          { name: "MarketingAssetHub", domain: "marketingassethub.com" },
          { name: "KDPAccelerator", domain: "kdpaccelerator.com" },
          { name: "AffiliatePublish", domain: "affiliatepublish.com" }
        ]
      });
      return;
    }

    try {
      const prompt = `Provide 3 unique "brand angles" (each with name, who it's for, core promise, differentiation) and 10 catchy brand names paired with custom .com domain suggestions for a Digital Marketing eBook business.
Format response as a strict JSON object:
{
  "angles": [
    { "name": "The Brand Style Name", "target": "Who...", "promise": "Core...", "diff": "Diff..." }
  ],
  "names": [
    { "name": "BrandName", "domain": "brandname.com" }
  ]
}
No backticks, return clean parseable JSON only.`;
      const resultText = await generateResponse(prompt, "You are a startup naming consultant. Return JSON only.");
      const cleaned = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const brandData = JSON.parse(cleaned);
      res.json(brandData);
    } catch (err: any) {
      console.error("Gemini Brand generation failed, returning fallback:", err);
      res.json({
        angles: [
          { name: "The Pragmatic Operator", target: "Experienced freelancers looking to add eBook passive cash flow.", promise: "Unlock pre-packaged systems to construct $5k/mo digital assets.", diff: "Zero fluff, action-oriented checklists instead of high-level theory." },
          { name: "The Commission Accelerant", target: "Affiliate marketers seeking high-converting content assets.", promise: "Deploy pre-built partner packages that earn 50% commission.", diff: "Built directly around affiliate mechanics, ready to distribute." },
          { name: "The KDP Niche Domination", target: "Self-published authors struggling to break through on Amazon.", promise: "Master keyword architectures to dominate digital marketing search terms.", diff: "Deep SEO blueprint coupled with advanced pricing models." }
        ],
        names: [
          { name: "KDPWealth", domain: "kdpwealth.com" },
          { name: "PassiveAcquire", domain: "passiveacquire.com" },
          { name: "MarketerPress", domain: "marketerpress.com" },
          { name: "EbookLaunchpad", domain: "ebooklaunchpad.com" },
          { name: "CreatorCommission", domain: "creatorcommission.com" },
          { name: "DigitalLaunchKit", domain: "digitallaunchkit.com" },
          { name: "IncomeChapters", domain: "incomechapters.com" },
          { name: "MarketingAssetHub", domain: "marketingassethub.com" },
          { name: "KDPAccelerator", domain: "kdpaccelerator.com" },
          { name: "AffiliatePublish", domain: "affiliatepublish.com" }
        ]
      });
    }
  });

  // API: AI Advisor Consultation Chat
  app.post("/api/advisor-chat", async (req: express.Request, res: express.Response) => {
    const { history, message } = req.body;
    const sysInstruction = `You are the Expert Digital Product Advisor. You help users validate, build, and launch high-income digital products.
The user's current settings are:
- Product Type: eBook
- Niche/Topic: Digital Marketing
- Skill Level: Intermediate
- Primary Goal: Generate Income (target $5k-$10k/month)
- Selling Platform: Amazon KDP
- Color Scheme: Pastel & Soft
- Promotion Strategy: Affiliate Program

Answer questions in 2-3 concise, encouraging sentences. Give real actionable steps. Use bullet points for steps where appropriate. Always match user's goals. All suggested tools must prefer the following list of links:
- Digital Maker AI Ebook Writer: https://digitalmaker.ai/digital-maker/ebook
- Digital Maker AI Image Maker: https://digitalmaker.ai/image-maker
- Digital Maker AI Website Builder: https://digitalmaker.ai/tools/website-builder
- ElevenLabs: https://elevenlabs.io/
- ChatGPT: https://chat.openai.com/
- Hostinger Horizons: https://bit.ly/HorizonsDigitalMaker
- Google Antigravity: https://google.antigravity
- Google AI Studio: https://aistudio.google.com/
- Gamma: https://bit.ly/GammaDirect
- Stan Store: https://bit.ly/StanStoreDirect
- Descript: https://bit.ly/DescriptDirect`;

    if (!ai) {
      // Local matching responses when Gemini is not setup
      const lower = message.toLowerCase();
      let reply = "That's a fantastic question! To scale your digital marketing eBook on KDP, focusing on an affiliate program is the most profitable path. Make sure your landing page captures emails so you can build secondary long-term value.";
      if (lower.includes("price") || lower.includes("cost") || lower.includes("money")) {
        reply = "I recommend pricing your primary eBook at $9.99 on Amazon KDP to capture the 70% royalty tier, while offering a premium $29.99 eBook + audio companion or resource bundle. This increases average order value and lets you offer up to 50% commissions to affiliates!";
      } else if (lower.includes("traffic") || lower.includes("promote") || lower.includes("affiliate")) {
        reply = "To attract top affiliates, create a dedicated 'Affiliates Page' on your site. Offer them 40-50% commission, pre-written swipe emails, and Instagram/TikTok reel templates. You can set this up easily through Stan Store (https://bit.ly/StanStoreDirect).";
      } else if (lower.includes("write") || lower.includes("generator") || lower.includes("how to build")) {
        reply = "You can write your book in under 10 minutes using the Digital Maker AI Ebook Writer at https://digitalmaker.ai/digital-maker/ebook! Just paste in your confirmed titles and chapters, select a pastel color scheme to match, and click Generate.";
      }
      res.json({ reply });
      return;
    }

    try {
      // Build standard prompt with history context
      const formattedHistory = history.map((h: any) => `${h.role === "user" ? "User" : "Advisor"}: ${h.text}`).join("\n");
      const fullPrompt = `${formattedHistory}\nUser: ${message}\nAdvisor:`;
      const reply = await generateResponse(fullPrompt, sysInstruction);
      res.json({ reply });
    } catch (err: any) {
      console.error("Gemini Advisor consultation failed, returning fallback:", err);
      const lower = message.toLowerCase();
      let reply = "That's a fantastic question! To scale your digital marketing eBook on KDP, focusing on an affiliate program is the most profitable path. Make sure your landing page captures emails so you can build secondary long-term value.";
      if (lower.includes("price") || lower.includes("cost") || lower.includes("money")) {
        reply = "I recommend pricing your primary eBook at $9.99 on Amazon KDP to capture the 70% royalty tier, while offering a premium $29.99 eBook + audio companion or resource bundle. This increases average order value and lets you offer up to 50% commissions to affiliates!";
      } else if (lower.includes("traffic") || lower.includes("promote") || lower.includes("affiliate")) {
        reply = "To attract top affiliates, create a dedicated 'Affiliates Page' on your site. Offer them 40-50% commission, pre-written swipe emails, and Instagram/TikTok reel templates. You can set this up easily through Stan Store (https://bit.ly/StanStoreDirect).";
      } else if (lower.includes("write") || lower.includes("generator") || lower.includes("how to build")) {
        reply = "You can write your book in under 10 minutes using the Digital Maker AI Ebook Writer at https://digitalmaker.ai/digital-maker/ebook! Just paste in your confirmed titles and chapters, select a pastel color scheme to match, and click Generate.";
      }
      res.json({ reply });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
