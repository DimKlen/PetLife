import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  gradient: [string, string, ...string[]];
  onPress: () => void;
  accessibilityLabel?: string;
}

export function GradientButton({ label, icon, gradient, onPress, accessibilityLabel }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.wrapper}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <View style={styles.content}>
          <MaterialCommunityIcons name={icon} size={26} color="white" />
          <Text style={styles.label}>{label}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: "45%",
  },
  button: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  content: {
    alignItems: "center",
    gap: 6,
  },
  label: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },
});
