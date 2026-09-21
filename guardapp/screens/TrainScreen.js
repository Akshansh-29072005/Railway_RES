import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

import trains from "../data/trains";

export default function TrainScreen({
  railwayId,
  selectedTrain,
  setSelectedTrain,
  onProceed,
}) {

  const [search, setSearch] = useState("");

  const suggestions =
    search.length > 0
      ? trains
          .filter((train) => {
            const query = search.toLowerCase();

            return (
              train.number.includes(query) ||
              train.name.toLowerCase().includes(query)
            );
          })
          .slice(0, 5)
      : [];

  const selectTrain = (train) => {
    setSelectedTrain(train);
    setSearch(train.number);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <View>
          <Text style={styles.headerSmall}>
            OPERATIONS
          </Text>

          <Text style={styles.headerTitle}>
            Duty Dashboard
          </Text>

          <Text style={styles.headerSubtitle}>
            GUARD APP
          </Text>
        </View>

        <View style={styles.profile}>
          <Text style={styles.profileText}>
            LP
          </Text>
        </View>

      </View>


      {/* TODAY'S DUTY */}

      <View style={styles.card}>

        <View style={styles.cardHeader}>

          <View>
            <Text style={styles.cardTitle}>
              Today's Duty
            </Text>

            <Text style={styles.cardSubtitle}>
              Assigned working for this shift
            </Text>
          </View>

          <View style={styles.onDuty}>
            <View style={styles.greenDot} />
            <Text style={styles.onDutyText}>
              ON DUTY
            </Text>
          </View>

        </View>

        <View style={styles.infoGrid}>

          <Info
            label="TRAIN NO"
            value={
              selectedTrain
                ? selectedTrain.number
                : "12345"
            }
          />

          <Info
            label="LOCO NO"
            value={
              selectedTrain
                ? selectedTrain.loco
                : "WAP-7 30293"
            }
          />

          <Info
            label="TRAIN NAME"
            value={
              selectedTrain
                ? selectedTrain.name
                : "Howrah - New Delhi Rajdhani"
            }
          />

          <Info
            label="FROM"
            value={
              selectedTrain
                ? selectedTrain.from
                : "Howrah (HWH)"
            }
          />

          <Info
            label="TO"
            value={
              selectedTrain
                ? selectedTrain.to
                : "New Delhi (NDLS)"
            }
          />

          <Info
            label="DUTY START"
            value="06 Sep 2026, 06:00"
          />

        </View>

      </View>


      {/* TRAIN SEARCH */}

      <View style={styles.card}>

        <Text style={styles.cardTitle}>
          Train Assignment
        </Text>

        <Text style={styles.cardSubtitle}>
          Search and select the assigned train
        </Text>

        <Text style={styles.label}>
          TRAIN NUMBER / TRAIN NAME
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Enter train number or name"
          placeholderTextColor="#8795A8"
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            setSelectedTrain(null);
          }}
        />

        {suggestions.length > 0 && (
          <View style={styles.suggestions}>

            <Text style={styles.suggestionTitle}>
              SIMILAR TRAINS
            </Text>

            {suggestions.map((train) => (

              <TouchableOpacity
                key={train.number}
                style={styles.suggestion}
                onPress={() => selectTrain(train)}
              >

                <View style={styles.trainIcon}>
                  <Text>🚆</Text>
                </View>

                <View style={{ flex: 1 }}>

                  <Text style={styles.trainNumber}>
                    {train.number}
                  </Text>

                  <Text style={styles.trainName}>
                    {train.name}
                  </Text>

                </View>

                <Text style={styles.arrow}>
                  ›
                </Text>

              </TouchableOpacity>

            ))}

          </View>
        )}

        {search.length > 0 &&
          suggestions.length === 0 && (
            <Text style={styles.noResult}>
              No matching trains found.
            </Text>
          )}


        {selectedTrain && (

          <View style={styles.selected}>

            <View>
              <Text style={styles.selectedLabel}>
                SELECTED TRAIN
              </Text>

              <Text style={styles.selectedNumber}>
                {selectedTrain.number}
              </Text>

              <Text style={styles.selectedName}>
                {selectedTrain.name}
              </Text>
            </View>

            <Text style={styles.check}>
              ✓
            </Text>

          </View>

        )}

      </View>


      {/* ROUTE OVERVIEW */}

      <View style={styles.card}>

        <Text style={styles.cardTitle}>
          Route Overview
        </Text>

        <Text style={styles.cardSubtitle}>
          Scheduled corridor
        </Text>

        <View style={styles.route}>

          <View>
            <Text style={styles.stationCode}>
              {selectedTrain?.from?.split(" ")[0] || "HWH"}
            </Text>

            <Text style={styles.stationName}>
              {selectedTrain?.from || "Howrah"}
            </Text>
          </View>

          <View style={styles.routeLineContainer}>

            <View style={styles.routeLine} />

            <View style={styles.routeTrain}>
              <Text>🚆</Text>
            </View>

          </View>

          <View>
            <Text style={styles.stationCode}>
              {selectedTrain?.to?.split(" ")[0] || "NDLS"}
            </Text>

            <Text style={styles.stationName}>
              {selectedTrain?.to || "New Delhi"}
            </Text>
          </View>

        </View>


        <View style={styles.routeStats}>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>
              DISTANCE
            </Text>

            <Text style={styles.statValue}>
              {selectedTrain?.distance || "1,445 km"}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>
              EST. TIME
            </Text>

            <Text style={styles.statValue}>
              {selectedTrain?.duration || "16h 30m"}
            </Text>
          </View>

        </View>

      </View>


      {/* PROCEED */}

      <TouchableOpacity
        style={[
          styles.proceed,
          !selectedTrain && styles.disabled,
        ]}
        disabled={!selectedTrain}
        onPress={onProceed}
      >

        <Text style={styles.proceedText}>
          PROCEED TO LOCATION  →
        </Text>

      </TouchableOpacity>


      <Text style={styles.operator}>
        Railway ID: {railwayId}
      </Text>

    </ScrollView>
  );
}


function Info({ label, value }) {
  return (
    <View style={styles.infoItem}>

      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  content: {
    padding: 18,
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  headerSmall: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#526986",
    fontWeight: "800",
  },

  headerTitle: {
    color: "#09244D",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 3,
  },

  headerSubtitle: {
    color: "#8290A3",
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 3,
  },

  profile: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF2F7",
    borderWidth: 1,
    borderColor: "#D5DDE8",
    justifyContent: "center",
    alignItems: "center",
  },

  profileText: {
    color: "#09244D",
    fontWeight: "900",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DCE2EA",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardTitle: {
    color: "#09244D",
    fontSize: 18,
    fontWeight: "800",
  },

  cardSubtitle: {
    color: "#667A94",
    fontSize: 11,
    marginTop: 4,
  },

  onDuty: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F3EE",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#32966B",
    marginRight: 6,
  },

  onDutyText: {
    color: "#287653",
    fontSize: 9,
    fontWeight: "900",
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },

  infoItem: {
    width: "50%",
    marginBottom: 14,
    paddingRight: 8,
  },

  infoLabel: {
    color: "#657992",
    fontSize: 9,
    letterSpacing: 1.3,
    fontWeight: "700",
  },

  infoValue: {
    color: "#09244D",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 5,
  },

  label: {
    color: "#526986",
    fontSize: 9,
    letterSpacing: 1.1,
    fontWeight: "800",
    marginTop: 17,
    marginBottom: 7,
  },

  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D3DBE6",
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    color: "#09244D",
  },

  suggestions: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#D9E0E9",
    borderRadius: 12,
    overflow: "hidden",
  },

  suggestionTitle: {
    color: "#687C96",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    padding: 11,
  },

  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E7EBF0",
  },

  trainIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFF0F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  trainNumber: {
    color: "#09244D",
    fontSize: 13,
    fontWeight: "900",
  },

  trainName: {
    color: "#6A7D95",
    fontSize: 10,
    marginTop: 2,
  },

  arrow: {
    color: "#D71920",
    fontSize: 23,
  },

  noResult: {
    color: "#D71920",
    fontSize: 12,
    marginTop: 10,
  },

  selected: {
    marginTop: 13,
    borderWidth: 1.5,
    borderColor: "#D71920",
    borderRadius: 12,
    padding: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF8F8",
  },

  selectedLabel: {
    color: "#D71920",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  selectedNumber: {
    color: "#09244D",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 3,
  },

  selectedName: {
    color: "#667A94",
    fontSize: 10,
    marginTop: 2,
  },

  check: {
    color: "#D71920",
    fontSize: 25,
    fontWeight: "900",
  },

  route: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
  },

  stationCode: {
    color: "#09244D",
    fontSize: 19,
    fontWeight: "900",
  },

  stationName: {
    color: "#6A7D95",
    fontSize: 9,
    marginTop: 2,
    maxWidth: 70,
  },

  routeLineContainer: {
    flex: 1,
    height: 35,
    justifyContent: "center",
    marginHorizontal: 10,
    position: "relative",
  },

  routeLine: {
    height: 3,
    backgroundColor: "#D71920",
    width: "100%",
  },

  routeTrain: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
  },

  routeStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  stat: {
    flex: 1,
    backgroundColor: "#F0F3F7",
    borderRadius: 11,
    padding: 12,
  },

  statLabel: {
    color: "#687C96",
    fontSize: 8,
    letterSpacing: 1,
  },

  statValue: {
    color: "#09244D",
    fontWeight: "900",
    fontSize: 13,
    marginTop: 5,
  },

  proceed: {
    height: 56,
    backgroundColor: "#D71920",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 3,
  },

  disabled: {
    opacity: 0.35,
  },

  proceedText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },

  operator: {
    textAlign: "center",
    color: "#8492A6",
    fontSize: 10,
    marginTop: 15,
  },

});