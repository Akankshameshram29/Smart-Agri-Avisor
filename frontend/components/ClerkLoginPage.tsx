
import React, { useState } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
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
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || name.trim().length < 2) {
            alert('Please enter a valid name (at least 2 characters)');
            return;
        }

        setLoading(true);
        try {
            const identifier = clerkUser?.primaryEmailAddress?.emailAddress ||
                clerkUser?.primaryPhoneNumber?.phoneNumber ||
                clerkUser?.id || '';

            const result = await dbService.login(identifier, name.trim());
            if (result.success && result.user) {
                onLogin(result.user);
            } else {
                throw new Error('Failed to register in database');
            }
        } catch (err) {
            alert('Network Error: Could not connect to database.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (isLoaded && isSignedIn && clerkUser) {
            const identifier = clerkUser.primaryEmailAddress?.emailAddress ||
                clerkUser.primaryPhoneNumber?.phoneNumber ||
                clerkUser.id;

            dbService.login(identifier, clerkUser.firstName || 'User')
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
                .catch(() => {
                    setShowNameStep(true);
                });
        }
    }, [isLoaded, isSignedIn, clerkUser, onLogin]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-emerald-950">
                <div className="text-white text-center">
                    <i className="fas fa-leaf text-4xl text-emerald-400 animate-pulse mb-4"></i>
                    <p className="text-emerald-100/60 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (isSignedIn && showNameStep) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-emerald-950 relative overflow-hidden font-sans">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/10 rounded-full blur-[150px]"></div>
                </div>

                <div className="relative z-10 w-full max-w-md px-6">
                    <div className="bg-white/10 backdrop-blur-3xl border border-white/10 rounded-[48px] p-10 shadow-2xl">
                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl shadow-xl mb-6">
                                <i className="fas fa-user-check"></i>
                            </div>
                            <h1 className="text-3xl font-heading text-white mb-2">Welcome!</h1>
                            <p className="text-emerald-100/60 text-sm">Complete your profile to continue</p>
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/30 rounded-full flex items-center justify-center">
                                    <i className="fas fa-check text-emerald-400"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Signed in as</p>
                                    <p className="text-white font-bold text-sm">
                                        {clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.primaryPhoneNumber?.phoneNumber}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleNameSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-4">What should we call you?</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40">
                                        <i className="fas fa-user-circle"></i>
                                    </span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        autoFocus
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500 transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !name.trim()}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-900/40 disabled:opacity-50"
                            >
                                {loading ? <i className="fas fa-circle-notch animate-spin"></i> : 'Start Using Smart Agri Advisor'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Clerk appearance with CSS variables for deep theming
    const clerkAppearance = {
        variables: {
            colorPrimary: '#10b981',
            colorBackground: 'transparent',
            colorText: 'white',
            colorTextSecondary: 'rgba(255,255,255,0.6)',
            colorInputBackground: 'rgba(255,255,255,0.1)',
            colorInputText: 'white',
            borderRadius: '16px',
        },
        elements: {
            rootBox: 'w-full clerk-root',
            card: 'bg-transparent shadow-none p-0',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'bg-white hover:bg-gray-100 text-gray-800 border-0 rounded-2xl py-4 font-semibold shadow-lg transition-all hover:scale-[1.02]',
            socialButtonsBlockButtonText: 'font-semibold text-sm text-gray-700',
            socialButtonsProviderIcon: 'w-5 h-5',
            dividerLine: 'bg-white/30',
            dividerText: 'text-white/50 text-xs bg-transparent',
            formFieldLabel: 'text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2',
            formFieldInput: 'bg-white/10 border-white/20 text-white rounded-2xl py-4 px-4 placeholder:text-white/40',
            formFieldAction: 'text-emerald-400 hover:text-emerald-300 text-xs font-semibold',
            formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-bold shadow-xl py-4 text-sm normal-case',
            footerAction: 'hidden',
            footerActionText: 'hidden',
            footerActionLink: 'hidden',
            identityPreview: 'bg-white/10 border-white/20 rounded-2xl',
            identityPreviewText: 'text-white',
            identityPreviewEditButton: 'text-emerald-400',
            formFieldInputShowPasswordButton: 'text-white/60',
            otpCodeFieldInput: 'bg-white/10 border-white/20 text-white text-2xl rounded-xl',
            alternativeMethodsBlockButton: 'text-emerald-400 hover:text-emerald-300 text-xs font-semibold',
            formResendCodeLink: 'text-emerald-400',
            alert: 'bg-rose-500/20 border-rose-500/30 rounded-xl',
            alertText: 'text-rose-200 text-sm',
            footer: 'hidden',
        },
        layout: {
            socialButtonsPlacement: 'top' as const,
            socialButtonsVariant: 'blockButton' as const,
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-950 relative overflow-hidden font-sans">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/10 rounded-full blur-[150px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="bg-white/10 backdrop-blur-3xl border border-white/10 rounded-[48px] p-10 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl shadow-xl mb-6">
                            <i className="fas fa-leaf"></i>
                        </div>
                        <h1 className="text-3xl font-heading text-white mb-2">Smart Agri Advisor</h1>
                        <p className="text-emerald-100/60 text-sm">Your AI Krishi Expert</p>
                    </div>

                    {/* Clerk Component */}
                    <div className="clerk-auth-container">
                        {authMode === 'signin' ? (
                            <SignIn appearance={clerkAppearance} routing="hash" />
                        ) : (
                            <SignUp appearance={clerkAppearance} routing="hash" />
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">
                            Secured by Clerk Authentication
                        </p>
                    </div>
                </div>
            </div>

            {/* Aggressive CSS overrides for Clerk */}
            <style>{`
        /* Root and card alignment */
        .clerk-auth-container {
          width: 100%;
        }
        .cl-rootBox {
          width: 100% !important;
        }
        .cl-card {
          width: 100% !important;
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .cl-signIn-root, .cl-signUp-root {
          width: 100% !important;
          background: transparent !important;
        }
        
        /* Main form container alignment */
        .cl-main {
          width: 100% !important;
          gap: 16px !important;
        }
        
        /* Form fields container */
        .cl-form {
          width: 100% !important;
          gap: 16px !important;
        }
        
        /* Form field row - fix label and action alignment */
        .cl-formFieldRow {
          width: 100% !important;
        }
        .cl-formFieldLabelRow {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
          margin-bottom: 8px !important;
        }
        
        /* Form field inputs */
        .cl-formFieldInput {
          width: 100% !important;
          background: rgba(255,255,255,0.1) !important;
          border: 1px solid rgba(255,255,255,0.2) !important;
          color: white !important;
          border-radius: 16px !important;
          padding: 16px !important;
          box-sizing: border-box !important;
        }
        .cl-formFieldInput::placeholder {
          color: rgba(255,255,255,0.4) !important;
        }
        .cl-formFieldInput:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.2) !important;
          outline: none !important;
        }
        
        /* Labels */
        .cl-formFieldLabel {
          color: #34d399 !important;
          font-size: 10px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
        }
        
        /* Action links (Use phone, etc) */
        .cl-formFieldAction {
          color: #34d399 !important;
          font-size: 11px !important;
          font-weight: 600 !important;
        }
        .cl-formFieldAction:hover {
          color: #6ee7b7 !important;
        }
        
        /* Social buttons - full width */
        .cl-socialButtonsBlockButton {
          width: 100% !important;
          background: white !important;
          color: #1f2937 !important;
          border-radius: 16px !important;
          padding: 16px !important;
          font-weight: 600 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 12px !important;
        }
        .cl-socialButtonsBlockButton:hover {
          background: #f3f4f6 !important;
        }
        .cl-socialButtons {
          width: 100% !important;
        }
        
        /* Divider - full width */
        .cl-dividerRow {
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          gap: 16px !important;
          margin: 16px 0 !important;
        }
        .cl-dividerLine {
          flex: 1 !important;
          height: 1px !important;
          background: rgba(255,255,255,0.2) !important;
        }
        .cl-dividerText {
          color: rgba(255,255,255,0.5) !important;
          background: transparent !important;
          font-size: 12px !important;
          padding: 0 !important;
        }
        
        /* Primary button - full width */
        .cl-formButtonPrimary {
          width: 100% !important;
          background: #10b981 !important;
          border-radius: 16px !important;
          padding: 16px !important;
          font-weight: 700 !important;
          text-transform: none !important;
          margin-top: 8px !important;
        }
        .cl-formButtonPrimary:hover {
          background: #34d399 !important;
        }
        
        /* Footer - hide Clerk's footer completely */
        .cl-footer, .cl-footerAction, .cl-footerActionText, .cl-footerActionLink {
          display: none !important;
        }
        
        /* OTP input */
        .cl-otpCodeFieldInput {
          background: rgba(255,255,255,0.1) !important;
          border-color: rgba(255,255,255,0.2) !important;
          color: white !important;
        }
        
        /* Identity preview */
        .cl-identityPreview {
          width: 100% !important;
          background: rgba(255,255,255,0.1) !important;
          border-color: rgba(255,255,255,0.2) !important;
          border-radius: 16px !important;
          padding: 16px !important;
        }
        .cl-identityPreviewText {
          color: white !important;
        }
        .cl-identityPreviewEditButton {
          color: #34d399 !important;
        }
        
        /* Header within forms - hide */
        .cl-headerTitle, .cl-headerSubtitle, .cl-header {
          display: none !important;
        }
        
        /* Alert/Error messages */
        .cl-alert {
          width: 100% !important;
          background: rgba(239,68,68,0.2) !important;
          border-color: rgba(239,68,68,0.3) !important;
          border-radius: 12px !important;
        }
        .cl-alertText {
          color: #fca5a5 !important;
        }
        
        /* Internal backgrounds - catch all */
        .cl-internal-b3fm6y, .cl-internal-1dauvt6, [class*="cl-internal"] {
          background: transparent !important;
        }
        
        /* Alternative methods button */
        .cl-alternativeMethods {
          width: 100% !important;
        }
        .cl-alternativeMethodsBlockButton {
          color: #34d399 !important;
          font-size: 12px !important;
        }
      `}</style>

        </div>
    );
};

export default ClerkLoginPage;
