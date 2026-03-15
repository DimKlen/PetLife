import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  progress: number; // 0 à 1
  gradient: [string, string, ...string[]];
  height?: number;
}

export function GradientProgressBar({ progress, gradient, height = 8 }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { height }]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${clamped * 100}%`, height }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: "#e8e8e8",
    borderRadius: 999,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    borderRadius: 999,
  },
});
