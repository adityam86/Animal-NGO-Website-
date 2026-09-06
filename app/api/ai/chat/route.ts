import { NextResponse } from "next/server";

interface TriageTopic {
  keywords: string[];
  title: string;
  isEmergency: boolean;
  firstAidSteps: string[];
  safetyWarnings: string[];
  response: string;
}

const EMERGENCY_TRIAGE: TriageTopic[] = [
  {
    keywords: ["bleeding", "blood", "wound", "cut", "hit by car", "accident", "run over", "injured dog", "injured cat"],
    title: "🚨 Emergency Triage: Severe Bleeding & Trauma",
    isEmergency: true,
    firstAidSteps: [
      "Apply firm, continuous direct pressure to the wound using a clean cotton cloth, towel, or sterile gauze.",
      "Keep the animal lying down, still, and calm. Cover them with a dry blanket to prevent traumatic shock.",
      "If transport is needed, slide a flat wooden board, cardboard, or blanket underneath to act as an emergency stretcher.",
      "Keep your hands safe: Injured animals in acute pain may snap instinctively. Approach gently from the side."
    ],
    safetyWarnings: [
      "⚠️ NEVER administer human painkillers (Paracetamol, Crocin, Ibuprofen, Disprin) — they are highly lethal to dogs & cats.",
      "⚠️ DO NOT apply a tight tourniquet around the neck or joints."
    ],
    response: "🚨 EMERGENCY FIRST-AID FOR BLEEDING / INJURY:\n\n1. Press a clean cloth firmly against the wound.\n2. Keep the animal warm and quiet to prevent shock.\n3. Slide cardboard or blanket underneath as a stretcher.\n\n⚠️ NEVER give human medicines like Paracetamol/Crocin (lethal to animals).\n\nDispatching our rescue ambulance is critical:"
  },
  {
    keywords: ["heat stroke", "heatstroke", "hot", "panting", "fainted", "sun stroke", "cow heat", "dehydration"],
    title: "☀️ Emergency Triage: Heat Stroke & Dehydration",
    isEmergency: true,
    firstAidSteps: [
      "Immediately move the animal into shade or a cool, ventilated area.",
      "Gently pour room-temperature or tap water over their body, paws, ears, and groin (DO NOT use ice water, which causes vascular shock).",
      "Offer cool fresh water in small sips if conscious. Never force water into an unconscious animal's mouth.",
      "For cattle/cows: splash water generously over the forehead, horns, and back, and fan them continuously."
    ],
    safetyWarnings: [
      "⚠️ DO NOT submerge animal in ice water or apply ice packs directly.",
      "⚠️ If the animal is unresponsive or convulsing, seek urgent veterinary intervention."
    ],
    response: "☀️ EMERGENCY FIRST-AID FOR HEAT STROKE:\n\n1. Move immediately into deep shade / cool area.\n2. Wet paws, ears, and body with tap water (NOT ice water).\n3. Fan gently to speed up evaporative cooling.\n4. Offer small sips of water if conscious.\n\nOur mobile vet unit can administer IV fluids:"
  },
  {
    keywords: ["puppy", "puppies", "kitten", "kittens", "abandoned", "newborn", "neonatal", "stranded puppy"],
    title: "🐾 Emergency Triage: Abandoned Puppies / Kittens",
    isEmergency: true,
    firstAidSteps: [
      "Step back and observe for 30-45 minutes: The mother dog/cat often goes searching for food and will return.",
      "If mother does not return or area is hazardous (rain/traffic), move them into a dry, warm cardboard box lined with clean towels.",
      "Keep them warm: Neonatal pups/kittens cannot regulate body temperature. Place a warm water bottle wrapped in a thick towel next to them.",
      "If feeding is urgent before rescue arrives, use lukewarm goat's milk or boiled water with a pinch of glucose using a clean syringe or dropper."
    ],
    safetyWarnings: [
      "⚠️ NEVER feed cold undiluted cow's milk — it causes fatal digestive distress and dehydration in puppies/kittens.",
      "⚠️ NEVER feed a cold puppy; warm their body first before offering fluids."
    ],
    response: "🐾 FIRST-AID FOR ABANDONED PUPPIES / KITTENS:\n\n1. Keep them WARM immediately using a towel-lined box with a warm bottle.\n2. Check if the mother is foraging nearby before removing them.\n3. DO NOT feed regular cow's milk (causes deadly diarrhea).\n4. Keep safe from stray traffic and rain.\n\nOur foster team can take them into intensive care:"
  },
  {
    keywords: ["poison", "poisoning", "toxic", "vomit", "vomiting", "frothing", "rat poison", "chemical"],
    title: "☣️ Emergency Triage: Suspected Poisoning",
    isEmergency: true,
    firstAidSteps: [
      "Safely identify or photograph the substance/packaging if possible for the attending veterinarian.",
      "Prevent any other animals from accessing the area.",
      "Keep the animal in a calm, dark, well-ventilated room with minimal stimuli.",
      "If caustic chemical is on the skin/fur, rinse with copious lukewarm water."
    ],
    safetyWarnings: [
      "⚠️ DO NOT induce vomiting unless directly instructed by a qualified veterinarian (corrosives burn the esophagus twice).",
      "⚠️ DO NOT feed oil or raw eggs."
    ],
    response: "☣️ EMERGENCY FIRST-AID FOR POISONING:\n\n1. Photograph or identify the suspected substance.\n2. Keep animal calm and ventilated; prevent seizures.\n3. DO NOT induce vomiting without veterinarian guidance.\n\nImmediate medical antidotes and gastric lavage are required:"
  },
  {
    keywords: ["fracture", "limp", "limping", "broken leg", "bone", "cannot walk", "spine"],
    title: "🦴 Emergency Triage: Suspected Fracture / Broken Bone",
    isEmergency: true,
    firstAidSteps: [
      "Do NOT try to push, pull, or set the broken bone.",
      "Immobilize the animal gently. Slide a firm cardboard base or blanket beneath them to transport without flexing the spine or limb.",
      "Speak in a gentle, reassuring tone. Apply a soft muzzle if handling is painful, as even friendly animals may bite defensively."
    ],
    safetyWarnings: [
      "⚠️ DO NOT wrap splints tightly without veterinary training as it cuts off blood circulation.",
      "⚠️ Keep spine aligned if struck by a vehicle."
    ],
    response: "🦴 FIRST-AID FOR SUSPECTED FRACTURE:\n\n1. Minimize all movement; do NOT attempt to straighten the limb.\n2. Support the body with a rigid cardboard sheet or blanket stretcher.\n3. Keep calm and avoid sudden touches to the injured area.\n\nOur rescue ambulance has splints and pain medication ready:"
  },
  {
    keywords: ["cow bloat", "bloated cow", "choking cow", "downed cow", "cow accident"],
    title: "🐄 Emergency Triage: Cattle Distress & Bloat",
    isEmergency: true,
    firstAidSteps: [
      "Position the cow in sternal recumbency (upright sitting on chest), NOT flat on its side, so rumen gas can escape.",
      "Keep onlookers and stray dogs away to prevent acute cardiac stress.",
      "Offer shade and cool clean water.",
      "If foreign object/plastic is lodged in mouth and visible, gently remove only if safe to do so."
    ],
    safetyWarnings: [
      "⚠️ Do NOT puncture the rumen yourself without veterinary equipment.",
      "⚠️ Stay clear of kicking legs when a distressed cow is down."
    ],
    response: "🐄 EMERGENCY FIRST-AID FOR CATTLE / COWS:\n\n1. Prop cow sitting upright on its chest (prevents asphyxiation from rumen gas).\n2. Provide shade and clear the crowd to reduce stress.\n3. Keep head elevated and clear of dirt/water.\n\nOur dedicated Gaushala ambulance and large-animal vet are on standby:"
  }
];

const GENERAL_KNOWLEDGE = [
  {
    keywords: ["adopt", "adoption", "how to adopt", "home", "process"],
    response: "🐾 ADOPTION PROCESS AT AYUDAR:\n\n1. Browse our verified rescues at `/animals`.\n2. Fill out our online adoption form.\n3. Our adoption counselor will schedule an informal visit to meet the companion.\n4. Complete the home check and take your new family member home vaccinated & sterilized! ❤️"
  },
  {
    keywords: ["donate", "donation", "money", "funds", "tax", "80g", "exempt"],
    response: "❤️ DONATING TO AYUDAR:\n\nAll donations directly fund emergency surgeries, daily feed for 100+ shelter animals, and rescue fuel.\n\n✅ 80G Tax Exemption Certificate provided instantly.\n💳 UPI, Net Banking, and Cards accepted via our secure portal at `/donate`."
  },
  {
    keywords: ["sponsor", "sponsorship", "monthly care", "cow care", "feed"],
    response: "🌾 ANIMAL SPONSORSHIP:\n\nYou can sponsor an individual cow, dog, or cat! Options range from ₹500/month (Food Care) to ₹3,000/month (Full Medical & Sanctuary Care). Visit `/sponsor` to view animals waiting for a guardian angel."
  },
  {
    keywords: ["volunteer", "help", "work", "join", "intern"],
    response: "🤝 BECOME A VOLUNTEER:\n\nWe welcome volunteers for rescue dispatches, shelter care, feeding drives, photography, and community awareness. Fill out our quick form at `/volunteer` to join our Raniganj rescue network!"
  },
  {
    keywords: ["gaushala", "cow sanctuary", "cows", "cattle"],
    response: "🐄 AYUDAR GAUSHALA:\n\nOur sanctuary provides lifetime care, nutritious green fodder, and medical treatments for over 45 rescued cows, calves, and retired working cattle. Learn more at `/gaushala`!"
  },
  {
    keywords: ["location", "address", "raniganj", "contact", "timing", "shelter"],
    response: "📍 AYUDAR ANIMAL SANCTUARY:\n\nLocation: Raniganj - Asansol Belt, West Bengal.\nAmbulance: 24/7 Emergency Response.\nVisiting Hours: 10:00 AM – 5:00 PM (Daily).\nEmergency Hotline: +91 98000 00000"
  }
];

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({
        reply: "Hello! I am the Ayudar AI Emergency & Animal Care Assistant. How can I assist you today?",
        isEmergency: false
      });
    }

    const cleanMsg = message.toLowerCase().trim();

    // 1. Check for Emergency Triage Match
    for (const triage of EMERGENCY_TRIAGE) {
      if (triage.keywords.some(k => cleanMsg.includes(k))) {
        return NextResponse.json({
          reply: triage.response,
          isEmergency: true,
          title: triage.title,
          steps: triage.firstAidSteps,
          warnings: triage.safetyWarnings,
          dispatchUrl: "/rescue",
          hotline: "+91 98000 00000"
        });
      }
    }

    // 2. Check for General Knowledge Match
    for (const item of GENERAL_KNOWLEDGE) {
      if (item.keywords.some(k => cleanMsg.includes(k))) {
        return NextResponse.json({
          reply: item.response,
          isEmergency: false
        });
      }
    }

    // 3. Fallback Response
    return NextResponse.json({
      reply: "I'm the Ayudar Animal Care Assistant! I can help you with:\n\n" +
             "🚨 Emergency First-Aid Triage (Bleeding, Fractures, Heat stroke, Abandoned pups)\n" +
             "🐕 Animal Adoption & Shelter visits\n" +
             "🐄 Gaushala & Cow Sponsorship\n" +
             "❤️ 80G Tax-exempt Donations & Volunteering\n\n" +
             "How can we support an animal in need today?",
      isEmergency: false
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      {
        reply: "Sorry, I'm having trouble connecting to my knowledge base right now. If this is an emergency, call our 24/7 hotline at +91 98000 00000 or click '🚨 Report an Animal'!",
        isEmergency: true,
        dispatchUrl: "/rescue",
        hotline: "+91 98000 00000"
      },
      { status: 500 }
    );
  }
}
