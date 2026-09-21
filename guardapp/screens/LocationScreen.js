import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
  ScrollView,
} from "react-native";

import * as Location from "expo-location";


export default function LocationScreen({
  railwayId,
  selectedTrain,
  onBack,
}) {

  const [permission, setPermission] = useState(null);

  const [gpsActive, setGpsActive] = useState(false);

  const [tracking, setTracking] = useState(false);

  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");


  /*
   * CLEAN GPS WATCHER
   */

  useEffect(() => {

    return () => {
      stopTracking();
    };

  }, []);


  /*
   * START LOCATION
   */

  const startGPS = async () => {

    try {

      setLoading(true);
      setMessage("");

      /*
       * Check Android location services
       */

      const servicesEnabled =
        await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {

        if (Platform.OS === "android") {

          try {

            await Location.enableNetworkProviderAsync();

          } catch (error) {

            setLoading(false);

            Alert.alert(
              "Location is Off",
              "Please enable Location/GPS on your phone and try again.",
              [
                {
                  text: "Open Settings",
                  onPress: () =>
                    Linking.openSettings(),
                },
                {
                  text: "Cancel",
                  style: "cancel",
                },
              ]
            );

            return;
          }

        } else {

          setLoading(false);

          Alert.alert(
            "Location is Off",
            "Please enable Location Services on your device."
          );

          return;
        }
      }


      /*
       * Request permission
       */

      const result =
        await Location.requestForegroundPermissionsAsync();

      setPermission(result.status);


      if (result.status !== "granted") {

        setLoading(false);

        setMessage(
          "Location permission is required to start tracking."
        );

        return;
      }


      /*
       * Get current location
       */

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation(current.coords);

      setGpsActive(true);


      /*
       * Start continuous tracking
       */

      const subscription =
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,

            timeInterval: 3000,

            distanceInterval: 5,
          },

          (newLocation) => {

            setLocation(newLocation.coords);

          }
        );


      /*
       * Store subscription globally on component
       */

      LocationScreen.watcher = subscription;

      setTracking(true);

      setLoading(false);

    } catch (error) {

      console.log(error);

      setLoading(false);

      setMessage(
        "Unable to access GPS. Please try again."
      );

    }

  };


  /*
   * STOP TRACKING
   */

  const stopTracking = () => {

    if (LocationScreen.watcher) {

      LocationScreen.watcher.remove();

      LocationScreen.watcher = null;

    }

    setTracking(false);

    setGpsActive(false);

  };


  /*
   * GPS OFF SCREEN
   */

  if (!gpsActive) {

    return (

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.offContent}
      >

        <Header
          title="Live Location"
          onBack={onBack}
        />


        <View style={styles.locationCircleOuter}>

          <View style={styles.locationCircle}>

            <Text style={styles.locationIcon}>
              ⌖
            </Text>

          </View>

        </View>


        <Text style={styles.enableTitle}>
          Enable GPS
        </Text>

        <Text style={styles.enableSubtitle}>
          To track your exact location, please turn on your GPS.
        </Text>


        <Benefit
          icon="◎"
          text="Real-time tracking of your train"
        />

        <Benefit
          icon="♢"
          text="Improved safety and monitoring"
        />

        <Benefit
          icon="⌁"
          text="Accurate location updates"
        />


        {message ? (
          <Text style={styles.error}>
            {message}
          </Text>
        ) : null}


        <TouchableOpacity
          style={styles.gpsButton}
          onPress={startGPS}
          disabled={loading}
        >

          {loading ? (

            <View style={styles.loadingRow}>

              <ActivityIndicator color="#FFFFFF" />

              <Text style={styles.gpsButtonText}>
                REQUESTING PERMISSION
              </Text>

            </View>

          ) : (

            <Text style={styles.gpsButtonText}>
              TURN ON GPS
            </Text>

          )}

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.notNow}
          onPress={onBack}
        >

          <Text style={styles.notNowText}>
            Not Now
          </Text>

        </TouchableOpacity>


        <Text style={styles.privacy}>
          ♙ Location data is used only for operational and safety purposes.
        </Text>

      </ScrollView>
    );

  }


  /*
   * GPS ACTIVE SCREEN
   */

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.activeContent}
    >

      <Header
        title="Live Location"
        onBack={onBack}
      />


      {/* STATUS */}

      <View style={styles.statusRow}>

        <Status
          active
          text="GPS: ACTIVE"
        />

        <Status
          active={tracking}
          text={
            tracking
              ? "TRACKING: ACTIVE"
              : "TRACKING: STOPPED"
          }
        />

        <Status
          text="DUTY: ON DUTY"
        />

      </View>


      {/* COORDINATES */}

      <View style={styles.coordinatesGrid}>

        <Metric
          title="LATITUDE"
          value={
            location
              ? location.latitude.toFixed(6)
              : "--"
          }
        />

        <Metric
          title="LONGITUDE"
          value={
            location
              ? location.longitude.toFixed(6)
              : "--"
          }
        />

        <Metric
          title="ACCURACY"
          value={
            location?.accuracy
              ? `± ${location.accuracy.toFixed(0)} m`
              : "--"
          }
        />

        <Metric
          title="SPEED"
          value={
            location?.speed &&
            location.speed >= 0
              ? `${(location.speed * 3.6).toFixed(1)} km/h`
              : "Unavailable"
          }
        />

      </View>


      {/* LAST UPDATED */}

      <View style={styles.updatedCard}>

        <Text style={styles.metricTitle}>
          LAST UPDATED
        </Text>

        <Text style={styles.metricValue}>
          {new Date().toLocaleTimeString()}
        </Text>

      </View>


      {/* POSITION VIEW */}

      <View style={styles.mapCard}>

        <View style={styles.mapGrid}>

          <View style={styles.markerCircle}>

            <Text style={styles.marker}>
              ⌖
            </Text>

          </View>

          <Text style={styles.mapCoordinates}>

            {location
              ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
              : "--"}

          </Text>

          <Text style={styles.mapAccuracy}>

            Accuracy ±{" "}
            {location?.accuracy
              ? `${location.accuracy.toFixed(0)} m`
              : "--"}

          </Text>

        </View>

        <Text style={styles.mapLabel}>
          OPERATIONAL POSITION VIEW
        </Text>

      </View>


      {/* OPERATIONAL DETAILS */}

      <View style={styles.detailsCard}>

        <Text style={styles.detailsTitle}>
          Operational Details
        </Text>

        <Detail
          title="Current route"
          value={`${selectedTrain.from} → ${selectedTrain.to}`}
        />

        <Detail
          title="Train number"
          value={selectedTrain.number}
        />

        <Detail
          title="Loco number"
          value={selectedTrain.loco}
        />

        <Detail
          title="Pilot Railway ID"
          value={railwayId}
        />


        <TouchableOpacity
          style={styles.stopButton}
          onPress={stopTracking}
        >

          <Text style={styles.stopText}>
            ⊗ STOP LOCATION SHARING
          </Text>

        </TouchableOpacity>

      </View>


      {/* CHANGE TRAIN */}

      <TouchableOpacity
        style={styles.changeTrain}
        onPress={() => {

          stopTracking();
          onBack();

        }}
      >

        <Text style={styles.changeText}>
          ← Change Train
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
}


/*
 * HEADER
 */

function Header({ title, onBack }) {

  return (

    <View style={styles.header}>

      <View style={styles.brandBox}>

        <View style={styles.brandLogo}>
          <Text style={styles.brandLogoText}>
            L
          </Text>
        </View>

        <View>

          <Text style={styles.brandTitle}>
            {title}
          </Text>

          <Text style={styles.brandSubtitle}>
            GUARD APP
          </Text>

        </View>

      </View>

      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>
          ←
        </Text>
      </TouchableOpacity>

    </View>
  );
}


/*
 * BENEFIT
 */

function Benefit({ icon, text }) {

  return (

    <View style={styles.benefit}>

      <Text style={styles.benefitIcon}>
        {icon}
      </Text>

      <Text style={styles.benefitText}>
        {text}
      </Text>

    </View>
  );
}


/*
 * STATUS
 */

function Status({ active, text }) {

  return (

    <View
      style={[
        styles.status,
        active
          ? styles.statusActive
          : styles.statusInactive,
      ]}
    >

      <View
        style={[
          styles.statusDot,
          active
            ? styles.dotGreen
            : styles.dotGray,
        ]}
      />

      <Text
        style={[
          styles.statusText,
          active
            ? styles.statusGreen
            : styles.statusGray,
        ]}
      >
        {text}
      </Text>

    </View>
  );
}


/*
 * METRIC
 */

function Metric({ title, value }) {

  return (

    <View style={styles.metric}>

      <Text style={styles.metricTitle}>
        {title}
      </Text>

      <Text style={styles.metricValue}>
        {value}
      </Text>

    </View>
  );
}


/*
 * DETAIL
 */

function Detail({ title, value }) {

  return (

    <View style={styles.detail}>

      <Text style={styles.detailTitle}>
        {title}
      </Text>

      <Text style={styles.detailValue}>
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

  offContent: {
    padding: 18,
    alignItems: "center",
    paddingBottom: 35,
  },

  activeContent: {
    padding: 18,
    paddingBottom: 40,
  },


  /* HEADER */

  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#DCE2EA",
    marginBottom: 30,
  },

  brandBox: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#D71920",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  brandLogoText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  brandTitle: {
    color: "#09244D",
    fontWeight: "900",
    fontSize: 15,
  },

  brandSubtitle: {
    color: "#72839A",
    fontSize: 8,
    letterSpacing: 1.7,
    marginTop: 2,
  },

  back: {
    color: "#09244D",
    fontSize: 25,
  },


  /* GPS OFF */

  locationCircleOuter: {
    width: 178,
    height: 178,
    borderRadius: 89,
    borderWidth: 1,
    borderColor: "#D8DEE8",
    backgroundColor: "#EFF2F7",
    justifyContent: "center",
    alignItems: "center",
  },

  locationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D71920",
    justifyContent: "center",
    alignItems: "center",
  },

  locationIcon: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "300",
  },

  enableTitle: {
    color: "#09244D",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 28,
  },

  enableSubtitle: {
    color: "#667A94",
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 25,
  },

  benefit: {
    width: "100%",
    minHeight: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DCE2EA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  benefitIcon: {
    color: "#D71920",
    fontSize: 20,
    width: 25,
  },

  benefitText: {
    color: "#09244D",
    fontSize: 12,
    marginLeft: 5,
  },

  gpsButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#D71920",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  gpsButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: 1,
    fontSize: 12,
  },

  notNow: {
    width: "100%",
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#D5DDE7",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  notNowText: {
    color: "#526986",
    fontSize: 12,
  },

  privacy: {
    color: "#71829A",
    textAlign: "center",
    fontSize: 9,
    marginTop: 22,
  },

  error: {
    color: "#D71920",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },


  /* ACTIVE */

  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 14,
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },

  statusActive: {
    backgroundColor: "#E5F2EC",
  },

  statusInactive: {
    backgroundColor: "#EDF0F4",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  dotGreen: {
    backgroundColor: "#299565",
  },

  dotGray: {
    backgroundColor: "#7B8798",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  statusGreen: {
    color: "#237951",
  },

  statusGray: {
    color: "#50627A",
  },


  /* METRICS */

  coordinatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  metric: {
    width: "48.5%",
    minHeight: 80,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E0E9",
    borderRadius: 14,
    padding: 13,
  },

  metricTitle: {
    color: "#61758F",
    fontSize: 8,
    letterSpacing: 1.4,
    fontWeight: "800",
  },

  metricValue: {
    color: "#09244D",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 9,
  },

  updatedCard: {
    width: "48.5%",
    minHeight: 75,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E0E9",
    borderRadius: 14,
    padding: 13,
    marginTop: 9,
  },


  /* POSITION */

  mapCard: {
    height: 300,
    marginTop: 18,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D7DFE9",
    backgroundColor: "#E9EEF5",
  },

  mapGrid: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  markerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D71920",
    justifyContent: "center",
    alignItems: "center",
  },

  marker: {
    color: "#FFFFFF",
    fontSize: 32,
  },

  mapCoordinates: {
    color: "#09244D",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 10,
  },

  mapAccuracy: {
    color: "#657A94",
    fontSize: 10,
    marginTop: 3,
  },

  mapLabel: {
    color: "#6C7E94",
    fontSize: 8,
    letterSpacing: 1.5,
    padding: 12,
  },


  /* DETAILS */

  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9E0E9",
    padding: 17,
    marginTop: 15,
  },

  detailsTitle: {
    color: "#09244D",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 7,
  },

  detail: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E7EE",
    paddingVertical: 14,
  },

  detailTitle: {
    color: "#657A94",
    fontSize: 11,
  },

  detailValue: {
    color: "#09244D",
    fontSize: 11,
    fontWeight: "900",
    maxWidth: "55%",
    textAlign: "right",
  },

  stopButton: {
    height: 53,
    backgroundColor: "#D71920",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  stopText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  changeTrain: {
    alignItems: "center",
    paddingVertical: 20,
  },

  changeText: {
    color: "#526986",
    fontSize: 12,
    fontWeight: "700",
  },

});