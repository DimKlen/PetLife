import { CalendarEvent } from "../types/event";

const EVENTS_KEY = "pet-health-app-events";

function generateId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function loadEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: CalendarEvent[]): void {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export async function getAllEvents(): Promise<CalendarEvent[]> {
  return loadEvents().sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.time ?? "").localeCompare(b.time ?? "");
  });
}

export async function createEvent(
  data: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const events = loadEvents();
  const now = new Date().toISOString();
  const id = generateId();
  events.push({ ...data, id, createdAt: now, updatedAt: now });
  saveEvents(events);
  return id;
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const events = loadEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return;
  events[index] = { ...events[index], ...data, updatedAt: new Date().toISOString() };
  saveEvents(events);
}

export async function deleteEvent(id: string): Promise<void> {
  const events = loadEvents();
  saveEvents(events.filter((e) => e.id !== id));
}

export async function toggleEventComplete(id: string, current: boolean): Promise<void> {
  await updateEvent(id, { completed: !current });
}
