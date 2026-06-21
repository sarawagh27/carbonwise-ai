import React, { useState } from "react";
import { useApp } from "../AppContext";
import { EMISSION_FACTORS } from "../data";
import { 
  Car, 
  ChefHat, 
  Zap, 
  ShoppingBag, 
  Trash2,
  BookmarkPlus
} from "lucide-react";

export default function CalculatorView() {
  const { addManualActivity, profile, activities } = useApp();
  const [activeTab, setActiveTab] = useState<"Transportation" | "Food" | "Energy" | "Shopping" | "Waste">("Transportation");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ amount: number; description: string; category: string } | null>(null);

  // Transport state
  const [transportDist, setTransportDist] = useState("12");
  const [transportType, setTransportType] = useState<keyof typeof EMISSION_FACTORS.transportation>("sedan");

  // Food state
  const [mealsCount, setMealsCount] = useState("2");
  const [dietMeal, setDietMeal] = useState<keyof typeof EMISSION_FACTORS.food>("beef");

  // Energy state
  const [energyUsageValue, setEnergyUsageValue] = useState("15");
  const [energyType, setEnergyType] = useState<"electricityKwh" | "gasTherm">("electricityKwh");

  // Shopping state
  const [shoppingQuantity, setShoppingQuantity] = useState("1");
  const [shoppingItem, setShoppingItem] = useState<keyof typeof EMISSION_FACTORS.shopping>("clothing");

  // Waste state
  const [wasteAmount, setWasteAmount] = useState("5");

  const formatCo2 = (amount: number) => {
    // If it's a whole number or extremely close to one, show as integer.
    if (amount % 1 === 0) {
      return amount.toFixed(0);
    }
    const formatted = amount.toFixed(2);
    if (formatted.endsWith(".00")) return amount.toFixed(0);
    if (formatted.endsWith("0")) return amount.toFixed(1);
    return formatted;
  };

  const getEmissionEquivalency = (amount: number) => {
    if (amount < 0.1) {
      return "≈ Charging a smartphone 15 times";
    }
    if (amount < 1.0) {
      const bottles = Math.round(amount * 10);
      return `≈ Producing ${bottles > 0 ? bottles : 1} plastic bottle${bottles > 1 ? "s" : ""}`;
    }
    if (amount < 10) {
      const km = Math.round(amount / 0.18);
      return `≈ Driving ${km > 0 ? km : 1} km in a standard petrol vehicle`;
    }
    const days = Math.round((amount / 12) * 10) / 10;
    if (days < 1) {
      const hours = Math.round(amount / 0.5);
      return `≈ Running household electricity for ${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `≈ Running household electricity for ${days} day${days !== 1 ? "s" : ""}`;
  };

  const triggerSuccessMessage = (category: string, kg: number) => {
    setSuccessMsg("Carbon entry recorded ✓");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    setLastResult(null);

    let inputValue = 0;

    if (activeTab === "Transportation") {
      inputValue = parseFloat(transportDist);
      if (isNaN(inputValue) || inputValue <= 0) {
        setInputError("Please enter a valid positive distance greater than zero.");
        return;
      }
    } else if (activeTab === "Food") {
      inputValue = parseFloat(mealsCount);
      if (isNaN(inputValue) || inputValue <= 0) {
        setInputError("Please enter a valid serving count greater than zero.");
        return;
      }
    } else if (activeTab === "Energy") {
      inputValue = parseFloat(energyUsageValue);
      if (isNaN(inputValue) || inputValue <= 0) {
        setInputError("Please enter a valid consumption value greater than zero.");
        return;
      }
    } else if (activeTab === "Shopping") {
      inputValue = parseFloat(shoppingQuantity);
      if (isNaN(inputValue) || inputValue <= 0) {
        setInputError("Please enter a valid item quantity greater than zero.");
        return;
      }
    } else if (activeTab === "Waste") {
      inputValue = parseFloat(wasteAmount);
      if (isNaN(inputValue) || inputValue <= 0) {
        setInputError("Please enter a valid waste mass in kg greater than zero.");
        return;
      }
    }

    setLoading(true);
    let calculatedEmission = 0;
    let description = "";

    try {
      if (activeTab === "Transportation") {
        const factor = EMISSION_FACTORS.transportation[transportType];
        calculatedEmission = inputValue * factor;
        
        const vehicleLabel = transportType === "sedan" ? "Sedan Gas Car" 
                             : transportType === "suv" ? "SUV / Petrol Car"
                             : transportType === "electric" ? "Fully Electric Car"
                             : transportType === "bus" ? "City Bus Ride"
                             : transportType === "train" ? "Subway / Passenger Train"
                             : "Domestic Airplane flight";
        description = `${inputValue} km via ${vehicleLabel}`;

      } else if (activeTab === "Food") {
        const factor = EMISSION_FACTORS.food[dietMeal];
        calculatedEmission = inputValue * factor;

        const dietLabel = dietMeal === "beef" ? "Beef-heavy meals"
                          : dietMeal === "pork" ? "Pork / White Meat"
                          : dietMeal === "chicken" ? "Poultry meals"
                          : dietMeal === "vegetarian" ? "Vegetarian dishes"
                          : "Strict Vegans dishes";
        description = `${inputValue} servings of ${dietLabel}`;

      } else if (activeTab === "Energy") {
        const factor = EMISSION_FACTORS.energy[energyType];
        calculatedEmission = inputValue * factor;

        const energyLabel = energyType === "electricityKwh" ? "electricity consumed" : "gas thermodynamic heating";
        description = `${inputValue} ${energyType === "electricityKwh" ? "kWh" : "therms"} of home ${energyLabel}`;

      } else if (activeTab === "Shopping") {
        const factor = EMISSION_FACTORS.shopping[shoppingItem];
        calculatedEmission = inputValue * factor;

        const itemLabel = shoppingItem === "clothing" ? "New Apparel"
                          : shoppingItem === "electronics" ? "Technology / Electronics"
                          : "Household Goods";
        description = `Purchased ${inputValue}x ${itemLabel}`;

      } else if (activeTab === "Waste") {
        calculatedEmission = inputValue * EMISSION_FACTORS.waste.householdKg;
        description = `Disposed ${inputValue} kg household waste`;
      }

      await addManualActivity(activeTab, description, calculatedEmission);
      setLastResult({
        amount: calculatedEmission,
        description,
        category: activeTab
      });
      triggerSuccessMessage(activeTab, calculatedEmission);

    } catch (err) {
      console.warn("Could not calculate values. Refresh entries.");
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackDetails = (category: string, amount: number) => {
    switch (category) {
      case "Transportation":
        return {
          explanation: `This commute generated approximately ${formatCo2(amount)} kg of CO₂ emissions.`,
          ecoTip: "Choosing public transport once per week could reduce this value."
        };
      case "Food":
        return {
          explanation: `This dietary selection generated approximately ${formatCo2(amount)} kg of CO₂ emissions.`,
          ecoTip: "Swapping beef for poultry or protein-rich lentils reduces your diet footprint significantly."
        };
      case "Energy":
        return {
          explanation: `This utility consumption generated approximately ${formatCo2(amount)} kg of CO₂ emissions.`,
          ecoTip: "Lowering your heating thermostat by just 1°C can decrease residential energy emissions."
        };
      case "Shopping":
        return {
          explanation: `These purchase decisions generated approximately ${formatCo2(amount)} kg of CO₂ emissions.`,
          ecoTip: "Mindful consumption, repairing gear, or purchasing pre-owned items prevents initial production footprints."
        };
      case "Waste":
        return {
          explanation: `This disposed trash volume is estimated to generate approximately ${formatCo2(amount)} kg of CO₂ emissions.`,
          ecoTip: "Composting organic matter, sorting recyclables, and avoiding single-use plastics diverts high-potency waste."
        };
      default:
        return {
          explanation: `This activity generated approximately ${formatCo2(amount)} kg of CO₂ emissions.`,
          ecoTip: "Tracking and balancing your footprints is a direct way to progress toward a carbon-neutral lifestyle."
        };
    }
  };

  const tabs = [
    { id: "Transportation", label: "Transportation", icon: Car },
    { id: "Food", label: "Food", icon: ChefHat },
    { id: "Energy", label: "Energy", icon: Zap },
    { id: "Shopping", label: "Shopping", icon: ShoppingBag },
    { id: "Waste", label: "Waste", icon: Trash2 },
  ] as const;

  const getLiveCustomEstimate = () => {
    let calculatedEmission = 0;
    let description = "";
    let valLabel = "";

    if (activeTab === "Transportation") {
      const dist = parseFloat(transportDist) || 0;
      const factor = EMISSION_FACTORS.transportation[transportType] || 0;
      calculatedEmission = dist * factor;
      const vehicleLabel = transportType === "sedan" ? "Sedan Gas Car" 
                           : transportType === "suv" ? "SUV / Petrol Car"
                           : transportType === "electric" ? "Fully Electric Car"
                           : transportType === "bus" ? "City Bus Ride"
                           : transportType === "train" ? "Subway / Passenger Train"
                           : "Domestic Airplane";
      description = `${dist} km via ${vehicleLabel}`;
      valLabel = `${dist} km`;
    } else if (activeTab === "Food") {
      const count = parseFloat(mealsCount) || 0;
      const factor = EMISSION_FACTORS.food[dietMeal] || 0;
      calculatedEmission = count * factor;
      const dietLabel = dietMeal === "beef" ? "Beef-heavy meals"
                        : dietMeal === "pork" ? "Pork / White Meat"
                        : dietMeal === "chicken" ? "Poultry meals"
                        : dietMeal === "vegetarian" ? "Vegetarian dishes"
                        : "Strict Vegans dishes";
      description = `${count} servings of ${dietLabel}`;
      valLabel = `${count} servings`;
    } else if (activeTab === "Energy") {
      const val = parseFloat(energyUsageValue) || 0;
      const factor = EMISSION_FACTORS.energy[energyType] || 0;
      calculatedEmission = val * factor;
      const energyLabel = energyType === "electricityKwh" ? "electricity consumed" : "gas thermodynamic heating";
      description = `${val} ${energyType === "electricityKwh" ? "kWh" : "therms"} of home ${energyLabel}`;
      valLabel = `${val} ${energyType === "electricityKwh" ? "kWh" : "therms"}`;
    } else if (activeTab === "Shopping") {
      const qty = parseFloat(shoppingQuantity) || 0;
      const factor = EMISSION_FACTORS.shopping[shoppingItem] || 0;
      calculatedEmission = qty * factor;
      const itemLabel = shoppingItem === "clothing" ? "New Apparel"
                        : shoppingItem === "electronics" ? "Technology / Electronics"
                        : "Household Goods";
      description = `Purchased ${qty}x ${itemLabel}`;
      valLabel = `${qty} items`;
    } else if (activeTab === "Waste") {
      const mass = parseFloat(wasteAmount) || 0;
      calculatedEmission = mass * EMISSION_FACTORS.waste.householdKg;
      description = `Disposed ${mass} kg household waste`;
      valLabel = `${mass} kg`;
    }

    return {
      amount: calculatedEmission,
      description,
      valLabel,
      category: activeTab
    };
  };

  const live = getLiveCustomEstimate();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Intro Header */}
      <div className="border-b border-neutral-100 pb-3">
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Structured Carbon Calculator</h2>
        <p className="text-sm text-neutral-500 font-medium mt-0.5 animate-pulse-subtle">Perform quick, data-backed manual estimations for standard household and lifestyle categories.</p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        
        {/* Category Tabs Wrapper Bar */}
        <div className="flex overflow-x-auto bg-neutral-50/50 border-b border-neutral-100 p-2 gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSuccessMsg("");
                  setInputError(null);
                  setLastResult(null);
                }}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap select-none
                  ${isActive 
                    ? "bg-white text-emerald-700 shadow-xs border border-neutral-200/50 font-bold" 
                    : "text-neutral-500 hover:text-emerald-700 hover:bg-neutral-50/60"}
                `}
              >
                <Icon size={14} className={isActive ? "text-emerald-600" : "text-neutral-400"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Split Workspace form */}
        <form onSubmit={handleCalculate} className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8">
            
            {/* LEFT INPUTS COLUMN (Spans 8 - Increased to make live preview secondary) */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-6">
              
              <div className="space-y-6">
                {/* TRANSPORTATION ACTIVE FORMS */}
                {activeTab === "Transportation" && (
                  <div className="space-y-5">
                    <div>
                      <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 font-mono">
                        Vehicle Class / Commute Type
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {Object.keys(EMISSION_FACTORS.transportation).map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setTransportType(key as any);
                              setInputError(null);
                            }}
                            className={`
                              p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative select-none
                              ${transportType === key 
                                ? "border-emerald-500 bg-emerald-50/30 text-emerald-800 shadow-xs" 
                                : "border-neutral-200/60 bg-neutral-50/10 hover:border-neutral-300 hover:bg-neutral-50/80 text-neutral-700"}
                            `}
                          >
                            {transportType === key && (
                              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                            <h4 className="text-xs font-bold capitalize select-none leading-none mt-0.5">
                              {key === "electric" ? "Electric car" : key}
                            </h4>
                            <span className="text-[9px] text-neutral-400 block mt-1.5 font-mono">
                              {formatCo2(EMISSION_FACTORS.transportation[key as keyof typeof EMISSION_FACTORS.transportation])} kg/km
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="max-w-xs">
                      <label htmlFor="distance-input" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                        Total Commute Distance (Kilometers)
                      </label>
                      <input
                        id="distance-input"
                        type="number"
                        required
                        min="0"
                        step="any"
                        placeholder="Enter distance in km"
                        value={transportDist}
                        onChange={(e) => {
                          setTransportDist(e.target.value);
                          setInputError(null);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/5 outline-none focus:border-emerald-500 focus:bg-white text-xs font-semibold focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* FOOD ACTIVE FORMS */}
                {activeTab === "Food" && (
                  <div className="space-y-5">
                    <div>
                      <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 font-mono">
                        Dietary Category
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {Object.keys(EMISSION_FACTORS.food).map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setDietMeal(key as any);
                              setInputError(null);
                            }}
                            className={`
                              p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative select-none
                              ${dietMeal === key 
                                ? "border-emerald-500 bg-emerald-50/30 text-emerald-800 shadow-xs" 
                                : "border-neutral-200/60 bg-neutral-50/10 hover:border-neutral-300 hover:bg-neutral-50/80 text-neutral-700"}
                            `}
                          >
                            {dietMeal === key && (
                              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                            <h4 className="text-xs font-bold capitalize select-none leading-none mt-0.5">{key}</h4>
                            <span className="text-[9px] text-neutral-400 block mt-1.5 font-mono">
                              {formatCo2(EMISSION_FACTORS.food[key as keyof typeof EMISSION_FACTORS.food])} kg/meal
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="max-w-xs">
                      <label htmlFor="servings-input" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                        Servings consumed
                      </label>
                      <input
                        id="servings-input"
                        type="number"
                        required
                        min="0"
                        step="any"
                        placeholder="Enter servings count"
                        value={mealsCount}
                        onChange={(e) => {
                          setMealsCount(e.target.value);
                          setInputError(null);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/5 outline-none focus:border-emerald-500 focus:bg-white text-xs font-semibold focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* ENERGY ACTIVE FORMS */}
                {activeTab === "Energy" && (
                  <div className="space-y-5">
                    <div>
                      <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 font-mono">
                        Utility Source
                      </span>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEnergyType("electricityKwh");
                            setInputError(null);
                          }}
                          className={`
                            flex-1 p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative select-none
                            ${energyType === "electricityKwh" 
                              ? "border-emerald-500 bg-emerald-50/30 text-emerald-800 shadow-xs" 
                              : "border-neutral-200/60 bg-neutral-50/10 hover:border-neutral-300 hover:bg-neutral-50/80 text-neutral-700"}
                          `}
                        >
                          {energyType === "electricityKwh" && (
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                          <h4 className="text-xs font-bold select-none leading-none mt-0.5">Electricity Grid</h4>
                          <span className="text-[9px] text-neutral-400 block mt-1.5 font-mono">{formatCo2(EMISSION_FACTORS.energy.electricityKwh)} kg/kWh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEnergyType("gasTherm");
                            setInputError(null);
                          }}
                          className={`
                            flex-1 p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative select-none
                            ${energyType === "gasTherm" 
                              ? "border-emerald-500 bg-emerald-50/30 text-emerald-800 shadow-xs" 
                              : "border-neutral-200/60 bg-neutral-50/10 hover:border-neutral-300 hover:bg-neutral-50/80 text-neutral-700"}
                          `}
                        >
                          {energyType === "gasTherm" && (
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                          <h4 className="text-xs font-bold select-none leading-none mt-0.5">Natural Gas Furnace</h4>
                          <span className="text-[9px] text-neutral-400 block mt-1.5 font-mono">{formatCo2(EMISSION_FACTORS.energy.gasTherm)} kg/therm</span>
                        </button>
                      </div>
                    </div>

                    <div className="max-w-xs">
                      <label htmlFor="quantity-input" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                        Amount Consumed ({energyType === "electricityKwh" ? "kWh" : "Therms"})
                      </label>
                      <input
                        id="quantity-input"
                        type="number"
                        required
                        min="0"
                        step="any"
                        placeholder="Enter value"
                        value={energyUsageValue}
                        onChange={(e) => {
                          setEnergyUsageValue(e.target.value);
                          setInputError(null);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/5 outline-none focus:border-emerald-500 focus:bg-white text-xs font-semibold focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* SHOPPING ACTIVE FORMS */}
                {activeTab === "Shopping" && (
                  <div className="space-y-5">
                    <div>
                      <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 font-mono">
                        Product Type Purchased
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {Object.keys(EMISSION_FACTORS.shopping).map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setShoppingItem(key as any);
                              setInputError(null);
                            }}
                            className={`
                              p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative select-none
                              ${shoppingItem === key 
                                ? "border-emerald-500 bg-emerald-50/30 text-emerald-800 shadow-xs" 
                                : "border-neutral-200/60 bg-neutral-50/10 hover:border-neutral-300 hover:bg-neutral-50/80 text-neutral-700"}
                            `}
                          >
                            {shoppingItem === key && (
                              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                            <h4 className="text-xs font-bold capitalize select-none leading-none mt-0.5 font-sans">
                              {key === "clothing" ? "New Apparel" : key === "electronics" ? "Electronics" : "Household Goods"}
                            </h4>
                            <span className="text-[9px] text-neutral-400 block mt-1.5 font-mono">
                              {formatCo2(EMISSION_FACTORS.shopping[key as keyof typeof EMISSION_FACTORS.shopping])} kg/item
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="max-w-xs">
                      <label htmlFor="units-input" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                        Quantity Bought
                      </label>
                      <input
                        id="units-input"
                        type="number"
                        required
                        min="0"
                        step="any"
                        placeholder="Enter quantity"
                        value={shoppingQuantity}
                        onChange={(e) => {
                          setShoppingQuantity(e.target.value);
                          setInputError(null);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/5 outline-none focus:border-emerald-500 focus:bg-white text-xs font-semibold focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* WASTE DISPOSALS ACTIVE FORMS */}
                {activeTab === "Waste" && (
                  <div className="space-y-4">
                    <div className="max-w-xs">
                      <label htmlFor="trash-input" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                        Waste Generated (kg)
                      </label>
                      <input
                        id="trash-input"
                        type="number"
                        required
                        min="0"
                        step="any"
                        placeholder="Enter mass in kg"
                        value={wasteAmount}
                        onChange={(e) => {
                          setWasteAmount(e.target.value);
                          setInputError(null);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/5 outline-none focus:border-emerald-500 focus:bg-white text-xs font-semibold focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 block leading-normal max-w-sm font-sans font-medium">
                      Standard factor: <strong className="font-mono text-emerald-800">{EMISSION_FACTORS.waste.householdKg} kg CO₂</strong> of greenhouse impact per kilogram of non-diverted landfill trash.
                    </span>
                  </div>
                )}
              </div>

              {/* Action row is anchored close to the inputs */}
              <div className="pt-5 border-t border-neutral-100 space-y-3.5">
                {/* Error Banner */}
                {inputError && (
                  <div className="p-3 bg-red-50/75 border border-red-100 text-xs font-semibold text-red-850 rounded-xl animate-fade-in flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{inputError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successMsg && !inputError && (
                  <div className="p-3 bg-emerald-50/65 border border-emerald-100 text-xs font-semibold text-emerald-900 rounded-xl animate-fade-in flex items-center justify-center gap-1.5">
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white font-semibold text-xs p-3.5 rounded-xl hover:bg-emerald-700 shadow-xs transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_10px_rgba(16,185,129,0.15)]"
                >
                  <BookmarkPlus aria-hidden="true" size={14} />
                  <span>{loading ? "Adding track..." : "Add to Dashboard"}</span>
                </button>
              </div>

            </div>

            {/* RIGHT PREVIEW COLUMN (Spans 4 - Reduced from 5 to make it secondary) */}
            <div className="md:col-span-4 bg-neutral-50/30 border border-neutral-100 p-5 rounded-2xl flex flex-col justify-between space-y-5">
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
                    Estimated Carbon Impact
                  </span>
                  <span className="flex items-center gap-1 bg-emerald-50/80 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-150/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>PREVIEW</span>
                  </span>
                </div>

                <div className="bg-white border border-neutral-100 p-4 rounded-xl shadow-xs space-y-2 text-left">
                  <div className="flex items-baseline justify-between gap-1 font-sans">
                    <span className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                      {formatCo2(live.amount)} <span className="text-xs font-semibold text-neutral-400">kg CO₂e</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full">
                      {live.category}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-neutral-500 font-medium leading-relaxed font-mono truncate">
                    {live.description || "Enter active values to calculate..."}
                  </p>

                  <div className="border-t border-neutral-100/60 pt-1.5 text-[10px] text-emerald-700 font-semibold font-mono">
                    {getEmissionEquivalency(live.amount)}
                  </div>
                </div>

                {/* Workflow stepper progress */}
                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                    Guided Work Flow
                  </span>
                  <div className="space-y-2">
                    {[
                      { step: 1, label: "Select active category", desc: activeTab, done: true },
                      { step: 2, label: "Define input metrics & factor", desc: live.valLabel, done: parseFloat(live.valLabel) > 0 },
                      { step: 3, label: "Evaluate live impact report", desc: `${formatCo2(live.amount)} kg`, done: parseFloat(live.valLabel) > 0 },
                      { step: 4, label: "Commit to workspace logger", desc: "Ready to log", done: false },
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${step.done ? "bg-emerald-600" : "bg-neutral-200"}`}>
                          {step.done ? "✓" : step.step}
                        </div>
                        <div className="min-w-0 flex-1 flex justify-between items-center text-[10.5px]">
                          <span className={`font-medium ${step.done ? "text-neutral-700 font-semibold" : "text-neutral-400"}`}>{step.label}</span>
                          {step.desc && (
                            <span className="text-[9px] text-emerald-800 font-semibold font-mono bg-emerald-50/50 px-1.5 py-0.5 rounded ml-2 truncate max-w-[100px]">
                              {step.desc}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Eco tip box inside layout */}
              <div className="bg-emerald-50/30 border border-emerald-100/40 p-4 rounded-xl space-y-1.5 text-left">
                <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block font-mono">
                  💡 Active Eco-Tip
                </span>
                <p className="text-[10.5px] text-neutral-600 font-medium leading-normal">
                  {getFeedbackDetails(live.category, live.amount).ecoTip}
                </p>
              </div>

            </div>

          </div>
        </form>

      </div>

    </div>
  );
}

