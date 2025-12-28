
import React from 'react';
import { SoilData } from '../types';

interface Props {
  data: SoilData;
}

const SoilDashboard: React.FC<Props> = ({ data }) => {
  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase() || '') {
      case 'high': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getPhColor = (val: number) => {
    if (val < 6) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (val > 8) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  const metrics = [
    { label: 'Nitrogen', value: data.N, level: data.N_level, symbol: 'N', icon: 'fa-vial' },
    { label: 'Phosphorus', value: data.P, level: data.P_level, symbol: 'P', icon: 'fa-flask' },
    { label: 'Potassium', value: data.K, level: data.K_level, symbol: 'K', icon: 'fa-atom' },
    { label: 'pH Balance', value: data.ph?.toFixed(1), level: data.pH_level, symbol: 'pH', icon: 'fa-droplet' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
      {metrics.map((m, i) => (
        <div key={i} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-xl transition-all">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <i className={`fas ${m.icon} text-xl`}></i>
          </div>

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{m.label}</p>

          <div className="mb-4">
            <span className="text-3xl font-black text-slate-900 leading-none">{m.value}</span>
            <span className="text-[10px] font-black text-slate-300 ml-1 uppercase tracking-widest">{m.symbol === 'pH' ? '' : 'PPM'}</span>
          </div>

          <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200 text-slate-400`}>
            STABLE
          </div>
        </div>
      ))}
    </div>
  );
};

export default SoilDashboard;
