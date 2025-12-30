
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

    // Handle the name submission step
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

    // After Clerk auth, check if we need the name step
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

    // Loading state
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

    // Name entry step (after Clerk auth)
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

    // Clerk component appearance - matching our premium theme
    const clerkAppearance = {
        elements: {
            rootBox: 'w-full',
            card: 'bg-transparent shadow-none p-0 gap-4',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'bg-white hover:bg-gray-50 text-gray-800 border-0 rounded-2xl py-4 font-bold shadow-lg transition-all hover:scale-[1.02]',
            socialButtonsBlockButtonText: 'font-bold text-sm',
            socialButtonsProviderIcon: 'w-5 h-5',
            dividerLine: 'bg-white/20',
            dividerText: 'text-white/60 text-xs',
            formFieldLabel: 'text-emerald-400 text-[10px] font-black uppercase tracking-widest',
            formFieldInput: 'bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-2xl py-4 px-4 focus:border-emerald-500 focus:ring-emerald-500/20',
            formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-black shadow-xl shadow-emerald-900/40 py-4 text-sm normal-case',
            footerAction: 'hidden',
            footerActionLink: 'text-emerald-400 hover:text-emerald-300',
            identityPreview: 'bg-white/10 border-white/20 rounded-2xl',
            identityPreviewText: 'text-white',
            identityPreviewEditButton: 'text-emerald-400 hover:text-emerald-300',
            formFieldInputShowPasswordButton: 'text-white/60 hover:text-white',
            otpCodeFieldInput: 'bg-white/10 border-white/20 text-white text-center text-2xl rounded-xl',
            alternativeMethodsBlockButton: 'text-emerald-400 hover:text-emerald-300 text-xs',
            footer: 'hidden',
            formFieldAction: 'text-emerald-400 hover:text-emerald-300 text-xs',
            formResendCodeLink: 'text-emerald-400 hover:text-emerald-300',
            alert: 'bg-rose-500/20 border-rose-500/30 text-rose-200 rounded-xl',
            alertText: 'text-rose-200',
        },
        layout: {
            socialButtonsPlacement: 'top' as const,
            socialButtonsVariant: 'blockButton' as const,
        }
    };

    // Main login screen
    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-950 relative overflow-hidden font-sans">
            {/* Background Decor */}
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
                            <SignIn
                                appearance={clerkAppearance}
                                routing="hash"
                            />
                        ) : (
                            <SignUp
                                appearance={clerkAppearance}
                                routing="hash"
                            />
                        )}
                    </div>

                    {/* Toggle Auth Mode */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                            className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold transition-colors"
                        >
                            {authMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">
                            Secured by Clerk Authentication
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom styles for Clerk components */}
            <style>{`
        .cl-internal-b3fm6y {
          background: transparent !important;
        }
        .cl-card {
          background: transparent !important;
          box-shadow: none !important;
        }
        .cl-socialButtonsBlockButton {
          background: white !important;
        }
        .cl-formFieldInput {
          background: rgba(255,255,255,0.1) !important;
          border-color: rgba(255,255,255,0.2) !important;
          color: white !important;
        }
        .cl-formFieldInput::placeholder {
          color: rgba(255,255,255,0.4) !important;
        }
        .cl-footerAction {
          display: none !important;
        }
        .cl-dividerLine {
          background: rgba(255,255,255,0.2) !important;
        }
        .cl-dividerText {
          color: rgba(255,255,255,0.5) !important;
        }
      `}</style>
        </div>
    );
};

export default ClerkLoginPage;
