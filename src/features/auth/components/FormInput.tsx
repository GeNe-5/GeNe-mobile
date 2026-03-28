import { Control, Controller, FieldValues, Path, RegisterOptions } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
};

export const FormInput = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  rules,
  autoCapitalize = "none",
  keyboardType = "default",
}: FormInputProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.fieldWrap}>
          <Text
            style={styles.label}
            allowFontScaling={true}
            accessibilityRole="text"
            accessible={true}
          >
            {label}
          </Text>
          <TextInput
            value={String(value ?? "")}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            style={[styles.input, error && styles.inputError]}
            allowFontScaling={true}
            accessible={true}
            accessibilityLabel={`${label} input`}
            accessibilityHint={placeholder ? `Enter ${label.toLowerCase()}. ${placeholder}` : `Enter ${label.toLowerCase()}.`}
            accessibilityRole="none"
            accessibilityState={{ disabled: false }}
            accessibilityLiveRegion="polite"
            accessibilityElementsHidden={false}
            importantForAccessibility="yes"
          />
          {error?.message && (
            <Text
              style={styles.errorText}
              allowFontScaling={true}
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
            >
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  fieldWrap: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    backgroundColor: "#F8FCFF",
    fontSize: 16,
    minHeight: 52,
  },
  inputError: {
    borderColor: "#D9534F",
  },
  errorText: {
    color: "#B94743",
    fontSize: 13,
  },
});
