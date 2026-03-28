import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { colors } from "../../theme/colors";
import { styles } from "../dashboard.styles";

type HeightUnit = "cm" | "ft";
type WeightUnit = "kg" | "lb";

type ProfileField =
  | "name"
  | "heightValue"
  | "heightUnit"
  | "weightValue"
  | "weightUnit"
  | "dateOfBirth";

export type UserProfileForm = {
  name: string;
  heightValue: string;
  heightUnit: HeightUnit;
  weightValue: string;
  weightUnit: WeightUnit;
  dateOfBirth: string;
};

type SettingsTabProps = {
  profile: UserProfileForm;
  isEditing: boolean;
  onChangeField: (field: ProfileField, value: string) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveProfile: () => void;
  onOpenQuestionnaire: () => void;
};

const parseIsoDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, month, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const formatIsoDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const SettingsTab = ({
  profile,
  isEditing,
  onChangeField,
  onStartEditing,
  onCancelEditing,
  onSaveProfile,
  onOpenQuestionnaire,
}: SettingsTabProps) => {
  const heightUnits: HeightUnit[] = ["cm", "ft"];
  const weightUnits: WeightUnit[] = ["kg", "lb"];
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(
    () => parseIsoDate(profile.dateOfBirth) ?? new Date(1998, 0, 1)
  );

  useEffect(() => {
    const parsedDob = parseIsoDate(profile.dateOfBirth);
    if (parsedDob) {
      setPickerDate(parsedDob);
    }
  }, [profile.dateOfBirth]);

  useEffect(() => {
    if (!isEditing) {
      setShowDatePicker(false);
    }
  }, [isEditing]);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    setPickerDate(selectedDate);
    onChangeField("dateOfBirth", formatIsoDate(selectedDate));
  };

  return (
  <>
    <View style={styles.card}>
      <Text style={styles.sectionTitle} accessibilityRole="header" allowFontScaling={true}>
        Profile Settings
      </Text>
      <View style={styles.profileHeaderRow}>
        <View style={styles.profileAvatar} accessible={false} importantForAccessibility="no">
          <Ionicons name="person" size={26} color={colors.accent} />
        </View>
        <View style={styles.profileHeaderMeta}>
          <Text style={styles.profileHeaderName} allowFontScaling={true}>
            {profile.name || "Your Profile"}
          </Text>
          <Text style={styles.softText} allowFontScaling={true}>
            Update your details to personalize your wellness journey.
          </Text>
        </View>
      </View>
    </View>

    <View style={styles.card}>
      <Text style={styles.sectionTitle} accessibilityRole="header" allowFontScaling={true}>
        Profile Details
      </Text>

      {isEditing ? (
        <>
          <View style={styles.settingsFieldGroup}>
            <Text style={styles.settingsLabel} allowFontScaling={true}>
              Full Name
            </Text>
            <TextInput
              value={profile.name}
              onChangeText={(value) => onChangeField("name", value)}
              placeholder="Enter full name"
              placeholderTextColor={colors.textSecondary}
              style={styles.settingsInput}
              allowFontScaling={true}
              accessibilityLabel="Full name"
              accessibilityHint="Edit your profile name"
            />
          </View>

          <View style={styles.settingsFieldGroup}>
            <Text style={styles.settingsLabel} allowFontScaling={true}>
              Height
            </Text>
            <TextInput
              value={profile.heightValue}
              onChangeText={(value) => onChangeField("heightValue", value)}
              placeholder="e.g. 170"
              placeholderTextColor={colors.textSecondary}
              style={styles.settingsInput}
              allowFontScaling={true}
              accessibilityLabel="Height"
              accessibilityHint="Edit your height"
            />
            <View style={styles.unitRow}>
              {heightUnits.map((unit) => (
                <Pressable
                  key={unit}
                  style={[styles.unitChip, profile.heightUnit === unit && styles.unitChipActive]}
                  onPress={() => onChangeField("heightUnit", unit)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Height unit ${unit}`}
                  accessibilityState={{ selected: profile.heightUnit === unit }}
                >
                  <Text
                    style={[
                      styles.unitChipText,
                      profile.heightUnit === unit && styles.unitChipTextActive,
                    ]}
                    allowFontScaling={true}
                  >
                    {unit.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.settingsFieldGroup}>
            <Text style={styles.settingsLabel} allowFontScaling={true}>
              Weight
            </Text>
            <TextInput
              value={profile.weightValue}
              onChangeText={(value) => onChangeField("weightValue", value)}
              placeholder="e.g. 68"
              placeholderTextColor={colors.textSecondary}
              style={styles.settingsInput}
              allowFontScaling={true}
              accessibilityLabel="Weight"
              accessibilityHint="Edit your weight"
            />
            <View style={styles.unitRow}>
              {weightUnits.map((unit) => (
                <Pressable
                  key={unit}
                  style={[styles.unitChip, profile.weightUnit === unit && styles.unitChipActive]}
                  onPress={() => onChangeField("weightUnit", unit)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Weight unit ${unit}`}
                  accessibilityState={{ selected: profile.weightUnit === unit }}
                >
                  <Text
                    style={[
                      styles.unitChipText,
                      profile.weightUnit === unit && styles.unitChipTextActive,
                    ]}
                    allowFontScaling={true}
                  >
                    {unit.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.settingsFieldGroup}>
            <Text style={styles.settingsLabel} allowFontScaling={true}>
              Date of Birth
            </Text>
            <View style={styles.datePickerRow}>
              <Text
                style={styles.settingsValue}
                allowFontScaling={true}
                accessibilityLabel="Selected date of birth"
              >
                {profile.dateOfBirth || "Not set"}
              </Text>
              <Pressable
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Open date of birth calendar"
                accessibilityHint="Opens calendar to select date of birth"
              >
                <Ionicons name="calendar-outline" size={14} color={colors.textPrimary} />
                <Text style={styles.datePickerButtonText} allowFontScaling={true}>
                  Calendar
                </Text>
              </Pressable>
            </View>
            {showDatePicker ? (
              <View style={styles.settingsFieldGroup}>
                <DateTimePicker
                  value={pickerDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
                {Platform.OS === "ios" ? (
                  <View style={styles.journalActionsRow}>
                    <Pressable
                      style={styles.cancelEditButton}
                      onPress={() => setShowDatePicker(false)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Done selecting date"
                    >
                      <Text style={styles.cancelEditText} allowFontScaling={true}>
                        Done
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.journalActionsRow}>
            <Pressable
              style={styles.cancelEditButton}
              onPress={onCancelEditing}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel profile edits"
              accessibilityHint="Discard profile changes"
            >
              <Text style={styles.cancelEditText} allowFontScaling={true}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              style={styles.saveButton}
              onPress={onSaveProfile}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Save profile"
              accessibilityHint="Saves your edited profile details"
            >
              <Text style={styles.saveButtonText} allowFontScaling={true}>
                Save Profile
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <View style={styles.settingsFieldGroup}>
            <Text style={styles.settingsLabel} allowFontScaling={true}>
              Full Name
            </Text>
            <Text style={styles.settingsValue} allowFontScaling={true}>
              {profile.name || "Not set"}
            </Text>
          </View>

          <View style={styles.settingsFieldGroup}>
            <Text style={styles.settingsLabel} allowFontScaling={true}>
              Height
            </Text>
            <Text style={styles.settingsValue} allowFontScaling={true}>
              {profile.heightValue ? `${profile.heightValue} ${profile.heightUnit}` : "Not set"}
            </Text>
          </View>

          <View style={styles.settingsFieldGroup}>
            <Text style={styles.settingsLabel} allowFontScaling={true}>
              Weight
            </Text>
            <Text style={styles.settingsValue} allowFontScaling={true}>
              {profile.weightValue ? `${profile.weightValue} ${profile.weightUnit}` : "Not set"}
            </Text>
          </View>

          <View style={styles.settingsFieldGroup}>
            <Text style={styles.settingsLabel} allowFontScaling={true}>
              Date of Birth
            </Text>
            <Text style={styles.settingsValue} allowFontScaling={true}>
              {profile.dateOfBirth || "Not set"}
            </Text>
          </View>

          <Pressable
            style={styles.saveButton}
            onPress={onStartEditing}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            accessibilityHint="Enable profile editing"
          >
            <Text style={styles.saveButtonText} allowFontScaling={true}>
              Edit Profile
            </Text>
          </Pressable>
        </>
      )}
    </View>

    <View style={styles.card}>
      <Text style={styles.sectionTitle} accessibilityRole="header" allowFontScaling={true}>
        Stress Assessment
      </Text>
      <Text style={styles.softText} allowFontScaling={true}>
        Open the 14-day stress questionnaire anytime from settings.
      </Text>
      <Pressable
        style={styles.settingsActionButton}
        onPress={onOpenQuestionnaire}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Open stress questionnaire"
        accessibilityHint="Opens stress assessment questionnaire"
      >
        <Ionicons name="document-text-outline" size={15} color="#FFFFFF" />
        <Text style={styles.saveButtonText} allowFontScaling={true}>
          Open Questionnaire
        </Text>
      </Pressable>
    </View>
  </>
  );
};