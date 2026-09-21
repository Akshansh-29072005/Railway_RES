import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/theme";

type BadgeType = "success" | "warning" | "danger" | "neutral";

interface StatusBadgeProps {
  label: string;
  type?: BadgeType;
}

export default function StatusBadge({
  label,
  type = "neutral",
}: StatusBadgeProps) {
  const getColors = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: COLORS.successLight,
          textColor: COLORS.success,
        };

      case "warning":
        return {
          backgroundColor: COLORS.warningLight,
          textColor: COLORS.warning,
        };

      case "danger":
        return {
          backgroundColor: COLORS.primaryLight,
          textColor: COLORS.primary,
        };

      default:
        return {
          backgroundColor: "#EEEEEE",
          textColor: COLORS.textSecondary,
        };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundColor },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: colors.textColor },
        ]}
      />

      <Text style={[styles.text, { color: colors.textColor }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});