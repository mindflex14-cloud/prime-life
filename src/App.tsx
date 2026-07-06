import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Target, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Settings as SettingsIcon,
  Sparkles,
  Menu,
  X,
  Compass,
  Flame,
  Sun,
  Moon,
  Activity,
  Briefcase
} from 'lucide-react';

import { Goal, Milestone, Task, Habit, JournalEntry, FinancialRecord, HealthLog, LifeWheel, UserProfile, VisionCard, PhilosophicalEntry, BookWisdomEntry, IntuitionEntry } from './types';
import { 
  DEFAULT_PROFILE, 
  DEFAULT_GOALS, 
  DEFAULT_MILESTONES, 
  DEFAULT_TASKS, 
  DEFAULT_HABITS, 
  DEFAULT_JOURNAL, 
  DEFAULT_FINANCE, 
  DEFAULT_HEALTH, 
  DEFAULT_LIFE_WHEEL,
  DEFAULT_VISION_CARDS
} from './data';

import Dashboard from './components/Dashboard';
import GoalsAndMilestones from './components/GoalsAndMilestones';
import ProductivityHub from './components/ProductivityHub';
import LogsAndBrain from './components/LogsAndBrain';
import VitalsManager from './components/VitalsManager';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import VisualizationView from './components/VisualizationView';
import NewMeView from './components/NewMeView';
import BusinessIdeasView from './components/BusinessIdeasView';
import { supabase, isSupabaseConfigured } from './supabase';
import { 
  signInWithGoogle, 
  signOutUser, 
  saveUserDataToCloud, 
  loadAllUserDataFromCloud, 
  subscribeToUserDataCloud,
  syncPendingData
} from './lib/supabaseSync';
import { User } from '@supabase/supabase-js';
import { Cloud, CloudLightning, LogOut } from 'lucide-react';
import LoginView from './components/LoginView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [guestBypass, setGuestBypass] = useState<boolean>(() => localStorage.getItem('lifeos_guest_bypass') === 'true');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isSyncDelayed, setIsSyncDelayed] = useState<boolean>(false);
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lifeos_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('lifeos_dark_mode', String(isDarkMode));
    if (user) {
      saveUserDataToCloud(user.id, 'darkMode', isDarkMode);
    }
    const root = document.getElementById('lifeos-application-root');
    if (root) {
      if (isDarkMode) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [isDarkMode, user]);

  // --- STATE HOOKS INITIALIZED FROM LOCAL STORAGE OR DEFAULTS ---
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lifeos_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('lifeos_goals');
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('lifeos_milestones');
    return saved ? JSON.parse(saved) : DEFAULT_MILESTONES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('lifeos_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('lifeos_habits');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });

  const [journalEntries, setJournalEntries] = useState<Record<string, JournalEntry>>(() => {
    const saved = localStorage.getItem('lifeos_journals');
    return saved ? JSON.parse(saved) : DEFAULT_JOURNAL;
  });

  const [financeRecords, setFinanceRecords] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('lifeos_finance');
    return saved ? JSON.parse(saved) : DEFAULT_FINANCE;
  });

  const [healthLogs, setHealthLogs] = useState<Record<string, HealthLog>>(() => {
    const saved = localStorage.getItem('lifeos_health');
    return saved ? JSON.parse(saved) : DEFAULT_HEALTH;
  });

  const [lifeWheel, setLifeWheel] = useState<LifeWheel>(() => {
    const saved = localStorage.getItem('lifeos_lifewheel');
    return saved ? JSON.parse(saved) : DEFAULT_LIFE_WHEEL;
  });

  const [visionCards, setVisionCards] = useState<VisionCard[]>(() => {
    const saved = localStorage.getItem('lifeos_vision_cards');
    return saved ? JSON.parse(saved) : DEFAULT_VISION_CARDS;
  });

  const [philosophicalEntries, setPhilosophicalEntries] = useState<PhilosophicalEntry[]>(() => {
    const saved = localStorage.getItem('lifeos_philosophical');
    return saved ? JSON.parse(saved) : [
      {
        id: 'p-1',
        title: 'The Obstacle is the Way',
        reflection: 'The mind adapts and converts to its own purposes the obstacle to our acting. What stands in the way becomes the way. Every setback in our projects is an opportunity to practice virtue and find a new creative pathway.',
        timestamp: '2026-07-03T14:12:00-07:00',
        date: '2026-07-03',
        linkedDate: '2026-07-03'
      }
    ];
  });

  const [bookWisdomEntries, setBookWisdomEntries] = useState<BookWisdomEntry[]>(() => {
    const saved = localStorage.getItem('lifeos_book_wisdom');
    return saved ? JSON.parse(saved) : [
      {
        id: 'b-1',
        title: 'Atomic Habits',
        author: 'James Clear',
        summary: 'A fundamental framework for building life-changing habits through micro-habits, focusing on 1% marginal gains every day. Clear proves that our systems, not our goals, determine our ultimate trajectories.',
        learnings: [
          'You do not rise to the level of your goals. You fall to the level of your systems.',
          'To build a strong habit, make it Obvious, Attractive, Easy, and Satisfying.',
          'Focus on who you wish to become (identity-based habits) rather than what you want to achieve.'
        ],
        date: '2026-07-03',
        linkedDate: '2026-07-03'
      }
    ];
  });

  const [intuitionEntries, setIntuitionEntries] = useState<IntuitionEntry[]>(() => {
    const saved = localStorage.getItem('lifeos_intuition');
    return saved ? JSON.parse(saved) : [
      {
        id: 'i-1',
        decision: 'Declined high-yield speculative investment proposal',
        reasoning: 'The spreadsheet returns were highly attractive, but my internal gut felt uneasy during the partner presentation. There was a subtle lack of transparency and misalignment on ethical integrity. Decided to keep capital and cognitive focus unified on core software assets.',
        outcome: 'The venture experienced significant operational disruptions 3 months later due to compliance issues. My gut intuition was highly accurate; this decision preserved capital and saved hundreds of hours of executive distress.',
        date: '2026-07-03',
        linkedDate: '2026-07-03',
        status: 'resolved'
      }
    ];
  });

  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);

  // --- SUPABASE AUTH AND REAL-TIME SYNC ---
  useEffect(() => {
    if (!supabase) {
      setIsInitialLoading(false);
      return;
    }

    let isFinished = false;
    let unsubscribeSnapshot: (() => void) | null = null;
    let syncTriggerListener: (() => void) | null = null;

    const timeoutId = setTimeout(() => {
      if (!isFinished) {
        console.warn("[Sync Timeout] Supabase initial load exceeded timeout threshold. Falling back to offline data caches.");
        setIsInitialLoading(false);
        setIsSyncDelayed(true);
      }
    }, 8500);

    // Retrieve initial session and set user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    }).catch(err => {
      console.error("[Auth] getSession error:", err);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const sUser = session?.user || null;
      setUser(sUser);

      // Clean up previous user snapshot subscription and listener if user changed
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
      if (syncTriggerListener) {
        window.removeEventListener('supabase-sync-trigger', syncTriggerListener);
        syncTriggerListener = null;
      }

      if (sUser) {
        setIsSyncing(true);
        try {
          // Sync any pending offline changes
          await syncPendingData(sUser.id);

          const cloudData = await loadAllUserDataFromCloud(sUser.id);
          
          if (Object.keys(cloudData).length === 0) {
            // Seed cloud data with current local state
            const seedPromises = [
              saveUserDataToCloud(sUser.id, 'profile', profile, true),
              saveUserDataToCloud(sUser.id, 'visionCards', visionCards, true),
              saveUserDataToCloud(sUser.id, 'goals', goals, true),
              saveUserDataToCloud(sUser.id, 'milestones', milestones, true),
              saveUserDataToCloud(sUser.id, 'tasks', tasks, true),
              saveUserDataToCloud(sUser.id, 'habits', habits, true),
              saveUserDataToCloud(sUser.id, 'journalEntries', journalEntries, true),
              saveUserDataToCloud(sUser.id, 'financeRecords', financeRecords, true),
              saveUserDataToCloud(sUser.id, 'healthLogs', healthLogs, true),
              saveUserDataToCloud(sUser.id, 'lifeWheel', lifeWheel, true),
              saveUserDataToCloud(sUser.id, 'philosophicalEntries', philosophicalEntries, true),
              saveUserDataToCloud(sUser.id, 'bookWisdomEntries', bookWisdomEntries, true),
              saveUserDataToCloud(sUser.id, 'intuitionEntries', intuitionEntries, true),
            ];
            
            const savedPower = localStorage.getItem('lifeos_power_system');
            if (savedPower) seedPromises.push(saveUserDataToCloud(sUser.id, 'powerSystem', JSON.parse(savedPower), true));
            const savedRules = localStorage.getItem('lifeos_exercise_rules');
            if (savedRules) seedPromises.push(saveUserDataToCloud(sUser.id, 'exerciseRules', JSON.parse(savedRules), true));
            const savedSecs = localStorage.getItem('lifeos_newme_sections');
            if (savedSecs) seedPromises.push(saveUserDataToCloud(sUser.id, 'newMeSections', JSON.parse(savedSecs), true));
            const savedDrop = localStorage.getItem('lifeos_newme_datadrop');
            if (savedDrop) seedPromises.push(saveUserDataToCloud(sUser.id, 'newMeDataDrop', savedDrop, true));
            const savedInts = localStorage.getItem('lifeos_newme_interventions');
            if (savedInts) seedPromises.push(saveUserDataToCloud(sUser.id, 'newMeInterventions', JSON.parse(savedInts), true));

            const savedEarthTarget = localStorage.getItem('lifeos_earth_target');
            if (savedEarthTarget) seedPromises.push(saveUserDataToCloud(sUser.id, 'earthCountdownTarget', savedEarthTarget, true));
            const savedEarthTitle = localStorage.getItem('lifeos_earth_title');
            if (savedEarthTitle) seedPromises.push(saveUserDataToCloud(sUser.id, 'earthCountdownTitle', savedEarthTitle, true));
            const savedEarthImage = localStorage.getItem('lifeos_earth_image');
            if (savedEarthImage) seedPromises.push(saveUserDataToCloud(sUser.id, 'earthCountdownImage', savedEarthImage, true));
            const savedEarthQuote = localStorage.getItem('lifeos_earth_quote');
            if (savedEarthQuote) seedPromises.push(saveUserDataToCloud(sUser.id, 'earthCountdownQuote', savedEarthQuote, true));

            const savedBusinessIdeas = localStorage.getItem('lifeos_business_ideas');
            if (savedBusinessIdeas) seedPromises.push(saveUserDataToCloud(sUser.id, 'businessIdeas', JSON.parse(savedBusinessIdeas), true));
            const savedDarkMode = localStorage.getItem('lifeos_dark_mode');
            if (savedDarkMode) seedPromises.push(saveUserDataToCloud(sUser.id, 'darkMode', savedDarkMode === 'true', true));
            const savedNavItems = localStorage.getItem('lifeos_nav_items_v3');
            if (savedNavItems) seedPromises.push(saveUserDataToCloud(sUser.id, 'navItems', JSON.parse(savedNavItems), true));

            try {
              await Promise.all(seedPromises);
            } catch (seedErr) {
              console.error("[Seeding] Error seeding user data to cloud:", seedErr);
            }
          } else {
            // Apply downloaded cloud data to states if different
            if (cloudData.profile && JSON.stringify(cloudData.profile) !== JSON.stringify(profile)) {
              setProfile(cloudData.profile);
            }
            if (cloudData.visionCards && JSON.stringify(cloudData.visionCards) !== JSON.stringify(visionCards)) {
              setVisionCards(cloudData.visionCards);
            }
            if (cloudData.goals && JSON.stringify(cloudData.goals) !== JSON.stringify(goals)) {
              setGoals(cloudData.goals);
            }
            if (cloudData.milestones && JSON.stringify(cloudData.milestones) !== JSON.stringify(milestones)) {
              setMilestones(cloudData.milestones);
            }
            if (cloudData.tasks && JSON.stringify(cloudData.tasks) !== JSON.stringify(tasks)) {
              setTasks(cloudData.tasks);
            }
            if (cloudData.habits && JSON.stringify(cloudData.habits) !== JSON.stringify(habits)) {
              setHabits(cloudData.habits);
            }
            if (cloudData.journalEntries && JSON.stringify(cloudData.journalEntries) !== JSON.stringify(journalEntries)) {
              setJournalEntries(cloudData.journalEntries);
            }
            if (cloudData.financeRecords && JSON.stringify(cloudData.financeRecords) !== JSON.stringify(financeRecords)) {
              setFinanceRecords(cloudData.financeRecords);
            }
            if (cloudData.healthLogs && JSON.stringify(cloudData.healthLogs) !== JSON.stringify(healthLogs)) {
              setHealthLogs(cloudData.healthLogs);
            }
            if (cloudData.lifeWheel && JSON.stringify(cloudData.lifeWheel) !== JSON.stringify(lifeWheel)) {
              setLifeWheel(cloudData.lifeWheel);
            }
            if (cloudData.philosophicalEntries && JSON.stringify(cloudData.philosophicalEntries) !== JSON.stringify(philosophicalEntries)) {
              setPhilosophicalEntries(cloudData.philosophicalEntries);
            }
            if (cloudData.bookWisdomEntries && JSON.stringify(cloudData.bookWisdomEntries) !== JSON.stringify(bookWisdomEntries)) {
              setBookWisdomEntries(cloudData.bookWisdomEntries);
            }
            if (cloudData.intuitionEntries && JSON.stringify(cloudData.intuitionEntries) !== JSON.stringify(intuitionEntries)) {
              setIntuitionEntries(cloudData.intuitionEntries);
            }
            if (cloudData.darkMode !== undefined && cloudData.darkMode !== isDarkMode) {
              setIsDarkMode(cloudData.darkMode);
            }
            if (cloudData.navItems && JSON.stringify(cloudData.navItems) !== JSON.stringify(navItems)) {
              setNavItems(cloudData.navItems);
            }
            
            // Sync extra component local keys
            const extraKeys = [
              'powerSystem', 
              'exerciseRules', 
              'newMeSections', 
              'newMeDataDrop', 
              'newMeInterventions',
              'earthCountdownTarget',
              'earthCountdownTitle',
              'earthCountdownImage',
              'earthCountdownQuote',
              'businessIdeas'
            ];
            const localStorageKeysMap: Record<string, string> = {
              powerSystem: 'lifeos_power_system',
              exerciseRules: 'lifeos_exercise_rules',
              newMeSections: 'lifeos_newme_sections',
              newMeDataDrop: 'lifeos_newme_datadrop',
              newMeInterventions: 'lifeos_newme_interventions',
              earthCountdownTarget: 'lifeos_earth_target',
              earthCountdownTitle: 'lifeos_earth_title',
              earthCountdownImage: 'lifeos_earth_image',
              earthCountdownQuote: 'lifeos_earth_quote',
              businessIdeas: 'lifeos_business_ideas'
            };
            
            extraKeys.forEach((key) => {
              if (cloudData[key] !== undefined) {
                const lsKey = localStorageKeysMap[key];
                const stringVal = typeof cloudData[key] === 'string' ? cloudData[key] : JSON.stringify(cloudData[key]);
                if (localStorage.getItem(lsKey) !== stringVal) {
                  localStorage.setItem(lsKey, stringVal);
                  window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: lsKey, value: cloudData[key] } }));
                }
              }
            });
          }
        } catch (err) {
          console.error("Error doing initial sync:", err);
        } finally {
          isFinished = true;
          clearTimeout(timeoutId);
          setIsSyncing(false);
          setIsInitialLoading(false);
        }

        // Start real-time Supabase listener
        try {
          unsubscribeSnapshot = subscribeToUserDataCloud(sUser.id, (key, data) => {
            const stringified = JSON.stringify(data);
            switch (key) {
              case 'profile':
                setProfile(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'visionCards':
                setVisionCards(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'goals':
                setGoals(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'milestones':
                setMilestones(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'tasks':
                setTasks(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'habits':
                setHabits(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'journalEntries':
                setJournalEntries(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'financeRecords':
                setFinanceRecords(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'healthLogs':
                setHealthLogs(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'lifeWheel':
                setLifeWheel(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'philosophicalEntries':
                setPhilosophicalEntries(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'bookWisdomEntries':
                setBookWisdomEntries(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'intuitionEntries':
                setIntuitionEntries(prev => JSON.stringify(prev) !== stringified ? data : prev);
                break;
              case 'powerSystem': {
                const lsKey = 'lifeos_power_system';
                if (localStorage.getItem(lsKey) !== stringified) {
                  localStorage.setItem(lsKey, stringified);
                  window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: lsKey, value: data } }));
                }
                break;
              }
              case 'exerciseRules': {
                const lsKey = 'lifeos_exercise_rules';
                if (localStorage.getItem(lsKey) !== stringified) {
                  localStorage.setItem(lsKey, stringified);
                  window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: lsKey, value: data } }));
                }
                break;
              }
              case 'newMeSections': {
                const lsKey = 'lifeos_newme_sections';
                if (localStorage.getItem(lsKey) !== stringified) {
                  localStorage.setItem(lsKey, stringified);
                  window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: lsKey, value: data } }));
                }
                break;
              }
              case 'newMeDataDrop': {
                const lsKey = 'lifeos_newme_datadrop';
                if (localStorage.getItem(lsKey) !== data) {
                  localStorage.setItem(lsKey, data);
                  window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: lsKey, value: data } }));
                }
                break;
              }
              case 'newMeInterventions': {
                const lsKey = 'lifeos_newme_interventions';
                if (localStorage.getItem(lsKey) !== stringified) {
                  localStorage.setItem(lsKey, stringified);
                  window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: lsKey, value: data } }));
                }
                break;
              }
              case 'earthCountdownTarget': {
                const lsKey = 'lifeos_earth_target';
                if (localStorage.getItem(lsKey) !== data) {
                  localStorage.setItem(lsKey, data);
                  window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: lsKey, value: data } }));
                }
                break;
              }
              case 'earthCountdownTitle': {
                const lsKey = 'lifeos_earth_title';
                if (localStorage.getItem(lsKey) !== data) {
                  localStorage.setItem(lsKey, data);
                  window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: lsKey, value: data } }));
                }
                break;
              }
              case 'earthCountdownImage': {
                const lsKey = 'lifeos_earth_image';
                if (localStorage.getItem(lsKey) !== data) {
                  localStorage.setItem(lsKey, data);
                  window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: lsKey, value: data } }));
                }
                break;
              }
              case 'earthCountdownQuote': {
                const lsKey = 'lifeos_earth_quote';
                if (localStorage.getItem(lsKey) !== data) {
                  localStorage.setItem(lsKey, data);
                  window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: lsKey, value: data } }));
                }
                break;
              }
              case 'businessIdeas': {
                const lsKey = 'lifeos_business_ideas';
                if (localStorage.getItem(lsKey) !== stringified) {
                  localStorage.setItem(lsKey, stringified);
                  window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key: lsKey, value: data } }));
                }
                break;
              }
              case 'darkMode':
                if (data !== isDarkMode) {
                  setIsDarkMode(data);
                }
                break;
              case 'navItems':
                if (JSON.stringify(data) !== JSON.stringify(navItems)) {
                  setNavItems(data);
                }
                break;
            }
          });
        } catch (subErr) {
          console.error("Error setting up real-time subscription:", subErr);
        }

        // Trigger sync of pending data when becoming online or trigger event is received
        syncTriggerListener = () => {
          syncPendingData(sUser.id).catch(err => {
            console.error("Error syncing pending data on trigger:", err);
          });
        };
        window.addEventListener('supabase-sync-trigger', syncTriggerListener);
      } else {
        isFinished = true;
        clearTimeout(timeoutId);
        setIsSyncing(false);
        setIsInitialLoading(false);
      }
    });

    return () => {
      isFinished = true;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
      if (syncTriggerListener) {
        window.removeEventListener('supabase-sync-trigger', syncTriggerListener);
      }
    };
  }, []);

  // --- SYNC STATE TO LOCAL STORAGE & SUPABASE CLOUD ---
  const safeSetItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[Storage Quota Warning] Failed to save key "${key}" to localStorage. If you have uploaded many large images, some might only be synchronized with your Cloud account:`, e);
    }
  };

  useEffect(() => {
    safeSetItem('lifeos_profile', JSON.stringify(profile));
    if (user) {
      saveUserDataToCloud(user.id, 'profile', profile);
    }
  }, [profile, user]);

  useEffect(() => {
    safeSetItem('lifeos_vision_cards', JSON.stringify(visionCards));
    if (user) {
      saveUserDataToCloud(user.id, 'visionCards', visionCards);
    }
  }, [visionCards, user]);

  useEffect(() => {
    safeSetItem('lifeos_goals', JSON.stringify(goals));
    if (user) {
      saveUserDataToCloud(user.id, 'goals', goals);
    }
  }, [goals, user]);

  useEffect(() => {
    safeSetItem('lifeos_milestones', JSON.stringify(milestones));
    if (user) {
      saveUserDataToCloud(user.id, 'milestones', milestones);
    }
  }, [milestones, user]);

  useEffect(() => {
    safeSetItem('lifeos_tasks', JSON.stringify(tasks));
    if (user) {
      saveUserDataToCloud(user.id, 'tasks', tasks);
    }
  }, [tasks, user]);

  useEffect(() => {
    safeSetItem('lifeos_habits', JSON.stringify(habits));
    if (user) {
      saveUserDataToCloud(user.id, 'habits', habits);
    }
  }, [habits, user]);

  useEffect(() => {
    safeSetItem('lifeos_journals', JSON.stringify(journalEntries));
    if (user) {
      saveUserDataToCloud(user.id, 'journalEntries', journalEntries);
    }
  }, [journalEntries, user]);

  useEffect(() => {
    safeSetItem('lifeos_finance', JSON.stringify(financeRecords));
    if (user) {
      saveUserDataToCloud(user.id, 'financeRecords', financeRecords);
    }
  }, [financeRecords, user]);

  useEffect(() => {
    safeSetItem('lifeos_health', JSON.stringify(healthLogs));
    if (user) {
      saveUserDataToCloud(user.id, 'healthLogs', healthLogs);
    }
  }, [healthLogs, user]);

  useEffect(() => {
    safeSetItem('lifeos_lifewheel', JSON.stringify(lifeWheel));
    if (user) {
      saveUserDataToCloud(user.id, 'lifeWheel', lifeWheel);
    }
  }, [lifeWheel, user]);

  useEffect(() => {
    safeSetItem('lifeos_philosophical', JSON.stringify(philosophicalEntries));
    if (user) {
      saveUserDataToCloud(user.id, 'philosophicalEntries', philosophicalEntries);
    }
  }, [philosophicalEntries, user]);

  useEffect(() => {
    safeSetItem('lifeos_book_wisdom', JSON.stringify(bookWisdomEntries));
    if (user) {
      saveUserDataToCloud(user.id, 'bookWisdomEntries', bookWisdomEntries);
    }
  }, [bookWisdomEntries, user]);

  useEffect(() => {
    safeSetItem('lifeos_intuition', JSON.stringify(intuitionEntries));
    if (user) {
      saveUserDataToCloud(user.id, 'intuitionEntries', intuitionEntries);
    }
  }, [intuitionEntries, user]);

  // Rotates the quote of the day automatically on load
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      dailyQuoteIndex: prev.dailyQuoteIndex + 1
    }));
  }, []);

  // --- MUTATOR METHODS WITH IMMUTABILITY PRINCIPLES ---
  
  // Goal mutators
  const addGoal = (newGoal: Omit<Goal, 'id' | 'completed'>) => {
    const goal: Goal = {
      ...newGoal,
      id: `g-${Date.now()}`,
      completed: false
    };
    setGoals(prev => [goal, ...prev]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const updated = { ...g, ...updates };
        setVisionCards(vPrev => vPrev.map(c => {
          if (c.goalId === id) {
            return {
              ...c,
              title: updated.title,
              category: updated.category,
              targetDate: updated.targetDate,
              imageUrl: updated.imageUrl || c.imageUrl,
              imageUrls: updated.imageUrls || c.imageUrls
            };
          }
          return c;
        }));
        return updated;
      }
      return g;
    }));
  };

  const toggleGoalCompleted = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    // Cascade delete milestones and untie tasks
    setMilestones(prev => prev.filter(m => m.goalId !== id));
    setTasks(prev => prev.map(t => t.goalId === id ? { ...t, goalId: undefined, milestoneId: undefined } : t));
  };

  // Milestone mutators
  const addMilestone = (newMilestone: Omit<Milestone, 'id' | 'completed'>) => {
    const milestone: Milestone = {
      ...newMilestone,
      id: `m-${Date.now()}`,
      completed: false
    };
    setMilestones(prev => [...prev, milestone]);
  };

  const toggleMilestoneCompleted = (id: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    setTasks(prev => prev.map(t => t.milestoneId === id ? { ...t, milestoneId: undefined } : t));
  };

  // Task mutators
  const addTask = (newTask: Omit<Task, 'id' | 'pomodorosCompleted'>) => {
    const task: Task = {
      ...newTask,
      id: `t-${Date.now()}`,
      pomodorosCompleted: 0
    };
    setTasks(prev => [task, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTimerTaskId === id) {
      setActiveTimerTaskId(null);
    }
  };

  // Habit mutators
  const addHabit = (title: string) => {
    const habit: Habit = {
      id: `h-${Date.now()}`,
      title,
      streak: 0,
      history: {}
    };
    setHabits(prev => [habit, ...prev]);
  };

  const toggleHabitCompleted = (id: string, dateStr: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const historyCopy = { ...habit.history };
        const currentlyDone = historyCopy[dateStr] === true;
        historyCopy[dateStr] = !currentlyDone;

        // Simple streak calculations
        let currentStreak = habit.streak;
        if (!currentlyDone) {
          // Marking done, increment if last completed was yesterday or today
          currentStreak += 1;
        } else {
          currentStreak = Math.max(0, currentStreak - 1);
        }

        return {
          ...habit,
          streak: currentStreak,
          lastCompleted: !currentlyDone ? dateStr : habit.lastCompleted,
          history: historyCopy
        };
      }
      return habit;
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // Journal mutator
  const addJournalEntry = (entry: JournalEntry) => {
    setJournalEntries(prev => ({
      ...prev,
      [entry.date]: entry
    }));
  };

  // Finance mutators
  const addFinanceRecord = (newRecord: Omit<FinancialRecord, 'id'>) => {
    const record: FinancialRecord = {
      ...newRecord,
      id: `f-${Date.now()}`
    };
    setFinanceRecords(prev => [record, ...prev]);
  };

  const deleteFinanceRecord = (id: string) => {
    setFinanceRecords(prev => prev.filter(r => r.id !== id));
  };

  // Health log mutator
  const updateHealthLog = (date: string, logUpdates: Partial<HealthLog>) => {
    setHealthLogs(prev => {
      const existing = prev[date] || { steps: 0, waterIntake: 0, sleepHours: 0, energyLevel: 3 };
      return {
        ...prev,
        [date]: {
          ...existing,
          date,
          ...logUpdates
        }
      };
    });
  };

  // Settings mutators
  const updateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  // Vision Card mutators
  const addVisionCard = (newCard: Omit<VisionCard, 'id'>) => {
    const card: VisionCard = {
      ...newCard,
      id: `v-${Date.now()}`
    };
    setVisionCards(prev => [...prev, card]);
  };

  const updateVisionCard = (id: string, updates: Partial<VisionCard>) => {
    setVisionCards(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        if (updated.goalId) {
          setGoals(gPrev => gPrev.map(g => {
            if (g.id === updated.goalId) {
              const gUpdates: Partial<Goal> = {};
              if (updates.imageUrl !== undefined) gUpdates.imageUrl = updates.imageUrl;
              if (updates.imageUrls !== undefined) gUpdates.imageUrls = updates.imageUrls;
              if (updates.title !== undefined) gUpdates.title = updates.title;
              if (updates.category !== undefined) gUpdates.category = updates.category;
              if (updates.targetDate !== undefined) gUpdates.targetDate = updates.targetDate;
              return { ...g, ...gUpdates };
            }
            return g;
          }));
        }
        return updated;
      }
      return c;
    }));
  };

  const deleteVisionCard = (id: string) => {
    setVisionCards(prev => prev.filter(c => c.id !== id));
  };

  const handleExportData = () => {
    try {
      const payload = {
        profile,
        goals,
        milestones,
        tasks,
        habits,
        journals: journalEntries,
        finance: financeRecords,
        health: healthLogs,
        lifewheel: lifeWheel,
        visionCards: visionCards,
        philosophical: philosophicalEntries,
        bookWisdom: bookWisdomEntries,
        intuition: intuitionEntries
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prime-life-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
      alert("Data export failed. Details: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleImportData = (json: string): boolean => {
    try {
      if (!json || !json.trim()) {
        alert("Please paste a valid JSON backup string.");
        return false;
      }
      const payload = JSON.parse(json);
      if (!payload || typeof payload !== 'object') {
        throw new Error("Parsed JSON is not a valid backup ledger object.");
      }

      // Explicit warning confirmation before overwrite
      const userConfirmed = window.confirm(
        "CRITICAL WARNING:\n\nRestoring from this backup will completely OVERWRITE all your current Prime Life data (including Goals, Tasks, Habits, Vision Board images, Financial ledgers, and Philosophical journals).\n\nThis action cannot be undone. Are you sure you want to restore and overwrite your workspace?"
      );

      if (!userConfirmed) {
        return false;
      }

      if (payload.profile) setProfile(payload.profile);
      if (payload.goals) setGoals(payload.goals);
      if (payload.milestones) setMilestones(payload.milestones);
      if (payload.tasks) setTasks(payload.tasks);
      if (payload.habits) setHabits(payload.habits);
      if (payload.journals) setJournalEntries(payload.journals);
      if (payload.finance) setFinanceRecords(payload.finance);
      if (payload.health) setHealthLogs(payload.health);
      if (payload.lifewheel) setLifeWheel(payload.lifewheel);
      if (payload.visionCards) setVisionCards(payload.visionCards);
      if (payload.philosophical) setPhilosophicalEntries(payload.philosophical);
      if (payload.bookWisdom) setBookWisdomEntries(payload.bookWisdom);
      if (payload.intuition) setIntuitionEntries(payload.intuition);

      alert("✓ Data backup ledger successfully restored to your device!");
      return true;
    } catch (e) {
      console.error("Import failed:", e);
      alert("⚠️ Data restore failed. Please verify that you pasted a valid Prime Life backup JSON payload. Details: " + (e instanceof Error ? e.message : String(e)));
      return false;
    }
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to restore the environment to its default state? All stored logs will be wiped out.")) {
      localStorage.clear();
      setProfile(DEFAULT_PROFILE);
      setGoals(DEFAULT_GOALS);
      setMilestones(DEFAULT_MILESTONES);
      setTasks(DEFAULT_TASKS);
      setHabits(DEFAULT_HABITS);
      setJournalEntries(DEFAULT_JOURNAL);
      setFinanceRecords(DEFAULT_FINANCE);
      setHealthLogs(DEFAULT_HEALTH);
      setLifeWheel(DEFAULT_LIFE_WHEEL);
      setVisionCards(DEFAULT_VISION_CARDS);
      setPhilosophicalEntries([]);
      setBookWisdomEntries([]);
      setIntuitionEntries([]);
      alert('Local storage ledger restored to default values successfully.');
    }
  };

  // --- NAVIGATION TAB ITEMS CONFIG ---
  const DEFAULT_NAV_ITEMS = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'newme', label: 'UNSTOPPABLE ME' },
    { id: 'ventures', label: 'VENTURE LAB' },
    { id: 'vision', label: 'VISION BOARD' },
    { id: 'goals', label: 'GOALS & PLANS' },
    { id: 'productivity', label: 'PRODUCTIVITY' },
    { id: 'vitals', label: 'BIOLOGICAL COMMAND' },
    { id: 'logs', label: 'GROWTH LEDGER' },
    { id: 'settings', label: 'SETTINGS' }
  ];

  const [navItems, setNavItems] = useState<{ id: string; label: string }[]>(() => {
    const saved = localStorage.getItem('lifeos_nav_items_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep vitals, let user manage layout
          const filtered = parsed.filter(item => item.id !== 'calendar');
          // Update 'vitals' item labels to 'BIOLOGICAL COMMAND' if using an older label
          const mapped = filtered.map(item => item.id === 'vitals' ? { id: 'vitals', label: 'BIOLOGICAL COMMAND' } : item);
          const idsInParsed = mapped.map(item => item.id);
          const missingItems = DEFAULT_NAV_ITEMS.filter(item => !idsInParsed.includes(item.id));
          return [...mapped, ...missingItems];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_NAV_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem('lifeos_nav_items_v3', JSON.stringify(navItems));
    if (user) {
      saveUserDataToCloud(user.id, 'navItems', navItems);
    }
  }, [navItems, user]);

  const getNavIcon = (id: string, className = "w-4 h-4") => {
    switch (id) {
      case 'dashboard': return <LayoutDashboard className={className} />;
      case 'newme': return <Flame className={className} />;
      case 'ventures': return <Briefcase className={className} />;
      case 'vision': return <Sparkles className={className} />;
      case 'goals': return <Target className={className} />;
      case 'productivity': return <Clock className={className} />;
      case 'logs': return <BookOpen className={className} />;
      case 'vitals': return <Activity className={className} />;
      case 'calendar': return <CalendarIcon className={className} />;
      case 'settings': return <SettingsIcon className={className} />;
      default: return <Compass className={className} />;
    }
  };

  // Render appropriate content view based on active main tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            goals={goals}
            milestones={milestones}
            tasks={tasks}
            habits={habits}
            healthLogs={healthLogs}
            lifeWheel={lifeWheel}
            profile={profile}
            financeRecords={financeRecords}
            updateLifeWheel={setLifeWheel}
            updateHealthLog={updateHealthLog}
            onNavigate={(tab) => setActiveTab(tab)}
            onStartTimer={(task) => {
              setActiveTimerTaskId(task.id);
              setActiveTab('productivity');
            }}
          />
        );
      case 'newme':
        return (
          <NewMeView isDarkMode={isDarkMode} userId={user?.id} />
        );
      case 'ventures':
        return (
          <BusinessIdeasView isDarkMode={isDarkMode} userId={user?.id} />
        );
      case 'vision':
        return (
          <VisualizationView 
            visionCards={visionCards}
            goals={goals}
            onAddCard={addVisionCard}
            onUpdateCard={updateVisionCard}
            onDeleteCard={deleteVisionCard}
            isDarkMode={isDarkMode}
            userId={user?.id}
          />
        );
      case 'goals':
        return (
          <GoalsAndMilestones 
            goals={goals}
            milestones={milestones}
            addGoal={addGoal}
            updateGoal={updateGoal}
            toggleGoalCompleted={toggleGoalCompleted}
            deleteGoal={deleteGoal}
            addMilestone={addMilestone}
            toggleMilestoneCompleted={toggleMilestoneCompleted}
            deleteMilestone={deleteMilestone}
          />
        );
      case 'productivity':
        return (
          <ProductivityHub 
            userId={user?.id}
            tasks={tasks}
            habits={habits}
            goals={goals}
            addTask={addTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            addHabit={addHabit}
            toggleHabitCompleted={toggleHabitCompleted}
            deleteHabit={deleteHabit}
            activeTimerTaskId={activeTimerTaskId}
            setActiveTimerTaskId={setActiveTimerTaskId}
          />
        );
      case 'logs':
        return (
          <LogsAndBrain 
            journalEntries={journalEntries}
            addJournalEntry={addJournalEntry}
            philosophicalEntries={philosophicalEntries}
            setPhilosophicalEntries={setPhilosophicalEntries}
            bookWisdomEntries={bookWisdomEntries}
            setBookWisdomEntries={setBookWisdomEntries}
            intuitionEntries={intuitionEntries}
            setIntuitionEntries={setIntuitionEntries}
          />
        );
      case 'vitals':
        return (
          <VitalsManager 
            userId={user?.id}
            healthLogs={healthLogs}
            updateHealthLog={updateHealthLog}
            habits={habits}
            addHabit={addHabit}
            toggleHabitCompleted={toggleHabitCompleted}
            deleteHabit={deleteHabit}
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            tasks={tasks}
            goals={goals}
            habits={habits}
            philosophicalEntries={philosophicalEntries}
            bookWisdomEntries={bookWisdomEntries}
            intuitionEntries={intuitionEntries}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            profile={profile}
            updateProfile={updateProfile}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onClearData={handleClearData}
            navItems={navItems}
            onUpdateNavItems={setNavItems}
          />
        );
      default:
        return <div>Unknown layout tab</div>;
    }
  };

  const maxHabitStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 12;

  if (isInitialLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans select-none transition-colors duration-300 ${
        isDarkMode ? 'bg-[#050508] text-slate-200' : 'bg-[#f4f4f7] text-slate-800'
      }`}>
        <div className="flex flex-col items-center gap-4 text-center p-6 z-10 max-w-xs">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Spinning ambient border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-emerald-500 animate-spin opacity-80 blur-xs" />
            <div className={`absolute inset-[3px] rounded-xl ${isDarkMode ? 'bg-[#050508]' : 'bg-[#f4f4f7]'} flex items-center justify-center`}>
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            <h3 className={`text-sm font-mono font-bold tracking-widest uppercase ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
              Prime Life
            </h3>
            <p className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} tracking-wider uppercase animate-pulse`}>
              Calibrating Horizon Caches...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user && !guestBypass) {
    return (
      <LoginView 
        onBypass={() => {
          setGuestBypass(true);
          localStorage.setItem('lifeos_guest_bypass', 'true');
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className={`min-h-screen flex relative overflow-hidden font-sans select-none transition-colors duration-300 ${
      isDarkMode ? 'bg-[#050508] text-slate-200' : 'bg-[#f4f4f7] text-slate-800'
    }`} id="lifeos-application-root">
      
      {/* Absolute Ambient Neon Blob effects */}
      {isDarkMode && (
        <>
          <div className="absolute top-0 left-1/4 w-[45rem] h-[45rem] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none glow-bg-1" />
          <div className="absolute bottom-0 right-1/4 w-[35rem] h-[35rem] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none glow-bg-2" />
        </>
      )}

      {/* --- DESKTOP STATIC SIDEBAR --- */}
      <aside className={`w-[310px] p-5 flex flex-col justify-between hidden lg:flex z-40 relative shrink-0 transition-colors duration-300 ${
        isDarkMode ? 'bg-[#08080c] border-r border-white/5' : 'bg-white border-r border-slate-200 shadow-sm'
      }`} id="desktop-sidebar-frame">
        <div className="space-y-6">
          
          {/* Logo / Title */}
          <div className="flex flex-col gap-1 px-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                <Compass className="w-5.5 h-5.5 text-white stroke-[1.8]" />
              </div>
              <div className="flex flex-col text-left">
                <span className={`font-display font-extrabold text-lg tracking-wider leading-none uppercase ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  PRIME LIFE
                </span>
                <span className={`text-[10px] font-mono tracking-widest font-semibold uppercase leading-tight ${
                  isDarkMode ? 'text-cyan-400/80' : 'text-cyan-600'
                }`}>
                  Cloud Synced
                </span>
              </div>
            </div>
          </div>

          {/* Grouped Navigation */}
          <div className="space-y-6">
            {[
              {
                title: "Main",
                items: navItems.filter(item => ['dashboard', 'productivity'].includes(item.id))
              },
              {
                title: "Personal",
                items: navItems.filter(item => ['newme', 'vision', 'goals', 'vitals', 'logs'].includes(item.id) || !['dashboard', 'productivity', 'settings'].includes(item.id))
              },
              {
                title: "System",
                items: navItems.filter(item => ['settings'].includes(item.id))
              }
            ].filter(group => group.items.length > 0).map((group) => {
              return (
                <div key={group.title} className="space-y-1.5 text-left">
                  <span className={`text-[11px] font-mono font-bold tracking-[0.12em] uppercase px-4 block ${
                    isDarkMode ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {group.title}
                  </span>
                  <nav className="space-y-1">
                    {group.items.map((item) => {
                      const active = activeTab === item.id;
                      
                      // Sentence case converter
                      const toSentenceCase = (str: string) => {
                        if (str === 'UNSTOPPABLE ME') return 'Unstoppable Me';
                        if (str === 'VISION BOARD') return 'Vision Board';
                        if (str === 'GOALS & PLANS') return 'Goals & Plans';
                        if (str === 'BIOLOGICAL COMMAND') return 'Biological Command';
                        if (str === 'GROWTH LEDGER') return 'Growth Ledger';
                        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
                      };

                      const itemLabel = toSentenceCase(item.label);
                      const iconColorClass = active 
                        ? 'text-cyan-500 dark:text-cyan-400' 
                        : isDarkMode 
                          ? 'text-slate-400 group-hover:text-slate-200' 
                          : 'text-slate-500 group-hover:text-slate-800';

                      return (
                        <button 
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium tracking-wide transition-all duration-[220ms] ease-out relative group select-none outline-none focus:outline-none ${
                            active 
                              ? isDarkMode 
                                ? 'bg-cyan-500/5 text-cyan-400 shadow-[0_4px_12px_rgba(6,182,212,0.1)] border border-cyan-500/25 font-semibold' 
                                : 'bg-cyan-50/70 text-cyan-600 shadow-sm shadow-cyan-100 border border-cyan-200/40 font-semibold'
                              : isDarkMode
                                ? 'text-slate-400 hover:text-white border border-transparent hover:bg-white/[0.03] hover:shadow-[0_2px_8px_rgba(255,255,255,0.01)]'
                                : 'text-slate-600 hover:text-slate-900 border border-transparent hover:bg-slate-50 hover:shadow-sm hover:shadow-slate-100/50'
                          }`}
                        >
                          {/* Glowing Left Accent Bar */}
                          {active && (
                            <motion.div 
                              layoutId="activeSidebarGlowBar"
                              className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                              transition={{ type: "spring", stiffness: 350, damping: 28 }}
                            />
                          )}

                          {/* Icon slightly scales or shifts */}
                          <span className={`transition-all duration-[220ms] ${iconColorClass} group-hover:scale-110 group-hover:-translate-y-0.5`}>
                            {getNavIcon(item.id, "w-[22px] h-[22px] stroke-[1.75]")}
                          </span>

                          {/* Text slides a few pixels */}
                          <span className="transition-transform duration-[220ms] group-hover:translate-x-1">
                            {itemLabel}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              );
            })}
          </div>

        </div>

        {/* Sidebar bottom: Momentum indicator & Operator overview */}
        <div className={`mt-auto pt-5 space-y-4 border-t transition-colors duration-300 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          {/* Momentum Indicator inside sidebar */}
          <div className={`p-4 rounded-2xl border transition-colors duration-300 ${
            isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50/40 border-emerald-500/10 shadow-sm shadow-emerald-100/10'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Momentum</span>
              <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{maxHabitStreak} Days</span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
              <div 
                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-500"
                style={{ width: `${Math.min(100, (maxHabitStreak / 15) * 100)}%` }}
              />
            </div>
          </div>

          {/* iOS Theme Switcher Option */}
          <div className={`p-3 rounded-2xl flex items-center justify-between transition-colors duration-200 ${
            isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-slate-50/60 border border-slate-100'
          }`}>
            <span className={`text-[11px] font-mono uppercase tracking-wider font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 outline-none flex items-center cursor-pointer ${
                isDarkMode ? 'bg-slate-800' : 'bg-emerald-500'
              }`}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
                  isDarkMode ? 'bg-slate-100 text-slate-900' : 'bg-white text-emerald-600'
                }`}
                style={{ marginLeft: isDarkMode ? 'auto' : '0' }}
              >
                {isDarkMode ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
              </motion.div>
            </button>
          </div>

          {/* Cloud Sync / Google Sign-In Card */}
          <div className={`p-3 rounded-2xl flex flex-col gap-3 ${
            isDarkMode ? 'bg-[#0f0f16] border border-white/5' : 'bg-slate-50/80 border border-slate-100 shadow-sm'
          }`}>
            {user ? (
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3 min-w-0">
                  {user.user_metadata?.avatar_url || (user as any).photoURL ? (
                    <img 
                      src={user.user_metadata?.avatar_url || (user as any).photoURL} 
                      alt={user.user_metadata?.full_name || (user as any).displayName || "Avatar"} 
                      className="w-10 h-10 rounded-xl object-cover shadow-md shadow-cyan-500/20 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-display font-bold text-white text-sm shrink-0 shadow-md shadow-cyan-500/20">
                      {user.user_metadata?.full_name ? user.user_metadata.full_name.slice(0, 2).toUpperCase() : (user as any).displayName ? (user as any).displayName.slice(0, 2).toUpperCase() : "EB"}
                    </div>
                  )}
                  <div className="truncate text-left flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      {user.user_metadata?.full_name || (user as any).displayName || user.email || 'Google User'}
                    </p>
                    <span className="text-[11px] font-medium block text-cyan-500 dark:text-cyan-400 flex items-center gap-1">
                      <Cloud className="w-3.5 h-3.5 inline-block shrink-0" /> Cloud Synced
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={async () => {
                    await signOutUser();
                    setGuestBypass(false);
                    localStorage.removeItem('lifeos_guest_bypass');
                  }}
                  className={`p-2 rounded-xl transition-all ${
                    isDarkMode 
                      ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' 
                      : 'hover:bg-red-50 text-slate-500 hover:text-red-600'
                  }`}
                  title="Sign Out of Cloud"
                >
                  <LogOut className="w-4.5 h-4.5 stroke-[1.8]" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-display font-bold text-slate-500 dark:text-slate-400 text-sm shrink-0 shadow-sm">
                    <CloudLightning className="w-5 h-5" />
                  </div>
                  <div className="truncate text-left">
                    <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      Cloud Sync
                    </p>
                    <span className="text-[11px] font-medium block text-slate-500 dark:text-slate-400">
                      Local Sandbox Mode
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-cyan-600/10 hover:shadow-cyan-500/20 cursor-pointer"
                >
                  Connect Google Account
                </button>

                <button
                  onClick={() => {
                    setGuestBypass(false);
                    localStorage.removeItem('lifeos_guest_bypass');
                  }}
                  className="w-full text-center text-[10px] font-mono font-bold tracking-wider text-slate-500 hover:text-cyan-400 uppercase mt-1 transition-colors"
                >
                  ← Return to Login Gate
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* --- RESPONSIVE MOBILE NAVIGATION HEADER --- */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 backdrop-blur-xl border-b flex justify-between items-center px-4 z-40 transition-colors duration-200 ${
        isDarkMode ? 'bg-[#08080c]/80 border-white/5 text-slate-200' : 'bg-white/80 border-slate-200 text-slate-800 shadow-sm'
      }`} id="mobile-navigation-header">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Compass className="w-4.5 h-4.5 text-slate-950" />
          </div>
          <div>
            <h2 className={`text-sm font-display font-bold uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>PRIME LIFE</h2>
          </div>
        </div>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-1.5 border rounded-lg transition-all ${
            isDarkMode 
              ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-slate-200' 
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-800'
          }`}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE NAV MENU DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={`fixed inset-0 top-16 backdrop-blur-2xl z-30 lg:hidden p-5 flex flex-col justify-between transition-colors duration-200 ${
              isDarkMode ? 'bg-[#05060f]/95 text-slate-200' : 'bg-white/95 text-slate-800 border-r border-slate-200 shadow-xl'
            }`}
            id="mobile-navigation-drawer"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-2 mb-3">NAVIGATIONAL DIRECTORY</span>
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button 
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-mono font-semibold tracking-wide transition-all ${
                        active 
                          ? isDarkMode 
                            ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 neon-glow-blue font-bold' 
                            : 'bg-cyan-50 border border-cyan-100 text-cyan-600 font-bold shadow-sm'
                          : isDarkMode
                            ? 'text-slate-400 border border-transparent hover:text-white'
                            : 'text-slate-600 border border-transparent hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>{getNavIcon(item.id)}</span>
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex flex-col gap-3">
              {/* Mobile Theme Switcher Option */}
              <div className={`p-2.5 rounded-xl flex items-center justify-between transition-colors duration-200 ${
                isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-slate-100 border border-slate-200'
              }`}>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 outline-none flex items-center cursor-pointer ${
                    isDarkMode ? 'bg-slate-800' : 'bg-emerald-500'
                  }`}
                >
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
                      isDarkMode ? 'bg-slate-100 text-slate-900' : 'bg-white text-emerald-600'
                    }`}
                    style={{ marginLeft: isDarkMode ? 'auto' : '0' }}
                  >
                    {isDarkMode ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                  </motion.div>
                </button>
              </div>

              <div className={`p-4 rounded-2xl flex items-center gap-3 transition-colors duration-200 ${
                isDarkMode ? 'bg-slate-900/50 border border-slate-800' : 'bg-slate-100 border border-slate-200'
              }`}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center font-display font-bold text-slate-950 text-xs">
                  {profile.name ? profile.name.slice(0, 2).toUpperCase() : "OP"}
                </div>
                <div className="truncate text-left">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Operator</span>
                  <p className={`text-xs font-display font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{profile.name}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CORE WORKING CONTAINER --- */}
      <main className="flex-1 overflow-y-auto z-10 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8 relative flex flex-col justify-between" id="lifeos-primary-work-container">
        
        {/* Render Active view */}
        <div className="flex-1 w-full max-w-7xl mx-auto pb-8">
          {isSyncDelayed && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-mono flex items-center justify-between gap-4 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>Cloud data synchronization is delayed due to network conditions. Displaying cached local/offline logs securely. Updates will sync automatically.</span>
              </div>
              <button 
                onClick={() => setIsSyncDelayed(false)} 
                className="text-[10px] uppercase font-bold tracking-wider hover:opacity-80 border border-amber-500/30 px-2 py-1 rounded transition-all shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Small Footer bar */}
        <footer className="w-full max-w-7xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-900 text-[10px] font-mono text-slate-500 flex flex-col md:flex-row justify-between items-center gap-2.5">
          <span>PRIME LIFE — Real-time Synchronized Personal Executive Planner</span>
          <div className="flex gap-4">
            <span>Secure Cloud Syncing Enabled</span>
          </div>
        </footer>

      </main>

    </div>
  );
}
