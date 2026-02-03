import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Trigger light haptic feedback (for selections, toggles)
 */
export const hapticLight = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

/**
 * Trigger medium haptic feedback (for button presses)
 */
export const hapticMedium = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};

/**
 * Trigger heavy haptic feedback (for important actions)
 */
export const hapticHeavy = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
};

/**
 * Trigger selection feedback (for picker changes, checkboxes)
 */
export const hapticSelection = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.selectionAsync();
  }
};

/**
 * Trigger success notification feedback
 */
export const hapticSuccess = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

/**
 * Trigger error notification feedback
 */
export const hapticError = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};

/**
 * Trigger warning notification feedback
 */
export const hapticWarning = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
};
