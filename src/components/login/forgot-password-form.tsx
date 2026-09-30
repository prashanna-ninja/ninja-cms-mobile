import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

import { describeAuthError, useRequestPasswordReset } from "@/api/auth.api";
import { AuthButton } from "@/components/login/auth-button";
import { AuthField } from "@/components/login/auth-field";
import { AUTH, AUTH_FONT } from "@/components/login/auth-palette";
import { ErrorNote } from "@/components/login/error-note";
import { FadeIn } from "@/components/login/fade-in";
import { ArrowLeft, Mail, MailCheck } from "@/lib/icons";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import type { ForgotPasswordInput, ForgotPasswordValues } from "@/types/auth.types";

/** CMS `resetPasswordTokenExpiresIn: 48h` (lib/auth.ts). Say it on the screen. */
const LINK_TTL_HOURS = 48;

const titleStyle = {
  fontFamily: AUTH_FONT.bold,
  fontSize: 25,
  lineHeight: 31,
  letterSpacing: -0.5,
  color: AUTH.ink,
} as const;

const bodyStyle = {
  fontFamily: AUTH_FONT.regular,
  fontSize: 15,
  lineHeight: 23,
  color: AUTH.inkSoft,
} as const;

function goBackToSignIn() {
  if (router.canGoBack()) router.back();
  else router.replace("/sign-in");
}

/**
 * Request a password-reset email. The CMS sends a branded link that opens the
 * WEB reset page; the new password is set in the browser, then they sign in here.
 *
 * The confirmation never says whether the account exists (no account enumeration).
 */
export function ForgotPasswordForm() {
  const request = useRequestPasswordReset();
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput, unknown, ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const submitting = request.isPending;
  const formError = request.isError ? describeAuthError(request.error) : null;

  const onSubmit = handleSubmit((values) => {
    if (submitting) return;
    request.mutate(values, { onSuccess: () => setSentTo(values.email) });
  });

  if (sentTo) {
    return (
      <View style={{ gap: 22 }}>
        <FadeIn delay={60}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: AUTH.brandSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MailCheck size={24} color={AUTH.brand} strokeWidth={2} />
          </View>
        </FadeIn>

        <FadeIn delay={120}>
          <View style={{ gap: 8 }}>
            <Text style={titleStyle}>Check your inbox</Text>
            <Text style={bodyStyle}>If an account exists for</Text>
            <Text
              selectable
              style={{ fontFamily: AUTH_FONT.semibold, fontSize: 17, lineHeight: 23, color: AUTH.ink }}
            >
              {sentTo}
            </Text>
            <Text style={bodyStyle}>
              {`we've sent a link to set a new password. It opens in your browser and expires in ${LINK_TTL_HOURS} hours. Check spam if it's not there.`}
            </Text>
          </View>
        </FadeIn>

        <FadeIn delay={180}>
          <View style={{ gap: 4 }}>
            <AuthButton label="Back to sign in" onPress={goBackToSignIn} />
            <AuthButton
              variant="quiet"
              label="Use a different email"
              onPress={() => {
                request.reset();
                setSentTo(null);
              }}
            />
          </View>
        </FadeIn>
      </View>
    );
  }

  return (
    <View style={{ gap: 22 }}>
      <FadeIn delay={120}>
        <View style={{ gap: 14 }}>
          {/* Plain style OBJECT, not the function form — see auth-button.tsx. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
            onPress={goBackToSignIn}
            hitSlop={12}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: AUTH.line,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={18} color={AUTH.inkSoft} strokeWidth={2.2} />
          </Pressable>

          <View style={{ gap: 10 }}>
            <Text style={titleStyle}>Reset your password</Text>
            <Text style={bodyStyle}>
              {"Enter your account email and we'll send you a secure link to set a new password."}
            </Text>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={200}>
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
                  if (request.isError) request.reset();
                  onChange(text);
                }}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                editable={!submitting}
                error={errors.email?.message}
              />
            )}
          />

          {formError ? <ErrorNote message={formError} /> : null}

          <AuthButton
            label={submitting ? "Sending link…" : "Send reset link"}
            loading={submitting}
            onPress={onSubmit}
          />
        </View>
      </FadeIn>
    </View>
  );
}
