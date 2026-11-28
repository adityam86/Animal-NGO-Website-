export type RescueLang = "en" | "bn" | "hi";

export const RESCUE_LANG_LABELS: Record<RescueLang, string> = {
  en: "English",
  bn: "বাংলা",
  hi: "हिन्दी",
};

export interface RescueCopyBundle {
  eyebrow: string;
  headline: string;
  subtext: string;
  emergencyStripTitle: string;
  emergencyStripSub: string;
  callNowLabel: string;
  whatsappLabel: string;
  mapLinkLabel: string;
  step1Title: string;
  step2Title: string;
  step3Title: string;
  animalTypeLabel: string;
  urgencyLabel: string;
  locationLabel: string;
  locationPlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  reporterNameLabel: string;
  reporterPhoneLabel: string;
  reporterEmailLabel: string;
  voiceSectionTitle: string;
  voiceSectionHint: string;
  submitBtn: string;
  submittingBtn: string;
  firstAidTitle: string;
  firstAidTips: string[];
  firstAidWarning: string;
}

export const RESCUE_COPY: Record<RescueLang, RescueCopyBundle> = {
  en: {
    eyebrow: "24/7 Street Animal Dispatch",
    headline: "Report an Injured or Suffering Animal",
    subtext:
      "Pin the spot on our Asansol, Tilabad, Kumarpur, Raniganj, or Durgapur corridor map and attach a photo or short 15s witness voice note so our rescuers respond prepared.",
    emergencyStripTitle: "Severe bleeding, road hit, or unable to stand?",
    emergencyStripSub: "Call or WhatsApp Tarasankar Nag immediately for urgent roadside triage.",
    callNowLabel: "Call Helpline",
    whatsappLabel: "WhatsApp Location",
    mapLinkLabel: "View Community Rescue Heatmap →",
    step1Title: "1. Animal & Emergency Severity",
    step2Title: "2. Exact Spot, Photo & Voice Note",
    step3Title: "3. Witness Contact Details",
    animalTypeLabel: "Animal Species",
    urgencyLabel: "Urgency Level",
    locationLabel: "Landmark / Street Location",
    locationPlaceholder: "e.g., Near Kumarpur Overbridge, Asansol / NH-19 crossing",
    descriptionLabel: "What happened? (Condition & visibility)",
    descriptionPlaceholder: "Describe injury, bleeding, collar/tag if any, and whether the animal can still move...",
    reporterNameLabel: "Your Name",
    reporterPhoneLabel: "Mobile / WhatsApp Number",
    reporterEmailLabel: "Email (Optional — for status updates)",
    voiceSectionTitle: "Optional 15s Witness Voice Note (Encrypted Private Dispatch)",
    voiceSectionHint: "Too shaken to type everything? Record up to 15 seconds describing landmarks in Bengali, Hindi, or English. Only our rescue coordinators can hear it.",
    submitBtn: "Dispatch Rescue Team Now",
    submittingBtn: "Sending Urgent Dispatch...",
    firstAidTitle: "Safe Street First-Aid While Waiting",
    firstAidTips: [
      "Stay calm and guide traffic away with a flashlight or cloth barrier.",
      "Do NOT force water or food into an unconscious, vomiting, or seizing animal.",
      "For active bleeding, press a clean dry cloth firmly over the wound.",
      "If safe, move tiny kittens/pups onto dry cardboard away from wheels.",
    ],
    firstAidWarning:
      "Never give human painkillers (Paracetamol, Crocin, Diclofenac, or Ibuprofen) — even one tablet can fatally poison dogs or cats.",
  },
  bn: {
    eyebrow: "২৪ ঘণ্টা জরুরি প্রাণী উদ্ধার পরিষেবা",
    headline: "রাস্তায় আহত বা অসুস্থ প্রাণীর খবর দিন",
    subtext:
      "আসানসোল, তিলাবাদ, কুমারপুর, রানীগঞ্জ বা দুর্গাপুর এলাকার সঠিক লোকেশন ম্যাপে পিন করুন এবং ছবি বা ১৫ সেকেন্ডের ভয়েস নোট পাঠান যাতে আমাদের উদ্ধার দল দ্রুত পৌঁছাতে পারে।",
    emergencyStripTitle: "অতিরিক্ত রক্তপাত, রাস্তায় দুর্ঘটনা বা প্রাণীটি উঠতে পারছে না?",
    emergencyStripSub: "দেরি না করে এখনই তারাশঙ্কর নাগ-কে সরাসরি কল বা হোয়াটসঅ্যাপে লোকেশন পাঠান।",
    callNowLabel: "হেল্পলাইনে কল করুন",
    whatsappLabel: "হোয়াটসঅ্যাপ লোকেশন",
    mapLinkLabel: "উদ্ধার হিটম্যাপ দেখুন →",
    step1Title: "১. প্রাণীর ধরন ও জরুরি অবস্থা",
    step2Title: "২. সঠিক জায়গা, ছবি ও ভয়েস নোট",
    step3Title: "৩. আপনার যোগাযোগের তথ্য",
    animalTypeLabel: "কোন প্রাণী?",
    urgencyLabel: "কতটা জরুরি?",
    locationLabel: "কাছাকাছি জায়গার নাম / ল্যান্ডমার্ক",
    locationPlaceholder: "যেমন: কুমারপুর ওভারব্রিজের কাছে, আসানসোল বা NH-19 মোড়",
    descriptionLabel: "কী হয়েছে ও বর্তমান অবস্থা লিখুন",
    descriptionPlaceholder: "আঘাত, রক্তপাত বা প্রাণীটি কোথায় বসে আছে সংক্ষেপে লিখুন...",
    reporterNameLabel: "আপনার নাম",
    reporterPhoneLabel: "মোবাইল / হোয়াটসঅ্যাপ নম্বর",
    reporterEmailLabel: "ইমেল (ঐচ্ছিক — আপডেট পাওয়ার জন্য)",
    voiceSectionTitle: "১৫ সেকেন্ডের ভয়েস নোট (ঐচ্ছিক ও সুরক্ষিত)",
    voiceSectionHint: "তাড়াহুড়োয় টাইপ করতে অসুবিধা হলে বাংলা, হিন্দি বা ইংরেজিতে ১৫ সেকেন্ডের মধ্যে জায়গাটির বর্ণনা রেকর্ড করুন। কেবল আমাদের উদ্ধার দলই এটি শুনতে পাবে।",
    submitBtn: "উদ্ধার দল পাঠান",
    submittingBtn: "জরুরি বার্তা পাঠানো হচ্ছে...",
    firstAidTitle: "উদ্ধার দল পৌঁছানো পর্যন্ত নিরাপদ প্রাথমিক ব্যবস্থা",
    firstAidTips: [
      "শান্ত থাকুন এবং প্রাণীটিকে গাড়ির চলাচল থেকে দূরে নিরাপদ রাখতে সাহায্য করুন।",
      "অজ্ঞান, বমি করা বা কাঁপতে থাকা প্রাণীকে জোর করে জল বা খাবার খাওয়াবেন না।",
      "রক্ত পড়লে পরিষ্কার শুকনো কাপড় দিয়ে হালকাভাবে চেপে ধরুন।",
      "সম্ভব হলে ছোট কুকুরছানা বা বিড়ালছানাকে শুকনো কার্ডবোর্ডের ওপর সরিয়ে রাখুন।",
    ],
    firstAidWarning:
      "কখনও মানুষের ব্যথার ওষুধ (Paracetamol, Crocin, Ibuprofen বা Diclofenac) খাওয়াবেন না — এটি কুকুর বা বিড়ালের জন্য প্রাণঘাতী হতে পারে।",
  },
  hi: {
    eyebrow: "24×7 सड़क पशु आपातकालीन सहायता",
    headline: "घायल या संकट में पड़े पशु की रिपोर्ट करें",
    subtext:
      "आसनसोल, तिलाबाद, कुमारपुर, रानीगंज या दुर्गापुर क्षेत्र का स्थान मैप पर पिन करें और फ़ोटो या 15 सेकंड का वॉइस नोट जोड़ें ताकि हमारी रेस्क्यू टीम तुरंत पहुँच सके।",
    emergencyStripTitle: "तेज़ रक्तस्राव, सड़क दुर्घटना या पशु उठने में असमर्थ है?",
    emergencyStripSub: "तुरंत ताराशंकर नाग को कॉल करें या WhatsApp पर लाइव लोकेशन भेजें।",
    callNowLabel: "हेल्पलाइन पर कॉल करें",
    whatsappLabel: "WhatsApp लोकेशन",
    mapLinkLabel: "रेस्क्यू हीटमैप देखें →",
    step1Title: "1. पशु और स्थिति की गंभीरता",
    step2Title: "2. सटीक स्थान, फ़ोटो और वॉइस नोट",
    step3Title: "3. आपका संपर्क विवरण",
    animalTypeLabel: "पशु का प्रकार",
    urgencyLabel: "आपातकाल स्तर",
    locationLabel: "नज़दीकी लैंडमार्क / सड़क का नाम",
    locationPlaceholder: "जैसे: कुमारपुर ओवरब्रिज के पास, आसनसोल या NH-19 क्रॉसिंग",
    descriptionLabel: "क्या हुआ? (चोट व स्थिति लिखें)",
    descriptionPlaceholder: "चोट, खून बहना या पशु कहाँ बैठा है संक्षेप में बताएं...",
    reporterNameLabel: "आपका नाम",
    reporterPhoneLabel: "मोबाइल / WhatsApp नंबर",
    reporterEmailLabel: "ईमेल (वैकल्पिक — केस अपडेट हेतु)",
    voiceSectionTitle: "15 सेकंड का वैकल्पिक वॉइस नोट (गोपनीय)",
    voiceSectionHint: "यदि टाइप करना कठिन है, तो हिन्दी, बंगाली या अंग्रेज़ी में जगह की जानकारी 15 सेकंड में रिकॉर्ड करें। यह केवल हमारे रेस्क्यू समन्वयकों को सुनाई देगा।",
    submitBtn: "तुरंत रेस्क्यू टीम भेजें",
    submittingBtn: "आपातकालीन सूचना भेजी जा रही है...",
    firstAidTitle: "टीम पहुँचने तक सुरक्षित प्राथमिक देखभाल",
    firstAidTips: [
      "शांत रहें और ट्रैफ़िक से पशु को सुरक्षित रखने में मदद करें।",
      "बेहोश या उल्टी करते पशु के मुँह में ज़बरदस्ती पानी या खाना न डालें।",
      "खून बहने पर साफ़ सूखे कपड़े से हल्का दबाव बनाएं रखें।",
      "यदि सुरक्षित हो, तो छोटे पिल्लों/बिल्लियों को सूखे गत्ते पर सड़क से दूर रखें।",
    ],
    firstAidWarning:
      "कभी भी इंसानों की दर्द निवारक दवा (Paracetamol, Crocin, Diclofenac या Ibuprofen) न दें — यह कुत्तों और बिल्लियों के लिए जानलेवा होती है।",
  },
};
