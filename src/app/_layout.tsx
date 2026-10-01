import "../global.css";

import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme, View } from "react-native";

import { appFonts } from "@/lib/fonts";
import { QueryProvider } from "@/providers/query-provider";
import { OrgThemeProvider } from "@/providers/org-theme-provider";
import { SessionProvider, useSession } from "@/providers/session-provider";

SplashScreen.preventAutoHideAsync();

/** Matches the splash background (app.json) so the hand-over is invisible. */
const BOOT_BACKGROUND = "#0B2D6F";

function RootNavigator() {
  const colorScheme = useColorScheme();
  // `fontError` lets us fail open (system font) instead of hanging on a bad asset.
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session?.user;

  // Hold until BOTH the stored session has resolved and fonts are ready —
  // otherwise sign-in flashes before the guard redirects a signed-in user.
  const isBooting = isPending || (!fontsLoaded && !fontError);

  useEffect(() => {
    if (!isBooting) SplashScreen.hideAsync();
  }, [isBooting]);

  if (isBooting) return <View style={{ flex: 1, backgroundColor: BOOT_BACKGROUND }} />;

  // Guarded stacks: only ONE group is reachable at a time. When the session
  // appears/disappears, Expo Router redirects automatically — no manual <Redirect>.
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <SessionProvider>
        {/* Org colour + logo for the signed-in area (docs/07-ORG-THEMING.md). */}
        <OrgThemeProvider>
          <RootNavigator />
        </OrgThemeProvider>
      </SessionProvider>
    </QueryProvider>
  );
}
