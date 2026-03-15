export interface Pet {
  id: number;
  name: string;
  type: string;
  race: string | null;
  age: number | null;
  photo: string | null;
  hunger: number;
  thirst: number;
  mood: number;
  energy: number;
  hygiene: number;
  last_update: number;
  created_at: number;
}

export type NewPet = Pick<Pet, "name" | "type"> &
  Partial<Pick<Pet, "race" | "age" | "photo">>;
