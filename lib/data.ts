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

export const DONATION_AMOUNTS = [100, 500, 1000, 2500, 5000];
export const DONATION_PURPOSES = [
  "General Fund",
  "Animal Food",
  "Medical Treatment",
  "Cow Care",
  "Shelter",
  "Emergency Rescue",
];

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Animals", href: "/animals" },
  { label: "Rescue", href: "/rescue" },
  { label: "Adoption", href: "/adoption" },
  { label: "Cow Care", href: "/cow-care" },
  { label: "Shelter", href: "/shelter" },
  { label: "Stories", href: "/stories" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Donate", href: "/donate" },
  { label: "Contact", href: "/contact" },
];

export const CONTACT_INFO = {
  address: "123, Civil Lines, Raniganj, West Bengal — 713347",
  phone: "+91 98765 43210",
  emergencyPhone: "+91 98000 00000",
  email: "help@jeevseva.org",
  rescueEmail: "rescue@jeevseva.org",
  hours: "Mon–Sat: 9 AM – 7 PM | Emergency: 24/7",
};
