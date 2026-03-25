export interface Pet {
  id: number;
  name: string;
  type: string;
  race: string | null;
  age: number | null;
  photo: string | null;
  color: string | null;
  // Informations complémentaires
  sexe: string | null;
  date_naissance: string | null; // YYYY-MM-DD
  couleur_pelage: string | null;
  apparence: string | null;
  // Santé
  poids: number | null;
  sterilise: boolean;
  vaccins: string[];
  allergies: string[];
  maladies: string[];
  traitements: string | null;
  // Propriétaire
  proprio_nom: string | null;
  proprio_tel: string | null;
  proprio_email: string | null;
  proprio_adresse: string | null;
  // Vétérinaire
  vet_nom: string | null;
  vet_adresse: string | null;
  vet_tel: string | null;
  // Stats Tamagotchi
  hunger: number;
  thirst: number;
  mood: number;
  last_update: number;
  created_at: number;
}

export type NewPet = Pick<Pet, "name" | "type"> &
  Partial<Omit<Pet, "id" | "name" | "type" | "hunger" | "thirst" | "mood" | "last_update" | "created_at">>;
