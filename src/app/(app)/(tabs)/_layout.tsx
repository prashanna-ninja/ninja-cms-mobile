import { Tabs, type BottomTabBarButtonProps } from "expo-router/js-tabs";
import * as React from "react";
import { Pressable, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChartLine, LayoutDashboard, Settings, Users, Workflow } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

function TabIcon({ icon: Icon, color, focused }: { icon: IconComponent; color: ColorValue; focused: boolean }) {
  return <Icon size={22} color={String(color)} strokeWidth={focused ? 2.4 : 1.9} />;
}

/**
 * Tab button without the "big bubble".
 *
 * React Navigation's default tab button sets `android_ripple: { borderless: true }`
 * (BottomTabItem.js) — a borderless ripple isn't clipped to the button, so it
 * spreads as a large circle over the bar and screen on every tap. This button
 * drops the ripple and just dims slightly while pressed.
 *
 * ⚠️ Pressed state is tracked by hand and passed as a plain style — NativeWind
 * drops Pressable's function `style` (see auth-button.tsx).
 */
function TabButton({
  children,
  style,
  onPressIn,
  onPressOut,
  // Drop the default press effects (ripple / web hover), the web-only href, and the
  // ref (typed for PlatformPressable; the tab bar doesn't need it).
  ref: _ref,
  android_ripple: _ripple,
  pressColor: _pressColor,
  pressOpacity: _pressOpacity,
  hoverEffect: _hoverEffect,
  href: _href,
  ...rest
}: BottomTabBarButtonProps) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      // paddingVertical 2 (default 5): the button holds a fixed 28pt icon box, and the
      // default padding left the label ~9pt — too short for Bricolage's descenders.
      style={[style, { paddingVertical: 2, opacity: pressed ? 0.55 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

/**
 * The portal's bottom tabs, in the active org's colour (`theme.logoTint` — the
 * org colour, darkened only if too pale to read on the white bar).
 *
 *   Dashboard · Clients · Workflows · Revenue · Settings
 *
 * JS tabs (`expo-router/js-tabs`) rather than NativeTabs: still "unstable" in
 * SDK 57, and JS tabs take lucide icons + any tint colour directly.
 * Each screen renders its own AppHeader (headerShown: false).
 *
 * Later: hide tabs the user can't use, from the per-user CMS feature flags
 * (`clientRecordsEnabled`, `workflowsEnabled`, `revenueVisibilityEnabled`) — the
 * web shows those portal sections only when enabled. See docs/11-NAVIGATION.md.
 */
export default function TabsLayout() {
  const { theme } = useOrgTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: (props) => <TabButton {...props} />,
        tabBarActiveTintColor: theme.logoTint,
        tabBarInactiveTintColor: "#8A97B5",
        // Room for Bricolage's descenders (the g in "Settings"): the default bar squeezed the
        // label to ~7pt (overflow hidden). 62pt of content + the home-indicator inset; the
        // button's own padding is slimmed in TabButton.
        tabBarLabelStyle: { fontFamily: "BricolageGrotesque_500Medium", fontSize: 11, lineHeight: 15 },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F2",
          height: 62 + insets.bottom,
          paddingTop: 4,
          paddingBottom: insets.bottom + 2,
        },
        // Same as bg-background, so switching tabs never flashes white/grey.
        sceneStyle: { backgroundColor: "#F0F4FB" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => <TabIcon icon={LayoutDashboard} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          tabBarIcon: ({ color, focused }) => <TabIcon icon={Users} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="workflows"
        options={{
          title: "Workflows",
          tabBarIcon: ({ color, focused }) => <TabIcon icon={Workflow} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="revenue"
        options={{
          title: "Revenue",
          tabBarIcon: ({ color, focused }) => <TabIcon icon={ChartLine} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => <TabIcon icon={Settings} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
