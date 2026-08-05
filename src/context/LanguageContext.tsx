import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations = {
  ar: {
    // Layout
    home: 'الرئيسية',
    account: 'الحساب',
    login: 'تسجيل الدخول',
    dashboard: 'لوحة التحكم',
    logout: 'تسجيل الخروج',
    
    // Landing
    heroTag: 'الذكاء الاصطناعي للإعلانات',
    heroTitle1: 'صوت إعلاناتك — ',
    heroTitle2: 'بلهجتك',
    heroSubtitle: 'منصة توليد الصوت بالذكاء الاصطناعي المخصصة لأصحاب المتاجر الإلكترونية في الجزائر. حوّل نصوصك إلى تعليق صوتي احترافي في ثوانٍ.',
    startNow: 'ابدأ مجانًا',
    howItWorksBtn: 'كيف تعمل؟',
    howItWorksTitle: 'كيف تعمل المنصة؟',
    howItWorksSubtitle: 'ثلاث خطوات بسيطة للحصول على تعليق صوتي احترافي',
    step1Title: 'اكتب النص',
    step1Desc: 'أدخل نص إعلانك بالدارجة الجزائرية وحدد اللهجة المناسبة لجمهورك.',
    step2Title: 'توصيل للـ AI',
    step2Desc: 'يقوم الذكاء الاصطناعي بتحليل النص وتوليد صوت بشري طبيعي.',
    step3Title: 'حمّل الصوت',
    step3Desc: 'استمع للنتيجة وحمّل الملف الصوتي بجودة عالية جاهز للاستخدام.',
    pricingTitle: 'باقات الأسعار',
    pricingSubtitle: 'اختر الباقة التي تناسب حجم عملك',
    freePlanTitle: 'الباقة المجانية',
    freePlanPrice: '0',
    freePlanCurrency: 'دج',
    freeFeature1: '3 توليدات صوتية',
    freeFeature2: 'صوت رجالي ونسائي',
    freeFeature3: 'جودة صوت قياسية',
    freeFeature4: 'تحميل بصيغة MP3',
    proPlanTitle: 'باقة المحترفين',
    proPlanBadge: 'الأكثر طلباً',
    proPlanPrice: '2900',
    proPlanCurrency: 'دج',
    proFeature1: '250 توليد صوتي',
    proFeature2: 'جودة صوت عالية جداً (WAV)',
    proFeature3: 'أولوية في الدعم الفني',
    proFeature4: 'استخدام تجاري',
    subscribeNow: 'شراء 250 توليد',
    footerRights: '© 2026 جميع الحقوق محفوظة. صنع للجزائريين 🇩🇿',
    
    // Dashboard
    newVoiceover: 'إعدادات الصوت',
    writeScript: 'أكتب نص إعلانك هنا',
    scriptPlaceholder: 'مثال: حاب تشري منتج يسهل حياتك؟ جبنالك الحل الأفضل بجودة عالية وتوصيل سريع لـ 58 ولاية...',
    voice: 'الصوت',
    customPrompt: 'نبرة الصوت / تعليمات إضافية (اختياري)',
    customPromptPlaceholder: 'مثال: تحدث بهدوء، اجعل الصوت حماسياً، اقرأ ببطء...',
    listenVoice: 'استمع للصوت',
    generateVoice: 'توليد الصوت',
    generating: 'جاري التوليد...',
    downloadWav: 'تحميل WAV',
    downloadMp3: 'تحميل MP3',
    audioWillAppearHere: 'الصوت المولد سيظهر هنا',
    generationHistory: 'سجل التوليدات',
    noGenerationsYet: 'لا توجد توليدات بعد — ابدأ الآن',
    limitReached: 'وصلت للحد المجاني',
    limitReachedDesc: 'لقد استهلكت 3 توليدات مجانية. طوّر حسابك للاستمرار.',
    proLimitReached: 'انتهت باقة المحترفين',
    proLimitReachedDesc: 'لقد استهلكت جميع التوليدات (250). قم بشراء الباقة مرة أخرى للاستمرار.',
    errorOccurred: 'حدث خطأ، حاول مرة أخرى',
    result: 'النتيجة',
    audioTooLarge: 'الصوت كبير جداً ولا يمكن حفظه في السجل',
    premadeScripts: 'نصوص جاهزة للتجربة',
    tipsTitle: 'نصائح للحصول على أفضل نتيجة',
    tip1: 'استخدم الفواصل (،) للوقفات القصيرة والنقاط (.) للوقفات الطويلة.',
    tip2: 'استخدم علامات التعجب (!) لإضافة حماس وقوة للصوت.',
    tip3: 'إذا لم ينطق الـ AI كلمة بشكل صحيح، حاول كتابتها كما تُنطق (مثلاً: "ڤاع" بدل "قاع").',
    tip4: 'استخدم "تعليمات إضافية" لتحديد نبرة الصوت (مثلاً: "تحدث بحماس"، "بسرعة"، "بهدوء").',
    tip5: 'قسّم النصوص الطويلة إلى جمل قصيرة لتحسين تدفق الكلام.',
    tip6: 'استخدم التشكيل (الفتحة، الضمة، الكسرة) على الكلمات الصعبة لضمان النطق الصحيح.',
    
    // Voices
    voiceKore: 'أمينة (أنثى هادئة)',
    voiceZephyr: 'سارة (أنثى حيوية)',
    voicePuck: 'إسماعيل (ذكر دافئ)',
    voiceCharon: 'كريم (ذكر عميق)',
    voiceFenrir: 'طارق (ذكر قوي)',
    voiceUmbriel: 'إبراهيم (ذكر كلاسيكي)',
    voiceZephyr2: 'مريم (أنثى شابة)',
    voicePuck2: 'يوسف (ذكر مرح)',
    voiceCharon2: 'عمر (ذكر رسمي)',
    voiceSulafat: 'رفيقة (أنثى حماسية)',
    
    // Account
    accountSettings: 'إعدادات الحساب',
    profile: 'الملف الشخصي',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    usage: 'الاستهلاك',
    generationsUsed: 'التوليدات المستخدمة',
    plan: 'الباقة الحالية',
    freePlan: 'حساب مجاني',
    upgradePlan: 'طوّر إلى المحترفين',
    upgradePlanDesc: 'احصل على 250 توليد صوتي، وجودة صوت عالية جداً (WAV) بـ 2900 دج فقط.',
    upgradeFeature1: '250 توليد صوتي',
    upgradeFeature2: 'جودة WAV',
    upgradeFeature3: 'استخدام تجاري',
    upgradeToDownload: 'قم بالترقية للتحميل',
    upgradeBtn: 'ترقية الحساب',
    limitReachedMsg: 'لقد استهلكت جميع التوليدات المجانية. طوّر حسابك للاستمرار.',
    proLimitReachedMsg: 'لقد استهلكت جميع التوليدات. قم بشراء الباقة مرة أخرى للاستمرار.',
    limitRemainingMsg: 'تبقى لك {count} توليدات مجانية.',
    proLimitRemainingMsg: 'تبقى لك {count} توليدات.',
    
    // Payment Modal
    paymentModalTitle: 'ترقية إلى باقة المحترفين',
    paymentModalDesc: 'يرجى الدفع باستخدام إحدى الطرق التالية، ثم إرسال إثبات الدفع لتفعيل حسابك.',
    paymentMethod1Title: 'بريدي موب (BaridiMob)',
    paymentMethod1Desc: 'RIP: 00799999002792001161',
    paymentMethod2Title: 'بريد الجزائر (CCP)',
    paymentMethod2Desc: 'الاسم: bellahcene abdellah\nرقم الحساب: 0027920011\nالمفتاح: 61\nالعنوان: reu420villas cnep, remchi tlemcen',
    paymentMethod3Title: 'USDT (العملات الرقمية)',
    paymentMethod3Desc: 'المبلغ: 12 USDT\nالشبكة: BNB Smart Chain (BSC20)\nالعنوان: 0x71dcdf57144a2e7fa978eac4cc92e406de0f0e38',
    sendProofBtn: 'إرسال إثبات الدفع',
    closeBtn: 'إغلاق',
    
    // Login
    welcomeBack: 'مرحباً بك مجدداً',
    loginSubtitle: 'سجل دخولك للبدء في توليد الإعلانات الصوتية',
    loginWithGoogle: 'تسجيل الدخول بـ Google',
    loginTerms: 'بتسجيل الدخول، أنت توافق على شروط الخدمة وسياسة الخصوصية.',
    loginRightTitle: 'أسرع طريقة لإنشاء إعلانات صوتية احترافية',
    loginRightDesc: 'ابدأ الآن في استخدام DZVOIXOFF لزيادة مبيعاتك من خلال إعلانات صوتية بالدارجة.',
    fullName: 'الاسم الكامل',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    orContinueWith: 'أو الاستمرار باستخدام',
    emailRequired: 'البريد الإلكتروني مطلوب',
    passwordRequired: 'كلمة المرور مطلوبة',
    nameRequired: 'الاسم الكامل مطلوب',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    resetPassword: 'استعادة كلمة المرور',
    sendResetLink: 'إرسال رابط الاستعادة',
    backToLogin: 'العودة لتسجيل الدخول',
    resetEmailSent: 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.',
    resetPasswordDesc: 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادة كلمة المرور.',
  },
  fr: {
    // Layout
    home: 'Accueil',
    account: 'Compte',
    login: 'Se connecter',
    dashboard: 'Tableau de bord',
    logout: 'Déconnexion',
    
    // Landing
    heroTag: 'IA pour la Publicité',
    heroTitle1: 'La voix de vos publicités — ',
    heroTitle2: 'dans votre dialecte',
    heroSubtitle: 'Plateforme de génération de voix par IA dédiée aux e-commerçants en Algérie. Transformez vos textes en voix off professionnelle en quelques secondes.',
    startNow: 'Commencer gratuitement',
    howItWorksBtn: 'Comment ça marche ?',
    howItWorksTitle: 'Comment fonctionne la plateforme ?',
    howItWorksSubtitle: 'Trois étapes simples pour obtenir une voix off professionnelle',
    step1Title: 'Écrivez le texte',
    step1Desc: 'Saisissez votre texte publicitaire en Darja algérienne.',
    step2Title: 'Connexion à l\'IA',
    step2Desc: 'L\'IA analyse le texte et génère une voix humaine naturelle.',
    step3Title: 'Téléchargez l\'audio',
    step3Desc: 'Écoutez le résultat et téléchargez le fichier audio de haute qualité.',
    pricingTitle: 'Nos Forfaits',
    pricingSubtitle: 'Choisissez le forfait qui correspond à votre activité',
    freePlanTitle: 'Forfait Gratuit',
    freePlanPrice: '0',
    freePlanCurrency: 'DA',
    freeFeature1: '3 générations vocales',
    freeFeature2: 'Voix masculine et féminine',
    freeFeature3: 'Qualité audio standard',
    freeFeature4: 'Téléchargement MP3',
    proPlanTitle: 'Forfait Pro',
    proPlanBadge: 'Le plus populaire',
    proPlanPrice: '2900',
    proPlanCurrency: 'DA',
    proFeature1: '250 générations vocales',
    proFeature2: 'Très haute qualité audio (WAV)',
    proFeature3: 'Support technique prioritaire',
    proFeature4: 'Utilisation commerciale',
    subscribeNow: 'Acheter 250 générations',
    footerRights: '© 2026 Tous droits réservés. Fait pour les Algériens 🇩🇿',
    
    // Dashboard
    newVoiceover: 'Paramètres vocaux',
    writeScript: 'Écrivez votre script ici...',
    scriptPlaceholder: 'Exemple: Vous cherchez un produit de qualité ? Découvrez notre nouvelle gamme avec livraison sur 58 wilayas...',
    voice: 'Voix',
    customPrompt: 'Ton de la voix / Instructions (Optionnel)',
    customPromptPlaceholder: 'Ex: Parlez calmement, rendez la voix enthousiaste, lisez lentement...',
    listenVoice: 'Écouter la voix',
    generateVoice: 'Générer la voix',
    generating: 'Génération en cours...',
    downloadWav: 'Télécharger WAV',
    downloadMp3: 'Télécharger MP3',
    audioWillAppearHere: 'L\'audio généré apparaîtra ici',
    generationHistory: 'Historique des générations',
    noGenerationsYet: 'Aucune génération pour le moment — Commencez maintenant',
    limitReached: 'Limite gratuite atteinte',
    limitReachedDesc: 'Vous avez utilisé vos 3 générations gratuites. Mettez à niveau votre compte pour continuer.',
    proLimitReached: 'Limite Pro atteinte',
    proLimitReachedDesc: 'Vous avez utilisé toutes vos générations (250). Achetez à nouveau le forfait pour continuer.',
    errorOccurred: 'Une erreur s\'est produite, veuillez réessayer',
    result: 'Résultat',
    audioTooLarge: 'L\'audio est trop volumineux pour être enregistré dans l\'historique',
    premadeScripts: 'Scripts prédéfinis',
    tipsTitle: 'Conseils pour un meilleur résultat',
    tip1: 'Utilisez des virgules (,) pour des pauses courtes et des points (.) pour des pauses longues.',
    tip2: 'Utilisez des points d\'exclamation (!) pour ajouter de l\'énergie à la voix.',
    tip3: 'Si l\'IA prononce mal un mot, essayez de l\'écrire phonétiquement.',
    tip4: 'Utilisez les "Instructions" pour définir le ton (ex: "parlez avec enthousiasme", "vite", "calmement").',
    tip5: 'Divisez les longs textes en phrases courtes pour un meilleur flux.',
    tip6: 'Utilisez les diacritiques (tashkil) sur les mots difficiles pour garantir une prononciation correcte.',
    
    // Voices
    voiceKore: 'Amina (Femme calme)',
    voiceZephyr: 'Sarah (Femme dynamique)',
    voicePuck: 'Ismail (Homme chaleureux)',
    voiceCharon: 'Karim (Homme profond)',
    voiceFenrir: 'Tarek (Homme fort)',
    voiceUmbriel: 'Ibrahim (Homme classique)',
    voiceZephyr2: 'Meriem (Jeune femme)',
    voicePuck2: 'Youcef (Homme joyeux)',
    voiceCharon2: 'Omar (Homme formel)',
    voiceSulafat: 'Rafika (Femme enthousiaste)',
    
    // Account
    accountSettings: 'Paramètres du compte',
    profile: 'Profil',
    name: 'Nom',
    email: 'E-mail',
    usage: 'Consommation',
    generationsUsed: 'Générations utilisées',
    plan: 'Forfait actuel',
    freePlan: 'Compte gratuit',
    upgradePlan: 'Passer à Pro',
    upgradePlanDesc: 'Obtenez 250 générations vocales et une très haute qualité audio (WAV) pour seulement 2900 DA.',
    upgradeFeature1: '250 générations vocales',
    upgradeFeature2: 'Qualité WAV',
    upgradeFeature3: 'Utilisation commerciale',
    upgradeToDownload: 'Mettez à niveau pour télécharger',
    upgradeBtn: 'Mettre à niveau',
    limitReachedMsg: 'Vous avez utilisé toutes vos générations gratuites. Mettez à niveau votre compte pour continuer.',
    proLimitReachedMsg: 'Vous avez utilisé toutes vos générations. Achetez à nouveau le forfait pour continuer.',
    limitRemainingMsg: 'Il vous reste {count} générations gratuites.',
    proLimitRemainingMsg: 'Il vous reste {count} générations.',
    
    // Payment Modal
    paymentModalTitle: 'Passer au forfait Pro',
    paymentModalDesc: 'Veuillez payer via l\'une des méthodes suivantes, puis envoyez la preuve de paiement pour activer votre compte.',
    paymentMethod1Title: 'BaridiMob',
    paymentMethod1Desc: 'RIP: 00799999002792001161',
    paymentMethod2Title: 'Algérie Poste (CCP)',
    paymentMethod2Desc: 'Nom: bellahcene abdellah\nCCP: 0027920011\nClé: 61\nAdresse: reu420villas cnep, remchi tlemcen',
    paymentMethod3Title: 'USDT (Crypto)',
    paymentMethod3Desc: 'Montant: 12 USDT\nRéseau: BNB Smart Chain (BSC20)\nAdresse: 0x71dcdf57144a2e7fa978eac4cc92e406de0f0e38',
    sendProofBtn: 'Envoyer la preuve de paiement',
    closeBtn: 'Fermer',
    
    // Login
    welcomeBack: 'Bon retour',
    loginSubtitle: 'Connectez-vous pour commencer à générer des publicités audio',
    loginWithGoogle: 'Se connecter avec Google',
    loginTerms: 'En vous connectant, vous acceptez les conditions d\'utilisation et la politique de confidentialité.',
    loginRightTitle: 'Le moyen le plus rapide de créer des publicités audio professionnelles',
    loginRightDesc: 'Commencez dès maintenant à utiliser DZVOIXOFF pour augmenter vos ventes avec des publicités audio en Darja.',
    fullName: 'Nom complet',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    noAccount: 'Pas de compte ?',
    hasAccount: 'Déjà un compte ?',
    orContinueWith: 'Ou continuer avec',
    emailRequired: 'L\'e-mail est requis',
    passwordRequired: 'Le mot de passe est requis',
    nameRequired: 'Le nom complet est requis',
    forgotPassword: 'Mot de passe oublié ?',
    resetPassword: 'Réinitialiser le mot de passe',
    sendResetLink: 'Envoyer le lien',
    backToLogin: 'Retour à la connexion',
    resetEmailSent: 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.',
    resetPasswordDesc: 'Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
  },
  en: {
    // Layout
    home: 'Home',
    account: 'Account',
    login: 'Login',
    dashboard: 'Dashboard',
    logout: 'Logout',
    
    // Landing
    heroTag: 'AI for Advertising',
    heroTitle1: 'The voice of your ads — ',
    heroTitle2: 'in your dialect',
    heroSubtitle: 'AI voice generation platform dedicated to e-commerce owners in Algeria. Turn your text into professional voiceovers in seconds.',
    startNow: 'Start for free',
    howItWorksBtn: 'How it works?',
    howItWorksTitle: 'How does the platform work?',
    howItWorksSubtitle: 'Three simple steps to get a professional voiceover',
    step1Title: 'Write the text',
    step1Desc: 'Enter your ad text in Algerian Darja.',
    step2Title: 'Connect to AI',
    step2Desc: 'The AI analyzes the text and generates a natural human voice.',
    step3Title: 'Download audio',
    step3Desc: 'Listen to the result and download the high-quality audio file.',
    pricingTitle: 'Pricing Plans',
    pricingSubtitle: 'Choose the plan that fits your business',
    freePlanTitle: 'Free Plan',
    freePlanPrice: '0',
    freePlanCurrency: 'DZD',
    freeFeature1: '3 voice generations',
    freeFeature2: 'Male and female voices',
    freeFeature3: 'Standard audio quality',
    freeFeature4: 'MP3 download',
    proPlanTitle: 'Pro Plan',
    proPlanBadge: 'Most Popular',
    proPlanPrice: '2900',
    proPlanCurrency: 'DZD',
    proFeature1: '250 voice generations',
    proFeature2: 'Very high audio quality (WAV)',
    proFeature3: 'Priority technical support',
    proFeature4: 'Commercial use',
    subscribeNow: 'Buy 250 Generations',
    footerRights: '© 2026 All rights reserved. Made for Algerians 🇩🇿',
    
    // Dashboard
    newVoiceover: 'Voice Settings',
    writeScript: 'Write your ad script here...',
    scriptPlaceholder: 'Example: Looking for a high-quality product? Discover our new collection with fast delivery to 58 wilayas...',
    voice: 'Voice',
    customPrompt: 'Voice Tone / Instructions (Optional)',
    customPromptPlaceholder: 'Ex: Speak calmly, make the voice enthusiastic, read slowly...',
    listenVoice: 'Preview Voice',
    generateVoice: 'Generate Voice',
    generating: 'Generating...',
    downloadWav: 'Download WAV',
    downloadMp3: 'Download MP3',
    audioWillAppearHere: 'Generated audio will appear here',
    generationHistory: 'Generation History',
    noGenerationsYet: 'No generations yet — Start now',
    limitReached: 'Free limit reached',
    limitReachedDesc: 'You have used your 3 free generations. Upgrade your account to continue.',
    proLimitReached: 'Pro limit reached',
    proLimitReachedDesc: 'You have used all your generations (250). Repurchase the plan to continue.',
    errorOccurred: 'An error occurred, please try again',
    result: 'Result',
    audioTooLarge: 'Audio is too large to be saved in history',
    premadeScripts: 'Premade Scripts',
    tipsTitle: 'Tips for Best Results',
    tip1: 'Use commas (,) for short pauses and periods (.) for longer ones.',
    tip2: 'Use exclamation marks (!) to add energy and impact to the voice.',
    tip3: 'If the AI mispronounces a word, try writing it phonetically.',
    tip4: 'Use "Custom Prompt" to set the tone (e.g., "speak excitedly", "fast", "calmly").',
    tip5: 'Break long texts into shorter sentences for better natural flow.',
    tip6: 'Use diacritics (tashkil) on difficult words to ensure correct pronunciation.',
    
    // Voices
    voiceKore: 'Amina (Calm Female)',
    voiceZephyr: 'Sarah (Dynamic Female)',
    voicePuck: 'Ismail (Warm Male)',
    voiceCharon: 'Karim (Deep Male)',
    voiceFenrir: 'Tarek (Strong Male)',
    voiceUmbriel: 'Ibrahim (Classic Male)',
    voiceZephyr2: 'Meriem (Young Female)',
    voicePuck2: 'Youcef (Joyful Male)',
    voiceCharon2: 'Omar (Formal Male)',
    voiceSulafat: 'Rafika (Enthusiastic Female)',
    
    // Account
    accountSettings: 'Account Settings',
    profile: 'Profile',
    name: 'Name',
    email: 'Email',
    usage: 'Usage',
    generationsUsed: 'Generations Used',
    plan: 'Current Plan',
    freePlan: 'Free Account',
    upgradePlan: 'Upgrade to Pro',
    upgradePlanDesc: 'Get 250 voice generations and very high audio quality (WAV) for only 2900 DZD.',
    upgradeFeature1: '250 voice generations',
    upgradeFeature2: 'WAV Quality',
    upgradeFeature3: 'Commercial use',
    upgradeToDownload: 'Upgrade to download',
    upgradeBtn: 'Upgrade Account',
    limitReachedMsg: 'You have consumed all free generations. Upgrade your account to continue.',
    proLimitReachedMsg: 'You have consumed all your generations. Repurchase the plan to continue.',
    limitRemainingMsg: 'You have {count} free generations left.',
    proLimitRemainingMsg: 'You have {count} generations left.',
    
    // Payment Modal
    paymentModalTitle: 'Upgrade to Pro Plan',
    paymentModalDesc: 'Please pay using one of the following methods, then send the proof of payment to activate your account.',
    paymentMethod1Title: 'BaridiMob',
    paymentMethod1Desc: 'RIP: 00799999002792001161',
    paymentMethod2Title: 'Algeria Post (CCP)',
    paymentMethod2Desc: 'Name: bellahcene abdellah\nCCP: 0027920011\nKey: 61\nAddress: reu420villas cnep, remchi tlemcen',
    paymentMethod3Title: 'USDT (Crypto)',
    paymentMethod3Desc: 'Amount: 12 USDT\nNetwork: BNB Smart Chain (BSC20)\nAddress: 0x71dcdf57144a2e7fa978eac4cc92e406de0f0e38',
    sendProofBtn: 'Send Proof of Payment',
    closeBtn: 'Close',
    
    // Login
    welcomeBack: 'Welcome Back',
    loginSubtitle: 'Log in to start generating audio ads',
    loginWithGoogle: 'Log in with Google',
    loginTerms: 'By logging in, you agree to the Terms of Service and Privacy Policy.',
    loginRightTitle: 'The fastest way to create professional audio ads',
    loginRightDesc: 'Start now using DZVOIXOFF to increase your sales through audio ads in Darja.',
    fullName: 'Full Name',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    noAccount: 'Don\'t have an account?',
    hasAccount: 'Already have an account?',
    orContinueWith: 'Or continue with',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    nameRequired: 'Full name is required',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Login',
    resetEmailSent: 'A password reset link has been sent to your email.',
    resetPasswordDesc: 'Enter your email address and we will send you a link to reset your password.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    const storedLang = localStorage.getItem('dzvoixoff_lang') as Language;
    if (storedLang && ['ar', 'fr', 'en'].includes(storedLang)) {
      setLanguage(storedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('dzvoixoff_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  // Initialize dir on mount
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = (translations[language] as any)[key] || key;
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, String(params[param]));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
