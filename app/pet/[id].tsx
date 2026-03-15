import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { usePetStore } from "../../store/petStore";
import { StatCard } from "../../components/StatCard";
import { GradientButton } from "../../components/GradientButton";
import { ReminderCard } from "../../components/ReminderCard";

const STATS_CONFIG = [
  { key: "hunger" as const, emoji: "🍖", label: "Nourriture", gradient: ["#f093fb", "#f5576c"] as [string, string] },
  { key: "thirst" as const, emoji: "💧", label: "Hydratation", gradient: ["#4facfe", "#00f2fe"] as [string, string] },
  { key: "mood" as const, emoji: "😊", label: "Humeur", gradient: ["#43e97b", "#38f9d7"] as [string, string] },
  { key: "energy" as const, emoji: "⚡", label: "Énergie", gradient: ["#fa709a", "#fee140"] as [string, string] },
  { key: "hygiene" as const, emoji: "🛁", label: "Hygiène", gradient: ["#30cfd0", "#667eea"] as [string, string] },
];

export default function PetHubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedPet, overallHealth, loadPet, feed, giveWater, play, clean } = usePetStore();

  useFocusEffect(
    useCallback(() => {
      if (id) loadPet(Number(id));
    }, [id, loadPet])
  );

  if (!selectedPet) {
    return (
      <View style={styles.centered}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const getStatusBadges = () => {
    const badges: { emoji: string; label: string; bg: string }[] = [];
    if (selectedPet.mood > 70) badges.push({ emoji: "😊", label: "Joyeux", bg: "#c6f6d5" });
    if (selectedPet.hunger < 40) badges.push({ emoji: "🍖", label: "A faim", bg: "#fed7d7" });
    if (selectedPet.thirst < 40) badges.push({ emoji: "💧", label: "A soif", bg: "#bee3f8" });
    if (selectedPet.energy < 30) badges.push({ emoji: "😴", label: "Fatigué", bg: "#fef9c3" });
    if (selectedPet.hygiene < 40) badges.push({ emoji: "🛁", label: "Sale", bg: "#ede9fe" });
    if (badges.length === 0) badges.push({ emoji: "✨", label: "En forme", bg: "#c6f6d5" });
    return badges;
  };

  const getReminders = () => [
    {
      icon: "food-drumstick" as const,
      title: selectedPet.hunger < 50 ? "Repas bientôt !" : "Prochain repas",
      subtitle: selectedPet.hunger < 50 ? "Ton animal a faim" : "Nourriture suffisante",
      color: "#f5576c",
    },
    {
      icon: "shower" as const,
      title: selectedPet.hygiene < 50 ? "Bain nécessaire !" : "Prochain bain",
      subtitle: selectedPet.hygiene < 50 ? "Ton animal est sale" : "Hygiène correcte",
      color: "#30cfd0",
    },
    {
      icon: "medical-bag" as const,
      title: "Vétérinaire",
      subtitle: overallHealth < 50 ? "Visite recommandée" : "Prochain contrôle dans 30j",
      color: "#667eea",
    },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Header gradient */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerNav}>
          <IconButton
            icon="arrow-left"
            iconColor="white"
            size={22}
            onPress={() => router.back()}
            accessibilityLabel="Retour"
          />
          <IconButton
            icon="pencil"
            iconColor="white"
            size={22}
            onPress={() => router.push(`/edit-pet/${id}` as never)}
            accessibilityLabel="Modifier le pet"
          />
        </View>

        {selectedPet.photo ? (
          <Image source={{ uri: selectedPet.photo }} style={styles.photo} />
        ) : (
          <Image source={require("../../assets/images/icon.png")} style={styles.photo} />
        )}

        <Text style={styles.petName}>{selectedPet.name}</Text>
        <Text style={styles.petInfo}>
          {selectedPet.type}
          {selectedPet.race ? ` · ${selectedPet.race}` : ""}
          {selectedPet.age ? ` · ${selectedPet.age} ans` : ""}
        </Text>

        <View style={styles.healthCard}>
          <Text style={styles.healthLabel}>Santé globale</Text>
          <Text style={styles.healthScore}>{overallHealth}%</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Badges de statut */}
        <View style={styles.badgesRow}>
          {getStatusBadges().map((badge, i) => (
            <View key={i} style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={styles.badgeText}>{badge.emoji} {badge.label}</Text>
            </View>
          ))}
        </View>

        {/* Statistiques */}
        <Text style={styles.sectionTitle}>Statistiques</Text>
        {STATS_CONFIG.map((stat) => (
          <StatCard
            key={stat.key}
            emoji={stat.emoji}
            label={stat.label}
            value={selectedPet[stat.key]}
            gradient={stat.gradient}
          />
        ))}

        {/* Actions rapides */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          <GradientButton
            label="Nourrir"
            icon="food-drumstick"
            gradient={["#f093fb", "#f5576c"]}
            onPress={feed}
            accessibilityLabel="Nourrir le pet"
          />
          <GradientButton
            label="Donner à boire"
            icon="water"
            gradient={["#4facfe", "#00f2fe"]}
            onPress={giveWater}
            accessibilityLabel="Donner à boire au pet"
          />
          <GradientButton
            label="Jouer"
            icon="tennis"
            gradient={["#43e97b", "#38f9d7"]}
            onPress={play}
            accessibilityLabel="Jouer avec le pet"
          />
          <GradientButton
            label="Nettoyer"
            icon="shower"
            gradient={["#30cfd0", "#667eea"]}
            onPress={clean}
            accessibilityLabel="Nettoyer le pet"
          />
        </View>

        {/* Rappels */}
        <Text style={styles.sectionTitle}>Rappels</Text>
        {getReminders().map((reminder, i) => (
          <ReminderCard
            key={i}
            icon={reminder.icon}
            title={reminder.title}
            subtitle={reminder.subtitle}
            color={reminder.color}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingBottom: 28,
  },
  headerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 10,
  },
  petName: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  petInfo: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    marginBottom: 16,
  },
  healthCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 10,
    alignItems: "center",
  },
  healthLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
  },
  healthScore: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
  },
  body: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
    marginTop: 8,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
});
