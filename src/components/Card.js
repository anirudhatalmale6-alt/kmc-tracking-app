import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../config/theme';

const Card = ({ children, style, onPress, variant = 'default' }) => {
  const cardStyle = [
    styles.card,
    variant === 'highlight' && styles.highlight,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.9}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    ...SHADOWS.small,
  },
  highlight: {
    backgroundColor: COLORS.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
});

export default Card;
