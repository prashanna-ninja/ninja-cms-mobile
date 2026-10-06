import * as React from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { useClientConsent, useDeleteConsent, useSaveConsent, useSaveReview } from "@/api/client-detail.api";
import { C, Card, ErrorNote, F, Loading, PillButton, text } from "@/components/client-detail/ui";
import { DateField } from "@/components/forms/date-field";
import { formatCalendarDate, formatDateTime } from "@/lib/format";
import { CalendarClock, Repeat, Trash } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

/** Web: "Overdue by N day(s)" / "Due today" / "Due tomorrow" / "Due in N days". */
function dueLabel(daysUntil: number) {
  if (daysUntil < 0) return `Overdue by ${-daysUntil} day${daysUntil === -1 ? "" : "s"}`;
  if (daysUntil === 0) return "Due today";
  if (daysUntil === 1) return "Due tomorrow";
  return `Due in ${daysUntil} days`;
}

/** "YYYY-MM-DD" minus N days (calendar maths, no timezone shift). */
function minusDays(ymd: string, days: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - days)).toISOString().slice(0, 10);
}

type Interval = "six_months" | "twelve_months";
type Lead = 30 | 60 | 90;

/**
 * Ongoing client — web ClientAnnualConsentTab: annual consent (status, record the
 * due date + note, history with delete) and the review cycle (how often, next
 * review, when the process starts). Dates use the JS DateField (no native picker).
 */
export function OngoingSection({ adviceId, clientId }: { adviceId: string; clientId: string }) {
  const { theme } = useOrgTheme();
  const q = useClientConsent(adviceId, clientId);
  const saveConsent = useSaveConsent(adviceId, clientId);
  const deleteConsent = useDeleteConsent(adviceId, clientId);
  const saveReview = useSaveReview(adviceId, clientId);

  // Consent form — prefilled with the current due date.
  const [dueOn, setDueOn] = React.useState<string | null>(null);
  const [note, setNote] = React.useState<string | null>(null);
  // Review form.
  const [interval, setInterval] = React.useState<Interval | null>(null);
  const [nextReviewOn, setNextReviewOn] = React.useState<string | null>(null);
  const [leadDays, setLeadDays] = React.useState<Lead | null>(null);

  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorNote message={q.error.message} onRetry={() => void q.refetch()} />;
  const { schedule, entries, review } = q.data;

  const formDue = dueOn ?? schedule?.dueOn ?? "";
  const formNote = note ?? "";
  const rInterval = interval ?? review?.interval ?? null;
  const rNext = nextReviewOn ?? review?.nextReviewOn ?? "";
  const rLead = leadDays ?? ((review?.leadDays as Lead | undefined) ?? null);
  const reviewDirty = !!rInterval && !!rNext && !!rLead && (rInterval !== review?.interval || rNext !== review?.nextReviewOn || rLead !== review?.leadDays);

  const tone = !schedule
    ? { bg: "#F5F7FB", fg: "#5B6B8C" }
    : schedule.daysUntil < 0
      ? { bg: "#FEF2F2", fg: "#B91C1C" }
      : schedule.daysUntil <= 60
        ? { bg: "#FFFBEB", fg: "#B45309" }
        : { bg: "#F0FDFA", fg: "#0F766E" };

  const onSaveConsent = () =>
    saveConsent.mutate(
      { consentedOn: formDue, note: formNote.trim() || undefined },
      {
        onSuccess: () => {
          setDueOn(null);
          setNote(null);
          Alert.alert("Saved", "Annual consent due date saved.");
        },
        onError: (e) => Alert.alert("Couldn't save", e.message),
      },
    );

  const confirmDelete = (id: string) =>
    Alert.alert("Delete this entry?", "It will be removed from the consent history.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteConsent.mutate(id, { onError: (e) => Alert.alert("Couldn't delete", e.message) }) },
    ]);

  const onSaveReview = () =>
    saveReview.mutate(
      { interval: rInterval!, nextReviewOn: rNext, leadDays: rLead! },
      {
        onSuccess: () => {
          setInterval(null);
          setNextReviewOn(null);
          setLeadDays(null);
        },
        onError: (e) => Alert.alert("Couldn't save review", e.message),
      },
    );

  return (
    <View style={{ gap: 14 }}>
      <Card icon={CalendarClock} iconBg="#F0FDFA" iconFg="#0F766E" title="Annual consent">
        <View style={{ gap: 12, paddingTop: 2 }}>
          <Text style={text.meta}>{"When this client's consent needs to be renewed."}</Text>
          <View style={{ backgroundColor: tone.bg, borderRadius: 14, padding: 14, gap: 4 }}>
            {schedule ? (
              <>
                <Text style={{ fontFamily: F.bold, fontSize: 17, color: tone.fg }}>{dueLabel(schedule.daysUntil)}</Text>
                <Text style={[text.body, { color: tone.fg }]}>
                  {`Due ${formatCalendarDate(schedule.dueOn)}. ${schedule.daysUntil <= 60 ? "Send the annual consent before it is due." : "A reminder appears 60 days before this date."}`}
                </Text>
              </>
            ) : (
              <Text style={[text.body, { color: tone.fg }]}>No annual consent date yet. Set the date it needs to be done below.</Text>
            )}
          </View>

          <DateField label="Due date — needs to be done" value={formDue} onChange={setDueOn} clearable={false} />
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: F.medium, fontSize: 13, color: "#3B4A68" }}>Note</Text>
            <TextInput
              value={formNote}
              onChangeText={setNote}
              placeholder="How it was sent, or anything to remember"
              placeholderTextColor="#A3AFC6"
              multiline
              maxLength={2000}
              textAlignVertical="top"
              selectionColor={theme.base}
              style={{ minHeight: 70, borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, padding: 12, fontFamily: F.regular, fontSize: 15, color: C.ink }}
            />
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <PillButton
              label={saveConsent.isPending ? "Saving…" : "Save date"}
              filled
              color={theme.base}
              disabled={!formDue || saveConsent.isPending}
              onPress={onSaveConsent}
            />
          </View>

          <Text style={[text.label, { letterSpacing: 1, marginTop: 4 }]}>HISTORY</Text>
          {entries.length === 0 ? (
            <Text style={text.meta}>Nothing recorded yet.</Text>
          ) : (
            entries.map((e, i) => (
              <View key={e.id} style={{ flexDirection: "row", gap: 10, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: C.hairline }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={text.value}>{formatCalendarDate(e.consentedOn)}</Text>
                  <Text style={text.body}>{e.note || "No note"}</Text>
                  <Text style={text.meta}>{`${e.recordedBy?.name ?? "Unknown"} · ${formatDateTime(e.createdAt)}`}</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Delete entry" hitSlop={10} onPress={() => confirmDelete(e.id)} disabled={deleteConsent.isPending}>
                  <Trash size={16} color="#A3AFC6" strokeWidth={2} />
                </Pressable>
              </View>
            ))
          )}
        </View>
      </Card>

      <Card icon={Repeat} iconBg="#F0FDFA" iconFg="#0F766E" title="Review">
        <View style={{ gap: 14, paddingTop: 2 }}>
          {review ? (
            <View style={{ gap: 4, backgroundColor: "#F7F9FC", borderRadius: 14, padding: 12 }}>
              <Text style={{ fontFamily: F.semibold, fontSize: 15, color: C.ink }}>
                {review.interval === "six_months" ? "6 monthly review" : "12 monthly review"}
              </Text>
              <Text style={text.body}>
                {`Next review ${formatCalendarDate(review.nextReviewOn)}. The process starts ${review.leadDays} days before, on ${formatCalendarDate(minusDays(review.nextReviewOn, review.leadDays))}.`}
              </Text>
              <Text style={text.meta}>{`Updated by ${review.updatedBy?.name ?? "Unknown"} · ${formatDateTime(review.updatedAt)}`}</Text>
            </View>
          ) : (
            <Text style={text.body}>No review set.</Text>
          )}

          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: F.medium, fontSize: 13, color: "#3B4A68" }}>How often</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {([
                ["six_months", "6 monthly", "Twice a year"],
                ["twelve_months", "12 monthly", "Once a year"],
              ] as const).map(([value, title, sub]) => {
                const active = rInterval === value;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setInterval(value)}
                    style={{ flex: 1, borderWidth: 1.5, borderColor: active ? theme.base : "#DCE3EE", backgroundColor: active ? theme.soft : "#FFFFFF", borderRadius: 12, padding: 12 }}
                  >
                    <Text style={{ fontFamily: F.semibold, fontSize: 14.5, color: active ? theme.text : C.ink }}>{title}</Text>
                    <Text style={text.meta}>{sub}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <DateField label="Next review" value={rNext} onChange={setNextReviewOn} clearable={false} />

          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: F.medium, fontSize: 13, color: "#3B4A68" }}>When the process starts</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {([30, 60, 90] as const).map((d) => {
                const active = rLead === d;
                return (
                  <Pressable
                    key={d}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setLeadDays(d)}
                    style={{ flex: 1, alignItems: "center", borderWidth: 1.5, borderColor: active ? theme.base : "#DCE3EE", backgroundColor: active ? theme.soft : "#FFFFFF", borderRadius: 12, paddingVertical: 10 }}
                  >
                    <Text style={{ fontFamily: F.semibold, fontSize: 14.5, color: active ? theme.text : C.ink }}>{`${d} days`}</Text>
                    <Text style={text.meta}>before</Text>
                  </Pressable>
                );
              })}
            </View>
            {rNext && rLead ? <Text style={text.meta}>{`The process starts on ${formatCalendarDate(minusDays(rNext, rLead))}.`}</Text> : null}
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <PillButton
              label={saveReview.isPending ? "Saving…" : "Save review"}
              filled
              color={theme.base}
              disabled={!reviewDirty || saveReview.isPending}
              onPress={onSaveReview}
            />
          </View>
        </View>
      </Card>
    </View>
  );
}
