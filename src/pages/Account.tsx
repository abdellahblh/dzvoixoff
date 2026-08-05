import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, CreditCard, Zap, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import PaymentModal from '../components/PaymentModal';

export default function Account() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  if (!user) return null;

  const LIMIT = user.plan === 'pro' ? 250 : 3;
  const usagePercentage = Math.min((user.generationsUsed / LIMIT) * 100, 100);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className={`bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center gap-6 transition-colors`} dir={dir}>
          <img 
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} 
            alt={user.name} 
            className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-md object-cover"
          />
          <div className={`text-center ${language === 'ar' ? 'md:text-right' : 'md:text-left'} flex-1`}>
            <h1 className={`text-2xl font-bold text-brand-navy dark:text-white mb-1 ${language === 'ar' ? 'font-arabic' : ''}`}>{user.name}</h1>
            <p className={`text-slate-500 dark:text-slate-400 mb-4 ${language === 'ar' ? 'font-arabic' : ''}`}>{user.email}</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium border border-slate-200 dark:border-white/10 ${language === 'ar' ? 'font-arabic' : ''}`}>
              <UserIcon className="w-4 h-4" />
              {user.plan === 'pro' ? 'Pro Plan' : t('freePlan')}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Usage Stats */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-white/10 transition-colors" dir={dir}>
            <h2 className={`text-xl font-bold text-brand-navy dark:text-white mb-6 flex items-center gap-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
              <Zap className="w-5 h-5 text-brand-teal" />
              {t('usage')}
            </h2>
            
            <div className={`mb-4 flex justify-between items-end ${language === 'ar' ? 'font-arabic' : ''}`}>
              <span className="text-slate-600 dark:text-slate-400">{t('generationsUsed')}</span>
              <span className="text-2xl font-bold text-brand-navy dark:text-white">
                {user.generationsUsed} <span className="text-slate-400 dark:text-slate-500 text-lg font-normal">/ {LIMIT}</span>
              </span>
            </div>
            
            <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2 overflow-hidden ${language === 'ar' ? 'rotate-180' : ''}`}>
              <div 
                className="bg-brand-teal h-3 rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            
            <p className={`text-sm text-slate-500 dark:text-slate-400 mt-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
              {user.generationsUsed >= LIMIT 
                ? (user.plan === 'pro' ? t('proLimitReachedMsg') : t('limitReachedMsg'))
                : (user.plan === 'pro' ? t('proLimitRemainingMsg', { count: LIMIT - user.generationsUsed }) : t('limitRemainingMsg', { count: LIMIT - user.generationsUsed }))}
            </p>
          </div>

          {/* Upgrade CTA */}
          {(user.plan !== 'pro' || user.generationsUsed >= LIMIT) && (
            <div className="bg-brand-navy dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-brand-navy dark:border-white/5 relative overflow-hidden" dir={dir}>
              {/* Abstract Background */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-teal rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
              </div>

              <div className="relative z-10">
                <h2 className={`text-xl font-bold text-white mb-2 flex items-center gap-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
                  <CreditCard className="w-5 h-5 text-brand-teal" />
                  {t('upgradePlan')}
                </h2>
                <p className={`text-slate-300 dark:text-slate-400 mb-6 text-sm leading-relaxed ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {t('upgradePlanDesc')}
                </p>
                
                <ul className="space-y-3 mb-8">
                  {[t('upgradeFeature1'), t('upgradeFeature2'), t('upgradeFeature3')].map((feature, i) => (
                    <li key={i} className={`flex items-center gap-2 text-slate-200 dark:text-slate-300 text-sm ${language === 'ar' ? 'font-arabic' : ''}`}>
                      <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className={`w-full py-3 px-4 bg-brand-teal text-brand-navy font-bold text-center rounded-xl hover:bg-brand-teal-hover transition-colors shadow-lg shadow-brand-teal/20 ${language === 'ar' ? 'font-arabic' : ''}`}
                >
                  {t('upgradeBtn')}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </div>
  );
}
