import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { getProperties } from "../../services/api";

const GREEN = "#173F35";
const SAVED_KEY = "nestora_saved_properties";

type Property = {
  id: string | number;
  title: string;
  address?: string;
  pincode?: string;
  price: number | string;
  property_type?: string;
};

export default function SavedScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSavedProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [allProperties, savedJson] = await Promise.all([
        getProperties(),
        AsyncStorage.getItem(SAVED_KEY),
      ]);

      const savedIds: string[] = savedJson ? JSON.parse(savedJson) : [];

      setProperties(
        (Array.isArray(allProperties) ? allProperties : []).filter(
          (property: Property) => savedIds.includes(String(property.id))
        )
      );
    } catch (e) {
      console.error("Failed to load saved properties:", e);
      setError("We couldn't load your saved properties.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSavedProperties();
    }, [loadSavedProperties])
  );

  async function removeSaved(id: string | number) {
    const savedJson = await AsyncStorage.getItem(SAVED_KEY);
    const savedIds: string[] = savedJson ? JSON.parse(savedJson) : [];
    const updatedIds = savedIds.filter((savedId) => savedId !== String(id));

    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updatedIds));
    await loadSavedProperties();
  }

  function formatPrice(price: number | string) {
    const amount = Number(price);
    return Number.isFinite(amount)
      ? `₹${amount.toLocaleString("en-IN")}`
      : String(price);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>YOUR COLLECTION</Text>
      <Text style={styles.title}>Saved properties</Text>
      <Text style={styles.subtitle}>
        Keep the places you love close at hand.
      </Text>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator color={GREEN} size="large" />
          <Text style={styles.message}>Loading saved properties…</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.message}>{error}</Text>
          <Pressable style={styles.button} onPress={loadSavedProperties}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      ) : properties.length === 0 ? (
        <View style={styles.state}>
          <Text style={styles.heart}>♡</Text>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.message}>
            Tap the heart on any property to save it here.
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => router.push("/customer/explore")}
          >
            <Text style={styles.buttonText}>Explore properties</Text>
          </Pressable>
        </View>
      ) : (
        properties.map((property) => (
          <View key={String(property.id)} style={styles.card}>
            <Pressable
              style={styles.cardMain}
              onPress={() =>
                router.push({
                  pathname: "/property-details",
                  params: { id: String(property.id) },
                })
              }
            >
              <View style={styles.image}>
                <Text style={styles.imageEmoji}>
                  {property.property_type === "commercial" ? "🏢" : "🏡"}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.price}>{formatPrice(property.price)}</Text>
                <Text style={styles.propertyTitle} numberOfLines={2}>
                  {property.title}
                </Text>
                <Text style={styles.address} numberOfLines={2}>
                  📍 {property.address || "Location not provided"}
                </Text>
                {property.pincode ? (
                  <Text style={styles.pin}>PIN {property.pincode}</Text>
                ) : null}
              </View>
            </Pressable>

            <Pressable
              style={styles.removeButton}
              onPress={() => void removeSaved(property.id)}
            >
              <Text style={styles.removeText}>♥  Remove from saved</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F5" },
  content: { padding: 20, paddingTop: 28, paddingBottom: 40 },
  eyebrow: {
    color: "#668674",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: GREEN,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
  },
  subtitle: { color: "#788078", fontSize: 13, marginTop: 7 },
  state: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    marginTop: 28,
    borderWidth: 1,
    borderColor: "#E8ECE7",
  },
  heart: { color: GREEN, fontSize: 54 },
  emptyTitle: {
    color: GREEN,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },
  message: {
    color: "#788078",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: GREEN,
    borderRadius: 11,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 18,
  },
  buttonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    marginTop: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8ECE7",
  },
  cardMain: { flexDirection: "row", padding: 12 },
  image: {
    width: 105,
    minHeight: 120,
    backgroundColor: "#E5EDE7",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  imageEmoji: { fontSize: 42 },
  info: { flex: 1, paddingLeft: 13, justifyContent: "center" },
  price: { color: GREEN, fontSize: 17, fontWeight: "900" },
  propertyTitle: {
    color: "#263B30",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 5,
  },
  address: { color: "#788078", fontSize: 11, marginTop: 7, lineHeight: 16 },
  pin: { color: "#668674", fontSize: 10, marginTop: 6 },
  removeButton: {
    borderTopWidth: 1,
    borderTopColor: "#EEF0EC",
    padding: 12,
    alignItems: "center",
  },
  removeText: { color: "#A94752", fontSize: 12, fontWeight: "700" },
});