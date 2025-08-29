import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IntroScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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
  const handleDoItTomorrow = () => {
    // Optionally show a message or just stay on screen
  };
  const openTerms = () => {
    Linking.openURL('https://your-app-url.com/terms');
  };
  const openPrivacy = () => {
    Linking.openURL('https://your-app-url.com/privacy');
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/images/icon.png')} style={styles.icon} />
          </View>
          <Text style={styles.appName}>AWA</Text>
          <Text style={styles.slogan}>Ta routine spirituelle, simple et motivante.</Text>
        </Animated.View>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.changeWorldBtn} onPress={handleChangeWorld}>
          <Text style={styles.changeWorldText}>Commencer maintenant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doItTomorrowBtn} onPress={handleDoItTomorrow}>
          <Text style={styles.doItTomorrowText}>Plus tard</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          En continuant, tu acceptes nos{' '}
          <Text style={styles.link} onPress={openTerms}>conditions d'utilisation</Text>
          {' '}et{' '}
          <Text style={styles.link} onPress={openPrivacy}>politique de confidentialité</Text>
        </Text>
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
  doItTomorrowBtn: {
    backgroundColor: '#F6FFF8', // blanc légèrement teinté vert
    borderRadius: 16,
    width: '90%',
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 8,
  },
  doItTomorrowText: {
    color: '#2D5A4A', // vert foncé du thème
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
    marginBottom: 0,
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
});
