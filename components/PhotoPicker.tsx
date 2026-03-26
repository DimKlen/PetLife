import React from "react";
import { View, Image, StyleSheet, Pressable } from "react-native";
import { TextInput, Text } from "react-native-paper";
import { pickPetImage } from "../utils/imagePicker";

interface Props {
  photo: string | null;
  onChange: (uri: string | null) => void;
}

export function PhotoPicker({ photo, onChange }: Props) {
  const handlePick = async () => {
    const uri = await pickPetImage();
    if (uri) onChange(uri);
  };

  return (
    <View style={styles.row}>
      <View style={styles.btn}>
        <TextInput
          label={photo ? "Changer la photo" : "Ajouter une photo"}
          value=""
          mode="outlined"
          editable={false}
          right={<TextInput.Icon icon="camera" onPress={handlePick} />}
          onPressIn={handlePick}
          pointerEvents="box-none"
          style={styles.input}
        />
      </View>
      {photo && (
        <View style={styles.previewWrapper}>
          <Image source={{ uri: photo }} style={styles.preview} />
          <Pressable style={styles.removeBtn} onPress={() => onChange(null)} hitSlop={6}>
            <Text style={styles.removeBtnText}>✕</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  btn: { flex: 1 },
  input: {},
  previewWrapper: {
    position: "relative",
    width: 56,
    height: 56,
  },
  preview: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  removeBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#333",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: {
    color: "#fff",
    fontSize: 10,
    lineHeight: 12,
  },
});
