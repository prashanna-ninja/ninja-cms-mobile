import * as React from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAddStage } from "@/api/workflows.api";
import { C, F, PillButton, errorMessage, text } from "@/components/client-detail/ui";
import { useKeyboard } from "@/hooks/use-keyboard";
import { Plus } from "@/lib/icons";
import { useOrgTheme } from "@/providers/org-theme-provider";

/**
 * "Add a stage" (web: the dashed column at the end of the board) — owners only.
 * POST …/{workflowId}/stages {name ≤ 80}; the new stage goes last. Mount only while open.
 */
export function AddStageSheet({ adviceId, workflowId, onClose, onAdded }: { adviceId: string; workflowId: string; onClose: () => void; onAdded: () => void }) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboard();
  const { theme } = useOrgTheme();
  const add = useAddStage(adviceId, workflowId);
  const [name, setName] = React.useState("");

  const submit = () => {
    if (!name.trim()) return;
    add.mutate(name.trim(), { onSuccess: onAdded });
  };

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
            paddingHorizontal: 20,
            paddingBottom: Math.max(insets.bottom + 14, keyboard.overlap + 12),
            gap: 12,
          }}
        >
          <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#DCE3EE" }} />
          <View style={{ gap: 2 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 18, color: C.ink }}>Add a stage</Text>
            <Text style={text.meta}>It goes at the end of the board. Rename, reorder and checklists are on the web.</Text>
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={submit}
            autoFocus
            maxLength={80}
            returnKeyType="done"
            placeholder="e.g. Waiting on documents"
            placeholderTextColor="#A3AFC6"
            selectionColor={theme.base}
            style={{ borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, paddingHorizontal: 12, height: 46, fontFamily: F.regular, fontSize: 15, color: C.ink }}
          />
          {add.isError ? <Text style={{ fontFamily: F.regular, fontSize: 13.5, color: C.danger }}>{errorMessage(add.error)}</Text> : null}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <PillButton label="Cancel" onPress={onClose} />
            <PillButton label={add.isPending ? "Adding…" : "Add stage"} icon={Plus} filled color={theme.base} disabled={!name.trim() || add.isPending} onPress={submit} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
