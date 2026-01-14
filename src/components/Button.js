import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../config/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    let baseStyle = [styles.button, styles[size]];

    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        break;
      default:
        baseStyle.push(styles.primary);
    }

    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    let baseStyle = [styles.text, styles[`${size}Text`]];

    if (variant === 'outline') {
      baseStyle.push(styles.outlineText);
    }

    if (disabled || loading) {
      baseStyle.push(styles.disabledText);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  text: {
    color: COLORS.white,
    fontWeight: '600',
  },
  smallText: {
    fontSize: SIZES.small,
  },
  mediumText: {
    fontSize: SIZES.medium,
  },
  largeText: {
    fontSize: SIZES.large,
  },
  outlineText: {
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.white,
  },
});

export default Button;
