import { create } from "zustand";
import { Pet } from "../types/pet";
import { CalendarEvent, eventOccursOnDate } from "../types/event";
import { getAllPets, getPetById, updatePetStats } from "../database/petRepository";
import { applyTimeDegradation, applyAction } from "../engine/tamagotchiEngine";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventComplete as toggleComplete,
} from "../database/eventRepository";

function computeOverallHealth(pet: Pet): number {
  return Math.round((pet.hunger + pet.thirst + pet.mood) / 3);
}

interface PetStore {
  // --- Pets ---
  pets: Pet[];
  selectedPet: Pet | null;
  overallHealth: number;
  loadPets: () => Promise<void>;
  loadPet: (id: number) => Promise<void>;
  feed: () => Promise<void>;
  giveWater: () => Promise<void>;
  play: () => Promise<void>;

  // --- Calendrier ---
  events: CalendarEvent[];
  selectedDate: string; // "YYYY-MM-DD"
  filterPetId: number | null;
  loadEvents: () => Promise<void>;
  addEvent: (data: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateEvent: (id: string, data: Partial<Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleEventComplete: (id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  setFilterPetId: (petId: number | null) => void;
  getEventsByDate: (date: string) => CalendarEvent[];
  getUpcomingEvents: (limit?: number) => CalendarEvent[];
}

export const usePetStore = create<PetStore>((set, get) => ({
  // ─── Pets ─────────────────────────────────────────────────────────────────

  pets: [],
  selectedPet: null,
  overallHealth: 0,

  loadPets: async () => {
    const pets = await getAllPets();
    set({ pets });
  },

  loadPet: async (id: number) => {
    const pet = await getPetById(id);
    if (!pet) return;

    const degraded = applyTimeDegradation(pet);
    const now = Date.now();

    await updatePetStats(id, degraded.hunger, degraded.thirst, degraded.mood, now);

    const updated: Pet = { ...pet, ...degraded, last_update: now };
    set({ selectedPet: updated, overallHealth: computeOverallHealth(updated) });
  },

  feed: async () => {
    const { selectedPet } = get();
    if (!selectedPet) return;
    const updated = applyAction({ hunger: selectedPet.hunger, thirst: selectedPet.thirst, mood: selectedPet.mood }, "feed");
    const now = Date.now();
    await updatePetStats(selectedPet.id, updated.hunger, updated.thirst, updated.mood, now);
    const next = { ...selectedPet, ...updated, last_update: now };
    set({ selectedPet: next, overallHealth: computeOverallHealth(next) });
  },

  giveWater: async () => {
    const { selectedPet } = get();
    if (!selectedPet) return;
    const updated = applyAction({ hunger: selectedPet.hunger, thirst: selectedPet.thirst, mood: selectedPet.mood }, "water");
    const now = Date.now();
    await updatePetStats(selectedPet.id, updated.hunger, updated.thirst, updated.mood, now);
    const next = { ...selectedPet, ...updated, last_update: now };
    set({ selectedPet: next, overallHealth: computeOverallHealth(next) });
  },

  play: async () => {
    const { selectedPet } = get();
    if (!selectedPet) return;
    const updated = applyAction({ hunger: selectedPet.hunger, thirst: selectedPet.thirst, mood: selectedPet.mood }, "play");
    const now = Date.now();
    await updatePetStats(selectedPet.id, updated.hunger, updated.thirst, updated.mood, now);
    const next = { ...selectedPet, ...updated, last_update: now };
    set({ selectedPet: next, overallHealth: computeOverallHealth(next) });
  },

  // ─── Calendrier ───────────────────────────────────────────────────────────

  events: [],
  selectedDate: new Date().toISOString().split("T")[0],
  filterPetId: null,

  loadEvents: async () => {
    const events = await getAllEvents();
    set({ events });
  },

  addEvent: async (data) => {
    const id = await createEvent(data);
    const now = new Date().toISOString();
    const newEvent: CalendarEvent = { ...data, id, createdAt: now, updatedAt: now };
    set((s) => ({
      events: [...s.events, newEvent].sort((a, b) =>
        a.date !== b.date ? a.date.localeCompare(b.date) : (a.startTime ?? "").localeCompare(b.startTime ?? "")
      ),
    }));
  },

  updateEvent: async (id, data) => {
    await updateEvent(id, data);
    const now = new Date().toISOString();
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, ...data, updatedAt: now } : e)),
    }));
  },

  deleteEvent: async (id) => {
    await deleteEvent(id);
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
  },

  toggleEventComplete: async (id) => {
    const { events } = get();
    const event = events.find((e) => e.id === id);
    if (!event) return;
    await toggleComplete(id, event.completed);
    const now = new Date().toISOString();
    set((s) => ({
      events: s.events.map((e) =>
        e.id === id ? { ...e, completed: !e.completed, updatedAt: now } : e
      ),
    }));
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  setFilterPetId: (petId) => set({ filterPetId: petId }),

  getEventsByDate: (date) => {
    const { events, filterPetId } = get();
    return events.filter((e) => {
      if (!eventOccursOnDate(e, date)) return false;
      if (filterPetId === null) return true;
      return e.petIds.length === 0 || e.petIds.includes(filterPetId);
    });
  },

  getUpcomingEvents: (limit = 5) => {
    const { events, filterPetId } = get();
    const today = new Date().toISOString().split("T")[0];
    return events
      .filter((e) => {
        if (e.completed) return false;
        // un event récurrent a toujours des occurrences futures
        if (e.repeat !== "never") return e.date <= today || e.date > today;
        if (e.date < today) return false;
        if (filterPetId === null) return true;
        return e.petIds.length === 0 || e.petIds.includes(filterPetId);
      })
      .slice(0, limit);
  },
}));
