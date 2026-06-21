import React from "react";
import { Trees, Goal } from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip,
  LineChart,
  Line,
  Legend
} from "recharts";

interface EmissionsChartsProps {
  chartInterval: "weekly" | "monthly";
  setChartInterval: (val: "weekly" | "monthly") => void;
  activitiesLength: number;
  last7DaysChartData: any[];
  past4WeeksChartData: any[];
  forecastChartData: any[];
  setActivePage: (page: string) => void;
}

const EmissionsCharts: React.FC<EmissionsChartsProps> = ({
  chartInterval,
  setChartInterval,
  activitiesLength,
  last7DaysChartData,
  past4WeeksChartData,
  forecastChartData,
  setActivePage
}) => {
  return (
    <>
      {/* PRIMARY CARBON TREND AREA CHART */}
      <div className="bg-white p-5 rounded-xl border border-neutral-100 shadow-xs space-y-4 transition-all duration-200 hover:shadow-xs hover:border-neutral-150">
        <div className="flex items-center justify-between border-b border-neutral-50 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">Carbon Trends</h3>
            <p className="text-[11px] text-neutral-450 mt-0.5">Carbon index trends calculated by cycle variables.</p>
          </div>
          
          <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/50">
            <button
              onClick={() => setChartInterval("weekly")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                chartInterval === "weekly" ? "bg-white text-emerald-800 shadow-xs" : "text-gray-500 hover:text-gray-950"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setChartInterval("monthly")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                chartInterval === "monthly" ? "bg-white text-emerald-800 shadow-xs" : "text-gray-500 hover:text-gray-950"
              }`}
            >
              4W
            </button>
          </div>
        </div>

        <div className="h-56 flex items-center justify-center bg-neutral-50/20 rounded-xl border border-neutral-100/50">
          {activitiesLength === 0 ? (
            <div className="text-center p-6 space-y-2">
              <Trees aria-hidden="true" className="w-8 h-8 text-emerald-500/40 mx-auto animate-pulse" />
              <div>
                <p className="text-xs font-bold text-neutral-700">No index trends available yet</p>
                <p className="text-[10px] text-neutral-450 max-w-[280px] mx-auto leading-relaxed mt-0.5">
                  Your trend graphs calibrate once you log your first dynamic commute, diet choice, or home energy consumption.
                </p>
              </div>
              <button 
                onClick={() => setActivePage("tracker")}
                className="text-[10px] text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
              >
                Log First Activity Choice
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartInterval === "weekly" ? last7DaysChartData : past4WeeksChartData} 
                margin={{ left: -25, right: 10, top: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="chartGradientGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} unit="kg" />
                <ChartTooltip 
                  contentStyle={{ borderRadius: '8px', borderColor: '#f3f4f6', boxShadow: 'none' }} 
                  labelStyle={{ fontWeight: 'bold', fontSize: '10px', color: '#111827' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="co2" 
                  name="Emissions (kg CO₂e)" 
                  stroke="#10B981" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#chartGradientGreen)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* PROJECTED CARBON TREND */}
      <div className="bg-white p-5 rounded-xl border border-neutral-100 shadow-xs space-y-4 transition-all duration-200 hover:shadow-xs hover:border-neutral-150">
        <div className="flex items-center justify-between border-b border-neutral-50 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">Projected Carbon Trend</h3>
            <p className="text-[11px] text-neutral-450 mt-0.5">Dotted projection modeled relative to target goals.</p>
          </div>
        </div>

        <div className="h-56 flex items-center justify-center bg-neutral-50/20 rounded-xl border border-neutral-100/50">
          {activitiesLength === 0 ? (
            <div className="text-center p-6 space-y-2">
              <Goal aria-hidden="true" className="w-8 h-8 text-neutral-450/40 mx-auto animate-pulse" />
              <div>
                <p className="text-xs font-bold text-neutral-700">Predictive analysis is waiting for logs</p>
                <p className="text-[10px] text-neutral-450 max-w-[280px] mx-auto leading-relaxed mt-0.5">
                  Our dynamic carbon forecast requires at least one daily activity to model future carbon budgets as well as emission reductions.
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastChartData} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} unit="kg" />
                <ChartTooltip 
                  contentStyle={{ borderRadius: '8px', borderColor: '#f3f4f6' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '10px', color: '#111827' }}
                />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  name="Actual (kg)" 
                  stroke="#10B981" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="prediction" 
                  name="Projected Carbon Trend (kg)" 
                  stroke="#94A3B8" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4" 
                  dot={{ r: 2 }} 
                  activeDot={{ r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
};

export default EmissionsCharts;
