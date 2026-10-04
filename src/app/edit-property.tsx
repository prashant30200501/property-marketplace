import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { getProperties, updateProperty } from "../services/api";

export default function EditPropertyScreen() {
  const router = useRouter();
  const { propertyId } = useLocalSearchParams<{
    propertyId: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState("residential");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      if (!propertyId) {
        throw new Error("Property ID is missing.");
      }

      /*
       * We already have GET /properties for public property data.
       * Find the property matching the selected ID.
       */
      const properties = await getProperties();

      const property = properties.find(
        (item: any) => item.id === propertyId
      );

      if (!property) {
        throw new Error("Property not found.");
      }

      setTitle(property.title ?? "");
      setPropertyType(property.property_type ?? "residential");
      setPrice(String(property.price ?? ""));
      setAddress(property.address ?? "");
      setPincode(property.pincode ?? "");
      setDescription(property.description ?? "");
    } catch (error) {
      console.error("Failed to load property:", error);

      Alert.alert(
        "Unable to load property",
        "We couldn't load this property. Please try again.",
        [
          {
            text: "Go Back",
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!propertyId) {
      Alert.alert("Error", "Property ID is missing.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a property title.");
      return;
    }

    if (!price.trim()) {
      Alert.alert("Missing price", "Please enter the property price.");
      return;
    }

    const numericPrice = Number(price.replace(/,/g, ""));

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert("Invalid price", "Please enter a valid property price.");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Missing address", "Please enter the property address.");
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      Alert.alert(
        "Invalid PIN code",
        "Please enter a valid 6-digit PIN code."
      );
      return;
    }

    try {
      setSaving(true);

      await updateProperty(propertyId, {
        title: title.trim(),
        description: description.trim() || undefined,
        property_type: propertyType,
        price: numericPrice,
        address: address.trim(),
        pincode: pincode.trim(),
      });

      Alert.alert(
        "Property Updated",
        "Your property has been successfully updated.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to update property:", error);

      Alert.alert(
        "Update failed",
        "We couldn't update your property. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#173F35" />
        <Text style={styles.loadingText}>
          Loading property...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>NESTORA</Text>
          <Text style={styles.heading}>Edit Property</Text>
          <Text style={styles.subtitle}>
            Update your property listing.
          </Text>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      {/* Form */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Property information
        </Text>

        {/* Title */}
        <Text style={styles.label}>PROPERTY TITLE</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter property title"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />

        {/* Property type */}
        <Text style={styles.label}>PROPERTY TYPE</Text>

        <View style={styles.typeSelector}>
          {["residential", "commercial", "land"].map((type) => {
            const selected = propertyType === type;

            return (
              <Pressable
                key={type}
                onPress={() => setPropertyType(type)}
                style={[
                  styles.typeButton,
                  selected && styles.typeButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selected && styles.typeButtonTextSelected,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Price */}
        <Text style={styles.label}>PRICE</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter property price"
          placeholderTextColor="#999"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        {/* Address */}
        <Text style={styles.label}>ADDRESS</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter property address"
          placeholderTextColor="#999"
          value={address}
          onChangeText={setAddress}
        />

        {/* PIN */}
        <Text style={styles.label}>PIN CODE</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter 6-digit PIN code"
          placeholderTextColor="#999"
          value={pincode}
          onChangeText={setPincode}
          keyboardType="number-pad"
          maxLength={6}
        />

        {/* Description */}
        <Text style={styles.label}>DESCRIPTION</Text>

        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Describe the property"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {/* Save */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.buttonPressed,
            saving && styles.saveButtonDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              Save Changes
            </Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.footer}>
        Your business. Your properties. Nestora.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F5",
  },

  content: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: "#F8F8F5",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#777",
    fontSize: 13,
    marginTop: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: "#47765E",
    marginBottom: 6,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#173F35",
  },

  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
  },

  backButton: {
    backgroundColor: "#E5EDE7",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D5E2DA",
  },

  backButtonText: {
    color: "#173F35",
    fontSize: 13,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EAECE8",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#202A25",
    marginBottom: 22,
  },

  label: {
    color: "#173F35",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 9,
    marginTop: 4,
  },

  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#DDE2DD",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#263B30",
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },

  descriptionInput: {
    minHeight: 120,
  },

  typeSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },

  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDE2DD",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  typeButtonSelected: {
    backgroundColor: "#173F35",
    borderColor: "#173F35",
  },

  typeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#777",
  },

  typeButtonTextSelected: {
    color: "#FFFFFF",
  },

  saveButton: {
    minHeight: 54,
    backgroundColor: "#D4A017",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  buttonPressed: {
    opacity: 0.82,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  footer: {
    textAlign: "center",
    color: "#8A918B",
    fontSize: 12,
    marginTop: 28,
  },
});