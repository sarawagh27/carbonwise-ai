import React from "react";
import { Car, Activity, Zap, Flame } from "lucide-react";

interface ImpactCardsProps {
  todayEmissions: number;
  todayPctChange: number;
  carbonSavedKg: number;
  carbonBudgetRemaining: number;
  budgetProgressPct: number;
  streak: number;
}

const ImpactCards: React.FC<ImpactCardsProps> = ({
  todayEmissions,
  todayPctChange,
  carbonSavedKg,
  carbonBudgetRemaining,
  budgetProgressPct,
  streak
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-3.5 rounded-xl border border-neutral-100 shadow-xs flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-neutral-200">
        <div className="space-y-0.5">
          <span className="text-[10px] font-medium text-neutral-400 tracking-wide block">Today's Footprint</span>
          <span className="text-xl font-bold text-neutral-900 tracking-tight block">
            {todayEmissions.toFixed(1)} <span className="text-xs font-semibold text-neutral-400">kg CO₂e</span>
          </span>
          <span className={`text-[10px] font-bold flex items-center gap-1 ${todayPctChange <= 0 ? "text-emerald-650" : "text-amber-600"}`}>
            {todayPctChange <= 0 ? "↓" : "↑"} {Math.abs(todayPctChange).toFixed(0)}% vs daily budget
          </span>
        </div>
        <div className="p-2.5 bg-neutral-50 text-neutral-500 rounded-lg">
          <Car size={15} />
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-neutral-100 shadow-xs flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-neutral-200">
        <div className="space-y-0.5">
          <span className="text-[10px] font-medium text-neutral-400 tracking-wide block">Carbon Savings</span>
          <span className="text-xl font-bold text-emerald-600 tracking-tight block">
            {carbonSavedKg} <span className="text-xs font-semibold text-emerald-500">kg CO₂e</span>
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            Targets achieved this cycle
          </span>
        </div>
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
          <Activity size={15} />
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-neutral-100 shadow-xs flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-neutral-200">
        <div className="space-y-0.5">
          <span className="text-[10px] font-medium text-neutral-400 tracking-wide block">Carbon Budget</span>
          <span className="text-xl font-bold text-neutral-900 tracking-tight block">
            {carbonBudgetRemaining} <span className="text-xs font-semibold text-neutral-400">kg left</span>
          </span>
          <div className="w-20 bg-neutral-100 h-1 rounded-full overflow-hidden mt-1.5 animate-pulse">
            <div className="h-full bg-emerald-500" style={{ width: `${100 - budgetProgressPct}%` }} />
          </div>
        </div>
        <div className="p-2.5 bg-yellow-50/70 text-yellow-600 rounded-lg">
          <Zap size={15} />
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-neutral-100 shadow-xs flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-neutral-200">
        <div className="space-y-0.5">
          <span className="text-[10px] font-medium text-neutral-400 tracking-wide block">Habit Streak</span>
          <span className="text-xl font-bold text-amber-600 tracking-tight block">
            {streak} <span className="text-xs font-semibold text-amber-500">Days</span>
          </span>
          <span className="text-[10px] text-amber-600 font-medium block">
            Consistent log cycles
          </span>
        </div>
        <div className="p-2.5 bg-rose-50 text-rose-500 rounded-lg">
          <Flame size={15} className="fill-rose-100" />
        </div>
      </div>
    </div>
  );
};

export default ImpactCards;
