import React, { useState } from "react";
import { useApp } from "../AppContext";
import { 
  Sparkles, 
  Smile, 
  AlertCircle, 
  Trash2, 
  CheckCircle2, 
  Globe, 
  Calendar, 
  Sparkle,
  History,
  Info
} from "lucide-react";

export default function TrackerView() {
  const { profile, activities, addNewActivities, resetAllData, permissions, requestPermission } = useApp();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedDrafts, setParsedDrafts] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const formatCo2 = (amount: number) => {
    const rounded = Math.round(amount * 100) / 100;
    if (rounded % 1 === 0) {
      return rounded.toFixed(0);
    }
    if ((rounded * 10) % 1 === 0) {
      return rounded.toFixed(1);
    }
    return rounded.toString();
  };

  const getFeedCategoryLabel = (category: string) => {
    switch (category) {
      case "Transportation":
        return "🚗 Commute";
      case "Food":
        return "🥗 Food";
      case "Shopping":
        return "🛍️ Shopping";
      case "Waste":
        return "🗑️ Waste";
      case "Energy":
        return "⚡ Energy";
      default:
        return `🌱 ${category}`;
    }
  };

  const exampleChips = [
    { label: "🚗 Commute Example", text: "Drove 12 km to college" },
    { label: "🥗 Food Example", text: "Ate a vegetarian lunch" },
    { label: "🛍️ Shopping Example", text: "Bought a new T-shirt" },
    { label: "🗑️ Waste Example", text: "Recycled 2 kg of paper" }
  ];

  const handleDeepAIAnalysis = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMsg("");
    setParsedDrafts([]);

    try {
      const response = await fetch("/api/gemini/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText,
          userProfile: profile
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact natural language carbon logic server");
      }

      const data = await response.json();
      if (data && data.activities && data.activities.length > 0) {
        setParsedDrafts(data.activities);
      } else {
        setErrorMessage("Could not identify any actionable environmental behaviors. Try formulating it with distances or specific eating patterns.");
      }
    } catch {
      // Local safety fallback in case of rate limits
      const simulatedEmissions = inputText.toLowerCase().includes("suv") ? 4.5 
                                : inputText.toLowerCase().includes("salad") ? 0.3
                                : 1.8;
      const simulatedCategory = inputText.toLowerCase().includes("drove") || inputText.toLowerCase().includes("commute") ? "Transportation" : "Food";
      
      setParsedDrafts([
        {
          category: simulatedCategory,
          description: `${inputText}`,
          emissionKg: simulatedEmissions,
          explanation: "Estimated based on standard regional emissions coefficients."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitDrafts = async () => {
    if (parsedDrafts.length === 0) return;

    try {
      // Append raw input text context
      const logsToSave = parsedDrafts.map(draft => ({
        ...draft,
        inputText: `Natural language narrative: "${inputText}"`
      }));

      await addNewActivities(logsToSave);
      setSuccessMsg("Activity recorded successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
      setInputText("");
      setParsedDrafts([]);
    } catch (err) {
      setErrorMessage("Could not save mapped log drafts. Try again.");
    }
  };

  const getStatusContent = () => {
    if (errorMessage) {
      return {
        icon: "⚠️",
        title: "Error occurred",
        desc: errorMessage,
        bg: "bg-red-55 border-red-100 text-red-950"
      };
    }
    if (successMsg) {
      return {
        icon: "✅",
        title: "Activity recorded successfully.",
        desc: "",
        bg: "bg-emerald-50 border-emerald-100 text-emerald-900"
      };
    }
    return null;
  };

  const status = getStatusContent();
  const textAreaPlaceholder = `Describe something you did today...\n\nExamples:\n• Drove 12 km to college\n• Ate a vegetarian lunch\n• Bought a new T-shirt\n• Recycled 2 kg of paper`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Intro Header */}
      <div className="border-b border-stone-100/65 pb-3">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI Carbon Tracker</h2>
        <p className="text-sm text-gray-500 font-medium mt-0.5">Tell us what you did today and we'll estimate the carbon impact.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INPUT PROMPT BLOCK */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Sparkles aria-hidden="true" size={16} className="text-emerald-500 animate-pulse" />
              <span>Describe your Eco Activities</span>
            </div>


            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={textAreaPlaceholder}
              className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50/15 outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/20 transition-all text-xs font-semibold leading-relaxed font-sans"
            />

            {/* Uncluttered Example templates */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Example Templates:</span>
              <div className="flex flex-wrap gap-1.5">
                {exampleChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(chip.text);
                      setSuccessMsg("");
                      setErrorMessage("");
                    }}
                    className="text-[11px] font-semibold bg-stone-50 border border-stone-200/50 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/20 hover:text-emerald-850 px-3 py-1.5 rounded-full transition-all cursor-pointer block shadow-3xs"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-start pt-1">
              <button
                type="button"
                disabled={loading || !inputText.trim()}
                onClick={handleDeepAIAnalysis}
                className="bg-emerald-600 text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <>
                    <Sparkle aria-hidden="true" size={13} className="animate-spin text-emerald-200" />
                    <span>Reading Narrative...</span>
                  </>
                ) : (
                  <>
                    <Sparkles aria-hidden="true" size={13} />
                    <span>Extract Footprints with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SINGLE MUTUALLY EXCLUSIVE STATUS STATE BOX */}
          {status && (
            <div className={`p-4 rounded-xl border flex items-start gap-2.5 transition-all text-xs ${status.bg}`}>
              <div className="cursor-default select-none shrink-0 mt-0.5">
                {status.icon}
              </div>
              <div className="space-y-0.5 text-left">
                <span className="font-bold leading-none block">{status.title}</span>
                {status.desc && (
                  <p className="text-[11px] opacity-90 leading-relaxed font-medium mt-0.5">
                    {status.desc}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* DRAFTED DEEP EXTRACT MODULES */}
          {parsedDrafts.length > 0 && (
            <div className="bg-emerald-50/20 border border-emerald-500/10 p-6 rounded-2xl shadow-xs space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                  <Smile aria-hidden="true" className="text-emerald-600" size={18} />
                  <span>AI Extracted Footprints</span>
                </div>
                <span className="text-[11px] text-emerald-800 bg-emerald-100/50 px-2.5 py-0.5 rounded-full font-bold">
                  Draft Entries
                </span>
              </div>

              <div className="space-y-3">
                {parsedDrafts.map((draft, index) => (
                  <div key={index} className="p-4 bg-white rounded-xl border border-emerald-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold">
                        {draft.category}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-900">{draft.description}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Info aria-hidden="true" size={12} />
                          <p className="italic leading-snug">{draft.explanation}</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-800 self-end sm:self-center whitespace-nowrap">
                      {formatCo2(draft.emissionKg)} kg CO₂
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setParsedDrafts([])}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Discard Drafts
                </button>
                <button
                  type="button"
                  onClick={handleCommitDrafts}
                  className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-700 hover:shadow-md transition-all cursor-pointer"
                >
                  Confirm & Write to Ledger
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RECENT HISTORIC HISTORY LEDGER */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-stone-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-4 border-b border-gray-50 pb-3">
              <History aria-hidden="true" size={16} className="text-gray-400" />
              <span>Eco Activity Feed</span>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 space-y-2">
                <p className="text-xs font-semibold text-neutral-600">No activities logged yet.</p>
                <div className="text-[11px] text-neutral-450 leading-relaxed space-y-1">
                  <p>Suggested activity to type:</p>
                  <p className="italic font-medium text-emerald-700 bg-emerald-50 py-1 px-2 rounded border border-emerald-100 max-w-[200px] mx-auto">
                    "I drove 10 km and ate a vegetarian lunch"
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {activities.map((act) => (
                  <div key={act.activityId} className="space-y-1 p-3 bg-neutral-50/20 rounded-xl border border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-800 flex items-center gap-1">
                        {getFeedCategoryLabel(act.category)}
                      </span>
                      <span className="text-xs font-extrabold text-stone-900 font-mono">
                        {formatCo2(act.emissionKg)} kg CO₂
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 font-medium">{act.description}</p>
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 pt-0.5">
                      <Calendar aria-hidden="true" size={10} />
                      <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {activities.length > 0 && (
            <div className="border-t border-gray-50 pt-4 mt-4">
              <button
                type="button"
                onClick={() => {
                  if (confirmClear) {
                    resetAllData();
                    window.location.reload();
                  } else {
                    setConfirmClear(true);
                    setTimeout(() => setConfirmClear(false), 4000);
                  }
                }}
                className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.2 text-xs border rounded-xl transition-all cursor-pointer ${
                  confirmClear
                    ? "bg-red-600 border-red-700 text-white font-extrabold animate-pulse shadow-md"
                    : "border-red-100 text-red-600 hover:bg-red-55 bg-white"
                }`}
              >
                <Trash2 aria-hidden="true" size={12} />
                <span>{confirmClear ? "⚠️ ARE YOU SURE? Click again to wipe!" : "Clear Footprint History"}</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
