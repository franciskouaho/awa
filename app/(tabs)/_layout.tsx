import AddDrawerContent from '@/components/ui/AddDrawerContent';
import BottomDrawer from '@/components/ui/BottomDrawer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import SettingsDrawerContent from '@/components/ui/SettingsDrawerContent';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [addDrawerVisible, setAddDrawerVisible] = useState(false);

  const CustomTabBar = () => {
    return (
      <>
        <View style={styles.customTabBar}>
          {/* Bouton Add */}
          <TouchableOpacity
            style={[
              styles.roundButton,
              {
                backgroundColor: addDrawerVisible
                  ? 'rgba(69, 90, 100, 0.9)'
                  : 'rgba(69, 90, 100, 0.7)',
              },
            ]}
            onPress={() => setAddDrawerVisible(true)}
            activeOpacity={0.8}
          >
            <IconSymbol size={28} name="plus.circle.fill" color="white" />
          </TouchableOpacity>

          {/* Bouton Settings */}
          <TouchableOpacity
            style={[
              styles.roundButton,
              {
                backgroundColor: settingsDrawerVisible
                  ? 'rgba(69, 90, 100, 0.9)'
                  : 'rgba(69, 90, 100, 0.7)',
              },
            ]}
            onPress={() => setSettingsDrawerVisible(true)}
            activeOpacity={0.8}
          >
            <IconSymbol size={28} name="person.fill" color="white" />
          </TouchableOpacity>
        </View>

        {/* Drawer Add */}
        <BottomDrawer isVisible={addDrawerVisible} onClose={() => setAddDrawerVisible(false)}>
          <AddDrawerContent onClose={() => setAddDrawerVisible(false)} />
        </BottomDrawer>

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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
