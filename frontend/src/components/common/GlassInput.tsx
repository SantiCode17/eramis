import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

/**
 * Campo de entrada con estética glass. Al recibir foco, el borde cambia a dorado.
 */
export const GlassInput: React.FC<GlassInputProps> = ({ label, error, style, ...props }) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...props}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.textPlaceholder}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: { ...Typography.bodyM, color: Colors.textSecondary },
  input: {
    ...Typography.bodyL,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.textPrimary,
  },
  inputFocused: {
    borderColor: Colors.starGold,
    backgroundColor: 'rgba(255,204,0,0.05)',
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: { ...Typography.bodyS, color: Colors.error },
});
