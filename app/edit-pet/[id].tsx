import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getPetById, updatePetInfo } from "../../database/petRepository";
import {
  PetForm,
  PetFormValues,
  defaultPetFormValues,
  toStorageDate,
  fromStorageDate,
} from "../../components/PetForm";
import { DEFAULT_PET_COLOR } from "../../constants/petColors";

export default function EditPetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState<PetFormValues>(defaultPetFormValues);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPetById(Number(id)).then((pet) => {
      if (!pet) return;
      setForm({
        name: pet.name,
        type: pet.type,
        race: pet.race ?? "",
        age: pet.age != null ? String(pet.age) : "",
        photo: pet.photo ?? null,
        color: pet.color ?? DEFAULT_PET_COLOR,
        sexe: pet.sexe ?? "",
        dateNaissance: fromStorageDate(pet.date_naissance),
        couleurPelage: pet.couleur_pelage ?? "",
        apparence: pet.apparence ?? "",
        poids: pet.poids != null ? String(pet.poids) : "",
        sterilise: pet.sterilise ?? false,
        vaccins: pet.vaccins ?? [],
        allergies: pet.allergies ?? [],
        maladies: pet.maladies ?? [],
        traitements: pet.traitements ?? "",
        proprioNom: pet.proprio_nom ?? "",
        proprioTel: pet.proprio_tel ?? "",
        proprioEmail: pet.proprio_email ?? "",
        proprioAdresse: pet.proprio_adresse ?? "",
        vetNom: pet.vet_nom ?? "",
        vetAdresse: pet.vet_adresse ?? "",
        vetTel: pet.vet_tel ?? "",
      });
      setLoaded(true);
    });
  }, [id]);

  const handleChange = (field: keyof PetFormValues, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await updatePetInfo(Number(id), {
      name: form.name.trim(),
      type: form.type.trim(),
      race: form.race.trim() || undefined,
      age: form.age ? parseInt(form.age, 10) : undefined,
      photo: form.photo ?? undefined,
      color: form.color,
      sexe: form.sexe || undefined,
      date_naissance: toStorageDate(form.dateNaissance) ?? undefined,
      couleur_pelage: form.couleurPelage || undefined,
      apparence: form.apparence || undefined,
      poids: form.poids ? parseFloat(form.poids) : undefined,
      sterilise: form.sterilise,
      vaccins: form.vaccins,
      allergies: form.allergies,
      maladies: form.maladies,
      traitements: form.traitements.trim() || undefined,
      proprio_nom: form.proprioNom.trim() || undefined,
      proprio_tel: form.proprioTel.trim() || undefined,
      proprio_email: form.proprioEmail.trim() || undefined,
      proprio_adresse: form.proprioAdresse.trim() || undefined,
      vet_nom: form.vetNom.trim() || undefined,
      vet_adresse: form.vetAdresse.trim() || undefined,
      vet_tel: form.vetTel.trim() || undefined,
    });

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (!loaded) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PetForm values={form} onChange={handleChange} />
      <Button mode="contained" onPress={handleSubmit} style={styles.submit}>
        Enregistrer
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  submit: {
    marginTop: 8,
  },
});
