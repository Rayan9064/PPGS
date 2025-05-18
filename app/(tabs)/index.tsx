import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Surface, Text, useTheme } from 'react-native-paper';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Surface style={styles.headerCard} elevation={2}>
          <MaterialCommunityIcons
            name="heart-pulse"
            size={48}
            color="#4CAF50"
          />
          <Text variant="headlineLarge" style={styles.title}>
            PPGS
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Your Health Companion
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            Make informed choices about packaged foods with our nutrition grading system
          </Text>
        </Surface>
      </View>

      <Surface style={styles.infoCard} elevation={1}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          How It Works
        </Text>

        <List.Section>
          <List.Item
            title="Scan Product"
            description="Use the scanner to capture product barcode"
            left={props => (
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons
                  name="barcode-scan"
                  size={24}
                  color="#4CAF50"
                />
              </View>
            )}
          />
          <List.Item
            title="View Details"
            description="Get detailed nutritional information"
            left={props => (
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <MaterialCommunityIcons
                  name="food-apple"
                  size={24}
                  color="#2196F3"
                />
              </View>
            )}
          />
          <List.Item
            title="Check Grade"
            description="See the health grade from A to E"
            left={props => (
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons
                  name="medal"
                  size={24}
                  color="#FF9800"
                />
              </View>
            )}
          />
        </List.Section>
      </Surface>

      <Surface style={styles.infoCard} elevation={1}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Grading System
        </Text>
        <View style={styles.gradeList}>
          {['A', 'B', 'C', 'D', 'E'].map((grade) => (
            <Surface key={grade} style={styles.gradeItemCard} elevation={1}>
              <View style={styles.gradeItem}>
                <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(grade) }]}>
                  <Text style={styles.gradeText}>{grade}</Text>
                </View>
                <Text variant="bodyMedium" style={styles.gradeDescription}>
                  {getGradeDescription(grade)}
                </Text>
              </View>
            </Surface>
          ))}
        </View>
      </Surface>

      <Surface style={[styles.infoCard, styles.tipsCard]} elevation={1}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Healthy Tips
        </Text>
        <List.Section>
          <List.Item
            title="Check Sugar Content"
            description="Lower is better for your health"
            left={props => (
              <MaterialCommunityIcons name="cube-outline" size={24} color="#FF5722" />
            )}
          />
          <List.Item
            title="Monitor Salt Intake"
            description="Aim for products with less sodium"
            left={props => (
              <MaterialCommunityIcons name="shaker-outline" size={24} color="#FF9800" />
            )}
          />
          <List.Item
            title="Watch Fat Levels"
            description="Choose foods with healthy fats"
            left={props => (
              <MaterialCommunityIcons name="water-outline" size={24} color="#4CAF50" />
            )}
          />
        </List.Section>
      </Surface>
    </ScrollView>
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
    backgroundColor: '#F5F5F5',
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
    color: '#2E7D32',
    fontWeight: 'bold',
    marginTop: 8,
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
});
