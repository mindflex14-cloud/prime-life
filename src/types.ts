export interface Goal {
  id: string;
  title: string;
  category: string;
  targetDate: string;
  description: string;
  completed: boolean;
  imageUrl?: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  targetDate: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  goalId?: string;
  milestoneId?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  pomodorosEstimated: number;
  pomodorosCompleted: number;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  lastCompleted?: string; // YYYY-MM-DD
  history: Record<string, boolean>; // YYYY-MM-DD -> completed
}

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  mood: 'great' | 'good' | 'meh' | 'low';
  gratitude: string[];
  eveningReview: string;
  notes: string;
}

export interface FinancialRecord {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
}

export interface HealthLog {
  date: string; // YYYY-MM-DD
  steps: number;
  waterIntake: number; // ml
  sleepHours: number;
  energyLevel: number; // 1-5 (legacy) or 1-10 (new)
  stressLevel?: number; // 1-5
  hydrationCups?: number; // cups
  deepWorkHours?: number; // deep work hours
  executionRank?: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'; // execution rank
  nutritionRating?: 'Clean' | 'Moderate' | 'Poor'; // nutrition rating
}

export interface LearningNote {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  dateCreated: string;
}

export interface LifeWheel {
  career: number; // 1-10
  finance: number;
  health: number;
  relationships: number;
  personalGrowth: number;
  fun: number;
  environment: number;
  spirituality: number;
}

export interface UserProfile {
  name: string;
  avatarUrl?: string;
  dailyQuoteIndex: number;
}

export interface VisionCard {
  id: string;
  title: string;
  imageUrl: string;
  instructions: string; // Editable instructions to self
  category: string;
  targetDate?: string;
  goalId?: string;
}

export interface PhilosophicalEntry {
  id: string;
  title: string;
  reflection: string;
  timestamp: string;
  date: string;
  linkedDate?: string;
}

export interface BookWisdomEntry {
  id: string;
  title: string;
  author: string;
  summary: string;
  learnings: string[];
  date: string;
  linkedDate?: string;
}

export interface IntuitionEntry {
  id: string;
  decision: string;
  reasoning: string;
  outcome: string;
  date: string;
  linkedDate?: string;
  status: 'pending' | 'resolved';
}
