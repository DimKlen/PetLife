import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Modal, Portal, Text, TextInput, Button, Chip } from "react-native-paper";
import { usePetStore } from "../store/petStore";
import { EventType, EVENT_CONFIG } from "../types/event";

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

const EVENT_TYPES = Object.keys(EVENT_CONFIG) as EventType[];

export function AddEventModal({ visible, onDismiss }: Props) {
  const { pets, selectedDate, addEvent } = usePetStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState("");
  const [selectedType, setSelectedType] = useState<EventType>("custom");
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(selectedDate);
    setTime("");
    setSelectedType("custom");
    setSelectedPetId(null);
  };

  const handleDismiss = () => {
    resetForm();
    onDismiss();
  };

  const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);
  const isValidTime = (t: string) => t === "" || /^\d{2}:\d{2}$/.test(t);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Le titre est requis.");
      return;
    }
    if (!isValidDate(date)) {
      Alert.alert("Erreur", "Date invalide. Format attendu : YYYY-MM-DD");
      return;
    }
    if (!isValidTime(time)) {
      Alert.alert("Erreur", "Heure invalide. Format attendu : HH:MM");
      return;
    }

    setLoading(true);
    try {
      await addEvent({
        title: title.trim(),
        description: description.trim() || null,
        date,
        time: time.trim() || null,
        petId: selectedPetId,
        type: selectedType,
        reminder: false,
        reminderTime: null,
        completed: false,
      });
      handleDismiss();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Nouvel événement
          </Text>

          <TextInput
            label="Titre *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            accessibilityLabel="Titre de l'événement"
          />

          <TextInput
            label="Description (optionnel)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              label="Date (YYYY-MM-DD)"
              value={date}
              onChangeText={setDate}
              mode="outlined"
              style={[styles.input, styles.flex]}
            />
            <TextInput
              label="Heure (HH:MM)"
              value={time}
              onChangeText={setTime}
              mode="outlined"
              style={[styles.input, styles.flex]}
              placeholder="optionnel"
            />
          </View>

          {/* Type d'événement */}
          <Text style={styles.sectionLabel}>Type d'événement</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chips}>
              {EVENT_TYPES.map((type) => (
                <Chip
                  key={type}
                  selected={selectedType === type}
                  onPress={() => setSelectedType(type)}
                  style={styles.chip}
                  selectedColor={EVENT_CONFIG[type].color}
                >
                  {EVENT_CONFIG[type].icon} {EVENT_CONFIG[type].label}
                </Chip>
              ))}
            </View>
          </ScrollView>

          {/* Animal concerné */}
          <Text style={styles.sectionLabel}>Animal concerné</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chips}>
              <Chip
                selected={selectedPetId === null}
                onPress={() => setSelectedPetId(null)}
                style={styles.chip}
                selectedColor="#667eea"
              >
                🐾 Tous
              </Chip>
              {pets.map((pet) => (
                <Chip
                  key={pet.id}
                  selected={selectedPetId === pet.id}
                  onPress={() => setSelectedPetId(pet.id)}
                  style={styles.chip}
                  selectedColor="#667eea"
                >
                  {pet.name}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button onPress={handleDismiss} disabled={loading}>
              Annuler
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              Ajouter
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  modalTitle: {
    fontWeight: "700",
    marginBottom: 16,
    color: "#222",
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginBottom: 8,
    marginTop: 4,
  },
  chipsScroll: {
    marginBottom: 12,
  },
  chips: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
});
