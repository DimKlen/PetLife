export type EventType =
  | "vaccination"
  | "vet_appointment"
  | "grooming"
  | "medication"
  | "birthday"
  | "custom";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  date: string; // "YYYY-MM-DD"
  time: string | null; // "HH:MM"
  petId: number | null; // null = tous les animaux
  type: EventType;
  reminder: boolean;
  reminderTime: number | null; // minutes avant
  completed: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export const EVENT_CONFIG: Record<EventType, { color: string; icon: string; label: string }> = {
  vaccination: { color: "#f5576c", icon: "💉", label: "Vaccination" },
  vet_appointment: { color: "#4facfe", icon: "🏥", label: "Rendez-vous véto" },
  grooming: { color: "#43e97b", icon: "✂️", label: "Toilettage" },
  medication: { color: "#fa709a", icon: "💊", label: "Médicament" },
  birthday: { color: "#fee140", icon: "🎂", label: "Anniversaire" },
  custom: { color: "#667eea", icon: "📌", label: "Autre" },
};

export const getEventColor = (type: EventType): string => EVENT_CONFIG[type].color;
export const getEventIcon = (type: EventType): string => EVENT_CONFIG[type].icon;
export const getEventLabel = (type: EventType): string => EVENT_CONFIG[type].label;
