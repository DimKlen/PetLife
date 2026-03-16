import React from "react";
import { View, StyleSheet, Image, Alert, Pressable } from "react-native";
import { Card, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CalendarEvent,
  getEventColor,
  getEventIcon,
  getEventLabel,
  REPEAT_CONFIG,
} from "../types/event";
import { usePetStore } from "../store/petStore";

interface Props {
  event: CalendarEvent;
  onEdit: () => void;
}

export function EventCard({ event, onEdit }: Props) {
  const { pets, deleteEvent } = usePetStore();
  const color = getEventColor(event.type);

  const associatedPets = event.petIds.length > 0
    ? pets.filter((p) => event.petIds.includes(p.id))
    : [];

  const handleDelete = () => {
    Alert.alert("Supprimer l'événement", `Supprimer "${event.title}" ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => deleteEvent(event.id) },
    ]);
  };

  const timeLabel = event.allDay
    ? "Toute la journée"
    : event.startTime
      ? event.endTime
        ? `${event.startTime} – ${event.endTime}`
        : event.startTime
      : null;

  return (
    <Card style={styles.card} onPress={onEdit}>
      <Card.Content style={styles.content}>
        {/* Icône type */}
        <View style={[styles.iconWrapper, { backgroundColor: `${color}22` }]}>
          <Text style={styles.iconEmoji}>{getEventIcon(event.type)}</Text>
        </View>

        {/* Infos */}
        <View style={styles.info}>
          <Text
            variant="titleSmall"
            style={styles.title}
            numberOfLines={1}
          >
            {event.title}
          </Text>

          <View style={styles.meta}>
            {timeLabel && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="#888" />
                <Text style={styles.metaText}>{timeLabel}</Text>
              </View>
            )}
            <View style={[styles.typeBadge, { backgroundColor: `${color}22` }]}>
              <Text style={[styles.typeBadgeText, { color }]}>{getEventLabel(event.type)}</Text>
            </View>
            {event.repeat !== "never" && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="repeat" size={12} color="#888" />
                <Text style={styles.metaText}>{REPEAT_CONFIG[event.repeat]}</Text>
              </View>
            )}
          </View>

          {/* Animaux associés */}
          {associatedPets.length > 0 ? (
            <View style={styles.petRow}>
              {associatedPets.map((pet) =>
                pet.photo ? (
                  <Image key={pet.id} source={{ uri: pet.photo }} style={styles.petPhoto} />
                ) : (
                  <MaterialCommunityIcons key={pet.id} name="paw" size={14} color="#667eea" />
                )
              )}
              <Text style={styles.petName}>
                {associatedPets.map((p) => p.name).join(", ")}
              </Text>
            </View>
          ) : (
            <View style={styles.petRow}>
              <MaterialCommunityIcons name="paw" size={14} color="#888" />
              <Text style={styles.petNameAll}>Tous les animaux</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View onStartShouldSetResponder={() => true}>
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.deleteBtn}
            accessibilityLabel="Supprimer l'événement"
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: "white",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontWeight: "700",
    color: "#222",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  metaText: {
    fontSize: 11,
    color: "#888",
  },
  typeBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  petRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  petPhoto: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  petName: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "600",
  },
  petNameAll: {
    fontSize: 12,
    color: "#888",
  },
  deleteBtn: {
    padding: 6,
  },
});
