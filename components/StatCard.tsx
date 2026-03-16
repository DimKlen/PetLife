import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { GradientProgressBar } from "./GradientProgressBar";

interface Props {
  emoji: string;
  label: string;
  value: number; // 0-100
  gradient: [string, string, ...string[]];
}

export function StatCard({ emoji, label, value, gradient }: Props) {
  return (
    <View style={styles.card} accessibilityLabel={`${label} : ${value} sur 100`}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}%</Text>
      </View>
      <GradientProgressBar progress={value / 100} gradient={gradient} height={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
  },
});
