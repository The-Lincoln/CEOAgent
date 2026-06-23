import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Briefcase,
  CheckSquare,
  ChevronRight,
  TrendingUp,
  Download,
  Copy,
  Check,
  Send,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Mail,
  RotateCcw,
  BookMarked,
  FileText,
  User,
  ExternalLink,
  Award,
  Book,
  GraduationCap
} from "lucide-react";

// Structure definitions
interface Chapter {
  title: string;
  details: string;
}

interface BrandAngle {
  name: string;
  target: string;
  promise: string;
  diff: string;
}

interface BrandName {
  name: string;
  domain: string;
}

interface Message {
  role: "user" | "advisor";
  text: string;
  time: string;
}

export default function App() {
  // Navigation & Wizard State
  const [activeStep, setActiveStep] = useState<number>(0);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(0);

  // App Options & Interactive Values
  const [niche, setNiche] = useState<string>("Digital Marketing");
  const [skillLevel, setSkillLevel] = useState<string>("Intermediate");
  const [goal, setGoal] = useState<string>("Generate Income");
  const [authorName, setAuthorName] = useState<string>("E. M. Lincoln");
  const [writingStyle, setWritingStyle] = useState<string>("Professional");

  // Dynamic Data States
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  const [brandAngles, setBrandAngles] = useState<BrandAngle[]>([]);
  const [brandNames, setBrandNames] = useState<BrandName[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");

  const [loadingTitles, setLoadingTitles] = useState<boolean>(false);
  const [loadingOutline, setLoadingOutline] = useState<boolean>(false);
  const [loadingBrand, setLoadingBrand] = useState<boolean>(false);

  // General Interactive States
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Slider State (Monetization tab)
  const [price, setPrice] = useState<number>(9.99);
  const [bundlePrice, setBundlePrice] = useState<number>(29.99);
  const [salesVolume, setSalesVolume] = useState<number>(300);
  const [affiliateRate, setAffiliateRate] = useState<number>(50); // commission percentage

  // Checklists State
  const [checklist1, setChecklist1] = useState<boolean[]>([false, false, false, false, false]);
  const [checklist2, setChecklist2] = useState<boolean[]>([false, false, false, false, false]);
  const [checklist3, setChecklist3] = useState<boolean[]>([false, false, false, false, false]);
  const [checklist4, setChecklist4] = useState<boolean[]>([false, false, false, false, false]);
  const [checklist5, setChecklist5] = useState<boolean[]>([false, false, false, false, false]);
  const [checklist6, setChecklist6] = useState<boolean[]>([false, false, false, false, false]);
  const [checklistMaster, setChecklistMaster] = useState<boolean[]>(new Array(10).fill(false));

  // Companion Chat Stats
  const [chatInput, setChatInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "advisor",
      text: "Hello! I am your Digital Product Business Advisor. I have loaded your quiz results for the Digital Marketing eBook launch. Let's work together to make this Amazon KDP business extremely profitable using our advanced Affiliate strategy! Take look at Phase 1 below.",
      time: "21:15"
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Mini-Course State
  const [showCourse, setShowCourse] = useState<boolean>(false);
  const [activeCourseMod, setActiveCourseMod] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [quizResult, setQuizResult] = useState<Record<number, boolean>>({});

  // Trigger toast feedback
  const triggerCopyFeedback = (label: string) => {
    setCopyFeedback(label);
    setTimeout(() => {
      setCopyFeedback(null);
    }, 2000);
  };

  const copyToClipboard = (text: string, label: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => triggerCopyFeedback(label))
          .catch((err) => {
            console.warn("Failed standard copy, trying fallback", err);
            copyFallback(text, label);
          });
      } else {
        copyFallback(text, label);
      }
    } catch (e) {
      console.warn("Clipboard API failed", e);
      copyFallback(text, label);
    }
  };

  const copyFallback = (text: string, label: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        triggerCopyFeedback(label);
      } else {
        console.error("Fallback copy execution failed");
      }
    } catch (err) {
      console.error("Fallback copy failed entirely", err);
    }
  };

  // Pre-load default titles and update dynamically as niche changes
  useEffect(() => {
    fetchTitlesAndOutfit();
    fetchBrandData();
  }, []);

  const fetchTitlesAndOutfit = async () => {
    setLoadingTitles(true);
    try {
      const res = await fetch("/api/generate-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, skillLevel }),
      });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data.titles && data.titles.length > 0) {
        setTitles(data.titles);
        // Default to the first title initially
        setSelectedTitle(data.titles[0]);
        // Also fire off outline generation for that first title
        fetchOutline(data.titles[0]);
      }
    } catch (e) {
      console.error("Error generating titles", e);
    } finally {
      setLoadingTitles(false);
    }
  };

  const fetchOutline = async (title: string) => {
    if (!title) return;
    setLoadingOutline(true);
    try {
      const res = await fetch("/api/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, niche }),
      });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data.description) {
        setDescription(data.description);
      }
      if (data.chapters) {
        setChapters(data.chapters);
      }
    } catch (err) {
      console.error("Error generating outline", err);
    } finally {
      setLoadingOutline(false);
    }
  };

  const fetchBrandData = async () => {
    setLoadingBrand(true);
    try {
      const res = await fetch("/api/generate-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche }),
      });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data.angles) setBrandAngles(data.angles);
      if (data.names && data.names.length > 0) {
        setBrandNames(data.names);
        setSelectedBrand(data.names[0].name);
        setSelectedDomain(data.names[0].domain);
      }
    } catch (e) {
      console.error("Error generating brand", e);
    } finally {
      setLoadingBrand(false);
    }
  };

  // Scroll active chat down
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Advisor updates dialogue automatically when state steps change
  useEffect(() => {
    const stageGuides: Record<number, string> = {
      0: "We are starting with Phase 1: Business Plan Summary & Validation. Check out your core credentials in the table and complete the validator checklists before we move on. Once completed, type or click NEXT!",
      1: "Excellent work. Welcome to Phase 2, eBook Blueprinting! Select your preferred Title from our AI-curated options, enter your custom Pen name or settings, and copy your custom parameters. Click the digitalmaker link to instantly generate!",
      2: "Fantastic! Now we are on Phase 3: Brand & Naming. Evaluate the three custom audience strategic angles, and choose your favorite high-converting brand name & domain registry concept.",
      3: "A digital marketing product must look premium! Phase 4 covers the exact steps to generate stunning Covers with the Digital Maker AI Image Maker. Copy your exact settings and setup your Amazon market presence.",
      4: "Money math is key! In Phase 5: Monetization & Revenue Simulator, adjust pricing, partner shares, and monthly volumes to outline premium eBook tiers and run realistic sales calculations.",
      5: "Affiliate growth launch is highly explosive! Phase 6 showcases how to recruit professional affiliate partners, deploy outreach email sequences, and use pre-written high-conversion promotional social copy.",
      6: "You are moments away from launch! Phase 7 combines all your tasks into a master roadmap. You can export your personalized workbook PDF, or turn this plan into an interactive Mini Course!"
    };

    const lastMsg = messages[messages.length - 1];
    if (activeStep > 0 && lastMsg && lastMsg.text !== stageGuides[activeStep]) {
      setMessages(prev => [
        ...prev,
        {
          role: "advisor",
          text: stageGuides[activeStep],
          time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [activeStep]);

  // Handle user chatting
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsgText = chatInput;
    setChatInput("");
    
    const userMsg: Message = {
      role: "user",
      text: userMsgText,
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/advisor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.slice(-6).map(m => ({ role: m.role, text: m.text })),
          message: userMsgText
        })
      });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          role: "advisor",
          text: data.reply || "I am processing your query. Could you please outline any specific details?",
          time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "advisor",
          text: "I might have hit a slight network bump, but don't worry! Keep moving forward or click NEXT.",
          time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Proceed button actions
  const handleProceedNext = () => {
    if (activeStep < 6) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      if (nextStep > maxUnlockedStep) {
        setMaxUnlockedStep(nextStep);
      }
    }
  };

  const handleStepClick = (index: number) => {
    if (index <= maxUnlockedStep) {
      setActiveStep(index);
    }
  };

  // Table items for summary
  const tableData = [
    { area: "Product Type", ans: "📘 eBook", rec: "eBook + Audiobook Bonus Companion", step: "Review high-ticket bundles", tool: "ElevenLabs (https://elevenlabs.io/)", eta: "1 Hour" },
    { area: "Niche / Topic", ans: `🎯 ${niche}`, rec: "Intermediate High-Conversion Blueprints", step: "Generate targeted outline", tool: "Digital Maker AI Ebook Writer", eta: "10 Mins" },
    { area: "Target Audience", ans: "👤 Intermediate Marketers", rec: "Pragmatic, systems-focused specialists", step: "Structure case studies", tool: "AI Workspace Generator", eta: "2 Hours" },
    { area: "Primary Goal", ans: "💰 Generate Income", rec: "Establish affiliate recurring royalty circles", step: "Price at premium, offer 50%", tool: "Revenue Projection Widget", eta: "Ongoing" },
    { area: "Color Theme", ans: "🎨 Pastel & Soft", rec: "Elegant Pink or custom Teal gradients", step: "Select mockup layout background", tool: "Digital Maker AI Image Maker", eta: "5 Mins" },
    { area: "Selling Platform", ans: "🛒 Amazon KDP", rec: "Amazon Kindle Publishing + Direct Store", step: "Draft KDP description & key terms", tool: "Stan Store (https://bit.ly/StanStoreDirect)", eta: "3 Hours" },
    { area: "Promotion Route", ans: "📣 Affiliate Network", rec: "Offer pre-written templates & 40-50% commission", step: "Write recruiter invites & swipe copy", tool: "Outreach Mail Hub", eta: "4 Hours" }
  ];

  // Specific copy-paste fields matching Ebook tool exactly
  const ebookCopyText = `• Ebook Title: ${selectedTitle}
• What is your ebook about: ${description || `This intermediate guide maps modern high-impact digital marketing frameworks to maximize passive profits on Amazon KDP.`}
• Number of chapters: ${chapters.length || 7}
• Colour theme: Pink
• Author name: ${authorName}
• Writing style: ${writingStyle}`;

  // Image Maker Mockup prompt
  const imageCoverPrompt = `• Product Type: Ebook/PDF
• Ebook Title: ${selectedTitle}
• Creator / Brand: ${selectedBrand || authorName}
• Subtitle: Ultimate Intermediate Blueprint for Digital Assets
• Ebook Cover Style: Elegant & Luxury
• Device Display: iPad
• Background Style: Clean Gradient
• Text Overlay: Yes - name + tagline
• Colors: Pastel soft pink and slate teal`;

  // Dynamic projection calculations
  const grossRoyalty = Number((price * 0.70).toFixed(2));
  const affiliatePayout = Number((grossRoyalty * (affiliateRate / 100)).toFixed(2));
  const netProfitPerSale = Number((grossRoyalty - affiliatePayout).toFixed(2));
  const monthlyProfit = Number((netProfitPerSale * salesVolume).toFixed(2));

  // Course Quizzes
  const quizzes = [
    {
      q: "Which pricing strategy is ideal for attracting major affiliate marketers to promote a KDP eBook?",
      opts: [
        "Keeping pricing under $0.99 with 5% commissions.",
        "Pricing at $9.99 (70% KDP tier) and bundling with resources to offer 40-50% commission shares.",
        "Refusing affiliate programs and spending 100% on paid ads.",
        "Only listing on free libraries."
      ],
      ans: 1
    },
    {
      q: "Where is the best place to automatically generate full chapters and pastel-themed eBooks directly as a downloadable PDF?",
      opts: [
        "Standard word processors manually.",
        "Digital Maker AI Ebook Writer (https://digitalmaker.ai/digital-maker/ebook).",
        "Local terminal codebases.",
        "Social media platforms."
      ],
      ans: 1
    },
    {
      q: "How can you instantly double average order value (AOV) for a basic marketing eBook launch?",
      opts: [
        "By translating the book to 20 languages right away.",
        "By charging $100 for the PDF with no marketing content.",
        "By bundling an Audiobook companion using custom AI voices (ElevenLabs) and resource trackers.",
        "By writing a longer introduction section."
      ],
      ans: 2
    }
  ];

  const handleSelectQuiz = (modIndex: number, optIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [modIndex]: String(optIndex) }));
  };

  const submitQuiz = (modIndex: number) => {
    const chosen = Number(quizAnswers[modIndex]);
    const correct = chosen === quizzes[modIndex].ans;
    setQuizResult(prev => ({ ...prev, [modIndex]: correct }));
    setQuizSubmitted(prev => ({ ...prev, [modIndex]: true }));
  };

  // Web printer
  const handlePrintPlan = () => {
    try {
      window.print();
    } catch (e) {
      console.warn("Print action is blocked or not supported in this iframe environment.", e);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#333333] font-sans selection:bg-[#FBCFE8] selection:text-slate-900 leading-relaxed overflow-x-hidden border-8 border-white">
      
      {/* Toast alert feedback */}
      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-[#FAF9F6] px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-[#E5E5E5] animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Copied {copyFeedback}!</span>
        </div>
      )}

      {/* Hero Banner header matching Artistic Flair theme */}
      <header className="border-b border-[#E5E5E5] bg-white sticky top-0 z-40 px-6 md:px-10 py-5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#8B8B8B] mb-1">
                Digital Product Advisor
              </span>
              <h1 className="text-3xl md:text-4xl font-serif italic text-[#2C3E50] leading-none">
                The Marketing Blueprint
              </h1>
            </div>
            
            <div className="lg:hidden flex items-center gap-3">
              <div className="px-4 py-2 bg-[#F0F4F8] rounded-full border border-[#D1D9E0] text-[10px] font-bold uppercase tracking-wider text-[#2C3E50]">
                KDP Ecosystem
              </div>
              <div className="w-10 h-10 rounded-full border border-[#2C3E50] flex items-center justify-center relative shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#D1FAE5]"></div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-1 lg:pb-0 overflow-x-auto">
            {tableData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleStepClick(idx)}
                disabled={idx > maxUnlockedStep}
                className={`text-[10px] px-3.5 py-2 rounded-full font-bold tracking-widest transition-all shrink-0 border uppercase ${
                  activeStep === idx
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md scale-102"
                    : idx <= maxUnlockedStep
                    ? "bg-white text-[#2C3E50] border-[#D1D9E0] hover:bg-[#FDF2F8] hover:border-[#FBCFE8]"
                    : "bg-transparent text-[#A0AEC0] border-transparent cursor-not-allowed"
                }`}
              >
                Phase {idx + 1}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="px-4 py-2 bg-[#F0F4F8] rounded-full border border-[#D1D9E0] text-xs font-semibold uppercase tracking-wider text-[#2C3E50]">
              KDP Ecosystem
            </div>
            <div className="w-12 h-12 rounded-full border border-[#2C3E50] flex items-center justify-center relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#D1FAE5]"></div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: AI Buddy Co-Pilot matches Artistic Flair theme */}
        <section className="lg:col-span-4 flex flex-col h-[calc(100vh-140px)] min-h-[500px] border border-[#E5E5E5] rounded-3xl bg-white shadow-sm overflow-hidden sticky top-28">
          
          {/* Advisor Identification Header */}
          <div className="bg-[#FAF9F6] px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#2C3E50] flex items-center justify-center text-lg bg-[#D1FAE5] shadow-inner text-[#2C3E50] font-serif italic font-bold">
                B
              </div>
              <div>
                <h3 className="font-serif italic font-bold text-[#2C3E50] text-sm">Advisor Chat</h3>
                <p className="text-[9px] text-[#8B8B8B] tracking-[0.15em] uppercase font-semibold">Digital Specialist</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white text-slate-500 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#D1D9E0]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </div>
          </div>

          {/* Chat scrolling history text */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF9F6]/10">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col max-w-[85%] ${
                  m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#2C3E50] text-white rounded-tr-none"
                      : "bg-white text-[#333333] rounded-tl-none border border-[#E5E5E5]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                <span className="text-[9px] text-[#A0AEC0] mt-1 px-1 font-mono">{m.time}</span>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 mr-auto bg-white p-3.5 rounded-2xl border border-[#E5E5E5] shadow-sm max-w-[50%]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2C3E50] animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2C3E50] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2C3E50] animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Consultation queries */}
          <div className="p-2 bg-[#FAF9F6] border-t border-[#E5E5E5] overflow-x-auto flex gap-2 whitespace-nowrap">
            <button
              onClick={() => {
                setChatInput("What is the best price point for an eBook on KDP?");
                setTimeout(() => handleSendMessage(), 100);
              }}
              className="text-[10px] font-bold uppercase tracking-wider bg-white border border-[#D1D9E0] text-[#2C3E50] px-3 py-2 rounded-full hover:border-[#FBCFE8] hover:bg-[#FDF2F8] transition-colors cursor-pointer"
            >
              💡 Best pricing strategies?
            </button>
            <button
              onClick={() => {
                setChatInput("How can I find high-quality affiliates to drive sales?");
                setTimeout(() => handleSendMessage(), 100);
              }}
              className="text-[10px] font-bold uppercase tracking-wider bg-white border border-[#D1D9E0] text-[#2C3E50] px-3 py-2 rounded-full hover:border-[#FBCFE8] hover:bg-[#FDF2F8] transition-colors cursor-pointer"
            >
              📣 Recruiting affiliate partners?
            </button>
            <button
              onClick={() => {
                setChatInput("How does the Digital Maker Ebook Writer process work?");
                setTimeout(() => handleSendMessage(), 100);
              }}
              className="text-[10px] font-bold uppercase tracking-wider bg-white border border-[#D1D9E0] text-[#2C3E50] px-3 py-2 rounded-full hover:border-[#FBCFE8] hover:bg-[#FDF2F8] transition-colors cursor-pointer"
            >
              🤖 Digital Maker AI guide?
            </button>
          </div>

          {/* Message input prompt */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E5E5E5] flex gap-2 bg-white">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask your advisor a question..."
              className="flex-1 border border-[#D1D9E0] rounded-full px-4 py-2.5 text-xs bg-[#FAF9F6]/50 focus:outline-none focus:border-[#2C3E50] focus:ring-1 focus:ring-[#2C3E50]"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="bg-[#1A1A1A] hover:bg-black text-white px-4 py-2.5 rounded-full transition-all shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>

        {/* Right column: Action console */}
        <section className="lg:col-span-8 space-y-6">

          {/* Phase 1: Business Plan view matches Artistic Flair theme */}
          {activeStep === 0 && (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E5E5] pb-5 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8B8B8B] block mb-1">Phase 1</span>
                  <h2 className="text-3.5xl font-serif italic text-[#2C3E50]">
                    Your Digital Business Plan Summary
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Strategic alignments built around your choices.
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-[#2C3E50] stroke-[1.5]" />
              </div>

              {/* TABLE VIEW */}
              <div className="overflow-x-auto border border-[#E5E5E5] rounded-2xl bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[#2C3E50] tracking-wider font-semibold uppercase">
                      <th className="p-4 font-serif italic text-sm">Area</th>
                      <th className="p-4 font-serif italic text-sm">My Selection</th>
                      <th className="p-4 font-serif italic text-sm">Expert Recommendation</th>
                      <th className="p-4 font-serif italic text-sm text-[#48BB78]">Action Steps</th>
                      <th className="p-4 font-serif italic text-sm">Tool Suggestions</th>
                      <th className="p-4 font-serif italic text-sm shrink-0">Est. Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5F5] text-[#333333]">
                    {tableData.map((row, i) => (
                      <tr key={i} className={`hover:bg-[#FDF2F8]/40 transition-colors ${row.area.includes("Style") ? "bg-[#FDF2F8]" : ""}`}>
                        <td className="p-4 font-bold text-[#2C3E50] text-[13px]">{row.area}</td>
                        <td className="p-4 font-medium">{row.ans}</td>
                        <td className="p-4">{row.rec}</td>
                        <td className="p-4 text-xs font-semibold text-[#059669]">{row.step}</td>
                        <td className="p-4 font-mono text-[10px] text-[#2C3E50] hover:underline">
                          <a href={row.tool.includes("https") ? row.tool.substring(row.tool.indexOf("https")) : "#"}>
                            {row.tool}
                          </a>
                        </td>
                        <td className="p-4 whitespace-nowrap font-medium text-[#718096]">{row.eta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Validation Checklist UI styled as green action box from Design HTML */}
              <div className="bg-[#ECFDF5] p-6 rounded-2xl border border-[#D1FAE5] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#059669] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#059669]" /> Phase 1 Checklist – Validate & Prepare
                </h3>
                <div className="space-y-3.5 text-xs text-[#333333]">
                  {[
                    "Research and define your digital marketing sub-niche (e.g. Email Funnels, SEO for eCommerce, Social Leads).",
                    "Acknowledge KDP pricing rules (the 70% royalty bracket requires pricing between $2.99 and $9.99).",
                    "Verify matching Pastel & Soft color guidelines to ensure clean brand consistency.",
                    "Set up an active affiliate hub with digital links on Stan Store (https://bit.ly/StanStoreDirect).",
                    "Pre-list and note down 10 relevant marketing forums or micro-influencer profiles for promo recruitment."
                  ].map((task, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-1 hover:bg-white/40 rounded-xl transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist1[idx]}
                        onChange={(e) => {
                          const updated = [...checklist1];
                          updated[idx] = e.target.checked;
                          setChecklist1(updated);
                        }}
                        className="mt-0.5 w-3.5 h-3.5 accent-[#059669] rounded"
                      />
                      <span className="leading-relaxed">{task}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#A0AEC0]">
                  {checklist1.filter(Boolean).length}/5 checklist tasks validated
                </div>
                <button
                  onClick={handleProceedNext}
                  className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest text-xs uppercase shadow-xl hover:scale-105 transition-transform duration-200"
                >
                  Confirm & Proceed to Phase 2
                </button>
              </div>
            </div>
          )}

          {/* Phase 2: Product Specific Build Instructions matches Artistic Flair theme */}
          {activeStep === 1 && (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E5E5] pb-5 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8B8B8B] block mb-1">Phase 2</span>
                  <h2 className="text-3.5xl font-serif italic text-[#2C3E50]">
                    eBook Title Selection & Writer Blueprint
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Auto-compile variables to instantly generate your KDP eBook with high-efficiency AI tools.
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-[#2C3E50] stroke-[1.5]" />
              </div>

              {/* Suggest 10 title options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#A0AEC0]">
                    Suggested eBook Titles (Choose One):
                  </h3>
                  <button
                    onClick={fetchTitlesAndOutfit}
                    disabled={loadingTitles}
                    className="text-[10px] font-bold text-[#2C3E50] hover:text-black uppercase tracking-wider cursor-pointer"
                  >
                    {loadingTitles ? "Regenerating..." : "🔄 Refresh Ideas"}
                  </button>
                </div>
                
                {loadingTitles ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="h-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {titles.map((titleText, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTitle(titleText);
                          fetchOutline(titleText);
                        }}
                        className={`p-4 rounded-xl border-2 border-dashed text-left transition-all duration-200 ${
                          selectedTitle === titleText
                            ? "bg-[#FDF2F8] border-[#FBCFE8] text-[#2C3E50] font-bold shadow-sm"
                            : "bg-white border-[#E2E8F0] text-slate-700 hover:border-[#FBCFE8] hover:bg-[#FAF9F6]"
                        }`}
                      >
                        <span className="font-serif italic text-sm text-[#2C3E50] block mb-1">Choosing {idx + 1}:</span>
                        <span>{titleText}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title and Pen name customizer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF9F6] p-5 rounded-2xl border border-[#E5E5E5]">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[#8B8B8B]">Confirmed Title</label>
                  <input
                    type="text"
                    value={selectedTitle}
                    onChange={(e) => setSelectedTitle(e.target.value)}
                    className="w-full border border-[#D1D9E0] rounded-xl p-3 text-xs bg-white focus:outline-none focus:border-[#2C3E50] focus:ring-1 focus:ring-[#2C3E50]"
                    placeholder="Enter manual title..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[#8B8B8B]">Author Pen Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full border border-[#D1D9E0] rounded-xl p-3 text-xs bg-white focus:outline-none focus:border-[#2C3E50] focus:ring-1 focus:ring-[#2C3E50]"
                    placeholder="Your name or alias"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[#8B8B8B]">Writing Style</label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    className="w-full border border-[#D1D9E0] rounded-xl p-3 text-xs bg-white focus:outline-none focus:border-[#2C3E50] focus:ring-1 focus:ring-[#2C3E50]"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Casual & Friendly">Casual & Friendly</option>
                    <option value="Technical">Technical</option>
                    <option value="Creative & Storytelling">Creative & Storytelling</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>
              </div>

              {/* OUTLINE COMPILER */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#A0AEC0]">
                  eBook Chapter Outline & Description Preview
                </h4>
                {loadingOutline ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-10 bg-[#FAF9F6] rounded-xl"></div>
                    <div className="h-20 bg-[#FAF9F6] rounded-xl"></div>
                  </div>
                ) : (
                  <div className="border border-[#E5E5E5] rounded-2xl p-5 bg-[#FAF9F6]/20 text-xs text-[#333333] space-y-4">
                    <p className="italic text-slate-600 bg-white p-4 rounded-xl border border-[#EEE]">
                      <strong className="text-[#2C3E50] font-serif not-italic">Synopsis Description:</strong> {description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {chapters.map((ch, idx) => (
                        <div key={idx} className="p-3.5 bg-white rounded-xl border border-[#E5E5E5]">
                          <p className="font-serif italic text-[#2C3E50] text-sm mb-1">{ch.title}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{ch.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Digital Maker Copy & Paste Block */}
              <div className="p-6 border border-[#E5E5E5] bg-[#FAF9F6] rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#F0F4F8] text-[#2C3E50] border border-[#D1D9E0] text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase">
                      Ready Copy Formula
                    </span>
                    <h3 className="font-serif italic text-[#2C3E50] text-base font-bold">
                      Digital Maker AI Ebook Parameters
                    </h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(ebookCopyText, "Writer Parameters")}
                    className="text-xs bg-white text-slate-700 font-bold border border-[#D1D9E0] px-4 py-2 rounded-full hover:bg-slate-50 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy Answers
                  </button>
                </div>

                <div className="bg-[#1A1A1A] text-[#D1FAE5] p-5 rounded-2xl font-mono text-xs overflow-x-auto whitespace-pre leading-loose border border-white/10 shadow-inner">
                  {ebookCopyText}
                </div>

                <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl text-xs space-y-2">
                  <p className="text-slate-700 leading-normal">
                    👉 Go to the <span className="font-bold">Digital Maker AI Ebook Writer</span>, paste in the answers above, and click <span className="font-bold">Generate</span>. Your high-scoring eBook is rendered as a clean downloadable PDF instantly.
                  </p>
                  <a
                    href="https://digitalmaker.ai/digital-maker/ebook"
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="inline-flex items-center gap-1 text-[#2C3E50] font-serif italic text-xs hover:text-black hover:underline"
                  >
                    Open Digital Maker AI Ebook Writer <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Phase 2 Checklist */}
              <div className="bg-[#ECFDF5] p-6 rounded-2xl border border-[#D1FAE5] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#059669] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#059669]" /> Phase 2 Checklist – Create Your Book or Course
                </h3>
                <div className="space-y-3.5 text-xs text-[#333333]">
                  {[
                    "Review generated eBook title & write your personal pen author name.",
                    "Verify description represents at least 2 relevant sentences answering user intents.",
                    "Generate target outline chapters inside the Digital Maker platform.",
                    "Optional bonus: Record companion audio in ElevenLabs (https://elevenlabs.io/) for higher pricing tiers.",
                    "Format completed eBook chapters into a singular robust PDF manuscript."
                  ].map((task, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-1 hover:bg-white/40 rounded-xl transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist2[idx]}
                        onChange={(e) => {
                          const updated = [...checklist2];
                          updated[idx] = e.target.checked;
                          setChecklist2(updated);
                        }}
                        className="mt-0.5 w-3.5 h-3.5 accent-[#059669] rounded"
                      />
                      <span className="leading-relaxed">{task}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#A0AEC0]">
                  {checklist2.filter(Boolean).length}/5 checklist tasks validated
                </div>
                <button
                  onClick={handleProceedNext}
                  className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest text-xs uppercase shadow-xl hover:scale-105 transition-transform duration-200"
                >
                  Proceed to Naming & Brand
                </button>
              </div>
            </div>
          )}

          {/* Phase 3: Brand & Positioning matches Artistic Flair theme */}
          {activeStep === 2 && (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E5E5] pb-5 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8B8B8B] block mb-1">Phase 3</span>
                  <h2 className="text-3.5xl font-serif italic text-[#2C3E50]">
                    Brand Identity & Positioning Coordinates
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Position your platform for elite pricing conversions using tailored brand positioning.
                  </p>
                </div>
                <Sparkles className="w-8 h-8 text-[#2C3E50] stroke-[1.5]" />
              </div>

              {/* 3 Brand Angles */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#A0AEC0]">Select an Elite Value Positioning Angle:</h3>
                {loadingBrand ? (
                  <div className="space-y-3 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-[#FAF9F6] rounded-xl border border-slate-250"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {brandAngles.map((angle, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border border-[#E5E5E5] bg-[#FAF9F6]/55 space-y-3 hover:border-[#FBCFE8] transition-colors"
                      >
                        <h4 className="font-serif italic text-sm text-[#2C3E50] flex items-center gap-1.5 font-bold">
                          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
                          {angle.name}
                        </h4>
                        <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                          <p><strong className="text-[#2C3E50]">Audience:</strong> {angle.target}</p>
                          <p><strong className="text-[#2C3E50]">Core Promise:</strong> {angle.promise}</p>
                          <p><strong className="text-[#2C3E50]">Key Edge:</strong> {angle.diff}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Brand Naming & Domain picker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#A0AEC0]">Suggested Brand Names & Available .com Domains:</h3>
                  <button
                    onClick={fetchBrandData}
                    disabled={loadingBrand}
                    className="text-[10px] font-bold text-[#2C3E50] hover:text-black uppercase tracking-wider cursor-pointer"
                  >
                    {loadingBrand ? "Checking..." : "🔄 Refresh Names"}
                  </button>
                </div>

                {loadingBrand ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-pulse">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="h-12 bg-slate-50 rounded-xl"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {brandNames.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedBrand(item.name);
                          setSelectedDomain(item.domain);
                        }}
                        className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                          selectedBrand === item.name
                            ? "bg-[#FDF2F8] border-[#FBCFE8] text-[#2C3E50] font-bold ring-1 ring-[#FBCFE8]"
                            : "bg-white border-[#E2E8F0] hover:border-[#D1D9E0] text-slate-700"
                        }`}
                      >
                        <span className="text-xs block font-bold text-[#2C3E50]">{item.name}</span>
                        <span className="text-[9px] text-[#A0AEC0] font-mono mt-0.5">{item.domain}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected pen customizer details */}
              <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#D1D9E0] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                <div className="text-center sm:text-left space-y-1">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Activated Brand Identity:</p>
                  <p className="text-base font-serif italic text-[#2C3E50]">
                    🚀 {selectedBrand} — Domain: <span className="text-teal-700 font-semibold underline">{selectedDomain}</span>
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedDomain, "Chosen Domain")}
                  className="bg-white border border-[#D1D9E0] text-slate-700 font-bold hover:bg-slate-50 px-4 py-2 rounded-full text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Domain
                </button>
              </div>

              {/* Phase 3 Checklist */}
              <div className="bg-[#ECFDF5] p-6 rounded-2xl border border-[#D1FAE5] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#059669] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#059669]" /> Phase 3 Checklist – Finalize Brand Identity
                </h3>
                <div className="space-y-3.5 text-xs text-[#333333]">
                  {[
                    "Pin down 1 niche value positioning angle most compatible with your competence.",
                    "Select a catchy domain and verify availability inside registries.",
                    "Draft an attractive, short elevator bio that matches your brand core.",
                    "Align color schemes with pastel warm shades.",
                    "Formulate a target domain handle for marketing outreach messages."
                  ].map((task, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-1 hover:bg-white/40 rounded-xl transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist3[idx]}
                        onChange={(e) => {
                          const updated = [...checklist3];
                          updated[idx] = e.target.checked;
                          setChecklist3(updated);
                        }}
                        className="mt-0.5 w-3.5 h-3.5 accent-[#059669] rounded"
                      />
                      <span className="leading-relaxed">{task}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#A0AEC0]">
                  {checklist3.filter(Boolean).length}/5 checklist tasks validated
                </div>
                <button
                  onClick={handleProceedNext}
                  className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest text-xs uppercase shadow-xl hover:scale-105 transition-transform duration-200"
                >
                  Proceed to Store & Cover Build
                </button>
              </div>
            </div>
          )}

          {/* Phase 4: Selling Platform & Cover Image Maker matches Artistic Flair theme */}
          {activeStep === 3 && (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E5E5] pb-5 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8B8B8B] block mb-1">Phase 4</span>
                  <h2 className="text-3.5xl font-serif italic text-[#2C3E50]">
                    Storefront & High-Value Cover Design Mockups
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Launch your sales funnel with the Digital Maker Image Maker cover guidelines.
                  </p>
                </div>
                <ShoppingBag className="w-8 h-8 text-[#2C3E50] stroke-[1.5]" />
              </div>

              {/* Cover Creation Walkthrough */}
              <div className="p-6 border border-[#E5E5E5] bg-[#FAF9F6] rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#F0F4F8] text-[#2C3E50] border border-[#D1D9E0] text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase">
                      Interactive Mockup Formula
                    </span>
                    <h3 className="font-serif italic text-[#2C3E50] text-base font-bold">
                      Ebook Cover Mockup Prompt
                    </h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(imageCoverPrompt, "Cover Prompt")}
                    className="text-xs bg-white text-slate-700 font-bold border border-[#D1D9E0] px-4 py-2 rounded-full hover:bg-slate-50 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy Cover Parameters
                  </button>
                </div>

                <div className="bg-[#1A1A1A] text-[#D1FAE5] p-5 rounded-2xl font-mono text-xs overflow-x-auto whitespace-pre leading-loose border border-white/10 shadow-inner">
                  {imageCoverPrompt}
                </div>

                <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl text-xs space-y-2">
                  <p className="text-slate-700 leading-normal">
                    👉 Go to the <span className="font-bold">Digital Maker AI Image Maker</span>, choose <span className="font-bold">Product Mockup</span>, and copy-paste the values above. Within moments, your elegant pastel KDP Cover mock is ready!
                  </p>
                  <a
                    href="https://digitalmaker.ai/image-maker"
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="inline-flex items-center gap-1 text-[#2C3E50] font-serif italic text-xs hover:text-black hover:underline"
                  >
                    Open Digital Maker AI Image Maker <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* KDP Specific Instructions */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#A0AEC0]">Amazon KDP Launch Guide Checklist:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div className="p-4 bg-white border border-[#E5E5E5] rounded-2xl space-y-1.5 hover:border-[#FBCFE8] transition-colors">
                    <span className="font-serif italic text-sm text-[#2C3E50] font-bold block">1. Create Kindle Account</span>
                    <p className="text-slate-500 leading-relaxed">Go to kdp.amazon.com and set up your direct bank deposit credentials.</p>
                  </div>
                  <div className="p-4 bg-white border border-[#E5E5E5] rounded-2xl space-y-1.5 hover:border-[#FBCFE8] transition-colors">
                    <span className="font-serif italic text-sm text-[#2C3E50] font-bold block">2. Keywords SEO Architecture</span>
                    <p className="text-slate-500 leading-relaxed">Select KDP search terms like: \"digital products for income, marketing ebook guide, KDP passive model.\"</p>
                  </div>
                  <div className="p-4 bg-white border border-[#E5E5E5] rounded-2xl space-y-1.5 hover:border-[#FBCFE8] transition-colors">
                    <span className="font-serif italic text-sm text-[#2C3E50] font-bold block">3. Set Pricing Strategy</span>
                    <p className="text-slate-500 leading-relaxed">For direct 70% royalties, set your book price between $2.99 and $9.99 USD.</p>
                  </div>
                  <div className="p-4 bg-white border border-[#E5E5E5] rounded-2xl space-y-1.5 hover:border-[#FBCFE8] transition-colors">
                    <span className="font-serif italic text-sm text-[#2C3E50] font-bold block">4. Amazon EPUB Formatting</span>
                    <p className="text-slate-500 leading-relaxed">Amazon accepts ePUB or PDF formats directly. Our generator outputs optimized documents.</p>
                  </div>
                </div>
              </div>

              {/* Phase 4 Checklist */}
              <div className="bg-[#ECFDF5] p-6 rounded-2xl border border-[#D1FAE5] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#059669] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#059669]" /> Phase 4 Checklist – Build Your Platform / Cover
                </h3>
                <div className="space-y-3.5 text-xs text-[#333333]">
                  {[
                    "Confirm eBook title matching high-impact target niche keywords.",
                    "Generate a high-resolution Kindle product cover mockup (https://digitalmaker.ai/image-maker).",
                    "Add confirmed pen names & description outlines to Amazon books portal.",
                    "Optimize 7 Kindle publishing backend search keywords.",
                    "Upload completed PDF or ePUB copy check draft directly into Amazon KDP."
                  ].map((task, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-1 hover:bg-white/40 rounded-xl transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist4[idx]}
                        onChange={(e) => {
                          const updated = [...checklist4];
                          updated[idx] = e.target.checked;
                          setChecklist4(updated);
                        }}
                        className="mt-0.5 w-3.5 h-3.5 accent-[#059669] rounded"
                      />
                      <span className="leading-relaxed">{task}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#A0AEC0]">
                  {checklist4.filter(Boolean).length}/5 checklist tasks validated
                </div>
                <button
                  onClick={handleProceedNext}
                  className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest text-xs uppercase shadow-xl hover:scale-105 transition-transform duration-200"
                >
                  Proceed to Revenue Simulator
                </button>
              </div>
            </div>
          )}

          {/* Phase 5: Monetization & Pricing Simulator matches Artistic Flair theme */}
          {activeStep === 4 && (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E5E5] pb-5 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8B8B8B] block mb-1">Phase 5</span>
                  <h2 className="text-3.5xl font-serif italic text-[#2C3E50]">
                    eBook Tier Structure & Revenue Simulation
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure profitable pricing ratios and run projections based on your marketing strategy.
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-[#2C3E50] stroke-[1.5]" />
              </div>

              {/* Pricing Recommendation Strategy */}
              <div className="p-5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                  ⭐ Recommendation Tier Blueprint (Maximize Sales)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-xl border border-[#D1D9E0] hover:border-[#FBCFE8] transition-all">
                    <p className="font-serif italic text-[#2C3E50] font-bold text-sm">Tier 1: Basic Amazon eBook</p>
                    <p className="text-[#059669] font-bold font-serif text-lg mt-1">$9.99</p>
                    <p className="text-slate-500 mt-1.5 leading-relaxed">Offers readers full knowledge outline. Sets entry barrier low.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#D1D9E0] hover:border-[#FBCFE8] transition-all">
                    <p className="font-serif italic text-[#2C3E50] font-bold text-sm">Tier 2: Premium Bundle Upsell</p>
                    <p className="text-[#059669] font-bold font-serif text-lg mt-1">$29.99</p>
                    <p className="text-slate-500 mt-1.5 leading-relaxed">Includes Audiobook companion (ElevenLabs) + resource trackers & planners.</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Sliders Simulator */}
              <div className="space-y-4 border border-[#E5E5E5] rounded-2xl p-6 bg-[#FAF9F6]/40">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#A0AEC0]">
                  📊 Profit Projection Simulator:
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#2C3E50]">Retail Price per eBook ($):</span>
                    <span className="font-mono text-slate-900 font-bold">${price}</span>
                  </div>
                  <input
                    type="range"
                    min="2.99"
                    max="49.99"
                    step="0.5"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#E2E8F0] accent-[#2C3E50] rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#2C3E50]">Est. Monthly Sales Volume (units):</span>
                    <span className="font-mono text-slate-900 font-bold">{salesVolume}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="2000"
                    step="10"
                    value={salesVolume}
                    onChange={(e) => setSalesVolume(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#E2E8F0] accent-[#2C3E50] rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#2C3E50]">Affiliate Commission Share (% option):</span>
                    <span className="font-mono text-slate-900 font-bold">{affiliateRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    step="5"
                    value={affiliateRate}
                    onChange={(e) => setAffiliateRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#E2E8F0] accent-[#2C3E50] rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Dynamic Outputs calculations */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-white border border-[#E5E5E5] rounded-2xl flex flex-col justify-center shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Royalty (70%)</p>
                  <p className="text-lg font-serif italic font-bold text-[#2C3E50] mt-0.5">${grossRoyalty}</p>
                </div>
                <div className="p-4 bg-white border border-[#E5E5E5] rounded-2xl flex flex-col justify-center shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Affiliate Share</p>
                  <p className="text-lg font-serif italic font-bold text-orange-600 mt-0.5">${affiliatePayout}</p>
                </div>
                <div className="p-4 bg-white border border-[#E5E5E5] rounded-2xl flex flex-col justify-center shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Profit / Unit</p>
                  <p className="text-lg font-serif italic font-bold text-[#2C3E50] mt-0.5">${netProfitPerSale}</p>
                </div>
                <div className="p-4 bg-[#FAF9F6] border-2 border-[#2C3E50] rounded-2xl flex flex-col justify-center shadow-md">
                  <p className="text-[10px] text-[#2C3E50] font-bold uppercase tracking-wider">Monthly Profit Projection</p>
                  <p className="text-xl font-serif italic font-bold text-[#2C3E50] mt-0.5">${monthlyProfit}</p>
                </div>
              </div>

              {/* Phase 5 Checklist */}
              <div className="bg-[#ECFDF5] p-6 rounded-2xl border border-[#D1FAE5] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#059669] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#059669]" /> Phase 5 Checklist – Define Monetization
                </h3>
                <div className="space-y-3.5 text-xs text-[#333333]">
                  {[
                    "Establish book's starting sale price inside Amazon's 70% royalty boundaries.",
                    "Formulate a premium bundle version including planners or guides.",
                    "Formulate maximum affiliate program payouts (such as 40-50% commission arrays) to recruit elite partners.",
                    "Verify automated payouts configurations in Stan Store or your marketplace.",
                    "Acknowledge net revenue monthly projections match basic goals."
                  ].map((task, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-1 hover:bg-white/40 rounded-xl transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist5[idx]}
                        onChange={(e) => {
                          const updated = [...checklist5];
                          updated[idx] = e.target.checked;
                          setChecklist5(updated);
                        }}
                        className="mt-0.5 w-3.5 h-3.5 accent-[#059669] rounded"
                      />
                      <span className="leading-relaxed">{task}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#A0AEC0]">
                  {checklist5.filter(Boolean).length}/5 checklist tasks validated
                </div>
                <button
                  onClick={handleProceedNext}
                  className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest text-xs uppercase shadow-xl hover:scale-105 transition-transform duration-200"
                >
                  Proceed to Affiliate Marketing Swipes
                </button>
              </div>
            </div>
          )}

          {/* Phase 6: Promotion Strategy (Affiliate Strategy) */}
          {activeStep === 5 && (
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E5E5] pb-5 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8B8B8B] block mb-1">Phase 6</span>
                  <h2 className="text-3.5xl font-serif italic text-[#2C3E50]">
                    Affiliate Partner Acquisition & Swipe Campaigns
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Deploy pre-built pitch emails and high-converting social sweeps to scale traffic automatically.
                  </p>
                </div>
                <Mail className="w-8 h-8 text-[#2C3E50] stroke-[1.5]" />
              </div>

              {/* Outreach Pitch Script */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#A0AEC0]">
                    ✉️ Recruiter Invited Email Outreach (Copy & Paste):
                  </h3>
                  <button
                    onClick={() => copyToClipboard(`Subject: Let's team up! Launch partnership for high-royal digital assets...`, "Outreach Swipe")}
                    className="text-xs bg-white text-slate-700 font-bold border border-[#D1D9E0] px-4 py-2 rounded-full hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy Pitch Email
                  </button>
                </div>
                <div className="bg-[#1A1A1A] text-[#D1FAE5] p-5 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap border border-white/10 shadow-inner">
                  {`Subject: High-Paying Partnership Option: Earning 50% commission promoting "${selectedTitle}"

Hi [Partner Name],

I was reviewing your superb digital marketing content, and wanted to propose a lucrative launch collaboration. I've launched an intermediate blueprint ebook titled "${selectedTitle}" on Amazon, and we're recruiting key partners.

Given your aligned target audience, we are offering an active 50% commission for every direct sale made through your tracking link!

We handle all customer service, books delivery, and refunds automatically.

Here are your resources:
- Dedicated Affiliate Dashboard setup
- Prebuilt Instagram/TikTok reel templates

Let me know if you would like to receive a review copy!

Cheers,

${authorName} | Founder, ${selectedBrand}`}
                </div>
              </div>

              {/* 10 high-impact social posts templates */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#A0AEC0]">
                  📱 10 High-Converting Promotional Social Copy Templates (1-2 Lines each):
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {[
                    "Struggling to scale your KDP sales without paid ads? We just launched our intermediate blueprint to build affiliate engines that work 24/7! Link is in bio.",
                    "Stop selling $0.99 low-ticket items. Master high-converting eBook modules styled in gorgeous pastel alignments. Learn more:",
                    "A launch framework designed by intermediate marketing specialists to turn small ideas into recurring income.",
                    "Ready to join our launch team and make 50% commission on our high-value blueprint ebook? Apply here:",
                    "Digital marketing rules have shifted. Check out this guide highlighting KDP SEO architecture and ranking criteria.",
                    "How we built a digital publishing asset that attracts affiliates automatically. Grab your guide today:",
                    "Don't write your digital books manually. Our AI system handles formatting in under 10 minutes. Tutorial link:",
                    "Pastel & soft aesthetics convert much higher than generic corporate designs. See how we styled our latest blueprint ebook:",
                    "The Amazon wealth manual is live! Unlock key intermediate chapters detailing affiliate outreach loops. Get it:",
                    "Master intermediate content marketing strategies to generate durable passive revenues. eBook copies available now!"
                  ].map((post, idx) => (
                    <div key={idx} className="p-4 bg-white border border-[#E5E5E5] rounded-2xl space-y-2 relative group hover:border-[#FBCFE8] transition-colors flex flex-col justify-between">
                      <div className="flex justify-between items-center pb-2 border-b border-[#F5F5F5]">
                        <span className="font-serif italic font-bold text-sm text-[#2C3E50]">Social Copy {idx+1}</span>
                        <button
                          onClick={() => copyToClipboard(post, `Social Slide ${idx+1}`)}
                          className="text-[#2C3E50] hover:text-black text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          Copy Swipe
                        </button>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-xs pt-1">{post}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 6 Checklist */}
              <div className="bg-[#ECFDF5] p-6 rounded-2xl border border-[#D1FAE5] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#059669] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#059669]" /> Phase 6 Checklist – Grow Traffic
                </h3>
                <div className="space-y-3.5 text-xs text-[#333333]">
                  {[
                    "Identify at least 15 affiliate niche micro-influencers or bloggers.",
                    "Customize recruitment pitch scripts using your eBook Title and Brand name.",
                    "Draft 10 relevant social promotions to build anticipation.",
                    "Formulate custom tracking links for affiliate signups.",
                    "Promote the affiliate program inside relevant marketing forums."
                  ].map((task, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-1 hover:bg-white/40 rounded-xl transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist6[idx]}
                        onChange={(e) => {
                          const updated = [...checklist6];
                          updated[idx] = e.target.checked;
                          setChecklist6(updated);
                        }}
                        className="mt-0.5 w-3.5 h-3.5 accent-[#059669] rounded"
                      />
                      <span className="leading-relaxed">{task}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#A0AEC0]">
                  {checklist6.filter(Boolean).length}/5 checklist tasks validated
                </div>
                <button
                  onClick={handleProceedNext}
                  className="px-8 py-3 bg-[#1A1A1A] text-[#ffffff] rounded-full font-bold tracking-widest text-xs uppercase shadow-xl hover:scale-105 transition-transform duration-200"
                >
                  Proceed to Final Master Plan
                </button>
              </div>
            </div>
          )}

          {/* Phase 7: Complete Checklist, PDF export & optional Mini Course */}
          {activeStep === 6 && (
            <div className="space-y-6">
              
              {/* Master Checklist */}
              <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E5E5] pb-5 gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8B8B8B] block mb-1">Phase 7</span>
                    <h2 className="text-3.5xl font-serif italic text-[#2C3E50]">
                      Your Complete Step-by-Step Launch Blueprint
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      From initial validation check up to booking your first affiliate royalty check.
                    </p>
                  </div>
                  <CheckSquare className="w-8 h-8 text-[#059669]" />
                </div>

                {/* Combined master timeline checklists */}
                <div className="space-y-3.5">
                  {[
                    `Validate Niche & Audience priorities mapping intermediate marketing systems.`,
                    `Curate and lock in eBook Title: "${selectedTitle || "My Selected Title"}".`,
                    `Select target Pen name, writing style and color configurations.`,
                    `Direct copy the custom answers format and generate outline chapters inside Digital Maker AI.`,
                    `Pick high-conversion brand angles and secure domain handles: "${selectedDomain || "mycomdomain.com"}".`,
                    `Select Elegant Product Cover style templates in Digital Maker Image Maker (https://digitalmaker.ai/image-maker).`,
                    `Configure bank credentials and upload check formats inside Amazon KDP portal.`,
                    `Deploy dynamic pricing ranges ($9.99 eBook with $29.99 Premium companion resources upsell).`,
                    `Launch affiliate recruitment outreach campaigns offering 40-50% commission tracking.`,
                    `Send social templates and pitch lists to recruit target affiliate channels.`
                  ].map((task, idx) => (
                    <label key={idx} className="flex items-start gap-4 p-4 bg-[#FAF9F6] hover:bg-[#FAF9F6]/80 border border-[#E5E5E5] rounded-2xl transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklistMaster[idx]}
                        onChange={(e) => {
                          const updated = [...checklistMaster];
                          updated[idx] = e.target.checked;
                          setChecklistMaster(updated);
                        }}
                        className="mt-0.5 w-4 h-4 accent-[#2C3E50] rounded"
                      />
                      <div className="space-y-1.5 text-xs text-slate-700 leading-normal flex-1">
                        <span className="font-serif italic font-bold text-[#2C3E50] bg-white border border-[#D1D9E0] px-2.5 py-0.5 rounded-full text-[10px] mr-2">Step {idx + 1}</span>
                        <span>{task}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* PDF generation action triggers */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-[#FAF9F6] border border-[#E5E5E5] p-6 rounded-2xl gap-4">
                  <div className="text-center md:text-left">
                    <p className="font-serif italic text-base text-[#2C3E50] font-bold">Download Your Complete Action Manifest PDF</p>
                    <p className="text-xs text-slate-500 mt-0.5">Generate a clean print layout to keep yourself accountable offline.</p>
                  </div>
                  <button
                    onClick={handlePrintPlan}
                    className="px-6 py-3 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest text-[10px] uppercase shadow-md hover:scale-105 transition-transform duration-200"
                  >
                    Export Launch Blueprint PDF
                  </button>
                </div>
              </div>

              {/* Toggle turn into Mini Course options */}
              <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center border-b border-[#E5E5E5] pb-5 gap-4">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-serif font-bold italic text-[#2C3E50] flex items-center gap-2 justify-center md:justify-start">
                      <GraduationCap className="w-5 h-5 text-[#2C3E50]" /> Transform Action Plan into a Mini Course
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Crack open a customized 3-module masterclass complete with quizzes to cement your digital marketing product mastery.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCourse(!showCourse)}
                    className="px-6 py-2.5 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-full font-bold tracking-widest text-[10px] uppercase transition-all"
                  >
                    {showCourse ? "Hide Mini Course" : "Unlock Mini Course Now"}
                  </button>
                </div>

                {showCourse && (
                  <div className="space-y-6">
                    {/* Course Navigation */}
                    <div className="flex border-b border-[#E5E5E5] text-xs overflow-x-auto pb-px gap-1">
                      {["Module 1: Validation & SEO", "Module 2: High-Speed AI Ebook Writing", "Module 3: Affiliate Recruiting Machine"].map((modName, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveCourseMod(idx)}
                          className={`px-4 py-3 font-serif font-bold italic transition-all shrink-0 ${
                            activeCourseMod === idx
                              ? "border-b-2 border-[#2C3E50] text-[#2C3E50]"
                              : "text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          {modName}
                        </button>
                      ))}
                    </div>

                    {/* Active Module Panel content */}
                    {activeCourseMod === 0 && (
                      <div className="space-y-4 animate-fadeIn text-xs leading-relaxed text-slate-600">
                        <div className="p-5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl space-y-2">
                          <h4 className="font-serif font-bold italic text-[#2C3E50] text-sm flex items-center gap-1.5 pb-2 border-b border-[#F0F0F0]">
                            <CheckSquare className="w-4 h-4 text-[#2C3E50]" /> Unit 1.1: Audience Demand Research
                          </h4>
                          <p className="pt-1">
                            To successfully launch an intermediate marketing eBook, we search for specific high-intent search phrases where customers are actively frustrated. Avoid broad tags like "marketing", instead target: "funnels for freelancers", "eCommerce copywriting checklists", or "programmatic SEO guides".
                          </p>
                          <p className="font-bold text-[#2C3E50] mt-3">📖 Study Action Tasks:</p>
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                            <li>Identify 3 target competitor books in the Kindle Store.</li>
                            <li>Analyze bad 2-star or 3-star reviews for structural content gaps.</li>
                          </ul>
                        </div>

                        {/* QUIZ */}
                        <div className="border border-[#E5E5E5] rounded-2xl p-6 space-y-4 bg-white/70 shadow-sm">
                          <p className="font-serif italic font-bold text-[#2C3E50] text-sm">📝 Module 1 Checkpoint Quiz:</p>
                          <p className="text-[#2C3E50] font-bold">Q: {quizzes[0].q}</p>
                          <div className="space-y-2.5">
                            {quizzes[0].opts.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => handleSelectQuiz(0, oIdx)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-colors ${
                                  quizAnswers[0] === String(oIdx)
                                    ? "bg-[#FAF9F6] border-[#2C3E50] text-[#2C3E50] font-bold shadow-sm"
                                    : "bg-white hover:bg-slate-50 border-slate-200"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          {!quizSubmitted[0] ? (
                            <button
                              onClick={() => submitQuiz(0)}
                              disabled={quizAnswers[0] === undefined}
                              className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest text-[10px] uppercase shadow-md disabled:opacity-50"
                            >
                              Submit Checkpoint Answer
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
                              {quizResult[0] ? (
                                <>⭐ Grade: CORRECT! Standard 70% royalties paired with upsells is the elite model.</>
                              ) : (
                                <>❌ Grade: INCORRECT. Try again to lock in maximum profit configurations.</>
                              )}
                              <button
                                onClick={() => {
                                  setQuizSubmitted(prev => ({ ...prev, [0]: false }));
                                }}
                                className="underline font-bold text-teal-800 ml-auto"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeCourseMod === 1 && (
                      <div className="space-y-4 animate-fadeIn text-xs leading-relaxed text-slate-600">
                        <div className="p-5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl space-y-2">
                          <h4 className="font-serif font-bold italic text-[#2C3E50] text-sm flex items-center gap-1.5 pb-2 border-b border-[#F0F0F0]">
                            <Book className="w-4 h-4 text-[#2C3E50]" /> Unit 2.1: Structuring Chapter Modules
                          </h4>
                          <p className="pt-1">
                            When writing, organize chapters to address single, complete solutions. Keep eBook lengths practical (approx 40-70 pages) so intermediate practitioners can rapidly read, extract checklists, and take action. 
                          </p>
                          <p className="font-bold text-[#2C3E50] mt-3">📖 Study Action Tasks:</p>
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                            <li>Open the Digital Maker AI eBook Writer (https://digitalmaker.ai/digital-maker/ebook).</li>
                            <li>Configure 5 to 7 outlined modules with concise takeaways.</li>
                          </ul>
                        </div>

                        {/* QUIZ */}
                        <div className="border border-[#E5E5E5] rounded-2xl p-6 space-y-4 bg-white/70 shadow-sm">
                          <p className="font-serif italic font-bold text-[#2C3E50] text-sm">📝 Module 2 Checkpoint Quiz:</p>
                          <p className="text-[#2C3E50] font-bold">Q: {quizzes[1].q}</p>
                          <div className="space-y-2.5">
                            {quizzes[1].opts.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => handleSelectQuiz(1, oIdx)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-colors ${
                                  quizAnswers[1] === String(oIdx)
                                    ? "bg-[#FAF9F6] border-[#2C3E50] text-[#2C3E50] font-bold shadow-sm"
                                    : "bg-white hover:bg-slate-50 border-slate-200"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          {!quizSubmitted[1] ? (
                            <button
                              onClick={() => submitQuiz(1)}
                              disabled={quizAnswers[1] === undefined}
                              className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest text-[10px] uppercase shadow-md disabled:opacity-50"
                            >
                              Submit Checkpoint Answer
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
                              {quizResult[1] ? (
                                <>⭐ Grade: CORRECT! Digital Maker AI is the ultimate asset compiler.</>
                              ) : (
                                <>❌ Grade: INCORRECT. Re-read step details to optimize your workflows.</>
                              )}
                              <button
                                onClick={() => {
                                  setQuizSubmitted(prev => ({ ...prev, [1]: false }));
                                }}
                                className="underline font-bold text-teal-800 ml-auto"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeCourseMod === 2 && (
                      <div className="space-y-4 animate-fadeIn text-xs leading-relaxed text-slate-600">
                        <div className="p-5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl space-y-2">
                          <h4 className="font-serif font-bold italic text-[#2C3E50] text-sm flex items-center gap-1.5 pb-2 border-b border-[#F0F0F0]">
                            <Award className="w-4 h-4 text-[#2C3E50]" /> Unit 3.1: Pitching Niche Influencers
                          </h4>
                          <p className="pt-1">
                            Top-tier affiliates are highly selective. Focus your copy around simple, immediate value mechanics. Always give them pre-packaged, copyable materials so they can promote in under 30 seconds.
                          </p>
                          <p className="font-bold text-[#2C3E50] mt-3">📖 Study Action Tasks:</p>
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                            <li>Set up automated 40% signups inside Stan Store.</li>
                            <li>Send 5 tester review copies to your pre-listed influencer panel.</li>
                          </ul>
                        </div>

                        {/* QUIZ */}
                        <div className="border border-[#E5E5E5] rounded-2xl p-6 space-y-4 bg-white/70 shadow-sm">
                          <p className="font-serif italic font-bold text-[#2C3E50] text-sm">📝 Module 3 Checkpoint Quiz:</p>
                          <p className="text-[#2C3E50] font-bold">Q: {quizzes[2].q}</p>
                          <div className="space-y-2.5">
                            {quizzes[2].opts.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => handleSelectQuiz(2, oIdx)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-colors ${
                                  quizAnswers[2] === String(oIdx)
                                    ? "bg-[#FAF9F6] border-[#2C3E50] text-[#2C3E50] font-bold shadow-sm"
                                    : "bg-white hover:bg-slate-50 border-slate-200"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          {!quizSubmitted[2] ? (
                            <button
                              onClick={() => submitQuiz(2)}
                              disabled={quizAnswers[2] === undefined}
                              className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest text-[10px] uppercase shadow-md disabled:opacity-50"
                            >
                              Submit Checkpoint Answer
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
                              {quizResult[2] ? (
                                <>⭐ Grade: CORRECT! Audio companions are premium upsells that capture maximum revenues.</>
                              ) : (
                                <>❌ Grade: INCORRECT. Upgrades are highly valuable to scaling publishers.</>
                              )}
                              <button
                                onClick={() => {
                                  setQuizSubmitted(prev => ({ ...prev, [2]: false }));
                                }}
                                className="underline font-bold text-teal-800 ml-auto"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>

            </div>
          )}

          {/* Stepper controls */}
          <div className="flex justify-between items-center bg-white p-5 border border-[#E5E5E5] rounded-3xl shadow-sm text-xs">
            <button
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="px-6 py-2.5 border border-slate-300 rounded-full font-bold uppercase text-[10px] tracking-wider hover:bg-[#FAF9F6] transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              ⬅️ Previous Phase
            </button>
            <div className="text-slate-400 font-serif italic font-bold">
              Phase {activeStep + 1} of 7 Complete
            </div>
            {activeStep < 6 ? (
              <button
                onClick={handleProceedNext}
                className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest text-[10px] uppercase shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer"
              >
                Next Phase <ChevronRight className="w-3 h-3 inline-block ml-0.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveStep(0);
                  setMaxUnlockedStep(0);
                }}
                className="px-6 py-2.5 bg-slate-100 hover:bg-[#FAF9F6] text-slate-800 hover:text-[#2C3E50] rounded-full font-bold tracking-widest text-[10px] uppercase transition-all border border-[#E5E5E5] cursor-pointer"
              >
                🔄 Restart Roadmap
              </button>
            )}
          </div>

        </section>

      </main>

      <footer className="border-t border-[#E5E5E5] mt-24 bg-[#FAF9F6] py-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-4 px-4">
          <p className="font-serif italic font-bold text-slate-800 text-sm">© 2026 Digital Product Business Advisor</p>
          <p className="text-xs text-slate-400">Crafted with pristine Artistic Flair styling for digital creators.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-500 font-medium pt-2">
            <a href="https://digitalmaker.ai/digital-maker/ebook" target="_blank" referrerPolicy="no-referrer" className="hover:text-black transition-colors">eBook Writer</a>
            <span>•</span>
            <a href="https://digitalmaker.ai/image-maker" target="_blank" referrerPolicy="no-referrer" className="hover:text-black transition-colors">Image Maker</a>
            <span>•</span>
            <a href="https://digitalmaker.ai/tools/website-builder" target="_blank" referrerPolicy="no-referrer" className="hover:text-black transition-colors">Website Builder</a>
            <span>•</span>
            <a href="https://elevenlabs.io/" target="_blank" referrerPolicy="no-referrer" className="hover:text-black transition-colors">ElevenLabs</a>
            <span>•</span>
            <a href="https://bit.ly/StanStoreDirect" target="_blank" referrerPolicy="no-referrer" className="hover:text-black transition-colors">Stan Store</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
