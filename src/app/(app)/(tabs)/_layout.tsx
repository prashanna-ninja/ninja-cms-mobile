import { Tabs } from "expo-router/js-tabs";
import * as React from "react";
import type { ColorValue } from "react-native";

import { ChartLine, LayoutDashboard, Users, Workflow } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

function TabIcon({ icon: Icon, color, focused }: { icon: IconComponent; color: ColorValue; focused: boolean }) {
  return <Icon size={22} color={String(color)} strokeWidth={focused ? 2.4 : 1.9} />;
}

/**
 * The portal's bottom tabs, in the active org's colour (`theme.logoTint` — the
 * org colour, darkened only if too pale to read on the white bar).
 *
 *   Dashboard · Clients · Workflows · Revenue
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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.logoTint,
        tabBarInactiveTintColor: "#8A97B5",
        tabBarLabelStyle: { fontFamily: "BricolageGrotesque_500Medium", fontSize: 11 },
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: "#E2E8F2" },
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
    </Tabs>
  );
}
