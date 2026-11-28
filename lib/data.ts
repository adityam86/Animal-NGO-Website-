export const ANIMALS = [
  {
    id: "ANM-000124",
    name: "Bruno",
    type: "Dog",
    breed: "Indian Pariah",
    gender: "Male",
    age: "~2 years",
    color: "Brown",
    location: "Raniganj",
    status: "Available for Adoption",
    image: "/images/dog_bruno.jpg",
    vaccinated: true,
    dewormed: true,
    sterilized: true,
    rescueDate: "2026-03-12",
    shelter: "Ayudar Main Shelter",
    story:
      "Bruno was found injured near a busy road in Raniganj with a deep wound on his hind leg. Rescue team arrived within 30 minutes of the report. After two weeks of medical care and love, Bruno made a full recovery and is now playful, gentle, and ready for his forever home.",
  },
  {
    id: "ANM-000118",
    name: "Mia",
    type: "Cat",
    breed: "Indian Domestic",
    gender: "Female",
    age: "~1 year",
    color: "Orange & White",
    location: "Asansol",
    status: "Available for Adoption",
    image: "/images/cat_mia.jpg",
    vaccinated: true,
    dewormed: true,
    sterilized: true,
    rescueDate: "2026-04-08",
    shelter: "Ayudar Cat Wing",
    story:
      "Mia was found abandoned in a cardboard box near a market. She was malnourished but full of spirit. She loves cuddles, window perches, and the occasional zoomies at 3 AM.",
  },
  {
    id: "ANM-000097",
    name: "Lakshmi",
    type: "Cow",
    breed: "Sahiwal",
    gender: "Female",
    age: "~4 years",
    color: "Brown & White",
    location: "Durgapur",
    status: "Sponsored",
    image: "/images/cow_lakshmi.jpg",
    vaccinated: true,
    dewormed: true,
    sterilized: false,
    rescueDate: "2025-11-22",
    shelter: "Ayudar Gaushala",
    story:
      "Lakshmi was found on a busy highway, severely malnourished and limping. She was rescued and nursed back to health at our Gaushala. She is now healthy and thriving, and has a full-time sponsor who visits her every month.",
  },
  {
    id: "ANM-000131",
    name: "Ruby",
    type: "Dog",
    breed: "Indian Pariah",
    gender: "Female",
    age: "~3 years",
    color: "Black & White",
    location: "Raniganj",
    status: "Available for Adoption",
    image: "/images/dog_ruby.jpg",
    vaccinated: true,
    dewormed: true,
    sterilized: true,
    rescueDate: "2026-05-30",
    shelter: "Ayudar Main Shelter",
    story:
      "Ruby was rescued from a construction site where she had been trapped for three days. She is calm, gentle, and gets along with other dogs and children.",
  },
];

export const RESCUE_CASES = [
  {
    id: "RES-2026-00125",
    animalType: "Cow",
    emergencyLevel: "Critical",
    location: "Raniganj Highway, near NH-19",
    reporterName: "Rahul Sharma",
    reporterPhone: "+91 98XXX XXXXX",
    assignedTeam: "Rescue Team 02",
    status: "On The Way",
    reportedAt: "2026-08-15T03:12:00Z",
    description: "Injured cow lying on the highway, vehicle collision suspected.",
    statusHistory: [
      { status: "Reported", time: "03:12 AM", done: true },
      { status: "Assigned", time: "03:18 AM", done: true },
      { status: "On The Way", time: "03:22 AM", done: true },
      { status: "Rescued", time: "", done: false },
      { status: "Treatment", time: "", done: false },
      { status: "Closed", time: "", done: false },
    ],
  },
];

export const STORIES = [
  {
    slug: "bruno-road-to-recovery",
    title: "Bruno's Road to Recovery",
    subtitle: "From a busy highway to a loving home",
    animal: "Bruno",
    animalType: "Dog",
    date: "2026-04-15",
    readTime: "3 min read",
    coverImage: "/images/rescue_story_banner.jpg",
    outcome: "Adopted ❤️",
    excerpt:
      "Found with a shattered leg on NH-19, Bruno's story is one of incredible resilience and the power of compassion. 45 days later, he ran into the arms of his forever family.",
    phases: [
      {
        phase: "Before",
        title: "A Cry in the Night",
        description:
          "A passerby spotted Bruno collapsed near NH-19 at 11 PM. He had been struck by a vehicle and couldn't move. They immediately called our emergency line.",
      },
      {
        phase: "Rescue",
        title: "Team Arrives",
        description:
          "Our rescue team arrived within 28 minutes. Bruno was carefully lifted onto a stretcher and rushed to our medical facility. He was in shock but conscious.",
      },
      {
        phase: "Treatment",
        title: "Surgery & Care",
        description:
          "Dr. Priya performed a 3-hour surgery to set Bruno's fractured leg. He needed daily wound dressing, antibiotics, and pain management for two weeks.",
      },
      {
        phase: "Recovery",
        title: "30 Days of Love",
        description:
          "Bruno spent 30 days recovering at our shelter. Volunteers spent hours each day with him. His tail began wagging again on Day 7 — we still talk about that moment.",
      },
      {
        phase: "After",
        title: "He Found His Family",
        description:
          "The Mehta family from Asansol adopted Bruno after seeing his story on our Instagram. He now sleeps on their sofa and goes on morning walks every day.",
      },
    ],
  },
  {
    slug: "lakshmi-the-highway-cow",
    title: "Lakshmi — The Highway Cow",
    subtitle: "Rescued from certain death, now thriving at our Gaushala",
    animal: "Lakshmi",
    animalType: "Cow",
    date: "2025-12-01",
    readTime: "4 min read",
    coverImage: "/images/cow_care_banner.jpg",
    outcome: "Sponsored & Thriving 🐄",
    excerpt:
      "Lakshmi was found on a busy highway — malnourished, limping, and terrified. Today she is healthy, loved, and has a dedicated sponsor who visits her every month.",
    phases: [
      {
        phase: "Before",
        title: "Lost on the Highway",
        description:
          "Lakshmi was spotted wandering on the Durgapur expressway during evening rush hour, clearly malnourished and limping badly. Multiple accidents were nearly caused.",
      },
      {
        phase: "Rescue",
        title: "Safe Passage",
        description:
          "Our team coordinated with traffic police to safely stop traffic and guide Lakshmi off the highway. The operation took 45 minutes.",
      },
      {
        phase: "Treatment",
        title: "Healing Begins",
        description:
          "Lakshmi had hoof-rot and was severely underweight. She received daily wound treatment, a nutritious diet, and vitamins for 6 weeks.",
      },
      {
        phase: "Recovery",
        title: "Gaining Strength",
        description:
          "Week by week, Lakshmi gained weight and confidence. She became comfortable with volunteers and would nuzzle anyone who brought her fresh grass.",
      },
      {
        phase: "After",
        title: "Sponsored with Love",
        description:
          "Mr. Agarwal, a businessman from Kolkata, sponsors Lakshmi's full monthly care. He visits her every month and says she recognizes him the moment he walks in.",
      },
    ],
  },
];

export const IMPACT_STATS = [
  { label: "Animals Rescued", value: 1250, suffix: "+" },
  { label: "Animals Treated", value: 980, suffix: "+" },
  { label: "Animals Adopted", value: 420, suffix: "+" },
  { label: "Volunteers", value: 86, suffix: "" },
];

export const SERVICES = [
  {
    icon: "🚨",
    title: "Emergency Rescue",
    description:
      "24/7 emergency rescue team available across Raniganj, Asansol, and Durgapur. We respond to critical cases within 30 minutes.",
  },
  {
    icon: "🏥",
    title: "Medical Care",
    description:
      "Full in-house veterinary facility with surgery, ICU, vaccination, and long-term medical management.",
  },
  {
    icon: "🏠",
    title: "Safe Shelter",
    description:
      "Spacious, clean shelter facilities housing dogs, cats, cows, and other animals — with dedicated care staff.",
  },
  {
    icon: "🍽️",
    title: "Feeding Programs",
    description:
      "Daily feeding programs for street animals in our area, covering over 200 animals every day.",
  },
  {
    icon: "❤️",
    title: "Adoption",
    description:
      "We find loving forever homes for our animals through a careful, verified adoption process.",
  },
  {
    icon: "🐄",
    title: "Cow Care (Gaushala)",
    description:
      "Dedicated Gaushala for rescued cows — full medical care, nutrition, and a safe permanent home.",
  },
];

export const DONATION_AMOUNTS = [500, 1500, 3500, 5000];
export const DONATION_IMPACT_MAP: Record<number, string> = {
  500: "Feeds 10 shelter dogs for a full day",
  1500: "Covers emergency wound dressing & antibiotics",
  3500: "Funds full vaccination, deworming & recovery care",
  5000: "Sponsors critical rescue surgery & 1 week ICU",
};
export const DONATION_PURPOSES = [
  "General Fund",
  "Animal Food",
  "Medical Treatment",
  "Cow Care",
  "Shelter",
  "Emergency Rescue",
];

export const URGENT_MEDICAL_CASES = [
  {
    id: "CASE-BRUNO-MED",
    name: "Bruno",
    species: "Dog",
    age: "~2 years",
    image: "/images/dog_bruno.jpg",
    summary: "Hit by a vehicle near NH-19; needs orthopedic follow-up & physiotherapy.",
    raisedInr: 8400,
    goalInr: 12000,
    supporters: 19,
    suggestedAmount: 1500,
    purpose: "Medical Treatment",
  },
  {
    id: "CASE-NANDINI-MED",
    name: "Nandini",
    species: "Cow",
    age: "~5 years",
    image: "/images/cow_lakshmi.jpg",
    summary: "Highway trauma & hoof infection; receiving daily antiseptic dressing & fodder.",
    raisedInr: 11200,
    goalInr: 15000,
    supporters: 27,
    suggestedAmount: 2500,
    purpose: "Cow Care",
  },
  {
    id: "CASE-MIA-MED",
    name: "Mia",
    species: "Cat",
    age: "~1 year",
    image: "/images/cat_mia.jpg",
    summary: "Malnourished kitten rescued from market; needs diagnostic bloodwork & supplements.",
    raisedInr: 4800,
    goalInr: 7500,
    supporters: 14,
    suggestedAmount: 500,
    purpose: "Medical Treatment",
  },
];

export const SHELTER_WISHLIST = [
  {
    item: "Dry Dog & Puppy Kibble (10–20 kg bags)",
    need: "High Priority",
    note: "Feeds 65+ shelter & community dogs daily",
    searchQuery: "Pedigree Drools dog food 10kg",
  },
  {
    item: "Betadine, Sterile Gauze & Cotton Rolls",
    need: "Daily Medical Need",
    note: "Used every morning for street trauma wound care",
    searchQuery: "Betadine solution sterile cotton gauze roll",
  },
  {
    item: "ORS, Glucose & Saline IV Fluids",
    need: "Heat & Shock Care",
    note: "Critical for dehydrated & heat-stroke rescues",
    searchQuery: "ORS electrolytes veterinary glucose",
  },
  {
    item: "Clean Old Blankets, Towels & Cotton Sheets",
    need: "Bedding",
    note: "Used for post-op recovery kennels & winter warmth",
    searchQuery: "pet fleece blanket shelter bedding",
  },
];

export const AYUDAR_LEGAL = {
  name: "Ayudar Animal Welfare Foundation",
  shortName: "Ayudar",
  tagline: "The voice of Animals",
  mission: "The mission of Ayudar is to bring relief to suffering animals.",
  regNo: "IV-2304-00031/2022",
  nitiAayogId: "WB/2025/0825517",
  csrRegNo: "CSR00098110",
  urn80G: "AAJTA6753HE20251",
  urn80GDate: "10-OCT-25",
  mapsUrl: "https://maps.app.goo.gl/Aug8yQi2FmTVeegx7",
};

export const NAV_LINKS = [
  { label: "Ayuda", href: "/rescue" },
  { label: "Adopt", href: "/adoption" },
  { label: "Donate", href: "/donate" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Impact", href: "/about" },
];

export const FOOTER_QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Animals", href: "/animals" },
  { label: "Impact & About", href: "/about" },
  { label: "Cow Care (Gaushala)", href: "/cow-care" },
  { label: "Our Shelter", href: "/shelter" },
  { label: "Track Rescue Case", href: "/rescue/track" },
];

export const CONTACT_INFO = {
  address: "Ayudar Shelter (Animal Hospital), PW3Q+5F, Tilabad, Kumarpur, Asansol, West Bengal 713304",
  coordinates: { lat: 23.703819, lng: 86.938713 },
  plusCode: "PW3Q+5F, Tilabad, Kumarpur, Asansol",
  phone: "+91 98765 43210",
  emergencyPhone: "+91 98000 00000",
  email: "help@jeevseva.org",
  rescueEmail: "rescue@jeevseva.org",
  hours: "Mon–Sat: 9 AM – 7 PM | Emergency: 24/7",
  mapsUrl: "https://maps.app.goo.gl/Aug8yQi2FmTVeegx7",
};
