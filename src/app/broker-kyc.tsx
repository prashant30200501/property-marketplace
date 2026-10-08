import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

import KycCamera from "../components/KycCamera";
import {
    getBrokerVerificationStatus,
    submitBrokerVerification,
    uploadKycDocument,
    type KycDocumentType,
} from "../services/api";

export default function BrokerKycScreen() {
  const router = useRouter();

  const [panNumber, setPanNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [reraNumber, setReraNumber] = useState("");
  const [firmName, setFirmName] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
  "not_submitted" | "under_review" | "verified" | "rejected" | "suspended"
>("not_submitted");

  const [activeCamera, setActiveCamera] =
  useState<KycDocumentType | null>(null);

  const [documents, setDocuments] = useState<
  Partial<Record<KycDocumentType, string>>
   >({});

  const [uploadingDocument, setUploadingDocument] =
  useState<KycDocumentType | null>(null);

  useEffect(() => {
  const loadVerificationStatus = async () => {
    try {
      const status = await getBrokerVerificationStatus();
      setVerificationStatus(status.status);
    } catch (err) {
      console.error("Unable to load KYC status:", err);
    }
  };

  loadVerificationStatus();
}, []);

  const handleDocumentCapture = async (
  documentType: KycDocumentType,
  uri: string,
) => {
  try {
    setActiveCamera(null);
    setUploadingDocument(documentType);
    setError("");

    await uploadKycDocument(documentType, uri);

    setDocuments((current) => ({
      ...current,
      [documentType]: uri,
    }));
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : `Unable to upload ${documentType}.`,
    );
  } finally {
    setUploadingDocument(null);
  }
};

  

  const getLocation = async () => {
    try {
      setError("");
      setGettingLocation(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError(
          "Location permission is required to complete verification.",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLatitude(String(location.coords.latitude));
      setLongitude(String(location.coords.longitude));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to get your current location.",
      );
    } finally {
      setGettingLocation(false);
    }
  };

  const validate = () => {
    const pan = panNumber.trim().toUpperCase();

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      return "Please enter a valid PAN number.";
    }

    if (!businessName.trim()) {
      return "Please enter your business name.";
    }

    if (!latitude || !longitude) {
      return "Please capture your current location.";
    }

      const requiredDocuments: KycDocumentType[] = [
    "pan",
    "aadhaar_front",
    "aadhaar_back",
    "selfie",
  ];

  const missingDocument = requiredDocuments.find(
    (type) => !documents[type],
  );

  if (missingDocument) {
    return "Please capture all required KYC documents before submitting.";
  }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await submitBrokerVerification({
        pan_number: panNumber.trim().toUpperCase(),
        business_name: businessName.trim(),
        rera_registration_number: reraNumber.trim() || undefined,
        firm_name: firmName.trim() || undefined,
        latitude,
        longitude,
      });

      Alert.alert(
        "KYC submitted",
        "Your verification has been submitted successfully and is now under review.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/broker-profile"),
          },
        ],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your verification.",
      );
    } finally {
      setSubmitting(false);
    }
   };

     

  const isLocked =
    verificationStatus === "under_review" ||
    verificationStatus === "verified" ||
    verificationStatus === "suspended";
     

 

 

  if (activeCamera) {
    return (
      <KycCamera
        facing={activeCamera === "selfie" ? "front" : "back"}
        documentType={activeCamera}
        title={
          activeCamera === "pan"
            ? "Capture PAN card"
            : activeCamera === "aadhaar_front"
              ? "Capture Aadhaar front"
              : activeCamera === "aadhaar_back"
                ? "Capture Aadhaar back"
                : "Take verification selfie"
        }
        onCapture={(uri) =>
          handleDocumentCapture(activeCamera, uri)
        }
        onCancel={() => setActiveCamera(null)}
      />
    );
  }

  return (

    

    

    

    
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>Broker KYC</Text>
          <Text style={styles.headerSubtitle}>
            Verify your Nestora business
          </Text>
        </View>
      </View>

      <View style={styles.introCard}>
        <Text style={styles.introIcon}>🔐</Text>

        <View style={styles.introContent}>
          <Text style={styles.introTitle}>
            Business verification
          </Text>

          <Text style={styles.introText}>
            Provide your business information and current location.
            Your submission will be manually reviewed by Nestora.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Identity & business</Text>

      <View style={styles.card}>
        <Text style={styles.label}>PAN number *</Text>

        <TextInput
          value={panNumber}
          onChangeText={(value) =>
            setPanNumber(value.toUpperCase().replace(/\s/g, ""))
          }
          placeholder="ABCDE1234F"
          autoCapitalize="characters"
          maxLength={10}
          editable={!isLocked}
          style={styles.input}
        />

        <Text style={styles.helper}>
          Enter the PAN associated with your brokerage business.
        </Text>

        <Text style={styles.label}>Business name *</Text>

        <TextInput
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Nestora Realty"
          editable={!isLocked}
          style={styles.input}
        />

        <Text style={styles.label}>Firm name</Text>

        <TextInput
          value={firmName}
          onChangeText={setFirmName}
          placeholder="Nestora Realty Pvt Ltd"
          editable={!isLocked}
          style={styles.input}
        />

        <Text style={styles.label}>RERA registration number</Text>

        <TextInput
          value={reraNumber}
          onChangeText={setReraNumber}
          editable={!isLocked}
          placeholder="Optional"
          style={styles.input}
        />
      </View>

      <Text style={styles.sectionTitle}>Location verification</Text>

      <View style={styles.card}>
        <Text style={styles.locationTitle}>
          📍 Current business location
        </Text>

        <Text style={styles.locationDescription}>
          We use your current GPS coordinates as supporting evidence
          during manual verification.
        </Text>

        {latitude && longitude ? (
          <View style={styles.locationSuccess}>
            <Text style={styles.locationSuccessTitle}>
              ✓ Location captured
            </Text>

            <Text style={styles.coordinates}>
              {latitude}, {longitude}
            </Text>
          </View>
        ) : (
          <Pressable
            style={styles.locationButton}
            onPress={getLocation}
            disabled={gettingLocation || isLocked}
          >
            {gettingLocation ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.locationButtonText}>
                Capture current location
              </Text>
            )}
          </Pressable>
        )}
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeIcon}>ℹ️</Text>

        <Text style={styles.noticeText}>
          Your KYC information and documents will be reviewed by the
Nestora verification team. Your selfie will be used as
supporting evidence during manual verification.
        </Text>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Unable to continue</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}


      <Text style={styles.footerText}>
        By submitting, you confirm that the information provided is
        accurate.
      </Text>

      <Text style={styles.sectionTitle}>
  Identity documents
</Text>

<DocumentCard
  title="PAN card"
  description="Capture the PAN card directly using your camera."
  documentType="pan"
  uri={documents.pan}
  uploading={uploadingDocument === "pan"}
  onPress={() => !isLocked && setActiveCamera("pan")}
/>

<DocumentCard
  title="Aadhaar — front"
  description="Capture the front side of your Aadhaar."
  documentType="aadhaar_front"
  uri={documents.aadhaar_front}
  uploading={uploadingDocument === "aadhaar_front"}
  onPress={() => !isLocked && setActiveCamera("aadhaar_front")}
/>

<DocumentCard
  title="Aadhaar — back"
  description="Capture the back side of your Aadhaar."
  documentType="aadhaar_back"
  uri={documents.aadhaar_back}
  uploading={uploadingDocument === "aadhaar_back"}
  onPress={() => !isLocked && setActiveCamera("aadhaar_back")}
/>

<Text style={styles.sectionTitle}>
  Face verification
</Text>

<DocumentCard
  title="Verification selfie"
  description="Take a selfie directly using the front camera."
  documentType="selfie"
  uri={documents.selfie}
  uploading={uploadingDocument === "selfie"}
  onPress={() => !isLocked && setActiveCamera("selfie")}
/>

{verificationStatus !== "under_review" &&
 verificationStatus !== "verified" &&
 verificationStatus !== "suspended" ? (
  <Pressable
    style={[
      styles.submitButton,
      submitting && styles.submitButtonDisabled,
    ]}
    onPress={handleSubmit}
    disabled={submitting}
  >
    {submitting ? (
      <ActivityIndicator color="#FFFFFF" />
    ) : (
      <Text style={styles.submitButtonText}>
        Submit for verification
      </Text>
    )}
  </Pressable>
) : null}
    </ScrollView>
  );

  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8F7",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  backText: {
    fontSize: 34,
    color: "#173F35",
    lineHeight: 38,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#173F35",
  },

  headerSubtitle: {
    marginTop: 3,
    color: "#71807B",
    fontSize: 14,
  },

  introCard: {
    flexDirection: "row",
    backgroundColor: "#EAF2EF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 26,
  },

  introIcon: {
    fontSize: 28,
    marginRight: 14,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#173F35",
    marginBottom: 5,
  },

  introText: {
    color: "#52635D",
    lineHeight: 20,
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#173F35",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344640",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D8E0DD",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#173F35",
    backgroundColor: "#FBFCFC",
  },

  helper: {
    color: "#7A8783",
    fontSize: 12,
    marginTop: 7,
  },

  locationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#173F35",
    marginBottom: 7,
  },

  locationDescription: {
    color: "#6B7974",
    lineHeight: 20,
    fontSize: 14,
    marginBottom: 16,
  },

  locationButton: {
    backgroundColor: "#173F35",
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  locationButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  locationSuccess: {
    backgroundColor: "#EDF7F1",
    borderRadius: 12,
    padding: 14,
  },

  locationSuccessTitle: {
    color: "#28704B",
    fontWeight: "700",
    marginBottom: 5,
  },

  coordinates: {
    color: "#52635D",
    fontSize: 13,
  },

  notice: {
    flexDirection: "row",
    backgroundColor: "#FFF8E8",
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
  },

  noticeIcon: {
    marginRight: 10,
  },

  noticeText: {
    flex: 1,
    color: "#6E6045",
    fontSize: 13,
    lineHeight: 19,
  },

  errorCard: {
    backgroundColor: "#FDECEC",
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
  },

  errorTitle: {
    color: "#9D3030",
    fontWeight: "700",
    marginBottom: 5,
  },

  errorText: {
    color: "#9D3030",
    lineHeight: 19,
  },

  submitButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#173F35",
    alignItems: "center",
    justifyContent: "center",
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  footerText: {
    textAlign: "center",
    color: "#89948F",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },

  documentCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  padding: 16,
  marginBottom: 14,
  flexDirection: "row",
},

documentInfo: {
  flex: 1,
},

documentTitle: {
  fontSize: 16,
  fontWeight: "700",
  color: "#173F35",
  marginBottom: 6,
},

documentDescription: {
  fontSize: 13,
  lineHeight: 18,
  color: "#71807B",
  marginBottom: 12,
},

documentButton: {
  alignSelf: "flex-start",
  backgroundColor: "#EAF2EF",
  paddingHorizontal: 14,
  paddingVertical: 9,
  borderRadius: 10,
},

documentButtonText: {
  color: "#173F35",
  fontWeight: "700",
  fontSize: 13,
},

thumbnail: {
  width: 76,
  height: 76,
  borderRadius: 12,
  marginLeft: 12,
},

emptyThumbnail: {
  width: 76,
  height: 76,
  borderRadius: 12,
  backgroundColor: "#F2F5F3",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 12,
},

emptyThumbnailText: {
  fontSize: 25,
},

uploadingRow: {
  flexDirection: "row",
  alignItems: "center",
},

uploadingText: {
  marginLeft: 8,
  color: "#71807B",
  fontSize: 12,
},
});
function DocumentCard({
  title,
  description,
  documentType,
  uri,
  uploading,
  onPress,
}: {
  title: string;
  description: string;
  documentType: KycDocumentType;
  uri?: string;
  uploading: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.documentCard}>
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>
          {uri ? "✓ " : ""}
          {title}
        </Text>

        <Text style={styles.documentDescription}>
          {description}
        </Text>

        {uploading ? (
          <View style={styles.uploadingRow}>
            <ActivityIndicator size="small" color="#173F35" />
            <Text style={styles.uploadingText}>
              Securing document...
            </Text>
          </View>
        ) : (
          <Pressable
            style={styles.documentButton}
            onPress={onPress}
          >
            <Text style={styles.documentButtonText}>
              {uri ? "Retake" : "Capture with camera"}
            </Text>
          </Pressable>
        )}
      </View>

      {uri ? (
        <Image
          source={{ uri }}
          style={styles.thumbnail}
        />
      ) : (
        <View style={styles.emptyThumbnail}>
          <Text style={styles.emptyThumbnailText}>
            📷
          </Text>
        </View>
      )}
    </View>
  );
}


