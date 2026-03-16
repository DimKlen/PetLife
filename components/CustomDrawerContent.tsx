import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePetStore } from "../store/petStore";

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { pets } = usePetStore();
  const { state, navigation } = props;

  const isActive = (name: string) => state.routes[state.index]?.name === name;

  const goToDrawerScreen = (screen: string) => {
    navigation.navigate(screen);
  };

  const goToPet = (petId: number) => {
    navigation.closeDrawer();
    // Petit délai pour laisser le drawer se fermer avant la navigation Stack
    setTimeout(() => router.push(`/pet/${petId}` as never), 200);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
      {/* Header gradient */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <MaterialCommunityIcons name="paw" size={48} color="rgba(255,255,255,0.9)" />
        <Text style={styles.title}>PetLife</Text>
        <Text style={styles.subtitle}>
          {pets.length} animal{pets.length !== 1 ? "x" : ""}
        </Text>
      </LinearGradient>

      {/* Navigation principale */}
      <View style={styles.section}>
        <DrawerItem
          icon="home"
          label="Mes Animaux"
          active={isActive("index")}
          onPress={() => goToDrawerScreen("index")}
        />
        <DrawerItem
          icon="calendar"
          label="Calendrier"
          active={isActive("calendar")}
          onPress={() => goToDrawerScreen("calendar")}
        />
      </View>

      {/* Accès rapide aux pets */}
      {pets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Accès rapide</Text>
          {pets.slice(0, 4).map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={styles.petRow}
              onPress={() => goToPet(pet.id)}
              activeOpacity={0.7}
              accessibilityLabel={`Voir le profil de ${pet.name}`}
            >
              {pet.photo ? (
                <Image source={{ uri: pet.photo }} style={styles.petPhoto} />
              ) : (
                <View style={styles.petPhotoPlaceholder}>
                  <MaterialCommunityIcons name="paw" size={18} color="#667eea" />
                </View>
              )}
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petType}>{pet.type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </DrawerContentScrollView>
  );
}

function DrawerItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.drawerItem, active && styles.drawerItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={active ? "#667eea" : "#555"}
        style={styles.drawerIcon}
      />
      <Text style={[styles.drawerLabel, active && styles.drawerLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 24,
    paddingTop: 48,
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10,
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#aaa",
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  drawerItemActive: {
    backgroundColor: "#ede9fe",
  },
  drawerIcon: {
    marginRight: 14,
  },
  drawerLabel: {
    fontSize: 15,
    color: "#333",
  },
  drawerLabelActive: {
    color: "#667eea",
    fontWeight: "700",
  },
  petRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    borderRadius: 10,
  },
  petPhoto: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 12,
  },
  petPhotoPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  petName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  petType: {
    fontSize: 12,
    color: "#888",
  },
});
