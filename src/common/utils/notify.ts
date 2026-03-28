import { AccessibilityInfo, Alert, Platform, ToastAndroid } from "react-native";
import * as Haptics from "expo-haptics";

const showToast = (message: string) => {
  void AccessibilityInfo.announceForAccessibility(message);

  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert("Notice", message);
};

export const notifySuccess = (message: string) => {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  showToast(message);
};

export const notifyError = (message: string) => {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  showToast(message);
};
