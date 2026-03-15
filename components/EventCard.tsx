import React from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import { Card, Text, Checkbox, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CalendarEvent, getEventColor, getEventIcon, getEventLabel } from "../types/event";
import { usePetStore } from "../store/petStore";

interface Props {
  event: CalendarEvent;
}

export function EventCard({ event }: Props) {
  const { pets, toggleEventComplete, deleteEvent } = usePetStore();
  const pet = event.petId !== null ? pets.find((p) => p.id === event.petId) : null;
  const color = getEventColor(event.type);

  const handleDelete = () => {
    Alert.alert("Supprimer l'événement", `Supprimer "${event.title}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => deleteEvent(event.id),
      },
    ]);
  };

  return (
    <Card style={[styles.card, event.completed && styles.cardCompleted]}>
      <Card.Content style={styles.content}>
        {/* Icône type */}
        <View style={[styles.iconWrapper, { backgroundColor: `${color}22` }]}>
          <Text style={styles.iconEmoji}>{getEventIcon(event.type)}</Text>
        </View>

        {/* Infos */}
        <View style={styles.info}>
          <Text
            variant="titleSmall"
            style={[styles.title, event.completed && styles.textCompleted]}
            numberOfLines={1}
          >
            {event.title}
          </Text>

          <View style={styles.meta}>
            {event.time && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="#888" />
                <Text style={styles.metaText}>{event.time}</Text>
              </View>
            )}
            <View style={[styles.typeBadge, { backgroundColor: `${color}22` }]}>
              <Text style={[styles.typeBadgeText, { color }]}>{getEventLabel(event.type)}</Text>
            </View>
          </View>

          {/* Animal associé */}
          {pet ? (
            <View style={styles.petRow}>
              {pet.photo ? (
                <Image source={{ uri: pet.photo }} style={styles.petPhoto} />
              ) : (
                <MaterialCommunityIcons name="paw" size={14} color="#667eea" />
              )}
              <Text style={styles.petName}>{pet.name}</Text>
            </View>
          ) : (
            <View style={styles.petRow}>
              <MaterialCommunityIcons name="paw" size={14} color="#888" />
              <Text style={styles.petNameAll}>Tous les animaux</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Checkbox
            status={event.completed ? "checked" : "unchecked"}
            onPress={() => toggleEventComplete(event.id)}
            color="#667eea"
          />
          <IconButton
            icon="trash-can-outline"
            size={18}
            iconColor="#ccc"
            onPress={handleDelete}
            accessibilityLabel="Supprimer l'événement"
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: "white",
  },
  cardCompleted: {
    opacity: 0.55,
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
  textCompleted: {
    textDecorationLine: "line-through",
    color: "#aaa",
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
  actions: {
    alignItems: "center",
  },
});
