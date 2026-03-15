import React, { useCallback, useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Appbar, FAB, Chip, Text } from "react-native-paper";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "expo-router";
import { Calendar, DateData } from "react-native-calendars";
import { usePetStore } from "../../store/petStore";
import { EventCard } from "../../components/EventCard";
import { AddEventModal } from "../../components/AddEventModal";
import { getEventColor } from "../../types/event";

export default function CalendarScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const {
    pets,
    events,
    selectedDate,
    filterPetId,
    loadEvents,
    setSelectedDate,
    setFilterPetId,
    getEventsByDate,
  } = usePetStore();

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const getMarkedDates = () => {
    const marked: Record<string, {
      marked?: boolean;
      dotColor?: string;
      dots?: { color: string }[];
      selected?: boolean;
      selectedColor?: string;
    }> = {};

    events.forEach((event) => {
      if (filterPetId !== null && event.petId !== filterPetId && event.petId !== null) return;

      const existing = marked[event.date] ?? {};
      const dots = existing.dots ?? [];
      if (dots.length < 3) {
        dots.push({ color: getEventColor(event.type) });
      }
      marked[event.date] = { ...existing, marked: true, dots };
    });

    // Jour sélectionné (merge avec les dots existants)
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: "#667eea",
    };

    return marked;
  };

  const todayEvents = getEventsByDate(selectedDate);

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action
          icon="menu"
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          accessibilityLabel="Ouvrir le menu"
        />
        <Appbar.Content title="Calendrier" />
      </Appbar.Header>

      <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
        {/* Calendrier */}
        <View style={styles.calendarWrapper}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            markingType="multi-dot"
            theme={{
              selectedDayBackgroundColor: "#667eea",
              todayTextColor: "#667eea",
              todayDotColor: "#667eea",
              arrowColor: "#667eea",
              monthTextColor: "#222",
              textDayFontWeight: "500",
              textMonthFontWeight: "700",
            }}
          />
        </View>

        {/* Filtres par animal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          <Chip
            selected={filterPetId === null}
            onPress={() => setFilterPetId(null)}
            style={styles.chip}
            selectedColor="#667eea"
          >
            🐾 Tous
          </Chip>
          {pets.map((pet) => (
            <Chip
              key={pet.id}
              selected={filterPetId === pet.id}
              onPress={() => setFilterPetId(pet.id)}
              style={styles.chip}
              selectedColor="#667eea"
              avatar={
                pet.photo ? (
                  <Image source={{ uri: pet.photo }} style={styles.chipAvatar} />
                ) : undefined
              }
            >
              {pet.name}
            </Chip>
          ))}
        </ScrollView>

        {/* Liste des événements du jour */}
        <View style={styles.eventsSection}>
          <Text style={styles.dateTitle}>{formatDateDisplay(selectedDate)}</Text>

          {todayEvents.length === 0 ? (
            <View style={styles.emptyEvents}>
              <Text style={styles.emptyText}>Aucun événement ce jour</Text>
            </View>
          ) : (
            todayEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Ajouter un événement"
      />

      <AddEventModal visible={modalVisible} onDismiss={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  calendarWrapper: {
    backgroundColor: "white",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filtersScroll: {
    backgroundColor: "white",
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    marginRight: 4,
  },
  chipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  eventsSection: {
    padding: 16,
    paddingBottom: 80,
  },
  dateTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textTransform: "capitalize",
  },
  emptyEvents: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
