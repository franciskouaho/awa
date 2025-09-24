// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  // AWA Navigation Icons
  'book.fill': 'menu-book',
  'plus.circle.fill': 'add-circle',
  'chart.bar.fill': 'bar-chart',
  'gearshape.fill': 'settings',
  // Icônes pour la nouvelle navigation
  'square.grid.2x2': 'grid-view',
  'person.fill': 'person',
  // Icônes pour les paramètres
  'bell.fill': 'notifications',
  'bell.badge': 'notifications-active',
  'lock.fill': 'lock',
  'info.circle.fill': 'info',
  // Icônes simples sans couleurs pour le drawer
  settings: 'tune',
  bell: 'notifications-none',
  widget: 'crop-free',
  leaf: 'eco',
  clock: 'schedule',
  heart: 'favorite-border',
  globe: 'language',
  checkmark: 'check',
  trash: 'delete',
  'exclamationmark.triangle': 'warning',
  // Icônes pour le développement
  'arrow.clockwise': 'refresh',
  'info.circle': 'info',
  'star': 'star',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: keyof typeof MAPPING;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
