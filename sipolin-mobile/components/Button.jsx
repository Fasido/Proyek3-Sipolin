import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export const Button = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'rounded-lg items-center justify-center';

  const variantStyles = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-200',
    danger: 'bg-red-600',
    success: 'bg-green-600',
  };

  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const textColorStyles = {
    primary: 'text-white',
    secondary: 'text-gray-900',
    danger: 'text-white',
    success: 'text-white',
  };

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      onPress={onPress}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator color={textColorStyles[variant] === 'text-white' ? 'white' : 'black'} />
      ) : (
        <Text className={`font-semibold ${textColorStyles[variant]} ${textSizeStyles[size]}`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
