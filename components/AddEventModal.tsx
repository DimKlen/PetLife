import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
  Platform,
  Modal as RNModal,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Modal, Portal, Text, TextInput, Button, Chip, Menu } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePetStore } from "../store/petStore";
import {
  EventType,
  RepeatType,
  CalendarEvent,
  EVENT_CONFIG,
  REPEAT_CONFIG,
  REMINDER_OPTIONS,
  formatReminder,
} from "../types/event";

interface Props {
  visible: boolean;
  onDismiss: () => void;
  event?: CalendarEvent; // si fourni → mode édition
}

const EVENT_TYPES = Object.keys(EVENT_CONFIG) as EventType[];
const REPEAT_TYPES = Object.keys(REPEAT_CONFIG) as RepeatType[];

function timeStrToDate(t: string | null): Date {
  const d = new Date();
  if (t && /^\d{2}:\d{2}$/.test(t)) {
    const [h, m] = t.split(":").map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setMinutes(0, 0, 0);
  }
  return d;
}

export function AddEventModal({ visible, onDismiss, event }: Props) {
  const { pets, selectedDate, addEvent, updateEvent } = usePetStore();
  const isEdit = !!event;

  const [title,              setTitle]              = useState("");
  const [description,        setDescription]        = useState("");
  const [selectedType,       setSelectedType]       = useState<EventType>("custom");
  const [selectedPetIds,     setSelectedPetIds]     = useState<number[]>([]);
  const [allDay,             setAllDay]             = useState(false);
  const [startTime,          setStartTime]          = useState("");
  const [endTime,            setEndTime]            = useState("");
  const [repeat,             setRepeat]             = useState<RepeatType>("never");
  const [reminders,          setReminders]          = useState<number[]>([30]);
  const [loading,              setLoading]              = useState(false);
  const [repeatMenuVisible,    setRepeatMenuVisible]    = useState(false);
  const [reminderMenuVisible,  setReminderMenuVisible]  = useState(false);
  const [showStartPicker,      setShowStartPicker]      = useState(false);
  const [showEndPicker,        setShowEndPicker]        = useState(false);
  const [startDate,            setStartDate]            = useState(() => { const d = new Date(); d.setMinutes(0, 0, 0); return d; });
  const [endDate,              setEndDate]              = useState(() => { const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0); return d; });

  // Pré-remplit le formulaire à l'ouverture en mode édition
  useEffect(() => {
    if (visible && event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setSelectedType(event.type);
      setSelectedPetIds(event.petIds);
      setAllDay(event.allDay);
      setStartTime(event.startTime ?? "");
      setEndTime(event.endTime ?? "");
      setRepeat(event.repeat);
      setReminders(event.reminders.length > 0 ? event.reminders : [30]);
      setStartDate(timeStrToDate(event.startTime));
      setEndDate(timeStrToDate(event.endTime));
    } else if (!visible) {
      // reset quand le modal se ferme
      resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedType("custom");
    setSelectedPetIds([]);
    setAllDay(false);
    setStartTime("");
    setEndTime("");
    setRepeat("never");
    setReminders([30]);
    const now = new Date(); now.setMinutes(0, 0, 0);
    setStartDate(now);
    const later = new Date(now); later.setHours(later.getHours() + 1);
    setEndDate(later);
  };

  function dateToTimeStr(date: Date): string {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }

  const onStartChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowStartPicker(false);
    if (selected) { setStartDate(selected); setStartTime(dateToTimeStr(selected)); }
  };

  const onEndChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowEndPicker(false);
    if (selected) { setEndDate(selected); setEndTime(dateToTimeStr(selected)); }
  };

  const handleDismiss = () => {
    resetForm();
    onDismiss();
  };

  const togglePet = (petId: number) => {
    setSelectedPetIds((prev) =>
      prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]
    );
  };

  const isValidTime = (t: string) => t === "" || /^\d{2}:\d{2}$/.test(t); // utilisé pour le fallback web

  const addReminder = (minutes: number) => {
    if (!reminders.includes(minutes)) {
      setReminders((prev) => [...prev, minutes].sort((a, b) => a - b));
    }
    setReminderMenuVisible(false);
  };

  const removeReminder = (minutes: number) => {
    setReminders((prev) => prev.filter((r) => r !== minutes));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Le titre est requis.");
      return;
    }
    if (!allDay && startTime && !isValidTime(startTime)) {
      Alert.alert("Erreur", "Heure de début invalide. Format attendu : HH:MM");
      return;
    }
    if (!allDay && endTime && !isValidTime(endTime)) {
      Alert.alert("Erreur", "Heure de fin invalide. Format attendu : HH:MM");
      return;
    }

    setLoading(true);
    const data = {
      title:       title.trim(),
      description: description.trim() || null,
      date:        isEdit ? event!.date : selectedDate,
      allDay,
        startTime:   allDay ? null : (startTime.trim() || null),
        endTime:     allDay ? null : (endTime.trim() || null),
        petIds:      selectedPetIds,
        type:        selectedType,
        repeat,
        location:    null,
        reminders,
        completed:   isEdit ? event!.completed : false,
    };
    try {
      if (isEdit) {
        await updateEvent(event!.id, data);
      } else {
        await addEvent(data);
      }
      handleDismiss();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.modal}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.modalTitle}>{isEdit ? "Modifier l'événement" : "Nouvel événement"}</Text>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            compact
            style={styles.saveBtn}
          >
            {isEdit ? "Enregistrer" : "Sauvegarder"}
          </Button>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── Titre ── */}
          <TextInput
            label="Titre *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            accessibilityLabel="Titre de l'événement"
          />

          {/* ── Type d'événement ── */}
          <Text style={styles.sectionLabel}>Type</Text>
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

          {/* ── Animaux (multi-select) ── */}
          <Text style={styles.sectionLabel}>Animaux</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chips}>
              <TouchableOpacity
                onPress={() => setSelectedPetIds([])}
                style={[styles.petPill, selectedPetIds.length === 0 && styles.petPillSelected]}
                activeOpacity={0.7}
              >
                <Text style={[styles.petPillText, selectedPetIds.length === 0 && styles.petPillTextSelected]}>
                  🐾 Tous
                </Text>
              </TouchableOpacity>
              {pets.map((pet) => {
                const selected = selectedPetIds.includes(pet.id);
                return (
                  <TouchableOpacity
                    key={pet.id}
                    onPress={() => togglePet(pet.id)}
                    style={[styles.petPill, selected && styles.petPillSelected]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.petPillText, selected && styles.petPillTextSelected]}>
                      {pet.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* ── Toute la journée ── */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="weather-sunny" size={20} color="#667eea" />
              <Text style={styles.rowLabel}>Toute la journée</Text>
            </View>
            <Switch
              value={allDay}
              onValueChange={setAllDay}
              trackColor={{ false: "#ddd", true: "#667eea" }}
              thumbColor="white"
            />
          </View>

          {/* ── Horaires ── */}
          {!allDay && (
            <View style={styles.timeRow}>
              {Platform.OS === "web" ? (
                <>
                  <TextInput
                    label="Début (HH:MM)"
                    value={startTime}
                    onChangeText={setStartTime}
                    mode="outlined"
                    style={[styles.input, styles.flex]}
                    placeholder="09:00"
                    keyboardType="numeric"
                  />
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#bbb" />
                  <TextInput
                    label="Fin (HH:MM)"
                    value={endTime}
                    onChangeText={setEndTime}
                    mode="outlined"
                    style={[styles.input, styles.flex]}
                    placeholder="10:00"
                    keyboardType="numeric"
                  />
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.timePill, styles.flex]}
                    onPress={() => setShowStartPicker(true)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#667eea" />
                    <Text style={[styles.timePillText, !startTime && styles.timePillPlaceholder]}>
                      {startTime || "Début"}
                    </Text>
                  </TouchableOpacity>

                  <MaterialCommunityIcons name="arrow-right" size={18} color="#bbb" />

                  <TouchableOpacity
                    style={[styles.timePill, styles.flex]}
                    onPress={() => setShowEndPicker(true)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#667eea" />
                    <Text style={[styles.timePillText, !endTime && styles.timePillPlaceholder]}>
                      {endTime || "Fin"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* ── Time pickers (iOS + Android via RNModal, hors Portal) ── */}
          <TimePickerSheet
            visible={showStartPicker}
            label="Heure de début"
            value={startDate}
            onChange={onStartChange}
            onClose={() => setShowStartPicker(false)}
          />
          <TimePickerSheet
            visible={showEndPicker}
            label="Heure de fin"
            value={endDate}
            onChange={onEndChange}
            onClose={() => setShowEndPicker(false)}
          />

          {/* ── Répétition ── */}
          <Menu
            visible={repeatMenuVisible}
            onDismiss={() => setRepeatMenuVisible(false)}
            anchor={
              <TouchableOpacity style={styles.row} onPress={() => setRepeatMenuVisible(true)} activeOpacity={0.7}>
                <View style={styles.rowLeft}>
                  <MaterialCommunityIcons name="repeat" size={20} color="#667eea" />
                  <Text style={styles.rowLabel}>{REPEAT_CONFIG[repeat]}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#bbb" />
              </TouchableOpacity>
            }
          >
            {REPEAT_TYPES.map((r) => (
              <Menu.Item
                key={r}
                title={REPEAT_CONFIG[r]}
                leadingIcon={repeat === r ? "check" : undefined}
                onPress={() => { setRepeat(r); setRepeatMenuVisible(false); }}
              />
            ))}
          </Menu>

          {/* ── Lieu (placeholder) ── */}
          <TouchableOpacity style={styles.row} activeOpacity={0.6} disabled>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#ccc" />
              <Text style={[styles.rowLabel, styles.disabled]}>Ajouter un lieu</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#ddd" />
          </TouchableOpacity>

          {/* ── Notifications ── */}
          <View style={styles.notifSection}>
            <Text style={styles.sectionLabel}>Notifications</Text>

            {reminders.map((minutes) => (
              <View key={minutes} style={styles.reminderRow}>
                <MaterialCommunityIcons name="bell-outline" size={18} color="#667eea" />
                <Text style={styles.reminderText}>{formatReminder(minutes)}</Text>
                <TouchableOpacity onPress={() => removeReminder(minutes)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialCommunityIcons name="close" size={16} color="#bbb" />
                </TouchableOpacity>
              </View>
            ))}

            <Menu
              visible={reminderMenuVisible}
              onDismiss={() => setReminderMenuVisible(false)}
              anchor={
                <TouchableOpacity style={styles.addReminderBtn} onPress={() => setReminderMenuVisible(true)} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="plus" size={16} color="#667eea" />
                  <Text style={styles.addReminderText}>Ajouter une notification</Text>
                </TouchableOpacity>
              }
            >
              {REMINDER_OPTIONS.filter((o) => !reminders.includes(o.value)).map((opt) => (
                <Menu.Item
                  key={opt.value}
                  title={opt.label}
                  onPress={() => addReminder(opt.value)}
                />
              ))}
            </Menu>
          </View>

          {/* ── Description ── */}
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={[styles.input, styles.descriptionInput]}
          />

          <View style={styles.cancelRow}>
            <Button onPress={handleDismiss} disabled={loading} textColor="#888">
              Annuler
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

// ─── TimePickerSheet ──────────────────────────────────────────────────────────
// Rendu dans un RNModal natif (hors du Portal Paper) pour fonctionner
// correctement sur iOS et Android.

function TimePickerSheet({
  visible,
  label,
  value,
  onChange,
  onClose,
}: {
  visible: boolean;
  label: string;
  value: Date;
  onChange: (e: DateTimePickerEvent, date?: Date) => void;
  onClose: () => void;
}) {
  if (Platform.OS === "web") return null;

  return (
    <RNModal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity style={sheetStyles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={sheetStyles.sheet}>
          <View style={sheetStyles.handle} />
          <View style={sheetStyles.header}>
            <Text style={sheetStyles.title}>{label}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 16, right: 16 }}>
              <Text style={sheetStyles.done}>Valider</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={value}
            mode="time"
            display="spinner"
            is24Hour
            onChange={onChange}
            style={sheetStyles.picker}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  done: {
    fontSize: 16,
    fontWeight: "700",
    color: "#667eea",
  },
  picker: {
    height: 200,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  saveBtn: {
    backgroundColor: "#667eea",
  },
  input: {
    marginBottom: 12,
  },
  descriptionInput: {
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  petPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginBottom: 4,
  },
  petPillSelected: {
    backgroundColor: "#4c5fd5",
  },
  petPillText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  petPillTextSelected: {
    color: "white",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowLabel: {
    fontSize: 15,
    color: "#333",
  },
  disabled: {
    color: "#ccc",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  timePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  timePillText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  timePillPlaceholder: {
    color: "#aaa",
    fontWeight: "400",
  },
  flex: {
    flex: 1,
  },
  notifSection: {
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    marginBottom: 4,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  reminderText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  addReminderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    marginBottom: 8,
  },
  addReminderText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },
  cancelRow: {
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 4,
  },
});
