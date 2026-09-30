import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthHero } from "@/components/login/auth-hero";
import { AUTH, AUTH_FONT } from "@/components/login/auth-palette";
import { FadeIn } from "@/components/login/fade-in";

/**
 * Shared shell for the signed-out screens: brand hero up top, white sheet
 * overlapping its bottom edge, invite-only footer pinned to the bottom.
 *
 * A ScrollView (not KeyboardAvoidingView) carries the content on purpose: under
 * Android edge-to-edge the window no longer resizes for the keyboard, so
 * KeyboardAvoidingView computes zero padding (CRM/PRM lesson). A scroll view
 * owning the overflow sidesteps that.
 */
export function AuthScreen({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: AUTH.heroTop }}>
      {/* Light glyphs: the hero behind the status bar is saturated blue. */}
      <StatusBar style="light" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
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
            paddingBottom: insets.bottom + 20,
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
  );
}
