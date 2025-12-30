
import React, { useState } from 'react';
import { User } from '../types';
import { dbService } from '../services/dbService';

interface Props {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'name'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await dbService.login(cleanPhone, 'User');
      if (result.success && result.user) {
        if (result.user.name && result.user.name !== 'User' && result.user.name !== 'Farmer') {
          // Returning user with name already set
          onLogin(result.user);
        } else {
          // New user or user without proper name - ask for name
          setStep('name');
        }
      } else {
        setStep('name');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters)');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const result = await dbService.login(cleanPhone, name.trim());
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      setError('Could not save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6">
      <div className="w-full max-w-md">
        <div className="bg-emerald-900/40 backdrop-blur-xl border border-emerald-700/30 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
              <i className="fas fa-leaf text-white text-3xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Smart Agri Advisor</h1>
            <p className="text-emerald-300/70 text-sm">Your AI Krishi Expert</p>
          </div>

          {step === 'phone' ? (
            /* Phone Step */
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/30 border border-red-600/30 rounded-xl p-3 text-red-300 text-sm flex items-center gap-2">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-semibold">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="98765 43210"
                    autoFocus
                    className="w-full bg-emerald-800/40 border border-emerald-600/30 rounded-xl py-4 pl-14 pr-4 text-white placeholder:text-emerald-500/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-lg tracking-wider"
                  />
                </div>
                <p className="text-emerald-500/50 text-xs mt-2 ml-1">Enter your 10-digit mobile number</p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length !== 10}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  <>
                    Continue
                    <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>

              <p className="text-center text-emerald-500/40 text-xs">
                New users will be registered automatically
              </p>
            </form>
          ) : (
            /* Name Step */
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div className="bg-emerald-800/30 border border-emerald-600/20 rounded-xl p-3 flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-600/30 rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-emerald-400"></i>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Mobile Verified</p>
                  <p className="text-white font-semibold">+91 {phone}</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-600/30 rounded-xl p-3 text-red-300 text-sm flex items-center gap-2">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                  className="w-full bg-emerald-800/40 border border-emerald-600/30 rounded-xl py-4 px-4 text-white placeholder:text-emerald-500/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  <>
                    Start Using Smart Agri Advisor
                    <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setError(''); }}
                className="w-full text-emerald-400 hover:text-emerald-300 py-2 text-sm transition-colors"
              >
                ← Change number
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-emerald-700/20 text-center">
            <p className="text-[10px] text-emerald-600/50 uppercase tracking-widest">
              Powered by AI • Made in India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
