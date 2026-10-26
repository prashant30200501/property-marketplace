
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { createEnquiry } from "../services/api";

export default function EnquiryConfirmation() {
  const params = useLocalSearchParams<{
    propertyId: string;
    title: string;
    location: string;
    price: string;
  }>();

  const propertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId;
  const title = Array.isArray(params.title) ? params.title[0] : params.title;
  const location = Array.isArray(params.location)
    ? params.location[0]
    : params.location;
  const price = Array.isArray(params.price) ? params.price[0] : params.price;

  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (submitting || confirmed) return;

    if (!propertyId) {
      Alert.alert("Missing property", "Please return to the listing and try again.");
      return;
    }

    setSubmitting(true);

    try {
      await createEnquiry({
        property_id: propertyId,
        customer_message: `Enquiry about ${title || "this property"}.`,
      });

      setConfirmed(true);
      Alert.alert(
        "Enquiry submitted",
        "Nestora has received your enquiry. Our team will review it and assign a suitable broker."
      );
    } catch (error) {
      Alert.alert(
        "Couldn't submit enquiry",
        error instanceof Error
          ? error.message
          : "Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable onPress={() => router.back()} disabled={submitting}>
        <Text style={styles.backText}>← Back to property</Text>
      </Pressable>

      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🏡</Text>
      </View>

      <Text style={styles.heading}>
        {confirmed ? "Enquiry Submitted!" : "Confirm Your Enquiry"}
      </Text>

      <Text style={styles.subtitle}>
        {confirmed
          ? "Your enquiry has been submitted to Nestora for review."
          : "Confirm your interest and our team will help connect you with a suitable broker."}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>PROPERTY DETAILS</Text>
        <Text style={styles.propertyTitle}>{title || "Selected Property"}</Text>
        <Text style={styles.location}>📍 {location || "Location unavailable"}</Text>
        <Text style={styles.price}>{price || "Price unavailable"}</Text>
        <Text style={styles.reference}>Property ID: {propertyId || "N/A"}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What happens next?</Text>
        <Text style={styles.infoText}>• Your enquiry will be saved in Nestora.</Text>
        <Text style={styles.infoText}>• Our admin team will review your requirements.</Text>
        <Text style={styles.infoText}>• A suitable broker will be assigned after review.</Text>
      </View>

      <Pressable
        style={[
          styles.confirmButton,
          confirmed && styles.confirmedButton,
          submitting && styles.disabledButton,
        ]}
        onPress={handleConfirm}
        disabled={confirmed || submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.confirmButtonText}>
            {confirmed ? "Enquiry Submitted ✓" : "Submit Enquiry"}
          </Text>
        )}
      </Pressable>

      <Pressable
        style={styles.homeButton}
        onPress={() => router.replace("/customer-home")}
        disabled={submitting}
      >
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        Your enquiry will not be assigned to a broker automatically.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 24, paddingBottom: 40 },
  backText: { color: "#555B68", fontSize: 15, fontWeight: "500", marginBottom: 28 },
  iconContainer: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: "#FFF0E5",
    alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 20,
  },
  icon: { fontSize: 36 },
  heading: { fontSize: 25, fontWeight: "700", color: "#171923", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 15, color: "#737987", textAlign: "center", lineHeight: 22, marginBottom: 28 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#E9EAF0", marginBottom: 20 },
  cardLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: "#888D99", marginBottom: 14 },
  propertyTitle: { fontSize: 19, fontWeight: "700", color: "#171923", marginBottom: 8 },
  location: { fontSize: 14, color: "#737987", marginBottom: 14 },
  price: { fontSize: 21, fontWeight: "700", color: "#E87524", marginBottom: 12 },
  reference: { fontSize: 12, color: "#888D99" },
  infoBox: { backgroundColor: "#FFF7F0", borderRadius: 14, padding: 18, marginBottom: 24 },
  infoTitle: { fontSize: 16, fontWeight: "700", color: "#282B33", marginBottom: 12 },
  infoText: { fontSize: 14, color: "#555B68", lineHeight: 22, marginBottom: 5 },
  confirmButton: { backgroundColor: "#E87524", paddingVertical: 17, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  confirmedButton: { backgroundColor: "#27834A" },
  disabledButton: { opacity: 0.7 },
  confirmButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  homeButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#D9DCE3", backgroundColor: "#FFFFFF" },
  homeButtonText: { color: "#333744", fontSize: 15, fontWeight: "600" },
  disclaimer: { fontSize: 12, color: "#969BA6", textAlign: "center", marginTop: 18 },
});
