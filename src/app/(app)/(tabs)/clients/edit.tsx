import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { View } from "react-native";

import { useClientDetail, useUpdateClient } from "@/api/client-detail.api";
import { AppHeader } from "@/components/app-header";
import { ErrorNote, Loading, errorMessage } from "@/components/client-detail/ui";
import { ClientForm } from "@/components/clients/client-form";
import { FormScreenHeader } from "@/components/clients/form-screen-header";
import { useOrgTheme } from "@/providers/org-theme-provider";
import type { ClientFormValues } from "@/schemas/client.schema";
import type { ClientDetail } from "@/types/client-detail.types";

const toForm = (c: ClientDetail): ClientFormValues => ({
  type: c.type,
  source: c.source,
  name: c.name ?? "",
  email: c.email ?? "",
  phone: c.phone ?? "",
  firstName: c.firstName ?? "",
  lastName: c.lastName ?? "",
  dateOfBirth: c.dateOfBirth ? c.dateOfBirth.slice(0, 10) : "",
  abn: c.abn ?? "",
  addressLine1: c.addressLine1 ?? "",
  addressTown: c.addressTown ?? "",
  addressPostcode: c.addressPostcode ?? "",
  state: c.state ?? "",
});

/** Edit client — PATCH …/client-records/[id] with the full form. Back to the client on save. */
export default function EditClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { org } = useOrgTheme();
  const client = useClientDetail(org?.id, id);
  const update = useUpdateClient(org?.id, id);

  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <FormScreenHeader title="Edit client" subtitle={client.data?.name} />
      {client.isPending ? (
        <Loading />
      ) : client.isError ? (
        <View style={{ padding: 20 }}>
          <ErrorNote message={errorMessage(client.error)} onRetry={() => void client.refetch()} />
        </View>
      ) : (
        <ClientForm
          initial={toForm(client.data)}
          submitLabel="Save changes"
          submitting={update.isPending}
          serverError={update.isError ? errorMessage(update.error) : null}
          onCancel={() => router.back()}
          onSubmit={(values) => update.mutate(values, { onSuccess: () => router.back() })}
        />
      )}
    </View>
  );
}
