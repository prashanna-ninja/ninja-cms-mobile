import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Controller, useForm, useWatch, type Control, type FieldPath } from "react-hook-form";
import { Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from "react-native";

import { PillButton } from "@/components/client-detail/ui";
import { OptionSheet } from "@/components/clients/option-sheet";
import { DateField } from "@/components/forms/date-field";
import { useKeyboard } from "@/hooks/use-keyboard";
import { CLIENT_SOURCES, CLIENT_TYPES, clientSourceLabel, clientTypeLabel, clientTypeStyle } from "@/lib/clients";
import { ChevronDown } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { clientFormSchema, type ClientFormValues } from "@/schemas/client.schema";

const F = { regular: "BricolageGrotesque_400Regular", medium: "BricolageGrotesque_500Medium", semibold: "BricolageGrotesque_600SemiBold", bold: "BricolageGrotesque_700Bold" };

/**
 * Add / edit client — the web's AddClientRecordForm on a phone:
 * Type · Source · display name · (Individual: first + last name, DOB | others: ABN) ·
 * email · phone · address (street, suburb, state, postcode). The display name fills in
 * from first + last name until you edit it yourself.
 */
export function ClientForm({
  initial,
  submitLabel,
  submitting,
  serverError,
  onSubmit,
  onCancel,
}: {
  initial: ClientFormValues;
  submitLabel: string;
  submitting: boolean;
  serverError?: string | null;
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
}) {
  const { theme } = useOrgTheme();
  const keyboard = useKeyboard();
  const [sourceOpen, setSourceOpen] = React.useState(false);
  const nameTouched = React.useRef(!!initial.name);

  const { control, handleSubmit, getValues, setValue, formState } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: initial,
  });
  const type = useWatch({ control, name: "type" });
  const source = useWatch({ control, name: "source" });
  const isIndividual = type === "individual";

  // Auto display name for individuals ("Jane Smith"), until the user edits it.
  const syncName = (first: string, last: string) => {
    if (!nameTouched.current) setValue("name", `${first} ${last}`.trim(), { shouldValidate: formState.isSubmitted });
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 + keyboard.overlap }}
    >
      <View style={{ gap: 8 }}>
        <Label>Client type</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {CLIENT_TYPES.map((t) => {
                const active = field.value === t;
                const s = clientTypeStyle(t);
                return (
                  <Pressable
                    key={t}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => field.onChange(t)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: 999,
                      borderWidth: 1.5,
                      borderColor: active ? s.fg : "#DCE3EE",
                      backgroundColor: active ? s.bg : "#FFFFFF",
                    }}
                  >
                    <Text style={{ fontFamily: active ? F.semibold : F.medium, fontSize: 14, color: active ? s.fg : "#3B4A68" }}>{clientTypeLabel(t)}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Label>Source</Label>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSourceOpen(true)}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, paddingHorizontal: 12, height: 46, backgroundColor: "#FFFFFF" }}
        >
          <Text style={{ fontFamily: F.regular, fontSize: 15, color: "#0D1B3E" }}>{clientSourceLabel(source)}</Text>
          <ChevronDown size={16} color="#6B7A99" strokeWidth={2.2} />
        </Pressable>
      </View>

      {isIndividual ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field control={control} name="firstName" label="First name" autoCapitalize="words" onChangeExtra={(v) => syncName(v, getValues("lastName"))} />
          </View>
          <View style={{ flex: 1 }}>
            <Field control={control} name="lastName" label="Last name" autoCapitalize="words" onChangeExtra={(v) => syncName(getValues("firstName"), v)} />
          </View>
        </View>
      ) : null}

      <Field
        control={control}
        name="name"
        label={isIndividual ? "Full name (display)" : "Name"}
        placeholder={isIndividual ? "e.g. Jane Smith" : "Legal entity name"}
        autoCapitalize="words"
        onChangeExtra={() => {
          nameTouched.current = true;
        }}
      />

      {!isIndividual ? <Field control={control} name="abn" label="ABN" keyboardType="number-pad" /> : null}

      <Field control={control} name="email" label="Email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <Field control={control} name="phone" label="Phone" keyboardType="phone-pad" />

      {isIndividual ? (
        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field }) => (
            <DateField label="Date of birth" value={field.value} onChange={field.onChange} maxYear={new Date().getFullYear()} />
          )}
        />
      ) : null}

      <View style={{ gap: 10 }}>
        <Label>Address</Label>
        <Field control={control} name="addressLine1" placeholder="Street" autoCapitalize="words" />
        <Field control={control} name="addressTown" placeholder="Suburb" autoCapitalize="words" />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field control={control} name="state" placeholder="State" autoCapitalize="characters" />
          </View>
          <View style={{ flex: 1 }}>
            <Field control={control} name="addressPostcode" placeholder="Postcode" keyboardType="number-pad" />
          </View>
        </View>
      </View>

      {serverError ? (
        <View style={{ backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12 }}>
          <Text style={{ fontFamily: F.regular, fontSize: 14, color: "#DC2626" }}>{serverError}</Text>
        </View>
      ) : null}

      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
        <PillButton label="Cancel" onPress={onCancel} />
        <PillButton label={submitting ? "Saving…" : submitLabel} filled color={theme.base} disabled={submitting} onPress={handleSubmit(onSubmit)} />
      </View>

      <OptionSheet
        visible={sourceOpen}
        title="Source"
        value={source}
        options={CLIENT_SOURCES.map((s) => ({ value: s, label: clientSourceLabel(s) }))}
        onSelect={(v) => setValue("source", v)}
        onClose={() => setSourceOpen(false)}
      />
    </ScrollView>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={{ fontFamily: F.medium, fontSize: 13, color: "#3B4A68" }}>{children}</Text>;
}

function Field({
  control,
  name,
  label,
  onChangeExtra,
  ...input
}: {
  control: Control<ClientFormValues>;
  name: FieldPath<ClientFormValues>;
  label?: string;
  onChangeExtra?: (value: string) => void;
} & Omit<TextInputProps, "value" | "onChangeText">) {
  const { theme } = useOrgTheme();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={{ gap: 6 }}>
          {label ? <Label>{label}</Label> : null}
          <TextInput
            value={field.value}
            onChangeText={(v) => {
              field.onChange(v);
              onChangeExtra?.(v);
            }}
            onBlur={field.onBlur}
            placeholderTextColor="#A3AFC6"
            selectionColor={theme.base}
            style={{
              borderWidth: 1,
              borderColor: fieldState.error ? "#DC2626" : "#DCE3EE",
              borderRadius: 12,
              paddingHorizontal: 12,
              height: 46,
              fontFamily: F.regular,
              fontSize: 15,
              color: "#0D1B3E",
              backgroundColor: "#FFFFFF",
            }}
            {...input}
          />
          {fieldState.error ? <Text style={{ fontFamily: F.regular, fontSize: 12.5, color: "#DC2626" }}>{fieldState.error.message}</Text> : null}
        </View>
      )}
    />
  );
}
