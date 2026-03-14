import { create } from "zustand";
import { Pet } from "../types/pet";
import { getAllPets, getPetById, updatePetStats } from "../database/petRepository";
import { applyTimeDegradation, applyAction } from "../engine/tamagotchiEngine";

interface PetStore {
  pets: Pet[];
  selectedPet: Pet | null;
  loadPets: () => Promise<void>;
  loadPet: (id: number) => Promise<void>;
  performAction: (action: "feed" | "water" | "play") => Promise<void>;
}

export const usePetStore = create<PetStore>((set, get) => ({
  pets: [],
  selectedPet: null,

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

    set({
      selectedPet: {
        ...pet,
        hunger: degraded.hunger,
        thirst: degraded.thirst,
        mood: degraded.mood,
        last_update: now,
      },
    });
  },

  performAction: async (action) => {
    const { selectedPet } = get();
    if (!selectedPet) return;

    const current = {
      hunger: selectedPet.hunger,
      thirst: selectedPet.thirst,
      mood: selectedPet.mood,
    };

    const updated = applyAction(current, action);
    const now = Date.now();

    await updatePetStats(selectedPet.id, updated.hunger, updated.thirst, updated.mood, now);

    set({
      selectedPet: {
        ...selectedPet,
        ...updated,
        last_update: now,
      },
    });
  },
}));
