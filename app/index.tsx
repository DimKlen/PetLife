import React, { useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { FAB, Text } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { usePetStore } from "../store/petStore";
import PetCard from "../components/PetCard";

export default function HomeScreen() {
  const router = useRouter();
  const { pets, loadPets } = usePetStore();

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [loadPets])
  );

  return (
    <View style={styles.container}>
      {pets.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="headlineSmall">No pets yet!</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Tap the + button to add your first pet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PetCard
              pet={item}
              onPress={() => router.push(`/pet-hub/${item.id}` as never)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/add-pet")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  list: {
    padding: 16,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#888",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
