import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, List, Surface, Text, useTheme } from 'react-native-paper';
import { ProductData } from '../../services/productAPI';
import { calculateGrade, getNutrientWarnings } from '../../utils/gradingLogic';

export default function ResultScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const productData: ProductData = params.productData ? JSON.parse(params.productData as string) : null;

  if (!productData) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium">No product data available</Text>
      </View>
    );
  }
  
  const grade = calculateGrade(productData);
  const warnings = getNutrientWarnings(productData);

  const gradeColors = {
    A: '#1fa363',
    B: '#8bc34a',
    C: '#ffeb3b',
    D: '#ff9800',
    E: '#f44336',
    U: '#9e9e9e',
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.productName}>
          {productData.product_name}
        </Text>
        <View style={styles.gradeContainer}>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColors[grade as keyof typeof gradeColors] }]}>
            <Text style={styles.gradeText}>{grade}</Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.section} elevation={1}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Nutrition Facts
        </Text>
        <List.Section>
          <List.Item
            title="Sugar"
            description={`${productData.nutriments.sugars_100g}g per 100g`}
            left={() => <MaterialCommunityIcons name="food-variant" size={24} color={theme.colors.primary} />}
          />
          <Divider />
          <List.Item
            title="Fat"
            description={`${productData.nutriments.fat_100g}g per 100g`}
            left={() => <MaterialCommunityIcons name="food" size={24} color={theme.colors.primary} />}
          />
          <Divider />
          <List.Item
            title="Salt"
            description={`${productData.nutriments.salt_100g}g per 100g`}
            left={() => <MaterialCommunityIcons name="shaker-outline" size={24} color={theme.colors.primary} />}
          />
        </List.Section>
      </Surface>

      {warnings.length > 0 && (
        <Surface style={styles.section} elevation={1}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Warnings
          </Text>
          {warnings.map((warning, index) => (
            <List.Item
              key={index}
              title={warning}
              left={() => <MaterialCommunityIcons name="alert" size={24} color={theme.colors.error} />}
            />
          ))}
        </Surface>
      )}

      <Surface style={styles.section} elevation={1}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Ingredients
        </Text>
        <Text variant="bodyMedium" style={styles.ingredients}>
          {productData.ingredients_text}
        </Text>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    margin: 16,
    borderRadius: 12,
  },
  productName: {
    textAlign: 'center',
    marginBottom: 16,
  },
  gradeContainer: {
    alignItems: 'center',
  },
  gradeBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  ingredients: {
    lineHeight: 20,
  },
});
