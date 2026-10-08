import {
    CameraView,
    useCameraPermissions,
    type CameraType,
} from "expo-camera";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Props = {
  facing: CameraType;
  title: string;
  onCapture: (uri: string) => void;
  onCancel: () => void;
};

export default function KycCamera({
  facing,
  title,
  onCapture,
  onCancel,
}: Props) {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>
          Camera permission required
        </Text>

        <Text style={styles.permissionText}>
          Nestora needs camera access to capture your verification
          document directly from the camera.
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
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  const capture = async () => {
    if (!cameraRef.current || !ready || capturing) {
      return;
    }

    try {
      setCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.75,
      });

      if (photo?.uri) {
        onCapture(photo.uri);
      }
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
        mirror={facing === "front"}
        onCameraReady={() => setReady(true)}
      />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.closeButton}
            onPress={onCancel}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <Text style={styles.title}>{title}</Text>

          <View style={styles.placeholder} />
        </View>

        <View style={styles.frame}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
        </View>

        <View style={styles.bottomBar}>
          <Text style={styles.instruction}>
            {facing === "front"
              ? "Position your face inside the frame"
              : "Position the document inside the frame"}
          </Text>

          <Pressable
            style={[
              styles.captureButton,
              (!ready || capturing) && styles.captureDisabled,
            ]}
            onPress={capture}
            disabled={!ready || capturing}
          >
            {capturing ? (
              <ActivityIndicator color="#173F35" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </Pressable>
        </View>
      </View>
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

  permissionContainer: {
    flex: 1,
    backgroundColor: "#173F35",
    padding: 28,
    justifyContent: "center",
  },

  permissionTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },

  permissionText: {
    color: "#DCE9E4",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },

  primaryButton: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#173F35",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
  },

  topBar: {
    height: 100,
    paddingHorizontal: 20,
    paddingTop: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: "#FFFFFF",
    fontSize: 18,
  },

  placeholder: {
    width: 40,
  },

  frame: {
    width: "88%",
    height: 240,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },

  cornerTopLeft: {
    position: "absolute",
    left: -2,
    top: -2,
    width: 32,
    height: 32,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: "#FFFFFF",
  },

  cornerTopRight: {
    position: "absolute",
    right: -2,
    top: -2,
    width: 32,
    height: 32,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: "#FFFFFF",
  },

  cornerBottomLeft: {
    position: "absolute",
    left: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#FFFFFF",
  },

  cornerBottomRight: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#FFFFFF",
  },

  bottomBar: {
    alignItems: "center",
    paddingBottom: 50,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingTop: 20,
  },

  instruction: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },

  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  captureDisabled: {
    opacity: 0.5,
  },

  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    borderColor: "#173F35",
  },
});