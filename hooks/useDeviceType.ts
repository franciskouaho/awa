import { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';

export function useDeviceType() {
  const [isTablet, setIsTablet] = useState(false);
  const [isIPad, setIsIPad] = useState(false);

  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    const screenData = Dimensions.get('screen');

    // Détecter si c'est un iPad
    const isIPadOS = Platform.OS === 'ios' && (width >= 768 || height >= 1024);

    // Détecter si c'est une tablette en général (largeur >= 768px)
    const isTabletDevice = width >= 768 || height >= 1024;

    setIsIPad(isIPadOS);
    setIsTablet(isTabletDevice);
  }, []);

  return {
    isTablet,
    isIPad,
    isPhone: !isTablet,
  };
}
