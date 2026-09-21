import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { COLORS, RADIUS, SPACING } from "../constants/theme";

// Ready for backend integration
const MOCK_DATA: any[] = [];

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<"ongoing" | "planned">("ongoing");
  const [tasks, setTasks] = useState(MOCK_DATA);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const filteredTasks = tasks.filter(t => t.status === activeTab);

  const handleEndNow = (id: string) => {
    Alert.alert(
      "Confirm Completion",
      "Are you sure you want to end this maintenance block early? This will instantly update the ETA ML engine.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "End Now", 
          style: "destructive",
          onPress: () => {
            setTasks(prev => prev.filter(t => t.id !== id));
            setSelectedTask(null);
          }
        }
      ]
    );
  };

  const renderTaskCard = (task: any) => (
    <TouchableOpacity 
      key={task.id} 
      style={styles.card}
      onPress={() => setSelectedTask(task)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>{task.type}</Text>
        <View style={[styles.badge, task.status === 'ongoing' ? styles.badgeOngoing : styles.badgePlanned]}>
          <Text style={[styles.badgeText, task.status === 'ongoing' ? styles.badgeTextOngoing : styles.badgeTextPlanned]}>
            {task.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>SECTION</Text>
          <Text style={styles.cardValue}>{task.section}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>BLOCK ID</Text>
          <Text style={styles.cardValue}>{task.block}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>TIME</Text>
          <Text style={styles.cardValue}>{task.startTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Network Status</Text>
          <Text style={styles.headerSubtitle}>Engineering Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace("/")}>
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "ongoing" && styles.activeTab]}
          onPress={() => setActiveTab("ongoing")}
        >
          <Text style={[styles.tabText, activeTab === "ongoing" && styles.activeTabText]}>Ongoing</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "planned" && styles.activeTab]}
          onPress={() => setActiveTab("planned")}
        >
          <Text style={[styles.tabText, activeTab === "planned" && styles.activeTabText]}>Planned</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No {activeTab} maintenance blocks.</Text>
          </View>
        ) : (
          filteredTasks.map(renderTaskCard)
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push("/report")}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Details Modal */}
      <Modal
        visible={!!selectedTask}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTask(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTask && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Block Details</Text>
                  <TouchableOpacity onPress={() => setSelectedTask(null)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalLabel}>INCIDENT TYPE</Text>
                  <Text style={styles.modalValueMain}>{selectedTask.type}</Text>

                  <Text style={styles.modalLabel}>SECTION & BLOCK</Text>
                  <Text style={styles.modalValue}>{selectedTask.section} • Block {selectedTask.block}</Text>

                  <Text style={styles.modalLabel}>EXPECTED DURATION</Text>
                  <Text style={styles.modalValue}>{selectedTask.duration} Hours</Text>

                  <Text style={styles.modalLabel}>START TIME</Text>
                  <Text style={styles.modalValue}>{selectedTask.startTime}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.endBtn} 
                  onPress={() => handleEndNow(selectedTask.id)}
                >
                  <Text style={styles.endBtnText}>END MAINTENANCE NOW</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: COLORS.primary },
  headerSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: "600" },
  logoutBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  logoutText: { fontSize: 10, fontWeight: "800", color: COLORS.textSecondary },
  
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  activeTabText: { color: COLORS.primary, fontWeight: "800" },

  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardType: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm },
  badgeOngoing: { backgroundColor: "#FFF3E0" }, // Orange tint
  badgeTextOngoing: { color: "#F57C00", fontSize: 10, fontWeight: "800" },
  badgePlanned: { backgroundColor: "#E3F2FD" }, // Blue tint
  badgeTextPlanned: { color: "#1976D2", fontSize: 10, fontWeight: "800" },
  
  cardBody: { flexDirection: "row", justifyContent: "space-between" },
  cardRow: { flex: 1 },
  cardLabel: { fontSize: 10, fontWeight: "800", color: COLORS.textSecondary, marginBottom: 4 },
  cardValue: { fontSize: 13, fontWeight: "600", color: COLORS.text },

  emptyState: { alignItems: "center", marginTop: 40 },
  emptyText: { color: COLORS.textLight, fontSize: 14, fontWeight: "600" },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: { color: COLORS.white, fontSize: 32, fontWeight: "300", lineHeight: 34 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  modalClose: { fontSize: 20, color: COLORS.textSecondary, padding: 4 },
  modalBody: { marginBottom: 30 },
  modalLabel: { fontSize: 11, fontWeight: "800", color: COLORS.textSecondary, marginTop: 16, marginBottom: 4 },
  modalValueMain: { fontSize: 22, fontWeight: "800", color: COLORS.primary },
  modalValue: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  
  endBtn: {
    backgroundColor: "#FFEBEB", // Light red
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFCDCD",
  },
  endBtnText: {
    color: "#D32F2F", // Deep red
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  }
});