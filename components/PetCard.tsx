import React from "react";
import { StyleSheet, Image } from "react-native";
import { Card, Text, ProgressBar } from "react-native-paper";
import { Pet } from "../types/pet";

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
}

export default function PetCard({ pet, onPress }: PetCardProps) {
  const avgHealth = Math.round((pet.hunger + pet.thirst + pet.mood) / 3);

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        {pet.photo ? (
          <Image source={{ uri: pet.photo }} style={styles.photo} />
        ) : (
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.photo}
          />
        )}
        <Text variant="titleMedium" style={styles.name}>
          {pet.name}
        </Text>
        <Text variant="bodySmall" style={styles.type}>
          {pet.type}
          {pet.race ? ` · ${pet.race}` : ""}
        </Text>
        <Text variant="bodySmall" style={styles.healthLabel}>
          Health: {avgHealth}%
        </Text>
        <ProgressBar
          progress={avgHealth / 100}
          color={avgHealth > 60 ? "#2ecc71" : avgHealth > 30 ? "#f39c12" : "#e74c3c"}
          style={styles.bar}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    alignItems: "center",
    paddingVertical: 16,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  name: {
    fontWeight: "700",
  },
  type: {
    color: "#666",
    marginBottom: 8,
  },
  healthLabel: {
    marginBottom: 4,
  },
  bar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
  },
});
