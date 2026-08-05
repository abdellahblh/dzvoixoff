import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Mic, Play, Download, Settings2, History, AlertCircle, Loader2, Volume2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import CustomAudioPlayer from '../components/CustomAudioPlayer';
import { db, auth, functions, storage } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, limit } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

function createAudioUrl(base64Audio: string): string {
  // If it's already a blob URL or a full URL, return it
  if (base64Audio.startsWith('blob:') || base64Audio.startsWith('http')) return base64Audio;

  const binaryString = atob(base64Audio);
  
  if (binaryString.startsWith('RIFF')) {
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  const sampleRate = 24000;
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = binaryString.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < binaryString.length; i++) {
    view.setUint8(44 + i, binaryString.charCodeAt(i));
  }

  const blob = new Blob([view], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

interface Generation {
  id: string;
  userId: string;
  date: any;
  script: string;
  audioUrl: string;
  voice: string;
}

async function generateTTS(textToSpeak: string, voice: string, customPrompt: string = ''): Promise<string> {
  const voiceMap: Record<string, string> = {
    'Kore': 'Kore',
    'Zephyr': 'Zephyr',
    'Puck': 'Puck',
    'Charon': 'Charon',
    'Fenrir': 'Fenrir',
    'Umbriel': 'Puck',
    'Zephyr-2': 'Zephyr',
    'Puck-2': 'Puck',
    'Charon-2': 'Charon',
    'Sulafat': 'Kore'
  };
  const actualVoice = voiceMap[voice] || 'Kore';
  const voiceName = actualVoice.split('-')[0];
  
  const promptText = `Read the following text with an aggressive, high-impact sales voice designed for Facebook, TikTok, and Instagram Reels ads.
Deliver the text with maximum energy, urgency, and confidence to force attention and trigger immediate buying decisions.

Powerful, punchy rhythm — no calm or slow delivery
Create urgency, FOMO, and desire in every sentence
Emphasize problem → solution → result naturally through delivery
Bold, assertive, and convincing — never shy or neutral
Stress key words and benefits with strong vocal emphasis
End with a direct, commanding call to action
${customPrompt.trim() ? `\nAdditional instructions: ${customPrompt.trim()}` : ''}

Text to speak:
${textToSpeak}`;

  const generateAudioFn = httpsCallable<{ text: string, voice: string }, { audio: string }>(functions, 'generateAudio');
  const result = await generateAudioFn({ text: promptText, voice: voiceName });
  
  if (!result.data || !result.data.audio) {
    throw new Error("No audio data returned from server");
  }

  return result.data.audio;
}

export default function Dashboard() {
  const { user, incrementUsage, isAuthReady } = useAuth();
  const { t, language } = useLanguage();
  
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [history, setHistory] = useState<Generation[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const MAX_CHARS = 500;
  const LIMIT = user?.plan === 'pro' ? 250 : 3;
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (isAuthReady && auth.currentUser) {
      const q = query(
        collection(db, 'generations'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('date', 'desc'),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const historyData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Generation[];
        setHistory(historyData);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `generations`);
      });

      return () => unsubscribe();
    } else {
      setHistory([]);
    }
  }, [isAuthReady, user]);

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const voiceMap: Record<string, string> = {
        'Kore': 'Kore',
        'Zephyr': 'Zephyr',
        'Puck': 'Puck',
        'Charon': 'Charon',
        'Fenrir': 'Fenrir',
        'Umbriel': 'Puck',
        'Zephyr-2': 'Zephyr',
        'Puck-2': 'Puck',
        'Charon-2': 'Charon',
        'Sulafat': 'Kore'
      };
      const actualVoice = voiceMap[voice] || 'Kore';
      
      // Try to play the static file first (if the user uploaded one)
      const audioUrl = `/voices/${actualVoice}.wav`;
      const audio = new Audio(audioUrl);
      
      // Handle playback errors
      audio.onerror = () => {
        console.error(`Static preview not found for ${actualVoice}`);
        setError(language === 'ar' ? 'ملف الصوت غير موجود.' : 'Audio file not found.');
        setIsPreviewing(false);
      };

      audio.onended = () => {
        setIsPreviewing(false);
      };

      await audio.play();
    } catch (err) {
      console.error("Preview Error:", err);
      setIsPreviewing(false);
    }
  };

  const handleGenerate = async () => {
    if (!script.trim()) {
      setError('الرجاء كتابة النص أولاً');
      return;
    }
    if (user && user.generationsUsed >= LIMIT) {
      setError('limit_reached');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentAudio(null);

    try {
      const base64Audio = await generateTTS(script, voice, customPrompt);
      const audioUrl = createAudioUrl(base64Audio);
      
      setCurrentAudio(audioUrl);
      incrementUsage();
      
      if (auth.currentUser) {
        const generationId = Date.now().toString();
        let finalAudioUrl = '';

        try {
          // Convert base64 to Blob for storage
          const binaryString = atob(base64Audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'audio/wav' });

          // Upload to Firebase Storage
          const storageRef = ref(storage, `generations/${auth.currentUser.uid}/${generationId}.wav`);
          await uploadBytes(storageRef, blob);
          finalAudioUrl = await getDownloadURL(storageRef);
        } catch (storageErr) {
          console.error("Storage Upload Error:", storageErr);
          // Fallback to Firestore if small enough, or just empty
          if (base64Audio.length < 1000000) {
            finalAudioUrl = base64Audio;
          }
        }

        const newGenData = {
          userId: auth.currentUser.uid,
          date: new Date(),
          script: script.substring(0, 50) + (script.length > 50 ? '...' : ''),
          audioUrl: finalAudioUrl,
          voice
        };
        
        try {
          await setDoc(doc(db, 'generations', generationId), newGenData);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `generations/${generationId}`);
        }
      }
      
    } catch (err: any) {
      console.error("TTS Error:", err);
      let errorMessage = t('errorOccurred');
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        if (err.message) errorMessage = err.message;
        else if (err.error && err.error.message) errorMessage = err.error.message;
        else errorMessage = JSON.stringify(err);
      }
      setError(errorMessage || t('errorOccurred'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL - Input Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-6" dir="rtl">
              <h2 className={`text-xl font-bold text-brand-navy dark:text-white flex items-center gap-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
                <Settings2 className="w-5 h-5 text-brand-teal" />
                {t('newVoiceover')}
              </h2>
            </div>

            <div className="space-y-6" dir="rtl">
              {/* Premade Scripts */}
              <div>
                <label className={`block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {t('premadeScripts') || (language === 'ar' ? 'نصوص جاهزة للتجربة' : 'Premade Scripts')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      id: 1,
                      label: language === 'ar' ? '[🛒 إعلان منتج]' : '[🛒 Product Ad]',
                      text: "راك تحوس على منتج يسهّل لك حياتك؟ عييت من السلعة العيانة لي تخسر بالخف؟ جبنالك الحل لي يهنيك ڤاع! منتوج أصلي ومضمون مية بالمية. والأهم؟ التوصيل متوفر لـ 69 ولاية، وتخلص غير كي تلحقك السلعة للدار. واش راك تستنى؟ كليكي لتحت وكوموندي دوكا!"
                    },
                    {
                      id: 2,
                      label: language === 'ar' ? '[👋 ترحيب]' : '[👋 Welcome]',
                      text: "مرحبا بيك في منصتنا! راك حاب تعرف قوة الذكاء الاصطناعي تاعنا؟ هادي هضرة مكتوبة، والسيسْتَام راهو يقرا فيها بالدارجة بكل احترافية، بلا ما تضيع وقتك مع المونطاج. اكتب أي حاجة حابها، خير الصوت لي يعجبك، وخلي الباقي علينا. جرب دوكا واسمع الفرق!"
                    },
                    {
                      id: 3,
                      label: language === 'ar' ? '[🔥 عرض خاص]' : '[🔥 Special Offer]',
                      text: "سَلْعَة طُوب، كاليتي شابة، والسومة هبال! إذا راك حاب تضاعف المبيعات تاعك، هادا هو الوقت. متراطيش الفرصة، الكمية محدودة جداً. كليكي على الرابط واستفاد من التخفيض دوكا!"
                    }
                  ].map((example) => (
                    <button
                      key={example.id}
                      onClick={() => setScript(example.text)}
                      className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-brand-teal/20 dark:hover:bg-brand-teal/20 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-lg transition-colors font-arabic"
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Script Input */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className={`block text-sm font-semibold text-slate-700 dark:text-slate-300 ${language === 'ar' ? 'font-arabic' : ''}`}>{t('writeScript')}</label>
                  <span className={cn(
                    "text-xs font-mono",
                    script.length > MAX_CHARS ? "text-red-500" : "text-slate-400 dark:text-slate-500"
                  )}>
                    {script.length} / {MAX_CHARS}
                  </span>
                </div>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value.slice(0, MAX_CHARS))}
                  placeholder={t('scriptPlaceholder')}
                  className={`w-full h-40 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent resize-none text-lg leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all ${language === 'ar' ? 'font-arabic' : ''}`}
                  dir={dir}
                />
              </div>

              {/* Controls Grid */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className={`block text-sm font-semibold text-slate-700 dark:text-slate-300 ${language === 'ar' ? 'font-arabic' : ''}`}>{t('voice')}</label>
                  <button 
                    onClick={handlePreview} 
                    disabled={isPreviewing}
                    className={`text-xs flex items-center gap-1 text-brand-teal hover:text-brand-navy dark:hover:text-white transition-colors ${language === 'ar' ? 'font-arabic' : ''}`}
                  >
                    {isPreviewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                    {t('listenVoice')}
                  </button>
                </div>
                <select 
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className={`w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-teal text-slate-900 dark:text-white transition-all ${language === 'ar' ? 'font-arabic' : ''}`}
                >
                  <option value="Kore" className="dark:bg-slate-900">{t('voiceKore')}</option>
                  <option value="Zephyr" className="dark:bg-slate-900">{t('voiceZephyr')}</option>
                  <option value="Puck" className="dark:bg-slate-900">{t('voicePuck')}</option>
                  <option value="Charon" className="dark:bg-slate-900">{t('voiceCharon')}</option>
                  <option value="Fenrir" className="dark:bg-slate-900">{t('voiceFenrir')}</option>
                  <option value="Umbriel" className="dark:bg-slate-900">{t('voiceUmbriel')}</option>
                  <option value="Zephyr-2" className="dark:bg-slate-900">{t('voiceZephyr2')}</option>
                  <option value="Puck-2" className="dark:bg-slate-900">{t('voicePuck2')}</option>
                  <option value="Charon-2" className="dark:bg-slate-900">{t('voiceCharon2')}</option>
                  <option value="Sulafat" className="dark:bg-slate-900">{t('voiceSulafat')}</option>
                </select>
              </div>

              {/* Custom Prompt Input */}
              <div className="mb-4">
                <label className={`block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {t('customPrompt')}
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={t('customPromptPlaceholder')}
                  className={`w-full h-20 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent resize-none text-sm leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all ${language === 'ar' ? 'font-arabic' : ''}`}
                  dir={dir}
                />
              </div>

              {/* Error Messages */}
              <AnimatePresence>
                {(error || (user && user.generationsUsed >= LIMIT)) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    {(error === 'limit_reached' || (user && user.generationsUsed >= LIMIT)) ? (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-200 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className={`font-bold mb-1 ${language === 'ar' ? 'font-arabic' : ''}`}>
                            {user?.plan === 'pro' ? t('proLimitReached') : t('limitReached')}
                          </p>
                          <p className={`text-sm mb-3 ${language === 'ar' ? 'font-arabic' : ''}`}>
                            {user?.plan === 'pro' ? t('proLimitReachedDesc') : t('limitReachedDesc')}
                          </p>
                          <Link to="/account" className={`text-sm font-bold text-brand-navy bg-amber-200 dark:bg-amber-800/50 dark:text-amber-100 px-4 py-2 rounded-lg hover:bg-amber-300 dark:hover:bg-amber-800 transition-colors inline-block ${language === 'ar' ? 'font-arabic' : ''}`}>
                            {t('upgradePlan')}
                          </Link>
                        </div>
                      </div>
                    ) : error ? (
                      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (user?.generationsUsed || 0) >= LIMIT}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all",
                  language === 'ar' ? 'font-arabic' : '',
                  isGenerating || (user?.generationsUsed || 0) >= LIMIT
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed" 
                    : "bg-brand-teal text-brand-navy hover:bg-brand-teal-hover shadow-lg shadow-brand-teal/20"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>{t('generating')}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6" />
                    <span>{t('generateVoice')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Output & History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Audio Player Card */}
          <div className="bg-brand-navy dark:bg-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden min-h-[200px] flex flex-col justify-center border border-white/5">
            {/* Abstract Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] opacity-20" />
            </div>

            <div className="relative z-10 text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="flex items-center gap-1 h-12">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 bg-brand-teal rounded-full"
                        animate={{ height: [10, 40, 10] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <p className={`text-brand-teal font-medium animate-pulse ${language === 'ar' ? 'font-arabic' : ''}`}>{t('generating')}</p>
                </div>
              ) : currentAudio ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <CustomAudioPlayer src={currentAudio} />
                  <div className="flex justify-center gap-3">
                    {user?.plan === 'pro' ? (
                      <>
                        <a 
                          href={currentAudio} 
                          download="dzvoixoff_ad.wav"
                          className={`flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm ${language === 'ar' ? 'font-arabic' : ''}`}
                        >
                          <Download className="w-4 h-4" />
                          <span>{t('downloadWav')}</span>
                        </a>
                        <a 
                          href={currentAudio} 
                          download="dzvoixoff_ad.mp3"
                          className={`flex items-center gap-2 px-4 py-2 bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal rounded-lg transition-colors text-sm ${language === 'ar' ? 'font-arabic' : ''}`}
                        >
                          <Download className="w-4 h-4" />
                          <span>{t('downloadMp3')}</span>
                        </a>
                      </>
                    ) : (
                      <button 
                        onClick={() => setIsPaymentModalOpen(true)}
                        className={`flex items-center gap-2 px-6 py-3 bg-brand-teal text-brand-navy font-bold rounded-xl hover:bg-brand-teal-hover transition-colors shadow-lg shadow-brand-teal/20 ${language === 'ar' ? 'font-arabic' : ''}`}
                      >
                        <Download className="w-5 h-5" />
                        <span>{t('upgradeToDownload')}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className={`text-slate-400 dark:text-slate-500 flex flex-col items-center gap-3 ${language === 'ar' ? 'font-arabic' : ''}`}>
                  <Mic className="w-12 h-12 opacity-20" />
                  <p>{t('audioWillAppearHere')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <Sparkles className="w-5 h-5 text-brand-teal" />
              <h2 className={`text-lg font-bold text-brand-navy dark:text-white ${language === 'ar' ? 'font-arabic' : ''}`}>
                {t('tipsTitle')}
              </h2>
            </div>
            <ul className="space-y-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-1.5 shrink-0" />
                  <span className={language === 'ar' ? 'font-arabic' : ''}>{t(`tip${i}` as any)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* History List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <h2 className={`text-lg font-bold text-brand-navy dark:text-white flex items-center gap-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
                <History className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                {t('generationHistory')}
              </h2>
            </div>

            <div className="space-y-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {history.length === 0 ? (
                <div className={`text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-white/5 ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {t('noGenerationsYet')}
                </div>
              ) : (
                history.map((item) => {
                  const d = item.date?.toDate ? item.date.toDate() : new Date(item.date);
                  const formattedDate = d.toLocaleString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  // Map the raw voice name to the translation key
                  let voiceDisplayName = item.voice;
                  if (item.voice) {
                    const voiceKeyMap: Record<string, string> = {
                      'Kore': 'voiceKore',
                      'Zephyr': 'voiceZephyr',
                      'Puck': 'voicePuck',
                      'Charon': 'voiceCharon',
                      'Fenrir': 'voiceFenrir',
                      'Umbriel': 'voiceUmbriel',
                      'Zephyr-2': 'voiceZephyr2',
                      'Puck-2': 'voicePuck2',
                      'Charon-2': 'voiceCharon2',
                      'Sulafat': 'voiceSulafat'
                    };
                    const translationKey = voiceKeyMap[item.voice];
                    if (translationKey) {
                      voiceDisplayName = t(translationKey as any);
                    }
                  }

                  return (
                    <div key={item.id} className="p-3 rounded-xl border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4 group">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm text-slate-800 dark:text-slate-200 truncate mb-1 ${language === 'ar' ? 'font-arabic' : ''}`}>{item.script}</p>
                        <div className={`flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 ${language === 'ar' ? 'font-arabic' : ''}`}>
                          {item.voice && (
                            <>
                              <span className="font-medium text-brand-teal bg-brand-teal/10 dark:bg-brand-teal/20 px-2 py-0.5 rounded-md">{voiceDisplayName}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => item.audioUrl && setCurrentAudio(createAudioUrl(item.audioUrl))}
                        disabled={!item.audioUrl}
                        title={!item.audioUrl ? t('audioTooLarge') : ''}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                          item.audioUrl 
                            ? "bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-brand-teal group-hover:bg-brand-teal group-hover:text-white dark:group-hover:text-brand-navy" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                        )}
                      >
                        <Play className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
      />
    </div>
  );
}
