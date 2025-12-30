
import React, { useState, useEffect } from 'react';
import { SignIn, SignUp, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { User } from '../types';
import { dbService } from '../services/dbService';

interface Props {
  onLogin: (user: User) => void;
}

const ClerkLoginPage: React.FC<Props> = ({ onLogin }) => {
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const [showNameStep, setShowNameStep] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Handle name submission after Clerk authentication
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter a valid name (at least 2 characters)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const userIdentifier = clerkUser?.primaryEmailAddress?.emailAddress ||
        clerkUser?.primaryPhoneNumber?.phoneNumber ||
        clerkUser?.id || '';

      const result = await dbService.login(userIdentifier, name.trim());
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        throw new Error('Failed to register');
      }
    } catch (err) {
      setError('Network Error: Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user needs to enter name after Clerk auth
  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      const userIdentifier = clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.primaryPhoneNumber?.phoneNumber ||
        clerkUser.id;

      dbService.login(userIdentifier, clerkUser.firstName || 'User')
        .then(result => {
          if (result.success && result.user) {
            // If user has a proper name, log them in directly
            if (result.user.name && result.user.name !== 'User' && result.user.name !== 'Farmer') {
              onLogin(result.user);
            } else {
              // Otherwise, ask for their name
              setName(clerkUser.firstName || '');
              setShowNameStep(true);
            }
          } else {
            setShowNameStep(true);
          }
        })
        .catch(() => setShowNameStep(true));
    }
  }, [isLoaded, isSignedIn, clerkUser, onLogin]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 animate-pulse">
            <i className="fas fa-leaf text-white text-2xl"></i>
          </div>
          <p className="text-emerald-100/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Name entry step (after Clerk auth is complete)
  if (isSignedIn && showNameStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                <i className="fas fa-user-check text-white text-xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Almost There!</h1>
              <p className="text-emerald-100/60 text-sm">What should we call you?</p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-emerald-400 text-xs"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Signed in as</p>
                <p className="text-white text-sm truncate">
                  {clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.primaryPhoneNumber?.phoneNumber}
                </p>
              </div>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-300 text-sm">{error}</div>
              )}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? <i className="fas fa-circle-notch animate-spin"></i> : 'Continue to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main Authentication Screen using Clerk's pre-built components
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6">
      <SignedOut>
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                <i className="fas fa-leaf text-white text-xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Smart Agri Advisor</h1>
              <p className="text-emerald-100/60 text-sm">Your AI Krishi Expert</p>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-6">
              <button
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${authMode === 'signin'
                    ? 'bg-emerald-500 text-white shadow'
                    : 'text-white/60 hover:text-white'
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${authMode === 'signup'
                    ? 'bg-emerald-500 text-white shadow'
                    : 'text-white/60 hover:text-white'
                  }`}
              >
                Sign Up
              </button>
            </div>

            {/* Clerk SignIn/SignUp Component */}
            <div className="clerk-container">
              {authMode === 'signin' ? (
                <SignIn
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'bg-transparent shadow-none p-0 w-full',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'bg-white hover:bg-gray-50 text-gray-800 rounded-xl py-3 font-semibold',
                      dividerLine: 'bg-white/20',
                      dividerText: 'text-white/50 bg-transparent',
                      formFieldLabel: 'text-emerald-400 text-[10px] font-bold uppercase tracking-wider',
                      formFieldInput: 'bg-white/10 border-white/20 text-white rounded-xl placeholder:text-white/40',
                      formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-400 rounded-xl font-bold py-3',
                      footerAction: 'hidden',
                      footer: 'hidden',
                    },
                    layout: {
                      socialButtonsPlacement: 'top',
                      socialButtonsVariant: 'blockButton',
                    }
                  }}
                />
              ) : (
                <SignUp
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'bg-transparent shadow-none p-0 w-full',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'bg-white hover:bg-gray-50 text-gray-800 rounded-xl py-3 font-semibold',
                      dividerLine: 'bg-white/20',
                      dividerText: 'text-white/50 bg-transparent',
                      formFieldLabel: 'text-emerald-400 text-[10px] font-bold uppercase tracking-wider',
                      formFieldInput: 'bg-white/10 border-white/20 text-white rounded-xl placeholder:text-white/40',
                      formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-400 rounded-xl font-bold py-3',
                      footerAction: 'hidden',
                      footer: 'hidden',
                    },
                    layout: {
                      socialButtonsPlacement: 'top',
                      socialButtonsVariant: 'blockButton',
                    }
                  }}
                />
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] text-emerald-500/50 uppercase tracking-widest">
                Secured by Clerk Authentication
              </p>
            </div>
          </div>
        </div>
      </SignedOut>

      {/* This handles the case when user is already signed in via Clerk */}
      <SignedIn>
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 animate-pulse">
            <i className="fas fa-leaf text-white text-2xl"></i>
          </div>
          <p className="text-emerald-100/60 text-sm">Setting up your account...</p>
        </div>
      </SignedIn>

      {/* CSS overrides for Clerk components */}
      <style>{`
        .cl-card { background: transparent !important; box-shadow: none !important; width: 100% !important; }
        .cl-rootBox { width: 100% !important; }
        .cl-formFieldInput { background: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.2) !important; color: white !important; }
        .cl-formFieldInput::placeholder { color: rgba(255,255,255,0.4) !important; }
        .cl-formFieldLabel { color: #34d399 !important; }
        .cl-dividerText { background: transparent !important; color: rgba(255,255,255,0.5) !important; }
        .cl-dividerLine { background: rgba(255,255,255,0.2) !important; }
        .cl-footer, .cl-footerAction { display: none !important; }
        .cl-headerTitle, .cl-headerSubtitle { display: none !important; }
        .cl-socialButtonsBlockButton { background: white !important; border-radius: 12px !important; }
        .cl-formButtonPrimary { background: #10b981 !important; border-radius: 12px !important; }
        .cl-formButtonPrimary:hover { background: #34d399 !important; }
        .cl-internal-b3fm6y { background: transparent !important; }
      `}</style>
    </div>
  );
};

export default ClerkLoginPage;
