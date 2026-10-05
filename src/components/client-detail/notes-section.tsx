import * as React from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { useAddNote, useClientNotes, useDeleteNote } from "@/api/client-detail.api";
import { C, Card, Empty, ErrorNote, F, Loading, PillButton, text } from "@/components/client-detail/ui";
import { formatDateTime } from "@/lib/format";
import { MessageSquarePlus, StickyNote, Trash } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

const MAX = 5000;

/**
 * File Notes — web ClientNotesTab: write a plain-text note (≤ 5000), list newest
 * first (author · date/time), delete with confirm. No editing (same as the web).
 */
export function NotesSection({ adviceId, clientId }: { adviceId: string; clientId: string }) {
  const { theme } = useOrgTheme();
  const notes = useClientNotes(adviceId, clientId);
  const add = useAddNote(adviceId, clientId);
  const remove = useDeleteNote(adviceId, clientId);
  const [draft, setDraft] = React.useState("");

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    add.mutate(body, {
      onSuccess: () => setDraft(""),
      onError: (e) => Alert.alert("Couldn't add note", e.message),
    });
  };

  const confirmDelete = (id: string) =>
    Alert.alert("Delete note?", "This note will be removed from the client record.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate(id, { onError: (e) => Alert.alert("Couldn't delete", e.message) }) },
    ]);

  return (
    <View style={{ gap: 14 }}>
      <Card icon={MessageSquarePlus} iconBg="#F5F3FF" iconFg="#7C3AED" title="Write a note">
        <View style={{ gap: 10, paddingTop: 4 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="What should the team know about this client?"
            placeholderTextColor="#A3AFC6"
            multiline
            maxLength={MAX}
            textAlignVertical="top"
            selectionColor={theme.base}
            style={{ minHeight: 96, borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, padding: 12, fontFamily: F.regular, fontSize: 15, lineHeight: 21, color: C.ink }}
          />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={text.meta}>{`${draft.length} / ${MAX}`}</Text>
            <PillButton
              label={add.isPending ? "Adding…" : "Add note"}
              icon={MessageSquarePlus}
              filled
              color={theme.base}
              disabled={!draft.trim() || add.isPending}
              onPress={submit}
            />
          </View>
        </View>
      </Card>

      <Text style={[text.label, { letterSpacing: 1, marginLeft: 4 }]}>ALL NOTES</Text>
      {notes.isPending ? (
        <Loading />
      ) : notes.isError ? (
        <ErrorNote message={notes.error.message} onRetry={() => void notes.refetch()} />
      ) : notes.data.length === 0 ? (
        <Empty icon={StickyNote} title="No notes yet" message="Add the first note above to start building a record for this client." />
      ) : (
        <View style={{ gap: 10 }}>
          {notes.data.map((n) => (
            <View key={n.id} style={{ backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.ink }}>{n.author?.name ?? "Unknown"}</Text>
                  <Text style={text.meta}>{formatDateTime(n.createdAt)}</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Delete note" hitSlop={10} onPress={() => confirmDelete(n.id)} disabled={remove.isPending}>
                  <Trash size={16} color="#A3AFC6" strokeWidth={2} />
                </Pressable>
              </View>
              <Text selectable style={text.body}>{n.body}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
