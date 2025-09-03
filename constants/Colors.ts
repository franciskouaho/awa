/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2D5A4A';
const tintColorDark = '#4A7C69';

export const Colors = {
  light: {
    text: '#1A1A1A',
    textSecondary: '#666666',
    textOnPrimary: '#FFFFFF',
    textArabic: '#2D5A4A',
    background: '#F8FBF9',
    surface: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#999999',
    tabIconSelected: tintColorLight,

    // Couleurs principales AWA
    primary: '#2D5A4A',
    primaryLight: '#4A7C69',
    primaryDark: '#1A3D30',

    // Couleurs d'accentuation
    accent: '#00C851',
    accentLight: '#33D374',

    // Couleurs utilitaires
    success: '#00C851',
    warning: '#FF8F00',
    error: '#FF4444',
    info: '#33B5E5',

    // Couleurs de bordure
    border: '#E0E0E0',
    borderDark: '#4A7C69',

    // Couleurs d'ombre
    shadow: 'rgba(45, 90, 74, 0.1)',
    overlay: 'rgba(26, 61, 48, 0.5)',

    // Couleurs des composants UI
    drawer: {
      backgroundColor: '#D0E8D0',
    },

    // Couleurs de l'onboarding
    onboarding: {
      backgroundColor: '#D0E8D0',
    },

    // Couleurs spécifiques aux prières
    prayer: {
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(45, 90, 74, 0.08)',
      avatarBackground: '#4A7C69',
      dateText: '#666666',
      formulaBackground: '#F8FBF9',
      formulaArabic: '#2D5A4A',
      formulaTranslation: '#666666',
    },

    // Couleurs des statistiques
    stats: {
      blockBackground: '#FFFFFF',
      blockShadow: 'rgba(45, 90, 74, 0.08)',
      numberText: '#2D5A4A',
      labelText: '#666666',
      accentBar: '#00C851',
    },

    // Navigation
    navigation: {
      tabBarBackground: '#FFFFFF',
      tabBarBorder: '#E0E0E0',
      activeTab: '#2D5A4A',
      inactiveTab: '#999999',
      tabShadow: 'rgba(0, 0, 0, 0.05)',
    },
  },
  dark: {
    text: '#1A1A1A',
    textSecondary: '#666666',
    textOnPrimary: '#FFFFFF',
    textArabic: '#2D5A4A',
    background: '#F8FBF9',
    surface: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#999999',
    tabIconSelected: tintColorLight,

    // Couleurs principales AWA
    primary: '#2D5A4A',
    primaryLight: '#4A7C69',
    primaryDark: '#1A3D30',

    // Couleurs d'accentuation
    accent: '#00C851',
    accentLight: '#33D374',

    // Couleurs utilitaires
    success: '#00C851',
    warning: '#FF8F00',
    error: '#FF4444',
    info: '#33B5E5',

    // Couleurs de bordure
    border: '#E0E0E0',
    borderDark: '#4A7C69',

    // Couleurs d'ombre
    shadow: 'rgba(45, 90, 74, 0.1)',
    overlay: 'rgba(26, 61, 48, 0.5)',

    // Couleurs des composants UI
    drawer: {
      backgroundColor: '#D0E8D0',
    },

    // Couleurs de l'onboarding
    onboarding: {
      backgroundColor: '#D0E8D0',
    },

    // Couleurs spécifiques aux prières
    prayer: {
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(45, 90, 74, 0.08)',
      avatarBackground: '#4A7C69',
      dateText: '#666666',
      formulaBackground: '#F8FBF9',
      formulaArabic: '#2D5A4A',
      formulaTranslation: '#666666',
    },

    // Couleurs des statistiques
    stats: {
      blockBackground: '#FFFFFF',
      blockShadow: 'rgba(45, 90, 74, 0.08)',
      numberText: '#2D5A4A',
      labelText: '#666666',
      accentBar: '#00C851',
    },

    // Navigation
    navigation: {
      tabBarBackground: '#FFFFFF',
      tabBarBorder: '#E0E0E0',
      activeTab: '#2D5A4A',
      inactiveTab: '#999999',
      tabShadow: 'rgba(0, 0, 0, 0.05)',
    },
  },
};

// Gradient combinations pour les effets visuels
export const Gradients = {
  primary: ['#4A7C69', '#2D5A4A'],
  card: ['#FFFFFF', '#F8FBF9'],
  background: ['#F8FBF9', '#FFFFFF'],
  accent: ['#33D374', '#00C851'],
};
