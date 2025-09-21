import BottomDrawer from '@/components/ui/BottomDrawer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import SettingsDrawerContent from '@/components/ui/SettingsDrawerContent';
import { useDeviceType } from '@/hooks/useDeviceType';
import { Tabs, router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);

  const CustomTabBar = () => {
    const { isIPad } = useDeviceType();

    return (
      <>
        <View style={[styles.customTabBar, isIPad && styles.customTabBarIPad]}>
          {/* Bouton Add */}
          <TouchableOpacity
            style={styles.roundButton}
            onPress={() => router.push('/add-prayer')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonGlassBackground}>
              <View style={styles.buttonGlassInner}>
                <View style={styles.buttonGlassHighlight} />
                <IconSymbol size={isIPad ? 32 : 28} name="plus.circle.fill" color="white" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Bouton Settings */}
          <TouchableOpacity
            style={styles.roundButton}
            onPress={() => setSettingsDrawerVisible(true)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.buttonGlassBackground,
                settingsDrawerVisible && styles.buttonGlassBackgroundActive,
              ]}
            >
              <View style={styles.buttonGlassInner}>
                <View style={styles.buttonGlassHighlight} />
                <IconSymbol size={isIPad ? 32 : 28} name="person.fill" color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Drawer Settings */}
        <BottomDrawer
          isVisible={settingsDrawerVisible}
          onClose={() => setSettingsDrawerVisible(false)}
        >
          <SettingsDrawerContent onClose={() => setSettingsDrawerVisible(false)} />
        </BottomDrawer>
      </>
    );
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="prayers" />
        <Tabs.Screen name="add" />
        <Tabs.Screen name="settings" />
      </Tabs>
      <CustomTabBar />
    </>
  );
}

const styles = StyleSheet.create({
  customTabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  customTabBarIPad: {
    left: '50%',
    right: 'auto',
    width: 200,
    transform: [{ translateX: -100 }], // Centrer la barre de navigation
    justifyContent: 'space-around',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
  },
  roundButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Transparent pour laisser voir l'effet glass
  },
  // Styles glassmorphisme pour les boutons individuels
  buttonGlassBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  buttonGlassBackgroundActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  buttonGlassInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
    borderRadius: 30,
  },
  buttonGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});
