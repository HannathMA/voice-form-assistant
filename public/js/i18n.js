/**
 * i18n.js — Shared UI translations for all pages.
 * Load this BEFORE each page's own JS script.
 * Call applyPageTranslations() on DOMContentLoaded.
 */

const PAGE_STRINGS = {
  en: {
    // ── index.html ─────────────────────────────────────────
    heroBadge:        '✨ AI-Powered Voice Assistance',
    heroTitle:        'Fill Any Form<br />With Your <span class="highlight">Voice</span>',
    heroSubtitle:     'Upload a photo of any paper form — bank, school, or government — and fill it in your own language using just your voice. No typing required.',
    langSectionLabel: 'Step 1',
    langSectionTitle: 'Choose Your Language',
    langSectionSub:   'Select the language you are most comfortable speaking in.',
    ctaBtn:           '🚀 Get Started — Upload a Form',
    ctaNote:          'You can change the language at any time during form filling.',
    feat1: 'Voice in your language',
    feat2: 'Upload any paper form',
    feat3: 'AI detects all fields',
    feat4: 'Save & resume later',
    feat5: 'Print when done',
    toastLang:        'Language set to',

    // ── dashboard.html (Step 2) ────────────────────────────
    dashStepLabel:    'Step 2',
    dashTitle:        'Upload Your Form',
    dashSub:          'Take a clear photo of any paper form and upload it. Our AI will read and detect all the fields for you.',
    uploadTitle:      'Drop your form here',
    uploadSub:        'Drag and drop a photo of your form',
    uploadOr:         'or',
    browseBtn:        '📁 Browse Files',
    uploadHint:       'Supports: JPG, PNG, WebP · Max 10 MB',
    detectBtn:        '🤖 Detect Form Fields',
    detectNote:       'The AI will identify every field in your form. This takes about 10–20 seconds.',
    tipsTitle:        '📸 Tips for best results',
    tip1:             'Take the photo in good lighting — avoid shadows.',
    tip2:             'Hold the camera straight above the form, not at an angle.',
    tip3:             'Make sure all text on the form is clearly visible.',
    tip4:             'If the form has multiple pages, upload one page at a time.',
    tip5:             'After detection, you can review and correct any field names.',
    currentLangLabel: '🌐 Current Language',
    currentLangNote:  'Voice guidance will be in',
    changeLang:       '← Change language',
    imgSelected:      'Image selected!',
    removeBtn:        '✕ Remove',

    // ── form.html (Step 3) ─────────────────────────────────
    prevBtn:          '← Previous',
    skipBtn:          'Skip',
    nextBtn:          'Next →',
    finishBtn:        '✅ Finish',
    allFields:        'All Fields',
    listenBtn:        '🔊 Listen',
    recordBtn:        '🎙️ Record Answer',
    stopRecBtn:       '⏹ Stop Recording',
    speakingStatus:   '🔊 Speaking…',
    listeningStatus:  '🎙️ Listening…',
    processingStatus: '⏳ Processing…',
    processSpeech:    '⏳ Processing speech…',
    noHear:           'Could not hear clearly. Try again.',
    hintText:         'Click 🔊 to hear the question, then 🎙️ to speak your answer, or type below.',
    hintNumber:       'Speak or type the number.',
    hintDate:         'Say or type the date (e.g., 10 May 1990).',
    hintSelect:       'Choose an option below or say it aloud.',
    hintCheckbox:     'Say "yes" or "no", or tick the box.',
    hintTextarea:     'Speak or type your full answer.',
    hintDefault:      'Speak or type your answer.',
    selectPlaceholder:'— Select an option —',
    fieldOf:          'Field',   // "Field X of Y" — used dynamically
    questionOf:       'Question',

    // ── progress.html (Step 4) ─────────────────────────────
    progressStepLabel:'Step 4 — Review',
    progressTitle:    'Review Your Answers',
    progressSub:      'Check all your answers below. You can go back and edit any field.',
    completeSub:      'All fields have been filled successfully.',
    answersTitle:     '📝 Your Answers',
    thField:          'Field',
    thAnswer:         'Your Answer',
    thEdit:           'Edit',
    statLabelTotal:   'Total Fields',
    statLabelAnswered:'Answered',
    statLabelSkipped: 'Skipped',
    statLabelComplete:'Complete',
    editAnswerBtn:    '✏️ Edit',
    editAnswersLink:  '← Edit Answers',
    printBtn:         '🖨️ Print / Save as PDF',
    newFormBtn:       '➕ Fill Another Form',
    emptyAnswer:      '—',
    navLangLabel:     'Language:',
    navBack:          '← Back',
    notAnswered:      '— Not answered',
    yes:              'Yes',
    no:               'No',
    formCompletedToast:'Form completed! 🎉',
    voiceHelpBtn:     '🔊 How to Fill',
    autoReadOn:       '🔊 Auto-read: ON',
    autoReadOff:      '🔈 Auto-read: OFF',
    voiceAssistantBadge:'🎙️ AI Voice Guide',
    voiceHelpText:    'Welcome to VoiceForm! You can fill this form with your voice. Click the Listen button to hear the question. Click Record Answer to speak your answer, or type in the box. Click Next to move to the next field.',
    speakQuestionPrefix:'Question',
  },

  ml: {
    // ── index.html ─────────────────────────────────────────
    heroBadge:        '✨ AI-ശക്തിയുള്ള ശബ്ദ സഹായം',
    heroTitle:        'ഏതു ഫോമും<br /><span class="highlight">ശബ്ദം</span> കൊണ്ട് പൂരിപ്പിക്കൂ',
    heroSubtitle:     'ഏതെങ്കിലും കടലാസ് ഫോമിന്റെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യൂ — ബാങ്ക്, സ്കൂൾ, അല്ലെങ്കിൽ സർക്കാർ — ശബ്ദം ഉപയോഗിച്ച് നിങ്ങളുടെ ഭാഷയിൽ പൂരിപ്പിക്കൂ. ടൈപ്പ് ചെയ്യേണ്ട ആവശ്യമില്ല.',
    langSectionLabel: 'ഘട്ടം 1',
    langSectionTitle: 'ഭാഷ തിരഞ്ഞെടുക്കൂ',
    langSectionSub:   'നിങ്ങൾക്ക് ഏറ്റവും സൗകര്യപ്രദമായ ഭാഷ തിരഞ്ഞെടുക്കൂ.',
    ctaBtn:           '🚀 ആരംഭിക്കൂ — ഫോം അപ്‌ലോഡ് ചെയ്യൂ',
    ctaNote:          'ഫോം പൂരിപ്പിക്കുന്ന ഏത് സമയത്തും ഭാഷ മാറ്റാം.',
    feat1: 'നിങ്ങളുടെ ഭാഷയിൽ ശബ്ദം',
    feat2: 'ഏതു ഫോമും അപ്‌ലോഡ് ചെയ്യൂ',
    feat3: 'AI എല്ലാ ഫീൽഡുകളും കണ്ടെത്തുന്നു',
    feat4: 'സേവ് ചെയ്ത് പിന്നീട് തുടരൂ',
    feat5: 'പൂർത്തിയായാൽ പ്രിന്റ് ചെയ്യൂ',
    toastLang:        'ഭാഷ മാറ്റി:',

    // ── dashboard.html ─────────────────────────────────────
    dashStepLabel:    'ഘട്ടം 2',
    dashTitle:        'ഫോം അപ്‌ലോഡ് ചെയ്യൂ',
    dashSub:          'ഏതെങ്കിലും കടലാസ് ഫോമിന്റെ വ്യക്തമായ ഫോട്ടോ എടുത്ത് അപ്‌ലോഡ് ചെയ്യൂ. ഞങ്ങളുടെ AI എല്ലാ ഫീൽഡുകളും സ്വയം കണ്ടെത്തും.',
    uploadTitle:      'ഇവിടെ ഫോം ഡ്രോപ്പ് ചെയ്യൂ',
    uploadSub:        'ഫോമിന്റെ ഫോട്ടോ ഡ്രാഗ് & ഡ്രോപ്പ് ചെയ്യൂ',
    uploadOr:         'അല്ലെങ്കിൽ',
    browseBtn:        '📁 ഫയൽ തിരഞ്ഞെടുക്കൂ',
    uploadHint:       'JPG, PNG, WebP പിന്തുണക്കുന്നു · പരമാവധി 10 MB',
    detectBtn:        '🤖 ഫോം ഫീൽഡുകൾ കണ്ടെത്തൂ',
    detectNote:       'AI നിങ്ങളുടെ ഫോമിലെ ഓരോ ഫീൽഡും തിരിച്ചറിയും. ഇതിന് 10–20 സെക്കൻഡ് എടുക്കും.',
    tipsTitle:        '📸 മികച്ച ഫലങ്ങൾക്കുള്ള നുറുങ്ങുകൾ',
    tip1:             'നല്ല വെളിച്ചത്തിൽ ഫോട്ടോ എടുക്കൂ — നിഴൽ ഒഴിവാക്കൂ.',
    tip2:             'ക്യാമറ ഫോമിന് നേരെ മുകളിൽ നിർത്തൂ, ചരിച്ചല്ല.',
    tip3:             'ഫോമിലെ എല്ലാ ടെക്സ്റ്റും വ്യക്തമായി കാണാം എന്ന് ഉറപ്പാക്കൂ.',
    tip4:             'ഫോമിൽ ഒന്നിലധികം പേജുകൾ ഉണ്ടെങ്കിൽ ഒരു സമയം ഒരു പേജ് അപ്‌ലോഡ് ചെയ്യൂ.',
    tip5:             'കണ്ടെത്തലിന് ശേഷം, ഏതെങ്കിലും ഫീൽഡ് പേര് തിരുത്താം.',
    currentLangLabel: '🌐 നിലവിലെ ഭാഷ',
    currentLangNote:  'ശബ്ദ നിർദ്ദേശം ഇതിലായിരിക്കും:',
    changeLang:       '← ഭാഷ മാറ്റൂ',
    imgSelected:      'ചിത്രം തിരഞ്ഞെടുത്തു!',
    removeBtn:        '✕ നീക്കം ചെയ്യൂ',

    // ── form.html ──────────────────────────────────────────
    prevBtn:          '← മുൻ ചോദ്യം',
    skipBtn:          'ഒഴിവാക്കൂ',
    nextBtn:          'അടുത്തത് →',
    finishBtn:        '✅ പൂർത്തിയാക്കൂ',
    allFields:        'എല്ലാ ഫീൽഡുകളും',
    listenBtn:        '🔊 കേൾക്കൂ',
    recordBtn:        '🎙️ ഉത്തരം പറയൂ',
    stopRecBtn:       '⏹ നിർത്തൂ',
    speakingStatus:   '🔊 പറയുന്നു…',
    listeningStatus:  '🎙️ കേൾക്കുന്നു…',
    processingStatus: '⏳ പ്രോസസ്സ് ചെയ്യുന്നു…',
    processSpeech:    '⏳ ശബ്ദം പ്രോസസ്സ് ചെയ്യുന്നു…',
    noHear:           'വ്യക്തമായി കേൾക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കൂ.',
    hintText:         '🔊 ചോദ്യം കേൾക്കാൻ ക്ലിക്ക് ചെയ്യൂ, തുടർന്ന് 🎙️ ഉത്തരം പറയൂ, അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യൂ.',
    hintNumber:       'നമ്പർ പറയൂ അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യൂ.',
    hintDate:         'തീയതി പറയൂ അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യൂ (ഉദാ: 10 മേയ് 1990).',
    hintSelect:       'ഒരു ഓപ്ഷൻ തിരഞ്ഞെടുക്കൂ അല്ലെങ്കിൽ ഉറക്കെ പറയൂ.',
    hintCheckbox:     '"അതെ" അല്ലെങ്കിൽ "ഇല്ല" പറയൂ, അല്ലെങ്കിൽ ടിക്ക് ചെയ്യൂ.',
    hintTextarea:     'നിങ്ങളുടെ പൂർണ്ണ ഉത്തരം പറയൂ അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യൂ.',
    hintDefault:      'ഉത്തരം പറയൂ അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യൂ.',
    selectPlaceholder:'— ഒരു ഓപ്ഷൻ തിരഞ്ഞെടുക്കൂ —',
    fieldOf:          'ഫീൽഡ്',
    questionOf:       'ചോദ്യം',

    // ── progress.html ──────────────────────────────────────
    progressStepLabel:'ഘട്ടം 4 — അവലോകനം',
    progressTitle:    'നിങ്ങളുടെ ഉത്തരങ്ങൾ പരിശോധിക്കൂ',
    progressSub:      'ചുവടെ എല്ലാ ഉത്തരങ്ങളും പരിശോധിക്കൂ. ഏതെങ്കിലും ഫീൽഡ് തിരികെ ചെന്ന് തിരുത്താം.',
    completeSub:      'എല്ലാ ഫീൽഡുകളും വിജയകരമായി പൂരിപ്പിച്ചു.',
    answersTitle:     '📝 നിങ്ങളുടെ ഉത്തരങ്ങൾ',
    thField:          'ഫീൽഡ്',
    thAnswer:         'നിങ്ങളുടെ ഉത്തരം',
    thEdit:           'തിരുത്ത്',
    statLabelTotal:   'ആകെ ഫീൽഡുകൾ',
    statLabelAnswered:'ഉത്തരം നൽകി',
    statLabelSkipped: 'ഒഴിവാക്കി',
    statLabelComplete:'പൂർത്തിയായി',
    editAnswerBtn:    '✏️ തിരുത്ത്',
    editAnswersLink:  '← ഉത്തരങ്ങൾ തിരുത്ത്',
    printBtn:         '🖨️ പ്രിന്റ് / PDF ആക്കൂ',
    newFormBtn:       '➕ മറ്റൊരു ഫോം പൂരിപ്പിക്കൂ',
    emptyAnswer:      '—',
    navLangLabel:     'ഭാഷ:',
    navBack:          '← തിരികെ',
    notAnswered:      '— ഉത്തരം നൽകിയില്ല',
    yes:              'അതെ',
    no:               'ഇല്ല',
    formCompletedToast:'ഫോം പൂർത്തിയായി! 🎉',
    voiceHelpBtn:     '🔊 എങ്ങനെ പൂരിപ്പിക്കാം',
    autoReadOn:       '🔊 വായന: ഓൺ',
    autoReadOff:      '🔈 വായന: ഓഫ്',
    voiceAssistantBadge:'🎙️ AI ശബ്ദ സഹായി',
    voiceHelpText:    'വോയ്സ് ഫോമിലേക്ക് സ്വാഗതം! നിങ്ങളുടെ ശബ്ദം ഉപയോഗിച്ച് ഈ ഫോം എളുപ്പത്തിൽ പൂരിപ്പിക്കാം. ചോദ്യം കേൾക്കാൻ "കേൾക്കൂ" ബട്ടൺ അമർത്തുക. ഉത്തരം പറയാൻ "ഉത്തരം പറയൂ" ബട്ടൺ അമർത്തുക, അല്ലെങ്കിൽ താഴെ ടൈപ്പ് ചെയ്യുക. അടുത്ത ചോദ്യത്തിലേക്ക് പോകാൻ "അടുത്തത്" അമർത്തുക.',
    speakQuestionPrefix:'ചോദ്യം',
  },

  hi: {
    heroBadge:        '✨ AI-संचालित आवाज़ सहायक',
    heroTitle:        'कोई भी फ़ॉर्म<br /><span class="highlight">आवाज़</span> से भरें',
    heroSubtitle:     'किसी भी कागज़ी फ़ॉर्म की फ़ोटो अपलोड करें — बैंक, स्कूल या सरकारी — और सिर्फ़ अपनी आवाज़ से अपनी भाषा में भरें। टाइप करने की ज़रूरत नहीं।',
    langSectionLabel: 'चरण 1',
    langSectionTitle: 'अपनी भाषा चुनें',
    langSectionSub:   'वह भाषा चुनें जिसमें आप सबसे आसानी से बोलते हैं।',
    ctaBtn:           '🚀 शुरू करें — फ़ॉर्म अपलोड करें',
    ctaNote:          'फ़ॉर्म भरते समय आप कभी भी भाषा बदल सकते हैं।',
    feat1: 'अपनी भाषा में आवाज़',
    feat2: 'कोई भी फ़ॉर्म अपलोड करें',
    feat3: 'AI सभी फ़ील्ड पहचानता है',
    feat4: 'सेव करें और बाद में जारी रखें',
    feat5: 'पूरा होने पर प्रिंट करें',
    toastLang:        'भाषा बदली:',

    dashStepLabel:    'चरण 2',
    dashTitle:        'अपना फ़ॉर्म अपलोड करें',
    dashSub:          'किसी भी कागज़ी फ़ॉर्म की साफ़ फ़ोटो लें और अपलोड करें। हमारा AI सभी फ़ील्ड अपने आप पहचान लेगा।',
    uploadTitle:      'यहाँ फ़ॉर्म छोड़ें',
    uploadSub:        'अपने फ़ॉर्म की फ़ोटो खींचकर छोड़ें',
    uploadOr:         'या',
    browseBtn:        '📁 फ़ाइल चुनें',
    uploadHint:       'JPG, PNG, WebP समर्थित · अधिकतम 10 MB',
    detectBtn:        '🤖 फ़ॉर्म फ़ील्ड पहचानें',
    detectNote:       'AI आपके फ़ॉर्म में हर फ़ील्ड पहचानेगा। इसमें 10–20 सेकंड लगते हैं।',
    tipsTitle:        '📸 बेहतर परिणाम के लिए सुझाव',
    tip1:             'अच्छी रोशनी में फ़ोटो लें — छाया से बचें।',
    tip2:             'कैमरा फ़ॉर्म के ऊपर सीधा रखें, तिरछा नहीं।',
    tip3:             'सुनिश्चित करें कि फ़ॉर्म का सारा टेक्स्ट साफ़ दिखे।',
    tip4:             'अगर फ़ॉर्म में कई पेज हैं, तो एक बार में एक पेज अपलोड करें।',
    tip5:             'पहचान के बाद, आप किसी भी फ़ील्ड का नाम सुधार सकते हैं।',
    currentLangLabel: '🌐 वर्तमान भाषा',
    currentLangNote:  'आवाज़ मार्गदर्शन इसमें होगा:',
    changeLang:       '← भाषा बदलें',
    imgSelected:      'छवि चुनी गई!',
    removeBtn:        '✕ हटाएँ',

    prevBtn:          '← पिछला',
    skipBtn:          'छोड़ें',
    nextBtn:          'अगला →',
    finishBtn:        '✅ पूरा करें',
    allFields:        'सभी फ़ील्ड',
    listenBtn:        '🔊 सुनें',
    recordBtn:        '🎙️ उत्तर रिकॉर्ड करें',
    stopRecBtn:       '⏹ रोकें',
    speakingStatus:   '🔊 बोल रहा है…',
    listeningStatus:  '🎙️ सुन रहा है…',
    processingStatus: '⏳ प्रोसेस हो रहा है…',
    processSpeech:    '⏳ आवाज़ प्रोसेस हो रही है…',
    noHear:           'स्पष्ट नहीं सुन सका। फिर कोशिश करें।',
    hintText:         '🔊 सवाल सुनने के लिए क्लिक करें, फिर 🎙️ से जवाब दें, या नीचे टाइप करें।',
    hintNumber:       'संख्या बोलें या टाइप करें।',
    hintDate:         'तारीख बोलें या टाइप करें (जैसे, 10 मई 1990)।',
    hintSelect:       'नीचे एक विकल्प चुनें या ज़ोर से बोलें।',
    hintCheckbox:     '"हाँ" या "नहीं" बोलें, या टिक करें।',
    hintTextarea:     'अपना पूरा जवाब बोलें या टाइप करें।',
    hintDefault:      'जवाब बोलें या टाइप करें।',
    selectPlaceholder:'— एक विकल्प चुनें —',
    fieldOf:          'फ़ील्ड',
    questionOf:       'प्रश्न',

    progressStepLabel:'चरण 4 — समीक्षा',
    progressTitle:    'अपने उत्तर जाँचें',
    progressSub:      'नीचे अपने सभी उत्तर जाँचें। आप वापस जाकर कोई भी फ़ील्ड बदल सकते हैं।',
    completeSub:      'सभी फ़ील्ड सफलतापूर्वक भर दिए गए हैं।',
    answersTitle:     '📝 आपके उत्तर',
    thField:          'फ़ील्ड',
    thAnswer:         'आपका उत्तर',
    thEdit:           'संपादित करें',
    statLabelTotal:   'कुल फ़ील्ड',
    statLabelAnswered:'उत्तर दिए',
    statLabelSkipped: 'छोड़े',
    statLabelComplete:'पूर्ण',
    editAnswerBtn:    '✏️ बदलें',
    editAnswersLink:  '← उत्तर बदलें',
    printBtn:         '🖨️ प्रिंट / PDF सेव करें',
    newFormBtn:       '➕ दूसरा फ़ॉर्म भरें',
    emptyAnswer:      '—',
    navLangLabel:     'भाषा:',
    navBack:          '← वापस',
    notAnswered:      '— उत्तर नहीं दिया',
    yes:              'हाँ',
    no:               'नहीं',
    formCompletedToast:'फ़ॉर्म पूरा हुआ! 🎉',
    voiceHelpBtn:     '🔊 कैसे भरें',
    autoReadOn:       '🔊 वाचन: चालू',
    autoReadOff:      '🔈 वाचन: बंद',
    voiceAssistantBadge:'🎙️ AI आवाज़ मार्गदर्शक',
    voiceHelpText:    'वॉयसफ़ॉर्म में आपका स्वागत है! आप अपनी आवाज़ से यह फ़ॉर्म आसानी से भर सकते हैं। सवाल सुनने के लिए "सुनें" दबाएँ। जवाब बोलने के लिए "उत्तर रिकॉर्ड करें" दबाएँ या नीचे टाइप करें। अगले फ़ील्ड पर जाने के लिए "अगला" दबाएँ।',
    speakQuestionPrefix:'प्रश्न',
  },

  ta: {
    heroBadge:        '✨ AI-ஆற்றல் மிக்க குரல் உதவி',
    heroTitle:        'எந்த படிவமும்<br /><span class="highlight">குரலால்</span> நிரப்பலாம்',
    heroSubtitle:     'எந்தவொரு காகித படிவத்தின் புகைப்படத்தையும் பதிவேற்றுங்கள் — வங்கி, பள்ளி அல்லது அரசு — உங்கள் மொழியில் குரலை மட்டும் பயன்படுத்தி நிரப்புங்கள்.',
    langSectionLabel: 'படி 1',
    langSectionTitle: 'உங்கள் மொழியை தேர்ந்தெடுங்கள்',
    langSectionSub:   'நீங்கள் மிகவும் வசதியாக பேசும் மொழியை தேர்ந்தெடுங்கள்.',
    ctaBtn:           '🚀 தொடங்குங்கள் — படிவம் பதிவேற்றவும்',
    ctaNote:          'படிவம் நிரப்பும் போது எந்த நேரத்திலும் மொழியை மாற்றலாம்.',
    feat1: 'உங்கள் மொழியில் குரல்',
    feat2: 'எந்த படிவமும் பதிவேற்றவும்',
    feat3: 'AI அனைத்து புலங்களையும் கண்டறியும்',
    feat4: 'சேமித்து பின்னர் தொடரவும்',
    feat5: 'முடிந்ததும் அச்சிடவும்',
    toastLang:        'மொழி மாற்றப்பட்டது:',

    dashStepLabel:    'படி 2',
    dashTitle:        'உங்கள் படிவத்தை பதிவேற்றவும்',
    dashSub:          'எந்தவொரு காகித படிவத்தின் தெளிவான புகைப்படம் எடுத்து பதிவேற்றவும். எங்கள் AI அனைத்து புலங்களையும் தானாக கண்டறியும்.',
    uploadTitle:      'இங்கே படிவத்தை கொண்டு வாருங்கள்',
    uploadSub:        'படிவத்தின் புகைப்படத்தை இழுத்து விடவும்',
    uploadOr:         'அல்லது',
    browseBtn:        '📁 கோப்பு தேர்வு',
    uploadHint:       'JPG, PNG, WebP ஆதரவு · அதிகபட்சம் 10 MB',
    detectBtn:        '🤖 படிவ புலங்களை கண்டறியவும்',
    detectNote:       'AI உங்கள் படிவத்தில் உள்ள ஒவ்வொரு புலத்தையும் அடையாளம் காணும். இதற்கு 10–20 வினாடிகள் ஆகும்.',
    tipsTitle:        '📸 சிறந்த முடிவுகளுக்கான குறிப்புகள்',
    tip1:             'நல்ல வெளிச்சத்தில் புகைப்படம் எடுங்கள் — நிழலை தவிர்க்கவும்.',
    tip2:             'கேமராவை படிவத்திற்கு நேராக மேலே வையுங்கள், சாய்வாக அல்ல.',
    tip3:             'படிவத்தில் உள்ள அனைத்து உரையும் தெளிவாக தெரிவதை உறுதி செய்யுங்கள்.',
    tip4:             'படிவத்தில் பல பக்கங்கள் இருந்தால், ஒரு நேரத்தில் ஒரு பக்கம் பதிவேற்றவும்.',
    tip5:             'கண்டறிந்த பிறகு, எந்த புல பெயரையும் திருத்தலாம்.',
    currentLangLabel: '🌐 தற்போதைய மொழி',
    currentLangNote:  'குரல் வழிகாட்டல் இதில் இருக்கும்:',
    changeLang:       '← மொழியை மாற்றவும்',
    imgSelected:      'படம் தேர்ந்தெடுக்கப்பட்டது!',
    removeBtn:        '✕ நீக்கவும்',

    prevBtn:          '← முந்தையது',
    skipBtn:          'தவிர்க்கவும்',
    nextBtn:          'அடுத்தது →',
    finishBtn:        '✅ முடிக்கவும்',
    allFields:        'அனைத்து புலங்கள்',
    listenBtn:        '🔊 கேளுங்கள்',
    recordBtn:        '🎙️ பதில் பதிவு செய்யவும்',
    stopRecBtn:       '⏹ நிறுத்தவும்',
    speakingStatus:   '🔊 பேசுகிறது…',
    listeningStatus:  '🎙️ கேட்கிறது…',
    processingStatus: '⏳ செயலாக்குகிறது…',
    processSpeech:    '⏳ குரலை செயலாக்குகிறது…',
    noHear:           'தெளிவாக கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்.',
    hintText:         '🔊 கேள்வி கேட்க கிளிக் செய்யவும், பின்னர் 🎙️ பதில் சொல்லவும், அல்லது கீழே தட்டச்சு செய்யவும்.',
    hintNumber:       'எண்ணை சொல்லவும் அல்லது தட்டச்சு செய்யவும்.',
    hintDate:         'தேதியை சொல்லவும் அல்லது தட்டச்சு செய்யவும் (எ.கா., 10 மே 1990).',
    hintSelect:       'கீழே ஒரு விருப்பத்தை தேர்வு செய்யவும் அல்லது சத்தமாக சொல்லவும்.',
    hintCheckbox:     '"ஆம்" அல்லது "இல்லை" சொல்லவும், அல்லது டிக் செய்யவும்.',
    hintTextarea:     'உங்கள் முழு பதிலை சொல்லவும் அல்லது தட்டச்சு செய்யவும்.',
    hintDefault:      'பதிலை சொல்லவும் அல்லது தட்டச்சு செய்யவும்.',
    selectPlaceholder:'— ஒரு விருப்பத்தை தேர்வு செய்யவும் —',
    fieldOf:          'புலம்',
    questionOf:       'கேள்வி',

    progressStepLabel:'படி 4 — மதிப்பாய்வு',
    progressTitle:    'உங்கள் பதில்களை மதிப்பாய்வு செய்யவும்',
    progressSub:      'கீழே உங்கள் அனைத்து பதில்களையும் சரிபாருங்கள். எந்த புலத்தையும் திரும்பி திருத்தலாம்.',
    completeSub:      'அனைத்து புலங்களும் வெற்றிகரமாக நிரப்பப்பட்டன.',
    answersTitle:     '📝 உங்கள் பதில்கள்',
    thField:          'புலம்',
    thAnswer:         'உங்கள் பதில்',
    thEdit:           'திருத்தவும்',
    statLabelTotal:   'மொத்த புலங்கள்',
    statLabelAnswered:'பதில் அளித்தவை',
    statLabelSkipped: 'தவிர்க்கப்பட்டவை',
    statLabelComplete:'முடிந்தது',
    editAnswerBtn:    '✏️ திருத்தவும்',
    editAnswersLink:  '← பதில்களை திருத்தவும்',
    printBtn:         '🖨️ அச்சிடவும் / PDF சேமிக்கவும்',
    newFormBtn:       '➕ மற்றொரு படிவம் நிரப்பவும்',
    emptyAnswer:      '—',
    navLangLabel:     'மொழி:',
    navBack:          '← பின்செல்',
    notAnswered:      '— பதில் அளிக்கப்படவில்லை',
    yes:              'ஆம்',
    no:               'இல்லை',
    formCompletedToast:'படிவம் முடிந்தது! 🎉',
    voiceHelpBtn:     '🔊 எப்படி நிரப்புவது',
    autoReadOn:       '🔊 வாசிப்பு: ஆன்',
    autoReadOff:      '🔈 வாசிப்பு: ஆஃப்',
    voiceAssistantBadge:'🎙️ AI குரல் வழிகாட்டி',
    voiceHelpText:    'வாய்ஸ்ஃபார்முக்கு வரவேற்கிறோம்! உங்கள் குரலைப் பயன்படுத்தி இந்த படிவத்தை எளிதாக நிரப்பலாம். கேள்வியைக் கேட்க "கேளுங்கள்" அழுத்தவும். பதில் சொல்ல "பதில் பதிவு செய்யவும்" அழுத்தவும், அல்லது கீழே தட்டச்சு செய்யவும்.',
    speakQuestionPrefix:'கேள்வி',
  },

  te: {
    heroBadge:        '✨ AI-శక్తి కలిగిన వాయిస్ సహాయకుడు',
    heroTitle:        'ఏ ఫారమ్ అయినా<br /><span class="highlight">మీ గొంతుతో</span> నింపండి',
    heroSubtitle:     'ఏ పేపర్ ఫారమ్ యొక్క ఫోటోనైనా అప్‌లోడ్ చేయండి — బ్యాంక్, స్కూల్ లేదా ప్రభుత్వ — మీ భాషలో కేవలం మీ గొంతుతో నింపండి. టైప్ చేయవలసిన అవసరం లేదు.',
    langSectionLabel: 'దశ 1',
    langSectionTitle: 'మీ భాషను ఎంచుకోండి',
    langSectionSub:   'మీకు అత్యంత సౌకర్యంగా మాట్లాడగలిగే భాషను ఎంచుకోండి.',
    ctaBtn:           '🚀 ప్రారంభించండి — ఫారమ్ అప్‌లోడ్ చేయండి',
    ctaNote:          'ఫారమ్ నింపేటప్పుడు మీరు ఎప్పుడైనా భాషను మార్చవచ్చు.',
    feat1: 'మీ భాషలో వాయిస్',
    feat2: 'ఏ ఫారమ్ అయినా అప్‌లోడ్ చేయండి',
    feat3: 'AI అన్ని ఫీల్డ్‌లను గుర్తిస్తుంది',
    feat4: 'సేవ్ చేసి తర్వాత కొనసాగించండి',
    feat5: 'పూర్తయిన తర్వాత ప్రింట్ చేయండి',
    toastLang:        'భాష మార్చబడింది:',

    dashStepLabel:    'దశ 2',
    dashTitle:        'మీ ఫారమ్‌ని అప్‌లోడ్ చేయండి',
    dashSub:          'ఏ పేపర్ ఫారమ్ యొక్క స్పష్టమైన ఫోటో తీసి అప్‌లోడ్ చేయండి. మా AI అన్ని ఫీల్డ్‌లను స్వయంచాలకంగా గుర్తిస్తుంది.',
    uploadTitle:      'ఇక్కడ ఫారమ్‌ని వదలండి',
    uploadSub:        'ఫారమ్ ఫోటోని లాగి వదలండి',
    uploadOr:         'లేదా',
    browseBtn:        '📁 ఫైల్ తెరవండి',
    uploadHint:       'JPG, PNG, WebP మద్దతు · గరిష్టం 10 MB',
    detectBtn:        '🤖 ఫారమ్ ఫీల్డ్‌లు గుర్తించండి',
    detectNote:       'AI మీ ఫారమ్‌లోని ప్రతి ఫీల్డ్‌ను గుర్తిస్తుంది. ఇది 10–20 సెకన్లు పడుతుంది.',
    tipsTitle:        '📸 మెరుగైన ఫలితాలకు చిట్కాలు',
    tip1:             'మంచి వెలుతురులో ఫోటో తీయండి — నీడలు నివారించండి.',
    tip2:             'కెమెరాను ఫారమ్‌కు నేరుగా పైన పట్టుకోండి, వంగి కాదు.',
    tip3:             'ఫారమ్‌లోని అన్ని టెక్స్ట్ స్పష్టంగా కనిపించేలా చూసుకోండి.',
    tip4:             'ఫారమ్‌లో అనేక పేజీలు ఉంటే, ఒకేసారి ఒక పేజీ అప్‌లోడ్ చేయండి.',
    tip5:             'గుర్తించిన తర్వాత, మీరు ఏ ఫీల్డ్ పేరునైనా సరిదిద్దవచ్చు.',
    currentLangLabel: '🌐 ప్రస్తుత భాష',
    currentLangNote:  'వాయిస్ మార్గదర్శకత్వం ఇందులో ఉంటుంది:',
    changeLang:       '← భాష మార్చండి',
    imgSelected:      'చిత్రం ఎంచుకోబడింది!',
    removeBtn:        '✕ తొలగించండి',

    prevBtn:          '← వెనక్కి',
    skipBtn:          'దాటండి',
    nextBtn:          'తదుపరి →',
    finishBtn:        '✅ పూర్తి చేయండి',
    allFields:        'అన్ని ఫీల్డ్‌లు',
    listenBtn:        '🔊 వినండి',
    recordBtn:        '🎙️ సమాధానం రికార్డ్ చేయండి',
    stopRecBtn:       '⏹ ఆపండి',
    speakingStatus:   '🔊 మాట్లాడుతోంది…',
    listeningStatus:  '🎙️ వింటోంది…',
    processingStatus: '⏳ ప్రాసెస్ అవుతోంది…',
    processSpeech:    '⏳ వాయిస్ ప్రాసెస్ అవుతోంది…',
    noHear:           'స్పష్టంగా వినలేదు. మళ్ళీ ప్రయత్నించండి.',
    hintText:         '🔊 ప్రశ్న వినడానికి క్లిక్ చేయండి, తర్వాత 🎙️ సమాధానం చెప్పండి, లేదా కింద టైప్ చేయండి.',
    hintNumber:       'సంఖ్య చెప్పండి లేదా టైప్ చేయండి.',
    hintDate:         'తేదీ చెప్పండి లేదా టైప్ చేయండి (ఉదా, 10 మే 1990).',
    hintSelect:       'కింద ఒక ఎంపిక ఎంచుకోండి లేదా బిగ్గరగా చెప్పండి.',
    hintCheckbox:     '"అవును" లేదా "కాదు" చెప్పండి, లేదా టిక్ చేయండి.',
    hintTextarea:     'మీ పూర్తి సమాధానం చెప్పండి లేదా టైప్ చేయండి.',
    hintDefault:      'సమాధానం చెప్పండి లేదా టైప్ చేయండి.',
    selectPlaceholder:'— ఒక ఎంపిక ఎంచుకోండి —',
    fieldOf:          'ఫీల్డ్',
    questionOf:       'ప్రశ్న',

    progressStepLabel:'దశ 4 — సమీక్ష',
    progressTitle:    'మీ సమాధానాలు సమీక్షించండి',
    progressSub:      'క్రింద మీ అన్ని సమాధానాలు తనిఖీ చేయండి. మీరు వెనక్కి వెళ్ళి ఏ ఫీల్డ్ అయినా సవరించవచ్చు.',
    completeSub:      'అన్ని ఫీల్డ్‌లు విజయవంతంగా పూర్తయ్యాయి.',
    answersTitle:     '📝 మీ సమాధానాలు',
    thField:          'ఫీల్డ్',
    thAnswer:         'మీ సమాధానం',
    thEdit:           'సవరించండి',
    statLabelTotal:   'మొత్తం ఫీల్డ్‌లు',
    statLabelAnswered:'సమాధానాలు',
    statLabelSkipped: 'దాటినవి',
    statLabelComplete:'పూర్తి',
    editAnswerBtn:    '✏️ సవరించండి',
    editAnswersLink:  '← సమాధానాలు సవరించండి',
    printBtn:         '🖨️ ప్రింట్ / PDF సేవ్ చేయండి',
    newFormBtn:       '➕ మరొక ఫారమ్ నింపండి',
    emptyAnswer:      '—',
    navLangLabel:     'భాష:',
    navBack:          '← వెనుకకు',
    notAnswered:      '— సమాధానం ఇవ్వలేదు',
    yes:              'అవును',
    no:               'కాదు',
    formCompletedToast:'ఫారమ్ పూర్తయింది! 🎉',
    voiceHelpBtn:     '🔊 ఎలా నింపాలి',
    autoReadOn:       '🔊 చదవడం: ఆన్',
    autoReadOff:      '🔈 చదవడం: ఆఫ్',
    voiceAssistantBadge:'🎙️ AI వాయిస్ గైడ్',
    voiceHelpText:    'వాయిస్‌ఫారమ్‌కు స్వాగతం! మీ వాయిస్‌ని ఉపయోగించి ఈ ఫారమ్‌ను సులభంగా నింపవచ్చు. ప్రశ్న వినడానికి "వినండి" నొక్కండి. సమాధానం చెప్పడానికి "రికార్డ్ చేయండి" నొక్కండి లేదా క్రింద టైప్ చేయండి.',
    speakQuestionPrefix:'ప్రశ్న',
  },
};

/**
 * Returns the translation strings for the current language.
 * Falls back to English if the language is not found.
 */
function t(key) {
  const lang = getLang();
  const strings = PAGE_STRINGS[lang] || PAGE_STRINGS.en;
  return strings[key] !== undefined ? strings[key] : (PAGE_STRINGS.en[key] || '');
}

/**
 * Apply translations to dashboard.html (Step 2).
 */
function applyDashboardTranslations() {
  const lang = getLang();
  const s = PAGE_STRINGS[lang] || PAGE_STRINGS.en;

  _setText('.page-header .section-label', s.dashStepLabel);
  _setText('.page-header .section-title', s.dashTitle);
  _setText('.page-header .section-sub', s.dashSub);
  _setText('.upload-title', s.uploadTitle);
  _setText('.upload-sub', s.uploadSub);
  _setText('.upload-or', s.uploadOr);
  _setText('.upload-hint', s.uploadHint);
  _setText('#detect-btn', s.detectBtn);
  _setText('.detect-note', s.detectNote);
  _setText('.tips-title', s.tipsTitle);

  const tipSpans = document.querySelectorAll('.tip-item span:last-child');
  const tips = [s.tip1, s.tip2, s.tip3, s.tip4, s.tip5];
  tipSpans.forEach((el, i) => { if (tips[i]) el.textContent = tips[i]; });

  _setText('#remove-img-btn', s.removeBtn);

  // Language reminder card
  _setText('#lang-reminder-title', s.currentLangLabel);
  _setText('#lang-reminder-prefix', s.currentLangNote);
  _setText('#change-lang-link', s.changeLang);

  const curLangTitle = document.querySelector('.card p[style*="font-weight:700"]');
  if (curLangTitle && !document.getElementById('lang-reminder-title')) {
    curLangTitle.textContent = s.currentLangLabel;
  }
  const changeLangLink = document.querySelector('.card a[href="index.html"]');
  if (changeLangLink && !document.getElementById('change-lang-link')) {
    changeLangLink.textContent = s.changeLang;
  }

  // Browse label
  const browseBtn = document.querySelector('.browse-btn');
  if (browseBtn) {
    browseBtn.textContent = s.browseBtn;
  }
}

/**
 * Apply translations to form.html (Step 3) — static elements only.
 * Dynamic question content is handled inside form.js using t().
 */
function applyFormTranslations() {
  const lang = getLang();
  const s = PAGE_STRINGS[lang] || PAGE_STRINGS.en;

  _setText('#prev-btn', s.prevBtn);
  _setText('#skip-btn', s.skipBtn);
  _setText('#next-btn', s.nextBtn);  // form.js overrides this with Finish when needed
  _setText('.field-sidebar-title', s.allFields);
  _setText('#nav-back-btn', s.navBack);
  _setText('#voice-assistant-title', s.voiceAssistantBadge);
  _setText('#voice-help-btn', s.voiceHelpBtn);
}

/**
 * Apply translations to progress.html (Step 4).
 */
function applyProgressTranslations() {
  const lang = getLang();
  const s = PAGE_STRINGS[lang] || PAGE_STRINGS.en;

  _setText('.page-header .section-label', s.progressStepLabel);
  _setText('.page-header .section-title', s.progressTitle);
  _setText('.page-header .section-sub', s.progressSub);
  _setText('#complete-sub', s.completeSub);
  _setText('.answers-title', s.answersTitle);

  // Table headers
  const ths = document.querySelectorAll('.answers-table th');
  if (ths[1]) ths[1].textContent = s.thField;
  if (ths[2]) ths[2].textContent = s.thAnswer;
  if (ths[3]) ths[3].textContent = s.thEdit;

  // Stat labels
  const statLabels = document.querySelectorAll('.stat-label');
  const labels = [s.statLabelTotal, s.statLabelAnswered, s.statLabelSkipped, s.statLabelComplete];
  statLabels.forEach((el, i) => { if (labels[i]) el.textContent = labels[i]; });

  _setText('#back-to-form-link', s.editAnswersLink);
  const printBtn = document.querySelector('.action-row .btn-secondary');
  if (printBtn) printBtn.textContent = s.printBtn;
  _setText('#start-new-btn', s.newFormBtn);
}

/** Safe helper — sets textContent if element exists */
function _setText(selector, value) {
  const el = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (el && value !== undefined) el.textContent = value;
}
