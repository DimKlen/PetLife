export type EventType =
  | "vaccination"
  | "vet_appointment"
  | "grooming"
  | "medication"
  | "birthday"
  | "custom";

export type RepeatType = "never" | "daily" | "weekly" | "monthly" | "yearly";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;          // "YYYY-MM-DD"
  allDay: boolean;
  startTime: string | null; // "HH:MM" — null si allDay
  endTime: string | null;   // "HH:MM" — null si allDay
  petIds: number[];          // [] = tous les animaux
  type: EventType;
  repeat: RepeatType;
  location: string | null;
  reminders: number[];       // minutes avant l'événement
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const EVENT_CONFIG: Record<EventType, { color: string; icon: string; label: string }> = {
  vaccination:     { color: "#f5576c", icon: "💉", label: "Vaccination" },
  vet_appointment: { color: "#4facfe", icon: "🏥", label: "Rendez-vous véto" },
  grooming:        { color: "#43e97b", icon: "✂️", label: "Toilettage" },
  medication:      { color: "#fa709a", icon: "💊", label: "Médicament" },
  birthday:        { color: "#fee140", icon: "🎂", label: "Anniversaire" },
  custom:          { color: "#667eea", icon: "📌", label: "Autre" },
};

export const REPEAT_CONFIG: Record<RepeatType, string> = {
  never:   "Ne se répète pas",
  daily:   "Chaque jour",
  weekly:  "Chaque semaine",
  monthly: "Chaque mois",
  yearly:  "Chaque année",
};

export const REMINDER_OPTIONS: { value: number; label: string }[] = [
  { value: 5,    label: "5 minutes avant" },
  { value: 10,   label: "10 minutes avant" },
  { value: 15,   label: "15 minutes avant" },
  { value: 30,   label: "30 minutes avant" },
  { value: 60,   label: "1 heure avant" },
  { value: 1440, label: "1 jour avant" },
];

export function formatReminder(minutes: number): string {
  if (minutes < 60) return `${minutes} min avant`;
  if (minutes === 60) return "1 heure avant";
  if (minutes === 1440) return "1 jour avant";
  return `${minutes} min avant`;
}

export const getEventColor = (type: EventType): string => EVENT_CONFIG[type].color;
export const getEventIcon  = (type: EventType): string => EVENT_CONFIG[type].icon;
export const getEventLabel = (type: EventType): string => EVENT_CONFIG[type].label;

/**
 * Retourne true si l'événement doit apparaître à la date donnée,
 * en tenant compte de la récurrence.
 */
export function eventOccursOnDate(event: CalendarEvent, date: string): boolean {
  if (date < event.date) return false; // jamais avant la date d'origine
  if (event.date === date) return true;
  if (event.repeat === "never") return false;

  switch (event.repeat) {
    case "daily":
      return true;
    case "weekly": {
      const origin = new Date(event.date + "T00:00:00");
      const target = new Date(date + "T00:00:00");
      const diffDays = Math.round((target.getTime() - origin.getTime()) / 86400000);
      return diffDays % 7 === 0;
    }
    case "monthly": {
      const originDay = event.date.split("-")[2];
      const targetDay = date.split("-")[2];
      return originDay === targetDay;
    }
    case "yearly": {
      const [, oM, oD] = event.date.split("-");
      const [, tM, tD] = date.split("-");
      return oM === tM && oD === tD;
    }
  }
}
