import { getDatabase } from "./db";
import { CalendarEvent, EventType } from "../types/event";

function generateId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// SQLite retourne 0/1 pour les booleans — on convertit en boolean JS
function mapRow(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    date: row.date as string,
    time: row.time as string | null,
    petId: row.petId as number | null,
    type: row.type as EventType,
    reminder: (row.reminder as number) === 1,
    reminderTime: row.reminderTime as number | null,
    completed: (row.completed as number) === 1,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

export async function getAllEvents(): Promise<CalendarEvent[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    "SELECT * FROM events ORDER BY date ASC, time ASC"
  );
  return rows.map(mapRow);
}

export async function createEvent(
  data: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO events (id, title, description, date, time, petId, type, reminder, reminderTime, completed, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title,
      data.description ?? null,
      data.date,
      data.time ?? null,
      data.petId ?? null,
      data.type,
      data.reminder ? 1 : 0,
      data.reminderTime ?? null,
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
  const db = await getDatabase();
  const now = new Date().toISOString();

  // Colonnes autorisées (évite injection SQL via clés)
  const allowedColumns: Record<string, string | number | null> = {};
  if (data.title !== undefined) allowedColumns.title = data.title;
  if (data.description !== undefined) allowedColumns.description = data.description;
  if (data.date !== undefined) allowedColumns.date = data.date;
  if (data.time !== undefined) allowedColumns.time = data.time;
  if (data.petId !== undefined) allowedColumns.petId = data.petId;
  if (data.type !== undefined) allowedColumns.type = data.type;
  if (data.reminder !== undefined) allowedColumns.reminder = data.reminder ? 1 : 0;
  if (data.reminderTime !== undefined) allowedColumns.reminderTime = data.reminderTime;
  if (data.completed !== undefined) allowedColumns.completed = data.completed ? 1 : 0;

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
