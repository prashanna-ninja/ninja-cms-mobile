import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

import { NinjaCmsLogo } from "@/components/brand/ninja-cms-logo";
import { FadeIn } from "@/components/login/fade-in";
import { AUTH, AUTH_FONT } from "@/components/login/auth-palette";

/** The brand hero above the auth sheet: logo, title, one line of copy. */
export function AuthHero({
  title,
  subtitle,
  topInset = 0,
}: {
  title: string;
  subtitle: string;
  /**
   * The safe-area top inset, absorbed into the gradient's own padding.
   *
   * ⚠️ The gradient MUST paint this area itself. A padded wrapper <View> would be
   * transparent and show the ScrollView's white content container as a white band
   * above the hero on every notched iPhone (Ninja PRM bug).
   */
  topInset?: number;
}) {
  return (
    <LinearGradient
      colors={[AUTH.heroTop, AUTH.heroBottom]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ paddingHorizontal: 26, paddingTop: topInset + 28, paddingBottom: 44 }}
    >
      <FadeIn delay={40}>
        {/* White CMS NINJA wordmark (no tint) — same component as the signed-in screens. */}
        <NinjaCmsLogo width={120} />
      </FadeIn>

      <FadeIn delay={110}>
        <View style={{ gap: 8, marginTop: 16 }}>
          <Text
            style={{
              fontFamily: AUTH_FONT.bold,
              fontSize: 31,
              lineHeight: 36,
              letterSpacing: -0.8,
              color: AUTH.heroText,
            }}
          >
            {title}
          </Text>
          <Text
            style={{ fontFamily: AUTH_FONT.regular, fontSize: 15, lineHeight: 22, color: AUTH.heroMuted }}
          >
            {subtitle}
          </Text>
        </View>
      </FadeIn>
    </LinearGradient>
  );
}
