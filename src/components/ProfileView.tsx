import React, { useState } from "react";
import { motion } from "motion/react";
import { useApp } from "../AppContext";
import { 
  UserRound, 
  MapPin, 
  Calendar, 
  Flame, 
  Activity, 
  RotateCcw,
  Badge,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Award,
  Zap,
  Car,
  Utensils,
  ShoppingBag,
  Info,
  Lock,
  Compass,
  Sprout,
  ScanLine,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Trophy
} from "lucide-react";

export default function ProfileView() {
  const { profile, activities, achievements, challenges, resetAllData, updateLocation } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [cityInput, setCityInput] = useState(profile?.city || "");
  const [countryInput, setCountryInput] = useState(profile?.country || "");
  const [detecting, setDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!profile) return null;

  const handleAutoDetect = async () => {
    setDetecting(true);
    setDetectionError("");
    setSuccessMsg("");

    const fetchIPLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.city && data.country_name) {
            setCityInput(data.city);
            setCountryInput(data.country_name);
            await updateLocation(data.city, data.country_name);
            setSuccessMsg("Location auto-detected and updated successfully!");
            return true;
          }
        }
      } catch (err) {
        console.error("IP Geolocator failed:", err);
      }
      return false;
    };

    if (!navigator.geolocation) {
      const ok = await fetchIPLocation();
      if (!ok) {
        setDetectionError("Location detection is not supported on this device.");
      }
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (response.ok) {
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "";
            const country = data.address.country || "";
            if (city && country) {
              setCityInput(city);
              setCountryInput(country);
              await updateLocation(city, country);
              setSuccessMsg("Location auto-detected and updated successfully!");
              setDetecting(false);
              return;
            }
          }
          const ok = await fetchIPLocation();
          if (!ok) {
            setDetectionError("Could not resolve coordinates. Please enter manually.");
          }
        } catch (err) {
          const ok = await fetchIPLocation();
          if (!ok) {
            setDetectionError("Coordinates resolution failed. Please enter manually.");
          }
        }
        setDetecting(false);
      },
      async (err) => {
        const ok = await fetchIPLocation();
        if (!ok) {
          setDetectionError("Permission denied or timed out. Please enter manually.");
        }
        setDetecting(false);
      },
      { timeout: 7000, enableHighAccuracy: false }
    );
  };

  const handleSaveLocation = async () => {
    if (!cityInput.trim() || !countryInput.trim()) {
      setDetectionError("Both City and Country are required.");
      return;
    }
    setDetecting(true);
    setDetectionError("");
    setSuccessMsg("");
    try {
      await updateLocation(cityInput, countryInput);
      setSuccessMsg("Location saved successfully!");
      setIsEditing(false);
    } catch (e) {
      setDetectionError("Failed to update profile location choice.");
    }
    setDetecting(false);
  };

  const handleHardReset = () => {
    if (window.confirm("CRITICAL WARNING: This will hard reset all your onboarding habits, carbon history logs, streak statistics, and challenge completions. This cannot be undone! Proceed?")) {
      resetAllData();
      window.location.reload();
    }
  };

  // Determine dynamic eco-sensory contextual location metrics
  const getClimateContext = (city: string, country: string) => {
    const c = (city || "").toLowerCase();
    const co = (country || "").toLowerCase();
    
    if (c.includes("oslo") || co.includes("no") || co.includes("norway")) {
      return {
        aqi: "14 (Excellent)",
        aqiColor: "text-emerald-600 bg-emerald-50",
        grid: "12g CO₂/kWh (Hydro-Dominant Grid)",
        gridColor: "text-emerald-700 bg-emerald-50 border-emerald-100",
        context: "Norway's electricity grid is almost entirely hydro-powered. Direct electric consumption is extremely green! Focus on reducing direct fossil fuel combustion in private transportation and aviation for maximum real-world footprint savings."
      };
    } else if (c.includes("tokyo") || co.includes("jp") || co.includes("japan")) {
      return {
        aqi: "52 (Moderate)",
        aqiColor: "text-amber-600 bg-amber-50",
        grid: "410g CO₂/kWh (Gas-Coal Mixed Grid)",
        gridColor: "text-neutral-700 bg-neutral-50 border-neutral-200",
        context: "The Kanto electrical grid relies primarily on LNG and coal generation. We recommend setting energy-efficient temperatures on climate controls and shifting laundry or charging cycles to avoid evening grids peak periods."
      };
    } else if (c.includes("francisco") || c.includes("sf") || c.includes("california") || co.includes("us") || co.includes("united states") || co.includes("america")) {
      return {
        aqi: "38 (Good)",
        aqiColor: "text-emerald-600 bg-emerald-50",
        grid: "185g CO₂/kWh (High Solar Energy Grid)",
        gridColor: "text-amber-700 bg-amber-50 border-amber-100",
        context: "California has a massive midday solar energy generation surplus. Scheduling electricity consumption (such as washing machines, EV charging, or dishwashers) between 10 AM and 3 PM lets you direct-feed straight off carbon-free solar peaks!"
      };
    } else {
      return {
        aqi: "34 (Good)",
        aqiColor: "text-emerald-600 bg-emerald-50",
        grid: "380g CO₂/kWh (Fossil-Renewable Standard Blend)",
        gridColor: "text-gray-700 bg-gray-50 border-gray-100",
        context: "Standard mixed municipal power grid. General best practices apply: reducing home standby phantom loads and preferring public/shared transport over solo fuel journeys deliver your largest sustainable carbon savings."
      };
    }
  };

  const climate = getClimateContext(profile.city, profile.country);

  // Stats aggregation
  const achievementsCount = achievements.filter(a => !!a.unlockedAt).length;
  const totalCarbonTracked = activities.reduce((sum, a) => sum + a.emissionKg, 0);

  // Sector calculations
  const transportEmissions = activities.filter(a => a.category === "Transportation").reduce((s, a) => s + a.emissionKg, 0);
  const foodEmissions = activities.filter(a => a.category === "Food").reduce((s, a) => s + a.emissionKg, 0);
  const energyEmissions = activities.filter(a => a.category === "Energy").reduce((s, a) => s + a.emissionKg, 0);
  const shoppingEmissions = activities.filter(a => a.category === "Shopping" || a.category === "Waste").reduce((s, a) => s + a.emissionKg, 0);
  const grandTotal = transportEmissions + foodEmissions + energyEmissions + shoppingEmissions;

  // Percentage calculations (fall back to baseline answers estimates if no logs)
  const hasLogs = activities.length > 0;
  const transportPct = hasLogs ? (transportEmissions / (grandTotal || 1)) * 100 : 40;
  const foodPct = hasLogs ? (foodEmissions / (grandTotal || 1)) * 100 : 25;
  const energyPct = hasLogs ? (energyEmissions / (grandTotal || 1)) * 100 : 20;
  const shoppingPct = hasLogs ? (shoppingEmissions / (grandTotal || 1)) * 100 : 15;

  // Sustainability Score radial dial metrics
  const score = profile.sustainabilityScore || 80;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Grade interpretation
  const getScoreGrade = (s: number) => {
    if (s >= 90) return { label: "A+ Carbon Champion", desc: "Elite low-impact footprint", color: "text-emerald-600" };
    if (s >= 80) return { label: "A Green Guardian", desc: "Highly optimized habits", color: "text-emerald-600" };
    if (s >= 65) return { label: "B Eco Practitioner", desc: "Making reliable compromises", color: "text-amber-600" };
    return { label: "C Active Learner", desc: "Significant reduction opportunities", color: "text-neutral-500" };
  };
  const grade = getScoreGrade(score);

  // Next Milestone determination
  const nextMilestone = () => {
    // Find first locked badge
    const nextBadge = achievements.find(a => !a.unlockedAt);
    if (nextBadge) {
      let advice = "";
      if (nextBadge.achievementId === "ach_first_track") advice = "Try speaking or typing your first daily trip under the AI Tracker page!";
      if (nextBadge.achievementId === "ach_streak_3") advice = "Keep logging and monitoring your habits for 3 consecutive days.";
      if (nextBadge.achievementId === "ach_challenge_king") advice = "Browse active challenges on the Challenges page and mark any as complete!";
      if (nextBadge.achievementId === "ach_receipt_scan") advice = "Navigate to the Receipt Scanner to parse a retail receipt using camera images or mock scans.";
      
      return {
        title: nextBadge.title,
        desc: nextBadge.description,
        advice,
        badgeId: nextBadge.achievementId
      };
    }
    return {
      title: "All Badges Unlocked!",
      desc: "You have verified all climate master badges.",
      advice: "Keep up your daily streak to preserve your Green Champion level!",
      badgeId: "complete"
    };
  };

  const targetMilestone = nextMilestone();

  // Personal Sustainability Journey Timeline interface & event compilation
  interface TimelineEvent {
    id: string;
    type: "action" | "badge" | "challenge";
    title: string;
    description: string;
    timestamp: string;
    points?: number;
    emissionKg?: number;
    category?: string;
    icon?: string;
  }

  const completedChallengeEvents: TimelineEvent[] = challenges
    .filter(c => c.completed)
    .map(c => ({
      id: `challenge-${c.challengeId}`,
      type: "challenge",
      title: `Challenge Smashed`,
      description: `Completed the "${c.title}" carbon reduction challenge for +${c.points} XP.`,
      timestamp: c.completedAt || profile.joinedAt || new Date().toISOString(),
      points: c.points,
      category: c.category,
    }));

  const unlockedBadgeEvents: TimelineEvent[] = achievements
    .filter(a => !!a.unlockedAt)
    .map(a => ({
      id: `badge-${a.achievementId}`,
      type: "badge",
      title: `Badge Secured`,
      description: `Earned the "${a.title}" credentials: ${a.description}.`,
      timestamp: a.unlockedAt,
      icon: a.icon,
    }));

  const loggedActivitiesEvents: TimelineEvent[] = activities
    .map(act => ({
      id: `activity-${act.activityId}`,
      type: "action",
      title: `Action Recorded`,
      description: `${act.description} (Impact: ${act.emissionKg.toFixed(1)} kg CO₂).`,
      timestamp: act.timestamp,
      emissionKg: act.emissionKg,
      category: act.category,
    }));

  const timelineEvents = [
    ...completedChallengeEvents,
    ...unlockedBadgeEvents,
    ...loggedActivitiesEvents
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // Helper to render badge icons nicely
  const renderBadgeIcon = (iconName: string, unlocked: boolean) => {
    const cls = unlocked ? "text-emerald-600" : "text-gray-400";
    switch (iconName) {
      case "Sprout":
        return <Sprout className={cls} size={18} />;
      case "Compass":
        return <Compass className={cls} size={18} />;
      case "Flame":
        return <Flame className={cls} size={18} />;
      case "ShieldAlert":
        return <Award className={cls} size={18} />;
      case "ScanLine":
        return <ScanLine className={cls} size={18} />;
      default:
        return <Award className={cls} size={18} />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto min-h-screen pb-12 select-none">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Eco Profile</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest leading-none">
              Level: {profile.level}
            </span>
          </h2>
          <p className="text-sm text-gray-500 font-medium">Review your personalized milestone credentials, regional climate insights, and carbon log aggregates.</p>
        </div>
        
        <div className="flex gap-2">
          {profile.streak >= 2 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 text-xs font-bold text-amber-700">
              <Flame size={14} className="text-amber-500 shrink-0" />
              <span>{profile.streak} Day Tracker Streak</span>
            </div>
          )}
          <div className="text-[10.5px] text-gray-400 font-bold bg-gray-50 border border-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
            <Calendar size={12} />
            <span>Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* =========================================================================
            LEFT COLUMN: PERSONAL DOSSIER & LOCAL ATMOSPHERE SENSORY MODULE
           ========================================================================= */}
        <div className="md:col-span-1 space-y-6">
          
          {/* PROFILE CARD */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-sm select-none relative overflow-hidden shrink-0">
                {profile.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt={profile.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{profile.name[0]?.toUpperCase() || "E"}</span>
                )}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-800 border border-white font-bold z-10">✓</span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest font-mono block">Registered Pioneer</span>
                <h3 className="font-extrabold text-gray-900 text-base leading-tight truncate">{profile.name}</h3>
                <p className="text-[11px] text-gray-400 leading-tight truncate font-mono">{profile.email}</p>
              </div>
            </div>

            {/* User Preferences Quick-State */}
            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 space-y-2 text-xs">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Lifestyle Onboarding Profile</span>
              <div className="grid grid-cols-2 gap-2 text-[10.5px] font-semibold text-gray-700">
                <div className="bg-white px-2 py-1.5 rounded border border-gray-100/50">
                  <span className="text-[8px] text-gray-400 block font-normal">Dietary</span>
                  <span className="truncate block font-semibold">{profile.dietType || "Standard"}</span>
                </div>
                <div className="bg-white px-2 py-1.5 rounded border border-gray-100/50">
                  <span className="text-[8px] text-gray-400 block font-normal">Transport</span>
                  <span className="truncate block font-semibold">{profile.transportHabits || "Private Commuter"}</span>
                </div>
                <div className="bg-white px-2 py-1.5 rounded border border-gray-100/50">
                  <span className="text-[8px] text-gray-400 block font-normal">Household Grid</span>
                  <span className="truncate block font-semibold">{profile.energyUsage || "Awaiting detail"}</span>
                </div>
                <div className="bg-white px-2 py-1.5 rounded border border-gray-100/50">
                  <span className="text-[8px] text-gray-400 block font-normal">Carbon Target</span>
                  <span className="truncate block font-semibold text-emerald-700">{profile.baselineCarbon || "4.8"}t CO₂/yr</span>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC LOCATION INSIGHTS */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
              <span className="text-xs font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-600" />
                <span>Regional Atmosphere Data</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setDetectionError("");
                  setSuccessMsg("");
                }}
                className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                {isEditing ? "Cancel" : "Change"}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3 bg-neutral-50/50 p-3 rounded-xl border border-gray-100">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">City</label>
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      placeholder="Oslo / Tokyo / SF..."
                      className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Country</label>
                    <input
                      type="text"
                      value={countryInput}
                      onChange={(e) => setCountryInput(e.target.value)}
                      placeholder="Norway / Japan / US..."
                      className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSaveLocation}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-1.5 rounded-lg font-bold cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    disabled={detecting}
                    onClick={handleAutoDetect}
                    className="flex-1 bg-white hover:bg-neutral-50 border border-gray-200 text-gray-700 text-[10px] py-1.5 rounded-lg font-bold cursor-pointer flex items-center justify-center gap-1"
                  >
                    {detecting ? "Locating..." : "Auto-Detect"}
                  </button>
                </div>
                <div className="text-[9px] text-gray-400 leading-tight">
                  💡 Preservation preset tip: Try typing <span className="font-semibold text-neutral-600">"Oslo"</span>, <span className="font-semibold text-neutral-600">"Tokyo"</span>, or <span className="font-semibold text-neutral-600">"San Francisco"</span> to load highly specialized grid context modules instantly!
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Active City/Country Display */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50/20 to-neutral-50 rounded-xl border border-gray-100 text-xs text-gray-800 font-bold justify-between">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <Globe size={13} className="text-emerald-600 animate-spin" style={{ animationDuration: "12s" }} />
                    <span className="truncate">{profile.city || "San Francisco"}, {profile.country || "United States"}</span>
                  </div>
                  <button
                    onClick={handleAutoDetect}
                    disabled={detecting}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer shrink-0"
                    title="Reload Geo-Coordinates"
                  >
                    <Globe size={13} className={detecting ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>
            )}

            {/* Error / Success logs */}
            {detectionError && (
              <p className="text-[9px] font-medium text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 leading-tight">{detectionError}</p>
            )}
            {successMsg && (
              <p className="text-[9px] font-medium text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100 leading-tight">{successMsg}</p>
            )}

            {/* Atmos Context Parameters */}
            <div className="border-t border-gray-50 pt-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Local Air Quality</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${climate.aqiColor}`}>{climate.aqi}</span>
              </div>

              <div className="flex justify-between items-center bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Regional Grid Intensity</span>
                <span className="text-[9.5px] font-bold text-gray-800">{climate.grid}</span>
              </div>

              <div className="p-3 bg-emerald-50/[0.18] rounded-xl border border-emerald-50 text-[11px] text-gray-600 font-medium leading-relaxed space-y-1 text-left">
                <div className="flex items-center gap-1 text-emerald-800 font-bold uppercase text-[9px] tracking-wide">
                  <Info size={11} className="shrink-0" />
                  <span>Carbon-Reduction Opportunity Context</span>
                </div>
                <p className="leading-normal">{climate.context}</p>
              </div>
            </div>
          </div>

          {/* Hard Reset Card */}
          <div className="bg-red-50/10 p-4 border border-red-100/40 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5">
            <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-widest font-mono">Profile Administration</span>
            <p className="text-[10px] text-gray-400 font-medium leading-tight max-w-xs">Wipes your local browser database, habit streak metrics, and carbon tracking accounts completely.</p>
            <button
              onClick={handleHardReset}
              className="px-4 py-1.5 mt-1 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-[10px] font-extrabold transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw size={11} />
              <span>Reset All Application Logs</span>
            </button>
          </div>

        </div>

        {/* =========================================================================
            RIGHT COLUMN: PERSONAL DASHBOARD BENTO GRID
           ========================================================================= */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Bento Block 1: Real Score & Active Milestone Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Sustainability Score Card */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center gap-4">
              {/* Radial Score Meter SVG */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center select-none">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="text-neutral-100"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="32"
                    cy="32"
                  />
                  <motion.circle
                    className="text-emerald-500"
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: strokeDashoffset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="32"
                    cy="32"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black text-gray-900 tracking-tighter">{score}</span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase leading-none">Score</span>
                </div>
              </div>

              <div className="space-y-1 min-w-0">
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest font-mono">Sustainability Grading</span>
                <h4 className={`text-sm font-black tracking-tight ${grade.color}`}>{grade.label}</h4>
                <p className="text-[10.5px] text-gray-500 font-medium leading-none leading-relaxed">{grade.desc}</p>
              </div>
            </div>

            {/* Next Milestone Card */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest font-mono">Next Milestone Target</span>
                  <span className="text-[8.5px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">Locked</span>
                </div>
                <h4 className="text-xs font-black text-gray-800 flex items-center gap-1 pt-1">
                  <Award className="text-amber-500 shrink-0" size={13} />
                  <span className="truncate">{targetMilestone.title}</span>
                </h4>
                <p className="text-[10px] text-gray-400 font-semibold leading-relaxed truncate">{targetMilestone.desc}</p>
              </div>

              <div className="border-t border-gray-50 pt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1 leading-normal">
                <Sparkles size={11} className="shrink-0 text-amber-500" />
                <span className="line-clamp-1">{targetMilestone.advice}</span>
              </div>
            </div>

          </div>

          {/* Quick Counters Row */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest font-mono block">Total Emissions Saved</span>
              <div className="flex items-baseline gap-1 mt-1">
                {totalCarbonTracked === 0 ? (
                  <span className="text-[11px] font-semibold text-gray-400 italic py-1 block">Awaiting logs...</span>
                ) : (
                  <>
                    <span className="text-lg font-black text-gray-900">
                      {totalCarbonTracked.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">kg CO₂</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest font-mono block">Eco Badges Unlocked</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-gray-900">{achievementsCount}</span>
                <span className="text-[10px] text-gray-400 font-semibold">/ {achievements.length} Verified</span>
              </div>
            </div>

          </div>

          {/* SECTOR-WISE BREAKDOWN */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4">
            <div className="flex items-baseline justify-between border-b border-gray-50 pb-2.5">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                Sector-Wise Carbon Breakdown
              </h4>
              <span className="text-[10px] font-bold text-gray-400">
                {hasLogs ? "Live Data Breakdown" : "Projected Home Profile Baseline Estimate"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4.5 text-xs text-gray-700 font-normal">
              
              {/* Transport */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Car size={13} className="text-slate-500" />
                    <span>Transportation Commuting</span>
                  </span>
                  <span className="font-mono text-gray-500 font-bold">
                    {hasLogs ? `${transportEmissions.toFixed(1)} kg` : "Estimate: 40%"}
                  </span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden select-none">
                  <motion.div 
                    className="bg-sky-500 h-full rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${transportPct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Food */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Utensils size={13} className="text-emerald-500" />
                    <span>Food & Dietary Choices</span>
                  </span>
                  <span className="font-mono text-gray-500 font-bold">
                    {hasLogs ? `${foodEmissions.toFixed(1)} kg` : "Estimate: 25%"}
                  </span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden select-none">
                  <motion.div 
                    className="bg-emerald-500 h-full rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${foodPct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Energy */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Zap size={13} className="text-amber-500 animate-pulse" />
                    <span>Household Power Intensity</span>
                  </span>
                  <span className="font-mono text-gray-500 font-bold">
                    {hasLogs ? `${energyEmissions.toFixed(1)} kg` : "Estimate: 20%"}
                  </span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden select-none">
                  <motion.div 
                    className="bg-amber-500 h-full rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${energyPct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Shopping & Waste */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <ShoppingBag size={13} className="text-indigo-500" />
                    <span>Consumer Shopping Goods</span>
                  </span>
                  <span className="font-mono text-gray-500 font-bold">
                    {hasLogs ? `${shoppingEmissions.toFixed(1)} kg` : "Estimate: 15%"}
                  </span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden select-none">
                  <motion.div 
                    className="bg-indigo-500 h-full rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${shoppingPct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* LEDGER FEED OR GUIDED FIRST ACTIONS */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4">
            
            {!hasLogs ? (
              /* GUIDED ONBOARDING SYSTEM */
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-2.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                    Milestone Guide: Core Recommended Actions
                  </h4>
                </div>

                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Welcome to CarbonWise AI! Awaiting your first activity logs to auto-calibrate. Follow these highly recommended actions to calculate your first footprints:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* Step A */}
                  <div className="p-3 bg-neutral-50 hover:bg-neutral-100/60 rounded-xl border border-gray-100 transition-all flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-emerald-100">1</div>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-[11.5px] text-gray-800 leading-none">Voice Log Commuting</h5>
                      <p className="text-[10px] text-gray-400 font-medium leading-normal pt-1">
                        Open <span className="font-semibold text-emerald-800">AI Tracker</span> and speak: <span className="italic">"I cycled 5km and rode the subway for 12km."</span>
                      </p>
                    </div>
                  </div>

                  {/* Step B */}
                  <div className="p-3 bg-neutral-50 hover:bg-neutral-100/60 rounded-xl border border-gray-100 transition-all flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-emerald-100">2</div>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-[11.5px] text-gray-800 leading-none">Process Shopping Bills</h5>
                      <p className="text-[10px] text-gray-400 font-medium leading-normal pt-1">
                        Snapping bills in <span className="font-semibold text-emerald-800">Scanner</span> extracts grocery details and logs precise carbon emissions.
                      </p>
                    </div>
                  </div>

                  {/* Step C */}
                  <div className="p-3 bg-neutral-50 hover:bg-neutral-100/60 rounded-xl border border-gray-100 transition-all flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-emerald-100">3</div>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-[11.5px] text-gray-800 leading-none">Structured Computation</h5>
                      <p className="text-[10px] text-gray-400 font-medium leading-normal pt-1">
                        Toggle the <span className="font-semibold text-emerald-800">Calculator</span> tab to perform manual math on flights, utility bills, and food.
                      </p>
                    </div>
                  </div>

                  {/* Step D */}
                  <div className="p-3 bg-neutral-50 hover:bg-neutral-100/60 rounded-xl border border-gray-100 transition-all flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-emerald-100">4</div>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-[11.5px] text-gray-800 leading-none">Activate Challenges</h5>
                      <p className="text-[10px] text-gray-400 font-medium leading-normal pt-1">
                        Join eco pledges under <span className="font-semibold text-emerald-800">Active Challenges</span> to accumulate points and advance your level.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* DETAILED LOGGED ENTRIES FEED */
              <div className="space-y-3.5">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2.5">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Emissions Ledger Feed ({activities.length} entries)
                  </h4>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">Chronological Records</span>
                </div>
                
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {activities.map(act => (
                    <div key={act.activityId} className="p-3 bg-neutral-50 hover:bg-neutral-50/80 rounded-xl border border-gray-100/50 flex justify-between items-center text-xs transition-colors text-left leading-normal">
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{act.category}</span>
                          <span className="text-[9.5px] text-gray-400 font-semibold">{new Date(act.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <h5 className="font-black text-gray-850 leading-tight">{act.description}</h5>
                        {act.explanation && (
                          <p className="text-[10px] text-gray-400 font-medium leading-tight">{act.explanation}</p>
                        )}
                      </div>
                      <span className="font-black text-gray-900 whitespace-nowrap bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-3xs font-mono scale-95 md:scale-100">
                        {act.emissionKg.toFixed(1)} kg CO₂
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* =========================================================================
          SUSTAINABILITY JOURNEY TIMELINE
         ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-6 text-left">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={18} />
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase font-mono tracking-wider">Historical Progression</span>
          </div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mt-1">Sustainability Journey Timeline</h3>
          <p className="text-xs text-gray-450 font-medium mt-0.5">Your chronological milestone stream tracking logged habits, unlocked badges, and completed challenges.</p>
        </div>

        {timelineEvents.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-150 rounded-2xl bg-neutral-50/40">
            <p className="text-xs text-gray-450 font-bold">A journey of a thousand miles begins with a single step.</p>
            <p className="text-[10.5px] text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">Start logging your transportation/food habits, completing challenges, and earning achievement badges to populate your chronicle.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-100 ml-4 pl-6 space-y-6 pt-1">
            {timelineEvents.map((event, index) => {
              let iconBg = "bg-neutral-50 border-gray-200 text-gray-500";
              let iconElement = <Activity size={12} />;
              let typeLabel = "Action Logged";
              let badgeColor = "bg-gray-50 text-gray-600 border-gray-100";

              if (event.type === "badge") {
                iconBg = "bg-purple-50 border-purple-200 text-purple-600 shadow-[0_0_12px_rgba(139,92,246,0.15)]";
                iconElement = <Award size={12} />;
                typeLabel = "Badge Secured";
                badgeColor = "bg-purple-100 text-purple-800 border-purple-200/50";
              } else if (event.type === "challenge") {
                iconBg = "bg-amber-50 border-amber-200 text-amber-700 shadow-[0_0_12px_rgba(245,158,11,0.15)]";
                iconElement = <Trophy size={11} />;
                typeLabel = "Challenge Smashed";
                badgeColor = "bg-amber-100/80 text-amber-800 border-amber-200/50";
              } else {
                iconBg = "bg-emerald-50 border-emerald-200 text-emerald-600";
                iconElement = <CheckCircle2 size={12} />;
                typeLabel = "Action Logged";
                badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
              }

              return (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative group pr-2"
                >
                  {/* Timeline bullet handle */}
                  <div className={`absolute -left-[35px] top-1 w-6.5 h-6.5 rounded-full border flex items-center justify-center ${iconBg} z-10 transition-transform group-hover:scale-110 duration-200`}>
                    {iconElement}
                  </div>

                  <div className="bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100/60 hover:border-neutral-150 p-4 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-mono font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border leading-none ${badgeColor}`}>
                          {typeLabel}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold font-mono">
                          {new Date(event.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-gray-805">{event.title}</h4>
                      <p className="text-[11px] text-gray-500 font-semibold leading-relaxed max-w-2xl">{event.description}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {event.points && (
                        <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 flex items-center gap-0.5">
                          +{event.points} XP
                        </span>
                      )}
                      {event.emissionKg !== undefined && (
                        <span className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100/60">
                          {event.emissionKg.toFixed(1)} kg CO₂
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          FULL-WIDTH FOOTER PANEL: REALISTIC TRANSGRESSION VERIFIED MILESTONES SHELF
         ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4 text-left">
        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-black text-gray-905 tracking-tight uppercase flex items-center gap-2">
              <Award className="text-amber-500 shrink-0" size={16} />
              <span>Climate Credentials Verified Shelf</span>
            </h4>
            <p className="text-xs text-gray-450 font-medium">Locked and unlocked credentials based on actual habit-forming tracker milestones.</p>
          </div>
          <div className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold text-gray-500">
            {achievementsCount} of {achievements.length} Badges Secured
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;
            return (
              <div 
                key={ach.achievementId}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  isUnlocked 
                    ? "bg-emerald-50/20 border-emerald-100/75 shadow-3xs hover:-translate-y-0.5 duration-150" 
                    : "bg-neutral-50/40 border-neutral-100 opacity-60 select-none cursor-not-allowed"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between w-full">
                    {/* Badge Icon Slot */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isUnlocked ? "bg-emerald-100/70" : "bg-neutral-100"
                    }`}>
                      {isUnlocked ? (
                        renderBadgeIcon(ach.icon, true)
                      ) : (
                        <Lock className="text-gray-405" size={15} />
                      )}
                    </div>
                    {/* Status label tag */}
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none ${
                      isUnlocked ? "bg-emerald-600 text-white font-mono" : "bg-neutral-200 text-gray-400"
                    }`}>
                      {isUnlocked ? "Secured" : "Locked"}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-left">
                    <h5 className="font-extrabold text-[12px] text-gray-800 leading-tight">{ach.title}</h5>
                    <p className="text-[10px] leading-tight text-gray-450 font-medium min-h-[32px] line-clamp-3">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-50 mt-3 pt-2">
                  {isUnlocked ? (
                    <span className="text-[8.5px] text-emerald-600 font-extrabold block tracking-tight font-mono">
                      Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-[8.5px] text-gray-400 font-bold block tracking-tight">
                      Awaiting verification...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
