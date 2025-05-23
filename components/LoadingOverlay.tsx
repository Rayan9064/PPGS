import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

interface Props {
  message?: string;
  opacity?: number;
}

export function LoadingOverlay({ 
  message = 'Loading...', 
  opacity = 0.7 
}: Props) {
  return (
    <View style={[styles.container, { backgroundColor: `rgba(0,0,0,${opacity})` }]}>
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});
