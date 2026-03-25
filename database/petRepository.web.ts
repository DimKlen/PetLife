import { Pet, NewPet } from "../types/pet";
import { webDb } from "./db.web";

export async function getAllPets(): Promise<Pet[]> {
  return webDb.loadPets();
}

export async function getPetById(id: number): Promise<Pet | null> {
  const pets = webDb.loadPets();
  return pets.find((p) => p.id === id) ?? null;
}

export async function createPet(pet: NewPet): Promise<void> {
  const pets = webDb.loadPets();
  const now = Date.now();
  const newPet: Pet = {
    id: webDb.getNextId(),
    name: pet.name,
    type: pet.type,
    race: pet.race ?? null,
    age: pet.age ?? null,
    photo: pet.photo ?? null,
    color: pet.color ?? null,
    sexe: pet.sexe ?? null,
    date_naissance: pet.date_naissance ?? null,
    couleur_pelage: pet.couleur_pelage ?? null,
    apparence: pet.apparence ?? null,
    poids: pet.poids ?? null,
    sterilise: pet.sterilise ?? false,
    vaccins: pet.vaccins ?? [],
    allergies: pet.allergies ?? [],
    maladies: pet.maladies ?? [],
    traitements: pet.traitements ?? null,
    proprio_nom: pet.proprio_nom ?? null,
    proprio_tel: pet.proprio_tel ?? null,
    proprio_email: pet.proprio_email ?? null,
    proprio_adresse: pet.proprio_adresse ?? null,
    vet_nom: pet.vet_nom ?? null,
    vet_adresse: pet.vet_adresse ?? null,
    vet_tel: pet.vet_tel ?? null,
    hunger: 100,
    thirst: 100,
    mood: 100,
    last_update: now,
    created_at: now,
  };
  pets.unshift(newPet);
  webDb.savePets(pets);
}

export async function updatePetInfo(id: number, pet: NewPet & { name: string }): Promise<void> {
  const pets = webDb.loadPets();
  const index = pets.findIndex((p) => p.id === id);
  if (index === -1) return;
  pets[index] = {
    ...pets[index],
    name: pet.name,
    type: pet.type,
    race: pet.race ?? null,
    age: pet.age ?? null,
    photo: pet.photo ?? null,
    color: pet.color ?? null,
    sexe: pet.sexe ?? null,
    date_naissance: pet.date_naissance ?? null,
    couleur_pelage: pet.couleur_pelage ?? null,
    apparence: pet.apparence ?? null,
    poids: pet.poids ?? null,
    sterilise: pet.sterilise ?? false,
    vaccins: pet.vaccins ?? [],
    allergies: pet.allergies ?? [],
    maladies: pet.maladies ?? [],
    traitements: pet.traitements ?? null,
    proprio_nom: pet.proprio_nom ?? null,
    proprio_tel: pet.proprio_tel ?? null,
    proprio_email: pet.proprio_email ?? null,
    proprio_adresse: pet.proprio_adresse ?? null,
    vet_nom: pet.vet_nom ?? null,
    vet_adresse: pet.vet_adresse ?? null,
    vet_tel: pet.vet_tel ?? null,
  };
  webDb.savePets(pets);
}

export async function updatePetStats(
  id: number,
  hunger: number,
  thirst: number,
  mood: number,
  lastUpdate: number
): Promise<void> {
  const pets = webDb.loadPets();
  const index = pets.findIndex((p) => p.id === id);
  if (index === -1) return;
  pets[index] = { ...pets[index], hunger, thirst, mood, last_update: lastUpdate };
  webDb.savePets(pets);
}
