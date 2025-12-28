
import React from 'react';

export const SidebarSkeleton = () => (
    <div className="lg:col-span-4 bg-emerald-950 rounded-[48px] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl flex flex-col animate-pulse">
        <div className="h-6 w-32 bg-emerald-800/50 rounded-full mb-6"></div>
        <div className="h-12 w-48 bg-emerald-800/50 rounded-xl mb-6"></div>
        <div className="space-y-4 mb-10">
            <div className="h-2 w-full bg-emerald-800/20 rounded-full"></div>
            <div className="h-10 w-full bg-emerald-800/30 rounded-2xl"></div>
        </div>
        <div className="mt-auto h-32 w-full bg-black/20 rounded-[32px]"></div>
    </div>
);

export const MapSkeleton = () => (
    <div className="lg:col-span-8 h-[500px] bg-slate-200 rounded-[48px] animate-pulse flex items-center justify-center border-4 border-white shadow-xl">
        <div className="flex flex-col items-center gap-4 text-slate-400">
            <i className="fas fa-map-location-dot text-6xl opacity-20"></i>
            <p className="font-black text-[10px] uppercase tracking-[0.3em] opacity-40">Synchronizing Map Data...</p>
        </div>
    </div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <SidebarSkeleton />
            <MapSkeleton />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-white rounded-[32px] border border-slate-100 p-8 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50"></div>
                    <div className="h-4 w-24 bg-slate-50 rounded-full"></div>
                    <div className="h-8 w-16 bg-slate-50 rounded-lg"></div>
                </div>
            ))}
        </div>
    </div>
);

export const ResultsSkeleton = () => (
    <div className="space-y-12 animate-pulse mt-12">
        <div className="h-10 w-64 bg-slate-200 rounded-lg mx-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-white rounded-[32px] border border-slate-100"></div>
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-white rounded-[40px] border border-slate-100"></div>
            ))}
        </div>
    </div>
);
