import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthHero } from "@/components/login/auth-hero";
import { AUTH, AUTH_FONT } from "@/components/login/auth-palette";
import { FadeIn } from "@/components/login/fade-in";
import { useKeyboard } from "@/hooks/use-keyboard";

/**
 * Room to keep visible BELOW the focused field when the keyboard is up — enough
 * for the next field, or for "Forgot password?" + the Login button when the
 * password field is focused, so the user never has to dismiss the keyboard to
 * reach the button (sized to still fit it when a server-error note sits above it).
 */
const REVEAL_BELOW = 180;

/** Gap kept between the keyboard's top edge and the revealed content. */
const KEYBOARD_GAP = 12;

/**
 * Lets any field inside <AuthScreen> ask to be scrolled into view (on focus).
 * No-op outside an AuthScreen.
 */
const RevealContext = React.createContext<() => void>(() => {});
export const useRevealFocusedField = () => React.useContext(RevealContext);

/**
 * Shared shell for the signed-out screens: brand hero up top, white sheet
 * overlapping its bottom edge, invite-only footer pinned to the bottom.
 *
 * ── Keyboard avoidance ─────────────────────────────────────────────────────
 * Hand-rolled on purpose (works in Expo Go, both platforms):
 *  1. `useKeyboard()` measures how much of the window the keyboard covers.
 *  2. The sheet's bottom padding grows by that amount, so the ScrollView has
 *     room to scroll the form above the keyboard.
 *  3. When the keyboard opens — or focus moves while it's open (email "Next" →
 *     password) — the focused input is measured in window coordinates and the
 *     ScrollView scrolls just enough to put it (+ REVEAL_BELOW) above the keyboard.
 *
 * NOT KeyboardAvoidingView (zero padding under Android edge-to-edge) and NOT
 * `automaticallyAdjustKeyboardInsets` (iOS-only, and it would double up with
 * the padding here). react-native-keyboard-controller would replace all of this
 * but isn't in Expo Go — revisit on a dev build.
 */
export function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboard();

  const scrollRef = React.useRef<ScrollView>(null);
  const scrollY = React.useRef(0);
  const keyboardTop = React.useRef(keyboard.top);
  const keyboardVisible = React.useRef(false);

  // Latest keyboard geometry for the (async) reveal below. Written in an effect,
  // not during render (React Compiler rule).
  React.useEffect(() => {
    keyboardTop.current = keyboard.top;
    keyboardVisible.current = keyboard.visible;
  }, [keyboard.top, keyboard.visible]);

  const reveal = React.useCallback(() => {
    // Wait a frame so the padding from the keyboard state has laid out —
    // otherwise scrollTo is clamped to the old (shorter) content height.
    setTimeout(() => {
      if (!keyboardVisible.current) return;
      const input = TextInput.State.currentlyFocusedInput();
      if (!input) return;

      input.measureInWindow((_x, y, _w, height) => {
        const wantedBottom = y + height + REVEAL_BELOW;
        const limit = keyboardTop.current - KEYBOARD_GAP;
        let delta = wantedBottom - limit;
        // Never push the field itself up under the status bar.
        delta = Math.min(delta, y - (insets.top + KEYBOARD_GAP));
        if (delta > 0) {
          scrollRef.current?.scrollTo({ y: scrollY.current + delta, animated: true });
        }
      });
    }, Platform.OS === "ios" ? 50 : 80);
  }, [insets.top]);

  // Keyboard opened (or changed height, e.g. iOS suggestions bar) → reveal.
  React.useEffect(() => {
    if (keyboard.visible) reveal();
  }, [keyboard.visible, keyboard.overlap, reveal]);

  // Extra scroll room only (hidden behind the keyboard). On Android some devices
  // report keyboard coordinates that exclude the nav bar, so add the inset there;
  // on iOS the keyboard already covers the home indicator.
  const bottomPadding = keyboard.visible
    ? keyboard.overlap + KEYBOARD_GAP + (Platform.OS === "android" ? insets.bottom : 0)
    : insets.bottom + 20;

  return (
    <RevealContext.Provider value={reveal}>
      <View style={{ flex: 1, backgroundColor: AUTH.heroTop }}>
        {/* Light glyphs: the hero behind the status bar is saturated blue. */}
        <StatusBar style="light" />

        <ScrollView
          ref={scrollRef}
          onScroll={(e) => {
            scrollY.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ flexGrow: 1, backgroundColor: AUTH.sheet }}
        >
          <AuthHero title={title} subtitle={subtitle} topInset={insets.top} />

          {/* The sheet pulls up over the hero's bottom edge — that overlap ties the two zones together. */}
          <View
            style={{
              flex: 1,
              backgroundColor: AUTH.sheet,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              marginTop: -24,
              paddingHorizontal: 26,
              paddingTop: 30,
              paddingBottom: bottomPadding,
            }}
          >
            {children}

            {/* marginTop:auto pushes the footer to the bottom of whatever space is left. */}
            <FadeIn delay={320} style={{ marginTop: "auto", paddingTop: 28 }}>
              <Text
                style={{
                  fontFamily: AUTH_FONT.regular,
                  fontSize: 13,
                  lineHeight: 18,
                  color: AUTH.muted,
                  textAlign: "center",
                }}
              >
                Invite-only access. Contact your administrator if you can&apos;t sign in.
              </Text>
            </FadeIn>
          </View>
        </ScrollView>
      </View>
    </RevealContext.Provider>
  );
}
