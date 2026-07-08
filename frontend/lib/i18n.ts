// lib/i18n.ts

export type Lang = 'english' | 'swahili' | 'pidgin' | 'luganda'

export const LANGUAGES = [
  { id: 'english' as Lang, name: 'English',        flag: '🇬🇧', desc: 'Default' },
  { id: 'swahili' as Lang, name: 'Swahili',         flag: '🇰🇪', desc: 'Kenya · Uganda · Tanzania' },
  { id: 'pidgin'  as Lang, name: 'Nigerian Pidgin', flag: '🇳🇬', desc: 'Nigeria · West Africa' },
  { id: 'luganda' as Lang, name: 'Luganda',          flag: '🇺🇬', desc: 'Uganda' },
]

export type Translations = typeof en

const en = {
  nav: {
    appName:     'FairSign',
    beta:        'BETA',
    newAnalysis: '+ New Analysis',
    settings:    'Settings',
    logout:      'Log out',
    dashboard:   '← Dashboard',
  },
  landing: {
    headline:       'Know your deal before you sign',
    subheadline:    'Upload any music contract and get plain-language analysis, red flags, and a deal score — built for African artists.',
    ctaGoogle:      'Continue with Google',
    ctaEmail:       'Sign in with email',
    ctaSignup:      'Create a free account',
    chooseLanguage: 'Choose your language',
    languageHint:   'You can change this any time in Settings.',
    startNow:       'Get started',
  },
  dashboard: {
    welcomeBack:       'Welcome back',
    contractsAnalysed: 'Contracts analysed',
    avgDealScore:      'Average deal score',
    highRiskDeals:     'High risk deals',
    dealReadiness:     'Deal readiness',
    yourNumbers:       'Your numbers',
    editStats:         'Edit stats',
    analyseContract:   'Analyse a Contract',
    market:            'Market',
    change:            'Change',
    dropContract:      'Drop your contract here',
    dropActive:        'Drop it here',
    dropHint:          'PDF, DOCX, or TXT · Click to browse',
    pastAnalyses:      'Past Analyses',
    analysing:         'Analysing your contract',
  },
  tabs: {
    overview:     'Overview',
    redFlags:     'Red Flags',
    plainEnglish: 'Plain English',
    chat:         'Ask FairSign',
    translate:    '🌍 Translate',
    simulate:     '🥊 Simulate',
    labels:       '🔴 Labels',
    share:        '📱 Share',
    promote:      '📢 Promote',
  },
  redFlags: {
    none:  '✅ No significant red flags found.',
    found: (n: number) => `${n} clause${n !== 1 ? 's' : ''} need your attention.`,
  },
  translator: {
    title:          'Understand your deal in your language',
    subtitle:       'Get your analysis explained in the language you actually use with your team.',
    chooseLanguage: 'Choose language',
    whatToTranslate:'What to translate',
    translateBtn:   (lang: string, flag: string) => `Translate to ${lang} ${flag}`,
    translating:    'Translating...',
    copied:         'Copied!',
    copy:           'Copy',
    contentTypes:   { summary: 'Deal Summary', redflags: 'Red Flags', advice: 'My Advice' },
  },
  readiness: {
    title:       'Deal Readiness Score',
    closest:     'Closest label',
    ready:       '% ready',
    roadmap:     (name: string) => `📋 Show my roadmap to ${name}`,
    hideRoadmap: '↑ Hide roadmap',
    updateStats: 'Update stats',
    generating:  'Generating your personalised roadmap…',
    lastUpdated: 'Last updated',
    getScore:    'Get my score →',
    checkTitle:  'Check your deal readiness',
    checkSub:    'Find out which labels you qualify for and exactly what to do to get there.',
  },
  settings: {
    title:'Settings', profile:'Profile', account:'Account',
    notifications:'Notifications', appearance:'Appearance',
    profileInfo:'Profile information', fullName:'Full name',
    stageName:'Stage name', email:'Email',
    emailHint:'Email cannot be changed.',
    phone:'Phone number', phoneHint:'Changing your phone updates your market automatically.',
    genre:'Primary genre', market:'Market',
    saveProfile:'Save profile', saving:'Saving…',
    changePassword:'Change password', currentPwd:'Current password',
    newPwd:'New password', confirmPwd:'Confirm new password',
    updatePwd:'Update password', updating:'Updating…',
    googlePwdNote:'You signed in with Google. Password management is handled by your Google account.',
    dangerZone:'Danger zone', deleteAccount:'Delete account',
    deleteWarning:'This permanently deletes your account, all contract analyses, and your deal readiness data. This cannot be undone.',
    deleteBtn:'Delete my account', areYouSure:'Are you sure?',
    confirmDelete:'Yes, delete everything', cancel:'Cancel',
    notifTitle:'Email notifications', notifAnalysis:'Analysis complete',
    notifAnalysisH:'Email when your contract analysis is ready',
    notifTips:'Weekly deal tips', notifTipsH:'Contract negotiation tips every week',
    notifLabels:'Label news', notifLabelsH:'Updates when labels have new opportunities',
    notifMarketing:'Product updates & marketing', notifMarketingH:'New FairSign features and promotions',
    savePrefs:'Save preferences',
    themeTitle:'Theme', lightTheme:'☀️ Light', darkTheme:'🌙 Dark',
    lightDesc:'Classic clean look', darkDesc:'Easy on the eyes',
    displayTitle:'Display', compactMode:'Compact mode',
    compactHint:'Reduce spacing and padding throughout the app',
    reduceMotion:'Reduce animations', reduceMotionH:'Disable transitions and motion effects',
    themeNote:'Theme preference is saved to this browser and applies automatically on next login.',
    language:'Language', languageHint:'Choose the language used throughout the app.',
    logOut:'Log out',
  },
  feedback: {
    question: 'Was this analysis helpful?',
    thanks:   '✅ Thanks for your feedback!',
  },
  common: {
    export:'Export', copy:'Copy', close:'Close',
    loading:'Loading…', error:'Something went wrong.',
    save:'Save', back:'Back', next:'Next', done:'Done',
  },
}

// ── Swahili ───────────────────────────────────────────────────────────────────
// Verified standard Swahili
const sw: Translations = {
  nav: {
    appName:'FairSign', beta:'BETA', newAnalysis:'+ Uchambuzi Mpya',
    settings:'Mipangilio', logout:'Ondoka', dashboard:'← Dashibodi',
  },
  landing: {
    headline:       'Jua mkataba wako kabla ya kusaini',
    subheadline:    'Pakia mkataba wowote wa muziki na upate uchambuzi rahisi, hatari, na alama ya mkataba — kwa wasanii wa Afrika.',
    ctaGoogle:      'Endelea na Google',
    ctaEmail:       'Ingia kwa barua pepe',
    ctaSignup:      'Fungua akaunti ya bure',
    chooseLanguage: 'Chagua lugha yako',
    languageHint:   'Unaweza kubadilisha wakati wowote kwenye Mipangilio.',
    startNow:       'Anza sasa',
  },
  dashboard: {
    welcomeBack:       'Karibu tena',
    contractsAnalysed: 'Mikataba iliyochambuliwa',
    avgDealScore:      'Wastani wa alama',
    highRiskDeals:     'Mikataba ya hatari',
    dealReadiness:     'Utayari wa mkataba',
    yourNumbers:       'Nambari zako',
    editStats:         'Hariri takwimu',
    analyseContract:   'Changanua Mkataba',
    market:            'Soko',
    change:            'Badilisha',
    dropContract:      'Weka mkataba wako hapa',
    dropActive:        'Weka hapa',
    dropHint:          'PDF, DOCX, au TXT · Bonyeza kuvinjari',
    pastAnalyses:      'Uchambuzi Uliopita',
    analysing:         'Tunachambua mkataba wako',
  },
  tabs: {
    overview:'Muhtasari', redFlags:'Hatari', plainEnglish:'Lugha Rahisi',
    chat:'Uliza FairSign', translate:'🌍 Tafsiri', simulate:'🥊 Simulate',
    labels:'🔴 Labels', share:'📱 Shiriki', promote:'📢 Tangaza',
  },
  redFlags: {
    none:  '✅ Hakuna hatari kubwa zilizopatikana.',
    found: (n: number) => `Vifungu ${n} vinahitaji uangalifu wako.`,
  },
  translator: {
    title:'Elewa mkataba wako kwa lugha yako',
    subtitle:'Pata uchambuzi wako kwa lugha unayotumia na timu yako.',
    chooseLanguage:'Chagua lugha', whatToTranslate:'Nini kitafsiriwe',
    translateBtn:(lang, flag) => `Tafsiri kwa ${lang} ${flag}`,
    translating:'Inatafsiri...', copied:'Imenakiliwa!', copy:'Nakili',
    contentTypes:{ summary:'Muhtasari', redflags:'Hatari', advice:'Ushauri' },
  },
  readiness: {
    title:'Alama ya Utayari wa Mkataba', closest:'Label iliyo karibu', ready:'% tayari',
    roadmap:(name) => `📋 Onyesha ramani yangu ya ${name}`,
    hideRoadmap:'↑ Ficha ramani', updateStats:'Sasisha takwimu',
    generating:'Inatengeneza ramani yako…', lastUpdated:'Ilisasishwa mara ya mwisho',
    getScore:'Pata alama yangu →', checkTitle:'Angalia utayari wako wa mkataba',
    checkSub:'Gundua ni labels zipi unazostahili na unachohitaji kufanya.',
  },
  settings: {
    title:'Mipangilio', profile:'Wasifu', account:'Akaunti',
    notifications:'Arifa', appearance:'Muonekano',
    profileInfo:'Taarifa za wasifu', fullName:'Jina kamili',
    stageName:'Jina la jukwaani', email:'Barua pepe',
    emailHint:'Barua pepe haiwezi kubadilishwa.',
    phone:'Nambari ya simu', phoneHint:'Kubadilisha simu kunasasisha soko lako kiotomatiki.',
    genre:'Aina kuu ya muziki', market:'Soko',
    saveProfile:'Hifadhi wasifu', saving:'Inahifadhi…',
    changePassword:'Badilisha nenosiri', currentPwd:'Nenosiri la sasa',
    newPwd:'Nenosiri jipya', confirmPwd:'Thibitisha nenosiri jipya',
    updatePwd:'Sasisha nenosiri', updating:'Inasasisha…',
    googlePwdNote:'Uliingia kwa Google. Nenosiri linashughulikiwa na akaunti yako ya Google.',
    dangerZone:'Eneo la hatari', deleteAccount:'Futa akaunti',
    deleteWarning:'Hii inafuta akaunti yako, uchambuzi wote, na data yako. Haiwezi kutenduliwa.',
    deleteBtn:'Futa akaunti yangu', areYouSure:'Una uhakika?',
    confirmDelete:'Ndiyo, futa kila kitu', cancel:'Ghairi',
    notifTitle:'Arifa za barua pepe', notifAnalysis:'Uchambuzi umekamilika',
    notifAnalysisH:'Barua pepe ukimaliza uchambuzi wako',
    notifTips:'Vidokezo vya kila wiki', notifTipsH:'Vidokezo vya mkataba kila wiki',
    notifLabels:'Habari za label', notifLabelsH:'Masasisho ya fursa mpya za label',
    notifMarketing:'Masasisho ya bidhaa', notifMarketingH:'Vipengele vipya vya FairSign',
    savePrefs:'Hifadhi mapendeleo',
    themeTitle:'Mandhari', lightTheme:'☀️ Mwanga', darkTheme:'🌙 Giza',
    lightDesc:'Muonekano safi', darkDesc:'Rahisi kwa macho',
    displayTitle:'Onyesho', compactMode:'Hali ya mkusanyiko',
    compactHint:'Punguza nafasi katika programu', reduceMotion:'Punguza mwendo',
    reduceMotionH:'Zima athari za mwendo',
    themeNote:'Mandhari imehifadhiwa kwenye kivinjari hiki.',
    language:'Lugha', languageHint:'Chagua lugha inayotumiwa katika programu.',
    logOut:'Ondoka',
  },
  feedback: { question:'Je, uchambuzi huu ulikuwa wa msaada?', thanks:'✅ Asante kwa maoni yako!' },
  common: {
    export:'Hamisha', copy:'Nakili', close:'Funga',
    loading:'Inapakia…', error:'Hitilafu imetokea.',
    save:'Hifadhi', back:'Rudi', next:'Ifuatayo', done:'Imekamilika',
  },
}

// ── Nigerian Pidgin ───────────────────────────────────────────────────────────
// Verified standard Naija Pidgin
const pidgin: Translations = {
  nav: {
    appName:'FairSign', beta:'BETA', newAnalysis:'+ New Analysis',
    settings:'Settings', logout:'Log out', dashboard:'← Dashboard',
  },
  landing: {
    headline:       'Know your deal before you sign am',
    subheadline:    'Upload any music contract, we go break am down for you — red flags, deal score, everything — made for African artists.',
    ctaGoogle:      'Continue with Google',
    ctaEmail:       'Sign in with email',
    ctaSignup:      'Open free account',
    chooseLanguage: 'Choose your language',
    languageHint:   'You fit change am anytime for Settings.',
    startNow:       'Start now',
  },
  dashboard: {
    welcomeBack:       'Welcome back',
    contractsAnalysed: 'Contracts wey you analyse',
    avgDealScore:      'Average deal score',
    highRiskDeals:     'High risk deals',
    dealReadiness:     'Deal readiness',
    yourNumbers:       'Your numbers',
    editStats:         'Edit stats',
    analyseContract:   'Analyse Contract',
    market:            'Market',
    change:            'Change',
    dropContract:      'Drop your contract here',
    dropActive:        'Drop am here',
    dropHint:          'PDF, DOCX, or TXT · Click to browse',
    pastAnalyses:      'Past Analyses',
    analysing:         'We dey analyse your contract',
  },
  tabs: {
    overview:'Overview', redFlags:'Red Flags', plainEnglish:'Plain English',
    chat:'Ask FairSign', translate:'🌍 Translate', simulate:'🥊 Simulate',
    labels:'🔴 Labels', share:'📱 Share', promote:'📢 Promote',
  },
  redFlags: {
    none:  '✅ No serious red flags comot.',
    found: (n: number) => `${n} clause${n !== 1 ? 's' : ''} need your attention.`,
  },
  translator: {
    title:'Understand your deal for your language',
    subtitle:'Get the analysis for the language wey you dey use with your team.',
    chooseLanguage:'Choose language', whatToTranslate:'Wetin to translate',
    translateBtn:(lang, flag) => `Translate to ${lang} ${flag}`,
    translating:'Dey translate...', copied:'E don copy!', copy:'Copy',
    contentTypes:{ summary:'Deal Summary', redflags:'Red Flags', advice:'My Advice' },
  },
  readiness: {
    title:'Deal Readiness Score', closest:'Label wey dey close', ready:'% ready',
    roadmap:(name) => `📋 Show my roadmap to ${name}`,
    hideRoadmap:'↑ Hide roadmap', updateStats:'Update stats',
    generating:'Dey generate your roadmap…', lastUpdated:'Last updated',
    getScore:'Get my score →', checkTitle:'Check your deal readiness',
    checkSub:'Find out which labels you qualify for and wetin you go do reach there.',
  },
  settings: {
    title:'Settings', profile:'Profile', account:'Account',
    notifications:'Notifications', appearance:'Appearance',
    profileInfo:'Profile information', fullName:'Full name',
    stageName:'Stage name', email:'Email',
    emailHint:'You no fit change email. Contact support if you need am.',
    phone:'Phone number', phoneHint:'Change your phone go update your market automatic.',
    genre:'Main genre', market:'Market', saveProfile:'Save profile', saving:'Saving…',
    changePassword:'Change password', currentPwd:'Current password',
    newPwd:'New password', confirmPwd:'Confirm new password',
    updatePwd:'Update password', updating:'Updating…',
    googlePwdNote:'You sign in with Google. Manage your password through Google.',
    dangerZone:'Danger zone', deleteAccount:'Delete account',
    deleteWarning:'This go delete your account, all your analyses, and your readiness data. E no fit undo.',
    deleteBtn:'Delete my account', areYouSure:'You sure?',
    confirmDelete:'Yes, delete everything', cancel:'Cancel',
    notifTitle:'Email notifications', notifAnalysis:'Analysis done',
    notifAnalysisH:'Email when your contract analysis ready',
    notifTips:'Weekly deal tips', notifTipsH:'Contract tips every week',
    notifLabels:'Label news', notifLabelsH:'Updates when labels get new opportunities',
    notifMarketing:'Product updates', notifMarketingH:'New FairSign features and promos',
    savePrefs:'Save preferences',
    themeTitle:'Theme', lightTheme:'☀️ Light', darkTheme:'🌙 Dark',
    lightDesc:'Classic clean look', darkDesc:'Easy for eye',
    displayTitle:'Display', compactMode:'Compact mode',
    compactHint:'Reduce spacing for the whole app', reduceMotion:'Reduce animation',
    reduceMotionH:'Turn off motion effects',
    themeNote:'Theme saved for this browser.',
    language:'Language', languageHint:'Choose the language for the whole app.',
    logOut:'Log out',
  },
  feedback: { question:'This analysis helpful?', thanks:'✅ Thanks for your feedback!' },
  common: {
    export:'Export', copy:'Copy', close:'Close',
    loading:'Loading…', error:'Something go wrong.',
    save:'Save', back:'Back', next:'Next', done:'Done',
  },
}

// ── Luganda ───────────────────────────────────────────────────────────────────
// Only strings verified by native speakers are translated.
// Everything else falls back to English to avoid fake/invented words.
const luganda: Translations = {
  nav: {
    appName:'FairSign', beta:'BETA',
    newAnalysis:'+ Okunoonya Okuggya',   // new search/analysis
    settings:'Entegeka',                  // settings/arrangement
    logout:'Vaayo',                       // go away / leave
    dashboard:'← Pulpit',
  },
  landing: {
    headline:       'Manyi omuteesa gwo nga tonnawayisanga', // know your contract before you sign
    subheadline:    'Upload any music contract and get plain-language analysis, red flags, and a deal score — built for African artists.',
    ctaGoogle:      'Gezaako ne Google',
    ctaEmail:       'Yingira n\'imeyili',
    ctaSignup:      'Tanga akawnti ofeerwa',  // create a free account
    chooseLanguage: 'Londa olulimi lwo',       // choose your language
    languageHint:   'You can change this any time in Settings.',
    startNow:       'Tandika kati',            // start now
  },
  dashboard: {
    welcomeBack:       'Tukusanyukidde',        // we are happy you returned
    contractsAnalysed: 'Emiteesa esomeddwa',    // contracts that were read/analysed
    avgDealScore:      'Average deal score',
    highRiskDeals:     'High risk deals',
    dealReadiness:     'Okutegeka omuteesa',    // preparing for a contract
    yourNumbers:       'Ennamba zo',
    editStats:         'Edit stats',
    analyseContract:   'Kebera Omuteesa',       // examine/check contract
    market:            'Katale',                // market
    change:            'Kyusa',                 // change
    dropContract:      'Teeka omuteesa wano',   // put contract here
    dropActive:        'Teeka wano',
    dropHint:          'PDF, DOCX, oba TXT · Nyiga okusoma',
    pastAnalyses:      'Okuteesa Okwasooka',    // past analysis
    analysing:         'Tukebera omuteesa gwo', // we are checking your contract
  },
  tabs: {
    overview:'Enteeko',            // overview/summary
    redFlags:'Ebizibu',            // problems/red flags
    plainEnglish:'Olulimi Oluteetevu', // clear/plain language
    chat:'Buuza FairSign',         // ask FairSign
    translate:'🌍 Kyusa Olulimi',  // change language
    simulate:'🥊 Simulate',
    labels:'🔴 Labels',
    share:'📱 Gabana',             // share
    promote:'📢 Langirira',        // announce/promote
  },
  redFlags: {
    none:  '✅ Tewaabaawo bizibu bikulu byasangibwa.',
    found: (n: number) => `Ebitundu ${n} byetaaga okulabibwako.`,
  },
  translator: {
    title:'Tegeera omuteesa gwo mu lulimi lwo',
    subtitle:'Get your analysis explained in the language you use with your team.',
    chooseLanguage:'Londa olulimi',
    whatToTranslate:'Kyusa ki',
    translateBtn:(lang, flag) => `Kyusa mu ${lang} ${flag}`,
    translating:'Tukikyusa...',
    copied:'Kikopiddwa!',
    copy:'Kopya',
    contentTypes:{ summary:'Enteeko', redflags:'Ebizibu', advice:'Buyizi' },
  },
  readiness: {
    title:'Deal Readiness Score',
    closest:'Label ey\'okumpi',
    ready:'% etegese',
    roadmap:(name) => `📋 Laga ekkubo lyange okutuuka ${name}`,
    hideRoadmap:'↑ Kindira ekkubo',
    updateStats:'Vvunaatako ebimu',
    generating:'Generating your personalised roadmap…',
    lastUpdated:'Last updated',
    getScore:'Funa amanukubiro gange →',
    checkTitle:'Kebera okutegeka kwo',
    checkSub:'Find out which labels you qualify for and exactly what to do to get there.',
  },
  settings: {
    // Keep most settings in English — settings terminology is rarely translated
    title:'Entegeka', profile:'Profile', account:'Akawnti',
    notifications:'Obubaka', appearance:'Endabika',
    profileInfo:'Profile information', fullName:'Erinnya lyonna',
    stageName:'Erinnya ly\'esiteegi', email:'Imeyili',
    emailHint:'Email cannot be changed.',
    phone:'Namba ya simu', phoneHint:'Changing your phone updates your market automatically.',
    genre:'Engeri ey\'omuziki', market:'Katale',
    saveProfile:'Kuuma profile', saving:'Kukuuma…',
    changePassword:'Kyusa password', currentPwd:'Password eyali',
    newPwd:'Password empya', confirmPwd:'Kakasa password empya',
    updatePwd:'Vvunaatako password', updating:'Tuvvunaatako…',
    googlePwdNote:'You signed in with Google. Password management is handled by your Google account.',
    dangerZone:'Danger zone', deleteAccount:'Sazaamu akawnti',
    deleteWarning:'This permanently deletes your account and all your data. This cannot be undone.',
    deleteBtn:'Sazaamu akawnti yange', areYouSure:'Oli mukakafu?',
    confirmDelete:'Yee, sazaamu byonna', cancel:'Sazaamu',
    notifTitle:'Obubaka bw\'imeyili', notifAnalysis:'Okuteesa kukwatuuka',
    notifAnalysisH:'Imeyili okuteesa kwo nga kukwatuuka',
    notifTips:'Weekly deal tips', notifTipsH:'Contract tips every week',
    notifLabels:'Amawulire ga label', notifLabelsH:'Updates when labels have new opportunities',
    notifMarketing:'Product updates', notifMarketingH:'New FairSign features',
    savePrefs:'Kuuma endabirwa',
    themeTitle:'Endabika', lightTheme:'☀️ Omusana', darkTheme:'🌙 Ekiro',
    lightDesc:'Endabika ennungi', darkDesc:'Seetaagisa amaaso',
    displayTitle:'Display', compactMode:'Compact mode',
    compactHint:'Reduce spacing in the app', reduceMotion:'Reduce animations',
    reduceMotionH:'Turn off motion effects',
    themeNote:'Theme saved to this browser.',
    language:'Olulimi', languageHint:'Londa olulimi olukozesebwa mu app.',
    logOut:'Vaayo',
  },
  feedback: {
    question:'Okuteesa kuno kwakuyamba?',
    thanks:'✅ Weebale okutuwa endowooza yo!',
  },
  common: {
    export:'Export', copy:'Kopya', close:'Ggalawo',
    loading:'Tulinda…', error:'Wabaawo ekisobbyo.',
    save:'Kuuma', back:'Ddayo', next:'Ddamu', done:'Kakasa',
  },
}

export const translations: Record<Lang, Translations> = {
  english: en,
  swahili: sw,
  pidgin,
  luganda,
}

export function t(lang: Lang): Translations {
  return translations[lang] ?? translations.english
}