import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ThemePreviewProps {
  theme: {
    id: string;
    name: string;
    icon: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
  isSelected: boolean;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, isSelected }) => {
  return (
    <View style={[
      styles.previewContainer,
      {
        backgroundColor: isSelected ? theme.colors.secondary : '#f8f8f8',
        borderColor: isSelected ? theme.colors.primary : '#e0e0e0',
        borderWidth: isSelected ? 3 : 1,
      }
    ]}>
      {/* Aperçu du widget avec le thème */}
      <View style={[
        styles.widgetPreview,
        {
          backgroundColor: theme.colors.secondary,
          borderColor: theme.colors.primary,
        }
      ]}>
        {/* Header du widget */}
        <View style={styles.widgetHeader}>
          <View style={styles.widgetHeaderLeft}>
            <Text style={[styles.widgetIcon, { color: theme.colors.primary }]}>📿</Text>
            <View>
              <Text style={[styles.widgetTitle, { color: theme.colors.primary }]}>
                Marie Dubois
              </Text>
              <Text style={[styles.widgetSubtitle, { color: theme.colors.primary, opacity: 0.7 }]}>
                72 ans • Lyon
              </Text>
            </View>
          </View>
          <Text style={[styles.widgetHandsIcon, { color: theme.colors.primary }]}>🙏</Text>
        </View>

        {/* Message du widget */}
        <Text style={[styles.widgetMessage, { color: theme.colors.primary, opacity: 0.8 }]}>
          Que Dieu ait son âme en paix...
        </Text>

        {/* Footer du widget */}
        <View style={styles.widgetFooter}>
          <Text style={[styles.widgetDate, { color: theme.colors.primary, opacity: 0.6 }]}>
            📅 Décédé le 15/09/2024
          </Text>
        </View>
      </View>

      {/* Informations du thème */}
      <View style={styles.themeInfo}>
        <Text style={styles.themeIcon}>{theme.icon}</Text>
        <Text style={[
          styles.themeName,
          { 
            color: isSelected ? theme.colors.primary : '#333',
            fontWeight: isSelected ? '600' : '400',
          }
        ]}>
          {theme.name}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    borderRadius: 12,
    padding: 12,
    margin: 4,
    alignItems: 'center',
    minHeight: 200,
  },
  widgetPreview: {
    width: 120,
    height: 100,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  widgetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  widgetIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  widgetTitle: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
  widgetSubtitle: {
    fontSize: 8,
    lineHeight: 10,
  },
  widgetHandsIcon: {
    fontSize: 10,
  },
  widgetMessage: {
    fontSize: 8,
    lineHeight: 10,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  widgetFooter: {
    alignItems: 'center',
  },
  widgetDate: {
    fontSize: 7,
  },
  themeInfo: {
    alignItems: 'center',
  },
  themeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  themeName: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default ThemePreview;
