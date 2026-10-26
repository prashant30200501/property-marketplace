import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { getProperties } from "../services/api";

const GREEN = "#173F35";
const LIGHT_GREEN = "#E5EDE7";
const BACKGROUND = "#F8F8F5";
const MUTED = "#788078";
const PIN_KEY = "nestora_customer_pincode";
const SAVED_KEY = "nestora_saved_properties";

type Property = {
  id: string | number;
  title: string;
  address?: string;
  pincode?: string;
  price: number | string;
  property_type?: string;
  description?: string;
};

export default function CustomerHomeScreen() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pincode, setPincode] = useState("");
  const [draftPincode, setDraftPincode] = useState("");
  const [locationModal, setLocationModal] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [listingType, setListingType] = useState<"Buy" | "Rent">("Buy");

  useEffect(() => {
    void loadHomeData();
  }, []);

  async function loadHomeData() {
    try {
      setLoading(true);
      setError("");

      const [data, storedPin, storedSaved] = await Promise.all([
        getProperties(),
        AsyncStorage.getItem(PIN_KEY),
        AsyncStorage.getItem(SAVED_KEY),
      ]);

      setProperties(Array.isArray(data) ? data : []);
      setPincode(storedPin ?? "");
      setDraftPincode(storedPin ?? "");
      setSavedIds(storedSaved ? JSON.parse(storedSaved) : []);
    } catch (e) {
      console.error("Failed to load home data:", e);
      setError("We couldn't load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesSearch =
        !query ||
        `${property.title ?? ""} ${property.address ?? ""} ${
          property.property_type ?? ""
        } ${property.pincode ?? ""}`
          .toLowerCase()
          .includes(query);

      const matchesPin =
        !pincode.trim() ||
        String(property.pincode ?? "") === pincode.trim();

      return matchesSearch && matchesPin;
    });
  }, [properties, pincode, search]);

  async function savePincode() {
    const value = draftPincode.trim();

    if (value && !/^\d{6}$/.test(value)) {
      Alert.alert("Invalid PIN code", "Enter a valid 6-digit Indian PIN code.");
      return;
    }

    await AsyncStorage.setItem(PIN_KEY, value);
    setPincode(value);
    setLocationModal(false);
  }

  async function toggleSaved(propertyId: string | number) {
    const id = String(propertyId);
    const updated = savedIds.includes(id)
      ? savedIds.filter((item) => item !== id)
      : [...savedIds, id];

    setSavedIds(updated);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  }

  function formatPrice(price: number | string) {
    const amount = Number(price);

    if (!Number.isFinite(amount)) return String(price);

    return `₹${amount.toLocaleString("en-IN")}`;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>NESTORA</Text>
            <Text style={styles.tagline}>Find your place.</Text>
          </View>

          <Pressable
            style={styles.avatar}
            onPress={() => router.push("/customer/account")}
            accessibilityLabel="Open account"
          >
            <Text style={styles.avatarText}>♙</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.location}
          onPress={() => {
            setDraftPincode(pincode);
            setLocationModal(true);
          }}
        >
          <Text style={styles.locationIcon}>⌖</Text>
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>YOUR LOCATION</Text>
            <Text style={styles.locationValue}>
              {pincode ? `PIN code ${pincode}` : "Choose your PIN code"}
            </Text>
          </View>
          <Text style={styles.changeLocation}>Change⌄</Text>
        </Pressable>

        <Text style={styles.heading}>
          Find a home{"\n"}you'll love.
        </Text>
        <Text style={styles.intro}>
          Explore properties in your preferred neighbourhood.
        </Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Locality, property, or PIN code"
            placeholderTextColor="#929890"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Text style={styles.clearSearch}>×</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.segment}>
          {(["Buy", "Rent"] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setListingType(item)}
              style={[
                styles.segmentButton,
                listingType === item && styles.segmentSelected,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  listingType === item && styles.segmentTextSelected,
                ]}
              >
                {item === "Buy" ? "Buy a property" : "Rent a property"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              {pincode ? "Homes near you" : "Explore properties"}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {pincode
                ? `Listings matching PIN code ${pincode}`
                : "Find your next favourite place"}
            </Text>
          </View>
          <Pressable onPress={() => router.push("/customer/explore")}>
            <Text style={styles.viewAll}>View all →</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={GREEN} />
            <Text style={styles.stateText}>Finding properties for you…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Couldn't load listings</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadHomeData}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : filteredProperties.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.emptyIcon}>⌂</Text>
            <Text style={styles.stateTitle}>No matching properties yet</Text>
            <Text style={styles.stateText}>
              {pincode
                ? "Try another PIN code or clear your location filter."
                : "New listings will appear here when available."}
            </Text>
            {pincode && (
              <Pressable
                style={styles.retryButton}
                onPress={() => {
                  setPincode("");
                  setDraftPincode("");
                  void AsyncStorage.removeItem(PIN_KEY);
                }}
              >
                <Text style={styles.retryText}>Show all locations</Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredProperties.map((property) => (
            <Pressable
              key={String(property.id)}
              style={styles.propertyCard}
              onPress={() =>
                router.push({
                  pathname: "/property-details",
                  params: { id: String(property.id) },
                })
              }
            >
              <View style={styles.propertyImage}>
                <Text style={styles.propertyEmoji}>
                  {property.property_type === "commercial" ? "🏢" : "🏡"}
                </Text>
                <View style={styles.propertyTypeTag}>
                  <Text style={styles.propertyTypeText}>
                    {property.property_type ?? "Property"}
                  </Text>
                </View>
                <Pressable
                  style={styles.heartButton}
                  onPress={(event) => {
                    event.stopPropagation();
                    void toggleSaved(property.id);
                  }}
                  accessibilityLabel={
                    savedIds.includes(String(property.id))
                      ? "Remove saved property"
                      : "Save property"
                  }
                >
                  <Text
                    style={[
                      styles.heart,
                      savedIds.includes(String(property.id)) &&
                        styles.heartActive,
                    ]}
                  >
                    {savedIds.includes(String(property.id)) ? "♥" : "♡"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.propertyInfo}>
                <Text style={styles.price}>{formatPrice(property.price)}</Text>
                <Text style={styles.propertyTitle} numberOfLines={2}>
                  {property.title}
                </Text>
                <Text style={styles.propertyAddress} numberOfLines={2}>
                  ⌖ {property.address || "Location not provided"}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.propertyPin}>
                    {property.pincode ? `PIN ${property.pincode}` : "Nestora listing"}
                  </Text>
                  <Text style={styles.detailsLink}>View details →</Text>
                </View>
              </View>
            </Pressable>
          ))
        )}

        <Text style={styles.footer}>A place for every next chapter.</Text>
      </ScrollView>

      <Modal
        visible={locationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose your location</Text>
            <Text style={styles.modalSubtitle}>
              Enter a 6-digit Indian PIN code to find nearby listings.
            </Text>
            <TextInput
              style={styles.pinInput}
              value={draftPincode}
              onChangeText={(value) =>
                setDraftPincode(value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="e.g. 302001"
              placeholderTextColor="#929890"
              keyboardType="number-pad"
              maxLength={6}
            />
            <Pressable style={styles.saveLocationButton} onPress={savePincode}>
              <Text style={styles.saveLocationText}>Apply location</Text>
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={() => setLocationModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 20, paddingBottom: 30 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  brand: {
    color: GREEN,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 2,
  },
  tagline: { color: MUTED, fontSize: 12, marginTop: 3 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: GREEN, fontSize: 24 },
  location: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7EBE5",
    padding: 13,
    marginBottom: 24,
  },
  locationIcon: { fontSize: 25, color: GREEN, marginRight: 11 },
  locationText: { flex: 1 },
  locationLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  locationValue: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  changeLocation: { color: GREEN, fontSize: 12, fontWeight: "700" },
  heading: {
    color: GREEN,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 39,
    letterSpacing: -0.8,
  },
  intro: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    height: 56,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E4E9E2",
    marginBottom: 14,
  },
  searchIcon: { fontSize: 27, color: GREEN, marginRight: 10 },
  searchInput: { flex: 1, color: "#25352B", fontSize: 13 },
  clearSearch: { color: MUTED, fontSize: 25, paddingLeft: 8 },
  segment: {
    flexDirection: "row",
    backgroundColor: "#E9EEE9",
    padding: 4,
    borderRadius: 13,
    marginBottom: 28,
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  segmentSelected: { backgroundColor: GREEN },
  segmentText: { color: "#56645A", fontSize: 12, fontWeight: "700" },
  segmentTextSelected: { color: "#FFFFFF" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { color: "#202A25", fontSize: 19, fontWeight: "800" },
  sectionSubtitle: { color: MUTED, fontSize: 11, marginTop: 5 },
  viewAll: { color: GREEN, fontSize: 12, fontWeight: "800" },
  stateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECE7",
  },
  stateTitle: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
  },
  stateText: {
    color: MUTED,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  emptyIcon: { color: GREEN, fontSize: 45 },
  retryButton: {
    backgroundColor: GREEN,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 16,
  },
  retryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  propertyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E7EBE5",
    marginBottom: 18,
  },
  propertyImage: {
    height: 175,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  propertyEmoji: { fontSize: 68 },
  propertyTypeTag: {
    position: "absolute",
    left: 13,
    top: 13,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  propertyTypeText: {
    color: GREEN,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  heartButton: {
    position: "absolute",
    right: 13,
    top: 13,
    backgroundColor: "#FFFFFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  heart: { color: GREEN, fontSize: 23 },
  heartActive: { color: "#C44E5B" },
  propertyInfo: { padding: 16 },
  price: { color: GREEN, fontSize: 21, fontWeight: "900" },
  propertyTitle: {
    color: "#263B30",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 7,
  },
  propertyAddress: {
    color: MUTED,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#EEF0EC",
    marginTop: 14,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  propertyPin: { color: MUTED, fontSize: 10 },
  detailsLink: { color: GREEN, fontSize: 11, fontWeight: "800" },
  footer: {
    textAlign: "center",
    color: "#929890",
    fontSize: 11,
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalCard: {
    backgroundColor: BACKGROUND,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 24,
    paddingBottom: 35,
  },
  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D4DAD3",
    alignSelf: "center",
    marginBottom: 22,
  },
  modalTitle: { color: GREEN, fontSize: 22, fontWeight: "800" },
  modalSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18,
  },
  pinInput: {
    height: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE4DC",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: GREEN,
    fontSize: 17,
    letterSpacing: 2,
  },
  saveLocationButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 16,
  },
  saveLocationText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  cancelButton: { alignItems: "center", paddingVertical: 13 },
  cancelText: { color: MUTED, fontWeight: "700", fontSize: 13 },
});