import { supabase, isSupabaseConfigured } from '../supabase';

// Google Sign-In helper using Supabase
export async function signInWithGoogle() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured yet. Please add your credentials in Settings.");
  }
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.hostname.includes('github.io')
          ? window.location.origin + '/prime-life/' 
          : window.location.origin
      }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Supabase Google Sign-In Error:", error);
    throw error;
  }
}

// Sign-Out helper
export async function signOutUser() {
  if (!supabase) return;
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Sign-Out Error:", error);
    throw error;
  }
}

// Get the pending sync queue from localStorage
function getPendingSyncQueue(): string[] {
  const saved = localStorage.getItem('lifeos_pending_syncs');
  return saved ? JSON.parse(saved) : [];
}

// Save the pending sync queue to localStorage
function savePendingSyncQueue(queue: string[]) {
  localStorage.setItem('lifeos_pending_syncs', JSON.stringify(Array.from(new Set(queue))));
}

// Add a key to the pending sync queue
function addToPendingQueue(key: string) {
  const queue = getPendingSyncQueue();
  queue.push(key);
  savePendingSyncQueue(queue);
}

// Remove a key from the pending sync queue
function removeFromPendingQueue(key: string) {
  const queue = getPendingSyncQueue();
  const filtered = queue.filter(k => k !== key);
  savePendingSyncQueue(filtered);
}

// Map logical payload keys to localStorage key names
const keyToLocalStorageMap: Record<string, string> = {
  profile: 'lifeos_profile',
  visionCards: 'lifeos_vision_cards',
  goals: 'lifeos_goals',
  milestones: 'lifeos_milestones',
  tasks: 'lifeos_tasks',
  habits: 'lifeos_habits',
  journalEntries: 'lifeos_journals',
  financeRecords: 'lifeos_finance',
  healthLogs: 'lifeos_health',
  lifeWheel: 'lifeos_lifewheel',
  philosophicalEntries: 'lifeos_philosophical',
  bookWisdomEntries: 'lifeos_book_wisdom',
  intuitionEntries: 'lifeos_intuition',
  powerSystem: 'lifeos_power_system',
  exerciseRules: 'lifeos_exercise_rules',
  newMeSections: 'lifeos_newme_sections',
  newMeDataDrop: 'lifeos_newme_datadrop',
  newMeInterventions: 'lifeos_newme_interventions',
  businessIdeas: 'lifeos_business_ideas',
  earthCountdownTarget: 'lifeos_earth_target',
  earthCountdownTitle: 'lifeos_earth_title',
  earthCountdownImage: 'lifeos_earth_image',
  earthCountdownQuote: 'lifeos_earth_quote',
  darkMode: 'lifeos_dark_mode',
  navItems: 'lifeos_nav_items_v3',
  vitalsWorkoutTemplates: 'lifeos_vitals_workout_templates',
  vitalsWorkoutHistory: 'lifeos_vitals_workout_history',
  vitalsRecoveryHistory: 'lifeos_vitals_recovery_history',
  vitalsChallenges: 'lifeos_vitals_challenges',
  vitalsGamification: 'lifeos_vitals_gamification'
};

const debounceTimeouts: Record<string, any> = {};

// Save a specific key's data to Supabase (and cache locally)
export async function saveUserDataToCloud(userId: string, key: string, data: any, immediate: boolean = false) {
  if (!userId) return;

  // Always write locally first to guarantee high performance and offline-first availability
  const localStorageKey = keyToLocalStorageMap[key];
  if (localStorageKey) {
    try {
      const serialized = typeof data === 'string' ? data : JSON.stringify(data);
      localStorage.setItem(localStorageKey, serialized);
    } catch (e) {
      console.warn(`[SupabaseSync] Failed to save ${key} to localStorage (QuotaExceeded). Will rely on cloud sync.`);
    }
  }

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  // Clear any existing timeout for this key to debounce high-frequency updates (e.g. typing)
  if (debounceTimeouts[key]) {
    clearTimeout(debounceTimeouts[key]);
  }

  const performSave = async () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('supabase-sync-status', { detail: 'saving' }));
    }
    try {
      // Attempt upsert to Supabase
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          key: key,
          payload: data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,key'
        });

      if (error) {
        throw error;
      }

      // Successfully saved! Remove from pending queue
      removeFromPendingQueue(key);
      
      // Broadcast local storage update event for any listening tabs
      window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: localStorageKey, value: data } }));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('supabase-sync-status', { detail: 'saved' }));
      }
    } catch (error) {
      console.warn(`[SupabaseSync] Offline/failed saving ${key} to Supabase. Storing in queue.`, error);
      addToPendingQueue(key);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('supabase-sync-status', { detail: 'failed' }));
      }
    } finally {
      delete debounceTimeouts[key];
    }
  };

  if (immediate) {
    await performSave();
  } else {
    return new Promise<void>((resolve) => {
      debounceTimeouts[key] = setTimeout(async () => {
        await performSave();
        resolve();
      }, 1500); // Debounce delay of 1.5 seconds
    });
  }
}

// Load all user data from Supabase
export async function loadAllUserDataFromCloud(userId: string): Promise<Record<string, any>> {
  const result: Record<string, any> = {};
  if (!userId || !isSupabaseConfigured || !supabase) return result;
  
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('key, payload')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    if (data) {
      data.forEach((row) => {
        result[row.key] = row.payload;
      });
    }
  } catch (error) {
    console.error("Error loading user data from Supabase:", error);
  }
  return result;
}

// Subscribe to real-time changes on the user's data subcollection
export function subscribeToUserDataCloud(
  userId: string, 
  onUpdate: (key: string, data: any) => void
) {
  if (!userId || !isSupabaseConfigured || !supabase) return () => {};

  // Subscribe to postgres_changes channel for the user's data rows
  const channel = supabase
    .channel(`user-data-sync:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_data',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const { key, payload: data } = payload.new;
          if (data !== undefined) {
            onUpdate(key, data);
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Synchronize all pending offline changes to Supabase
export async function syncPendingData(userId: string) {
  if (!userId || !isSupabaseConfigured || !supabase || !navigator.onLine) return;

  const queue = getPendingSyncQueue();
  if (queue.length === 0) return;

  console.log(`[SupabaseSync] Syncing ${queue.length} pending offline items to cloud...`);

  // Process item by item
  for (const key of [...queue]) {
    const localStorageKey = keyToLocalStorageMap[key];
    if (!localStorageKey) continue;

    const localValStr = localStorage.getItem(localStorageKey);
    if (localValStr === null) continue;

    let payload: any;
    try {
      payload = JSON.parse(localValStr);
    } catch {
      payload = localValStr; // Use raw string if it isn't JSON
    }

    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          key: key,
          payload: payload,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,key'
        });

      if (!error) {
        removeFromPendingQueue(key);
      }
    } catch (err) {
      console.error(`[SupabaseSync] Re-sync failed for ${key}:`, err);
    }
  }
}

// Hook up automatic onLine listener to sync when connection is restored
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    // We will sync when the user auth becomes available, handled inside App.tsx
    window.dispatchEvent(new CustomEvent('supabase-sync-trigger'));
  });
}
