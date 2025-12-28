
import React, { useState, useEffect } from 'react';
import { ResourceArticle } from '../types';
import { geminiService } from '../services/geminiService';

const Resources: React.FC = () => {
  const [articles, setArticles] = useState<ResourceArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Schemes', 'Techniques', 'Pest Control', 'Weather News', 'Market Insights'];

  const loadResources = async (query: string = '', cat: string = 'All') => {
    setLoading(true);
    try {
      const results = await geminiService.searchResources(query, cat);
      setArticles(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources('', activeCategory);
  }, [activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources(searchQuery, activeCategory);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      {/* Hero Search Section */}
      <div className="bg-emerald-950 rounded-[48px] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <i className="fas fa-book-open text-[240px] rotate-12"></i>
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-5xl font-heading mb-6 leading-tight">Knowledge Hub</h2>
          <p className="text-emerald-100/70 text-lg mb-10 font-medium">
            Access real-time verified agricultural guides, government schemes, and technical research from India's leading agri-portals.
          </p>
          <form onSubmit={handleSearch} className="flex bg-white/10 backdrop-blur-xl rounded-3xl p-3 border border-white/20 focus-within:ring-4 focus-within:ring-emerald-500/20 transition-all shadow-inner">
            <div className="flex items-center px-4 text-emerald-400">
              <i className="fas fa-search text-xl"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search techniques, crop diseases, or new schemes..."
              className="bg-transparent border-none focus:ring-0 flex-1 py-3 text-white placeholder-emerald-100/30 font-semibold"
            />
            <button type="submit" className="bg-emerald-500 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl active:scale-95">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Syncing with Knowledge Portals...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {articles.map(article => (
                <div key={article.id} className="bg-white rounded-[40px] p-8 border border-slate-100 flex flex-col md:flex-row gap-8 hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div className="w-full md:w-56 h-56 rounded-[32px] overflow-hidden shrink-0 bg-emerald-50 flex items-center justify-center border border-emerald-50 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
                    {article.image ? (
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-emerald-200 flex flex-col items-center gap-2">
                        <i className="fas fa-newspaper text-6xl"></i>
                        <span className="text-[10px] font-black uppercase">Guide</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-[9px] font-black border bg-emerald-50 text-emerald-700 border-emerald-100 uppercase tracking-[0.2em]">
                        {article.category}
                      </span>
                      {article.date && (
                        <span className="text-[10px] font-bold text-slate-400">
                          <i className="far fa-clock mr-1"></i> {article.date}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-heading text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">{article.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-medium">{article.excerpt}</p>
                    <div className="pt-4 flex items-center gap-6">
                      <a
                        href={article.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
                      >
                        Read Full Article <i className="fas fa-external-link-alt text-[10px]"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              {articles.length === 0 && (
                <div className="py-32 text-center bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-sm">
                    <i className="fas fa-magnifying-glass text-3xl"></i>
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching articles found in current vault.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info Panels */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm sticky top-24">
            <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <i className="fas fa-link text-emerald-600"></i>
              Live Mandi & Govt Links
            </h3>
            <div className="space-y-4">
              {[
                { label: 'E-Nam (National Market)', url: 'https://www.enam.gov.in/', icon: 'fa-landmark' },
                { label: 'Soil Health Card Portal', url: 'https://soilhealth.dac.gov.in/', icon: 'fa-vial' },
                { label: 'Kisan Suvidha App', url: 'https://kisansuvidha.gov.in/', icon: 'fa-mobile-screen' },
                { label: 'Agmarknet Mandi Rates', url: 'https://agmarknet.gov.in/', icon: 'fa-chart-simple' },
                { label: 'Weather Forecast (IMD)', url: 'https://mausam.imd.gov.in/', icon: 'fa-cloud-sun' }
              ].map(item => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-transparent hover:border-emerald-100 group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <span className="flex-1">{item.label}</span>
                  <i className="fas fa-chevron-right text-[10px] opacity-20"></i>
                </a>
              ))}
            </div>

            <div className="mt-12 bg-emerald-900 rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <i className="fas fa-headset text-6xl"></i>
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                Emergency Support
              </h4>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Kisan Call Center</p>
                  <p className="text-xl font-black">1800-180-1551</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Help Desk</p>
                  <p className="text-xl font-black">011-24300606</p>
                </div>
              </div>
              <p className="text-[9px] text-emerald-100/40 mt-6 leading-relaxed italic">
                *Official government support lines available 24/7 for farmers across India.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
