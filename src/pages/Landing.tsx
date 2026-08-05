import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Mic, Play, Download, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

import { trackPixelEvent } from '../lib/pixel';

export default function Landing() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const handleSubscribeClick = () => {
    trackPixelEvent(
      'InitiateCheckout', 
      { value: 2900, currency: 'DZD', content_name: 'Pro Plan' }, 
      user ? { em: user.email, external_id: user.id } : {}
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-brand-navy dark:bg-slate-950 text-white transition-colors">
        {/* Abstract Waveform Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
          <div className="w-[800px] h-[200px] flex items-center justify-center gap-2">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 bg-brand-teal rounded-full"
                animate={{
                  height: [20, Math.random() * 150 + 50, 20],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-brand-teal text-sm font-medium mb-8"
            >
              <Mic className="w-4 h-4" />
              <span>{t('heroTag')}</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${language === 'ar' ? 'font-arabic' : ''}`}
              dir={dir}
            >
              {t('heroTitle1')}<span className="text-brand-teal">{t('heroTitle2')}</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-xl text-slate-300 mb-10 max-w-2xl mx-auto ${language === 'ar' ? 'font-arabic' : ''}`}
              dir={dir}
            >
              {t('heroSubtitle')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                to={user ? "/dashboard" : "/login"} 
                className={`w-full sm:w-auto px-8 py-4 bg-brand-teal text-brand-navy font-bold rounded-xl hover:bg-brand-teal-hover transition-all transform hover:scale-105 shadow-lg shadow-brand-teal/20 text-lg ${language === 'ar' ? 'font-arabic' : ''}`}
              >
                {t('startNow')}
              </Link>
              <a 
                href="#how-it-works" 
                className={`w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-lg ${language === 'ar' ? 'font-arabic' : ''}`}
              >
                {t('howItWorksBtn')}
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-brand-dark transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-brand-navy dark:text-white mb-4 ${language === 'ar' ? 'font-arabic' : ''}`} dir={dir}>{t('howItWorksTitle')}</h2>
            <p className={`text-slate-600 dark:text-slate-400 ${language === 'ar' ? 'font-arabic' : ''}`} dir={dir}>{t('howItWorksSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" dir={dir}>
            {[
              { icon: Mic, title: t('step1Title'), desc: t('step1Desc') },
              { icon: Play, title: t('step2Title'), desc: t('step2Desc') },
              { icon: Download, title: t('step3Title'), desc: t('step3Desc') }
            ].map((step, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-white/5 text-center relative">
                <div className="w-16 h-16 bg-brand-navy dark:bg-brand-teal text-brand-teal dark:text-brand-navy rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className={`text-xl font-bold text-brand-navy dark:text-white mb-3 ${language === 'ar' ? 'font-arabic' : ''}`}>{step.title}</h3>
                <p className={`text-slate-600 dark:text-slate-400 leading-relaxed ${language === 'ar' ? 'font-arabic' : ''}`}>{step.desc}</p>
                
                {i < 2 && (
                  <div className={`hidden md:block absolute top-1/2 ${language === 'ar' ? '-left-4' : '-right-4'} w-8 border-t-2 border-dashed border-slate-300 dark:border-slate-700 transform -translate-y-1/2`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-slate-50 dark:bg-brand-dark/50 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-brand-navy dark:text-white mb-4 ${language === 'ar' ? 'font-arabic' : ''}`} dir={dir}>{t('pricingTitle')}</h2>
            <p className={`text-slate-600 dark:text-slate-400 ${language === 'ar' ? 'font-arabic' : ''}`} dir={dir}>{t('pricingSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto" dir={dir}>
            {/* Free Tier */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
              <h3 className={`text-2xl font-bold text-brand-navy dark:text-white mb-2 ${language === 'ar' ? 'font-arabic' : ''}`}>{t('freePlanTitle')}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{t('freePlanPrice')}</span>
                <span className={`text-slate-500 dark:text-slate-400 ${language === 'ar' ? 'font-arabic' : ''}`}>{t('freePlanCurrency')}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[t('freeFeature1'), t('freeFeature2'), t('freeFeature3'), t('freeFeature4')].map((feature, i) => (
                  <li key={i} className={`flex items-center gap-3 text-slate-700 dark:text-slate-300 ${language === 'ar' ? 'font-arabic' : ''}`}>
                    <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to={user ? "/dashboard" : "/login"} className={`block w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 text-brand-navy dark:text-white font-bold text-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors ${language === 'ar' ? 'font-arabic' : ''}`}>
                {t('startNow')}
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-brand-navy p-8 rounded-3xl border border-brand-navy shadow-xl relative overflow-hidden">
              <div className={`absolute top-0 ${language === 'ar' ? 'right-0 rounded-bl-lg' : 'left-0 rounded-br-lg'} bg-brand-teal text-brand-navy text-xs font-bold px-3 py-1 ${language === 'ar' ? 'font-arabic' : ''}`}>{t('proPlanBadge')}</div>
              <h3 className={`text-2xl font-bold text-white mb-2 ${language === 'ar' ? 'font-arabic' : ''}`}>{t('proPlanTitle')}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">{t('proPlanPrice')}</span>
                <span className={`text-slate-400 ${language === 'ar' ? 'font-arabic' : ''}`}>{t('proPlanCurrency')}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[t('proFeature1'), t('proFeature2'), t('proFeature3'), t('proFeature4')].map((feature, i) => (
                  <li key={i} className={`flex items-center gap-3 text-slate-300 ${language === 'ar' ? 'font-arabic' : ''}`}>
                    <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link 
                to={user ? "/account" : "/login"} 
                onClick={handleSubscribeClick}
                className={`block w-full py-3 px-4 bg-brand-teal text-brand-navy font-bold text-center rounded-xl hover:bg-brand-teal-hover transition-colors shadow-lg shadow-brand-teal/20 ${language === 'ar' ? 'font-arabic' : ''}`}
              >
                {t('subscribeNow')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-navy-light dark:bg-brand-dark text-slate-400 py-12 border-t border-white/10">
        <div className={`container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6`} dir={dir}>
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="DZ VoixOff Logo" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="font-bold text-xl text-white tracking-tight">DZVOIXOFF</span>
          </div>
          <p className={`text-sm ${language === 'ar' ? 'font-arabic' : ''}`}>{t('footerRights')}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
