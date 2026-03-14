import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { createPet } from "../database/petRepository";

export default function AddPetScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [race, setRace] = useState("");
  const [age, setAge] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

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
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Type *"
        value={type}
        onChangeText={setType}
        mode="outlined"
        style={styles.input}
        placeholder="e.g. Dog, Cat, Hamster"
      />
      <TextInput
        label="Race"
        value={race}
        onChangeText={setRace}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Age"
        value={age}
        onChangeText={setAge}
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
