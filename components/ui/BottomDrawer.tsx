import { useDeviceType } from '@/hooks/useDeviceType';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

interface BottomDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
  disableSwipeToClose?: boolean;
  disableOverlayClose?: boolean;
}

export default function BottomDrawer({
  isVisible,
  onClose,
  children,
  height = screenHeight * 0.9, // Augmenter la hauteur à 90% de l'écran
  disableSwipeToClose = false,
  disableOverlayClose = false,
}: BottomDrawerProps) {
  const { isIPad } = useDeviceType();
  const translateY = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Ajuster la hauteur pour iPad
  const adjustedHeight = isIPad ? Math.min(height, screenHeight * 0.8) : height;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      if (disableSwipeToClose) return false;
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (disableSwipeToClose) return;
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (disableSwipeToClose) return;
      if (gestureState.dy > 50 || gestureState.vy > 0.5) {
        onClose();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }).start();
      }
    },
  });

  useEffect(() => {
    if (isVisible) {
      // Ouvrir le drawer
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fermer le drawer
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: adjustedHeight,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, adjustedHeight, translateY, overlayOpacity]);

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Overlay */}
        <TouchableWithoutFeedback onPress={disableOverlayClose ? undefined : onClose}>
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            {
              height: adjustedHeight,
              transform: [{ translateY }],
              // Améliorer l'apparence sur iPad
              ...(isIPad && {
                maxWidth: 600,
                alignSelf: 'center',
                width: '90%',
              }),
            },
          ]}
          {...(disableSwipeToClose ? {} : panResponder.panHandlers)}
        >
          <LinearGradient
            colors={['#2D5A4A', '#4A7C69', '#6BAF8A']}
            style={styles.gradientContainer}
          >
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: 'rgba(255, 255, 255, 0.5)' }]} />
            </View>

            {/* Content */}
            <View style={styles.content}>{children}</View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gradientContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
