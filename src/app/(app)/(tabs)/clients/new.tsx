import { router } from "expo-router";
import * as React from "react";
import { View } from "react-native";

import { useCreateClient } from "@/api/client-detail.api";
import { AppHeader } from "@/components/app-header";
import { errorMessage } from "@/components/client-detail/ui";
import { ClientForm } from "@/components/clients/client-form";
import { FormScreenHeader } from "@/components/clients/form-screen-header";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { EMPTY_CLIENT_FORM } from "@/schemas/client.schema";

/** Add client — POST …/client-records (web AddClientRecordForm). Opens the new client on save. */
export default function NewClientScreen() {
  const { org } = useOrgTheme();
  const create = useCreateClient(org?.id);

  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <FormScreenHeader title="Add client" subtitle={`New client record in ${org?.name ?? "this organisation"}.`} />
      <ClientForm
        initial={EMPTY_CLIENT_FORM}
        submitLabel="Add client"
        submitting={create.isPending}
        serverError={create.isError ? errorMessage(create.error) : null}
        onCancel={() => router.back()}
        onSubmit={(values) =>
          create.mutate(values, {
            onSuccess: (client) => router.replace({ pathname: "/clients/[id]", params: { id: client.id, name: client.name } }),
          })
        }
      />
    </View>
  );
}
