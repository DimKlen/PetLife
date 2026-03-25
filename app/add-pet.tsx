import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, Alert, Pressable } from "react-native";
import { TextInput, Button, Menu, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { createPet } from "../database/petRepository";
import { RACES_BY_TYPE, PET_TYPES } from "../constants/petTypes";
import { pickPetImage } from "../utils/imagePicker";
import { ColorPicker } from "../components/ColorPicker";
import { DEFAULT_PET_COLOR } from "../constants/petColors";

export default function AddPetScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [race, setRace] = useState("");
  const [age, setAge] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [color, setColor] = useState(DEFAULT_PET_COLOR);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [raceMenuVisible, setRaceMenuVisible] = useState(false);

  const availableRaces = type ? RACES_BY_TYPE[type] ?? [] : [];

  const handlePickImage = async () => {
    const uri = await pickPetImage();
    if (uri) setPhoto(uri);
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
      color,
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

      <Button mode="outlined" onPress={handlePickImage} style={styles.input}>
        {photo ? "Change Photo" : "Pick a Photo"}
      </Button>

      {photo && <Image source={{ uri: photo }} style={styles.preview} />}

      <View style={styles.colorSection}>
        <Text style={styles.colorLabel}>Couleur</Text>
        <View style={styles.colorPreviewRow}>
          <View style={[styles.colorDot, { backgroundColor: color }]} />
          <Text style={styles.colorHex}>{color}</Text>
        </View>
        <ColorPicker value={color} onChange={setColor} />
      </View>

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
  colorSection: {
    marginBottom: 12,
  },
  colorLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  colorPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  colorHex: {
    fontSize: 13,
    color: "#555",
    fontFamily: "monospace",
  },
  submit: {
    marginTop: 8,
  },
});
