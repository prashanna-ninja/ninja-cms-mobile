import { useEffect, useState } from "react";
import { Dimensions, Keyboard, Platform } from "react-native";

export type KeyboardState = {
  /** How many px of the window the keyboard covers (0 when closed). */
  overlap: number;
  /** The keyboard's top edge in window coordinates (window height when closed). */
  top: number;
  visible: boolean;
};

const closed = (): KeyboardState => ({
  overlap: 0,
  top: Dimensions.get("window").height,
  visible: false,
});

/**
 * The on-screen keyboard, measured — works in Expo Go on both platforms.
 *
 * **Why not `KeyboardAvoidingView`:** SDK 57 is edge-to-edge on Android, where
 * the window no longer resizes for the keyboard, so KeyboardAvoidingView
 * computes zero padding and fields end up behind it (CRM/PRM gotcha).
 * **Why not `react-native-keyboard-controller`:** it isn't in Expo Go — revisit
 * once we're on a development build (docs/IMPLEMENTATION-LOG.md 2026-09-30).
 *
 * `overlap` is geometric — window height minus the keyboard's top edge — rather
 * than the reported keyboard height. That makes it right in every mode: on
 * edge-to-edge Android and iOS the window doesn't shrink, so overlap = the
 * keyboard; on an Android device that DOES resize the window, the keyboard top
 * sits at the window's bottom and overlap ≈ 0, so we never double-pad.
 *
 * iOS uses the `Will` events so layout moves in step with the keyboard;
 * Android only fires the `Did` events reliably.
 */
export function useKeyboard(): KeyboardState {
  const [state, setState] = useState<KeyboardState>(closed);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const show = Keyboard.addListener(showEvent, (e) => {
      const windowHeight = Dimensions.get("window").height;
      const top = e.endCoordinates?.screenY ?? windowHeight;
      setState({ overlap: Math.max(0, windowHeight - top), top, visible: true });
    });
    const hide = Keyboard.addListener(hideEvent, () => setState(closed()));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return state;
}
