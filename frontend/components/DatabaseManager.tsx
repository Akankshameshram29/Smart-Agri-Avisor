
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { FarmerRecord, User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  onUserUpdate?: (user: User) => void;
}

const ProfilePanel: React.FC<Props> = ({ isOpen, onClose, user, onLogout, onUserUpdate }) => {
  const [history, setHistory] = useState<FarmerRecord[]>([]);
  const [stats, setStats] = useState({ size: '0 KB', count: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user?.phone) {
      dbService.getHistory(user.phone).then(data => {
        setHistory(data);
        const size = new Blob([JSON.stringify(data)]).size;
        setStats({
          size: size > 1024 ? (size / 1024).toFixed(2) + ' KB' : size + ' Bytes',
          count: data.length
        });
      });
      setNewName(user.name);
    }
  }, [isOpen, user]);

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim().length < 2) {
      alert('Please enter a valid name (at least 2 characters)');
      return;
    }

    setSaving(true);
    try {
      const result = await dbService.updateUserName(user.phone, newName.trim());
      if (result.success && result.user && onUserUpdate) {
        onUserUpdate(result.user);
        // Update localStorage session
        localStorage.setItem('smart_agri_advisor_session', JSON.stringify(result.user));
      }
      setIsEditingName(false);
    } catch (err) {
      alert('Failed to update name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">

        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-xl shadow-emerald-100">
              <i className="fas fa-user-circle"></i>
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-lg font-black text-slate-900 bg-white border border-emerald-200 rounded-xl px-3 py-1 w-40 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors"
                  >
                    {saving ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-check"></i>}
                  </button>
                  <button
                    onClick={() => { setIsEditingName(false); setNewName(user.name); }}
                    className="w-8 h-8 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-300 transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 leading-none mb-1">{user.name}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-200 transition-colors"
                    title="Edit Name"
                  >
                    <i className="fas fa-pen text-[10px]"></i>
                  </button>
                </div>
              )}
              <p className="text-xs font-bold text-emerald-600">+91 {user.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto space-y-10 custom-scrollbar">
          {/* Account Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vault Entries</div>
              <div className="text-3xl font-black text-slate-800">{stats.count}</div>
            </div>
            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profile Level</div>
              <div className="text-xl font-black text-emerald-600">Active</div>
            </div>
          </div>

          {/* Data Management Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Data Vault</h3>
              <span className="text-[10px] font-bold text-slate-300 uppercase">Per-Account Storage</span>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <i className="fas fa-shield-halved text-6xl"></i>
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <div className="text-[10px] font-black text-emerald-400 uppercase mb-1">Account Data Size</div>
                    <div className="text-2xl font-black">{stats.size}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-emerald-400 uppercase mb-1">ID Status</div>
                    <div className="text-xs font-bold text-emerald-200">Unique</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => {
                      const data = JSON.stringify(history, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `smart_agri_advisor_backup_${user.phone}.json`;
                      a.click();
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                  >
                    <i className="fas fa-download mr-2"></i> Export Account Data
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Wipe your personal search vault? Other users will not be affected.')) {
                        localStorage.removeItem(`smart_agri_advisor_vault_v1_${user.phone}`);
                        window.location.reload();
                      }
                    }}
                    className="w-full text-rose-400 hover:text-rose-300 py-2 text-[9px] font-black uppercase tracking-widest"
                  >
                    Reset Local Vault
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100">
            <button
              onClick={onLogout}
              className="w-full bg-rose-50 text-rose-600 hover:bg-rose-100 py-5 rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-3 border border-rose-100"
            >
              <i className="fas fa-power-off"></i> Secure Logout
            </button>
          </div>
        </div>

        <div className="p-8 bg-slate-50 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">Smart Agri Advisor Intelligence</p>
          <p className="text-[9px] text-slate-400">Data localized for {user.name}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
