import {
    CameraView,
    useCameraPermissions,
    type CameraType,
    type FlashMode,
} from "expo-camera";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type KycCameraProps = {
  facing: CameraType;
  title: string;
  documentType?: "pan" | "aadhaar_front" | "aadhaar_back" | "selfie";
  onCapture: (uri: string) => void;
  onCancel: () => void;
};

export default function KycCamera({
  facing: initialFacing,
  title,
  documentType,
  onCapture,
  onCancel,
}: KycCameraProps) {
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const [facing, setFacing] = useState<CameraType>(initialFacing);

  const [flash, setFlash] = useState<FlashMode>("off");

  const [torch, setTorch] = useState(false);

  const [capturing, setCapturing] = useState(false);

  const isSelfie = documentType === "selfie";

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <Text style={styles.permissionTitle}>
          Camera permission required
        </Text>

        <Text style={styles.permissionText}>
          Nestora needs camera access to capture your KYC document
          or verification selfie.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={requestPermission}
        >
          <Text style={styles.primaryButtonText}>
            Allow camera
          </Text>
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const toggleCamera = () => {
    setFacing((current) =>
      current === "back" ? "front" : "back",
    );

    setTorch(false);
  };

  const toggleFlash = () => {
    setFlash((current) => {
      if (current === "off") {
        return "on";
      }

      if (current === "on") {
        return "auto";
      }

      return "off";
    });
  };

  const takePicture = async () => {
    if (!cameraRef.current || capturing) {
      return;
    }

    try {
      setCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (photo?.uri) {
        onCapture(photo.uri);
      }
    } catch (error) {
      console.error("KYC camera capture failed:", error);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={isSelfie ? "screen" : flash}
        enableTorch={torch}
        mode="picture"
        autofocus="on"
        mirror={isSelfie}
      />

      {/* Top controls */}
      <SafeAreaView style={styles.topArea}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.iconButton}
            onPress={onCancel}
          >
            <Text style={styles.iconText}>✕</Text>
          </Pressable>

          <Text style={styles.title}>{title}</Text>

          <View style={styles.topActions}>
            {!isSelfie && (
              <Pressable
                style={styles.iconButton}
                onPress={toggleFlash}
              >
                <Text style={styles.iconText}>
                  {flash === "off"
                    ? "⚡"
                    : flash === "on"
                      ? "⚡"
                      : "A⚡"}
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.iconButton}
              onPress={() => setTorch((current) => !current)}
            >
              <Text style={styles.iconText}>
                {torch ? "🔦" : "💡"}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* Document guide */}
      {!isSelfie && (
        <View pointerEvents="none" style={styles.guideContainer}>
          <View style={styles.documentGuide} />

          <Text style={styles.guideText}>
            Align the document inside the frame
          </Text>
        </View>
      )}

      {/* Selfie guide */}
      {isSelfie && (
        <View pointerEvents="none" style={styles.selfieGuideContainer}>
          <View style={styles.selfieGuide} />

          <Text style={styles.selfieGuideText}>
            Position your face inside the circle
          </Text>
        </View>
      )}

      {/* Bottom controls */}
      <SafeAreaView style={styles.bottomArea}>
        <View style={styles.bottomControls}>
          <Pressable
            style={styles.flipButton}
            onPress={toggleCamera}
          >
            <Text style={styles.flipText}>
              🔄
            </Text>
            <Text style={styles.flipLabel}>
              Flip
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.captureButton,
              capturing && styles.captureButtonDisabled,
            ]}
            onPress={takePicture}
            disabled={capturing}
          >
            {capturing ? (
              <ActivityIndicator color="#173F35" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </Pressable>

          <View style={styles.bottomSpacer} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  center: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },

  permissionScreen: {
    flex: 1,
    backgroundColor: "#173F35",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  permissionTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },

  permissionText: {
    color: "#E8EFEA",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
  },

  primaryButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },

  primaryButtonText: {
    color: "#173F35",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    marginTop: 18,
  },

  cancelText: {
    color: "#FFFFFF",
    fontSize: 15,
  },

  topArea: {
    zIndex: 10,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  topActions: {
    flexDirection: "row",
    gap: 8,
  },

  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconText: {
    color: "#FFFFFF",
    fontSize: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },

  guideContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "28%",
    alignItems: "center",
  },

  documentGuide: {
    width: "86%",
    aspectRatio: 1.586,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 14,
  },

  guideText: {
    color: "#FFFFFF",
    marginTop: 18,
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  selfieGuideContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "22%",
    alignItems: "center",
  },

  selfieGuide: {
    width: 250,
    height: 320,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 150,
  },

  selfieGuideText: {
    color: "#FFFFFF",
    marginTop: 18,
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  bottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },

  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingBottom: 20,
  },

  flipButton: {
    width: 64,
    alignItems: "center",
  },

  flipText: {
    fontSize: 25,
  },

  flipLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 4,
  },

  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.6)",
  },

  captureButtonDisabled: {
    opacity: 0.7,
  },

  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#173F35",
  },

  bottomSpacer: {
    width: 64,
  },
});