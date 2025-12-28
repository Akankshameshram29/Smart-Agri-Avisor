
import React from 'react';

const MapInstructions = () => {
    const steps = [
        {
            icon: 'fa-earth-asia',
            title: 'Locate Region',
            desc: 'Pan and zoom the satellite map to find your farming location.'
        },
        {
            icon: 'fa-location-dot',
            title: 'Analyze Plot',
            desc: 'Tap anywhere within the highlighted green border to request analysis.'
        },
        {
            icon: 'fa-microchip',
            title: 'AI Processing',
            desc: 'Wait for the Neural Engine to process satellite and mandi data.'
        },
        {
            icon: 'fa-chart-pie',
            title: 'View Results',
            desc: 'Check the real-time soil data and personalized market insights below.'
        }
    ];

    return (
        <div className="bg-white/40 backdrop-blur-xl rounded-[40px] p-8 border border-white/60 shadow-xl">
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6 xl:gap-12">
                <div className="shrink-0">
                    <h3 className="text-[10px] font-black text-emerald-950 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                        <i className="fas fa-circle-info text-emerald-600"></i>
                        How to use
                    </h3>
                    <p className="font-heading text-2xl text-emerald-900 leading-tight">Agent Guide</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 w-full">
                    {steps.map((s, i) => (
                        <div key={i} className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-emerald-500/20">
                                    {i + 1}
                                </span>
                                <span className="text-xs font-black text-emerald-950 uppercase tracking-widest">{s.title}</span>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500/80 leading-relaxed pl-11">
                                {s.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MapInstructions;
