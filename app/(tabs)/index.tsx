import { useCameraPermissions } from "expo-camera";
import { Link, Stack } from "expo-router";
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function HomeScreen() {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Overview", headerShown: false }} />
      <Text style={styles.title}>Product Scanner</Text>
      <View style={{ gap: 20 }}>
        <Pressable onPress={requestPermission}>
          <Text style={styles.buttonStyle}>
            {isPermissionGranted ? "Permission Granted" : "Request Camera Access"}
          </Text>
        </Pressable>
        <Link href={"/scanner"} asChild>
          <Pressable disabled={!isPermissionGranted}>
            <Text
              style={[
                styles.buttonStyle,
                { opacity: !isPermissionGranted ? 0.5 : 1 },
              ]}
            >
              Scan Product
            </Text>
          </Pressable>
        </Link>
      </View>
      <Text style={styles.description}>
        Scan product barcodes to get detailed nutrition information
      </Text>
    </SafeAreaView>
  );
}

const getGradeColor = (grade: string) => {
  const colors = {
    A: '#4CAF50', // Green
    B: '#8BC34A', // Light Green
    C: '#FFC107', // Amber
    D: '#FF9800', // Orange
    E: '#F44336', // Red
  };
  return colors[grade as keyof typeof colors];
};

const getGradeDescription = (grade: string) => {
  const descriptions = {
    A: 'Excellent nutritional value',
    B: 'Good nutritional value',
    C: 'Average nutritional value',
    D: 'Below average nutritional value',
    E: 'Poor nutritional value',
  };
  return descriptions[grade as keyof typeof descriptions];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "black",
    justifyContent: "space-around",
    paddingVertical: 80,
  },
  headerContainer: {
    backgroundColor: '#4CAF50',
    paddingTop: 40,
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    color: "white",
    fontSize: 40,
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    color: '#4CAF50',
    marginTop: 4,
  },
  description: {
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  infoCard: {
    margin: 16,
    marginTop: -30,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#1B5E20',
    fontWeight: '600',
    marginBottom: 16,
  },
  gradeList: {
    gap: 8,
  },
  gradeItemCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  gradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  gradeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gradeDescription: {
    flex: 1,
    color: '#424242',
  },
  tipsCard: {
    marginTop: 0,
    marginBottom: 32,
  },
  buttonStyle: {
    color: "#0E7AFE",
    fontSize: 20,
    textAlign: "center",
  },
});
