import * as React from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";

import { useClientConsent, useConsentAction, useSaveReview } from "@/api/client-detail.api";
import { C, Card, ErrorNote, F, Loading, PillButton, text } from "@/components/client-detail/ui";
import { DateField } from "@/components/forms/date-field";
import { formatCalendarDate, formatDateTime } from "@/lib/format";
import { CalendarClock, Check, FileText, Repeat, Upload } from "@/lib/icons";
import { openUrl } from "@/lib/open-url";
import { pickDocument } from "@/lib/pick-document";
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

const EVENT_LABEL = { setup: "Arrangement set up", received: "Consent received", not_renewed: "Not renewed" } as const;

/** Alert.alert has no buttons on web — confirm() there. */
function confirmAction(title: string, message: string, action: string, go: () => void) {
  if (Platform.OS === "web") {
    if (globalThis.confirm?.(`${title}\n\n${message}`) ?? true) go();
    return;
  }
  Alert.alert(title, message, [
    { text: "Back", style: "cancel" },
    { text: action, style: "destructive", onPress: go },
  ]);
}

/**
 * Ongoing client — web ClientAnnualConsentTab (CMS since 2026-10-06):
 * - **Annual consent** is an arrangement: set it up with the next due date; then either upload the signed
 *   consent (saved as a client file, the due date moves on a year) or mark it not renewed (cancels it).
 *   The date can't be moved. History lists the events, newest first.
 * - **Review**: how often, next review, when it shows on the dashboard, and optionally a card added to a
 *   workflow stage that many days before.
 * Dates use the JS DateField (no native picker).
 */
export function OngoingSection({ adviceId, clientId }: { adviceId: string; clientId: string }) {
  const { theme } = useOrgTheme();
  const q = useClientConsent(adviceId, clientId);
  const consent = useConsentAction(adviceId, clientId);
  const saveReview = useSaveReview(adviceId, clientId);

  // Set-up form.
  const [setupOpen, setSetupOpen] = React.useState(false);
  const [setupDate, setSetupDate] = React.useState("");
  // Review form (null = the saved value).
  const [interval, setInterval] = React.useState<Interval | null>(null);
  const [nextReviewOn, setNextReviewOn] = React.useState<string | null>(null);
  const [leadDays, setLeadDays] = React.useState<Lead | null>(null);
  const [toWorkflow, setToWorkflow] = React.useState<boolean | null>(null);
  const [workflowId, setWorkflowId] = React.useState<string | null>(null);
  const [stageId, setStageId] = React.useState<string | null>(null);

  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorNote message={q.error.message} onRetry={() => void q.refetch()} />;
  const { arrangement, events, review, workflows } = q.data;
  const active = arrangement?.status === "active" ? arrangement : null;

  const rInterval = interval ?? review?.interval ?? null;
  const rNext = nextReviewOn ?? review?.nextReviewOn ?? "";
  const rLead = leadDays ?? ((review?.leadDays as Lead | undefined) ?? null);
  const rToWorkflow = toWorkflow ?? review?.addToWorkflow ?? false;
  const rWorkflowId = workflowId ?? review?.workflowId ?? "";
  const rStageId = stageId ?? review?.stageId ?? "";
  const workflow = workflows.find((w) => w.id === rWorkflowId);
  const reviewComplete =
    !!rInterval && !!rNext && !!rLead && (!rToWorkflow || (!!workflow && workflow.stages.some((st) => st.id === rStageId)));
  const reviewDirty =
    rInterval !== review?.interval ||
    rNext !== review?.nextReviewOn ||
    rLead !== review?.leadDays ||
    rToWorkflow !== review?.addToWorkflow ||
    (rToWorkflow && (rWorkflowId !== (review?.workflowId ?? "") || rStageId !== (review?.stageId ?? "")));

  const tone = !active
    ? { bg: "#F5F7FB", fg: "#5B6B8C" }
    : active.daysUntil < 0
      ? { bg: "#FEF2F2", fg: "#B91C1C" }
      : active.daysUntil <= 60
        ? { bg: "#FFFBEB", fg: "#B45309" }
        : { bg: "#F0FDFA", fg: "#0F766E" };

  const onSetup = () =>
    consent.mutate(
      { action: "setup", nextDueOn: setupDate },
      {
        onSuccess: () => {
          setSetupOpen(false);
          setSetupDate("");
          Alert.alert("Saved", "Annual consent set up.");
        },
        onError: (e) => Alert.alert("Couldn't set up consent", e.message),
      },
    );

  const onUpload = async () => {
    let file;
    try {
      file = await pickDocument();
    } catch (e) {
      Alert.alert("Couldn't open files", e instanceof Error ? e.message : "Please try again.");
      return;
    }
    if (!file) return;
    consent.mutate(
      { action: "received", file },
      {
        onSuccess: () => Alert.alert("Consent received", "The next one is due in a year. The file is also under Files."),
        onError: (e) => Alert.alert("Couldn't record consent", e.message),
      },
    );
  };

  const onNotRenewed = () =>
    confirmAction("Not renewed?", "This cancels the ongoing consent arrangement for this client.", "Cancel arrangement", () =>
      consent.mutate({ action: "not_renewed" }, { onError: (e) => Alert.alert("Couldn't cancel the arrangement", e.message) }),
    );

  const onSaveReview = () =>
    saveReview.mutate(
      {
        interval: rInterval!,
        nextReviewOn: rNext,
        leadDays: rLead!,
        addToWorkflow: rToWorkflow,
        workflowId: rToWorkflow ? rWorkflowId : undefined,
        stageId: rToWorkflow ? rStageId : undefined,
      },
      {
        onSuccess: () => {
          setInterval(null);
          setNextReviewOn(null);
          setLeadDays(null);
          setToWorkflow(null);
          setWorkflowId(null);
          setStageId(null);
        },
        onError: (e) => Alert.alert("Couldn't save review", e.message),
      },
    );

  const busy = consent.isPending;
  const uploading = busy && consent.variables?.action === "received";

  return (
    <View style={{ gap: 14 }}>
      <Card icon={CalendarClock} iconBg="#F0FDFA" iconFg="#0F766E" title="Annual consent">
        <View style={{ gap: 12, paddingTop: 2 }}>
          <Text style={text.meta}>When the next consent is due. It stays on the dashboard until it is received.</Text>
          <View style={{ backgroundColor: tone.bg, borderRadius: 14, padding: 14, gap: 4 }}>
            {active ? (
              <>
                <Text style={{ fontFamily: F.bold, fontSize: 17, color: tone.fg }}>{dueLabel(active.daysUntil)}</Text>
                <Text style={[text.body, { color: tone.fg }]}>
                  {`Due ${formatCalendarDate(active.nextDueOn)}. Upload the signed consent, or mark it as not renewed. The date can't be moved.`}
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontFamily: F.bold, fontSize: 16, color: tone.fg }}>
                  {arrangement?.status === "cancelled" ? "Arrangement cancelled" : "No annual consent"}
                </Text>
                <Text style={[text.body, { color: tone.fg }]}>Set up an ongoing arrangement and choose the next date consent is due.</Text>
              </>
            )}
          </View>

          {active ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
              <PillButton label="Not renewed" onPress={onNotRenewed} disabled={busy} />
              <PillButton
                label={uploading ? "Uploading…" : "Upload consent"}
                icon={Upload}
                filled
                color={theme.base}
                onPress={() => void onUpload()}
                disabled={busy}
              />
            </View>
          ) : setupOpen ? (
            <View style={{ gap: 10 }}>
              <DateField label="Next consent due" value={setupDate} onChange={setSetupDate} clearable={false} />
              <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
                <PillButton label="Cancel" onPress={() => setSetupOpen(false)} disabled={busy} />
                <PillButton label={busy ? "Saving…" : "Save"} filled color={theme.base} onPress={onSetup} disabled={!setupDate || busy} />
              </View>
            </View>
          ) : (
            <View style={{ alignItems: "flex-end" }}>
              <PillButton label="Set up consent" filled color={theme.base} onPress={() => setSetupOpen(true)} />
            </View>
          )}

          <Text style={[text.label, { letterSpacing: 1, marginTop: 4 }]}>HISTORY</Text>
          {events.length === 0 ? (
            <Text style={text.meta}>Nothing recorded yet.</Text>
          ) : (
            events.map((e, i) => (
              <View key={e.id} style={{ gap: 2, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: C.hairline }}>
                <Text style={text.value}>{EVENT_LABEL[e.kind]}</Text>
                <Text style={text.body}>{`Due ${formatCalendarDate(e.dueOn)}`}</Text>
                {e.file ? (
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`Open ${e.file.fileName}`}
                    onPress={() => void openUrl(e.file?.fileUrl, theme.base)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 2 }}
                  >
                    <FileText size={14} color={theme.text} strokeWidth={2} />
                    <Text style={[text.body, { color: theme.text, flexShrink: 1 }]} numberOfLines={1}>
                      {e.file.fileName}
                    </Text>
                  </Pressable>
                ) : null}
                <Text style={text.meta}>{`${e.recordedBy?.name ?? "Unknown"} · ${formatDateTime(e.createdAt)}`}</Text>
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
                {`Next review ${formatCalendarDate(review.nextReviewOn)}. It shows on the dashboard ${review.leadDays} days before, on ${formatCalendarDate(minusDays(review.nextReviewOn, review.leadDays))}.`}
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
            <Text style={{ fontFamily: F.medium, fontSize: 13, color: "#3B4A68" }}>When it shows on the dashboard</Text>
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
            {rNext && rLead ? (
              <Text style={text.meta}>{`It shows on your dashboard ${rLead} days before it is due: ${formatCalendarDate(minusDays(rNext, rLead))}.`}</Text>
            ) : null}
          </View>

          <View style={{ gap: 10, borderTopWidth: 1, borderTopColor: C.hairline, paddingTop: 12 }}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rToWorkflow, disabled: !rLead }}
              disabled={!rLead}
              onPress={() => setToWorkflow(!rToWorkflow)}
              style={{ flexDirection: "row", alignItems: "center", gap: 10, opacity: rLead ? 1 : 0.5 }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 1.5,
                  borderColor: rToWorkflow ? theme.base : "#C5CFE0",
                  backgroundColor: rToWorkflow ? theme.base : "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {rToWorkflow ? <Check size={14} color={theme.onBase} strokeWidth={3} /> : null}
              </View>
              <Text style={[text.body, { flex: 1 }]}>
                {rLead ? `Add a card to a workflow ${rLead} days before` : "Add a card to a workflow before the review"}
              </Text>
            </Pressable>
            {rToWorkflow ? (
              workflows.length === 0 ? (
                <Text style={text.meta}>Create a workflow first, then choose it here.</Text>
              ) : (
                <>
                  <Text style={{ fontFamily: F.medium, fontSize: 13, color: "#3B4A68" }}>Workflow</Text>
                  <Chips
                    options={workflows.map((w) => ({ id: w.id, label: w.name }))}
                    value={rWorkflowId}
                    onChange={(id) => {
                      setWorkflowId(id);
                      setStageId("");
                    }}
                  />
                  {workflow ? (
                    <>
                      <Text style={{ fontFamily: F.medium, fontSize: 13, color: "#3B4A68" }}>Stage</Text>
                      <Chips options={workflow.stages.map((st) => ({ id: st.id, label: st.name }))} value={rStageId} onChange={setStageId} />
                    </>
                  ) : null}
                </>
              )
            ) : null}
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <PillButton
              label={saveReview.isPending ? "Saving…" : "Save review"}
              filled
              color={theme.base}
              disabled={!reviewComplete || !reviewDirty || saveReview.isPending}
              onPress={onSaveReview}
            />
          </View>
        </View>
      </Card>
    </View>
  );
}

/** A wrap of selectable chips (the workflow / stage pickers). */
function Chips({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  const { theme } = useOrgTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.id)}
            style={{ borderWidth: 1.5, borderColor: on ? theme.base : "#DCE3EE", backgroundColor: on ? theme.soft : "#FFFFFF", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}
          >
            <Text style={{ fontFamily: F.semibold, fontSize: 13.5, color: on ? theme.text : C.ink }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
