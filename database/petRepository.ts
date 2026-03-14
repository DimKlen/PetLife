import { getDatabase } from "./db";
import { Pet, NewPet } from "../types/pet";

export async function getAllPets(): Promise<Pet[]> {
  const db = await getDatabase();
  return db.getAllAsync<Pet>("SELECT * FROM pets ORDER BY created_at DESC");
}

export async function getPetById(id: number): Promise<Pet | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Pet>("SELECT * FROM pets WHERE id = ?", [id]);
}

export async function createPet(pet: NewPet): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO pets (name, type, race, age, photo, hunger, thirst, mood, last_update, created_at)
     VALUES (?, ?, ?, ?, ?, 100, 100, 100, ?, ?)`,
    [pet.name, pet.type, pet.race ?? null, pet.age ?? null, pet.photo ?? null, now, now]
  );
}

export async function updatePetStats(
  id: number,
  hunger: number,
  thirst: number,
  mood: number,
  lastUpdate: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE pets SET hunger = ?, thirst = ?, mood = ?, last_update = ? WHERE id = ?",
    [hunger, thirst, mood, lastUpdate, id]
  );
}
