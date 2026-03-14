import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { usePetStore } from "../../store/petStore";
import HealthBar from "../../components/HealthBar";
import ActionButtons from "../../components/ActionButtons";

export default function PetHubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedPet, loadPet, performAction } = usePetStore();

  useEffect(() => {
    if (id) {
      loadPet(Number(id));
    }
  }, [id, loadPet]);

  if (!selectedPet) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {selectedPet.photo ? (
        <Image source={{ uri: selectedPet.photo }} style={styles.photo} />
      ) : (
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.photo}
        />
      )}

      <Text variant="headlineMedium" style={styles.name}>
        {selectedPet.name}
      </Text>
      <Text variant="bodyLarge" style={styles.type}>
        {selectedPet.type}
        {selectedPet.race ? ` · ${selectedPet.race}` : ""}
        {selectedPet.age ? ` · ${selectedPet.age} years` : ""}
      </Text>

      <View style={styles.bars}>
        <HealthBar label="Hunger" value={selectedPet.hunger} color="#e74c3c" />
        <HealthBar label="Thirst" value={selectedPet.thirst} color="#3498db" />
        <HealthBar label="Mood" value={selectedPet.mood} color="#f1c40f" />
      </View>

      <ActionButtons
        onFeed={() => performAction("feed")}
        onWater={() => performAction("water")}
        onPlay={() => performAction("play")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    backgroundColor: "#eee",
  },
  name: {
    fontWeight: "700",
  },
  type: {
    color: "#666",
    marginBottom: 16,
  },
  bars: {
    width: "100%",
    marginTop: 8,
  },
});
