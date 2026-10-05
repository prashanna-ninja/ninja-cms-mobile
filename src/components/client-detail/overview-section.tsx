import * as React from "react";
import { Alert, Linking, Pressable, Text, TextInput, View } from "react-native";

import {
  useClientPartner,
  useClientTags,
  useClientWorkflows,
  useLinkPartner,
  usePartnerSearch,
  useSetClientTags,
  useUnlinkPartner,
  useUpdateClientSource,
} from "@/api/client-detail.api";
import { Card, C, F, InfoRow, Loading, PillButton, text } from "@/components/client-detail/ui";
import { OptionSheet } from "@/components/clients/option-sheet";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { CLIENT_SOURCES, clientSourceLabel } from "@/lib/clients";
import { formatCalendarDate } from "@/lib/format";
import {
  Building,
  Calendar,
  Check,
  ChevronDown,
  Compass,
  GitBranch,
  IdCard,
  Landmark,
  Link2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Tag,
  UserRound,
  Users,
  X,
} from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { ClientDetail } from "@/types/client-detail.types";

type Props = { client: ClientDetail; adviceId: string; adviserName?: string; onOpenClient: (id: string, name: string) => void };

const alertError = (err: unknown) => Alert.alert("Something went wrong", err instanceof Error ? err.message : "Please try again.");

/** Overview — web ClientRecordDetail overview tab: Contact, Details, Partner, Tags, Workflows. */
export function OverviewSection({ client, adviceId, adviserName, onOpenClient }: Props) {
  const { org } = useOrgTheme();
  const address = [client.addressLine1, client.addressTown, client.state, client.addressPostcode].filter(Boolean).join(", ");
  const legalName = `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim();

  return (
    <View style={{ gap: 14 }}>
      <Card icon={Mail} iconBg="#EFF6FF" iconFg="#2563EB" title="Contact">
        <InfoRow icon={Mail} label="Email" value={client.email} onPress={client.email ? () => void Linking.openURL(`mailto:${client.email}`) : undefined} />
        <InfoRow icon={Phone} label="Phone" value={client.phone} onPress={client.phone ? () => void Linking.openURL(`tel:${client.phone!.replace(/\s+/g, "")}`) : undefined} />
        <InfoRow
          icon={MapPin}
          label="Address"
          value={address || null}
          onPress={address ? () => void Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(address)}`) : undefined}
          last
        />
        {!client.email && !client.phone && !address ? <Text style={[text.meta, { paddingVertical: 8 }]}>No contact details.</Text> : null}
      </Card>

      <Card icon={IdCard} title="Details">
        <InfoRow icon={Building} label="Organisation" value={org?.name} />
        <InfoRow icon={UserRound} label="Adviser" value={adviserName} />
        <InfoRow icon={IdCard} label="Legal name" value={legalName || null} />
        <SourceRow client={client} adviceId={adviceId} />
        <InfoRow icon={Landmark} label="ABN" value={client.abn} />
        <InfoRow icon={Calendar} label="Date of birth" value={client.dateOfBirth ? formatCalendarDate(client.dateOfBirth) : null} last />
      </Card>

      <PartnerCard clientId={client.id} adviceId={adviceId} onOpenClient={onOpenClient} />
      <TagsCard clientId={client.id} adviceId={adviceId} />
      <WorkflowsCard clientId={client.id} adviceId={adviceId} />
    </View>
  );
}

/** Source — always shown and editable (web ClientSourceEditor: a select → PATCH {source}). */
function SourceRow({ client, adviceId }: { client: ClientDetail; adviceId: string }) {
  const [open, setOpen] = React.useState(false);
  const update = useUpdateClientSource(adviceId, client.id);
  return (
    <>
      <InfoRow icon={Compass} label="Source">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Source: ${clientSourceLabel(client.source)}. Change`}
          onPress={() => setOpen(true)}
          disabled={update.isPending}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 2 }}
        >
          <Text style={text.value}>{update.isPending ? "Saving…" : clientSourceLabel(update.variables ?? client.source)}</Text>
          <ChevronDown size={16} color="#6B7A99" strokeWidth={2.2} />
        </Pressable>
      </InfoRow>
      <OptionSheet
        visible={open}
        title="Source"
        value={client.source}
        options={CLIENT_SOURCES.map((s) => ({ value: s, label: clientSourceLabel(s) }))}
        onSelect={(source) => {
          if (source !== client.source) update.mutate(source, { onError: alertError });
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/** Partner — linked partner (tap to open, remove link) or search + link (web ClientPartnerCard). */
function PartnerCard({ clientId, adviceId, onOpenClient }: { clientId: string; adviceId: string; onOpenClient: Props["onOpenClient"] }) {
  const { theme } = useOrgTheme();
  const partner = useClientPartner(adviceId, clientId);
  const [q, setQ] = React.useState("");
  const debounced = useDebouncedValue(q.trim(), 300);
  const results = usePartnerSearch(adviceId, clientId, debounced);
  const link = useLinkPartner(adviceId, clientId);
  const unlink = useUnlinkPartner(adviceId, clientId);

  const confirmUnlink = () =>
    Alert.alert("Remove partner link?", "Both client records stay — only the link between them is removed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove link", style: "destructive", onPress: () => unlink.mutate(undefined, { onError: alertError }) },
    ]);

  return (
    <Card icon={Users} title="Partner">
      {partner.isPending ? (
        <Text style={[text.meta, { paddingVertical: 8 }]}>Loading partner…</Text>
      ) : partner.data ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 }}>
          <Pressable style={{ flex: 1, gap: 2 }} accessibilityRole="link" onPress={() => onOpenClient(partner.data!.id, partner.data!.name)}>
            <Text style={[text.value, { color: theme.text, textDecorationLine: "underline" }]}>{partner.data.name}</Text>
            {partner.data.email ? <Text style={text.meta}>{partner.data.email}</Text> : null}
            <Text style={text.meta}>Separate client record</Text>
          </Pressable>
          <PillButton label="Remove link" icon={X} onPress={confirmUnlink} disabled={unlink.isPending} />
        </View>
      ) : (
        <View style={{ gap: 10, paddingTop: 2 }}>
          <Text style={text.body}>No partner linked. Both records stay separate.</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, paddingHorizontal: 10, height: 42 }}>
            <Search size={15} color="#8A97B5" strokeWidth={2} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search clients by name or email"
              placeholderTextColor="#A3AFC6"
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={theme.base}
              style={{ flex: 1, fontFamily: F.regular, fontSize: 14.5, color: C.ink, paddingVertical: 0 }}
            />
          </View>
          {debounced.length >= 2 ? (
            results.isPending ? (
              <Text style={text.meta}>Searching…</Text>
            ) : results.isError ? (
              <Text style={[text.meta, { color: C.danger }]}>{results.error.message}</Text>
            ) : results.data?.length ? (
              results.data.map((c) => (
                <View key={c.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={text.value}>{c.name}</Text>
                    {c.email ? <Text style={text.meta}>{c.email}</Text> : null}
                  </View>
                  <PillButton
                    label="Link"
                    icon={Link2}
                    disabled={link.isPending}
                    onPress={() => link.mutate(c.id, { onSuccess: () => setQ(""), onError: alertError })}
                  />
                </View>
              ))
            ) : (
              <Text style={text.meta}>No clients available to link.</Text>
            )
          ) : null}
        </View>
      )}
    </Card>
  );
}

/** Tags — chips with remove, "Add tag" with suggestions (web ClientRecordTagsEditor; PUT full name list, max 20). */
function TagsCard({ clientId, adviceId }: { clientId: string; adviceId: string }) {
  const { theme } = useOrgTheme();
  const tags = useClientTags(adviceId, clientId);
  const save = useSetClientTags(adviceId, clientId);
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const current = tags.data?.tags ?? [];
  const names = current.map((t) => t.name);

  const apply = (next: string[]) => save.mutate(next, { onError: alertError });
  const add = (name: string) => {
    const n = name.trim().slice(0, 40);
    if (!n || names.some((x) => x.toLowerCase() === n.toLowerCase())) return;
    apply([...names, n]);
    setDraft("");
  };
  const suggestions = (tags.data?.availableTags ?? [])
    .filter((t) => !names.includes(t.name) && t.name.toLowerCase().includes(draft.trim().toLowerCase()))
    .slice(0, 8);

  return (
    <Card
      icon={Tag}
      title="Tags"
      right={
        !adding && current.length < 20 ? (
          <PillButton label="Add tag" icon={Plus} onPress={() => setAdding(true)} />
        ) : null
      }
    >
      {tags.isPending ? (
        <Text style={[text.meta, { paddingVertical: 8 }]}>Loading tags…</Text>
      ) : (
        <View style={{ gap: 12, paddingTop: 4 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {current.length === 0 ? <Text style={text.meta}>No tags</Text> : null}
            {current.map((tag) => {
              const color = tag.color ?? theme.base;
              return (
                <View key={tag.id} style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: `${color}55`, borderRadius: 999, paddingLeft: 10, paddingRight: 6, paddingVertical: 4 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
                  <Text style={{ fontFamily: F.medium, fontSize: 13, color }}>{tag.name}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Remove tag ${tag.name}`} hitSlop={8} disabled={save.isPending} onPress={() => apply(names.filter((n) => n !== tag.name))}>
                    <X size={13} color={color} strokeWidth={2.4} />
                  </Pressable>
                </View>
              );
            })}
          </View>

          {adding ? (
            <View style={{ gap: 10, borderTopWidth: 1, borderTopColor: C.hairline, paddingTop: 12 }}>
              <Text style={text.meta}>Tags stay on this client, whether or not workflows are turned on.</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="e.g. Priority, Referral"
                  placeholderTextColor="#A3AFC6"
                  maxLength={40}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => add(draft)}
                  selectionColor={theme.base}
                  style={{ flex: 1, borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 10, paddingHorizontal: 12, height: 40, fontFamily: F.regular, fontSize: 14.5, color: C.ink }}
                />
                <PillButton label="Add" filled color={theme.base} onPress={() => add(draft)} disabled={!draft.trim() || save.isPending} />
                <PillButton label="Done" onPress={() => { setAdding(false); setDraft(""); }} />
              </View>
              {suggestions.length ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {suggestions.map((s) => (
                    <PillButton key={s.id} label={s.name} icon={Plus} onPress={() => add(s.name)} disabled={save.isPending} />
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
    </Card>
  );
}

/** Workflows — read-only memberships (web ClientWorkflowsCard). Adding to a workflow comes later. */
function WorkflowsCard({ clientId, adviceId }: { clientId: string; adviceId: string }) {
  const { theme } = useOrgTheme();
  const wf = useClientWorkflows(adviceId, clientId);
  const memberships = wf.data?.memberships ?? [];
  if (wf.data && wf.data.workflowsEnabled === false && memberships.length === 0) return null;

  return (
    <Card icon={GitBranch} iconBg={theme.soft} iconFg={theme.text} title="Workflows">
      {wf.isPending ? (
        <Loading />
      ) : memberships.length === 0 ? (
        <Text style={[text.body, { paddingVertical: 4 }]}>Not on a workflow yet.</Text>
      ) : (
        <View style={{ gap: 12, paddingTop: 4 }}>
          {memberships.map((m) => (
            <View key={m.placementId} style={{ borderWidth: 1, borderColor: C.hairline, borderRadius: 14, padding: 12, gap: 8 }}>
              <View>
                <Text style={text.value}>{m.workflowName}</Text>
                <Text style={text.meta}>
                  {m.stageName}
                  {m.totalCount > 0 ? ` · ${m.doneCount}/${m.totalCount} stage items` : ""}
                </Text>
              </View>
              {m.stageChecklist.length ? (
                <View style={{ gap: 6 }}>
                  {m.stageChecklist.map((item) => (
                    <View key={item.itemId} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
                      <Check size={15} color={item.done ? "#059669" : "#CBD5E1"} strokeWidth={2.6} style={{ marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={[text.body, item.done ? { textDecorationLine: "line-through", color: C.faint } : null]}>{item.title}</Text>
                        {item.assignedTo || item.dueOn ? (
                          <Text style={text.meta}>{[item.assignedTo?.name, item.dueOn ? formatCalendarDate(item.dueOn) : null].filter(Boolean).join(" · ")}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={text.meta}>No checklist on this stage.</Text>
              )}
              {m.comments.length ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <MessageSquare size={13} color="#8A97B5" strokeWidth={2} />
                  <Text style={text.meta}>{`${m.comments.length} comment${m.comments.length === 1 ? "" : "s"} · latest by ${m.comments[0].authorName}`}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

