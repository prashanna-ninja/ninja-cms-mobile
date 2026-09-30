import { Text, View } from "react-native";

import { AUTH, AUTH_FONT } from "@/components/login/auth-palette";

/** A soft red banner for form-level (server) errors. */
export function ErrorNote({ message }: { message: string }) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{ backgroundColor: AUTH.dangerSoft, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 }}
    >
      <Text style={{ fontFamily: AUTH_FONT.regular, fontSize: 13, lineHeight: 19, color: AUTH.danger }}>
        {message}
      </Text>
    </View>
  );
}
