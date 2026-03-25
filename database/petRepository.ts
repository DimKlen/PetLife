import { getDatabase } from "./db";
import { Pet, NewPet } from "../types/pet";

function parsePet(row: Record<string, unknown>): Pet {
  return {
    ...(row as unknown as Pet),
    sterilise: Boolean(row.sterilise),
    vaccins: (() => { try { return JSON.parse((row.vaccins as string) || "[]"); } catch { return []; } })(),
    allergies: (() => { try { return JSON.parse((row.allergies as string) || "[]"); } catch { return []; } })(),
    maladies: (() => { try { return JSON.parse((row.maladies as string) || "[]"); } catch { return []; } })(),
  };
}

export async function getAllPets(): Promise<Pet[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM pets ORDER BY created_at DESC");
  return rows.map(parsePet);
}

export async function getPetById(id: number): Promise<Pet | null> {
  const row = await (await getDatabase()).getFirstAsync<Record<string, unknown>>(
    "SELECT * FROM pets WHERE id = ?", [id]
  );
  return row ? parsePet(row) : null;
}

export async function createPet(pet: NewPet): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO pets (
      name, type, race, age, photo, color,
      sexe, date_naissance, couleur_pelage, apparence,
      poids, sterilise, vaccins, allergies, maladies, traitements,
      proprio_nom, proprio_tel, proprio_email, proprio_adresse,
      vet_nom, vet_adresse, vet_tel,
      hunger, thirst, mood, last_update, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 100, 100, 100, ?, ?)`,
    [
      pet.name, pet.type, pet.race ?? null, pet.age ?? null, pet.photo ?? null, pet.color ?? null,
      pet.sexe ?? null, pet.date_naissance ?? null, pet.couleur_pelage ?? null, pet.apparence ?? null,
      pet.poids ?? null, pet.sterilise ? 1 : 0,
      JSON.stringify(pet.vaccins ?? []),
      JSON.stringify(pet.allergies ?? []),
      JSON.stringify(pet.maladies ?? []),
      pet.traitements ?? null,
      pet.proprio_nom ?? null, pet.proprio_tel ?? null, pet.proprio_email ?? null, pet.proprio_adresse ?? null,
      pet.vet_nom ?? null, pet.vet_adresse ?? null, pet.vet_tel ?? null,
      now, now,
    ]
  );
}

export async function updatePetInfo(id: number, pet: NewPet & { name: string }): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE pets SET
      name=?, type=?, race=?, age=?, photo=?, color=?,
      sexe=?, date_naissance=?, couleur_pelage=?, apparence=?,
      poids=?, sterilise=?, vaccins=?, allergies=?, maladies=?, traitements=?,
      proprio_nom=?, proprio_tel=?, proprio_email=?, proprio_adresse=?,
      vet_nom=?, vet_adresse=?, vet_tel=?
    WHERE id=?`,
    [
      pet.name, pet.type, pet.race ?? null, pet.age ?? null, pet.photo ?? null, pet.color ?? null,
      pet.sexe ?? null, pet.date_naissance ?? null, pet.couleur_pelage ?? null, pet.apparence ?? null,
      pet.poids ?? null, pet.sterilise ? 1 : 0,
      JSON.stringify(pet.vaccins ?? []),
      JSON.stringify(pet.allergies ?? []),
      JSON.stringify(pet.maladies ?? []),
      pet.traitements ?? null,
      pet.proprio_nom ?? null, pet.proprio_tel ?? null, pet.proprio_email ?? null, pet.proprio_adresse ?? null,
      pet.vet_nom ?? null, pet.vet_adresse ?? null, pet.vet_tel ?? null,
      id,
    ]
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
