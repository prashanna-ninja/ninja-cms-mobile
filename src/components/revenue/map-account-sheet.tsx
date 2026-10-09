import * as React from "react";
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMapRevenueAccount, useRevenueClients } from "@/api/revenue.api";
import { C, F, PillButton, errorMessage, text } from "@/components/client-detail/ui";
import { ClientMark } from "@/components/revenue/transaction-row";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useKeyboard } from "@/hooks/use-keyboard";
import { clientTypeLabel } from "@/lib/clients";
import { formatMoney } from "@/lib/format";
import { Check, Link2, Link2Off, Search } from "@/lib/icons";
import { accountLabel } from "@/lib/revenue";
import { useOrgTheme } from "@/providers/org-theme-provider";

/** What the sheet maps: an account group (Map Clients) or a transaction's account (My Revenue). */
export type MappableAccount = {
  accountName: string | null;
  accountNumber: string | null;
  client: { id: string; name: string } | null;
  transactionCount?: number;
  grossAmount?: string;
  netAmount?: string;
};

/**
 * Map an account to one of your clients — web MyMapClientHub's detail panel as a sheet:
 * account summary, current client, a searchable client list, then Map / Change / Unmap.
 * Every transaction of the account moves together. Mount only while open.
 */
export function MapAccountSheet({
  account,
  onClose,
  onDone,
}: {
  account: MappableAccount;
  onClose: () => void;
  /** Called with a short confirmation ("Mapped 3 transactions to R Thompson."). */
  onDone: (message: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboard();
  const { theme } = useOrgTheme();
  const [search, setSearch] = React.useState("");
  const debounced = useDebouncedValue(search.trim(), 300);
  const [picked, setPicked] = React.useState<{ id: string; name: string } | null>(null);

  const clients = useRevenueClients(debounced, true);
  const map = useMapRevenueAccount();
  const current = account.client;
  const ids = { accountName: account.accountName, accountNumber: account.accountNumber };
  const plural = (n: number) => `${n} transaction${n === 1 ? "" : "s"}`;

  const submit = () => {
    if (!picked) return;
    map.mutate(
      { ...ids, clientId: picked.id, remap: !!current },
      {
        onSuccess: ({ count }) => {
          onDone(`Mapped ${plural(count)} to ${picked.name}.`);
          onClose();
        },
      },
    );
  };

  const unmap = () => {
    const go = () =>
      map.mutate(
        { ...ids, clientId: null },
        {
          onSuccess: ({ count }) => {
            onDone(`Unmapped ${plural(count)}.`);
            onClose();
          },
        },
      );
    const msg = `${accountLabel(account)} will no longer be linked to ${current?.name}.`;
    // Alert.alert has no buttons on web — confirm() there.
    if (Platform.OS === "web") {
      if (globalThis.confirm?.(msg) ?? true) go();
      return;
    }
    Alert.alert("Unmap this account?", msg, [
      { text: "Cancel", style: "cancel" },
      { text: "Unmap", style: "destructive", onPress: go },
    ]);
  };

  const sameAsCurrent = !!picked && picked.id === current?.id;

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
            maxHeight: "90%",
          }}
        >
          <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#DCE3EE", marginBottom: 12 }} />

          {/* Account summary — a little statement stub */}
          <View style={{ marginHorizontal: 20, marginBottom: 14, borderRadius: 16, backgroundColor: theme.soft, padding: 14, gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
                <Link2 size={16} color={theme.text} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.bold, fontSize: 17, color: C.ink }} numberOfLines={1}>
                  {accountLabel(account)}
                </Text>
                {account.accountName && account.accountNumber ? <Text style={text.meta}>{account.accountNumber}</Text> : null}
              </View>
            </View>
            {account.transactionCount !== undefined ? (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Fact label="Transactions" value={String(account.transactionCount)} />
                <Fact label="Gross" value={formatMoney(account.grossAmount)} />
                <Fact label="Net" value={formatMoney(account.netAmount)} />
              </View>
            ) : null}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={[text.label, { color: "#5B6B8C" }]}>Currently</Text>
              <ClientMark client={current} />
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, gap: 2, marginBottom: 10 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>{current ? "Change client" : "Map to a client"}</Text>
            <Text style={text.meta}>
              {account.transactionCount !== undefined
                ? `All ${plural(account.transactionCount)} for this account move to the client you pick.`
                : "Every transaction for this account moves to the client you pick."}
            </Text>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, paddingHorizontal: 12, height: 46 }}>
              <Search size={16} color="#8A97B5" strokeWidth={2} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search your clients by name"
                placeholderTextColor="#A3AFC6"
                selectionColor={theme.base}
                autoCorrect={false}
                style={{ flex: 1, fontFamily: F.regular, fontSize: 15, color: C.ink, paddingVertical: 0 }}
              />
              {clients.isFetching && !clients.isPending ? <ActivityIndicator size="small" color="#8A97B5" /> : null}
            </View>

            {clients.isPending ? (
              <ActivityIndicator color={theme.base} style={{ paddingVertical: 20 }} />
            ) : clients.isError ? (
              <Text style={[text.body, { color: C.danger }]}>{errorMessage(clients.error)}</Text>
            ) : clients.data.length === 0 ? (
              <View style={{ backgroundColor: "#F6F8FC", borderRadius: 14, padding: 14 }}>
                <Text style={text.body}>{debounced ? "No clients match that name." : "You don't have any clients yet."}</Text>
              </View>
            ) : (
              clients.data.map((c) => {
                const on = picked?.id === c.id;
                const isCurrent = current?.id === c.id;
                return (
                  <Pressable
                    key={c.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    onPress={() => setPicked(on ? null : { id: c.id, name: c.name })}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      borderWidth: 1.5,
                      borderColor: on ? theme.base : C.border,
                      backgroundColor: on ? theme.soft : "#FFFFFF",
                      borderRadius: 14,
                      paddingHorizontal: 12,
                      paddingVertical: 11,
                    }}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text numberOfLines={1} style={{ fontFamily: F.semibold, fontSize: 15, color: C.ink }}>
                        {c.name}
                      </Text>
                      <Text style={[text.meta, { color: C.muted }]}>{isCurrent ? `${clientTypeLabel(c.type)} · current` : clientTypeLabel(c.type)}</Text>
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
          </ScrollView>

          {map.isError ? <Text style={[text.body, { color: C.danger, paddingHorizontal: 20, paddingTop: 6 }]}>{errorMessage(map.error, "Couldn't save the mapping.")}</Text> : null}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 12 }}>
            {current ? <PillButton label="Unmap" icon={Link2Off} tone="danger" onPress={unmap} disabled={map.isPending} /> : null}
            <View style={{ flex: 1 }} />
            <PillButton label="Cancel" onPress={onClose} disabled={map.isPending} />
            <PillButton
              label={map.isPending ? "Saving…" : current ? "Save" : "Map"}
              filled
              color={theme.base}
              onPress={submit}
              disabled={!picked || sameAsCurrent || map.isPending}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, gap: 1 }}>
      <Text style={{ fontFamily: F.medium, fontSize: 11, color: "#7089B8" }}>{label}</Text>
      <Text style={{ fontFamily: F.semibold, fontSize: 13.5, color: C.ink, fontVariant: ["tabular-nums"] }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}
