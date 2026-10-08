import * as React from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAddWorkflowClient, useAvailableClients } from "@/api/workflows.api";
import { C, F, PillButton, errorMessage, text } from "@/components/client-detail/ui";
import { ClientBadges } from "@/components/workflows/badges";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useKeyboard } from "@/hooks/use-keyboard";
import { Check, Search, UserPlus } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Add to {stage}" — web AddClientDialog as a bottom sheet:
 *  - Existing client: your clients not on this board yet (server search), pick one.
 *  - Create new: name + phone (+ optional email) → a new individual client, added straight to the stage.
 * Each client can only be on a workflow once (the server answers 409). Mount only while open.
 */
export function AddClientSheet({
  adviceId,
  workflowId,
  stage,
  onClose,
  onAdded,
}: {
  adviceId: string;
  workflowId: string;
  stage: { id: string; name: string };
  onClose: () => void;
  onAdded: (placementId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboard();
  const { theme } = useOrgTheme();
  const [mode, setMode] = React.useState<"existing" | "new">("existing");
  const [search, setSearch] = React.useState("");
  const debounced = useDebouncedValue(search.trim(), 300);
  const [picked, setPicked] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  const clients = useAvailableClients(adviceId, workflowId, debounced, mode === "existing");
  const add = useAddWorkflowClient(adviceId, workflowId);

  const newErrors = {
    name: name.trim() ? null : "Name is required",
    phone: !phone.trim() ? "Phone is required" : phone.trim().length > 30 ? "Phone is too long" : null,
    email: email.trim() && !EMAIL_REGEX.test(email.trim()) ? "Enter a valid email address" : null,
  };
  const newValid = !newErrors.name && !newErrors.phone && !newErrors.email;

  const submit = () => {
    if (mode === "existing") {
      if (!picked) return;
      add.mutate({ stageId: stage.id, clientId: picked }, { onSuccess: (r) => onAdded(r.placement.id) });
    } else {
      setTouched(true);
      if (!newValid) return;
      add.mutate(
        { stageId: stage.id, client: { name: name.trim(), phone: phone.trim(), ...(email.trim() ? { email: email.trim() } : {}) } },
        { onSuccess: (r) => onAdded(r.placement.id) },
      );
    }
  };

  const input = (err?: string | null) =>
    ({
      borderWidth: 1,
      borderColor: err ? C.danger : "#DCE3EE",
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 46,
      fontFamily: F.regular,
      fontSize: 15,
      color: C.ink,
      backgroundColor: "#FFFFFF",
    }) as const;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(13,27,62,0.35)" }} />
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom + 14, keyboard.overlap + 12),
            maxHeight: "88%",
          }}
        >
          <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#DCE3EE", marginBottom: 12 }} />
          <View style={{ paddingHorizontal: 20, gap: 2, marginBottom: 12 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 18, color: C.ink }}>{`Add to ${stage.name}`}</Text>
            <Text style={text.meta}>Pick an existing client or create one here. Each person can only be on this workflow once.</Text>
          </View>

          {/* Existing / Create new */}
          <View style={{ flexDirection: "row", backgroundColor: "#E6ECF6", borderRadius: 999, padding: 4, marginHorizontal: 20, marginBottom: 12 }}>
            {(
              [
                ["existing", "Existing client"],
                ["new", "Create new"],
              ] as const
            ).map(([key, label]) => {
              const on = mode === key;
              return (
                <Pressable
                  key={key}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  onPress={() => setMode(key)}
                  style={{ flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 999, backgroundColor: on ? "#FFFFFF" : "transparent" }}
                >
                  <Text style={{ fontFamily: on ? F.semibold : F.medium, fontSize: 14, color: on ? theme.text : "#5B6B8C" }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 6 }}>
            {mode === "existing" ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, paddingHorizontal: 12, height: 46 }}>
                  <Search size={16} color="#8A97B5" strokeWidth={2} />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search your clients"
                    placeholderTextColor="#A3AFC6"
                    selectionColor={theme.base}
                    autoCorrect={false}
                    style={{ flex: 1, fontFamily: F.regular, fontSize: 15, color: C.ink }}
                  />
                </View>
                {clients.isPending ? (
                  <ActivityIndicator color={theme.base} style={{ paddingVertical: 20 }} />
                ) : clients.isError ? (
                  <Text style={[text.body, { color: C.danger }]}>{errorMessage(clients.error)}</Text>
                ) : clients.data.length === 0 ? (
                  <View style={{ backgroundColor: "#F6F8FC", borderRadius: 14, padding: 14 }}>
                    <Text style={text.body}>
                      {debounced ? "No matching clients that aren't on this workflow." : "All your clients are already on this workflow. Create a new one instead."}
                    </Text>
                  </View>
                ) : (
                  clients.data.map((c) => {
                    const on = picked === c.id;
                    return (
                      <Pressable
                        key={c.id}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: on }}
                        onPress={() => setPicked(on ? null : c.id)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                          borderWidth: 1.5,
                          borderColor: on ? theme.base : C.border,
                          backgroundColor: on ? theme.soft : "#FFFFFF",
                          borderRadius: 14,
                          padding: 12,
                        }}
                      >
                        <View style={{ flex: 1, gap: 4 }}>
                          <Text numberOfLines={1} style={{ fontFamily: F.semibold, fontSize: 15, color: C.ink }}>
                            {c.name}
                          </Text>
                          <ClientBadges type={c.type} source={c.source} />
                          {c.email || c.phone ? (
                            <Text numberOfLines={1} style={[text.meta, { color: C.muted }]}>
                              {c.email || c.phone}
                            </Text>
                          ) : null}
                        </View>
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            borderWidth: on ? 0 : 1.5,
                            borderColor: "#C5D0E3",
                            backgroundColor: on ? theme.base : "transparent",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {on ? <Check size={14} color={theme.onBase} strokeWidth={3} /> : null}
                        </View>
                      </Pressable>
                    );
                  })
                )}
              </>
            ) : (
              <>
                <Field label="Name" error={touched ? newErrors.name : null}>
                  <TextInput value={name} onChangeText={setName} placeholder="e.g. Jane Smith" placeholderTextColor="#A3AFC6" selectionColor={theme.base} autoCapitalize="words" style={input(touched ? newErrors.name : null)} />
                </Field>
                <Field label="Phone" error={touched ? newErrors.phone : null}>
                  <TextInput value={phone} onChangeText={setPhone} placeholder="e.g. 0400 123 456" placeholderTextColor="#A3AFC6" selectionColor={theme.base} keyboardType="phone-pad" style={input(touched ? newErrors.phone : null)} />
                </Field>
                <Field label="Email (optional)" error={touched ? newErrors.email : null}>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@example.com"
                    placeholderTextColor="#A3AFC6"
                    selectionColor={theme.base}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={input(touched ? newErrors.email : null)}
                  />
                </Field>
                <Text style={text.meta}>Creates an individual client record and adds them to this stage.</Text>
              </>
            )}

            {add.isError ? (
              <View style={{ backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12 }}>
                <Text style={{ fontFamily: F.regular, fontSize: 14, color: C.danger }}>{errorMessage(add.error)}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, paddingHorizontal: 20, paddingTop: 12 }}>
            <PillButton label="Cancel" onPress={onClose} />
            <PillButton
              label={add.isPending ? "Adding…" : mode === "existing" ? "Add to stage" : "Create and add"}
              icon={UserPlus}
              filled
              color={theme.base}
              disabled={add.isPending || (mode === "existing" ? !picked : touched && !newValid)}
              onPress={submit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, error, children }: { label: string; error?: string | null; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: F.medium, fontSize: 13, color: "#3B4A68" }}>{label}</Text>
      {children}
      {error ? <Text style={{ fontFamily: F.regular, fontSize: 12.5, color: C.danger }}>{error}</Text> : null}
    </View>
  );
}
