import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Switch,
  Pressable,
} from "react-native";
import { TextInput, Menu, Text } from "react-native-paper";
import { ColorPicker } from "./ColorPicker";
import { TagSelector } from "./TagSelector";
import { pickPetImage } from "../utils/imagePicker";
import { RACES_BY_TYPE, PET_TYPES } from "../constants/petTypes";
import {
  SEXES,
  COULEURS_PELAGE,
  APPARENCES,
  VACCINS,
  ALLERGIES_OPTIONS,
  MALADIES_OPTIONS,
} from "../constants/petOptions";
import { DEFAULT_PET_COLOR } from "../constants/petColors";

export interface PetFormValues {
  name: string;
  type: string;
  race: string;
  age: string;
  photo: string | null;
  color: string;
  sexe: string;
  dateNaissance: string; // affichage DD/MM/YYYY
  couleurPelage: string;
  apparence: string;
  poids: string;
  sterilise: boolean;
  vaccins: string[];
  allergies: string[];
  maladies: string[];
  traitements: string;
  proprioNom: string;
  proprioTel: string;
  proprioEmail: string;
  proprioAdresse: string;
  vetNom: string;
  vetAdresse: string;
  vetTel: string;
}

export const defaultPetFormValues: PetFormValues = {
  name: "",
  type: "",
  race: "",
  age: "",
  photo: null,
  color: DEFAULT_PET_COLOR,
  sexe: "",
  dateNaissance: "",
  couleurPelage: "",
  apparence: "",
  poids: "",
  sterilise: false,
  vaccins: [],
  allergies: [],
  maladies: [],
  traitements: "",
  proprioNom: "",
  proprioTel: "",
  proprioEmail: "",
  proprioAdresse: "",
  vetNom: "",
  vetAdresse: "",
  vetTel: "",
};

/** Convertit DD/MM/YYYY → YYYY-MM-DD pour le stockage */
export function toStorageDate(display: string): string | null {
  if (!display.trim()) return null;
  const parts = display.split("/");
  if (parts.length !== 3 || parts[2].length !== 4) return null;
  return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
}

/** Convertit YYYY-MM-DD → DD/MM/YYYY pour l'affichage */
export function fromStorageDate(iso: string | null): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return "";
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

interface PetFormProps {
  values: PetFormValues;
  onChange: (field: keyof PetFormValues, value: unknown) => void;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function SingleDropdown({
  label,
  value,
  options,
  menuKey,
  openMenu,
  setOpenMenu,
  onSelect,
  disabled,
  pressTestID,
  inputTestID,
}: {
  label: string;
  value: string;
  options: string[];
  menuKey: string;
  openMenu: string | null;
  setOpenMenu: (k: string | null) => void;
  onSelect: (v: string) => void;
  disabled?: boolean;
  pressTestID?: string;
  inputTestID?: string;
}) {
  return (
    <Menu
      visible={openMenu === menuKey}
      onDismiss={() => setOpenMenu(null)}
      anchor={
        <Pressable
          testID={pressTestID}
          onPress={() => !disabled && setOpenMenu(menuKey)}
          disabled={disabled}
        >
          <TextInput
            testID={inputTestID}
            label={label}
            value={value}
            mode="outlined"
            style={styles.input}
            editable={false}
            disabled={disabled}
            right={<TextInput.Icon icon="chevron-down" onPress={() => !disabled && setOpenMenu(menuKey)} />}
            pointerEvents="none"
          />
        </Pressable>
      }
    >
      {options.map((opt) => (
        <Menu.Item
          key={opt}
          title={opt.replace(/_/g, " ")}
          onPress={() => {
            onSelect(opt);
            setOpenMenu(null);
          }}
        />
      ))}
    </Menu>
  );
}

export function PetForm({ values, onChange }: PetFormProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const availableRaces = values.type ? RACES_BY_TYPE[values.type] ?? [] : [];

  const handlePickImage = async () => {
    const uri = await pickPetImage();
    if (uri) onChange("photo", uri);
  };

  const handleDateChange = (text: string) => {
    const digits = text.replace(/\D/g, "");
    let formatted = digits;
    if (digits.length > 2 && digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
    onChange("dateNaissance", formatted);
  };

  return (
    <View>
      {/* ── Informations ── */}
      <SectionHeader title="Informations" />

      <TextInput
        testID="input-name"
        label="Nom *"
        value={values.name}
        onChangeText={(t) => { if (/^[a-zA-ZÀ-ÿ\s]*$/.test(t)) onChange("name", t); }}
        mode="outlined"
        style={styles.input}
      />

      <SingleDropdown
        label="Type *"
        value={values.type}
        options={PET_TYPES}
        menuKey="type"
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        onSelect={(v) => { onChange("type", v); onChange("race", ""); }}
        pressTestID="press-type"
        inputTestID="input-type"
      />

      <SingleDropdown
        label="Race"
        value={values.race}
        options={availableRaces}
        menuKey="race"
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        onSelect={(v) => onChange("race", v)}
        disabled={availableRaces.length === 0}
        pressTestID="press-race"
        inputTestID="input-race"
      />

      <SingleDropdown
        label="Sexe"
        value={values.sexe}
        options={SEXES}
        menuKey="sexe"
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        onSelect={(v) => onChange("sexe", v)}
      />

      <TextInput
        testID="input-age"
        label="Âge (années)"
        value={values.age}
        onChangeText={(t) => { if (/^\d*$/.test(t)) onChange("age", t); }}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        label="Date de naissance (JJ/MM/AAAA)"
        value={values.dateNaissance}
        onChangeText={handleDateChange}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        maxLength={10}
        placeholder="JJ/MM/AAAA"
      />

      <SingleDropdown
        label="Couleur du pelage"
        value={values.couleurPelage}
        options={COULEURS_PELAGE}
        menuKey="couleurPelage"
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        onSelect={(v) => onChange("couleurPelage", v)}
      />

      <SingleDropdown
        label="Apparence"
        value={values.apparence}
        options={APPARENCES}
        menuKey="apparence"
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        onSelect={(v) => onChange("apparence", v)}
      />

      <View style={styles.colorSection}>
        <Text style={styles.colorLabel}>Couleur d'identification</Text>
        <ColorPicker value={values.color} onChange={(v) => onChange("color", v)} />
      </View>

      <View style={styles.photoRow}>
        <View style={styles.photoBtn}>
          <TextInput
            label={values.photo ? "Changer la photo" : "Ajouter une photo"}
            value=""
            mode="outlined"
            editable={false}
            right={<TextInput.Icon icon="camera" onPress={handlePickImage} />}
            onPressIn={handlePickImage}
            pointerEvents="box-none"
            style={styles.input}
          />
        </View>
        {values.photo && (
          <Image source={{ uri: values.photo }} style={styles.photoPreview} />
        )}
      </View>

      {/* ── Santé ── */}
      <SectionHeader title="Santé" />

      <TextInput
        label="Poids (kg)"
        value={values.poids}
        onChangeText={(t) => { if (/^\d*\.?\d*$/.test(t)) onChange("poids", t); }}
        mode="outlined"
        style={styles.input}
        keyboardType="decimal-pad"
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Stérilisé(e)</Text>
        <Switch
          value={values.sterilise}
          onValueChange={(v) => onChange("sterilise", v)}
          thumbColor={values.sterilise ? "#667eea" : "#f4f3f4"}
          trackColor={{ false: "#ddd", true: "#c4caf7" }}
        />
      </View>

      <TagSelector
        label="Vaccins"
        options={VACCINS}
        selected={values.vaccins}
        onChange={(v) => onChange("vaccins", v)}
      />

      <TagSelector
        label="Allergies"
        options={ALLERGIES_OPTIONS}
        selected={values.allergies}
        onChange={(v) => onChange("allergies", v)}
      />

      <TagSelector
        label="Maladies"
        options={MALADIES_OPTIONS}
        selected={values.maladies}
        onChange={(v) => onChange("maladies", v)}
      />

      <TextInput
        label="Traitements en cours"
        value={values.traitements}
        onChangeText={(t) => onChange("traitements", t)}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={3}
      />

      {/* ── Propriétaire ── */}
      <SectionHeader title="Propriétaire" />

      <TextInput
        label="Nom"
        value={values.proprioNom}
        onChangeText={(t) => onChange("proprioNom", t)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Téléphone"
        value={values.proprioTel}
        onChangeText={(t) => onChange("proprioTel", t)}
        mode="outlined"
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        label="Email"
        value={values.proprioEmail}
        onChangeText={(t) => onChange("proprioEmail", t)}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Adresse"
        value={values.proprioAdresse}
        onChangeText={(t) => onChange("proprioAdresse", t)}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={2}
      />

      {/* ── Vétérinaire ── */}
      <SectionHeader title="Vétérinaire" />

      <TextInput
        label="Nom du vétérinaire"
        value={values.vetNom}
        onChangeText={(t) => onChange("vetNom", t)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Téléphone"
        value={values.vetTel}
        onChangeText={(t) => onChange("vetTel", t)}
        mode="outlined"
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        label="Adresse"
        value={values.vetAdresse}
        onChangeText={(t) => onChange("vetAdresse", t)}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  sectionHeader: {
    borderLeftWidth: 3,
    borderLeftColor: "#667eea",
    paddingLeft: 10,
    paddingVertical: 6,
    marginBottom: 14,
    marginTop: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  colorSection: {
    marginBottom: 12,
  },
  colorLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  photoBtn: {
    flex: 1,
  },
  photoPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 15,
    color: "#333",
  },
});
