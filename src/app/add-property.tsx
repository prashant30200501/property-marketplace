import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { createProperty } from "../services/api";

const TEST_BROKER_ID = "4a033209-13bd-4a85-bff9-4251b43dfdc0";

const COLORS = {
  navy: "#0D1B2A",
  gold: "#D4A017",
  background: "#F7F8FA",
  white: "#FFFFFF",
  text: "#17212F",
  muted: "#7B8491",
  border: "#E3E7ED",
};

export default function AddPropertyScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("residential");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (
      !title.trim() ||
      !price.trim() ||
      !address.trim() ||
      !pincode.trim()
    ) {
      Alert.alert(
        "Missing details",
        "Please fill in title, price, address and PIN code."
      );
      return;
    }

    const numericPrice = Number(price.replace(/,/g, ""));

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert("Invalid price", "Please enter a valid property price.");
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      Alert.alert("Invalid PIN code", "Please enter a valid 6-digit PIN code.");
      return;
    }

    try {
      setLoading(true);

      await createProperty({
        title: title.trim(),
        description: description.trim() || undefined,
        property_type: propertyType,
        price: numericPrice,
        address: address.trim(),
        pincode: pincode.trim(),
        
      });

      Alert.alert(
        "Property Listed",
        "Your property has been successfully added to Nestora.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/broker-home"),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to create property:", error);

      Alert.alert(
        "Unable to list property",
        "Something went wrong while creating the property."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>

          <Text style={styles.eyebrow}>BROKER</Text>
          <Text style={styles.title}>Add Property</Text>
          <Text style={styles.subtitle}>
            List a new property on Nestora.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>PROPERTY TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3 BHK Apartment in Jaipur"
              placeholderTextColor={COLORS.muted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>PROPERTY TYPE</Text>

            <View style={styles.typeRow}>
              {[
                ["residential", "Residential"],
                ["commercial", "Commercial"],
                ["land", "Land"],
              ].map(([value, label]) => (
                <Pressable
                  key={value}
                  onPress={() => setPropertyType(value)}
                  style={[
                    styles.typeButton,
                    propertyType === value && styles.typeButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      propertyType === value &&
                        styles.typeButtonTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>PRICE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 7500000"
              placeholderTextColor={COLORS.muted}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <Text style={styles.label}>ADDRESS</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter complete property address"
              placeholderTextColor={COLORS.muted}
              value={address}
              onChangeText={setAddress}
              multiline
            />

            <Text style={styles.label}>PIN CODE</Text>
            <TextInput
              style={styles.input}
              placeholder="302021"
              placeholderTextColor={COLORS.muted}
              value={pincode}
              onChangeText={setPincode}
              keyboardType="numeric"
              maxLength={6}
            />

            <Text style={styles.label}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the property"
              placeholderTextColor={COLORS.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitText}>
                {loading ? "LISTING PROPERTY..." : "LIST PROPERTY"}
              </Text>
            </Pressable>
          </View>
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
  flex: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  back: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 28,
  },
  eyebrow: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 6,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  typeButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  typeButtonSelected: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  typeButtonText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  typeButtonTextSelected: {
    color: COLORS.white,
  },
  submitButton: {
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});