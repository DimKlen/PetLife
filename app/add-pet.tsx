import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, Alert, Pressable } from "react-native";
import { TextInput, Button, Menu } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { createPet } from "../database/petRepository";

const RACES_BY_TYPE: Record<string, string[]> = {
  Chien: [
    "Labrador",
    "Berger Allemand",
    "Golden Retriever",
    "Bulldog Français",
    "Caniche",
    "Chihuahua",
    "Husky",
    "Beagle",
    "Rottweiler",
    "Yorkshire",
  ],
  Chat: [
    "Européen",
    "Siamois",
    "Persan",
    "Maine Coon",
    "British Shorthair",
    "Bengal",
    "Ragdoll",
    "Sphynx",
    "Abyssin",
    "Sacré de Birmanie",
  ],
  Lapin: [
    "Nain",
    "Bélier",
    "Rex",
    "Angora",
    "Hollandais",
    "Géant des Flandres",
  ],
  Hamster: ["Doré", "Russe", "Roborovski", "Chinois", "Campbell"],
  Cochon_d_Inde: ["Péruvien", "Abyssinien", "Shelty", "Couronné", "Rex"],
  Perroquet: [
    "Perruche",
    "Cacatoès",
    "Gris du Gabon",
    "Ara",
    "Inséparable",
    "Calopsitte",
  ],
  Poisson: [
    "Poisson rouge",
    "Betta",
    "Guppy",
    "Néon",
    "Scalaire",
    "Combattant",
  ],
  Tortue: [
    "Hermann",
    "Grecque",
    "Sulcata",
    "Pelomedusa",
    "Floride",
  ],
};

const PET_TYPES = Object.keys(RACES_BY_TYPE);

export default function AddPetScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [race, setRace] = useState("");
  const [age, setAge] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [raceMenuVisible, setRaceMenuVisible] = useState(false);

  const availableRaces = type ? RACES_BY_TYPE[type] ?? [] : [];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !type.trim()) {
      Alert.alert("Error", "Name and type are required.");
      return;
    }

    await createPet({
      name: name.trim(),
      type: type.trim(),
      race: race.trim() || undefined,
      age: age ? parseInt(age, 10) : undefined,
      photo: photo ?? undefined,
    });

    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        label="Name *"
        value={name}
        onChangeText={(text) => { if (/^[a-zA-ZÀ-ÿ\s]*$/.test(text)) setName(text); }}
        mode="outlined"
        style={styles.input}
        testID="input-name"
      />
      <Menu
        visible={typeMenuVisible}
        onDismiss={() => setTypeMenuVisible(false)}
        anchor={
          <Pressable testID="press-type" onPress={() => setTypeMenuVisible(true)}>
            <TextInput
              label="Type *"
              value={type}
              mode="outlined"
              style={styles.input}
              editable={false}
              testID="input-type"
              right={<TextInput.Icon icon="chevron-down" onPress={() => setTypeMenuVisible(true)} />}
              pointerEvents="none"
            />
          </Pressable>
        }
      >
        {PET_TYPES.map((t) => (
          <Menu.Item
            key={t}
            title={t.replace(/_/g, " ")}
            onPress={() => {
              setType(t);
              setRace("");
              setTypeMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      <Menu
        visible={raceMenuVisible}
        onDismiss={() => setRaceMenuVisible(false)}
        anchor={
          <Pressable
            testID="press-race"
            onPress={() => availableRaces.length > 0 && setRaceMenuVisible(true)}
            disabled={availableRaces.length === 0}
          >
            <TextInput
              label="Race"
              value={race}
              mode="outlined"
              style={styles.input}
              editable={false}
              testID="input-race"
              disabled={availableRaces.length === 0}
              right={<TextInput.Icon icon="chevron-down" onPress={() => setRaceMenuVisible(true)} />}
              pointerEvents="none"
            />
          </Pressable>
        }
      >
        {availableRaces.map((r) => (
          <Menu.Item
            key={r}
            title={r}
            onPress={() => {
              setRace(r);
              setRaceMenuVisible(false);
            }}
          />
        ))}
      </Menu>
      <TextInput
        label="Age"
        value={age}
        onChangeText={(text) => { if (/^\d*$/.test(text)) setAge(text); }}
        testID="input-age"
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
      />

      <Button mode="outlined" onPress={pickImage} style={styles.input}>
        {photo ? "Change Photo" : "Pick a Photo"}
      </Button>

      {photo && <Image source={{ uri: photo }} style={styles.preview} />}

      <Button mode="contained" onPress={handleSubmit} style={styles.submit}>
        Add Pet
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 16,
  },
  submit: {
    marginTop: 8,
  },
});
