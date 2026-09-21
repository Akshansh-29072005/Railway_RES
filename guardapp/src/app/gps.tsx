import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";

import PrimaryButton from "../components/PrimaryButton";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

export default function GPSScreen() {
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);

  const enableGPS = async () => {
    try {
      setLoading(true);

      const servicesEnabled =
        await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        try {
          await Location.enableNetworkProviderAsync();
        } catch {
          Alert.alert(
            "Location Services Required",
            "Please enable Location/GPS from your Android device settings and try again."
          );

          setLoading(false);
          return;
        }
      }

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Location permission is required to track the Train."
        );

        setLoading(false);
        return;
      }

      router.replace({
        pathname: "/dashboard",
        params: {
          trainNumber: params.trainNumber,
          trainName: params.trainName,
          from: params.from,
          to: params.to,
          loco: params.loco,
        },
      });
    } catch (error) {
      console.log(error);

      Alert.alert(
        "GPS Error",
        "Unable to access your location. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const notNow = () => {
    Alert.alert(
      "GPS Required",
      "Location tracking is required for Railway operations. You can enable it when ready."
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <View style={styles.topRow}>
          <Text style={styles.step}>STEP 3 OF 3</Text>

          <View style={styles.secureBadge}>
            <Text style={styles.secureText}>
              🔒 SECURE
            </Text>
          </View>
        </View>

        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Text style={styles.locationIcon}>●</Text>
          </View>
        </View>

        <Text style={styles.title}>LIVE LOCATION</Text>

        <Text style={styles.heading}>
          Enable GPS
        </Text>

        <Text style={styles.description}>
          Your location helps railway operations monitor
          train movement and maintain accurate operational
          records.
        </Text>

        <View style={styles.benefits}>
          <Benefit
            icon="◉"
            title="Real-time tracking"
            description="Track the current position of your train."
          />

          <Benefit
            icon="✓"
            title="Improved safety"
            description="Helps railway operations monitor your journey."
          />

          <Benefit
            icon="⌖"
            title="Accurate updates"
            description="Provides precise location information."
          />
        </View>

        <View style={styles.trainInfo}>
          <Text style={styles.infoLabel}>
            TRAIN ASSIGNMENT
          </Text>

          <Text style={styles.trainNumber}>
            {params.trainNumber}
          </Text>

          <Text style={styles.trainName}>
            {params.trainName}
          </Text>
        </View>

        <PrimaryButton
          title="TURN ON GPS"
          onPress={enableGPS}
          loading={loading}
        />

        <Text
          style={styles.notNow}
          onPress={notNow}
        >
          Not Now
        </Text>

        <Text style={styles.privacy}>
          Your location is used only for railway operational
          tracking and safety purposes. Location sharing can
          be stopped from the tracking dashboard.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Benefit({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.benefit}>
      <View style={styles.benefitIcon}>
        <Text style={styles.benefitIconText}>
          {icon}
        </Text>
      </View>

      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>
          {title}
        </Text>

        <Text style={styles.benefitDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flexGrow: 1,
    padding: SPACING.xxl,
    justifyContent: "center",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 35,
  },

  step: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "800",
    letterSpacing: 1,
  },

  secureBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },

  secureText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: "800",
  },

  iconWrapper: {
    alignItems: "center",
  },

  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F4BFC2",
  },

  locationIcon: {
    fontSize: 38,
    color: COLORS.primary,
  },

  title: {
    textAlign: "center",
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 25,
  },

  heading: {
    textAlign: "center",
    color: COLORS.text,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 5,
  },

  description: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 25,
  },

  benefits: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15,
  },

  benefit: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },

  benefitIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  benefitIconText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "800",
  },

  benefitContent: {
    flex: 1,
    marginLeft: 12,
  },

  benefitTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  benefitDescription: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  trainInfo: {
    backgroundColor: "#FFF9F9",
    borderRadius: RADIUS.md,
    padding: 15,
    borderWidth: 1,
    borderColor: "#F2D2D4",
    marginBottom: 18,
  },

  infoLabel: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: "800",
    letterSpacing: 1,
  },

  trainNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 3,
  },

  trainName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  notNow: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 17,
    padding: 8,
  },

  privacy: {
    textAlign: "center",
    color: COLORS.textLight,
    fontSize: 9,
    lineHeight: 15,
    marginTop: 12,
  },
});