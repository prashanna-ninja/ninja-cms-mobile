import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";

import { describeAuthError, useSignIn } from "@/api/auth.api";
import { AuthButton } from "@/components/login/auth-button";
import { AuthField } from "@/components/login/auth-field";
import { AUTH, AUTH_FONT } from "@/components/login/auth-palette";
import { ErrorNote } from "@/components/login/error-note";
import { FadeIn } from "@/components/login/fade-in";
import { Lock, Mail, ShieldCheck } from "@/lib/icons";
import { signInSchema } from "@/schemas/auth.schema";
import type { SignInInput, SignInValues } from "@/types/auth.types";

/**
 * Email + password sign-in (the CMS has no magic link / sign-up — see docs/06-AUTH.md).
 * On success the session provider refetches, and Stack.Protected moves to (app).
 */
export function LoginForm() {
  const passwordRef = React.useRef<TextInput>(null);
  const signIn = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput, unknown, SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const submitting = signIn.isPending;
  const formError = signIn.isError ? describeAuthError(signIn.error) : null;

  const onSubmit = handleSubmit((values) => {
    if (submitting) return;
    signIn.mutate(values);
  });

  // Editing either field clears a stale server error.
  const clearServerError = () => {
    if (signIn.isError) signIn.reset();
  };

  return (
    <View style={{ gap: 22 }}>
      <FadeIn delay={180}>
        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontFamily: AUTH_FONT.bold,
              fontSize: 25,
              lineHeight: 31,
              letterSpacing: -0.5,
              color: AUTH.ink,
            }}
          >
            Sign in to your account
          </Text>
          <Text
            style={{ fontFamily: AUTH_FONT.regular, fontSize: 15, lineHeight: 23, color: AUTH.inkSoft }}
          >
            Use the email and password you sign in to the adviser portal with.
          </Text>
        </View>
      </FadeIn>

      <FadeIn delay={240}>
        <View style={{ gap: 16 }}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Email address"
                icon={Mail}
                placeholder="you@company.com"
                value={value}
                onChangeText={(text) => {
                  clearServerError();
                  onChange(text);
                }}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                // "username" (not emailAddress) pairs with the password field so
                // iOS Keychain / Android autofill offer saved logins.
                textContentType="username"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!submitting}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                ref={passwordRef}
                secure
                label="Password"
                icon={Lock}
                placeholder="Your password"
                value={value}
                onChangeText={(text) => {
                  clearServerError();
                  onChange(text);
                }}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={onSubmit}
                editable={!submitting}
                error={errors.password?.message}
              />
            )}
          />

          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/forgot-password")}
            hitSlop={10}
            style={{ alignSelf: "flex-end", marginTop: -4 }}
          >
            <Text style={{ fontFamily: AUTH_FONT.semibold, fontSize: 14, color: AUTH.brand }}>
              Forgot password?
            </Text>
          </Pressable>

          {formError ? <ErrorNote message={formError} /> : null}

          <AuthButton
            label={submitting ? "Signing in…" : "Login"}
            loading={submitting}
            onPress={onSubmit}
          />

          <View
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }}
          >
            <ShieldCheck size={14} color={AUTH.muted} strokeWidth={2} />
            <Text style={{ fontFamily: AUTH_FONT.regular, fontSize: 13, color: AUTH.muted }}>
              Secure, encrypted sign-in
            </Text>
          </View>
        </View>
      </FadeIn>
    </View>
  );
}
