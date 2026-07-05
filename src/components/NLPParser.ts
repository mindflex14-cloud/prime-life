// Natural Language Processing parser for iOS-style Tasks
import { RecurrenceConfig } from './ProductivityHub';

export interface ParsedTask {
  title: string;
  dateStr?: string;
  timeStr?: string;      // Start time (e.g. "09:00 AM")
  endTimeStr?: string;   // End time (e.g. "11:00 AM")
  duration?: number;     // Duration in minutes
  priority?: 'none' | 'low' | 'medium' | 'high';
  tags: string[];
  recurrence?: RecurrenceConfig;
  reminderType?: 'none' | 'notification' | 'alarm';
  goalTitle?: string;
}

/**
 * Parses a natural language string to extract rich task details
 */
export function parseNaturalLanguageTask(input: string, baseDate: string = new Date().toISOString().split('T')[0]): ParsedTask {
  let text = input.trim();
  if (!text) {
    return { title: '', tags: [] };
  }

  const tags: string[] = [];
  let priority: 'none' | 'low' | 'medium' | 'high' = 'none';
  let dateStr: string | undefined = undefined;
  let timeStr: string | undefined = undefined;
  let endTimeStr: string | undefined = undefined;
  let duration: number | undefined = undefined;
  let recurrence: RecurrenceConfig | undefined = undefined;
  let reminderType: 'none' | 'notification' | 'alarm' = 'none';
  let goalTitle: string | undefined = undefined;

  // 1. Extract hashtags (#work, #wealth, #gym, #study, etc.)
  const hashtagRegex = /#(\w+)/g;
  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    tags.push(match[1]);
  }
  // Remove tags from text
  text = text.replace(/#\w+/g, '');

  // 2. Extract priority flags (!!!, !!, !)
  if (text.includes('!!!')) {
    priority = 'high';
    text = text.replace('!!!', '');
  } else if (text.includes('!!')) {
    priority = 'medium';
    text = text.replace('!!', '');
  } else if (text.includes('!')) {
    priority = 'low';
    text = text.replace('!', '');
  }

  // 3. Extract reminder / alarm requests ("with alarm", "alarm", "with notification", "notify me")
  const lowerText = text.toLowerCase();
  if (/\bwith alarm\b|\balarm\b/i.test(lowerText)) {
    reminderType = 'alarm';
    text = text.replace(/\bwith alarm\b|\balarm\b/gi, '');
  } else if (/\bwith notification\b|\bwith reminder\b|\bnotify me\b/i.test(lowerText)) {
    reminderType = 'notification';
    text = text.replace(/\bwith notification\b|\bwith reminder\b|\bnotify me\b/gi, '');
  }

  // 4. Extract repeat patterns ("every day", "every monday", "every week", "every month", "every year")
  const repeatRegex = /\bevery\s+(day|week|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
  const repeatMatch = text.match(repeatRegex);
  if (repeatMatch) {
    const unit = repeatMatch[1].toLowerCase();
    if (unit === 'day') {
      recurrence = { frequency: 'daily', endCondition: 'forever' };
    } else if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'week'].includes(unit)) {
      recurrence = { frequency: 'weekly', endCondition: 'forever' };
    } else if (unit === 'month') {
      recurrence = { frequency: 'monthly', endCondition: 'forever' };
    } else if (unit === 'year') {
      recurrence = { frequency: 'monthly', endCondition: 'forever' };
    }
    text = text.replace(repeatRegex, '');
  }

  // 5. Extract duration ("for 90 minutes", "for 90 mins", "for 2 hours", "for 2 hrs")
  const durationRegex = /\bfor\s+(\d+)\s*(minute|minutes|min|mins|hour|hours|hr|hrs)\b/i;
  const durationMatch = text.match(durationRegex);
  if (durationMatch) {
    const val = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    if (unit.startsWith('m')) {
      duration = val;
    } else {
      duration = val * 60; // hours to minutes
    }
    text = text.replace(durationRegex, '');
  }

  // 6. Extract time ranges ("from 10 to 1", "from 9:00 AM to 11:30 AM")
  const rangeRegex = /\bfrom\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s+to\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
  const rangeMatch = text.match(rangeRegex);
  if (rangeMatch) {
    let startHr = parseInt(rangeMatch[1]);
    const startMin = rangeMatch[2] ? parseInt(rangeMatch[2]) : 0;
    let startPeriod = rangeMatch[3] ? rangeMatch[3].toUpperCase() : undefined;

    let endHr = parseInt(rangeMatch[4]);
    const endMin = rangeMatch[5] ? parseInt(rangeMatch[5]) : 0;
    let endPeriod = rangeMatch[6] ? rangeMatch[6].toUpperCase() : undefined;

    // Smart period guessing (e.g., from 10 to 1 -> 10 AM to 1 PM)
    if (!startPeriod && !endPeriod) {
      if (startHr >= 8 && startHr < 12) startPeriod = 'AM';
      else startPeriod = 'PM';
      
      if (endHr < startHr || endHr === 12) endPeriod = 'PM';
      else endPeriod = startPeriod;
    } else if (startPeriod && !endPeriod) {
      endPeriod = (endHr < startHr && startPeriod === 'AM') ? 'PM' : startPeriod;
    } else if (!startPeriod && endPeriod) {
      startPeriod = (startHr > endHr && endPeriod === 'PM') ? 'AM' : endPeriod;
    }

    // Convert start time
    let start24 = startHr;
    if (startPeriod === 'PM' && startHr < 12) start24 += 12;
    if (startPeriod === 'AM' && startHr === 12) start24 = 0;
    
    // Convert end time
    let end24 = endHr;
    if (endPeriod === 'PM' && endHr < 12) end24 += 12;
    if (endPeriod === 'AM' && endHr === 12) end24 = 0;

    timeStr = `${String(startHr).padStart(2, '0')}:${String(startMin).padStart(2, '0')} ${startPeriod}`;
    endTimeStr = `${String(endHr).padStart(2, '0')}:${String(endMin).padStart(2, '0')} ${endPeriod}`;
    duration = (end24 * 60 + endMin) - (start24 * 60 + startMin);
    if (duration < 0) duration += 24 * 60; // overnight fallback

    text = text.replace(rangeRegex, '');
  }

  // 7. Extract specific time ("at 5pm", "at 9:30am", "at 14:00")
  if (!timeStr) {
    const timeRegex = /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
    const timeMatch = text.match(timeRegex);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      let period = timeMatch[3] ? timeMatch[3].toUpperCase() : undefined;

      // Smart period guessing: e.g. at 9 -> 9 AM, at 3 -> 3 PM
      if (!period) {
        period = (hour >= 8 && hour < 12) ? 'AM' : 'PM';
      }

      timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
      
      // Guess end time based on duration (default 60 minutes if duration is not set yet)
      const d = duration || 60;
      let hr24 = hour;
      if (period === 'PM' && hour < 12) hr24 += 12;
      if (period === 'AM' && hour === 12) hr24 = 0;

      const totalMins = hr24 * 60 + minute + d;
      const endHr24 = Math.floor(totalMins / 60) % 24;
      const endMinVal = totalMins % 60;
      const endPeriodVal = endHr24 >= 12 ? 'PM' : 'AM';
      const endHour12 = endHr24 % 12 === 0 ? 12 : endHr24 % 12;
      endTimeStr = `${String(endHour12).padStart(2, '0')}:${String(endMinVal).padStart(2, '0')} ${endPeriodVal}`;
      if (!duration) duration = 60;

      text = text.replace(timeRegex, '');
    }
  }

  // 8. Extract dates (today, tomorrow, next monday, next friday, next week, next month)
  const today = new Date(baseDate);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateLower = text.toLowerCase();
  
  if (/\btoday\b/i.test(dateLower)) {
    dateStr = today.toISOString().split('T')[0];
    text = text.replace(/\btoday\b/gi, '');
  } else if (/\btomorrow\b/i.test(dateLower)) {
    dateStr = tomorrow.toISOString().split('T')[0];
    text = text.replace(/\btomorrow\b/gi, '');
  } else if (/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(dateLower)) {
    const dayMatch = dateLower.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (dayMatch) {
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDayIdx = daysOfWeek.indexOf(dayMatch[1].toLowerCase());
      const currentDayIdx = today.getDay();
      
      const nextDate = new Date(today);
      let diff = targetDayIdx - currentDayIdx;
      if (diff <= 0) diff += 7; // Next week's day
      nextDate.setDate(today.getDate() + diff);
      
      dateStr = nextDate.toISOString().split('T')[0];
      text = text.replace(new RegExp(`\\bnext\\s+${dayMatch[1]}\\b`, 'gi'), '');
    }
  }

  // 9. Goal/Category prediction based on keywords
  const titleLower = text.toLowerCase();
  if (titleLower.includes('gym') || titleLower.includes('muscle') || titleLower.includes('workout') || titleLower.includes('protein')) {
    goalTitle = 'BECOME INCREDIBLY MUSCULAR';
    tags.push('health');
  } else if (titleLower.includes('rich') || titleLower.includes('money') || titleLower.includes('competitor') || titleLower.includes('saas') || titleLower.includes('work') || titleLower.includes('marketing')) {
    goalTitle = 'WEALTH CREATION';
    tags.push('wealth');
  } else if (titleLower.includes('study') || titleLower.includes('learn') || titleLower.includes('book') || titleLower.includes('read') || titleLower.includes('intellect')) {
    goalTitle = 'BECOME INCREDIBLY INTELLIGENT';
    tags.push('intelligence');
  }

  // Clean up title (remove double spaces, trailing prepositions like "at", "on", "for", "from")
  let cleanTitle = text.replace(/\s+/g, ' ').trim();
  cleanTitle = cleanTitle.replace(/\s+(at|on|for|from)$/i, '');
  cleanTitle = cleanTitle.trim();

  // If parsed title became empty, default to full text minus symbols
  if (!cleanTitle) {
    cleanTitle = input.replace(/#\w+/g, '').replace(/[!#]/g, '').trim();
  }

  return {
    title: cleanTitle,
    dateStr,
    timeStr,
    endTimeStr,
    duration,
    priority,
    tags,
    recurrence,
    reminderType,
    goalTitle
  };
}
