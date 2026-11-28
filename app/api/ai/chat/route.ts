import { NextResponse } from "next/server";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, readBoundedJson } from "@/lib/security";
import { chatMessageSchema } from "@/lib/validation";
import { AYUDAR_LEGAL, CONTACT_INFO } from "@/lib/data";

const FIRST_AID_DISCLAIMER =
  "Note: This information is supportive first-aid guidance only and is not a substitute for qualified veterinary diagnosis or emergency clinic treatment.";

interface TriageTopic {
  keywords: string[];
  title: string;
  isEmergency: boolean;
  firstAidSteps: string[];
  safetyWarnings: string[];
  response: string;
}

interface StructuredChatPayload {
  reply: string;
  isEmergency: boolean;
  title?: string;
  steps?: string[];
  warnings?: string[];
  disclaimer?: string;
  dispatchUrl?: string;
  hotline?: string;
  provider?: "openai" | "gemini" | "rules";
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
      "Keep your hands safe: Injured animals in acute pain may snap instinctively. Approach gently from the side.",
    ],
    safetyWarnings: [
      "⚠️ NEVER administer human painkillers (Paracetamol, Crocin, Ibuprofen, Disprin) — they are highly lethal to dogs & cats.",
      "⚠️ DO NOT apply a tight tourniquet around the neck or joints.",
    ],
    response:
      "🚨 EMERGENCY FIRST-AID FOR BLEEDING / INJURY:\n\n1. Press a clean cloth firmly against the wound.\n2. Keep the animal warm and quiet to prevent shock.\n3. Slide cardboard or blanket underneath as a stretcher.\n\n⚠️ NEVER give human medicines like Paracetamol/Crocin (lethal to animals).\n\nDispatching our rescue team is critical:",
  },
  {
    keywords: ["heat stroke", "heatstroke", "panting heavily", "fainted", "sun stroke", "cow heat", "dehydration"],
    title: "☀️ Emergency Triage: Heat Stroke & Dehydration",
    isEmergency: true,
    firstAidSteps: [
      "Immediately move the animal into shade or a cool, ventilated area.",
      "Gently pour room-temperature or tap water over their body, paws, ears, and groin (DO NOT use ice water, which causes vascular shock).",
      "Offer cool fresh water in small sips if conscious. Never force water into an unconscious animal's mouth.",
      "For cattle/cows: splash water generously over the forehead, horns, and back, and fan them continuously.",
    ],
    safetyWarnings: [
      "⚠️ DO NOT submerge animal in ice water or apply ice packs directly.",
      "⚠️ If the animal is unresponsive or convulsing, seek urgent veterinary intervention.",
    ],
    response:
      "☀️ EMERGENCY FIRST-AID FOR HEAT STROKE:\n\n1. Move immediately into deep shade / cool area.\n2. Wet paws, ears, and body with tap water (NOT ice water).\n3. Fan gently to speed up evaporative cooling.\n4. Offer small sips of water if conscious.\n\nOur mobile rescue team can coordinate urgent stabilization:",
  },
  {
    keywords: ["puppy", "puppies", "kitten", "kittens", "abandoned", "newborn", "neonatal", "stranded puppy"],
    title: "🐾 Emergency Triage: Abandoned Puppies / Kittens",
    isEmergency: true,
    firstAidSteps: [
      "Step back and observe for 30-45 minutes: The mother dog/cat often goes searching for food and will return.",
      "If mother does not return or area is hazardous (rain/traffic), move them into a dry, warm cardboard box lined with clean towels.",
      "Keep them warm: Neonatal pups/kittens cannot regulate body temperature. Place a warm water bottle wrapped in a thick towel next to them.",
      "If feeding is urgent before rescue arrives, consult a vet first and keep them warm before offering lukewarm kitten/puppy formula with a clean syringe or dropper.",
    ],
    safetyWarnings: [
      "⚠️ NEVER feed cold or undiluted cow's milk — it causes fatal digestive distress and dehydration in puppies/kittens.",
      "⚠️ NEVER feed a cold puppy or kitten; warm their body gently first.",
    ],
    response:
      "🐾 FIRST-AID FOR ABANDONED PUPPIES / KITTENS:\n\n1. Keep them WARM immediately using a towel-lined box with a wrapped warm bottle.\n2. Check if the mother is foraging nearby before moving them.\n3. DO NOT feed regular cow's milk.\n4. Keep safe from traffic and rain.\n\nReach out to our rescue team if they need shelter intake:",
  },
  {
    keywords: ["poison", "poisoning", "toxic", "vomit", "vomiting", "frothing", "rat poison", "chemical"],
    title: "☣️ Emergency Triage: Suspected Poisoning",
    isEmergency: true,
    firstAidSteps: [
      "Safely identify or photograph the substance/packaging if possible for the attending veterinarian.",
      "Prevent any other animals from accessing the area.",
      "Keep the animal in a calm, well-ventilated space with minimal stimuli.",
      "If a chemical is on skin/fur, rinse gently with clean lukewarm water while wearing gloves.",
    ],
    safetyWarnings: [
      "⚠️ DO NOT induce vomiting unless directly instructed by a qualified veterinarian (corrosives burn the esophagus twice).",
      "⚠️ DO NOT force-feed oil or home remedies.",
    ],
    response:
      "☣️ EMERGENCY FIRST-AID FOR POISONING:\n\n1. Photograph or identify the suspected substance.\n2. Keep the animal calm and away from toxins.\n3. DO NOT induce vomiting without veterinarian instruction.\n\nUrgent clinical intervention is required:",
  },
  {
    keywords: ["fracture", "limp", "limping", "broken leg", "broken bone", "cannot walk", "spine injury"],
    title: "🦴 Emergency Triage: Suspected Fracture / Broken Bone",
    isEmergency: true,
    firstAidSteps: [
      "Do NOT try to push, pull, or set a broken bone.",
      "Immobilize the animal gently. Slide a firm cardboard sheet or folded blanket beneath them to lift without flexing the spine.",
      "Speak softly and avoid sudden grabs around painful limbs; startled animals can bite defensively.",
    ],
    safetyWarnings: [
      "⚠️ DO NOT wrap tight splints without veterinary supervision — it restricts blood flow.",
      "⚠️ Keep head and spine level if struck by a vehicle.",
    ],
    response:
      "🦴 FIRST-AID FOR SUSPECTED FRACTURE:\n\n1. Minimize all movement; never attempt to straighten the limb.\n2. Slide a flat cardboard base or blanket gently underneath.\n3. Keep calm and reduce street traffic noise nearby.\n\nSubmit a pin so our team can assist:",
  },
  {
    keywords: ["cow bloat", "bloated cow", "choking cow", "downed cow", "cow accident", "injured cow"],
    title: "🐄 Emergency Triage: Cattle Distress & Trauma",
    isEmergency: true,
    firstAidSteps: [
      "Keep the cow upright sitting on its chest (sternal recumbency), not flat on its side, so breathing and rumen gas aren't restricted.",
      "Move onlookers and stray dogs away to prevent panic and cardiac stress.",
      "Provide shade and offer fresh water only if the animal is alert and able to swallow.",
    ],
    safetyWarnings: [
      "⚠️ Never attempt any invasive puncture or homemade drenches without a veterinarian.",
      "⚠️ Stay clear of hooves and horns when a distressed cow tries to stand.",
    ],
    response:
      "🐄 EMERGENCY FIRST-AID FOR CATTLE / COWS:\n\n1. Keep the cow propped upright on its chest if safely possible.\n2. Provide shade and clear away crowds/dogs.\n3. Keep the head clear and calm.\n\nAlert our Gaushala & rescue team immediately:",
  },
];

const GENERAL_KNOWLEDGE = [
  {
    keywords: ["adopt", "adoption", "how to adopt", "adoptable"],
    response:
      "🐾 ADOPTION AT AYUDAR:\n\n1. Browse animals ready for adoption at `/animals`.\n2. Submit the adoption inquiry form at `/adoption`.\n3. Our adoption coordinator schedules a meet-and-greet and home readiness check.\n4. Take your vaccinated & sterilized companion home.",
  },
  {
    keywords: ["donate", "donation", "money", "funds", "tax", "80g", "exempt"],
    response: `❤️ DONATING TO AYUDAR:\n\nYour contribution supports street rescue operations, veterinary medicines, daily nutrition, and sanctuary care.\n\n✅ Eligible under Section 80G (URN ${AYUDAR_LEGAL.urn80G}).\n💳 UPI, Net Banking, and Cards accepted securely via /donate.`,
  },
  {
    keywords: ["sponsor", "sponsorship", "monthly care"],
    response:
      "🌾 ANIMAL SPONSORSHIP:\n\nYou can sponsor a sanctuary resident dog, cat, or cow with Food (₹500/mo), Medical (₹1,000/mo), Care (₹1,500/mo), or Full Care (₹3,000/mo) plans at `/sponsor`.",
  },
  {
    keywords: ["volunteer", "join team", "intern", "feeding drive"],
    response:
      "🤝 BECOME A VOLUNTEER:\n\nJoin weekend feeding drives, transport support, foster care, or shelter outreach in Tilabad/Asansol, Raniganj, and Durgapur by applying at `/volunteer`.",
  },
  {
    keywords: ["gaushala", "cow care", "cattle"],
    response:
      "🐄 AYUDAR GAUSHALA:\n\nOur Gaushala provides protective shelter, fodder, and hoof/wound treatment for abandoned and roadside-injured cows and calves. Explore details at `/cow-care`.",
  },
  {
    keywords: ["location", "address", "asansol", "kumarpur", "tilabad", "raniganj", "contact", "timing", "shelter", "phone", "whatsapp", "email", "facebook", "instagram"],
    response:
      `📍 ${AYUDAR_LEGAL.name.toUpperCase()}:\n\n` +
      `Address: ${CONTACT_INFO.address}\n` +
      `Hours: ${CONTACT_INFO.hours}\n` +
      `Main Helpline & WhatsApp (${CONTACT_INFO.primaryContact.name}): ${CONTACT_INFO.emergencyPhone}\n` +
      `Members: Rohan Mishra (+91 76026 66102), Sourav (+91 91345 81378)\n` +
      `Email: ${CONTACT_INFO.email}`,
  },
];

function buildSystemPrompt(): string {
  return [
    `You are the Ayudar Emergency First-Aid & Animal Welfare Assistant for "${AYUDAR_LEGAL.name}" ("${AYUDAR_LEGAL.tagline}").`,
    `Mission: "${AYUDAR_LEGAL.mission}"`,
    `Verified Organization Details:`,
    `- Address: ${CONTACT_INFO.address}`,
    `- Service Area: Asansol, Tilabad, Kumarpur, Raniganj, Durgapur & nearby Paschim Bardhaman corridors`,
    `- Hours: ${CONTACT_INFO.hours}`,
    `- Main Helpline & WhatsApp (${CONTACT_INFO.primaryContact.name}): ${CONTACT_INFO.emergencyPhone} (${CONTACT_INFO.whatsappUrl})`,
    `- Members on Call: Rohan Mishra (+91 76026 66102), Sourav (+91 91345 81378)`,
    `- Official Email: ${CONTACT_INFO.email}`,
    `- Statutory Credentials: Reg. ${AYUDAR_LEGAL.regNo}, NITI Aayog ${AYUDAR_LEGAL.nitiAayogId}, CSR-1 ${AYUDAR_LEGAL.csrRegNo}, 80G URN ${AYUDAR_LEGAL.urn80G} (${AYUDAR_LEGAL.urn80GDate})`,
    `- Website Pages: /rescue (report injured animal with GPS & photo), /rescue/track (track report ID), /animals & /adoption (adoptable residents), /donate (80G Razorpay donations), /sponsor (monthly care), /cow-care (Gaushala), /shelter, /volunteer, /contact, /about.`,
    `Strict Clinical & Honesty Rules:`,
    `1. NEVER invent rescue counts, shelter headcounts, staff doctor names, or unverified statistics.`,
    `2. NEVER recommend human painkillers (Paracetamol, Crocin, Ibuprofen, Aspirin, Diclofenac) or specific prescription drug dosages.`,
    `3. If the user describes ANY injured, sick, bleeding, poisoned, orphaned newborn, heat-stroked, trapped, or distressed animal, set "isEmergency": true, give calm numbered immediate safety steps in "steps", clear lethal/unsafe warnings in "warnings", and urge them to call ${CONTACT_INFO.emergencyPhone} or submit /rescue.`,
    `4. Keep "reply" warm, concise, practical, and easy to read on a phone during stress.`,
    `5. Return ONLY a valid JSON object matching this exact structure:`,
    `{"reply":"string","isEmergency":boolean,"title":"string or null","steps":["string"],"warnings":["string"]}`,
  ].join("\n");
}

function normalizeLlmJson(rawText: string, provider: "openai" | "gemini"): StructuredChatPayload | null {
  try {
    const cleaned = rawText
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    if (!reply) return null;

    const isEmergency = Boolean(parsed.isEmergency);
    const title = typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : undefined;
    const steps = Array.isArray(parsed.steps)
      ? parsed.steps.filter((s): s is string => typeof s === "string" && s.trim().length > 0).slice(0, 6)
      : undefined;
    const warnings = Array.isArray(parsed.warnings)
      ? parsed.warnings.filter((w): w is string => typeof w === "string" && w.trim().length > 0).slice(0, 4)
      : undefined;

    return {
      reply: isEmergency ? `${reply}\n\n${FIRST_AID_DISCLAIMER}` : reply,
      isEmergency,
      ...(isEmergency ? { title: title || "🚨 Emergency First-Aid & Rescue Guidance" } : {}),
      ...(steps && steps.length > 0 ? { steps } : {}),
      ...(warnings && warnings.length > 0 ? { warnings } : {}),
      disclaimer: FIRST_AID_DISCLAIMER,
      ...(isEmergency
        ? {
            dispatchUrl: "/rescue",
            hotline: CONTACT_INFO.emergencyPhone,
          }
        : {}),
      provider,
    };
  } catch {
    return null;
  }
}

async function queryOpenAI(
  message: string,
  history: Array<{ sender: "user" | "bot"; text: string }>
): Promise<StructuredChatPayload | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const messages = [
    { role: "system", content: buildSystemPrompt() },
    ...history.slice(-6).map((h) => ({
      role: h.sender === "user" ? "user" : "assistant",
      content: h.text,
    })),
    { role: "user", content: message },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 550,
      response_format: { type: "json_object" },
      messages,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return normalizeLlmJson(content, "openai");
}

async function queryGemini(
  message: string,
  history: Array<{ sender: "user" | "bot"; text: string }>
): Promise<StructuredChatPayload | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const contents = [
    ...history.slice(-6).map((h) => ({
      role: h.sender === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  return normalizeLlmJson(text, "gemini");
}

function getRuleBasedResponse(message: string): StructuredChatPayload {
  const cleanMsg = message.toLowerCase().trim();

  for (const triage of EMERGENCY_TRIAGE) {
    if (triage.keywords.some((k) => cleanMsg.includes(k))) {
      return {
        reply: `${triage.response}\n\n${FIRST_AID_DISCLAIMER}`,
        isEmergency: true,
        title: triage.title,
        steps: triage.firstAidSteps,
        warnings: triage.safetyWarnings,
        disclaimer: FIRST_AID_DISCLAIMER,
        dispatchUrl: "/rescue",
        hotline: CONTACT_INFO.emergencyPhone,
        provider: "rules",
      };
    }
  }

  for (const item of GENERAL_KNOWLEDGE) {
    if (item.keywords.some((k) => cleanMsg.includes(k))) {
      return {
        reply: item.response,
        isEmergency: false,
        disclaimer: FIRST_AID_DISCLAIMER,
        provider: "rules",
      };
    }
  }

  return {
    reply:
      "I'm the Ayudar Animal Care Assistant! I can help you with:\n\n" +
      "🚨 Emergency First-Aid Triage (bleeding, fractures, heat stroke, abandoned pups)\n" +
      "🐕 Animal Adoption & Shelter Visits (Tilabad, Kumarpur, Asansol)\n" +
      "🐄 Gaushala & Sponsorship Plans (/cow-care, /sponsor)\n" +
      "❤️ 80G Tax-Exempt Donations (/donate) & Volunteering (/volunteer)\n\n" +
      `For immediate street animal emergencies, call or WhatsApp Tarasankar Nag at ${CONTACT_INFO.emergencyPhone}.`,
    isEmergency: false,
    disclaimer: FIRST_AID_DISCLAIMER,
    provider: "rules",
  };
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rate = await checkDistributedRateLimit(`ai-chat:${ip}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          reply: `Please slow down slightly — for immediate animal emergencies call ${CONTACT_INFO.emergencyPhone}.`,
          isEmergency: false,
        },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const bodyResult = await readBoundedJson(request, 24 * 1024);
    if (!bodyResult.ok) {
      return NextResponse.json({ error: bodyResult.error }, { status: bodyResult.status });
    }

    const parsed = chatMessageSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid chat message" }, { status: 400 });
    }

    const message = parsed.data.message || "";
    const history = parsed.data.history || [];

    if (!message) {
      return NextResponse.json({
        reply: "Hello! I am the Ayudar Emergency & Animal Care Assistant. How can I assist you today?",
        isEmergency: false,
        disclaimer: FIRST_AID_DISCLAIMER,
        provider: "rules",
      });
    }

    // Attempt live generative LLM response (OpenAI -> Gemini) when configured; always fail-safe to rules
    try {
      const openaiReply = await queryOpenAI(message, history);
      if (openaiReply) {
        return NextResponse.json(openaiReply);
      }

      const geminiReply = await queryGemini(message, history);
      if (geminiReply) {
        return NextResponse.json(geminiReply);
      }
    } catch (llmError) {
      console.warn("LLM provider fallback to built-in triage rules:", llmError);
    }

    return NextResponse.json(getRuleBasedResponse(message));
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      {
        reply: `Sorry, I'm having trouble connecting right now. If this is an emergency, call ${CONTACT_INFO.emergencyPhone} or open /rescue to report immediately.`,
        isEmergency: true,
        dispatchUrl: "/rescue",
        hotline: CONTACT_INFO.emergencyPhone,
      },
      { status: 500 }
    );
  }
}
