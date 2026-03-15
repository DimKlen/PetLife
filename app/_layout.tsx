import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "My Pets" }} />
        <Stack.Screen name="add-pet" options={{ title: "Add Pet" }} />
        <Stack.Screen name="pet/[id]" options={{ title: "Pet Hub" }} />
        <Stack.Screen name="edit-pet/[id]" options={{ title: "Edit Pet" }} />
      </Stack>
    </PaperProvider>
  );
}
