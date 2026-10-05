import * as React from "react";
import { Text, View } from "react-native";

import { useClientConsent } from "@/api/client-detail.api";
import { C, Card, ErrorNote, F, Loading, text } from "@/components/client-detail/ui";
import { formatCalendarDate, formatDateTime } from "@/lib/format";
import { CalendarClock, Repeat } from "@/lib/icons";

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
  const dt = new Date(Date.UTC(y, m - 1, d - days));
  return dt.toISOString().slice(0, 10);
}

/**
 * Ongoing client — web ClientAnnualConsentTab: annual consent (status, history)
 * and the review cycle. Read-only on mobile for now (recording a date needs a
 * date picker — next step).
 */
export function OngoingSection({ adviceId, clientId }: { adviceId: string; clientId: string }) {
  const q = useClientConsent(adviceId, clientId);
  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorNote message={q.error.message} onRetry={() => void q.refetch()} />;
  const { schedule, entries, review } = q.data;

  const tone = !schedule
    ? { bg: "#F5F7FB", fg: "#5B6B8C" }
    : schedule.daysUntil < 0
      ? { bg: "#FEF2F2", fg: "#B91C1C" }
      : schedule.daysUntil <= 60
        ? { bg: "#FFFBEB", fg: "#B45309" }
        : { bg: "#F0FDFA", fg: "#0F766E" };

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
              <Text style={[text.body, { color: tone.fg }]}>No annual consent date yet.</Text>
            )}
          </View>

          <Text style={[text.label, { letterSpacing: 1, marginTop: 4 }]}>HISTORY</Text>
          {entries.length === 0 ? (
            <Text style={text.meta}>Nothing recorded yet.</Text>
          ) : (
            entries.map((e, i) => (
              <View key={e.id} style={{ gap: 2, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: C.hairline }}>
                <Text style={text.value}>{formatCalendarDate(e.consentedOn)}</Text>
                <Text style={text.body}>{e.note || "No note"}</Text>
                <Text style={text.meta}>{`${e.recordedBy?.name ?? "Unknown"} · ${formatDateTime(e.createdAt)}`}</Text>
              </View>
            ))
          )}
        </View>
      </Card>

      <Card icon={Repeat} iconBg="#F0FDFA" iconFg="#0F766E" title="Review">
        {review ? (
          <View style={{ gap: 4, paddingTop: 2 }}>
            <Text style={{ fontFamily: F.semibold, fontSize: 15, color: C.ink }}>
              {review.interval === "six_months" ? "6 monthly review" : "12 monthly review"}
            </Text>
            <Text style={text.body}>
              {`Next review ${formatCalendarDate(review.nextReviewOn)}. The process starts ${review.leadDays} days before, on ${formatCalendarDate(minusDays(review.nextReviewOn, review.leadDays))}.`}
            </Text>
            <Text style={text.meta}>{`Updated by ${review.updatedBy?.name ?? "Unknown"} · ${formatDateTime(review.updatedAt)}`}</Text>
          </View>
        ) : (
          <Text style={[text.body, { paddingTop: 2 }]}>No review set.</Text>
        )}
      </Card>
    </View>
  );
}
