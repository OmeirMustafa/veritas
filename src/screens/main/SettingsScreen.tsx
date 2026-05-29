import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleDataExport = () => {
    // Mock implementation for requesting data export
    Alert.alert(
      "Data Export Requested", 
      "Your journal entries will be emailed to you within 24 hours.",
      [{ text: "OK" }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account", 
      "Are you sure? This action cannot be undone and will permanently delete all your entries.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
          // Mock implementation for deleting account
          Alert.alert("Account Deleted", "Your account and data have been queued for deletion.");
          supabase.auth.signOut();
        } }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Button 
            title="Sign Out" 
            variant="outline" 
            onPress={handleSignOut} 
            style={styles.actionButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <Button 
            title="Request Data Export" 
            variant="outline" 
            onPress={handleDataExport} 
            style={styles.actionButton}
          />
          <Button 
            title="Delete Account" 
            variant="outline" 
            onPress={handleDeleteAccount} 
            style={[styles.actionButton, styles.dangerButton] as any}
            textStyle={styles.dangerText}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Button 
            title="Terms & Privacy Policy" 
            variant="outline" 
            onPress={() => navigation.navigate('Auth', { screen: 'Legal' })} 
            style={styles.actionButton}
          />
        </View>

        <Text style={styles.version}>Veritas v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionButton: {
    marginBottom: spacing.sm,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
  },
  dangerButton: {
    borderColor: colors.error,
  },
  dangerText: {
    color: colors.error,
  },
  version: {
    fontFamily: typography.ui.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  }
});
