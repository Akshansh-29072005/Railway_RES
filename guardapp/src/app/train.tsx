import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import PrimaryButton from "../components/PrimaryButton";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

const trains = [
  {
    number: "12345",
    name: "Howrah-New Delhi Rajdhani",
    from: "HWH",
    to: "NDLS",
    loco: "WAP-7 30293",
  },
  {
    number: "12301",
    name: "Howrah-New Delhi Rajdhani",
    from: "HWH",
    to: "NDLS",
    loco: "WAP-7 30321",
  },
  {
    number: "12951",
    name: "Mumbai-New Delhi Rajdhani",
    from: "MMCT",
    to: "NDLS",
    loco: "WAP-7 30645",
  },
  {
    number: "12002",
    name: "New Delhi-Bhopal Shatabdi",
    from: "NDLS",
    to: "BPL",
    loco: "WAP-5 30164",
  },
];

export default function TrainScreen() {
  const [search, setSearch] = useState("");
  const [selectedTrain, setSelectedTrain] = useState(trains[0]);

  const filteredTrains = useMemo(() => {
    if (!search.trim()) {
      return trains;
    }

    const value = search.toLowerCase();

    return trains.filter(
      (train) =>
        train.number.includes(value) ||
        train.name.toLowerCase().includes(value)
    );
  }, [search]);

  const continueToGPS = () => {
    router.push({
      pathname: "/gps",
      params: {
        trainNumber: selectedTrain.number,
        trainName: selectedTrain.name,
        from: selectedTrain.from,
        to: selectedTrain.to,
        loco: selectedTrain.loco,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.smallTitle}>GUARD APP</Text>
            <Text style={styles.title}>Select Your Train</Text>
          </View>

          <View style={styles.headerIcon}>
            <Text>🚆</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressActive} />
          <View style={styles.progressActive} />
          <View style={styles.progressInactive} />
        </View>

        <Text style={styles.stepText}>STEP 2 OF 3</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Train Number or Name</Text>

          <Text style={styles.cardDescription}>
            Enter your assigned train number or search by
            train name.
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="e.g. 12345 or Rajdhani"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {search ? "MATCHING TRAINS" : "ASSIGNED TRAINS"}
        </Text>

        {filteredTrains.map((train) => {
          const selected =
            selectedTrain.number === train.number;

          return (
            <TouchableOpacity
              key={train.number}
              activeOpacity={0.8}
              style={[
                styles.trainCard,
                selected && styles.selectedTrain,
              ]}
              onPress={() => setSelectedTrain(train)}
            >
              <View style={styles.trainIcon}>
                <Text style={styles.trainEmoji}>🚆</Text>
              </View>

              <View style={styles.trainDetails}>
                <Text style={styles.trainNumber}>
                  {train.number}
                </Text>

                <Text style={styles.trainName}>
                  {train.name}
                </Text>

                <Text style={styles.route}>
                  {train.from} → {train.to}
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  selected && styles.radioSelected,
                ]}
              >
                {selected && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredTrains.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No matching trains found.
            </Text>
          </View>
        )}

        <View style={styles.selectedCard}>
          <Text style={styles.selectedLabel}>
            SELECTED TRAIN
          </Text>

          <Text style={styles.selectedNumber}>
            {selectedTrain.number}
          </Text>

          <Text style={styles.selectedName}>
            {selectedTrain.name}
          </Text>

          <View style={styles.detailsRow}>
            <View>
              <Text style={styles.detailLabel}>FROM</Text>
              <Text style={styles.detailValue}>
                {selectedTrain.from}
              </Text>
            </View>

            <View>
              <Text style={styles.detailLabel}>TO</Text>
              <Text style={styles.detailValue}>
                {selectedTrain.to}
              </Text>
            </View>

            <View>
              <Text style={styles.detailLabel}>LOCO</Text>
              <Text style={styles.detailValue}>
                {selectedTrain.loco}
              </Text>
            </View>
          </View>
        </View>

        <PrimaryButton
          title="CONTINUE TO GPS"
          onPress={continueToGPS}
        />

        <Text style={styles.security}>
          Your train assignment is securely linked to
          your Railway ID.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    padding: SPACING.xxl,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallTitle: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 5,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  progressContainer: {
    flexDirection: "row",
    gap: 5,
    marginTop: 25,
  },

  progressActive: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },

  progressInactive: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDDDDD",
  },

  stepText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textLight,
    marginTop: 8,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginTop: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },

  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    marginBottom: 16,
  },

  searchInput: {
    height: 52,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 15,
    fontSize: 14,
    color: COLORS.text,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
  },

  trainCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  selectedTrain: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFF9F9",
  },

  trainIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  trainEmoji: {
    fontSize: 23,
  },

  trainDetails: {
    flex: 1,
    marginLeft: 12,
  },

  trainNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  trainName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  route: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
    marginTop: 5,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#BBBBBB",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: COLORS.primary,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  empty: {
    padding: 25,
    alignItems: "center",
  },

  emptyText: {
    color: COLORS.textSecondary,
  },

  selectedCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginTop: 12,
    marginBottom: 18,
  },

  selectedLabel: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    opacity: 0.8,
  },

  selectedNumber: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 5,
  },

  selectedName: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 3,
  },

  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  detailLabel: {
    color: "#FFFFFF",
    opacity: 0.7,
    fontSize: 9,
    fontWeight: "800",
  },

  detailValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },

  security: {
    textAlign: "center",
    color: COLORS.textLight,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
  },
});