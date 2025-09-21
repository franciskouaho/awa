import { useDeviceType } from '@/hooks/useDeviceType';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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

  const handleChangeWorld = async () => {
    await Haptics.selectionAsync();
    router.push('/onboarding/affirmation');
  };

  const openTerms = () => {
    Linking.openURL('https://emplica.fr/terms');
  };
  const openPrivacy = () => {
    Linking.openURL('https://emplica.fr/privacy-policy');
  };

  return (
    <LinearGradient
      colors={['#2D5A4A', '#4A7C69', '#6BAF8A']}
      style={[styles.container, isIPad && styles.containerIPad]}
    >
      <View style={[styles.contentWrapper, isIPad && styles.contentWrapperIPad]}>
        {/* Logo et texte en haut */}
        <View style={styles.topSection}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <View style={[styles.logoContainer, isIPad && styles.logoContainerIPad]}>
              <Image
                source={require('../../assets/images/logo_rmbg.png')}
                style={[styles.icon, isIPad && styles.iconIPad]}
              />
            </View>
            <Text style={[styles.appName, isIPad && styles.appNameIPad]}>AWA</Text>
            <Text style={[styles.slogan, isIPad && styles.sloganIPad]}>
              Ta routine spirituelle, simple et motivante.
            </Text>
          </Animated.View>
        </View>

        {/* Bouton centré */}
        <View style={[styles.buttonsContainer, isIPad && styles.buttonsContainerIPad]}>
          <TouchableOpacity
            style={[styles.changeWorldBtn, isIPad && styles.changeWorldBtnIPad]}
            onPress={handleChangeWorld}
          >
            <View style={styles.glassBackground}>
              <View style={styles.glassInner}>
                <View style={styles.glassHighlight} />
                <Text style={[styles.changeWorldText, isIPad && styles.changeWorldTextIPad]}>
                  Commencer maintenant
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Terms en bas */}
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
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    width: '100%',
  },
  glassBackground: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  glassInner: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
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
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'System',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  slogan: {
    fontSize: 16,
    color: '#F0F9F4',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  changeWorldBtn: {
    borderRadius: 16,
    width: '90%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  changeWorldText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  termsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 50,
  },
  termsText: {
    color: '#F0F9F4',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 0,
    fontFamily: 'System',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  link: {
    color: '#FFFFFF',
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
    paddingHorizontal: 40,
  },
  logoContainerIPad: {
    marginBottom: 12,
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
    marginBottom: 30,
  },
  changeWorldBtnIPad: {
    width: '100%',
    paddingVertical: 20,
  },
  changeWorldTextIPad: {
    fontSize: 20,
  },
  termsContainerIPad: {
    marginTop: 8,
  },
  termsTextIPad: {
    fontSize: 14,
  },
});
