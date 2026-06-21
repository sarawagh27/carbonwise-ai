import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./AppContext";
import Sidebar from "./components/Sidebar";
import OnboardingView from "./components/OnboardingView";
import DashboardView from "./components/DashboardView";
import TrackerView from "./components/TrackerView";
import CalculatorView from "./components/CalculatorView";
import CoachView from "./components/CoachView";
import ReceiptView from "./components/ReceiptView";
import InsightsView from "./components/InsightsView";
import ChallengesView from "./components/ChallengesView";
import ProfileView from "./components/ProfileView";
import { motion } from "motion/react";
import { 
  Leaf, 
  Sparkles, 
  LogIn, 
  Smartphone, 
  Compass, 
  UserPlus, 
  Flame,
  QrCode,
  Activity,
  Globe,
  Lock,
  Check,
  ShieldCheck,
  Camera,
  LineChart
} from "lucide-react";

// Environmental floating particles represent live natural/ecological markers
const floatingParticles = [
  { id: 1, size: 3, left: 15, top: 25, duration: 18, delay: 0 },
  { id: 2, size: 4, left: 45, top: 15, duration: 22, delay: 1.5 },
  { id: 3, size: 2, left: 75, top: 30, duration: 28, delay: 0.5 },
  { id: 4, size: 5, left: 28, top: 65, duration: 20, delay: 3 },
  { id: 5, size: 3, left: 60, top: 75, duration: 24, delay: 1 },
  { id: 6, size: 4, left: 82, top: 55, duration: 26, delay: 2 },
  { id: 7, size: 2, left: 10, top: 48, duration: 16, delay: 4 },
  { id: 8, size: 3, left: 52, top: 42, duration: 20, delay: 2.5 }
];

// Simplified, clean climate network node coordinates on the globe
const networkNodes = [
  { id: 1, name: "Global Sustainability Network", top: "25%", left: "42%" },
  { id: 2, name: "Sustainability Advisory", top: "54%", left: "64%" },
  { id: 3, name: "Live Emissions Signals", top: "38%", left: "18%" }
];

function RootApp() {
  const { 
    profile, 
    loading, 
    authError,
    activePage, 
    signIn, 
    startAsGuest 
  } = useApp();
  const [guestName, setGuestName] = useState("");
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const statusTexts = [
    "Tracking Sustainability Patterns",
    "Analyzing Receipt Emissions",
    "Monitoring Transport Impact",
    "Generating AI Recommendations"
  ];
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusTexts.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-6 text-center animate-pulse">
        <div className="w-12 h-12 rounded-full bg-emerald-50 relative flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <Leaf className="text-emerald-500 animate-spin" size={24} />
        </div>
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Synchronizing Eco Profile...</h3>
      </div>
    );
  }

  // Not logged in -> Render login screen
  if (!profile) {
    return (
      <div className="w-full md:h-screen md:overflow-hidden bg-white flex flex-col md:flex-row select-none">
        
        {/* LEFT SIDE (55-60%): Earth Rotating Cinematic Video Panel */}
        <div className="relative w-full md:w-[55%] h-[380px] md:h-full bg-neutral-950 flex flex-col justify-between p-8 md:p-14 overflow-hidden shrink-0">
          
          {/* Earth Video background */}
          <div className="absolute inset-0 z-0 bg-neutral-950">
            {/* Background Image Fallback for instant rendering */}
            <motion.img
              src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1200"
              alt="Earth from deep space fallback"
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 brightness-[1.25] contrast-[1.05] saturate-[1.05] ${
                videoLoaded ? "opacity-30" : "opacity-75"
              }`}
            />
            {/* Live Slow Rotating Earth Loop Video */}
            <video
              src="https://assets.mixkit.co/videos/preview/mixkit-planet-earth-rotating-in-space-7170-large.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadedData={() => setVideoLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 brightness-[1.25] contrast-[1.05] saturate-[1.05] ${
                videoLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          {/* Smooth modern ecological atmospheric glow & darkness gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-black/50 via-transparent to-neutral-950/20 pointer-events-none z-1" />
          <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none z-1" />
          
          {/* Soft atmospheric green glow around Earth - Multiple Premium Layers */}
          <div className="absolute top-[12%] left-[4%] w-[320px] h-[320px] md:w-[750px] md:h-[750px] bg-emerald-500/[0.05] blur-[150px] rounded-full pointer-events-none z-1" />
          <div className="absolute top-[18%] left-[8%] w-[250px] h-[250px] md:w-[550px] md:h-[550px] bg-emerald-500/18 blur-[90px] md:blur-[120px] rounded-full pointer-events-none z-1 animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute top-[24%] left-[15%] w-[180px] h-[180px] md:w-[400px] md:h-[400px] bg-emerald-400/[0.08] blur-[60px] rounded-full pointer-events-none z-1" />

          {/* Orbiting transparent sustainability rings */}
          <div className="absolute inset-0 pointer-events-none z-1 flex items-center justify-center overflow-hidden" style={{ perspective: "1000px" }}>
            <motion.div 
              className="absolute border border-emerald-500/15 w-[320px] h-[160px] md:w-[640px] md:h-[320px] rounded-full"
              style={{ transform: "rotateX(72deg) rotateY(-18deg) rotateZ(0deg)" }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            />
            <motion.div 
              className="absolute border border-emerald-500/5 w-[420px] h-[210px] md:w-[820px] md:h-[410px] rounded-full"
              style={{ transform: "rotateX(66deg) rotateY(12deg) rotateZ(0deg)" }}
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            />
          </div>

          {/* AI scan sweep every 8 seconds */}
          <motion.div 
            className="absolute left-0 right-0 h-[120px] bg-gradient-to-b from-transparent via-emerald-500/[0.06] to-transparent pointer-events-none z-2"
            initial={{ y: "-100%" }}
            animate={{ y: "1000%" }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
          </motion.div>

          {/* Top Row: Brand Trust Badge (Google Gemini Integration) */}
          <div className="relative z-10 flex justify-between items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-300 tracking-wider">
              <Sparkles className="text-emerald-400 animate-pulse" size={12} />
              <span>Powered by Google Gemini</span>
            </div>
            
            <div className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase hidden lg:block">
              Climate Intelligence Hub
            </div>
          </div>

          {/* Subtle moving data connections around the globe (SVG arcs linking nodes) */}
          <div className="absolute inset-0 z-5 pointer-events-none">
            <svg className="w-full h-full opacity-[0.25]" viewBox="0 0 800 600" preserveAspectRatio="none">
              <g stroke="#10b981" strokeWidth="1.2" fill="none">
                {/* Connection between Global Sustainability Network and AI Sustainability Intelligence */}
                <motion.path 
                  d="M 336,150 Q 424,200 512,324"
                  strokeDasharray="4,4"
                  animate={{ strokeDashoffset: [100, 0] }}
                  transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
                />
                {/* Connection between Live Climate Signals and Global Sustainability Network */}
                <motion.path 
                  d="M 144,228 Q 240,160 336,150"
                  strokeDasharray="5,5"
                  animate={{ strokeDashoffset: [-120, 0] }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                />
                {/* Connection between Live Climate Signals and AI Sustainability Intelligence */}
                <motion.path 
                  d="M 144,228 Q 328,340 512,324"
                  strokeDasharray="6,6"
                  animate={{ strokeDashoffset: [120, 0] }}
                  transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
                />
              </g>
            </svg>

            {/* Glowing Sensor Nodes around Earth (Replaced custom telemetry labels with clean ones) */}
            {networkNodes.map((n) => (
              <div 
                key={n.id} 
                className="absolute hidden md:block select-none"
                style={{ top: n.top, left: n.left }}
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-60 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  <div className="absolute left-3 ml-1 bg-black/50 border border-emerald-500/15 rounded px-2 py-1 text-[9px] font-medium text-emerald-300 backdrop-blur-xs whitespace-nowrap leading-none shadow-xs font-sans">
                    <span className="font-semibold tracking-wide">{n.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Floating environmental particles without text, gracefully drifting */}
          <div className="absolute inset-0 pointer-events-none z-5">
            {floatingParticles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute bg-emerald-400/40 rounded-full blur-[0.5px] shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                style={{
                  width: p.size,
                  height: p.size,
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                }}
                animate={{
                  y: ["0px", "-45px", "0px"],
                  x: ["0px", "15px", "0px"],
                  opacity: [0.15, 0.65, 0.15],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Bottom Row: CarbonWise AI Quote Headline Overlay */}
          <div className="relative z-10 space-y-3.5 max-w-md mt-auto mb-4 md:mb-8 text-left drop-shadow-sm">
            
            {/* Dynamic Status Text cycling with elegant fade */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-bold text-emerald-400 font-mono tracking-wide">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
              </span>
              <motion.span
                key={statusIndex}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.3 }}
              >
                {statusTexts[statusIndex]}
              </motion.span>
            </div>

            <div className="space-y-1.5">
              <span className="text-emerald-400 uppercase text-xs font-bold tracking-wider block font-mono">
                CarbonWise AI
              </span>
              <h2 className="text-3.5xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
                Measure. Understand. Reduce.
              </h2>
            </div>
            <p className="text-sm md:text-base text-neutral-200/90 leading-relaxed font-semibold">
              AI-powered sustainability tracking for everyday life.
            </p>
          </div>

        </div>

        {/* RIGHT SIDE (40-45%): Clean, Premium White Login Panel */}
        <div className="w-full md:w-[45%] bg-neutral-50/20 flex flex-col justify-center items-center p-6 md:p-8 lg:p-12 h-auto md:h-full overflow-y-auto shrink-0">
          <div className="w-full min-w-[320px] sm:min-w-[380px] max-w-[460px] bg-white border border-neutral-100 shadow-[0_12px_40px_rgba(0,0,0,0.02)] rounded-3xl p-6 sm:p-8 space-y-6 md:space-y-7 relative overflow-hidden text-center md:text-left mx-auto">
            
            {/* Elegant minimalist background trace blobs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.015] rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/[0.015] rounded-tr-full pointer-events-none" />

            {/* WELCOME TO CARBONWISE AI TITLE */}
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm select-none">
                  <Leaf size={16} />
                </div>
                <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest font-mono">CarbonWise AI</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-tight pt-1 text-balance">
                Welcome to CarbonWise AI
              </h3>
              <p className="text-xs text-neutral-550 leading-relaxed font-bold">
                Track your carbon footprint, build sustainable habits, and receive AI-powered environmental insights.
              </p>
            </div>

            {/* CTAs SECTION */}
            <div className="space-y-3.5">
              
              {/* Primary Google Login */}
              <button
                type="button"
                onClick={() => signIn()}
                className="w-full flex items-center justify-center gap-3 bg-white text-neutral-800 font-bold text-xs py-3.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 hover:shadow-xs hover:-translate-y-px active:translate-y-0 active:shadow-none transition-all duration-150 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {authError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-left text-[11px] font-semibold leading-relaxed text-red-700">
                  {authError}
                </div>
              )}

              {/* Guest Login panel */}
              {!showDemoForm ? (
                <button
                  type="button"
                  onClick={() => setShowDemoForm(true)}
                  className="w-full text-xs text-emerald-700 font-bold hover:text-emerald-800 hover:underline cursor-pointer py-1.5 transition-colors duration-150 text-center animate-fade-in"
                >
                  Continue as Guest
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-50/15 rounded-2xl border border-emerald-100/50 space-y-3 text-left"
                >
                  <label htmlFor="guest-name-input" className="block text-xs font-bold text-emerald-800 tracking-wide">
                    Choose a Display Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="guest-name-input"
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Eco Explorer"
                      className="flex-1 px-3.5 py-1.5 rounded-xl border border-emerald-100 outline-none text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => startAsGuest(guestName || "Eco Explorer")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-4 py-1.5 rounded-xl transition-all hover:shadow-xs cursor-pointer shrink-0"
                    >
                      Start
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Privacy Protection guarantee text */}
            <div className="flex gap-2 px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-100 select-none items-center">
              <ShieldCheck className="text-emerald-600 shrink-0" size={13} />
              <p className="text-[10px] text-neutral-500 font-medium leading-relaxed text-left">
                CarbonWise AI encrypts all environmental logs locally. Private and secure.
              </p>
            </div>

            {/* DIVIDER */}
            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t border-neutral-100"></div>
              <span className="flex-shrink mx-3 text-[9px] uppercase tracking-widest font-extrabold text-neutral-400 select-none">Ecosystem Features</span>
              <div className="flex-grow border-t border-neutral-100"></div>
            </div>

            {/* Features list (strictly limited to 3 items) */}
            <div className="grid grid-cols-1 gap-3 text-left">
              
              {/* Feature 1 */}
              <div className="flex items-start gap-3 p-3 bg-neutral-50/50 rounded-2xl border border-neutral-100/50 hover:border-emerald-100/70 hover:bg-neutral-50 transition-all">
                <div className="text-lg select-none leading-none pt-0.5">🌱</div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-neutral-800">Carbon Footprint Tracking</h4>
                  <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold">
                    Track transport, food, shopping and energy impact.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3 p-3 bg-neutral-50/50 rounded-2xl border border-neutral-100/50 hover:border-emerald-100/70 hover:bg-neutral-50 transition-all">
                <div className="text-lg select-none leading-none pt-0.5">🧾</div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-neutral-800">Receipt Carbon Analysis</h4>
                  <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold">
                    Scan receipts and estimate carbon emissions.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3 p-3 bg-neutral-50/50 rounded-2xl border border-neutral-100/50 hover:border-emerald-100/70 hover:bg-neutral-50 transition-all">
                <div className="text-lg select-none leading-none pt-0.5">🤖</div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-neutral-800">AI Sustainability Coach</h4>
                  <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold">
                    Receive personalized recommendations and insights.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    );
  }

  // Logged in but not onboarded -> Render onboarding questionnaire wizard
  if (!profile.onboarded) {
    return <OnboardingView />;
  }

  // Logged in + onboarded -> Render standard full screen layout with sidebar
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-stone-50/15">
      
      {/* Dynamic left sidebar navigation */}
      <Sidebar />

      {/* Main scrolling content frame pages selection */}
      <main className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
        {activePage === "dashboard" && <DashboardView />}
        {activePage === "tracker" && <TrackerView />}
        {activePage === "calculator" && <CalculatorView />}
        {activePage === "coach" && <CoachView />}
        {activePage === "receipt" && <ReceiptView />}
        {activePage === "insights" && <InsightsView />}
        {activePage === "challenges" && <ChallengesView />}
        {activePage === "profile" && <ProfileView />}
      </main>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RootApp />
    </AppProvider>
  );
}
