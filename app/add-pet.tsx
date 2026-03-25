import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { createPet } from "../database/petRepository";
import {
  PetForm,
  PetFormValues,
  defaultPetFormValues,
  toStorageDate,
} from "../components/PetForm";

export default function AddPetScreen() {
  const router = useRouter();
  const [form, setForm] = useState<PetFormValues>(defaultPetFormValues);

  const handleChange = (field: keyof PetFormValues, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await createPet({
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PetForm values={form} onChange={handleChange} />
      <Button mode="contained" onPress={handleSubmit} style={styles.submit}>
        {"Ajouter l'animal"}
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
