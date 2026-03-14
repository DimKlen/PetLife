// Placeholder for future notification logic (MVP Phase 1 — no notifications yet)
export function checkPetStatus(_hunger: number, _thirst: number, _mood: number): string | null {
  if (_hunger <= 20 || _thirst <= 20 || _mood <= 20) {
    return "Your pet needs attention!";
  }
  return null;
}
