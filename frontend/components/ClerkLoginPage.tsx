
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
            if (result.user.name && result.user.name !== 'User' && result.user.name !== 'Farmer') {
              onLogin(result.user);
            } else {
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

  // Clerk appearance configuration - made all inputs dark themed
  const clerkAppearance = {
    variables: {
      colorPrimary: '#10b981',
      colorBackground: 'transparent',
      colorText: 'white',
      colorTextSecondary: 'rgba(255,255,255,0.6)',
      colorInputBackground: 'rgba(255,255,255,0.08)',
      colorInputText: 'white',
      borderRadius: '12px',
    },
    elements: {
      rootBox: 'w-full',
      card: 'bg-transparent shadow-none p-0 w-full',
      header: 'hidden',
      headerTitle: 'hidden',
      headerSubtitle: 'hidden',
      main: 'w-full gap-4',
      form: 'w-full gap-4',
      formFieldRow: 'w-full',
      formFieldLabel: 'text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1',
      formFieldInput: 'bg-white/10 border-white/20 text-white rounded-xl py-3.5 px-4 w-full',
      formFieldAction: 'text-emerald-400 text-xs',
      formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-400 rounded-xl font-bold py-3.5 w-full text-sm normal-case',
      socialButtonsBlockButton: 'bg-white hover:bg-gray-50 text-gray-800 rounded-xl py-3.5 font-semibold w-full',
      socialButtonsBlockButtonText: 'font-semibold text-sm',
      dividerRow: 'my-4',
      dividerLine: 'bg-white/20',
      dividerText: 'text-white/50 bg-transparent text-xs',
      footer: 'hidden',
      footerAction: 'hidden',
      footerActionLink: 'hidden',
      identityPreview: 'bg-white/10 border-white/20 rounded-xl',
      identityPreviewText: 'text-white',
      identityPreviewEditButton: 'text-emerald-400',
      alert: 'bg-rose-500/20 border-rose-500/30 rounded-xl',
      alertText: 'text-rose-200',
      formFieldInputShowPasswordButton: 'text-white/60',
      // Hide phone-related elements
      phoneInputBox: 'hidden',
      formFieldPhoneInput: 'hidden',
    },
    layout: {
      socialButtonsPlacement: 'top' as const,
      socialButtonsVariant: 'blockButton' as const,
    }
  };

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

  // Name entry step
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
                className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-5 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500 transition-all"
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

  // Main Authentication Screen
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
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${authMode === 'signin'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-white/60 hover:text-white'
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${authMode === 'signup'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-white/60 hover:text-white'
                  }`}
              >
                Sign Up
              </button>
            </div>

            {/* Clerk SignIn/SignUp Component */}
            <div className="clerk-container">
              {authMode === 'signin' ? (
                <SignIn appearance={clerkAppearance} />
              ) : (
                <SignUp appearance={clerkAppearance} />
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-[10px] text-emerald-500/50 uppercase tracking-widest">
                Secured by Clerk Authentication
              </p>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 animate-pulse">
            <i className="fas fa-leaf text-white text-2xl"></i>
          </div>
          <p className="text-emerald-100/60 text-sm">Setting up your account...</p>
        </div>
      </SignedIn>

      {/* Comprehensive CSS overrides for Clerk components */}
      <style>{`
        /* Container and card */
        .clerk-container { width: 100%; }
        .cl-rootBox { width: 100% !important; }
        .cl-card { 
          width: 100% !important; 
          background: transparent !important; 
          box-shadow: none !important; 
          padding: 0 !important;
        }
        .cl-signIn-root, .cl-signUp-root { width: 100% !important; }
        .cl-main { width: 100% !important; }
        .cl-form { width: 100% !important; }
        
        /* Hide header */
        .cl-header, .cl-headerTitle, .cl-headerSubtitle { display: none !important; }
        
        /* Form fields - dark theme */
        .cl-formFieldRow { width: 100% !important; margin-bottom: 12px !important; }
        .cl-formFieldLabelRow { margin-bottom: 6px !important; }
        .cl-formFieldLabel { 
          color: #34d399 !important; 
          font-size: 10px !important; 
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        .cl-formFieldInput, .cl-phoneInputBox input, .cl-input {
          width: 100% !important;
          background: rgba(255,255,255,0.08) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          color: white !important;
          border-radius: 12px !important;
          padding: 14px 16px !important;
        }
        .cl-formFieldInput::placeholder, .cl-input::placeholder {
          color: rgba(255,255,255,0.4) !important;
        }
        .cl-formFieldInput:focus, .cl-input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.15) !important;
          outline: none !important;
        }
        
        /* Social buttons */
        .cl-socialButtons { width: 100% !important; margin-bottom: 16px !important; }
        .cl-socialButtonsBlockButton {
          width: 100% !important;
          background: white !important;
          color: #1f2937 !important;
          border-radius: 12px !important;
          padding: 14px !important;
          font-weight: 600 !important;
        }
        .cl-socialButtonsBlockButton:hover {
          background: #f3f4f6 !important;
        }
        
        /* Divider */
        .cl-dividerRow { margin: 20px 0 !important; }
        .cl-dividerLine { background: rgba(255,255,255,0.15) !important; }
        .cl-dividerText { 
          color: rgba(255,255,255,0.4) !important; 
          background: transparent !important;
          font-size: 12px !important;
        }
        
        /* Primary button */
        .cl-formButtonPrimary {
          width: 100% !important;
          background: #10b981 !important;
          border-radius: 12px !important;
          padding: 14px !important;
          font-weight: 700 !important;
          font-size: 14px !important;
          text-transform: none !important;
          margin-top: 8px !important;
        }
        .cl-formButtonPrimary:hover {
          background: #34d399 !important;
        }
        
        /* Hide footer and phone-related elements */
        .cl-footer, .cl-footerAction, .cl-footerActionLink { display: none !important; }
        
        /* HIDE PHONE NUMBER FIELD */
        .cl-formFieldRow:has(input[name="phoneNumber"]),
        .cl-formFieldRow:has(.cl-phoneInputBox),
        .cl-phoneInputBox,
        [data-field-name="phoneNumber"],
        .cl-formFieldPhoneInput { 
          display: none !important; 
        }
        
        /* Action links */
        .cl-formFieldAction { color: #34d399 !important; font-size: 11px !important; }
        .cl-formFieldAction:hover { color: #6ee7b7 !important; }
        
        /* Internal elements */
        .cl-internal-b3fm6y, [class*="cl-internal"] { background: transparent !important; }
        
        /* Identity preview for verification */
        .cl-identityPreview {
          background: rgba(255,255,255,0.08) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          border-radius: 12px !important;
        }
        .cl-identityPreviewText { color: white !important; }
        .cl-identityPreviewEditButton { color: #34d399 !important; }
        
        /* Alerts */
        .cl-alert {
          background: rgba(239,68,68,0.15) !important;
          border: 1px solid rgba(239,68,68,0.25) !important;
          border-radius: 12px !important;
        }
        .cl-alertText { color: #fca5a5 !important; }
        
        /* Password toggle */
        .cl-formFieldInputShowPasswordButton { color: rgba(255,255,255,0.5) !important; }
        
        /* OTP input */
        .cl-otpCodeFieldInput {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.15) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default ClerkLoginPage;
