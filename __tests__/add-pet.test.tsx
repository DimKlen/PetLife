import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import AddPetScreen from "../app/add-pet";

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, left: 0, bottom: 34, right: 0 } }}>
      <PaperProvider>
        <AddPetScreen />
      </PaperProvider>
    </SafeAreaProvider>
  );

// Mock expo-router
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

// Mock database
const mockCreatePet = jest.fn().mockResolvedValue(undefined);
jest.mock("../database/petRepository", () => ({
  createPet: (...args: unknown[]) => mockCreatePet(...args),
}));

// Mock expo-image-picker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
}));

// Mock Menu pour éviter le Portal de react-native-paper qui n'est pas capturé par le test renderer
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    Menu: Object.assign(
      ({ visible, children, anchor }: { visible: boolean; children: React.ReactNode; anchor: React.ReactNode }) => (
        <>{anchor}{visible ? children : null}</>
      ),
      { Item: actual.Menu.Item }
    ),
  };
});

describe("AddPetScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("crée un animal avec les informations renseignées", async () => {
    const { getByTestId, getByText, findByText } = renderScreen();

    // Remplir le nom
    fireEvent.changeText(getByTestId("input-name"), "Rex");

    // Ouvrir le dropdown Type et sélectionner "Chien"
    fireEvent.press(getByTestId("press-type"));
    fireEvent.press(await findByText("Chien"));

    // Ouvrir le dropdown Race et sélectionner "Labrador"
    fireEvent.press(getByTestId("press-race"));
    fireEvent.press(await findByText("Labrador"));

    // Remplir l'âge
    fireEvent.changeText(getByTestId("input-age"), "3");

    // Soumettre le formulaire
    fireEvent.press(getByText("Add Pet"));

    await waitFor(() => {
      expect(mockCreatePet).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Rex",
          type: "Chien",
          race: "Labrador",
          age: 3,
          photo: undefined,
        })
      );
    });

    expect(mockBack).toHaveBeenCalled();
  });

  it("bloque la soumission si le nom est vide", async () => {
    const { getByText } = renderScreen();

    fireEvent.press(getByText("Add Pet"));

    await waitFor(() => {
      expect(mockCreatePet).not.toHaveBeenCalled();
    });
  });

  it("refuse les caractères non alphabétiques dans le nom", () => {
    const { getByTestId } = renderScreen();
    const nameInput = getByTestId("input-name");

    fireEvent.changeText(nameInput, "Rex123");
    expect(nameInput.props.value).toBe("");

    fireEvent.changeText(nameInput, "Rex");
    expect(nameInput.props.value).toBe("Rex");
  });

  it("refuse les lettres dans le champ âge", () => {
    const { getByTestId } = renderScreen();
    const ageInput = getByTestId("input-age");

    fireEvent.changeText(ageInput, "abc");
    expect(ageInput.props.value).toBe("");

    fireEvent.changeText(ageInput, "5");
    expect(ageInput.props.value).toBe("5");
  });
});
