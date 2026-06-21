import React, { useState } from "react";
import { useApp } from "../AppContext";
import { 
  Leaf, 
  MapPin, 
  Car, 
  ChefHat, 
  Zap, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  LineChart,
  Globe,
  Mic,
  Camera,
  Bell,
  ShieldCheck,
  Check
} from "lucide-react";

export default function OnboardingView() {
  const { onboard, permissions, requestPermission, updatePermissionState } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState("");

  const handleAutoDetectLocation = async () => {
    setDetecting(true);
    setDetectionError("");
    
    // Helper to fetch IP-based backup location
    const fetchIPLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.city && data.country_name) {
            setForm((prev) => ({
              ...prev,
              city: data.city,
              country: data.country_name
            }));
            return true;
          }
        }
      } catch (err) {
        console.error("IP Geolocation failed:", err);
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
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (response.ok) {
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "";
            const country = data.address.country || "";
            
            if (city && country) {
              setForm((prev) => ({
                ...prev,
                city,
                country
              }));
              setDetecting(false);
              return;
            }
          }
          const ok = await fetchIPLocation();
          if (!ok) {
            setDetectionError("Could not translate coordinates. Please enter manually.");
          }
        } catch (err) {
          console.error("Osm reverse geocoding failed, trying IP fallback...", err);
          const ok = await fetchIPLocation();
          if (!ok) {
            setDetectionError("Location lookup failed. Please enter manually.");
          }
        }
        setDetecting(false);
      },
      async (error) => {
        console.warn("GPS/Permission failed. Trying IP detection...", error);
        const ok = await fetchIPLocation();
        if (!ok) {
          setDetectionError("Location access denied or timed out. Please enter manually.");
        }
        setDetecting(false);
      },
      { timeout: 6000, enableHighAccuracy: false }
    );
  };

  // Onboarding parameters and choices mapping
  const [form, setForm] = useState({
    name: "",
    city: "",
    country: "",
    transportHabits: "sedan_average",
    dietType: "chicken_pork",
    energyUsage: "medium_electricity",
    shoppingHabits: "average_shopping"
  });

  const nextStep = () => setStep((p) => p + 1);
  const prevStep = () => setStep((p) => p - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate smart calculation delays
    setTimeout(async () => {
      await onboard(form);
      setLoading(false);
    }, 1500);
  };

  const transportOptions = [
    { id: "sedan_average", label: "Average Sedan Car", desc: "Drive a standard gasoline gas vehicle about 10k-15k km per year.", icon: Car },
    { id: "suv_frequent", label: "SUV / Heavy Petrol Car", desc: "Drive heavy gas-guzzling vehicle or cover very long distances.", icon: Car },
    { id: "electric", label: "Electric Vehicle (EV)", desc: "Use a clean fully electric battery or plug-in hybrid car.", icon: Car },
    { id: "public_transit", label: "Public Transit Only", desc: "Prefer subways, city buses, trains, walking, or cycling.", icon: Leaf },
  ];

  const dietOptions = [
    { id: "meat_heavy", label: "Meat Heavy Diet", desc: "Beef, pork, or lamb consumed in multiple meals weekly.", icon: ChefHat },
    { id: "chicken_pork", label: "Poultry / Omnivore Diet", desc: "Mostly white meat (chicken, fish) and fresh organic greens.", icon: ChefHat },
    { id: "vegetarian", label: "Full Vegetarian", desc: "Dairy and organic plants, strictly zero meat products.", icon: Leaf },
    { id: "vegan", label: "Strict Conscious Vegan", desc: "Fully plant-based diet, minimal transport-heavy agricultural foods.", icon: Leaf },
  ];

  const energyOptions = [
    { id: "medium_electricity", label: "Standard Household Grid", desc: "Grid electricity, standard heating/cooling with gas.", icon: Zap },
    { id: "high_intensity", label: "High Intensity Power", desc: "Large house with regular central HVAC, or heavy server equipment.", icon: Zap },
    { id: "solar_renewables", label: "Green Renewable Energy", desc: "Solar solar array panel setups or community certified clean energy.", icon: Leaf },
  ];

  const shoppingOptions = [
    { id: "average_shopping", label: "Moderate Shopper", desc: "Purchase new clothing or gadgets only when needed.", icon: ShoppingBag },
    { id: "frequent_shopping", label: "Frequent Shop Enthusiast", desc: "Love fresh tech models, luxury clothing brands, fast deliveries.", icon: ShoppingBag },
    { id: "minimalist", label: "Conscious Minimalist", desc: "Always repair or buy secondhand options, minimal clutter.", icon: Leaf },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 relative flex items-center justify-center mx-auto mb-6 border border-emerald-100">
          <Leaf className="text-emerald-500 animate-spin" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Compiling Carbon Footprint...</h3>
        <p className="text-sm text-gray-500 max-w-sm mt-2">
          Our environmental database is compiling your baseline, setting up level milestones, and calibrating your AI sustainability engine.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/20 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-emerald-100/50 shadow-xl overflow-hidden">
        
        {/* Progress header bar */}
        <div className="bg-emerald-50/30 p-2 border-b border-emerald-50 flex justify-between px-6 text-xs text-emerald-800 font-medium tracking-tight">
          <span>CarbonWise AI Onboarding</span>
          <span>Step {step} of 6</span>
        </div>
        
        <div className="w-full bg-emerald-100 h-1">
          <div 
            className="bg-emerald-500 h-1 transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
          
          {/* STEP 1: Basic Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Let's set up your Sustainability Profile</h2>
                <p className="text-sm text-gray-500 mt-1.5">Introduce yourself so we can calibrate your personalized carbon projection.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name-input" className="block text-xs font-semibold text-gray-700 tracking-wide mb-2">
                    What should we call you?
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Sara"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-all text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Globe size={14} className="text-emerald-600" />
                      Auto-Detect Location
                    </span>
                    <span className="text-[11px] text-emerald-800 leading-none">Detect code-based carbon factors matching your area.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoDetectLocation}
                    disabled={detecting}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      detecting
                        ? "bg-emerald-100 text-emerald-805 border-emerald-200"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 shadow-xs"
                    }`}
                  >
                    {detecting ? (
                      <>
                        <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <span>Detect Location</span>
                      </>
                    )}
                  </button>
                </div>

                {detectionError && (
                  <p className="text-[11px] font-medium text-red-600 bg-red-50/70 border border-red-100 p-2.5 rounded-xl">
                    {detectionError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city-input" className="block text-xs font-semibold text-gray-700 tracking-wide mb-2">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                      <input
                        id="city-input"
                        type="text"
                        required
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="E.g., London"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country-input" className="block text-xs font-semibold text-gray-700 tracking-wide mb-2">
                      Country
                    </label>
                    <input
                      id="country-input"
                      type="text"
                      required
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="E.g., United Kingdom"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={!form.name || !form.city || !form.country}
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Transportation Habits */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How do you commute most often?</h2>
                <p className="text-sm text-gray-500 mt-1.5">Transportation accounts for roughly 28% of worldwide greenhouse emissions.</p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {transportOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = form.transportHabits === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, transportHabits: opt.id })}
                      className={`
                        w-full flex items-start gap-4 p-4 text-left rounded-2xl border transition-all duration-150 cursor-pointer
                        ${isSelected 
                          ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500" 
                          : "border-gray-100 hover:border-emerald-200 hover:bg-neutral-50/50"}
                      `}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? "bg-emerald-500 text-white" : "bg-neutral-100 text-gray-500"}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 text-sm">{opt.label}</h4>
                          {isSelected && <CheckCircle2 className="text-emerald-600" size={16} />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 font-semibold text-sm px-4 py-3"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Diet Habits */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">What does your primary diet look like?</h2>
                <p className="text-sm text-gray-500 mt-1.5">Livestock farming constitutes nearly 14.5% of annual planetary emissions.</p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {dietOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = form.dietType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, dietType: opt.id })}
                      className={`
                        w-full flex items-start gap-4 p-4 text-left rounded-2xl border transition-all duration-150 cursor-pointer
                        ${isSelected 
                          ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500" 
                          : "border-gray-100 hover:border-emerald-200 hover:bg-neutral-50/50"}
                      `}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? "bg-emerald-500 text-white" : "bg-neutral-100 text-gray-500"}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 text-sm">{opt.label}</h4>
                          {isSelected && <CheckCircle2 className="text-emerald-600" size={16} />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 font-semibold text-sm px-4 py-3"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Home Energy usage */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How is your household energy set up?</h2>
                <p className="text-sm text-gray-500 mt-1.5">Residential heating, appliances, and cooling are heavy grid consumers.</p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {energyOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = form.energyUsage === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, energyUsage: opt.id })}
                      className={`
                        w-full flex items-start gap-4 p-4 text-left rounded-2xl border transition-all duration-150 cursor-pointer
                        ${isSelected 
                          ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500" 
                          : "border-gray-100 hover:border-emerald-200 hover:bg-neutral-50/50"}
                      `}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? "bg-emerald-500 text-white" : "bg-neutral-100 text-gray-500"}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 text-sm">{opt.label}</h4>
                          {isSelected && <CheckCircle2 className="text-emerald-600" size={16} />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 font-semibold text-sm px-4 py-3"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Shopping habits */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How would you describe your shopping habits?</h2>
                <p className="text-sm text-gray-500 mt-1.5">Manufacturing, deliveries, packaging, and waste add severe carbon footprints.</p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {shoppingOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = form.shoppingHabits === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, shoppingHabits: opt.id })}
                      className={`
                        w-full flex items-start gap-4 p-4 text-left rounded-2xl border transition-all duration-150 cursor-pointer
                        ${isSelected 
                          ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500" 
                          : "border-gray-100 hover:border-emerald-200 hover:bg-neutral-50/50"}
                      `}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? "bg-emerald-500 text-white" : "bg-neutral-100 text-gray-500"}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 text-sm">{opt.label}</h4>
                          {isSelected && <CheckCircle2 className="text-emerald-600" size={16} />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 font-semibold text-sm px-4 py-3"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/15 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:translate-y-px transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Trust-Based Permissions Dashboard */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Transparency & Privacy</h2>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                  A few permissions to power your automated CarbonWise AI coaching journey safely and intelligently.
                </p>
              </div>

              {/* Grid of Cards container */}
              <div className="grid grid-cols-1 gap-3.5 select-none text-left">
                
                {/* 📍 Location Perm Card */}
                <div 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-250 ${
                    permissions.location === "granted"
                      ? "border-emerald-300 bg-emerald-50/15 shadow-2xs"
                      : "border-gray-100 hover:border-emerald-100/80 hover:bg-neutral-50/55"
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div className={`p-3 rounded-xl shrink-0 ${permissions.location === "granted" ? "bg-emerald-550 text-white" : "bg-emerald-50/60 text-emerald-600 border border-emerald-100/30"}`}>
                      <MapPin size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-neutral-850 text-sm flex items-center gap-1">
                        <span>📍 Location</span>
                      </h4>
                      <p className="text-xs text-neutral-450 leading-relaxed max-w-sm">
                        Calculate transportation emissions accurately and provide location-based sustainability insights.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (permissions.location === "granted") return;
                      await requestPermission("location");
                    }}
                    disabled={permissions.location === "granted"}
                    className={`sm:self-center font-bold text-xs px-4.5 py-2.2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                      permissions.location === "granted"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-250 cursor-default"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-3xs"
                    }`}
                  >
                    {permissions.location === "granted" ? "✓ Enabled" : "Enable"}
                  </button>
                </div>

                {/* 🎤 Voice Logging Card */}
                <div 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-250 ${
                    permissions.voice === "granted"
                      ? "border-emerald-300 bg-emerald-50/15 shadow-2xs"
                      : "border-gray-100 hover:border-emerald-100/80 hover:bg-neutral-50/55"
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div className={`p-3 rounded-xl shrink-0 ${permissions.voice === "granted" ? "bg-emerald-555 text-white" : "bg-emerald-50/60 text-emerald-600 border border-emerald-100/30"}`}>
                      <Mic size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-neutral-850 text-sm flex items-center gap-1">
                        <span>🎤 Voice Logging</span>
                      </h4>
                      <p className="text-xs text-neutral-450 leading-relaxed max-w-sm">
                        Allow users to log activities naturally using voice commands and AI transcription.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (permissions.voice === "granted") return;
                      await requestPermission("voice");
                    }}
                    disabled={permissions.voice === "granted"}
                    className={`sm:self-center font-bold text-xs px-4.5 py-2.2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                      permissions.voice === "granted"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-250 cursor-default"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-3xs"
                    }`}
                  >
                    {permissions.voice === "granted" ? "✓ Enabled" : "Enable"}
                  </button>
                </div>

                {/* 📷 Camera Receipt Scanner */}
                <div 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-250 ${
                    permissions.camera === "granted"
                      ? "border-emerald-300 bg-emerald-50/15 shadow-2xs"
                      : "border-gray-100 hover:border-emerald-100/80 hover:bg-neutral-50/55"
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div className={`p-3 rounded-xl shrink-0 ${permissions.camera === "granted" ? "bg-emerald-555 text-white" : "bg-emerald-50/60 text-emerald-600 border border-emerald-100/30"}`}>
                      <Camera size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-neutral-850 text-sm flex items-center gap-1">
                        <span>📷 Camera (Receipt Scanner)</span>
                      </h4>
                      <p className="text-xs text-neutral-450 leading-relaxed max-w-sm">
                        Scan shopping and grocery receipts to automatically estimate carbon impact.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (permissions.camera === "granted") return;
                      await requestPermission("camera");
                    }}
                    disabled={permissions.camera === "granted"}
                    className={`sm:self-center font-bold text-xs px-4.5 py-2.2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                      permissions.camera === "granted"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-250 cursor-default"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-3xs"
                    }`}
                  >
                    {permissions.camera === "granted" ? "✓ Enabled" : "Enable"}
                  </button>
                </div>

                {/* 🔔 Notifications Card */}
                <div 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-250 ${
                    permissions.notifications === "granted"
                      ? "border-emerald-300 bg-emerald-50/15 shadow-2xs"
                      : "border-gray-100 hover:border-emerald-100/80 hover:bg-neutral-50/55"
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div className={`p-3 rounded-xl shrink-0 ${permissions.notifications === "granted" ? "bg-emerald-555 text-white" : "bg-emerald-50/60 text-emerald-600 border border-emerald-100/30"}`}>
                      <Bell size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-neutral-850 text-sm flex items-center gap-1">
                        <span>🔔 Notifications</span>
                      </h4>
                      <p className="text-xs text-neutral-450 leading-relaxed max-w-sm">
                        Receive sustainability reminders, weekly reports, challenge updates, and goal tracking alerts.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (permissions.notifications === "granted") return;
                      await requestPermission("notifications");
                    }}
                    disabled={permissions.notifications === "granted"}
                    className={`sm:self-center font-bold text-xs px-4.5 py-2.2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                      permissions.notifications === "granted"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-250 cursor-default"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-3xs"
                    }`}
                  >
                    {permissions.notifications === "granted" ? "✓ Enabled" : "Enable"}
                  </button>
                </div>

              </div>

              {/* Privacy protection guarantee reassurance card overlay design */}
              <div className="flex gap-3.5 bg-emerald-50/10 border border-emerald-200/25 p-4 rounded-2xl items-start select-none">
                <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={17} />
                <p className="text-[11px] font-semibold text-neutral-500 leading-relaxed text-left">
                  CarbonWise only requests permissions required for features you choose to use. Your data is never sold and can be disabled anytime.
                </p>
              </div>

              {/* Bottom Actions flow with Skip to Baseline computation directly */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100/60">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 text-gray-500 hover:text-emerald-700 font-bold text-xs px-4.5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowLeft size={15} />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      // Skip for Now option
                      setLoading(true);
                      setTimeout(async () => {
                        await onboard(form);
                        setLoading(false);
                      }, 1500);
                    }}
                    className="text-gray-400 hover:text-gray-600 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Skip for Now
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      // Continue option
                      setLoading(true);
                      setTimeout(async () => {
                        await onboard(form);
                        setLoading(false);
                      }, 1500);
                    }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-750 active:translate-y-px transition-all cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
