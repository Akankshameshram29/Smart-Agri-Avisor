
import React, { useState, useEffect } from 'react';
import { useSignIn, useSignUp, useUser, useClerk } from '@clerk/clerk-react';
import { User } from '../types';
import { dbService } from '../services/dbService';

interface Props {
  onLogin: (user: User) => void;
}

const ClerkLoginPage: React.FC<Props> = ({ onLogin }) => {
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signIn, isLoaded: signInLoaded, setActive } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { signOut } = useClerk();

  const [showNameStep, setShowNameStep] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    if (!signIn) return;
    setError('');
    setLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: window.location.origin + '/sso-callback',
        redirectUrlComplete: window.location.origin,
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Google login failed');
      setLoading(false);
    }
  };

  // Handle email/phone submission
  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || !identifier.trim()) return;

    setError('');
    setLoading(true);

    try {
      const strategy = authMode === 'email' ? 'email_code' : 'phone_code';
      const identifierType = authMode === 'email' ? 'emailAddress' : 'phoneNumber';

      // First, try to sign in (existing user)
      const signInAttempt = await signIn.create({
        identifier: identifier.trim(),
      });

      // Prepare for first factor verification
      await signIn.prepareFirstFactor({
        strategy,
        [identifierType]: identifier.trim(),
      });

      setVerifying(true);
    } catch (err: any) {
      // If user doesn't exist, try creating account
      if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        try {
          if (!signUp) return;

          if (authMode === 'email') {
            await signUp.create({ emailAddress: identifier.trim() });
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          } else {
            await signUp.create({ phoneNumber: identifier.trim() });
            await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
          }
          setVerifying(true);
        } catch (signUpErr: any) {
          setError(signUpErr.errors?.[0]?.message || 'Failed to create account');
        }
      } else {
        setError(err.errors?.[0]?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError('');
    setLoading(true);

    try {
      // Try sign in verification first
      if (signIn?.status === 'needs_first_factor') {
        const result = await signIn.attemptFirstFactor({
          strategy: authMode === 'email' ? 'email_code' : 'phone_code',
          code: code.trim(),
        });

        if (result.status === 'complete' && result.createdSessionId) {
          await setActive?.({ session: result.createdSessionId });
        }
      } else if (signUp) {
        // Try sign up verification
        const result = authMode === 'email'
          ? await signUp.attemptEmailAddressVerification({ code: code.trim() })
          : await signUp.attemptPhoneNumberVerification({ code: code.trim() });

        if (result.status === 'complete' && result.createdSessionId) {
          await setActive?.({ session: result.createdSessionId });
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  // Handle name submission after auth
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check user status after Clerk auth
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
        .catch(() => {
          setShowNameStep(true);
        });
    }
  }, [isLoaded, isSignedIn, clerkUser, onLogin]);

  // Loading state
  if (!isLoaded || !signInLoaded || !signUpLoaded) {
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
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                <i className="fas fa-user-check text-white text-xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Almost There!</h1>
              <p className="text-emerald-100/60 text-sm">What should we call you?</p>
            </div>

            {/* Signed in badge */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-emerald-400 text-xs"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Signed in</p>
                <p className="text-white text-sm truncate">
                  {clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.primaryPhoneNumber?.phoneNumber}
                </p>
              </div>
            </div>

            {/* Name form */}
            <form onSubmit={handleNameSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-300 text-sm">
                  {error}
                </div>
              )}

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  'Continue to Dashboard'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification step
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                <i className="fas fa-envelope-open-text text-white text-xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Verify Code</h1>
              <p className="text-emerald-100/60 text-sm">
                Enter the code sent to<br />
                <span className="text-emerald-400 font-semibold">{identifier}</span>
              </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-300 text-sm">
                  {error}
                </div>
              )}

              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white text-center text-2xl tracking-[0.5em] placeholder:text-white/30 placeholder:tracking-normal placeholder:text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                maxLength={6}
              />

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  'Verify & Continue'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setVerifying(false); setCode(''); setError(''); }}
                className="w-full text-emerald-400 hover:text-emerald-300 py-2 text-sm font-medium transition-colors"
              >
                ← Back to login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main Login Screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
              <i className="fas fa-leaf text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Smart Agri Advisor</h1>
            <p className="text-emerald-100/60 text-sm">Your AI Krishi Expert</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-6 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-lg mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/40 text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-4">
            <button
              onClick={() => { setAuthMode('email'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${authMode === 'email'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
                }`}
            >
              <i className="fas fa-envelope mr-2"></i>Email
            </button>
            <button
              onClick={() => { setAuthMode('phone'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${authMode === 'phone'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
                }`}
            >
              <i className="fas fa-phone mr-2"></i>Phone
            </button>
          </div>

          {/* Email/Phone Form */}
          <form onSubmit={handleIdentifierSubmit} className="space-y-4">
            <div>
              <label className="block text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                {authMode === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <input
                type={authMode === 'email' ? 'email' : 'tel'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={authMode === 'email' ? 'you@example.com' : '+91 98765 43210'}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !identifier.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <i className="fas fa-circle-notch animate-spin"></i>
              ) : (
                <>Continue <i className="fas fa-arrow-right"></i></>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-emerald-500/50 uppercase tracking-widest">
              Secured by Clerk Authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClerkLoginPage;
