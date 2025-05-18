import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';

export default function Scanner() {
  const handleManualEntry = () => {
    // For testing, we'll use a mock product data
    const mockProductData = {
      product_name: "Test Product",
      ingredients_text: "Sugar, Salt, Fat",
      nutriments: {
        sugars_100g: 10,
        fat_100g: 5,
        salt_100g: 1.5
      }
    };

    router.push({
      pathname: "/results",
      params: { productData: JSON.stringify(mockProductData) }
    });
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.content} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Product Scanner
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          Scanner functionality will be implemented soon. For now, you can use the test button below.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleManualEntry}
            style={styles.button}
          >
            Test with Sample Product
          </Button>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    width: '80%',
  },
});
