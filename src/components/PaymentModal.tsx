import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, CheckCircle2, CreditCard, Wallet, Landmark, Upload, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { trackPixelEvent } from '../lib/pixel';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      trackPixelEvent('InitiateCheckout', { 
        value: 2900, 
        currency: 'DZD', 
        content_name: 'Pro Plan Upgrade' 
      }, { 
        em: user?.email,
        external_id: user?.id 
      });
    }
  }, [isOpen, user?.email]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const paymentMethods = [
    {
      icon: <CreditCard className="w-6 h-6 text-brand-teal" />,
      title: t('paymentMethod1Title') || 'BaridiMob',
      details: t('paymentMethod1Desc') || 'RIP: 00799999002792001161',
      copyText: '00799999002792001161'
    },
    {
      icon: <Landmark className="w-6 h-6 text-brand-teal" />,
      title: t('paymentMethod2Title') || 'Algérie Poste (CCP)',
      details: t('paymentMethod2Desc') || 'Name: bellahcene abdellah\nCCP: 0027920011\nKey: 61\nAddress: reu420villas cnep, remchi tlemcen',
      copyText: '0027920011'
    },
    {
      icon: <Wallet className="w-6 h-6 text-brand-teal" />,
      title: t('paymentMethod3Title') || 'USDT (Crypto)',
      details: t('paymentMethod3Desc') || 'Amount: 12 USDT\nNetwork: BNB Smart Chain (BSC20)\nAddress: 0x71dcdf57144a2e7fa978eac4cc92e406de0f0e38',
      copyText: '0x71dcdf57144a2e7fa978eac4cc92e406de0f0e38'
    }
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 800KB to be safe for Firestore 1MB limit with base64 overhead)
    if (file.size > 800 * 1024) {
      setError(language === 'ar' ? 'حجم الملف كبير جداً. الحد الأقصى 800 كيلوبايت.' : 'File size too large. Max 800KB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result as string;
        
        await addDoc(collection(db, 'payment_proofs'), {
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          fileData: base64String,
          status: 'pending',
          createdAt: new Date()
        });

        trackPixelEvent('Subscribe', { 
          value: 2900, 
          currency: 'DZD', 
          content_name: 'Pro Plan Upgrade Proof Submitted' 
        }, { 
          em: user.email, 
          fn: user.name,
          external_id: user.id 
        });

        setUploadSuccess(true);
        setIsUploading(false);
        setTimeout(() => {
          onClose();
          setUploadSuccess(false);
        }, 3000);
      };
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
    } catch (err) {
      console.error('Upload error:', err);
      setError(language === 'ar' ? 'حدث خطأ أثناء رفع الملف.' : 'Failed to upload file.');
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/80 dark:bg-slate-950/90 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-white/10 transition-colors"
          dir={dir}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/10">
            <h2 className={`text-2xl font-bold text-brand-navy dark:text-white ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t('paymentModalTitle') || 'Upgrade to Pro'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <p className={`text-slate-600 dark:text-slate-400 mb-6 leading-relaxed ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t('paymentModalDesc') || 'Please pay using one of the following methods, then send the proof of payment to activate your account.'}
            </p>

            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl p-5 relative group transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm shrink-0 border border-slate-100 dark:border-white/5">
                      {method.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-brand-navy dark:text-white mb-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
                        {method.title}
                      </h3>
                      <div className={`text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed ${language === 'ar' ? 'font-arabic' : 'font-mono'}`}>
                        {method.details}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(method.copyText, index)}
                      className="p-2 text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors shrink-0"
                      title="Copy"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}
            
            {uploadSuccess && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm border border-green-100 dark:border-green-900/30 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {language === 'ar' ? 'تم إرسال الإثبات بنجاح! سيتم مراجعته قريباً.' : 'Proof sent successfully! It will be reviewed soon.'}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-3 transition-colors">
            <input 
              type="file" 
              accept="image/*,.pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!isUploading && !uploadSuccess) {
                  fileInputRef.current?.click();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (!isUploading && !uploadSuccess) {
                    fileInputRef.current?.click();
                  }
                }
              }}
              className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-brand-teal text-brand-navy font-bold text-center rounded-xl hover:bg-brand-teal-hover transition-colors shadow-lg shadow-brand-teal/20 ${isUploading || uploadSuccess ? 'opacity-50 pointer-events-none' : ''} ${language === 'ar' ? 'font-arabic' : ''}`}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : uploadSuccess ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              {t('sendProofBtn') || 'Send Proof of Payment'}
            </div>
            <button
              onClick={onClose}
              className={`py-3 px-6 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-center rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${language === 'ar' ? 'font-arabic' : ''}`}
            >
              {t('closeBtn') || 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
