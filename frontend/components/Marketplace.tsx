
import React, { useState, useEffect } from 'react';
import { MarketItem } from '../types';
import { geminiService } from '../services/geminiService';

const Marketplace: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadItems = async (query: string = '', cat: string = 'Agricultural Supplies') => {
    setLoading(true);
    try {
      const results = await geminiService.searchMarketplace(query || 'Best Selling ' + cat, cat);
      setItems(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems('', filter === 'All' ? 'Agricultural Supplies' : filter);
  }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadItems(searchQuery, filter === 'All' ? 'Agricultural Supplies' : filter);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-emerald-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <i className="fas fa-cart-shopping text-[200px] rotate-12"></i>
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-heading mb-4">Farmer's Marketplace</h2>
          <p className="text-emerald-100/80 text-lg mb-8">Compare and buy tools, seeds, fertilizers, and medicines from multiple Indian agricultural portals in real-time.</p>
          <form onSubmit={handleSearch} className="flex bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you need? (e.g. Tractor, Urea, Tomato seeds...)" 
              className="bg-transparent border-none focus:ring-0 flex-1 px-4 py-2 text-white placeholder-emerald-200/50"
            />
            <button type="submit" className="bg-emerald-500 px-6 py-2 rounded-xl font-bold hover:bg-emerald-400 transition-colors shadow-lg">
              <i className="fas fa-search mr-2"></i> Search
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {['All', 'Seeds', 'Fertilizers', 'Equipment', 'Medicines'].map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all border flex items-center gap-2 ${
              filter === cat 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
            }`}
          >
            {cat === 'Medicines' && <i className="fas fa-capsules text-xs opacity-60"></i>}
            {cat === 'Seeds' && <i className="fas fa-seedling text-xs opacity-60"></i>}
            {cat === 'Fertilizers' && <i className="fas fa-flask text-xs opacity-60"></i>}
            {cat === 'Equipment' && <i className="fas fa-tractor text-xs opacity-60"></i>}
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">Connecting to BigHaat, AgriBegri, and Amazon for live prices...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all flex flex-col">
              <div className="relative h-56 overflow-hidden bg-slate-50 flex items-center justify-center p-6">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <i className="fas fa-box-open text-6xl"></i>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
                    {item.category || filter}
                  </span>
                  {item.website_name && (
                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-slate-800 shadow-sm border border-slate-100">
                      {item.website_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-slate-800 leading-tight h-12 overflow-hidden">{item.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold shrink-0 bg-amber-50 px-2 py-1 rounded-lg">
                    <i className="fas fa-star"></i>
                    {item.rating || '4.5'}
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 flex-1">{item.description || 'Quality verified agricultural input.'}</p>
                <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                  <div>
                    <div className="text-xl font-black text-emerald-600">₹{item.price.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.unit || 'Standard Pack'}</div>
                  </div>
                  <a 
                    href={item.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                  >
                    Buy Item <i className="fas fa-external-link-alt text-[10px]"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-search text-slate-200 text-4xl"></i>
              </div>
              <p className="text-slate-400 font-bold">No products found for this category. Try searching for something else.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
