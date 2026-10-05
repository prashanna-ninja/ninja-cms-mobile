import * as DocumentPicker from "expo-document-picker";
import * as React from "react";
import { Alert, Modal, Pressable, Text, TextInput, View } from "react-native";

import { UPLOAD_MIME_TYPES, useClientFiles, useDeleteFile, useRenameFile, useUploadFile } from "@/api/client-detail.api";
import { C, Card, Empty, ErrorNote, F, Loading, PillButton, text } from "@/components/client-detail/ui";
import { formatDateTime, formatFileSize } from "@/lib/format";
import { FileText, FolderOpen, Pencil, Trash, Upload } from "@/lib/icons";
import { openUrl } from "@/lib/open-url";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { ClientFile } from "@/types/client-detail.types";

const alertError = (err: unknown) => Alert.alert("Something went wrong", err instanceof Error ? err.message : "Please try again.");

/**
 * Files — web ClientFilesTab: upload (PDF / Word / Excel / images, ≤ 10 MB), open
 * (public S3 URL in the in-app browser), rename, delete. Anyone with access can do all.
 * Upload uses expo-document-picker (native module — dev builds need a rebuild).
 */
export function FilesSection({ adviceId, clientId }: { adviceId: string; clientId: string }) {
  const { theme } = useOrgTheme();
  const files = useClientFiles(adviceId, clientId);
  const upload = useUploadFile(adviceId, clientId);
  const remove = useDeleteFile(adviceId, clientId);
  const [renaming, setRenaming] = React.useState<ClientFile | null>(null);

  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: UPLOAD_MIME_TYPES, copyToCacheDirectory: true, multiple: false });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    upload.mutate(
      { uri: a.uri, name: a.name, mimeType: a.mimeType ?? "application/octet-stream", size: a.size ?? 0 },
      { onError: alertError },
    );
  };

  const confirmDelete = (f: ClientFile) =>
    Alert.alert("Delete file?", `This will permanently delete "${f.fileName}" from storage. This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate(f.id, { onError: alertError }) },
    ]);

  return (
    <View style={{ gap: 14 }}>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={text.title}>Client files</Text>
            <Text style={text.meta}>Upload documents like ID, statements, or signed forms.</Text>
          </View>
          <PillButton label={upload.isPending ? "Uploading…" : "Upload file"} icon={Upload} filled color={theme.base} onPress={() => void pick()} disabled={upload.isPending} />
        </View>
      </Card>

      {files.isPending ? (
        <Loading />
      ) : files.isError ? (
        <ErrorNote message={files.error.message} onRetry={() => void files.refetch()} />
      ) : files.data.length === 0 ? (
        <Empty icon={FolderOpen} title="No files yet" message="Upload the first file above to start building a record for this client." />
      ) : (
        <View style={{ gap: 10 }}>
          {files.data.map((f) => (
            <View key={f.id} style={{ backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, gap: 10 }}>
              <Pressable accessibilityRole="link" accessibilityLabel={`Open ${f.fileName}`} onPress={() => void openUrl(f.fileUrl, theme.base)} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#FFFBEB", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={19} color="#D97706" strokeWidth={2} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text numberOfLines={2} style={text.value}>{f.fileName}</Text>
                  <Text style={text.meta}>{`${formatFileSize(f.fileSizeBytes)} · Uploaded by ${f.uploadedBy?.name ?? "Unknown"} · ${formatDateTime(f.createdAt)}`}</Text>
                </View>
              </Pressable>
              <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
                <PillButton label="Open" onPress={() => void openUrl(f.fileUrl, theme.base)} />
                <PillButton label="Rename" icon={Pencil} onPress={() => setRenaming(f)} />
                <PillButton label="Delete" icon={Trash} tone="danger" onPress={() => confirmDelete(f)} disabled={remove.isPending} />
              </View>
            </View>
          ))}
        </View>
      )}

      {renaming ? <RenameDialog file={renaming} adviceId={adviceId} clientId={clientId} onClose={() => setRenaming(null)} /> : null}
    </View>
  );
}

/** Web dialog: "Rename document" / "This changes the name shown on the client record." */
function RenameDialog({ file, adviceId, clientId, onClose }: { file: ClientFile; adviceId: string; clientId: string; onClose: () => void }) {
  const { theme } = useOrgTheme();
  const [name, setName] = React.useState(file.fileName);
  const rename = useRenameFile(adviceId, clientId);
  const valid = name.trim().length > 0 && name.trim().length <= 255;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(13,27,62,0.35)", justifyContent: "center", padding: 24 }}>
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, gap: 12 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 18, color: C.ink }}>Rename document</Text>
          <Text style={text.meta}>This changes the name shown on the client record.</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={255}
            selectionColor={theme.base}
            style={{ borderWidth: 1, borderColor: "#DCE3EE", borderRadius: 12, paddingHorizontal: 12, height: 44, fontFamily: F.regular, fontSize: 15, color: C.ink }}
          />
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
            <PillButton label="Cancel" onPress={onClose} />
            <PillButton
              label={rename.isPending ? "Saving…" : "Save name"}
              filled
              color={theme.base}
              disabled={!valid || rename.isPending}
              onPress={() =>
                rename.mutate(
                  { fileId: file.id, fileName: name.trim() },
                  { onSuccess: onClose, onError: (e) => Alert.alert("Couldn't rename", e.message) },
                )
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
