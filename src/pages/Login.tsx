import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mic, Mail, Lock, User, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { trackPixelEvent } from '../lib/pixel';
import { auth } from '../firebase';

export default function Login() {
  const { login, loginWithEmail, signUpWithEmail, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setError(null);
      await login();
      trackPixelEvent('Login', { method: 'google' }, { em: auth.currentUser?.email, external_id: auth.currentUser?.uid });
    } catch (err: any) {
      // Ignore cancelled popup requests as they are usually user-initiated or due to double clicks
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        console.log('Login popup closed or cancelled.');
      } else if (err.code === 'auth/operation-not-allowed') {
        if (language === 'ar') {
          setError('خطأ: طريقة تسجيل الدخول باستخدام Google غير مفعّلة في لوحة تحكم Firebase. يرجى تفعيلها من خلال الانتقال إلى Firebase Console -> Authentication -> Sign-in method وتفعيل Google.');
        } else if (language === 'fr') {
          setError("Erreur: La connexion Google n'est pas activée dans la console Firebase. Veuillez l'activer sous Authentication -> Sign-in method -> Google.");
        } else {
          setError("Error: Google sign-in is not enabled in the Firebase Console. Please enable it under Authentication -> Sign-in method -> Google.");
        }
      } else {
        setError(err.message || 'Failed to login with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email) {
      setError(t('emailRequired'));
      return;
    }

    if (isForgotPassword) {
      setIsLoading(true);
      try {
        await resetPassword(email);
        setSuccessMsg(t('resetEmailSent'));
      } catch (err: any) {
        setError(err.message || 'Failed to send reset email');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password) {
      setError(t('passwordRequired'));
      return;
    }
    if (isSignUp && !fullName) {
      setError(t('nameRequired'));
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, fullName);
        trackPixelEvent('CompleteRegistration', { method: 'email' }, { em: email, fn: fullName, external_id: auth.currentUser?.uid });
      } else {
        await loginWithEmail(email, password);
        trackPixelEvent('Login', { method: 'email' }, { em: email, external_id: auth.currentUser?.uid });
      }
    } catch (err: any) {
      let errorMessage = err.message;
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = language === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email already in use';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = language === 'ar' ? 'بيانات الاعتماد غير صالحة' : 'Invalid credentials';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = language === 'ar' ? 'كلمة المرور ضعيفة جداً' : 'Password is too weak';
      } else if (err.code === 'auth/operation-not-allowed') {
        if (language === 'ar') {
          errorMessage = 'خطأ: طريقة تسجيل الدخول بالبريد الإلكتروني وكلمة المرور غير مفعّلة في لوحة تحكم Firebase. يرجى الذهاب إلى Firebase Console -> Authentication -> Sign-in method ثم تفعيل البريد الإلكتروني (Email/Password).';
        } else if (language === 'fr') {
          errorMessage = "Erreur: La connexion Email/Mot de passe n'est pas activée dans la console Firebase. Veuillez l'activer sous Authentication -> Sign-in method -> Email/Password.";
        } else {
          errorMessage = "Error: Email/Password sign-in is not enabled in the Firebase Console. Please enable it under Authentication -> Sign-in method -> Email/Password.";
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-brand-dark transition-colors">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-white dark:bg-brand-dark relative z-10 shadow-2xl overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="flex items-center gap-2 mb-10">
            <img src="/logo.svg" alt="DZ VoixOff Logo" className="w-10 h-10 rounded-xl shadow-sm" />
            <span className="font-bold text-2xl tracking-tight text-brand-navy dark:text-white">
              DZVOIXOFF
            </span>
          </div>

          <h1 className={`text-3xl font-bold text-brand-navy dark:text-white mb-2 ${language === 'ar' ? 'font-arabic' : ''}`} dir={dir}>
            {isForgotPassword ? t('resetPassword') : isSignUp ? t('signUp') : t('welcomeBack')}
          </h1>
          <p className={`text-slate-500 dark:text-slate-400 mb-8 ${language === 'ar' ? 'font-arabic' : ''}`} dir={dir}>
            {isForgotPassword ? t('resetPasswordDesc') : t('loginSubtitle')}
          </p>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 ${language === 'ar' ? 'font-arabic' : ''}`}
                dir={dir}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-xl flex items-center gap-2 ${language === 'ar' ? 'font-arabic' : ''}`}
                dir={dir}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4" dir={dir}>
            {isSignUp && !isForgotPassword && (
              <div>
                <label className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {t('fullName')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`block w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 py-3 ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} text-slate-900 dark:text-white focus:border-brand-teal focus:ring-brand-teal focus:bg-white dark:focus:bg-slate-800 transition-colors`}
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ${language === 'ar' ? 'font-arabic' : ''}`}>
                {t('email')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 py-3 ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} text-slate-900 dark:text-white focus:border-brand-teal focus:ring-brand-teal focus:bg-white dark:focus:bg-slate-800 transition-colors`}
                  placeholder="you@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${language === 'ar' ? 'font-arabic' : ''}`}>
                    {t('password')}
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className={`text-xs text-brand-teal hover:text-brand-teal-hover font-medium ${language === 'ar' ? 'font-arabic' : ''}`}
                    >
                      {t('forgotPassword')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 py-3 px-10 text-slate-900 dark:text-white focus:border-brand-teal focus:ring-brand-teal focus:bg-white dark:focus:bg-slate-800 transition-colors`}
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 ${language === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-slate-400 hover:text-slate-600 transition-colors`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 bg-brand-teal text-brand-navy font-bold py-3 px-4 rounded-xl hover:bg-brand-teal-hover transition-all shadow-lg shadow-brand-teal/20 mt-6 ${language === 'ar' ? 'font-arabic' : ''}`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>{isForgotPassword ? t('sendResetLink') : isSignUp ? t('signUp') : t('signIn')}</span>
              )}
            </button>
          </form>

          {isForgotPassword ? (
            <div className={`mt-8 text-center text-sm ${language === 'ar' ? 'font-arabic' : ''}`} dir={dir}>
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white font-medium transition-colors"
              >
                {t('backToLogin')}
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-white/10 flex-grow"></div>
                <span className={`px-3 text-sm text-slate-400 ${language === 'ar' ? 'font-arabic' : ''}`}>{t('orContinueWith')}</span>
                <div className="border-t border-slate-200 dark:border-white/10 flex-grow"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                type="button"
                disabled={isLoading}
                className={`mt-6 w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className={language === 'ar' ? 'font-arabic' : ''}>{t('loginWithGoogle')}</span>
              </button>

              <div className={`mt-8 text-center text-sm ${language === 'ar' ? 'font-arabic' : ''}`} dir={dir}>
                <span className="text-slate-500 dark:text-slate-400">
                  {isSignUp ? t('hasAccount') : t('noAccount')}
                </span>{' '}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="text-brand-navy dark:text-brand-teal font-bold hover:underline"
                >
                  {isSignUp ? t('signIn') : t('signUp')}
                </button>
              </div>

              <p className={`mt-8 text-center text-xs text-slate-400 dark:text-slate-500 ${language === 'ar' ? 'font-arabic' : ''}`} dir={dir}>
                {t('loginTerms')}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-brand-navy dark:bg-slate-950 relative overflow-hidden items-center justify-center transition-colors">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-teal rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 max-w-lg text-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className={`text-4xl font-bold text-white mb-6 leading-tight ${language === 'ar' ? 'font-arabic' : ''}`} dir={dir}>
              {t('loginRightTitle')}
            </h2>
            <p className={`text-xl text-slate-300 dark:text-slate-400 leading-relaxed ${language === 'ar' ? 'font-arabic' : ''}`} dir={dir}>
              {t('loginRightDesc')}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
