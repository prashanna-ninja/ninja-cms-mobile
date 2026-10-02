import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { NINJA_CMS_BLUE, NinjaCmsLogo } from "@/components/brand/ninja-cms-logo";
import { Container } from "@/components/container";
import { Screen } from "@/components/screen";
import { Building, LogOut, RefreshCw } from "@/lib/icons";
import { useSession } from "@/providers/session-provider";

/**
 * Full-screen states shown by the (app) org gate before an org is active.
 * Neutral Ninja CMS branding on purpose — there is no org yet. Copy for
 * "no organisations" mirrors the web (CMS app/portal/page.tsx).
 */

function SignOutLink() {
  const { signOut } = useSession();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => void signOut()}
      hitSlop={10}
      className="flex-row items-center gap-2 self-center px-4 py-2"
    >
      <LogOut size={15} color="#6B7A99" strokeWidth={2} />
      <Text className="font-sans-medium text-muted-foreground text-sm">Sign out</Text>
    </Pressable>
  );
}

function GateMessage({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <Screen edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <Container className="flex-1 items-center justify-center gap-5">
        <View className="bg-secondary h-16 w-16 items-center justify-center rounded-full">{icon}</View>
        <View className="items-center gap-1.5">
          <Text className="font-sans-semibold text-foreground text-center text-lg">{title}</Text>
          <Text className="font-sans text-muted-foreground text-center text-sm leading-5">{body}</Text>
        </View>
        {action}
        <SignOutLink />
      </Container>
    </Screen>
  );
}

/** Loading the user's organisations (first sign-in on this device). */
export function OrgGateLoading() {
  return (
    <Screen edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center gap-6">
        <NinjaCmsLogo width={132} color={NINJA_CMS_BLUE} />
        <ActivityIndicator color={NINJA_CMS_BLUE} />
      </View>
    </Screen>
  );
}

export function NoOrganisations() {
  return (
    <GateMessage
      icon={<Building size={26} color={NINJA_CMS_BLUE} />}
      title="No organisations assigned"
      body="You have not been assigned to any advice yet. Contact your administrator."
    />
  );
}

/** editor / user roles — back office only on the web (CMS lib/staff.ts canAccessPortal). */
export function NotAPortalUser() {
  return (
    <GateMessage
      icon={<Building size={26} color={NINJA_CMS_BLUE} />}
      title="This app is for the adviser portal"
      body="Your account uses the Ninja CMS back office. Please sign in on the web instead."
    />
  );
}

export function OrgsLoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <GateMessage
      icon={<RefreshCw size={24} color={NINJA_CMS_BLUE} />}
      title="Couldn't load your organisations"
      body={message}
      action={
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          className="bg-primary rounded-full px-6 py-3"
        >
          <Text className="font-sans-semibold text-primary-foreground text-sm">Try again</Text>
        </Pressable>
      }
    />
  );
}
