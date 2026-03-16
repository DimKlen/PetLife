import { getDatabase } from "./db";
import { CalendarEvent, EventType, RepeatType } from "../types/event";

function generateId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function mapRow(row: Record<string, unknown>): CalendarEvent {
  return {
    id:          row.id as string,
    title:       row.title as string,
    description: row.description as string | null,
    date:        row.date as string,
    allDay:      (row.allDay as number) === 1,
    startTime:   (row.startTime ?? row.time) as string | null,
    endTime:     row.endTime as string | null,
    petIds:      parseJson(row.petIds, []),
    type:        row.type as EventType,
    repeat:      (row.repeat as RepeatType) ?? "never",
    location:    row.location as string | null,
    reminders:   parseJson(row.reminders, [30]),
    completed:   (row.completed as number) === 1,
    createdAt:   row.createdAt as string,
    updatedAt:   row.updatedAt as string,
  };
}

export async function getAllEvents(): Promise<CalendarEvent[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    "SELECT * FROM events ORDER BY date ASC, startTime ASC"
  );
  return rows.map(mapRow);
}

export async function createEvent(
  data: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const db = await getDatabase();
  const id  = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO events
      (id, title, description, date, allDay, startTime, endTime, petIds, type, repeat, location, reminders, completed, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title,
      data.description ?? null,
      data.date,
      data.allDay ? 1 : 0,
      data.startTime ?? null,
      data.endTime ?? null,
      JSON.stringify(data.petIds),
      data.type,
      data.repeat,
      data.location ?? null,
      JSON.stringify(data.reminders),
      data.completed ? 1 : 0,
      now,
      now,
    ]
  );

  return id;
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const db  = await getDatabase();
  const now = new Date().toISOString();

  const allowedColumns: Record<string, string | number | null> = {};
  if (data.title       !== undefined) allowedColumns.title       = data.title;
  if (data.description !== undefined) allowedColumns.description = data.description;
  if (data.date        !== undefined) allowedColumns.date        = data.date;
  if (data.allDay      !== undefined) allowedColumns.allDay      = data.allDay ? 1 : 0;
  if (data.startTime   !== undefined) allowedColumns.startTime   = data.startTime;
  if (data.endTime     !== undefined) allowedColumns.endTime     = data.endTime;
  if (data.petIds      !== undefined) allowedColumns.petIds      = JSON.stringify(data.petIds);
  if (data.type        !== undefined) allowedColumns.type        = data.type;
  if (data.repeat      !== undefined) allowedColumns.repeat      = data.repeat;
  if (data.location    !== undefined) allowedColumns.location    = data.location;
  if (data.reminders   !== undefined) allowedColumns.reminders   = JSON.stringify(data.reminders);
  if (data.completed   !== undefined) allowedColumns.completed   = data.completed ? 1 : 0;

  if (Object.keys(allowedColumns).length === 0) return;

  const fields = Object.keys(allowedColumns).map((k) => `${k} = ?`).join(", ");
  const values = [...Object.values(allowedColumns), now, id];

  await db.runAsync(`UPDATE events SET ${fields}, updatedAt = ? WHERE id = ?`, values);
}

export async function deleteEvent(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM events WHERE id = ?", [id]);
}

export async function toggleEventComplete(id: string, current: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE events SET completed = ?, updatedAt = ? WHERE id = ?",
    [current ? 0 : 1, new Date().toISOString(), id]
  );
}
