import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { CORRIDOR_BLOCKS, STATIONS_LIST } from "../constants/blocks";

const MAINT_TYPES = [
  "Planned Maintenance",
  "Track Fracture",
  "Signal Failure",
  "OHE Breakdown",
  "Accident / Derailment"
];

const IMPACT_TYPES = [
  "Full Block (No Traffic)",
  "Temporary Speed Restriction",
  "Caution Order",
  "Power Block Only"
];

export default function ReportScreen() {
  const [selectedType, setSelectedType] = useState(MAINT_TYPES[0]);
  const [selectedImpact, setSelectedImpact] = useState(IMPACT_TYPES[0]);
  const [duration, setDuration] = useState("");
  const [fromStation, setFromStation] = useState(STATIONS_LIST[0]);
  const [toStation, setToStation] = useState(STATIONS_LIST[1]);
  const [block, setBlock] = useState(CORRIDOR_BLOCKS[0].id);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!duration || !fromStation || !toStation || !block) {
      Alert.alert("Missing Fields", "Please complete all fields before logging this incident.");
      return;
    }

    setSubmitting(true);
    
    try {
      // Use EXPO_PUBLIC_API_URL or fallback to localhost
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/api/maintenance/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          expected_time: parseInt(duration) || 60,
          section_block: block,
          status: "ongoing",
          impact: selectedImpact
        })
      });

      if (!response.ok) {
        throw new Error("Failed to record maintenance.");
      }

      setSubmitting(false);
      Alert.alert(
        "Report Published",
        "The maintenance block has been broadcasted to the network. ETA Engine and Maps are updated.",
        [{ text: "Back to Dashboard", onPress: () => router.replace("/dashboard") }]
      );
    } catch (e) {
      setSubmitting(false);
      Alert.alert("Error", e.message || "Could not reach the server.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/dashboard")} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Maintenance</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Log Incident</Text>
            <Text style={styles.heroSubtitle}>This data drives live ETA predictions for the entire division. Accuracy is critical.</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionLabel}>INCIDENT TYPE</Text>
            <View style={styles.chipsWrapper}>
              {MAINT_TYPES.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSelectedType(type)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>IMPACT / CONSEQUENCES</Text>
            <View style={styles.chipsWrapper}>
              {IMPACT_TYPES.map((impact) => {
                const isSelected = selectedImpact === impact;
                return (
                  <TouchableOpacity
                    key={impact}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSelectedImpact(impact)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{impact}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>FROM STATION / POINT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={styles.chipsWrapperHorizontal}>
                {STATIONS_LIST.map((stn) => {
                  const isSelected = fromStation === stn;
                  return (
                    <TouchableOpacity
                      key={stn}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setFromStation(stn)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{stn}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={[styles.sectionLabel]}>TO STATION / POINT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={styles.chipsWrapperHorizontal}>
                {STATIONS_LIST.map((stn) => {
                  const isSelected = toStation === stn;
                  return (
                    <TouchableOpacity
                      key={stn}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setToStation(stn)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{stn}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={[styles.sectionLabel]}>AFFECTED TRACK BLOCK</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={styles.chipsWrapperHorizontal}>
                {CORRIDOR_BLOCKS.map((blk) => {
                  const isSelected = block === blk.id;
                  return (
                    <TouchableOpacity
                      key={blk.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setBlock(blk.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{blk.name} ({blk.id})</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>HOURS AFFECTED</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. 4.5"
                  placeholderTextColor="#A0A0A0"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? "PUBLISHING TO ENGINE..." : "BROADCAST BLOCK"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F8FA" }, // Slightly distinct off-white background
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { paddingVertical: 8, paddingRight: 10 },
  backBtnText: { fontSize: 13, fontWeight: "800", color: COLORS.textSecondary },
  headerTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  
  scrollContent: { padding: SPACING.lg },
  
  heroSection: {
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  heroTitle: { fontSize: 32, fontWeight: "900", color: COLORS.primary, marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },

  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: COLORS.textSecondary, letterSpacing: 0.8, marginBottom: 16 },
  
  chipsWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 30 },
  chipsWrapperHorizontal: { flexDirection: "row", gap: 10, paddingBottom: 10, paddingRight: 20 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.primary, fontWeight: "800" },

  inputGroup: { marginBottom: 24 },
  rowInputs: { flexDirection: "row", justifyContent: "space-between" },
  inputLabel: { fontSize: 10, fontWeight: "800", color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 8 },
  inputField: {
    height: 56,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },

  footer: {
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 30 : SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitBtn: {
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: "#A0B5CB",
    shadowOpacity: 0,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  }
});
