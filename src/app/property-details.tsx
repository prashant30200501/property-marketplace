import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { getProperties, getPropertyPhotos } from "../services/api";

type Property = {
  id: string;
  title: string;
  description?: string | null;
  property_type: string;
  price: number | string;
  address: string;
  pincode: string;
  status: string;
  created_at: string;
};

function formatPrice(price: number | string): string {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return "Price on request";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

function getPropertyEmoji(propertyType: string): string {
  switch (propertyType.toLowerCase()) {
    case "residential":
      return "🏡";
    case "commercial":
      return "🏬";
    case "land":
      return "🌳";
    default:
      return "🏠";
  }
}

function getPropertyTypeLabel(propertyType: string): string {
  switch (propertyType.toLowerCase()) {
    case "residential":
      return "Residential Property";
    case "commercial":
      return "Commercial Property";
    case "land":
      return "Land";
    default:
      return propertyType;
  }
}

export default function PropertyDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const openGallery = (index: number) => {
    setActivePhotoIndex(index);
    setGalleryVisible(true);
  };

  const loadProperty = useCallback(async () => {
    if (!id) {
      setProperty(null);
      setError("No property was selected. Please return to the listings.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = (await getProperties()) as Property[];

      const selectedProperty = data.find(
        (item) => String(item.id) === String(id)
      );

      if (!selectedProperty) {
        setProperty(null);
        setError("");
      } else {
        setProperty(selectedProperty);
        try {
          const photos = await getPropertyPhotos(String(selectedProperty.id));
          setPhotoUrls(photos.map((photo) => photo.imageUrl));
        } catch {
          setPhotoUrls([]);
        }
      }
    } catch (err) {
      setProperty(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load property details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#173F35" />
        <Text style={styles.stateText}>Loading property details...</Text>
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFound}>
          {error ? "Unable to load property" : "Property not found"}
        </Text>

        <Text style={styles.stateText}>
          {error ||
            "This property may no longer be available or may not appear in the current listings."}
        </Text>

        {error ? (
          <Pressable style={styles.retryButton} onPress={loadProperty}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Go back to properties</Text>
        </Pressable>
      </View>
    );
  }

  const price = formatPrice(property.price);
  const propertyType = getPropertyTypeLabel(property.property_type);

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back to properties</Text>
      </Pressable>

      <View style={styles.image}>
        {photoUrls[0] ? (
          <Pressable
            style={styles.heroPhotoPressable}
            onPress={() => openGallery(0)}
            accessibilityRole="button"
            accessibilityLabel="Open property photo gallery"
          >
            <Image
              source={{ uri: photoUrls[0] }}
              style={styles.heroPhoto}
              resizeMode="cover"
            />
          </Pressable>
        ) : (
          <Text style={styles.emoji}>
            {getPropertyEmoji(property.property_type)}
          </Text>
        )}

        <View style={styles.tag}>
          <Text style={styles.tagText}>{propertyType}</Text>
        </View>
      </View>

      {photoUrls.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photoStrip}
          contentContainerStyle={styles.photoStripContent}
        >
          {photoUrls.slice(1).map((uri, index) => (
            <Pressable
              key={`${uri}-${index}`}
              onPress={() => openGallery(index + 1)}
              accessibilityRole="button"
              accessibilityLabel={`Open property photo ${index + 2}`}
            >
              <Image
                source={{ uri }}
                style={styles.galleryPhoto}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.detailsCard}>
        <Text style={styles.listingType}>
          {property.status === "available" ? "Available" : property.status}
        </Text>

        <Text style={styles.price}>{price}</Text>

        <Text style={styles.title}>{property.title}</Text>

        <Text style={styles.location}>📍 {property.address}</Text>

        <Text style={styles.pincode}>PIN code: {property.pincode}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Property overview</Text>
        <Text style={styles.overview}>{propertyType}</Text>

        <Text style={styles.sectionTitle}>About this property</Text>
        <Text style={styles.description}>
          {property.description?.trim() ||
            "The broker has not added a description for this property yet."}
        </Text>

        <Pressable
          style={styles.enquiryButton}
          onPress={() =>
            router.push({
              pathname: "/enquiry-confirmation",
              params: {
                propertyId: String(property.id),
                title: property.title,
                location: property.address,
                price,
              },
            })
          }
        >
          <Text style={styles.enquiryButtonText}>Enquire Now</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Property information is provided by the listing broker.
        </Text>
      </View>
    </ScrollView>

    <Modal
      visible={galleryVisible}
      animationType="fade"
      transparent={false}
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={() => setGalleryVisible(false)}
    >
      <View style={styles.galleryModal}>
        <FlatList
          key={activePhotoIndex}
          data={photoUrls}
          horizontal
          pagingEnabled
          initialScrollIndex={activePhotoIndex}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          keyExtractor={(uri, index) => `${uri}-${index}`}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(
              event.nativeEvent.contentOffset.x / screenWidth
            );
            setActivePhotoIndex(nextIndex);
          }}
          renderItem={({ item }) => (
            <View style={{ width: screenWidth, height: screenHeight }}>
              <Image
                source={{ uri: item }}
                style={styles.fullScreenPhoto}
                resizeMode="contain"
              />
            </View>
          )}
        />

        <Pressable
          style={styles.galleryCloseButton}
          onPress={() => setGalleryVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Close photo gallery"
        >
          <Text style={styles.galleryCloseText}>×</Text>
        </Pressable>

        <View style={styles.photoCounter}>
          <Text style={styles.photoCounterText}>
            {activePhotoIndex + 1} / {photoUrls.length}
          </Text>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F5",
  },
  content: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#F8F8F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  stateText: {
    color: "#6F786F",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    marginBottom: 16,
  },
  backButtonText: {
    color: "#47765E",
    fontSize: 14,
    fontWeight: "700",
  },
  image: {
    height: 230,
    backgroundColor: "#E5EDE7",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 20,
  },
  emoji: {
    fontSize: 85,
  },
  heroPhotoPressable: {
    width: "100%",
    height: "100%",
  },
  heroPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  photoStrip: {
    marginTop: -8,
    marginBottom: 20,
  },
  photoStripContent: {
    gap: 10,
  },
  galleryPhoto: {
    width: 112,
    height: 82,
    borderRadius: 10,
    backgroundColor: "#E5EDE7",
  },
  galleryModal: {
    flex: 1,
    backgroundColor: "#000000",
  },
  fullScreenPhoto: {
    width: "100%",
    height: "100%",
  },
  galleryCloseButton: {
    position: "absolute",
    top: 54,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(30, 30, 30, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  galleryCloseText: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "400",
  },
  photoCounter: {
    position: "absolute",
    top: 64,
    alignSelf: "center",
    backgroundColor: "rgba(30, 30, 30, 0.7)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  photoCounterText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  tag: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  tagText: {
    color: "#173F35",
    fontSize: 12,
    fontWeight: "700",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8EBE5",
  },
  listingType: {
    color: "#668674",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  price: {
    color: "#173F35",
    fontSize: 25,
    fontWeight: "700",
    marginBottom: 8,
  },
  title: {
    color: "#263B30",
    fontSize: 21,
    fontWeight: "700",
  },
  location: {
    color: "#7B827C",
    fontSize: 14,
    marginTop: 10,
  },
  pincode: {
    color: "#7B827C",
    fontSize: 13,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF0EC",
    marginVertical: 22,
  },
  sectionTitle: {
    color: "#202A25",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
  },
  overview: {
    color: "#526057",
    fontSize: 14,
  },
  description: {
    color: "#6F786F",
    fontSize: 14,
    lineHeight: 22,
  },
  enquiryButton: {
    backgroundColor: "#173F35",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 28,
  },
  enquiryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  disclaimer: {
    color: "#929890",
    fontSize: 11,
    textAlign: "center",
    marginTop: 16,
  },
  notFound: {
    color: "#263B30",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#173F35",
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginTop: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});