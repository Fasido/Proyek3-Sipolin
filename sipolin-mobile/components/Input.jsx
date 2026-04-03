import React from 'react';
import { View, TextInput, Text } from 'react-native';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder = '',
  error = '',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  editable = true,
  className = '',
}) => {
  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-sm font-semibold text-gray-700 mb-2">{label}</Text>
      )}
      <TextInput
        className={`border rounded-lg px-4 py-3 text-base ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        editable={editable}
        placeholderTextColor="#9ca3af"
      />
      {error && (
        <Text className="text-red-600 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
};

export default Input;
