import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Image,
} from "react-native";
import { Appbar, FAB, Text } from "react-native-paper";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "expo-router";
import { Calendar, DateData } from "react-native-calendars";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePetStore } from "../../store/petStore";
import { EventCard } from "../../components/EventCard";
import { AddEventModal } from "../../components/AddEventModal";
import { getEventColor, eventOccursOnDate } from "../../types/event";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

// ─── Helpers date ─────────────────────────────────────────────────────────────

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getWeekDays(dateStr: string): string[] {
  const date = new Date(dateStr + "T00:00:00");
  const dow = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toDateStr(d);
  });
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

function formatMonthYear(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function formatDayHeader(dateStr: string): string {
  const today = toDateStr(new Date());
  if (dateStr === today) return "Aujourd'hui";
  const tomorrow = addDays(today, 1);
  if (dateStr === tomorrow) return "Demain";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ─── Composant principal ───────────────────────────────────────────────────────

export default function CalendarScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<import("../../types/event").CalendarEvent | null>(null);
  const [expanded, setExpanded] = useState(false);

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

  const today = toDateStr(new Date());

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const weekDays = getWeekDays(selectedDate);
  const dayEvents = getEventsByDate(selectedDate);
  const DAY_W = (SCREEN_WIDTH - 32) / 7;

  // Jours de la semaine qui ont des events (dots sur le week strip)
  const daysWithEvents = new Set(
    weekDays.filter((day) =>
      events.some(
        (e) =>
          eventOccursOnDate(e, day) &&
          (filterPetId === null || e.petIds.length === 0 || e.petIds.includes(filterPetId))
      )
    )
  );

  // MarkedDates pour le Calendar complet (mois visible = mois de selectedDate)
  const getMarkedDates = () => {
    const marked: Record<string, {
      dots?: { color: string }[];
      selected?: boolean;
      selectedColor?: string;
      marked?: boolean;
    }> = {};

    // Génère tous les jours du mois affiché pour propager la récurrence
    const [y, m] = selectedDate.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const monthDays = Array.from({ length: daysInMonth }, (_, i) =>
      `${selectedDate.substring(0, 7)}-${String(i + 1).padStart(2, "0")}`
    );

    events.forEach((e) => {
      if (filterPetId !== null && e.petIds.length > 0 && !e.petIds.includes(filterPetId)) return;
      const datesToMark = e.repeat === "never"
        ? [e.date]
        : monthDays.filter((d) => eventOccursOnDate(e, d));
      datesToMark.forEach((date) => {
        const existing = marked[date] ?? {};
        const dots = existing.dots ?? [];
        if (dots.length < 3) dots.push({ color: getEventColor(e.type) });
        marked[date] = { ...existing, dots, marked: true };
      });
    });

    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: "#667eea",
    };

    return marked;
  };

  return (
    <View style={styles.container}>
      {/* ── Appbar ── */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action
          icon="menu"
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          accessibilityLabel="Ouvrir le menu"
        />
        <Appbar.Content title="Calendrier" titleStyle={styles.appbarTitle} />
        <Appbar.Action
          icon="calendar-today"
          onPress={() => setSelectedDate(today)}
          accessibilityLabel="Aller à aujourd'hui"
        />
      </Appbar.Header>

      {/* ── Section calendrier (fixe) ── */}
      <View style={styles.calendarSection}>

        {/* Header mois + navigation semaine */}
        {!expanded && (
          <View style={styles.weekHeader}>
            <TouchableOpacity onPress={() => setSelectedDate(addDays(weekDays[0], -7))} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="chevron-left" size={26} color="#667eea" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{formatMonthYear(selectedDate)}</Text>
            <TouchableOpacity onPress={() => setSelectedDate(addDays(weekDays[6], 1))} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="chevron-right" size={26} color="#667eea" />
            </TouchableOpacity>
          </View>
        )}

        {/* Week strip (collapsed) */}
        {!expanded && (
          <View style={styles.weekStrip}>
            {weekDays.map((day, i) => {
              const isSelected = day === selectedDate;
              const isToday = day === today;
              const dayNum = day.split("-")[2];
              const hasEvent = daysWithEvents.has(day);

              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDate(day)}
                  style={[styles.dayPill, { width: DAY_W }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                    {DAY_LABELS[i]}
                  </Text>
                  <View style={[
                    styles.dayCircle,
                    isSelected && styles.dayCircleSelected,
                    isToday && !isSelected && styles.dayCircleToday,
                  ]}>
                    <Text style={[
                      styles.dayNum,
                      isSelected && styles.dayNumSelected,
                      isToday && !isSelected && styles.dayNumToday,
                    ]}>
                      {dayNum}
                    </Text>
                  </View>
                  <View style={[styles.eventDot, { opacity: hasEvent ? 1 : 0 }]} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Full Calendar (expanded) */}
        {expanded && (
          <Calendar
            current={selectedDate}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            markingType="multi-dot"
            theme={{
              selectedDayBackgroundColor: "#667eea",
              todayTextColor: "#667eea",
              arrowColor: "#667eea",
              monthTextColor: "#222",
              textDayFontWeight: "500",
              textMonthFontWeight: "700",
              textSectionTitleColor: "#999",
            }}
          />
        )}

        {/* Toggle expand/collapse */}
        <TouchableOpacity style={styles.toggleBtn} onPress={toggleExpanded} activeOpacity={0.7}>
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#667eea"
          />
          <Text style={styles.toggleText}>
            {expanded ? "Réduire" : "Voir tout le mois"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Filtres animaux ── */}
      {pets.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            onPress={() => setFilterPetId(null)}
            style={[styles.filterPill, filterPetId === null && styles.filterPillSelected]}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterPillText, filterPetId === null && styles.filterPillTextSelected]}>
              🐾 Tous
            </Text>
          </TouchableOpacity>
          {pets.map((pet) => {
            const selected = filterPetId === pet.id;
            return (
              <TouchableOpacity
                key={pet.id}
                onPress={() => setFilterPetId(pet.id)}
                style={[styles.filterPill, selected && styles.filterPillSelected]}
                activeOpacity={0.7}
              >
                {pet.photo && (
                  <Image source={{ uri: pet.photo }} style={styles.filterPillAvatar} />
                )}
                <Text style={[styles.filterPillText, selected && styles.filterPillTextSelected]}>
                  {pet.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── Liste des événements (scrollable) ── */}
      <ScrollView
        style={styles.eventsList}
        contentContainerStyle={styles.eventsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsDateTitle}>
            {formatDayHeader(selectedDate)}
          </Text>
          <Text style={styles.eventsCount}>
            {dayEvents.length > 0 ? `${dayEvents.length} événement${dayEvents.length > 1 ? "s" : ""}` : ""}
          </Text>
        </View>

        {dayEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={52} color="#ddd" />
            <Text style={styles.emptyTitle}>Aucun événement</Text>
            <Text style={styles.emptySubtitle}>Appuie sur + pour en ajouter un</Text>
          </View>
        ) : (
          dayEvents.map((event) => (
            <EventCard key={event.id} event={event} onEdit={() => setEditingEvent(event)} />
          ))
        )}
      </ScrollView>

      {/* ── FAB ── */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Ajouter un événement"
      />

      <AddEventModal visible={modalVisible} onDismiss={() => setModalVisible(false)} />
      <AddEventModal
        visible={editingEvent !== null}
        onDismiss={() => setEditingEvent(null)}
        event={editingEvent ?? undefined}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  // Appbar
  appbar: {
    backgroundColor: "white",
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  appbarTitle: {
    fontWeight: "700",
  },

  // Section calendrier
  calendarSection: {
    backgroundColor: "white",
    paddingBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  // Week header
  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    textTransform: "capitalize",
  },

  // Week strip
  weekStrip: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  dayPill: {
    alignItems: "center",
    gap: 4,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#bbb",
  },
  dayLabelSelected: {
    color: "#667eea",
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleSelected: {
    backgroundColor: "#667eea",
  },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: "#667eea",
  },
  dayNum: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  dayNumSelected: {
    color: "white",
    fontWeight: "700",
  },
  dayNumToday: {
    color: "#667eea",
    fontWeight: "700",
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#667eea",
  },

  // Toggle
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 2,
  },
  toggleText: {
    fontSize: 13,
    color: "#667eea",
    fontWeight: "600",
  },

  // Filtres
  filtersScroll: {
    backgroundColor: "white",
    maxHeight: 52,
    marginTop: 8,
  },
  filtersContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 6,
  },
  filterPillSelected: {
    backgroundColor: "#4c5fd5",
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#555",
  },
  filterPillTextSelected: {
    color: "white",
    fontWeight: "700",
  },
  filterPillAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },

  // Events list
  eventsList: {
    flex: 1,
    marginTop: 8,
  },
  eventsContent: {
    padding: 16,
    paddingBottom: 88,
  },
  eventsHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  eventsDateTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    textTransform: "capitalize",
  },
  eventsCount: {
    fontSize: 13,
    color: "#aaa",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingTop: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ccc",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#ccc",
  },

  // FAB
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
