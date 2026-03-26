import React, { useRef, useState } from "react";
import { View, Image, StyleSheet, Pressable, Text } from "react-native";

interface Props {
  photo: string | null;
  onChange: (uri: string | null) => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoPicker({ photo, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const uri = await fileToDataUrl(file);
    onChange(uri);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <View style={styles.row}>
      {/* @ts-ignore — div n'existe pas dans les types RN, mais on est sur web */}
      <div
        onDrop={handleDrop}
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        style={{
          flex: 1,
          border: `2px dashed ${dragging ? "#6750A4" : "#aaa"}`,
          borderRadius: 8,
          padding: 16,
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: dragging ? "#f3eeff" : "#fafafa",
          transition: "all 0.15s ease",
        }}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleInputChange}
        />
        <span style={{ color: "#666", fontSize: 14, userSelect: "none" }}>
          {photo ? "🖼 Changer la photo" : "📁 Glisser une photo ici ou cliquer pour parcourir"}
        </span>
      </div>

      {photo && (
        <div style={{ position: "relative", width: 56, height: 56 }}>
          <Image source={{ uri: photo }} style={styles.preview} />
          <button
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 20,
              height: 20,
              borderRadius: 10,
              border: "none",
              backgroundColor: "#333",
              color: "#fff",
              fontSize: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  preview: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});
