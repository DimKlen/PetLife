import * as ImagePicker from "expo-image-picker";

export async function pickPetImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  return result.canceled ? null : (result.assets[0]?.uri ?? null);
}
