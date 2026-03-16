import { Pet } from "../types/pet";

const DECAY_PER_HOUR = {
  hunger: 5,
  thirst: 7,
  mood: 3,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function applyTimeDegradation(pet: Pet): {
  hunger: number;
  thirst: number;
  mood: number;
} {
  const now = Date.now();
  const hoursElapsed = (now - pet.last_update) / (1000 * 60 * 60);

  return {
    hunger: clamp(Math.round(pet.hunger - DECAY_PER_HOUR.hunger * hoursElapsed), 0, 100),
    thirst: clamp(Math.round(pet.thirst - DECAY_PER_HOUR.thirst * hoursElapsed), 0, 100),
    mood: clamp(Math.round(pet.mood - DECAY_PER_HOUR.mood * hoursElapsed), 0, 100),
  };
}

export function applyAction(
  current: { hunger: number; thirst: number; mood: number },
  action: "feed" | "water" | "play"
): { hunger: number; thirst: number; mood: number } {
  const result = { ...current };

  switch (action) {
    case "feed":
      result.hunger = clamp(result.hunger + 30, 0, 100);
      break;
    case "water":
      result.thirst = clamp(result.thirst + 35, 0, 100);
      break;
    case "play":
      result.mood = clamp(result.mood + 25, 0, 100);
      result.hunger = clamp(result.hunger - 10, 0, 100);
      break;
  }

  return result;
}
