import { useDeviceType } from '@/hooks/useDeviceType';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IntroScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { isIPad } = useDeviceType();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleChangeWorld = () => {
    router.push('/onboarding/email');
  };
  const openTerms = () => {
    Linking.openURL('https://your-app-url.com/terms');
  };
  const openPrivacy = () => {
    Linking.openURL('https://your-app-url.com/privacy');
  };

  return (
    <View style={[styles.container, isIPad && styles.containerIPad]}>
      <View style={[styles.contentWrapper, isIPad && styles.contentWrapperIPad]}>
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <View style={[styles.logoContainer, isIPad && styles.logoContainerIPad]}>
              <Image source={require('../../assets/images/logo_rmbg.png')} style={[styles.icon, isIPad && styles.iconIPad]} />
            </View>
            <Text style={[styles.appName, isIPad && styles.appNameIPad]}>AWA</Text>
            <Text style={[styles.slogan, isIPad && styles.sloganIPad]}>Ta routine spirituelle, simple et motivante.</Text>
          </Animated.View>
        </View>
        <View style={[styles.buttonsContainer, isIPad && styles.buttonsContainerIPad]}>
          <TouchableOpacity style={[styles.changeWorldBtn, isIPad && styles.changeWorldBtnIPad]} onPress={handleChangeWorld}>
            <Text style={[styles.changeWorldText, isIPad && styles.changeWorldTextIPad]}>Commencer maintenant</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.termsContainer, isIPad && styles.termsContainerIPad]}>
          <Text style={[styles.termsText, isIPad && styles.termsTextIPad]}>
            En continuant, tu acceptes nos{' '}
            <Text style={styles.link} onPress={openTerms}>
              conditions d&#39;utilisation
            </Text>{' '}
            et{' '}
            <Text style={styles.link} onPress={openPrivacy}>
              politique de confidentialité
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#E6F7EC', // vert très clair, thème principal
    padding: 0,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 8,
  },
  icon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  sunRays: {
    // Placeholder for decorative rays
  },
  appName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#2D5A4A',
    textAlign: 'center',
    fontFamily: 'System',
    marginBottom: 4,
  },
  slogan: {
    fontSize: 16,
    color: '#4CCB5F',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 0,
  },
  changeWorldBtn: {
    backgroundColor: '#2D5A4A', // vert foncé du thème
    borderRadius: 16,
    width: '90%',
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  changeWorldText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 1,
  },
  termsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 50,
  },
  termsText: {
    color: '#2D5A4A',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 0,
    fontFamily: 'System',
  },
  link: {
    color: '#4CCB5F',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  // Styles iPad
  containerIPad: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapperIPad: {
    width: 500,
    maxWidth: '90%',
  },
  logoContainerIPad: {
    marginTop: 60,
  },
  iconIPad: {
    width: 100,
    height: 100,
  },
  appNameIPad: {
    fontSize: 42,
  },
  sloganIPad: {
    fontSize: 20,
  },
  buttonsContainerIPad: {
    marginTop: 20,
  },
  changeWorldBtnIPad: {
    width: '100%',
    paddingVertical: 20,
  },
  changeWorldTextIPad: {
    fontSize: 24,
  },
  termsContainerIPad: {
    marginTop: 8,
  },
  termsTextIPad: {
    fontSize: 14,
  },
});
