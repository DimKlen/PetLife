import React from "react";
import { View, StyleSheet } from "react-native";
import { ProgressBar, Text } from "react-native-paper";

interface HealthBarProps {
  label: string;
  value: number;
  color: string;
}

export default function HealthBar({ label, value, color }: HealthBarProps) {
  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={styles.label}>
        {label}: {value}%
      </Text>
      <ProgressBar progress={value / 100} color={color} style={styles.bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 4,
    fontWeight: "600",
  },
  bar: {
    height: 10,
    borderRadius: 5,
  },
});
