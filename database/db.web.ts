import { Pet } from "../types/pet";

const STORAGE_KEY = "pet-health-app-pets";

function loadPets(): Pet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePets(pets: Pet[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
}

let nextId = 1;

function initNextId(pets: Pet[]) {
  if (pets.length > 0) {
    nextId = Math.max(...pets.map((p) => p.id)) + 1;
  }
}

// Initialize on load
initNextId(loadPets());

export const webDb = {
  loadPets,
  savePets,
  getNextId: () => nextId++,
};
