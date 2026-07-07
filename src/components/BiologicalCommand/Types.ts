export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  targetWeight: number; // lbs or kg
  restTime: number; // seconds
  order: number;
  notes: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string; // e.g., Push, Pull, Legs
  schedule: string[]; // e.g., ["Monday", "Wednesday"]
  warmup: string;
  cooldown: string;
  exercises?: Exercise[]; // legacy backup
  sections: MuscleGroupSection[];
}

export interface MuscleGroupSection {
  id: string;
  name: string; // e.g., "Upper Body", "Lower Body", "Arms", "Core", "Cardio"
  exercises: Exercise[];
}

export interface DailyWorkout {
  date: string;
  templateId: string;
  sections: MuscleGroupSection[]; // Custom copy for this specific day to allow changes to carry forward/stay isolated
  completedSets: Record<string, number>; // exerciseId -> completed sets
  isCompleted: boolean;
}

export interface RecoveryActivity {
  id: string;
  name: string;
  isCompleted: boolean;
}

export interface RecoveryHydrationState {
  dailyWaterGoal: number; // ml
  waterIntake: number; // ml
  bottleSize: number; // ml
  sleepTarget: number; // hours
  bedtimeGoal: string; // HH:mm
  wakeupGoal: string; // HH:mm
  sleepDuration: number; // hours
  sleepQuality: number; // 1-10
  recoveryScore: number; // 1-100
  activities: RecoveryActivity[];
}

export interface Challenge {
  id: string;
  name: string;
  goalType: 'daily' | 'weekly' | 'monthly';
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  icon: string;
  color: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
}
