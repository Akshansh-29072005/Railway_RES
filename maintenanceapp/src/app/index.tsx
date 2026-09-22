import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import PrimaryButton from "../components/PrimaryButton";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

export default function LoginScreen() {
  const [railwayId, setRailwayId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    if (!railwayId.trim() || !password.trim()) {
      setError("Please enter Railway ID and password.");
      return;
    }

    /*
      Demo authentication.

      Demo:
      Railway ID: LP12345
      Password: railway123

      Later this will connect to your backend/database.
    */

    if (
      railwayId.trim().toUpperCase() === "ENG123" &&
      password === "railway123"
    ) {
      router.replace("/dashboard");
    } else {
      setError(
        "Invalid Railway ID or password. Use ENG123 / railway123 for demo."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoTrain}>🛠️</Text>
            </View>
          </View>

          <Text style={styles.brand}>MAINTENANCE APP</Text>
          <Text style={styles.title}>Portal</Text>

          <Text style={styles.description}>
            Secure access to railway engineering operations,
            real-time block tracking and incident reporting.
          </Text>

          <View style={styles.loginCard}>
            <Text style={styles.cardTitle}>Engineering Staff Login</Text>

            <Text style={styles.label}>RAILWAY ID</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Railway ID"
              placeholderTextColor="#999"
              value={railwayId}
              onChangeText={setRailwayId}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <Text style={styles.label}>PASSWORD</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(!showPassword)
                }
              >
                <Text style={styles.showPassword}>
                  {showPassword ? "HIDE" : "SHOW"}
                </Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <PrimaryButton
              title="LOGIN TO PORTAL"
              onPress={handleLogin}
            />

            <Text style={styles.demoText}>
              Demo: ENG123 / railway123
            </Text>
          </View>

          <Text style={styles.footer}>
            Indian Railways
          </Text>

          <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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

  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },

  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  logoTrain: {
    fontSize: 38,
  },

  brand: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 2,
  },

  title: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 2,
  },

  description: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 28,
  },

  loginCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 24,
  },

  label: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 15,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 18,
    backgroundColor: "#FAFAFA",
  },

  passwordContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#FAFAFA",
    marginBottom: 18,
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },

  showPassword: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  errorBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: 15,
  },

  errorText: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 18,
  },

  demoText: {
    textAlign: "center",
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 14,
  },

  footer: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 25,
  },

  version: {
    textAlign: "center",
    color: COLORS.textLight,
    fontSize: 10,
    marginTop: 5,
  },
});