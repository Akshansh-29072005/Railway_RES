import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

interface InfoCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

export default function InfoCard({
  title,
  value,
  subtitle,
}: InfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.value}>{value}</Text>

      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
  },

  title: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },

  value: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 5,
  },
});