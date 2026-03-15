import { create } from "zustand";
import { Pet } from "../types/pet";
import { getAllPets, getPetById, updatePetStats } from "../database/petRepository";
import { applyTimeDegradation, applyAction } from "../engine/tamagotchiEngine";

function computeOverallHealth(pet: Pet): number {
  return Math.round((pet.hunger + pet.thirst + pet.mood + pet.energy + pet.hygiene) / 5);
}

interface PetStore {
  pets: Pet[];
  selectedPet: Pet | null;
  overallHealth: number;
  loadPets: () => Promise<void>;
  loadPet: (id: number) => Promise<void>;
  feed: () => Promise<void>;
  giveWater: () => Promise<void>;
  play: () => Promise<void>;
  clean: () => Promise<void>;
}

export const usePetStore = create<PetStore>((set, get) => ({
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

    await updatePetStats(
      id,
      degraded.hunger,
      degraded.thirst,
      degraded.mood,
      degraded.energy,
      degraded.hygiene,
      now
    );

    const updated: Pet = {
      ...pet,
      hunger: degraded.hunger,
      thirst: degraded.thirst,
      mood: degraded.mood,
      energy: degraded.energy,
      hygiene: degraded.hygiene,
      last_update: now,
    };

    set({ selectedPet: updated, overallHealth: computeOverallHealth(updated) });
  },

  feed: async () => {
    const { selectedPet } = get();
    if (!selectedPet) return;
    const updated = applyAction(
      { hunger: selectedPet.hunger, thirst: selectedPet.thirst, mood: selectedPet.mood, energy: selectedPet.energy, hygiene: selectedPet.hygiene },
      "feed"
    );
    const now = Date.now();
    await updatePetStats(selectedPet.id, updated.hunger, updated.thirst, updated.mood, updated.energy, updated.hygiene, now);
    const next = { ...selectedPet, ...updated, last_update: now };
    set({ selectedPet: next, overallHealth: computeOverallHealth(next) });
  },

  giveWater: async () => {
    const { selectedPet } = get();
    if (!selectedPet) return;
    const updated = applyAction(
      { hunger: selectedPet.hunger, thirst: selectedPet.thirst, mood: selectedPet.mood, energy: selectedPet.energy, hygiene: selectedPet.hygiene },
      "water"
    );
    const now = Date.now();
    await updatePetStats(selectedPet.id, updated.hunger, updated.thirst, updated.mood, updated.energy, updated.hygiene, now);
    const next = { ...selectedPet, ...updated, last_update: now };
    set({ selectedPet: next, overallHealth: computeOverallHealth(next) });
  },

  play: async () => {
    const { selectedPet } = get();
    if (!selectedPet) return;
    const updated = applyAction(
      { hunger: selectedPet.hunger, thirst: selectedPet.thirst, mood: selectedPet.mood, energy: selectedPet.energy, hygiene: selectedPet.hygiene },
      "play"
    );
    const now = Date.now();
    await updatePetStats(selectedPet.id, updated.hunger, updated.thirst, updated.mood, updated.energy, updated.hygiene, now);
    const next = { ...selectedPet, ...updated, last_update: now };
    set({ selectedPet: next, overallHealth: computeOverallHealth(next) });
  },

  clean: async () => {
    const { selectedPet } = get();
    if (!selectedPet) return;
    const updated = applyAction(
      { hunger: selectedPet.hunger, thirst: selectedPet.thirst, mood: selectedPet.mood, energy: selectedPet.energy, hygiene: selectedPet.hygiene },
      "clean"
    );
    const now = Date.now();
    await updatePetStats(selectedPet.id, updated.hunger, updated.thirst, updated.mood, updated.energy, updated.hygiene, now);
    const next = { ...selectedPet, ...updated, last_update: now };
    set({ selectedPet: next, overallHealth: computeOverallHealth(next) });
  },
}));
