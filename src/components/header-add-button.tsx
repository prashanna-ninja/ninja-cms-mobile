import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Plus } from "@/lib/icons";
import { mix } from "@/lib/org-theme";
import { useOrgTheme } from "@/providers/org-theme-provider";

/**
 * The "+" tile in a screen header (Client Records → Add client, Workflows → New workflow), 40px like
 * the icon tile beside the title:
 * an org-colour gradient (primary → a deeper shade) with a white plus and a light shadow, so it
 * stands out from the light page even for pale org colours.
 *
 * ⚠️ Plain object styles + hand-tracked pressed state on purpose: NativeWind's Pressable drops
 * `style={({ pressed }) => …}` on native, which left this tile white (it looked fine on web).
 */
export function HeaderAddButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { theme } = useOrgTheme();
  const [pressed, setPressed] = React.useState(false);
  const deep = mix(theme.text, "#000000", 0.18);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      hitSlop={6}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: deep, // also gives Android's elevation shadow a surface
          shadowColor: deep,
          shadowOpacity: 0.3,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        }}
      >
        <LinearGradient
          colors={pressed ? [deep, deep] : [theme.base, deep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.6} />
        </LinearGradient>
      </View>
    </Pressable>
  );
}
