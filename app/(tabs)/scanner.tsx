import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, router, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  AppState,
  Platform,
  StatusBar,
  StyleSheet,
  View
} from "react-native";
import { Button, Text } from "react-native-paper";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import Overlay from "../../components/Overlay";
import { fetchProductData } from "../../services/productAPI";

export default function Scanner() {
  const scanLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Reset camera state when screen is focused
  useEffect(() => {
    const resetCamera = () => {
      setIsCameraReady(false);
      setIsScanning(false);
      scanLock.current = false;
      // Short delay before re-enabling camera
      setTimeout(() => {
        setIsScanning(true);
      }, 100);
    };

    const unsubscribe = navigation.addListener('focus', resetCamera);

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  useEffect(() => {
    // Request camera permission on mount if not already granted
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const isGoingActive =
        appState.current.match(/inactive|background/) !== null &&
        nextAppState === "active";

      if (isGoingActive) {
        // Reset camera when app comes to foreground
        setIsCameraReady(false);
        setIsScanning(false);
        scanLock.current = false;
        setTimeout(() => {
          setIsScanning(true);
        }, 100);
        setError(null);
        
        if (!permission?.granted) {
          requestPermission();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (data && !scanLock.current && !isLoading) {
      scanLock.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const productData = await fetchProductData(data);
        setIsScanning(false); // Disable camera before navigation
        router.push({
          pathname: "/results",
          params: { productData: JSON.stringify(productData) },
        });
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch product data"
        );
        // Reset scanner after error
        setTimeout(() => {
          scanLock.current = false;
          setIsCameraReady(false);
          setIsScanning(false);
          setTimeout(() => {
            setIsScanning(true);
            setError(null);
          }, 100);
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.centeredContainer}>
        <Text variant="headlineMedium" style={{ marginBottom: 20, textAlign: "center" }}>
          Camera Permission Required
        </Text>
        <Button mode="contained" onPress={requestPermission}>
          Grant Camera Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Scanner",
          headerShown: false,
        }}
      />
      {Platform.OS === "android" && <StatusBar hidden />}
      
      {isScanning && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={isLoading ? undefined : handleBarCodeScanned}
          onCameraReady={() => setIsCameraReady(true)}
        />
      )}
        {!isCameraReady && isScanning && (
        <LoadingOverlay message="Initializing camera..." opacity={1} />
      )}
      {isCameraReady && isScanning && (
        <View style={StyleSheet.absoluteFillObject}>
          <Overlay />
        </View>
      )}
      {isLoading && <LoadingOverlay message="Fetching product data..." />}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubText}>Try scanning again</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255,59,48,0.9)",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  errorText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorSubText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 5,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
});