import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Button } from '../../components/ui/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useNavigation } from '@react-navigation/native';

export const NotFoundScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>This page doesn't exist.</Text>
        <Button 
          title="Go Home" 
          onPress={() => navigation.navigate('Main', { screen: 'Home', params: {} })} 
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.post.fontFamily,
    fontSize: 48,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 200,
  }
});
