import React, { useState, useRef } from "react";
import { useApp } from "../AppContext";
import { 
  ScanLine, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight,
  Leaf,
  FileText,
  BookmarkCheck,
  Sparkles,
  ShoppingBag,
  Trash2
} from "lucide-react";
import { motion } from "motion/react";

export default function ReceiptView() {
  const { addNewActivities } = useApp();
  const [loading, setLoading] = useState(false);
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    analyzeImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      analyzeImageFile(file);
    }
  };

  // Helper for image compression to avoid Vercel 4.5MB payload limit
  const compressImage = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        return reject(new Error("File is not an image"));
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return reject(new Error("Failed to get 2d context"));
          }
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 75% quality
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
          resolve({
            base64: compressedBase64,
            mimeType: "image/jpeg"
          });
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const getCompressedImageOrFallback = async (file: File): Promise<{ base64: string; mimeType: string }> => {
    try {
      console.log(`Starting client-side image compression for ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`);
      const result = await compressImage(file);
      const approxSize = Math.round((result.base64.length * 3) / 4 / 1024);
      console.log(`Compression successful: Reduced to image/jpeg, approx ${approxSize} KB`);
      return result;
    } catch (err) {
      console.warn("Client-side image compression failed, falling back to original file:", err);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve({
            base64: reader.result as string,
            mimeType: file.type
          });
        };
        reader.onerror = (err) => reject(err);
      });
    }
  };

  const analyzeImageFile = async (file: File) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setScannedResult(null);

    try {
      const { base64, mimeType } = await getCompressedImageOrFallback(file);
      console.log(`Sending payload size: ${Math.round(base64.length / 1024)} KB to /api/gemini/receipt`);
      
      const response = await fetch("/api/gemini/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: mimeType
        })
      });

      const text = await response.text();
      console.log(`Response received with status: ${response.status}`);
      
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Non-JSON response from server:", text);
        throw new Error(`Server returned invalid response format. Error: ${text.substring(0, 150)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Receipt analysis failed.");
      }

      if (data && data.items && data.items.length > 0) {
        setScannedResult(data);
        // Auto-select all parsed lines
        setSelectedIndices(data.items.map((_: any, idx: number) => idx));
      } else {
        setErrorMessage("We couldn't detect any structured purchase items or carbon-related context on this document. Please try a cleaner receipt.");
      }
    } catch (err: any) {
      console.error("Receipt scan client error:", err);
      setErrorMessage(err.message || "Receipt analysis is currently unavailable. Please check your network connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectIndex = (idx: number) => {
    setSelectedIndices(p => 
      p.includes(idx) ? p.filter(v => v !== idx) : [...p, idx]
    );
  };

  const handleSaveActivities = async () => {
    if (!scannedResult || selectedIndices.length === 0) return;

    try {
      const logsToCommit = scannedResult.items
        .filter((_: any, idx: number) => selectedIndices.includes(idx))
        .map((item: any) => ({
          category: item.category || "Shopping",
          description: `Scanned receipt item: ${item.name}`,
          emissionKg: item.emissionKg || 0,
          inputText: `Scanned receipt from ${scannedResult.merchant || "scanned bill"}`,
          explanation: item.alternative || "Carbon impact analyzed via receipt scanning."
        }));

      await addNewActivities(logsToCommit);
      setSuccessMessage(`Successfully logged ${logsToCommit.length} scanned purchase items directly into your carbon footprint logs!`);
      setScannedResult(null);
      setSelectedIndices([]);
    } catch {
      setErrorMessage("Could not save activities to your dynamic log. Please try again.");
    }
  };

  const clearScannedResult = () => {
    setScannedResult(null);
    setSelectedIndices([]);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Calculate stats for visualized breakdown of current scanned paper
  const totalScannedEmissions = scannedResult?.items
    ?.filter((_: any, idx: number) => selectedIndices.includes(idx))
    ?.reduce((sum: number, item: any) => sum + (item.emissionKg || 0), 0) || 0;

  // Determine top category in current scan
  const currentCategories: Record<string, number> = {};
  scannedResult?.items
    ?.filter((_: any, idx: number) => selectedIndices.includes(idx))
    ?.forEach((item: any) => {
      const cat = item.category || "Shopping";
      currentCategories[cat] = (currentCategories[cat] || 0) + (item.emissionKg || 0);
    });

  let topCategory = "N/A";
  let maxWeight = 0;
  Object.entries(currentCategories).forEach(([cat, val]) => {
    if (val > maxWeight) {
      maxWeight = val;
      topCategory = cat;
    }
  });

  return (
    <div className="space-y-4 max-w-3xl mx-auto min-h-screen pb-16 select-none text-left animate-fade-in">
      
      {/* Elegantly streamlined, modern header */}
      <div className="border-b border-gray-100 pb-4">
        <span className="text-[10px] font-extrabold text-emerald-805 bg-emerald-50 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
          AI Document Intelligence
        </span>
        <h2 className="text-[28px] sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
          AI Carbon Receipt Analysis
        </h2>
        <p className="text-sm text-stone-500 font-medium mt-1 leading-relaxed">
          Upload a grocery receipt, utility bill, or travel ticket to instantly estimate carbon impact and receive sustainability recommendations.
        </p>
      </div>

      {/* Main Container Area */}
      <div className="space-y-4 pt-1">
        
        {/* If no result is loaded and we are not loading, show clean file drop zone and empty state description */}
        {!scannedResult && !loading && (
          <div className="space-y-4">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-100 shadow-[0_4px_25px_rgba(16,185,129,0.015)] space-y-4">
              
              {/* Minimalist upload trigger area - reduced padding by 15% to 25% for a compact feel */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-200 group py-9 px-4 ${
                  isDragging 
                    ? "border-emerald-500 bg-emerald-50/10 shadow-inner scale-[1.01]" 
                    : "border-stone-200 hover:border-emerald-500 bg-stone-50/25 hover:bg-emerald-50/5"
                }`}
              >
                <div className="p-3 bg-stone-50 group-hover:bg-emerald-50 text-stone-500 group-hover:text-emerald-700 rounded-full w-fit mx-auto mb-3 transition-all border border-stone-100 shadow-3xs">
                  <UploadCloud size={24} className="animate-pulse" />
                </div>
                <h5 className="font-extrabold text-gray-950 text-sm tracking-tight group-hover:text-emerald-800 transition-colors">
                  Upload Receipt for Carbon Analysis
                </h5>
                <p className="text-xs text-stone-500 font-semibold mt-1">
                  Supported: Grocery receipts, utility bills, travel tickets, and purchase invoices.
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/heic,.jpg,.jpeg,.png,.heic"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Clean subtext for supported formats */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500 font-semibold pt-3 border-t border-stone-100">
                <span className="flex items-center gap-1.5">
                  <FileText size={13} className="text-emerald-600" />
                  <span>Accepted formats: JPEG, PNG, HEIC, PDF</span>
                </span>
                <span>Max file size: 10MB</span>
              </div>
            </div>

            {/* Clean empty state section directly below upload area */}
            <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.008)] text-left space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">
                No document analyzed yet
              </h4>
              <div className="text-xs text-stone-500 space-y-2 font-medium leading-relaxed">
                <p className="font-semibold text-stone-600">Upload a receipt to receive:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Carbon impact estimate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Emission category breakdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>AI sustainability recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Lower-impact alternatives</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOADING ANIMATION WORKFLOW */}
        {loading && (
          <div className="bg-white p-12 rounded-3xl border border-neutral-100 shadow-[0_4px_25px_rgba(16,185,129,0.02)] text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-100">
              <ScanLine size={24} className="animate-spin" />
            </div>
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">Gemini AI is analyzing your document...</h4>
              <p className="text-xs text-stone-400 font-semibold mt-1">Scanning text lines, matching merchants, and computing CO₂ values under GHG standards.</p>
            </div>
            <div className="max-w-xs mx-auto bg-stone-100 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-1/2 animate-shimmer rounded-full" />
            </div>
          </div>
        )}

        {/* PARSED SCAN RESULTS SCREEN */}
        {scannedResult && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-[0_4px_25px_rgba(16,185,129,0.015)] space-y-6"
          >
            {/* Header toolbar */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-150 tracking-wider">
                  Live Audit Result
                </span>
                <h3 className="font-black text-base text-gray-900 mt-1">
                  {scannedResult.merchant || "Verified Document Purchase"}
                </h3>
              </div>

              <button
                onClick={clearScannedResult}
                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                title="Discard scan"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* KEY METRICS STATS BLOCKS (Requirement 4: Summary, Impact, Top Category) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Estimated Carbon Impact */}
              <div className="bg-emerald-50/25 border border-emerald-100/60 p-4 rounded-2xl flex flex-col justify-between space-y-1 text-left">
                <span className="text-[9px] uppercase font-mono font-extrabold text-emerald-850 tracking-wider leading-none">
                  Estimated Carbon Impact
                </span>
                <span className="text-lg font-black text-emerald-950 font-mono pt-1">
                  {totalScannedEmissions.toFixed(1)} kg CO₂
                </span>
                <span className="text-[10px] text-stone-400 font-bold">Of checked items</span>
              </div>

              {/* Card 2: Highest Emission Category */}
              <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-2xl flex flex-col justify-between space-y-1 text-left">
                <span className="text-[9px] uppercase font-mono font-extrabold text-stone-500 tracking-wider leading-none">
                  Top Emission Category
                </span>
                <span className="text-sm font-black text-stone-800 truncate pt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                  {topCategory}
                </span>
                <span className="text-[10px] text-stone-400 font-bold">Largest carbon vector</span>
              </div>

              {/* Card 3: Total Cost Detected */}
              <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-2xl flex flex-col justify-between space-y-1 text-left">
                <span className="text-[9px] uppercase font-mono font-extrabold text-stone-500 tracking-wider leading-none">
                  Total Transaction Amount
                </span>
                <span className="text-sm font-bold text-stone-700 font-mono pt-1">
                  {scannedResult.totalAmount || "N/A"}
                </span>
                <span className="text-[10px] text-stone-400 font-bold">Detected cost</span>
              </div>

              {/* Card 4: AI Confidence Score */}
              <div className={`border p-4 rounded-2xl flex flex-col justify-between space-y-1 text-left ${
                (scannedResult.confidenceScore ?? 0) >= 75 
                  ? "bg-emerald-50/20 border-emerald-100/60" 
                  : (scannedResult.confidenceScore ?? 0) >= 50 
                    ? "bg-amber-50/20 border-amber-100/60" 
                    : "bg-red-50/20 border-red-100/60"
              }`}>
                <span className="text-[9px] uppercase font-mono font-extrabold text-stone-500 tracking-wider leading-none">
                  AI Confidence Score
                </span>
                <span className={`text-lg font-black font-mono pt-1 ${
                  (scannedResult.confidenceScore ?? 0) >= 75 
                    ? "text-emerald-700" 
                    : (scannedResult.confidenceScore ?? 0) >= 50 
                      ? "text-amber-600" 
                      : "text-red-600"
                }`}>
                  {scannedResult.confidenceScore ?? "N/A"}
                  {scannedResult.confidenceScore != null && <span className="text-xs font-bold"> / 100</span>}
                </span>
                <span className="text-[10px] text-stone-400 font-bold">OCR & estimation quality</span>
              </div>

            </div>

            {/* DETAILED ITEMIZED DECOMPOSITION & ALTERNATIVES SWAPS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-extrabold text-stone-400 uppercase tracking-widest font-mono">
                <span>Select items to check-in</span>
                <span>Breakdown (CO₂)</span>
              </div>

              <div className="space-y-3.5">
                {scannedResult.items?.map((item: any, idx: number) => {
                  const isChecked = selectedIndices.includes(idx);
                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleSelectIndex(idx)}
                      className={`
                        p-4.5 rounded-2xl border flex items-start gap-3.5 transition-all cursor-pointer text-left
                        ${isChecked 
                          ? "border-emerald-500 bg-emerald-50/[0.12]" 
                          : "border-stone-150 hover:border-emerald-200 bg-stone-50/20"}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Click is handled via div wrapping
                        className="mt-1 h-4 w-4 rounded-lg border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="flex-grow space-y-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="text-xs font-bold text-stone-900 leading-tight">{item.name}</h4>
                          <span className="text-xs font-black text-emerald-950 font-mono shrink-0">
                            {item.emissionKg?.toFixed(1) || "0.0"} kg
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-stone-100 text-stone-500 font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none">
                            {item.category || "Shopping"}
                          </span>
                          {item.quantity && item.quantity !== "1" && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none">
                              Qty: {item.quantity}
                            </span>
                          )}
                        </div>

                        {/* Plant-based or local custom alternative recommendations */}
                        {item.alternative && (
                          <p className="text-[11px] text-emerald-950 bg-white/70 p-2.5 rounded-xl border border-emerald-100/30 mt-2 font-normal leading-relaxed">
                            🌱 Alternative win: <span className="font-semibold">{item.alternative}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* VERIFY / SUBMIT DIRECT LOG WORKFLOW */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-105">
              <span className="text-xs text-stone-400 font-bold font-mono">
                {selectedIndices.length} items checkmarked for saving
              </span>
              <button
                onClick={handleSaveActivities}
                disabled={selectedIndices.length === 0}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-3xs"
              >
                <BookmarkCheck size={16} />
                <span>Log Checked Items ({selectedIndices.length})</span>
              </button>
            </div>

          </motion.div>
        )}

        {/* FEEDBACK CORNER AND PROCESS INDICATORS */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 text-left animate-fade-in shadow-[0_2px_12px_rgba(16,185,129,0.02)]">
            <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-bold">Activities Recorded Successfully</p>
              <p className="text-stone-500 font-semibold leading-relaxed">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 text-left animate-fade-in">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

      </div>

    </div>
  );
}
