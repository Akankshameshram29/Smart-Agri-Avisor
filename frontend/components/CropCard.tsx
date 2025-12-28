
import React from 'react';
import { CropPriceInfo } from '../types';

interface Props {
  crop: CropPriceInfo;
  onClick: (name: string) => void;
}

const CropCard: React.FC<Props> = ({ crop, onClick }) => {
  const min = crop.price_range?.min ?? crop.current_price * 0.9;
  const max = crop.price_range?.max ?? crop.current_price * 1.1;
  const priceSpread = max - min;
  const volatilityScore = crop.current_price > 0 ? (priceSpread / crop.current_price) : 0;
  const rangePosition = priceSpread > 0
    ? Math.min(Math.max(((crop.current_price - min) / priceSpread) * 100, 0), 100)
    : 50;

  const getVolatilityData = (score: number) => {
    if (score > 0.4) {
      return {
        label: "Market High-Yield",
        icon: "fa-chart-line-up",
        color: "text-rose-600 bg-rose-50 border-rose-100",
        barColor: "bg-rose-500",
        indicator: "bg-rose-600",
        description: "Dynamic pricing with significant growth potential."
      };
    } else if (score > 0.15) {
      return {
        label: "Stable Demand",
        icon: "fa-scale-unbalanced",
        color: "text-amber-600 bg-amber-50 border-amber-100",
        barColor: "bg-amber-500",
        indicator: "bg-amber-600",
        description: "Consistent market performance and reliable demand."
      };
    } else {
      return {
        label: "Low Risk Premium",
        icon: "fa-shield-check",
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        barColor: "bg-emerald-500",
        indicator: "bg-emerald-600",
        description: "Highly predictable pricing for minimum risk strategies."
      };
    }
  };

  const volatility = getVolatilityData(volatilityScore);

  return (
    <div
      onClick={() => onClick(crop.name)}
      className="group bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
    >
      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
        <i className="fas fa-leaf text-8xl text-emerald-900"></i>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-wrap gap-2">
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-emerald-100">
              MANDI-AGENT
            </span>
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-emerald-100">
              HIGH PROFIT
            </span>
          </div>
        </div>

        <h3 className="text-3xl font-black text-slate-900 mb-10 leading-tight">{crop.name}</h3>

        <div className="bg-slate-50/80 backdrop-blur rounded-[32px] p-8 mb-8 border border-slate-100/50">
          <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">MANDI AVERAGE</span>
              <span className="text-4xl font-black text-slate-900 leading-none">₹{crop.current_price.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">RATE / <br />QUINTAL</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-50/50 p-6 rounded-[24px] border border-emerald-100/50">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                <i className="fas fa-robot text-emerald-500"></i>
                AI ADVISOR TIP
              </p>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">
                "{crop.agent_notes || "Stable demand expected this season with moderate growth potential."}"
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100 group/btn">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover/btn:text-emerald-600 transition-colors">GET FULL PLAN</span>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover/btn:bg-emerald-600 group-hover/btn:text-white transition-all shadow-sm">
            <i className="fas fa-arrow-right text-sm"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropCard;
