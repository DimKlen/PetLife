import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Menu, Chip, Text, TextInput } from "react-native-paper";

interface TagSelectorProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function TagSelector({ label, options, selected, onChange }: TagSelectorProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const available = options.filter((o) => !selected.includes(o));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {selected.length > 0 && (
        <View style={styles.chips}>
          {selected.map((item) => (
            <Chip
              key={item}
              onClose={() => onChange(selected.filter((s) => s !== item))}
              style={styles.chip}
              compact
            >
              {item}
            </Chip>
          ))}
        </View>
      )}
      {available.length > 0 && (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Pressable onPress={() => setMenuVisible(true)}>
              <TextInput
                label={`Ajouter ${label.toLowerCase()}`}
                value=""
                mode="outlined"
                editable={false}
                style={styles.input}
                right={<TextInput.Icon icon="chevron-down" onPress={() => setMenuVisible(true)} />}
                pointerEvents="none"
              />
            </Pressable>
          }
        >
          {available.map((opt) => (
            <Menu.Item
              key={opt}
              title={opt}
              onPress={() => {
                onChange([...selected, opt]);
                setMenuVisible(false);
              }}
            />
          ))}
        </Menu>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    marginBottom: 2,
  },
  input: {
    backgroundColor: "white",
  },
});
