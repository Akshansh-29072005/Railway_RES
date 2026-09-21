import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";

import StatusBadge from "../components/StatusBadge";
import InfoCard from "../components/InfoCard";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

interface PositionData {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
}

export default function DashboardScreen() {
  const params = useLocalSearchParams();

  const [location, setLocation] =
    useState<PositionData | null>(null);

  const [tracking, setTracking] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(
    new Date()
  );

  const watcher =
    useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    startTracking();

    return () => {
      watcher.current?.remove();
    };
  }, []);

  const startTracking = async () => {
    try {
      const permission =
        await Location.getForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setTracking(false);
        return;
      }

      setTracking(true);

      watcher.current?.remove();

      watcher.current =
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy ?? 0,
              speed: position.coords.speed ?? 0,
            });

            setLastUpdated(new Date());
          }
        );
    } catch (error) {
      console.log(error);
      setTracking(false);
    }
  };

  const stopTracking = () => {
    watcher.current?.remove();
    watcher.current = null;

    setTracking(false);
  };

  const resumeTracking = async () => {
    await startTracking();
  };

  const stopLocationSharing = () => {
    stopTracking();

    Alert.alert(
      "Location Sharing Stopped",
      "Your live location is no longer being shared.",
      [
        {
          text: "OK",
        },
      ]
    );
  };

  const logout = () => {
    watcher.current?.remove();
    router.replace("/");
  };

  const latitude = location
    ? location.latitude.toFixed(6)
    : "--";

  const longitude = location
    ? location.longitude.toFixed(6)
    : "--";

  const accuracy = location
    ? `${location.accuracy.toFixed(1)} m`
    : "--";

  const speed = location
    ? `${Math.max(0, location.speed * 3.6).toFixed(1)} km/h`
    : "--";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.portal}>
              GAURD APP
            </Text>

            <Text style={styles.title}>
              Duty Dashboard
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
          >
            <Text style={styles.logoutText}>
              EXIT
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.badges}>
          <StatusBadge
            label={`GPS: ${tracking ? "ACTIVE" : "STOPPED"}`}
            type={tracking ? "success" : "warning"}
          />

          <StatusBadge
            label={`TRACKING: ${
              tracking ? "ACTIVE" : "STOPPED"
            }`}
            type={tracking ? "success" : "warning"}
          />

          <StatusBadge
            label="DUTY: ON DUTY"
            type="danger"
          />
        </View>

        {!tracking && (
          <View style={styles.stoppedBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.stoppedTitle}>
                TRACKING STOPPED
              </Text>

              <Text style={styles.stoppedText}>
                Live location sharing is currently paused.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.resumeButton}
              onPress={resumeTracking}
            >
              <Text style={styles.resumeText}>
                RESUME
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.dutyCard}>
          <View style={styles.dutyHeader}>
            <View>
              <Text style={styles.cardLabel}>
                TODAY'S DUTY
              </Text>

              <Text style={styles.trainNumber}>
                {params.trainNumber || "12345"}
              </Text>
            </View>

            <View style={styles.onDuty}>
              <View style={styles.greenDot} />
              <Text style={styles.onDutyText}>
                ON DUTY
              </Text>
            </View>
          </View>

          <Text style={styles.trainName}>
            {params.trainName ||
              "Howrah-New Delhi Rajdhani"}
          </Text>

          <View style={styles.routeRow}>
            <RoutePoint
              label="FROM"
              value={String(params.from || "HWH")}
            />

            <View style={styles.routeLine}>
              <View style={styles.line} />
              <Text style={styles.trainSmall}>
                🚆
              </Text>
              <View style={styles.line} />
            </View>

            <RoutePoint
              label="TO"
              value={String(params.to || "NDLS")}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          LIVE LOCATION
        </Text>

        <View style={styles.locationGrid}>
          <InfoCard
            title="LATITUDE"
            value={latitude}
          />

          <InfoCard
            title="LONGITUDE"
            value={longitude}
          />

          <InfoCard
            title="ACCURACY"
            value={accuracy}
          />

          <InfoCard
            title="SPEED"
            value={speed}
          />
        </View>

        <View style={styles.updatedCard}>
          <View style={styles.updatedDot} />

          <View>
            <Text style={styles.updatedTitle}>
              LAST UPDATED
            </Text>

            <Text style={styles.updatedTime}>
              {lastUpdated.toLocaleTimeString()}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          OPERATIONAL POSITION
        </Text>

        <View style={styles.mapCard}>
          <View style={styles.mapGrid}>
            {Array.from({ length: 36 }).map((_, index) => (
              <View
                key={index}
                style={styles.gridSquare}
              />
            ))}
          </View>

          <View style={styles.mapMarker}>
            <View style={styles.markerPulse} />

            <View style={styles.marker}>
              <Text style={styles.markerText}>
                🚆
              </Text>
            </View>
          </View>

          <View style={styles.mapOverlay}>
            <Text style={styles.mapLabel}>
              CURRENT POSITION
            </Text>

            <Text style={styles.mapCoordinates}>
              {latitude} , {longitude}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          OPERATIONAL DETAILS
        </Text>

        <View style={styles.operationsCard}>
          <OperationRow
            label="CURRENT ROUTE"
            value={`${params.from || "HWH"} → ${
              params.to || "NDLS"
            }`}
          />

          <OperationRow
            label="TRAIN NUMBER"
            value={String(params.trainNumber || "12345")}
          />

          <OperationRow
            label="LOCOMOTIVE"
            value={String(params.loco || "WAP-7 30293")}
          />

          <OperationRow
            label="PILOT RAILWAY ID"
            value="LP12345"
          />
        </View>

        <TouchableOpacity
          style={styles.stopButton}
          activeOpacity={0.8}
          onPress={stopLocationSharing}
        >
          <Text style={styles.stopButtonText}>
            STOP LOCATION SHARING
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Location tracking is used for railway safety,
          operations and duty monitoring.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function RoutePoint({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View>
      <Text style={styles.routeLabel}>{label}</Text>
      <Text style={styles.routeValue}>{value}</Text>
    </View>
  );
}

function OperationRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.operationRow}>
      <Text style={styles.operationLabel}>
        {label}
      </Text>

      <Text style={styles.operationValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    padding: SPACING.xl,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  portal: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 3,
  },

  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  logoutText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: "800",
  },

  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 18,
  },

  stoppedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "#F0D27B",
    padding: 13,
    marginTop: 15,
  },

  stoppedTitle: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: "900",
  },

  stoppedText: {
    color: "#806000",
    fontSize: 10,
    marginTop: 3,
  },

  resumeButton: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 8,
    marginLeft: 8,
  },

  resumeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },

  dutyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  dutyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardLabel: {
    fontSize: 9,
    color: COLORS.textLight,
    fontWeight: "900",
    letterSpacing: 1,
  },

  trainNumber: {
    fontSize: 27,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 3,
  },

  onDuty: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successLight,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 5,
  },

  onDutyText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: "900",
  },

  trainName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
  },

  routeLabel: {
    color: COLORS.textLight,
    fontSize: 8,
    fontWeight: "900",
  },

  routeValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 3,
  },

  routeLine: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  trainSmall: {
    fontSize: 13,
    marginHorizontal: 5,
  },

  sectionTitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
  },

  locationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  updatedCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 13,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  updatedDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.success,
    marginRight: 9,
  },

  updatedTitle: {
    fontSize: 9,
    color: COLORS.textLight,
    fontWeight: "800",
  },

  updatedTime: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "700",
    marginTop: 2,
  },

  mapCard: {
    height: 230,
    backgroundColor: "#F8F8F8",
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
  },

  mapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  gridSquare: {
    width: "16.66%",
    height: "16.66%",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E7E7E7",
  },

  mapMarker: {
    position: "absolute",
    left: "50%",
    top: "45%",
    transform: [{ translateX: -22 }],
    alignItems: "center",
    justifyContent: "center",
  },

  markerPulse: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(215,25,32,0.15)",
    position: "absolute",
  },

  marker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  markerText: {
    fontSize: 16,
  },

  mapOverlay: {
    position: "absolute",
    left: 14,
    bottom: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 10,
    borderRadius: 9,
  },

  mapLabel: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "900",
  },

  mapCoordinates: {
    color: COLORS.text,
    fontSize: 9,
    marginTop: 3,
    fontWeight: "700",
  },

  operationsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  operationRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  operationLabel: {
    fontSize: 9,
    color: COLORS.textLight,
    fontWeight: "800",
  },

  operationValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "800",
    marginTop: 4,
  },

  stopButton: {
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: "#F0BFC2",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  stopButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  footer: {
    textAlign: "center",
    color: COLORS.textLight,
    fontSize: 9,
    lineHeight: 15,
    marginTop: 18,
  },
});