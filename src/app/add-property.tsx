import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
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

import { createProperty, uploadPropertyPhotos } from "../services/api";

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
  const [photos, setPhotos] = useState<string[]>([]);

  async function pickPhotos() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit: 10 - photos.length,
    quality: 0.8,
  });



  if (!result.canceled) {
    const selected = result.assets.map((asset) => asset.uri);
    setPhotos((current) => [...current, ...selected].slice(0, 10));
  }
}

async function takePhoto() {
  if (photos.length >= 10) {
    Alert.alert("Photo limit", "You can add up to 10 photos.");
    return;
  }

  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission required", "Please allow camera access.");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });

  if (!result.canceled) {
    setPhotos((current) => [...current, result.assets[0].uri].slice(0, 10));
  }
}

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

     const property = await createProperty({
  title: title.trim(),
  description: description.trim() || undefined,
  property_type: propertyType,
  price: numericPrice,
  address: address.trim(),
  pincode: pincode.trim(),
});

if (photos.length > 0) {
  await uploadPropertyPhotos(property.id, photos);
}

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

          <Text style={styles.label}>PROPERTY PHOTOS (MAX 10)</Text>

<Pressable style={styles.photoButton} onPress={pickPhotos}>
  <Text style={styles.photoButtonText}>
    + Select Property Photos
  </Text>
</Pressable>
<Pressable style={styles.photoButton} onPress={takePhoto}>
  <Text style={styles.photoButtonText}>📷 Take Property Photo</Text>
</Pressable>

<View style={styles.photoGrid}>
  {photos.map((uri, index) => (
    <View key={`${uri}-${index}`} style={styles.photoItem}>
      <Image source={{ uri }} style={styles.photoPreview} />
      <Pressable
        style={styles.removePhoto}
        onPress={() =>
          setPhotos((current) =>
            current.filter((_, i) => i !== index)
          )
        }
      >
        <Text style={styles.removePhotoText}>×</Text>
      </Pressable>
    </View>
  ))}
</View>

<Text style={styles.photoCount}>{photos.length}/10 photos selected</Text>

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

  photoButton: {
  borderWidth: 1,
  borderColor: COLORS.gold,
  borderStyle: "dashed",
  borderRadius: 12,
  padding: 16,
  alignItems: "center",
  backgroundColor: "#FFFDF5",
},
photoButtonText: {
  color: COLORS.navy,
  fontWeight: "700",
},
photoGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 12,
},
photoItem: {
  position: "relative",
},
photoPreview: {
  width: 90,
  height: 90,
  borderRadius: 10,
},
removePhoto: {
  position: "absolute",
  top: -7,
  right: -7,
  backgroundColor: "#D32F2F",
  width: 23,
  height: 23,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
},
removePhotoText: {
  color: "#FFFFFF",
  fontWeight: "800",
},
photoCount: {
  color: COLORS.muted,
  fontSize: 12,
  marginTop: 8,
},
});
