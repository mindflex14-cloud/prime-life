import { Goal, Milestone, Task, Habit, JournalEntry, FinancialRecord, HealthLog, LearningNote, LifeWheel, UserProfile, VisionCard } from './types';

export const DAILY_QUOTES = [
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { text: "Do not wait; the time will never be 'just right.' Start where you stand.", author: "Napoleon Hill" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
  { text: "Consistency is the playground of the dull, but the training ground of the elite.", author: "Unknown" },
  { text: "It's not what we do once in a while that shapes our lives. It's what we do consistently.", author: "Tony Robbins" }
];

export const DEFAULT_PROFILE: UserProfile = {
  name: "Elite Builder",
  dailyQuoteIndex: 1
};

export const DEFAULT_GOALS: Goal[] = [
  {
    id: "g-1",
    title: "BUY 20-25 CR HOUSE",
    category: "Finance",
    targetDate: "2030-12-31",
    description: "Acquire a world-class luxury residence valued at 20-25 Crores, serving as a family sanctuary and monument of capital growth.",
    completed: false,
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "g-2",
    title: "NETWORTH 8000 CR",
    category: "Finance",
    targetDate: "2036-12-31",
    description: "Amass a highly diversified private equity, enterprise, and liquid asset portfolio valued at 8,000 Crores.",
    completed: false,
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "g-3",
    title: "EXPAND MY AFRICAN BUSINESS",
    category: "Career",
    targetDate: "2028-06-30",
    description: "Scale operations across Sub-Saharan and North African business sectors, establishing dominant market share.",
    completed: false,
    imageUrl: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "g-4",
    title: "HEALTHY BODY",
    category: "Health",
    targetDate: "2026-12-31",
    description: "Cultivate an exceptional biological profile with peak physical fitness, low inflammation, strength, and vibrant daily energy.",
    completed: false,
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80"
  }
];

export const DEFAULT_MILESTONES: Milestone[] = [
  // Buy House
  { id: "m-1-1", goalId: "g-1", title: "Finalize locations and architectural designs in elite zones", targetDate: "2027-06-30", completed: true },
  { id: "m-1-2", goalId: "g-1", title: "Set aside ₹5 Cr liquid real estate development capital", targetDate: "2028-12-31", completed: false },
  
  // Networth 8000 Cr
  { id: "m-2-1", goalId: "g-2", title: "Establish a robust holding entity structure and audit system", targetDate: "2026-12-31", completed: true },
  { id: "m-2-2", goalId: "g-2", title: "Scale core business annual cash reserves yield to ₹150 Cr", targetDate: "2028-12-31", completed: false },

  // African Business
  { id: "m-3-1", goalId: "g-3", title: "Establish strategic operations in East and West Africa hubs", targetDate: "2026-12-31", completed: true },
  { id: "m-3-2", goalId: "g-3", title: "Secure local regulatory clearances and joint-venture contracts", targetDate: "2027-06-30", completed: false },

  // Healthy Body
  { id: "m-4-1", goalId: "g-4", title: "Undergo full executive health screening and biomarker test", targetDate: "2026-07-31", completed: true },
  { id: "m-4-2", goalId: "g-4", title: "Hit 12% body fat with peak endurance and high muscle index", targetDate: "2026-10-31", completed: false }
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: "t-1",
    title: "Analyze architectural floor plans of modern premier villas",
    goalId: "g-1",
    milestoneId: "m-1-1",
    date: "2026-07-02",
    time: "09:00",
    priority: "high",
    status: "completed",
    pomodorosEstimated: 3,
    pomodorosCompleted: 3
  },
  {
    id: "t-2",
    title: "Review business expansion proposals for Lagos & Nairobi hubs",
    goalId: "g-3",
    milestoneId: "m-3-2",
    date: "2026-07-02",
    time: "11:30",
    priority: "high",
    status: "in_progress",
    pomodorosEstimated: 4,
    pomodorosCompleted: 1
  },
  {
    id: "t-3",
    title: "Engage in a 60-minute peak cardio performance session (Zone 2)",
    goalId: "g-4",
    milestoneId: "m-4-2",
    date: "2026-07-02",
    time: "17:00",
    priority: "high",
    status: "todo",
    pomodorosEstimated: 2,
    pomodorosCompleted: 0
  },
  {
    id: "t-4",
    title: "Audit monthly compounding investment assets and cash yields",
    goalId: "g-2",
    milestoneId: "m-2-1",
    date: "2026-07-01",
    time: "14:00",
    priority: "medium",
    status: "completed",
    pomodorosEstimated: 4,
    pomodorosCompleted: 4
  }
];

export const DEFAULT_VISION_CARDS: VisionCard[] = [
  {
    id: "v-1",
    title: "THE ₹20-25 CR SANCTUARY",
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    category: "Real Estate",
    targetDate: "2030-12-31",
    instructions: "Visualize walking through the floor-to-ceiling glass doors of your luxury sanctuary. This residence is a reflection of premium focus, compounding execution, and family legacy. Review architectural maps monthly and keep your design standards exceptionally high.",
    goalId: "g-1"
  },
  {
    id: "v-2",
    title: "THE ₹8,000 CR NET WORTH LEGACY",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    category: "Wealth Architecture",
    targetDate: "2036-12-31",
    instructions: "8,000 Crores is built on grand vision, high-leverage business decisions, and elite risk management. Make investment allocations with absolute analytical clarity. Never chase noise. Build an empire that empowers millions and secures multigenerational freedom.",
    goalId: "g-2"
  },
  {
    id: "v-3",
    title: "AFRICAN BUSINESS EXPANSION",
    imageUrl: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80",
    category: "Enterprise Scale",
    targetDate: "2028-06-30",
    instructions: "Establish dominant market share in Nairobi, Johannesburg, and Lagos. Cultivate relationships with high-caliber local operating partners. Standardize logistics and streamline digital operations. Expand with speed, caution, and absolute structural precision.",
    goalId: "g-3"
  },
  {
    id: "v-4",
    title: "THE ULTIMATE BIOLOGICAL MACHINE",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    category: "Peak Vitality",
    targetDate: "2026-12-31",
    instructions: "A healthy body is the vessel for all executive energy and high-performance thinking. Maintain elite metrics: heart rate variability high, clean diet, daily hydration, and lifting weights/HIIT. Respect your sleep cycles as sacred. Your health is your ultimate foundation.",
    goalId: "g-4"
  }
];


export const DEFAULT_HABITS: Habit[] = [
  {
    id: "h-1",
    title: "Diaphragmatic Breathing / Zen Meditation",
    streak: 8,
    lastCompleted: "2026-07-02",
    history: {
      "2026-06-28": true,
      "2026-06-29": true,
      "2026-06-30": true,
      "2026-07-01": true,
      "2026-07-02": true
    }
  },
  {
    id: "h-2",
    title: "Slight Hydration / 3L Clean Water",
    streak: 4,
    lastCompleted: "2026-07-02",
    history: {
      "2026-06-28": false,
      "2026-06-29": true,
      "2026-06-30": true,
      "2026-07-01": true,
      "2026-07-02": true
    }
  },
  {
    id: "h-3",
    title: "Daily Coding & Architecture Challenge",
    streak: 15,
    lastCompleted: "2026-07-01",
    history: {
      "2026-06-28": true,
      "2026-06-29": true,
      "2026-06-30": true,
      "2026-07-01": true,
      "2026-07-02": false
    }
  },
  {
    id: "h-4",
    title: "Technical Reading or Audio Book (15 mins)",
    streak: 2,
    lastCompleted: "2026-07-01",
    history: {
      "2026-06-28": true,
      "2026-06-29": false,
      "2026-06-30": false,
      "2026-07-01": true,
      "2026-07-02": false
    }
  }
];

export const DEFAULT_JOURNAL: Record<string, JournalEntry> = {
  "2026-07-01": {
    date: "2026-07-01",
    mood: "great",
    gratitude: [
      "Grateful for clean running paths and crisp early morning air.",
      "Incredible support from peers on open source project.",
      "The privilege of building and designing complex web tools."
    ],
    eveningReview: "Today was exceptional. Completed deep architecture audits and exceeded core metrics. Recharged with a serene visual run.",
    notes: "Felt high levels of natural flow today. Remember to sustain breaks using Pomodoro."
  }
};

export const DEFAULT_FINANCE: FinancialRecord[] = [
  { id: "f-1", date: "2026-07-01", type: "income", category: "Freelance", amount: 1500, description: "Frontend contract payout" },
  { id: "f-2", date: "2026-07-01", type: "expense", category: "Hardware", amount: 180, description: "Ergonomic vertical keyboard" },
  { id: "f-3", date: "2026-07-02", type: "expense", category: "Subscriptions", amount: 20, description: "AI coding platform subscription" },
  { id: "f-4", date: "2026-07-02", type: "income", category: "SaaS Dev Payout", amount: 350, description: "Consulting fees" },
  { id: "f-5", date: "2026-07-02", type: "expense", category: "Dining Out", amount: 45, description: "Dinner with fellow builders" }
];

export const DEFAULT_HEALTH: Record<string, HealthLog> = {
  "2026-07-01": { date: "2026-07-01", steps: 11400, waterIntake: 2500, sleepHours: 7.5, energyLevel: 4 },
  "2026-07-02": { date: "2026-07-02", steps: 5200, waterIntake: 1250, sleepHours: 8.0, energyLevel: 5 }
};

export const DEFAULT_LEARNING: LearningNote[] = [
  {
    id: "ln-1",
    title: "Rust Memory Management & Ownership Rules",
    category: "System Programming",
    content: "Understanding standard borrow checking rules: 1 mutable borrow OR many immutable borrows at any time. Keeps code highly secure without heavy memory runtime garbage collection.",
    tags: ["Rust", "Systems", "Memory"],
    dateCreated: "2026-07-01"
  },
  {
    id: "ln-2",
    title: "Designing Glassmorphism Blur Radii & Highlights",
    category: "Design",
    content: "To create the perfect elegant glass card: use a dark semi-transparent fill (`bg-slate-900/45`), apply `backdrop-blur-md` or higher, and add a sharp, thin, low-opacity white outline (`border border-white/10`). Add a neon drop shadow to highlight focal points.",
    tags: ["UIUX", "Tailwind", "CSS"],
    dateCreated: "2026-07-02"
  }
];

export const DEFAULT_LIFE_WHEEL: LifeWheel = {
  career: 7,
  finance: 6,
  health: 8,
  relationships: 8,
  personalGrowth: 9,
  fun: 5,
  environment: 7,
  spirituality: 6
};
