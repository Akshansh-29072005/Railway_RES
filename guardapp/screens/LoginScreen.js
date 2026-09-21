import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

export default function LoginScreen({ onLogin }) {
  const [railwayId, setRailwayId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = () => {
    setError("");

    if (!railwayId.trim() || !password.trim()) {
      setError("Please enter Railway ID and Password.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      onLogin({
        railwayId: railwayId.trim().toUpperCase(),
      });
    }, 700);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>

        <View style={styles.logo}>
          <Text style={styles.logoText}>L</Text>
        </View>

        <Text style={styles.title}>GUARD APP</Text>

        <Text style={styles.subtitle}>
          PORTAL
        </Text>

        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            Railway Authentication
          </Text>

          <Text style={styles.cardSubtitle}>
            Enter your credentials to continue
          </Text>

          <Text style={styles.label}>
            RAILWAY ID
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Railway ID"
            placeholderTextColor="#8290A3"
            value={railwayId}
            onChangeText={setRailwayId}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>
            PASSWORD
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#8290A3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? (
            <Text style={styles.error}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={login}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginText}>
                SIGN IN  →
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.security}>
            <Text style={styles.lock}>♙</Text>

            <Text style={styles.securityText}>
              Secure Railway Authentication
            </Text>
          </View>

        </View>

        <Text style={styles.footer}>
          Railway Operations System
        </Text>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  logo: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: "#D71920",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
  },

  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "900",
    color: "#09244D",
    letterSpacing: 2,
  },

  subtitle: {
    textAlign: "center",
    color: "#60728C",
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 5,
    marginBottom: 28,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#DCE2EA",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  cardTitle: {
    color: "#09244D",
    fontSize: 20,
    fontWeight: "800",
  },

  cardSubtitle: {
    color: "#687A92",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 16,
  },

  label: {
    color: "#526986",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 7,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#D3DBE6",
    borderRadius: 11,
    paddingHorizontal: 15,
    color: "#09244D",
    backgroundColor: "#F8FAFC",
    fontSize: 14,
  },

  error: {
    color: "#D71920",
    fontSize: 12,
    marginTop: 10,
  },

  loginButton: {
    height: 53,
    backgroundColor: "#D71920",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },

  security: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },

  lock: {
    color: "#526986",
    marginRight: 7,
  },

  securityText: {
    color: "#60728C",
    fontSize: 11,
  },

  footer: {
    textAlign: "center",
    marginTop: 22,
    color: "#8492A6",
    fontSize: 10,
  },
});