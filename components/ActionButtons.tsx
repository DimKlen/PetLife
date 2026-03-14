import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

interface ActionButtonsProps {
  onFeed: () => void;
  onWater: () => void;
  onPlay: () => void;
}

export default function ActionButtons({ onFeed, onWater, onPlay }: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={onFeed} style={styles.button} buttonColor="#e74c3c">
        Feed
      </Button>
      <Button mode="contained" onPress={onWater} style={styles.button} buttonColor="#3498db">
        Give Water
      </Button>
      <Button mode="contained" onPress={onPlay} style={styles.button} buttonColor="#f1c40f">
        Play
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
