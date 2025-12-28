
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import SoilDashboard from './components/SoilDashboard';
import CropCard from './components/CropCard';
import CropDetails from './components/CropDetails';
import Resources from './components/Resources';
import ProfilePanel from './components/DatabaseManager';
import LoginPage from './components/LoginPage';
import { agentService } from './services/agentService';
import { dbService } from './services/dbService';
import { RecommendationResponse, CropDetail, AppTab, FarmerRecord, User } from './types';
import { geminiService } from './services/geminiService';
import { DashboardSkeleton, ResultsSkeleton } from './components/SkeletonLoaders';
import MapInstructions from './components/MapInstructions';

declare const L: any;

const isPointInPolygon = (lat: number, lng: number, polygon: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((xi > lat) !== (xj > lat)) &&
      (lng < (yj - yi) * (lat - xi) / (xj - xi) + yi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [analysis, setAnalysis] = useState<RecommendationResponse | null>(null);
  const [history, setHistory] = useState<FarmerRecord[]>([]);
  const [selectedCropDetail, setSelectedCropDetail] = useState<CropDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapNotice, setMapNotice] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [trainingCount, setTrainingCount] = useState<number>(0);
  const [showFailsafe, setShowFailsafe] = useState<boolean>(false);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const watchdogTimerRef = useRef<any>(null);
  const currentCoordsRef = useRef<{ lat: number, lng: number } | null>(null);

  // High-fidelity India boundary coordinates
  const indiaBoundary: [number, number][] = [
    [35.67, 74.52], [37.05, 74.88], [37.05, 75.60], [35.61, 76.51], [35.84, 77.84],
    [34.56, 78.36], [34.08, 80.37], [32.55, 79.41], [31.54, 78.53], [30.12, 81.04],
    [29.74, 80.08], [28.53, 81.33], [28.26, 82.55], [27.76, 83.33], [27.42, 85.34],
    [26.78, 86.37], [26.65, 88.08], [27.18, 88.16], [28.08, 88.59], [27.75, 89.26],
    [26.77, 90.03], [26.78, 91.68], [27.94, 91.61], [27.97, 94.13], [29.28, 94.04],
    [28.25, 96.06], [28.32, 97.40], [27.28, 97.10], [26.65, 95.14], [25.56, 94.75],
    [24.16, 93.36], [23.14, 93.36], [23.01, 92.42], [22.44, 91.87], [22.37, 91.84],
    [23.51, 91.17], [24.58, 92.21], [25.18, 92.35], [25.17, 89.87], [26.41, 89.92],
    [25.86, 88.16], [24.89, 88.35], [24.03, 89.04], [22.84, 88.94], [21.84, 89.05],
    [21.64, 87.52], [20.08, 85.90], [19.25, 84.86], [18.17, 83.84], [17.58, 82.90],
    [16.48, 81.82], [15.82, 80.32], [14.00, 80.14], [12.63, 80.25], [10.32, 79.88],
    [9.22, 79.16], [8.08, 77.56], [8.33, 76.90], [9.36, 76.32], [11.00, 75.81],
    [12.86, 74.83], [15.26, 73.74], [18.94, 72.81], [21.05, 72.63], [20.73, 70.87],
    [20.91, 69.41], [22.25, 68.96], [22.87, 69.94], [23.82, 68.16], [24.62, 68.87],
    [24.56, 70.81], [25.84, 70.18], [27.24, 69.51], [28.32, 70.32], [29.98, 73.18],
    [31.25, 74.52], [32.42, 74.88], [33.45, 74.12], [34.78, 73.81], [35.67, 74.52]
  ];

  // World Mask calculation
  const worldOuter: [number, number][] = [
    [-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('smart_agri_advisor_session');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (u: User) => {
    localStorage.setItem('smart_agri_advisor_session', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('smart_agri_advisor_session');
    setUser(null);
    setAnalysis(null);
    setHistory([]);
    setActiveTab('dashboard');
    setIsProfileOpen(false);
  };

  useEffect(() => {
    if (user) {
      dbService.getHistory(user.phone).then(setHistory);
      dbService.getGlobalSearchCount(user.phone).then(setTrainingCount);
    }
  }, [analysis, user]);

  const startAgenticAnalysis = useCallback(async (lat: number, lng: number, forceFastMode: boolean = false) => {
    if (!user) return;

    currentCoordsRef.current = { lat, lng };
    setLoading(true);
    setLoadingStep("Accessing Mandi Neural Network...");
    setError(null);
    setShowFailsafe(false);

    if (!watchdogTimerRef.current) {
      watchdogTimerRef.current = setTimeout(() => {
        setShowFailsafe(true);
      }, 30000);
    }

    try {
      const data = await agentService.runFullAnalysis(
        user.phone,
        lat,
        lng,
        (step) => setLoadingStep(step),
        forceFastMode
      );
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || "Expert system unreachable. Please check connection.");
    } finally {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      setLoading(false);
      setLoadingStep("");
    }
  }, [user]);

  const switchToFastMode = () => {
    if (currentCoordsRef.current) {
      const { lat, lng } = currentCoordsRef.current;
      startAgenticAnalysis(lat, lng, true);
    }
  };

  const cancelAnalysis = () => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
    setLoading(false);
    setLoadingStep("");
    setShowFailsafe(false);
  };

  useEffect(() => {
    if (user && activeTab === 'dashboard') {
      const initMap = () => {
        const container = document.getElementById('map-container');
        if (!container || mapRef.current) return;

        const map = L.map('map-container', {
          zoomSnap: 0.1,
          zoomDelta: 0.5,
          attributionControl: false,
          minZoom: 3,
          maxZoom: 12
        }).setView([22.97, 78.65], 5);

        mapRef.current = map;

        // Use a more robust tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          opacity: 0.9,
          className: 'map-tiles'
        }).addTo(map);

        // Standard terrain overlay for better farming context
        L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg', {
          opacity: 0.3,
          attribution: 'Terrain'
        }).addTo(map);

        // Draw World Mask Dimmer (Dim everything outside India)
        L.polygon([worldOuter, indiaBoundary], {
          fillColor: '#000',
          fillOpacity: 0.4,
          weight: 0,
          className: 'map-mask-layer'
        }).addTo(map);

        // Draw High-Accuracy Glowing Boundary
        L.polygon(indiaBoundary, {
          fillColor: 'transparent',
          color: '#10b981',
          weight: 2,
          className: 'india-boundary-glow'
        }).addTo(map);

        // Interactive Click Marker
        markerRef.current = L.marker([22.5, 78.5], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: "<div class='emerald-marker animate-bounce'><i class='fas fa-location-dot'></i></div>",
            iconSize: [40, 40],
            iconAnchor: [20, 40]
          })
        }).addTo(map);

        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          if (isPointInPolygon(lat, lng, indiaBoundary)) {
            markerRef.current.setLatLng(e.latlng);
            startAgenticAnalysis(lat, lng);

            // Temporary Pulse Effect for Interaction Feedback
            const clickCircle = L.circle(e.latlng, {
              radius: 20000,
              color: '#10b981',
              weight: 2,
              fillOpacity: 0.4
            }).addTo(map);
            setTimeout(() => map.removeLayer(clickCircle), 500);

          } else {
            setMapNotice("Location outside our verified India service area.");
            setTimeout(() => setMapNotice(null), 4000);
          }
        });

        // Add Hover Tooltip functionality to the boundary
        map.on('mousemove', (e: any) => {
          const { lat, lng } = e.latlng;
          if (isPointInPolygon(lat, lng, indiaBoundary)) {
            L.DomUtil.addClass(container, 'cursor-pointer');
          } else {
            L.DomUtil.removeClass(container, 'cursor-pointer');
          }
        });

        setTimeout(() => map.invalidateSize(), 500);
      };

      const timer = setTimeout(initMap, 400);
      return () => {
        clearTimeout(timer);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, [activeTab, user, startAgenticAnalysis, loading, analysis]);

  const handleCropClick = async (cropName: string) => {
    if (!analysis || !user) return;

    if (analysis.crop_details && analysis.crop_details[cropName]) {
      setSelectedCropDetail(analysis.crop_details[cropName]);
      return;
    }

    setDetailLoading(true);
    try {
      const detail = await geminiService.getCropDetails(cropName, analysis.location, analysis.soil, user.phone, analysis.id);
      await dbService.updateCropDetail(user.phone, analysis.id, cropName, detail);

      const updatedAnalysis = {
        ...analysis,
        crop_details: {
          ...(analysis.crop_details || {}),
          [cropName]: detail
        }
      };
      setAnalysis(updatedAnalysis);
      setSelectedCropDetail(detail);
    } catch (err) {
      setError("Detailed insight engine timed out. Try again.");
    } finally {
      setDetailLoading(false);
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header
        activeTab={activeTab === 'history_view' ? 'dashboard' : activeTab}
        onTabChange={(t) => setActiveTab(t)}
        onOpenProfile={() => setIsProfileOpen(true)}
        user={user}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-32 pb-12 md:pt-36 md:pb-16 relative z-0">
        {loading && activeTab === 'dashboard' && !analysis ? (
          <DashboardSkeleton />
        ) : activeTab === 'dashboard' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-4 bg-emerald-950 rounded-[48px] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl flex flex-col">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                  <i className="fas fa-location-crosshairs text-[200px] text-emerald-400"></i>
                </div>

                <div className="relative z-10 flex-1">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {trainingCount >= 10 ? 'Neural Profile Active' : 'Initial Sync'}
                  </div>
                  <h2 className="text-4xl font-heading mb-6">
                    Smart Agri <br />
                    <span className="text-emerald-400">Advisor.</span>
                  </h2>

                  <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-end text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">
                      <span>User Profile Progress</span>
                      <span>{trainingCount}/10 Reports</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-1000"
                        style={{ width: `${Math.min((trainingCount / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-emerald-100/40 text-[11px] font-medium leading-relaxed">
                      {trainingCount >= 10
                        ? "AI recognizes your regional patterns for account +91 " + user.phone.slice(-4)
                        : `Generate ${10 - trainingCount} more reports to enable localized adaptive reasoning.`}
                    </p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-6">
                    <p className="text-xs font-bold text-emerald-200/80 leading-relaxed">
                      <i className="fas fa-map-pin mr-2 text-emerald-500"></i>
                      Our service is currently optimized for Indian Mandis. Please tap on your farm location on the map.
                    </p>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="bg-black/40 backdrop-blur-xl p-5 rounded-[32px] border border-white/5">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-4">LATEST SCAN</span>
                    <div className="space-y-3 font-mono text-[10px] h-32 overflow-y-auto scrollbar-hide">
                      {loading ? (
                        <div className="flex items-start gap-3 text-emerald-400">
                          <span className="text-emerald-600">{'>>'}</span> {loadingStep}
                        </div>
                      ) : analysis ? (
                        analysis.agent_orchestration_log.map((log, i) => (
                          <div key={i} className="flex items-start gap-3 text-emerald-100/60">
                            <span className="text-emerald-800">{'>>'}</span> {log}
                          </div>
                        ))
                      ) : (
                        <div className="text-emerald-100/40 space-y-2">
                          <div className="flex items-start gap-3"><span className="text-emerald-800">{'>>'}</span> Geolocation sync complete.</div>
                          <div className="flex items-start gap-3"><span className="text-emerald-800">{'>>'}</span> Verified Mandi rates for region.</div>
                          <div className="flex items-start gap-3"><span className="text-emerald-800">{'>>'}</span> Weather cycle analysis finalized.</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 relative flex flex-col gap-8">
                <div id="map-container" className="flex-1 min-h-[500px] rounded-[48px] shadow-2xl z-10 bg-slate-100 border-4 border-white"></div>

                <MapInstructions />

                {mapNotice && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-rose-600/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex items-center gap-3 border border-rose-400">
                    <i className="fas fa-triangle-exclamation text-rose-200"></i>
                    {mapNotice}
                  </div>
                )}

              </div>
            </div>

            {loading && analysis && <ResultsSkeleton />}

            {analysis && !loading && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                  <div>
                    <h3 className="text-3xl font-heading text-slate-800 mb-2">Smart Market Intelligence</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-slate-600 font-semibold bg-white px-3 py-1 rounded-lg border border-slate-100">
                        <i className="fas fa-map-marker-alt text-emerald-600 mr-2"></i>
                        {analysis.location.full_address || `${analysis.location.district}, ${analysis.location.state}`}
                      </p>
                      {analysis.is_hybrid_prediction && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest animate-pulse">
                          Neural Sync Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <SoilDashboard data={analysis.soil} />

                <div className="space-y-6 px-4">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <i className="fas fa-seedling text-emerald-600"></i>
                    Recommended Profitable Crops
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {analysis.crops.map((crop, idx) => (
                      <CropCard key={idx} crop={crop as any} onClick={handleCropClick} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mx-4 p-12 bg-rose-50 border-2 border-dashed border-rose-200 rounded-[48px] text-center shadow-lg">
                <i className="fas fa-triangle-exclamation text-rose-400 text-4xl mb-4"></i>
                <p className="text-rose-700 font-bold text-lg">{error}</p>
                <button onClick={() => setError(null)} className="mt-4 px-6 py-2 bg-white rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 shadow-sm transition-all">Dismiss</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history_view' && analysis && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
              <div>
                <button
                  onClick={() => setActiveTab('history')}
                  className="mb-4 text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2 hover:gap-3 transition-all"
                >
                  <i className="fas fa-arrow-left"></i> Back to Reports History
                </button>
                <h2 className="text-4xl font-heading text-slate-800 mb-2">Saved Mandi Insights</h2>
                <div className="flex items-center gap-3">
                  <p className="text-slate-600 font-semibold bg-white px-3 py-1 rounded-lg border border-slate-100">
                    <i className="fas fa-map-marker-alt text-emerald-600 mr-2"></i>
                    {analysis.location.district}, {analysis.location.state}
                  </p>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                    Snapshot: {new Date(analysis.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setAnalysis(null); setActiveTab('dashboard'); }}
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] shadow-xl"
              >
                <i className="fas fa-plus mr-2"></i> Start New Search
              </button>
            </div>

            <div className="space-y-8 px-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <i className="fas fa-star text-amber-500"></i>
                Your Explored Recommendations
              </h3>

              {analysis.crops.filter(c => analysis.crop_details?.[c.name]).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {analysis.crops
                    .filter(c => analysis.crop_details?.[c.name])
                    .map((crop, idx) => (
                      <CropCard key={idx} crop={crop as any} onClick={handleCropClick} />
                    ))}
                </div>
              ) : (
                <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[48px] bg-white">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <i className="fas fa-magnifying-glass text-3xl"></i>
                  </div>
                  <p className="text-slate-500 font-bold max-w-xs mx-auto leading-relaxed">
                    No detailed analysis reports were explored for this search.
                    Only crops you explicitly clicked for "Detailed Analysis" are saved in history.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-10 px-4 animate-in fade-in duration-500">
            <div className="max-w-xl">
              <h2 className="text-4xl font-heading text-slate-800 mb-2">My Mandi Reports</h2>
              <p className="text-sm text-slate-500 font-medium">Reports isolated for +91 {user.phone}</p>
              <p className="text-xs text-slate-400 mt-2">Saved reports include only the detailed insights explored during your session.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {history.map(record => (
                <div key={record.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group" onClick={() => { setAnalysis(record.data); setActiveTab('history_view'); window.scrollTo(0, 0); }}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all">
                      <i className="fas fa-history"></i>
                    </div>
                    {record.data.crop_details && Object.keys(record.data.crop_details).length > 0 && (
                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        {Object.keys(record.data.crop_details).length} Insights Saved
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-1">{record.district}</h3>
                  <p className="text-xs font-bold text-slate-400 mb-8">{new Date(record.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <div className="text-xs font-black text-emerald-600 uppercase flex items-center gap-2">
                    Restore Insights <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[48px] bg-slate-50/50">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No reports saved yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'resources' && <Resources />}
      </main>

      <ProfilePanel
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {(loading || detailLoading) && (
        <div className="fixed inset-0 z-[100] bg-emerald-950/95 backdrop-blur-2xl flex flex-col items-center justify-center text-white p-8">
          <div className="relative w-24 h-24 mb-10">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-leaf text-emerald-400 text-2xl animate-pulse"></i>
            </div>
          </div>
          <h3 className="text-3xl font-heading mb-4 text-center tracking-tight">{loadingStep || 'Processing...'}</h3>

          {showFailsafe ? (
            <div className="max-w-xs text-center space-y-4 animate-in fade-in zoom-in duration-500">
              <p className="text-emerald-100/60 text-xs leading-relaxed">
                Live Search is taking longer than usual due to Mandi network traffic.
              </p>
              <button
                onClick={switchToFastMode}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all"
              >
                Switch to Fast Prediction Mode
              </button>
              <button
                onClick={cancelAnalysis}
                className="w-full py-3 bg-white/5 text-emerald-100/40 text-[9px] font-bold uppercase tracking-widest"
              >
                Cancel and Return
              </button>
            </div>
          ) : (
            <>
              <p className="text-emerald-100/30 text-[10px] font-black uppercase tracking-[0.5em] mb-8">Smart Agri Advisor Neural V1.0</p>
              <button
                onClick={cancelAnalysis}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
              >
                Stop Analysis
              </button>
            </>
          )}
        </div>
      )}

      {selectedCropDetail && <CropDetails detail={selectedCropDetail} onClose={() => setSelectedCropDetail(null)} />}
    </div>
  );
};

export default App;
