// app/(main)/tools-compo/tools/dynamic-time-greeting/greetingData.js

export const POPULAR_TIMEZONES = [
  { label: "UTC / GMT (Coordinated Universal Time)", timezone: "UTC", city: "London (UTC)", country: "Universal", offset: "+00:00" },
  { label: "London, United Kingdom (GMT/BST)", timezone: "Europe/London", city: "London", country: "United Kingdom", offset: "+01:00" },
  { label: "New York, USA (Eastern Time)", timezone: "America/New_York", city: "New York", country: "United States", offset: "-04:00" },
  { label: "Los Angeles, USA (Pacific Time)", timezone: "America/Los_Angeles", city: "Los Angeles", country: "United States", offset: "-07:00" },
  { label: "Chicago, USA (Central Time)", timezone: "America/Chicago", city: "Chicago", country: "United States", offset: "-05:00" },
  { label: "Denver, USA (Mountain Time)", timezone: "America/Denver", city: "Denver", country: "United States", offset: "-06:00" },
  { label: "Toronto, Canada (Eastern Time)", timezone: "America/Toronto", city: "Toronto", country: "Canada", offset: "-04:00" },
  { label: "Vancouver, Canada (Pacific Time)", timezone: "America/Vancouver", city: "Vancouver", country: "Canada", offset: "-07:00" },
  { label: "Dhaka, Bangladesh (BST)", timezone: "Asia/Dhaka", city: "Dhaka", country: "Bangladesh", offset: "+06:00" },
  { label: "Kolkata / New Delhi, India (IST)", timezone: "Asia/Kolkata", city: "New Delhi", country: "India", offset: "+05:30" },
  { label: "Dubai, UAE (Gulf Standard Time)", timezone: "Asia/Dubai", city: "Dubai", country: "United Arab Emirates", offset: "+04:00" },
  { label: "Riyadh, Saudi Arabia (AST)", timezone: "Asia/Riyadh", city: "Riyadh", country: "Saudi Arabia", offset: "+03:00" },
  { label: "Tokyo, Japan (JST)", timezone: "Asia/Tokyo", city: "Tokyo", country: "Japan", offset: "+09:00" },
  { label: "Singapore (SGT)", timezone: "Asia/Singapore", city: "Singapore", country: "Singapore", offset: "+08:00" },
  { label: "Hong Kong (HKT)", timezone: "Asia/Hong_Kong", city: "Hong Kong", country: "Hong Kong", offset: "+08:00" },
  { label: "Shanghai / Beijing, China (CST)", timezone: "Asia/Shanghai", city: "Shanghai", country: "China", offset: "+08:00" },
  { label: "Seoul, South Korea (KST)", timezone: "Asia/Seoul", city: "Seoul", country: "South Korea", offset: "+09:00" },
  { label: "Sydney, Australia (AEST/AEDT)", timezone: "Australia/Sydney", city: "Sydney", country: "Australia", offset: "+11:00" },
  { label: "Melbourne, Australia (AEST/AEDT)", timezone: "Australia/Melbourne", city: "Melbourne", country: "Australia", offset: "+11:00" },
  { label: "Perth, Australia (AWST)", timezone: "Australia/Perth", city: "Perth", country: "Australia", offset: "+08:00" },
  { label: "Auckland, New Zealand (NZST/NZDT)", timezone: "Pacific/Auckland", city: "Auckland", country: "New Zealand", offset: "+13:00" },
  { label: "Paris, France (CET/CEST)", timezone: "Europe/Paris", city: "Paris", country: "France", offset: "+02:00" },
  { label: "Berlin, Germany (CET/CEST)", timezone: "Europe/Berlin", city: "Berlin", country: "Germany", offset: "+02:00" },
  { label: "Amsterdam, Netherlands (CET/CEST)", timezone: "Europe/Amsterdam", city: "Amsterdam", country: "Netherlands", offset: "+02:00" },
  { label: "Madrid, Spain (CET/CEST)", timezone: "Europe/Madrid", city: "Madrid", country: "Spain", offset: "+02:00" },
  { label: "Rome, Italy (CET/CEST)", timezone: "Europe/Rome", city: "Rome", country: "Italy", offset: "+02:00" },
  { label: "Zurich, Switzerland (CET/CEST)", timezone: "Europe/Zurich", city: "Zurich", country: "Switzerland", offset: "+02:00" },
  { label: "Stockholm, Sweden (CET/CEST)", timezone: "Europe/Stockholm", city: "Stockholm", country: "Sweden", offset: "+02:00" },
  { label: "Istanbul, Turkey (TRT)", timezone: "Europe/Istanbul", city: "Istanbul", country: "Turkey", offset: "+03:00" },
  { label: "Moscow, Russia (MSK)", timezone: "Europe/Moscow", city: "Moscow", country: "Russia", offset: "+03:00" },
  { label: "Cairo, Egypt (EEST)", timezone: "Africa/Cairo", city: "Cairo", country: "Egypt", offset: "+03:00" },
  { label: "Johannesburg, South Africa (SAST)", timezone: "Africa/Johannesburg", city: "Johannesburg", country: "South Africa", offset: "+02:00" },
  { label: "Lagos, Nigeria (WAT)", timezone: "Africa/Lagos", city: "Lagos", country: "Nigeria", offset: "+01:00" },
  { label: "Nairobi, Kenya (EAT)", timezone: "Africa/Nairobi", city: "Nairobi", country: "Kenya", offset: "+03:00" },
  { label: "São Paulo, Brazil (BRT)", timezone: "America/Sao_Paulo", city: "São Paulo", country: "Brazil", offset: "-03:00" },
  { label: "Buenos Aires, Argentina (ART)", timezone: "America/Argentina/Buenos_Aires", city: "Buenos Aires", country: "Argentina", offset: "-03:00" },
  { label: "Mexico City, Mexico (CST)", timezone: "America/Mexico_City", city: "Mexico City", country: "Mexico", offset: "-06:00" },
  { label: "Bogota, Colombia (COT)", timezone: "America/Bogota", city: "Bogota", country: "Colombia", offset: "-05:00" },
  { label: "Santiago, Chile (CLT/CLST)", timezone: "America/Santiago", city: "Santiago", country: "Chile", offset: "-03:00" },
  { label: "Honolulu, Hawaii, USA (HST)", timezone: "Pacific/Honolulu", city: "Honolulu", country: "United States", offset: "-10:00" },
  { label: "Bangkok, Thailand (ICT)", timezone: "Asia/Bangkok", city: "Bangkok", country: "Thailand", offset: "+07:00" },
  { label: "Jakarta, Indonesia (WIB)", timezone: "Asia/Jakarta", city: "Jakarta", country: "Indonesia", offset: "+07:00" },
  { label: "Manila, Philippines (PST)", timezone: "Asia/Manila", city: "Manila", country: "Philippines", offset: "+08:00" },
  { label: "Kuala Lumpur, Malaysia (MYT)", timezone: "Asia/Kuala_Lumpur", city: "Kuala Lumpur", country: "Malaysia", offset: "+08:00" },
  { label: "Karachi, Pakistan (PKT)", timezone: "Asia/Karachi", city: "Karachi", country: "Pakistan", offset: "+05:00" },
  { label: "Taipei, Taiwan (CST)", timezone: "Asia/Taipei", city: "Taipei", country: "Taiwan", offset: "+08:00" },
  { label: "Tel Aviv, Israel (IDT)", timezone: "Asia/Jerusalem", city: "Tel Aviv", country: "Israel", offset: "+03:00" },
  { label: "Athens, Greece (EEST)", timezone: "Europe/Athens", city: "Athens", country: "Greece", offset: "+03:00" },
  { label: "Warsaw, Poland (CEST)", timezone: "Europe/Warsaw", city: "Warsaw", country: "Poland", offset: "+02:00" },
  { label: "Lisbon, Portugal (WEST)", timezone: "Europe/Lisbon", city: "Lisbon", country: "Portugal", offset: "+01:00" },
  { label: "Dublin, Ireland (IST)", timezone: "Europe/Dublin", city: "Dublin", country: "Ireland", offset: "+01:00" },
  { label: "Reykjavik, Iceland (GMT)", timezone: "Atlantic/Reykjavik", city: "Reykjavik", country: "Iceland", offset: "+00:00" }
];

export const DEFAULT_SLOTS = [
  {
    id: "early-morning",
    name: "Early Morning",
    icon: "Sunrise",
    startHour: 4,
    startMinute: 0,
    endHour: 6,
    endMinute: 59,
    greeting: "Rise and shine, {name}!",
    subtitle: "A fresh early start to seize new opportunities today.",
    enabled: true,
    accent: "from-amber-400 to-orange-500",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
  },
  {
    id: "morning",
    name: "Morning",
    icon: "Sun",
    startHour: 7,
    startMinute: 0,
    endHour: 11,
    endMinute: 59,
    greeting: "Good morning, {name}!",
    subtitle: "Wishing you a productive and successful day ahead.",
    enabled: true,
    accent: "from-amber-500 to-yellow-500",
    badgeBg: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
  },
  {
    id: "afternoon",
    name: "Afternoon",
    icon: "SunMedium",
    startHour: 12,
    startMinute: 0,
    endHour: 16,
    endMinute: 59,
    greeting: "Good afternoon, {name}!",
    subtitle: "Keep up the momentum. Hope your day is going wonderfully.",
    enabled: true,
    accent: "from-orange-500 to-rose-500",
    badgeBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
  },
  {
    id: "evening",
    name: "Evening",
    icon: "Sunset",
    startHour: 17,
    startMinute: 0,
    endHour: 20,
    endMinute: 59,
    greeting: "Good evening, {name}!",
    subtitle: "Time to wrap up key tasks and transition into relaxation.",
    enabled: true,
    accent: "from-indigo-500 to-purple-600",
    badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
  },
  {
    id: "night",
    name: "Night",
    icon: "Moon",
    startHour: 21,
    startMinute: 0,
    endHour: 23,
    endMinute: 59,
    greeting: "Good night, {name}!",
    subtitle: "Unwind, rest well, and recharge your energy for tomorrow.",
    enabled: true,
    accent: "from-purple-600 to-indigo-900",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
  },
  {
    id: "late-night",
    name: "Late Night",
    icon: "Sparkles",
    startHour: 0,
    startMinute: 0,
    endHour: 3,
    endMinute: 59,
    greeting: "Burning the midnight oil, {name}?",
    subtitle: "Late-night creativity strikes, but remember to get some rest.",
    enabled: true,
    accent: "from-violet-900 to-slate-900",
    badgeBg: "bg-violet-500/10 text-violet-400 border-violet-500/20"
  }
];

export const TONE_PRESETS = [
  {
    id: "corporate",
    name: "Professional & Corporate",
    description: "Polished, respectful, and ideal for enterprise SaaS, client portals, and B2B emails.",
    slots: {
      "early-morning": { greeting: "Good early morning, {name}.", subtitle: "Ready to initiate today's strategic objectives." },
      "morning": { greeting: "Good morning, {name}.", subtitle: "Wishing you a highly productive and efficient business day." },
      "afternoon": { greeting: "Good afternoon, {name}.", subtitle: "Continuing steady progress across today's deliverables." },
      "evening": { greeting: "Good evening, {name}.", subtitle: "Finalizing operations and reviewing today's outcomes." },
      "night": { greeting: "Good evening, {name}.", subtitle: "Operations concluded. Have a restful night." },
      "late-night": { greeting: "Greetings, {name}.", subtitle: "System access active during off-peak hours." }
    }
  },
  {
    id: "casual",
    name: "Casual & Friendly",
    description: "Warm, conversational, and approachable for consumer apps and team communications.",
    slots: {
      "early-morning": { greeting: "Up early, {name}! ☕", subtitle: "Grab your coffee and let's make today count." },
      "morning": { greeting: "Morning {name}! 👋", subtitle: "Hope you're having an awesome start to your day." },
      "afternoon": { greeting: "Hey there {name}! ☀️", subtitle: "Halfway through! Keep that great energy going." },
      "evening": { greeting: "Hey {name}, good evening! 🌇", subtitle: "Hope you had an amazing day today." },
      "night": { greeting: "Have a great night, {name}! 🌙", subtitle: "Time to kick back and chill out." },
      "late-night": { greeting: "Still up, {name}? 🦉", subtitle: "Late night vibes! Don't forget to get some sleep." }
    }
  },
  {
    id: "energetic",
    name: "Energetic & Motivational",
    description: "High-octane, inspirational tone for fitness, habit trackers, and high-growth startups.",
    slots: {
      "early-morning": { greeting: "Rise and conquer, {name}! 🚀", subtitle: "The world is yours while others are still sleeping!" },
      "morning": { greeting: "Let's crush it today, {name}! 💥", subtitle: "Your momentum is unstoppable. Make it legendary!" },
      "afternoon": { greeting: "Power through the afternoon, {name}! ⚡", subtitle: "You are doing incredible work. Keep pushing forward!" },
      "evening": { greeting: "Victory lap time, {name}! 🏆", subtitle: "Celebrate the wins and accomplishments of today." },
      "night": { greeting: "Recharge like a champion, {name}! 🔋", subtitle: "Rest well tonight to dominate tomorrow." },
      "late-night": { greeting: "Legendary night owl mode, {name}! ✨", subtitle: "Great minds work late, but take care of yourself!" }
    }
  },
  {
    id: "support",
    name: "Customer Support & Concierge",
    description: "Helpful, service-oriented phrasing for help desks, chat widgets, and account areas.",
    slots: {
      "early-morning": { greeting: "Good morning, {name}. How may we assist you?", subtitle: "Our morning support team is online and at your service." },
      "morning": { greeting: "Good morning, {name}! Welcome back.", subtitle: "We're here to help you get the most out of your experience." },
      "afternoon": { greeting: "Good afternoon, {name}! How can we help today?", subtitle: "Explore our updates or contact our concierge anytime." },
      "evening": { greeting: "Good evening, {name}. Welcome.", subtitle: "We are available 24/7 to resolve any questions you have." },
      "night": { greeting: "Good evening, {name}. Welcome back.", subtitle: "Need quick answers? Check our instant knowledge base." },
      "late-night": { greeting: "Hello {name}, our overnight support is here.", subtitle: "Submit your request and we'll reply right away." }
    }
  },
  {
    id: "minimal",
    name: "Clean & Minimalist",
    description: "Understated, distraction-free phrasing for refined, modern user interfaces.",
    slots: {
      "early-morning": { greeting: "Good morning, {name}.", subtitle: "" },
      "morning": { greeting: "Good morning, {name}.", subtitle: "" },
      "afternoon": { greeting: "Good afternoon, {name}.", subtitle: "" },
      "evening": { greeting: "Good evening, {name}.", subtitle: "" },
      "night": { greeting: "Good night, {name}.", subtitle: "" },
      "late-night": { greeting: "Hello, {name}.", subtitle: "" }
    }
  }
];

export const LANGUAGE_PACKS = [
  {
    id: "en",
    name: "English",
    flag: "🇺🇸",
    slots: {
      "early-morning": { greeting: "Rise and shine, {name}!", subtitle: "A fresh early start to seize new opportunities today." },
      "morning": { greeting: "Good morning, {name}!", subtitle: "Wishing you a productive and successful day ahead." },
      "afternoon": { greeting: "Good afternoon, {name}!", subtitle: "Keep up the momentum. Hope your day is going wonderfully." },
      "evening": { greeting: "Good evening, {name}!", subtitle: "Time to wrap up key tasks and transition into relaxation." },
      "night": { greeting: "Good night, {name}!", subtitle: "Unwind, rest well, and recharge your energy for tomorrow." },
      "late-night": { greeting: "Burning the midnight oil, {name}?", subtitle: "Late-night creativity strikes, but remember to get some rest." }
    }
  },
  {
    id: "es",
    name: "Spanish (Español)",
    flag: "🇪🇸",
    slots: {
      "early-morning": { greeting: "¡Arriba ese ánimo, {name}!", subtitle: "Un comienzo temprano para conquistar el día." },
      "morning": { greeting: "¡Buenos días, {name}!", subtitle: "Que tengas un día muy productivo y exitoso." },
      "afternoon": { greeting: "¡Buenas tardes, {name}!", subtitle: "Continúa con esa gran energía esta tarde." },
      "evening": { greeting: "¡Buenas tardes / noches, {name}!", subtitle: "Es momento de cerrar tareas y descansar." },
      "night": { greeting: "¡Buenas noches, {name}!", subtitle: "Que descanses y renueves energías para mañana." },
      "late-night": { greeting: "¿Trasnochando, {name}?", subtitle: "No olvides descansar un poco antes de empezar el nuevo día." }
    }
  },
  {
    id: "fr",
    name: "French (Français)",
    flag: "🇫🇷",
    slots: {
      "early-morning": { greeting: "Debout là-dedans, {name} !", subtitle: "Une belle journée matinale commence." },
      "morning": { greeting: "Bonjour, {name} !", subtitle: "Passez une excellente et productive journée." },
      "afternoon": { greeting: "Bon après-midi, {name} !", subtitle: "Gardez le rythme pour cet après-midi." },
      "evening": { greeting: "Bonsoir, {name} !", subtitle: "Le moment idéal pour se détendre et profiter." },
      "night": { greeting: "Bonne nuit, {name} !", subtitle: "Reposez-vous bien pour recharger vos batteries." },
      "late-night": { greeting: "Encore éveillé(e), {name} ?", subtitle: "La nuit porte conseil, mais pensez au sommeil !" }
    }
  },
  {
    id: "de",
    name: "German (Deutsch)",
    flag: "🇩🇪",
    slots: {
      "early-morning": { greeting: "Guten Morgen Frühaufsteher, {name}!", subtitle: "Ein erfolgreicher Tag beginnt früh." },
      "morning": { greeting: "Guten Morgen, {name}!", subtitle: "Wir wünschen Ihnen einen produktiven und erfolgreichen Tag." },
      "afternoon": { greeting: "Guten Tag, {name}!", subtitle: "Bleiben Sie fokussiert und genießen Sie den Nachmittag." },
      "evening": { greeting: "Guten Abend, {name}!", subtitle: "Zeit, den Feierabend gemütlich ausklingen zu lassen." },
      "night": { greeting: "Gute Nacht, {name}!", subtitle: "Erholen Sie sich gut und sammeln Sie neue Kraft." },
      "late-night": { greeting: "Noch wach zu später Stunde, {name}?", subtitle: "Vergessen Sie nicht, sich auch Schlaf zu gönnen." }
    }
  },
  {
    id: "ja",
    name: "Japanese (日本語)",
    flag: "🇯🇵",
    slots: {
      "early-morning": { greeting: "おはようございます、{name}さん！", subtitle: "清々しい朝の始まりです。素晴らしい一日を。" },
      "morning": { greeting: "おはようございます、{name}さん！", subtitle: "今日も一日、充実した時間をお過ごしください。" },
      "afternoon": { greeting: "こんにちは、{name}さん！", subtitle: "午後も集中して順調に進めましょう。" },
      "evening": { greeting: "こんばんは、{name}さん！", subtitle: "今日もお疲れ様でした。ゆっくりとお過ごしください。" },
      "night": { greeting: "おやすみなさい、{name}さん！", subtitle: "しっかりと休んで、明日へのエネルギーをチャージしましょう。" },
      "late-night": { greeting: "夜遅くまでお疲れ様です、{name}さん！", subtitle: "無理をなさらず、早めに休息をお取りください。" }
    }
  },
  {
    id: "ar",
    name: "Arabic (العربية)",
    flag: "🇸🇦",
    slots: {
      "early-morning": { greeting: "صباح الخير والنشاط، {name}!", subtitle: "بداية مبكرة مباركة ليوم حافل بالإنجازات." },
      "morning": { greeting: "صباح الخير، {name}!", subtitle: "نتمنى لك يوماً مثمراً وموفقاً بكل المقاييس." },
      "afternoon": { greeting: "طاب مساؤك، {name}!", subtitle: "واصل التقدم الرائع في مهام يومك." },
      "evening": { greeting: "مساء الخير، {name}!", subtitle: "حان وقت إنهاء الأعمال والاسترخاء." },
      "night": { greeting: "تصبح على خير، {name}!", subtitle: "نوم هانئ وأحلام سعيدة لغدٍ أفضل." },
      "late-night": { greeting: "سهران لوقت متأخر، {name}؟", subtitle: "الإبداع الليلي رائع، لكن لا تنسَ أخذ قسط من الراحة." }
    }
  },
  {
    id: "bn",
    name: "Bengali (বাংলা)",
    flag: "🇧🇩",
    slots: {
      "early-morning": { greeting: "সুপ্রভাত, {name}!", subtitle: "ভোরের আলোয় এক নতুন ও সফল দিনের সূচনা হোক।" },
      "morning": { greeting: "শুভ সকাল, {name}!", subtitle: "আপনার আজকের দিনটি সাফল্য ও আনন্দে ভরে উঠুক।" },
      "afternoon": { greeting: "শুভ অপরাহ্ন, {name}!", subtitle: "দিনের বাকি অংশটুকুও অনুপ্রেরণাদায়ক হোক।" },
      "evening": { greeting: "শুভ সন্ধ্যা, {name}!", subtitle: "ক্লান্তি ভুলে এক মনোরম ও শান্তিপূর্ণ সন্ধ্যা উপভোগ করুন।" },
      "night": { greeting: "শুভ রাত্রি, {name}!", subtitle: "সুন্দর বিশ্রাম নিয়ে আগামীকালের জন্য প্রস্তুত হোন।" },
      "late-night": { greeting: "এত রাতেও জেগে আছেন, {name}?", subtitle: "দেরি না করে পর্যাপ্ত বিশ্রাম নিতে ভুলবেন না।" }
    }
  },
  {
    id: "hi",
    name: "Hindi (हिन्दी)",
    flag: "🇮🇳",
    slots: {
      "early-morning": { greeting: "सुप्रभात, {name}!", subtitle: "सुबह की ताजगी के साथ एक नए दिन की शुरुआत करें।" },
      "morning": { greeting: "शुभ प्रभात, {name}!", subtitle: "आपका आज का दिन अत्यंत सफल और मंगलमय हो।" },
      "afternoon": { greeting: "शुभ दोपहर, {name}!", subtitle: "अपने कार्यों में उत्साह और गति बनाए रखें।" },
      "evening": { greeting: "शुभ संध्या, {name}!", subtitle: "दिन भर की मेहनत के बाद सुकून भरे पलों का आनंद लें।" },
      "night": { greeting: "शुभ रात्रि, {name}!", subtitle: "अच्छी नींद लें और कल के लिए नई ऊर्जा संजोएं।" },
      "late-night": { greeting: "इतनी देर रात तक काम, {name}?", subtitle: "मेहनत शानदार है, पर अपनी सेहत और नींद का भी ध्यान रखें।" }
    }
  },
  {
    id: "pt",
    name: "Portuguese (Português)",
    flag: "🇧🇷",
    slots: {
      "early-morning": { greeting: "Bom dia bem cedo, {name}!", subtitle: "Comece o dia com disposição e foco." },
      "morning": { greeting: "Bom dia, {name}!", subtitle: "Desejamos a você um dia produtivo e incrível." },
      "afternoon": { greeting: "Boa tarde, {name}!", subtitle: "Mantenha o ritmo nessa tarde maravilhosa." },
      "evening": { greeting: "Boa noite, {name}!", subtitle: "Hora de encerrar o expediente e descansar." },
      "night": { greeting: "Boa noite e bom descanso, {name}!", subtitle: "Recarregue as energias para um amanhã brilhante." },
      "late-night": { greeting: "Trabalhando até tarde, {name}?", subtitle: "A criatividade noturna é ótima, mas lembre-se de dormir." }
    }
  },
  {
    id: "it",
    name: "Italian (Italiano)",
    flag: "🇮🇹",
    slots: {
      "early-morning": { greeting: "Buon risveglio, {name}!", subtitle: "Una partenza mattutina verso nuovi traguardi." },
      "morning": { greeting: "Buongiorno, {name}!", subtitle: "Ti auguriamo una giornata produttiva e serena." },
      "afternoon": { greeting: "Buon pomeriggio, {name}!", subtitle: "Continua con energia positiva per tutto il pomeriggio." },
      "evening": { greeting: "Buonasera, {name}!", subtitle: "Tempo di concludere gli impegni e rilassarsi." },
      "night": { greeting: "Buonanotte, {name}!", subtitle: "Riposa bene per ricaricare le tue energie." },
      "late-night": { greeting: "Ancora sveglio/a a quest'ora, {name}?", subtitle: "La notte stimola idee, ma non dimenticare il riposo." }
    }
  },
  {
    id: "zh",
    name: "Chinese (中文)",
    flag: "🇨🇳",
    slots: {
      "early-morning": { greeting: "清晨好，{name}！", subtitle: "一日之计在于晨，开启元气满满的新一天。" },
      "morning": { greeting: "早上好，{name}！", subtitle: "祝您今天工作顺利，心想事成。" },
      "afternoon": { greeting: "下午好，{name}！", subtitle: "保持高效专注，愿下午充满好心情。" },
      "evening": { greeting: "晚上好，{name}！", subtitle: "结束一天的忙碌，好好享受温馨夜晚。" },
      "night": { greeting: "晚安，{name}！", subtitle: "早点休息，恢复元气迎接精彩的明天。" },
      "late-night": { greeting: "夜深了还在奋斗，{name}？", subtitle: "注意劳逸结合，记得早点入睡保养身体。" }
    }
  }
];

export const CARD_THEMES = [
  {
    id: "aurora",
    name: "Aurora Indigo",
    gradient: "from-indigo-600 via-purple-600 to-violet-800",
    textClass: "text-white",
    subtextClass: "text-purple-200",
    badgeBg: "bg-white/20 text-white backdrop-blur-md border border-white/20",
    glowColor: "rgba(124, 58, 237, 0.35)",
    borderClass: "border-purple-400/30"
  },
  {
    id: "sunset",
    name: "Sunset Ember",
    gradient: "from-amber-500 via-rose-600 to-purple-800",
    textClass: "text-white",
    subtextClass: "text-amber-100",
    badgeBg: "bg-white/20 text-white backdrop-blur-md border border-white/20",
    glowColor: "rgba(244, 63, 94, 0.35)",
    borderClass: "border-rose-400/30"
  },
  {
    id: "ocean",
    name: "Oceanic Cyan",
    gradient: "from-cyan-600 via-teal-600 to-blue-800",
    textClass: "text-white",
    subtextClass: "text-cyan-100",
    badgeBg: "bg-white/20 text-white backdrop-blur-md border border-white/20",
    glowColor: "rgba(6, 182, 212, 0.35)",
    borderClass: "border-cyan-400/30"
  },
  {
    id: "emerald",
    name: "Midnight Emerald",
    gradient: "from-emerald-600 via-teal-800 to-slate-950",
    textClass: "text-white",
    subtextClass: "text-emerald-200",
    badgeBg: "bg-white/20 text-white backdrop-blur-md border border-white/20",
    glowColor: "rgba(16, 185, 129, 0.35)",
    borderClass: "border-emerald-400/30"
  },
  {
    id: "cyberpunk",
    name: "Neon Cyberpunk",
    gradient: "from-fuchsia-600 via-pink-600 to-slate-950",
    textClass: "text-white",
    subtextClass: "text-pink-200",
    badgeBg: "bg-white/20 text-white backdrop-blur-md border border-white/20",
    glowColor: "rgba(236, 72, 153, 0.35)",
    borderClass: "border-fuchsia-400/30"
  },
  {
    id: "clean-light",
    name: "Clean Daylight",
    gradient: "from-slate-50 via-white to-slate-100",
    textClass: "text-slate-900",
    subtextClass: "text-slate-600",
    badgeBg: "bg-slate-200/80 text-slate-800 backdrop-blur-md border border-slate-300",
    glowColor: "rgba(148, 163, 184, 0.2)",
    borderClass: "border-slate-300/80"
  },
  {
    id: "obsidian",
    name: "Stealth Obsidian",
    gradient: "from-slate-900 via-slate-950 to-black",
    textClass: "text-white",
    subtextClass: "text-slate-400",
    badgeBg: "bg-white/10 text-slate-200 backdrop-blur-md border border-white/10",
    glowColor: "rgba(255, 255, 255, 0.08)",
    borderClass: "border-slate-800"
  }
];

export const FAQ_ITEMS = [
  {
    q: "How does the Dynamic Time Greeting Generator work?",
    a: "The tool evaluates the current hour and minute in your target IANA timezone (or detected local device time). It compares that time against your customizable time slots (Early Morning, Morning, Afternoon, Evening, Night, Late Night). Once the active slot is matched, it dynamically injects your variables (like recipient name, company, time, date, and emojis) and produces live greeting text, rendered visuals, and production-ready code."
  },
  {
    q: "Why is target timezone selection important for web applications?",
    a: "When building global SaaS dashboards, remote team portals, or sending scheduled emails, server time (typically UTC) rarely matches the user's actual wall-clock time. By specifying the target timezone (e.g., America/New_York or Asia/Dhaka), the greeting remains contextually correct—preventing awkward situations like greeting an Australian user with 'Good Night' when it is actually 9:00 AM in Sydney."
  },
  {
    q: "How can I avoid hydration mismatch in Next.js (SSR)?",
    a: "In Next.js server-side rendering, rendering time-dependent text like 'Good Morning' during SSR causes hydration mismatches if the server's clock or timezone differs from the user's browser. The best practice is to either use a client-side `useEffect` mounted check (our exported React hook includes this out of the box), or read a timezone cookie in server components."
  },
  {
    q: "Can I use these dynamic greetings in email marketing platforms (Klaviyo, Mailchimp)?",
    a: "Yes! Our Code & Export tab includes pre-formatted Liquid and HTML/Handlebars snippets designed for platforms like Klaviyo, Shopify, and Mailchimp. These scripts use the email recipient's local time tag to dynamically serve 'Good morning' or 'Good afternoon' when the recipient opens the newsletter."
  },
  {
    q: "What placeholders are supported in custom greeting templates?",
    a: "You can customize any slot with: `{name}` (recipient name), `{time}` (formatted 12h or 24h time), `{date}` (full local date), `{day}` (day of the week), `{timezone}` (target timezone identifier), `{prefix}` (salutation prefix), `{suffix}` (emoji or custom suffix), `{company}` (organization name), and `{title}` (recipient role/title)."
  },
  {
    q: "Can I completely customize the hours and add new time slots?",
    a: "Yes! Every single time slot can have its start hour, start minute, end hour, end minute, primary headline, and subtitle adjusted. You can also disable slots or add new custom brackets (for instance, a specific 12:00 PM – 1:30 PM 'Lunch Break' greeting or shift-work hours)."
  },
  {
    q: "Does this tool store any of my data on your servers?",
    a: "No. ToolsTrek operates strictly client-side. All custom time slot configurations, personal names, custom variables, and selected timezones are saved locally in your own browser's LocalStorage. Nothing is ever sent to or stored on an external server."
  },
  {
    q: "How do Daylight Saving Time (DST) changes affect target timezones?",
    a: "Because this tool uses standard IANA timezone identifiers (such as `America/New_York` instead of static offsets like `UTC-5`), the browser's native `Intl.DateTimeFormat` automatically calculates Daylight Saving Time transitions on the exact date and hour they occur, ensuring 100% accuracy year-round."
  }
];

export const GREETING_MATRIX_DATA = [
  {
    bracket: "Early Dawn / Early Morning",
    hours: "04:00 – 06:59 (4 AM – 7 AM)",
    formal: "Good morning, [Name]",
    casual: "Rise and shine! / Up early, [Name] ☕",
    corporate: "Good early morning. Systems ready.",
    bestFor: "Productivity apps, meditation apps, morning newsletters, fitness trackers"
  },
  {
    bracket: "Morning",
    hours: "07:00 – 11:59 (7 AM – 12 PM)",
    formal: "Good morning, [Name]",
    casual: "Morning, [Name]! 👋 Hope you have a great day",
    corporate: "Good morning. Ready for today's agenda.",
    bestFor: "Work dashboards, CRM logins, daily standup summaries, B2B SaaS"
  },
  {
    bracket: "Afternoon",
    hours: "12:00 – 16:59 (12 PM – 5 PM)",
    formal: "Good afternoon, [Name]",
    casual: "Hey [Name], hope your afternoon is going well!",
    corporate: "Good afternoon. Deliverables status check.",
    bestFor: "E-commerce store visits, customer support chats, mid-day check-ins"
  },
  {
    bracket: "Evening",
    hours: "17:00 – 20:59 (5 PM – 9 PM)",
    formal: "Good evening, [Name]",
    casual: "Good evening, [Name]! Time to wind down 🌇",
    corporate: "Good evening. Day-end summary ready.",
    bestFor: "Streaming services, food delivery, evening emails, smart home displays"
  },
  {
    bracket: "Night",
    hours: "21:00 – 23:59 (9 PM – Midnight)",
    formal: "Good evening / Good night, [Name]",
    casual: "Have a peaceful night, [Name]! 🌙",
    corporate: "Operations complete for today.",
    bestFor: "Reading apps, sleep trackers, night mode UI prompts, audiobooks"
  },
  {
    bracket: "Late Night / Midnight",
    hours: "00:00 – 03:59 (Midnight – 4 AM)",
    formal: "Greetings, [Name]",
    casual: "Burning the midnight oil, [Name]? 🦉",
    corporate: "Off-peak session active.",
    bestFor: "Developer consoles, gaming hubs, night owls, crisis support tools"
  }
];
