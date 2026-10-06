import { z } from "zod";

import { CLIENT_SOURCES, CLIENT_TYPES } from "@/lib/clients";

/**
 * Add / edit client form — mirrors the CMS `clientCoreShape` + `requireNameForIndividual`
 * (lib/validations/ClientSchema.ts), so the server never rejects what the form allows.
 * Empty strings mean "not set" (the server turns them into null).
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const clientFormSchema = z
  .object({
    type: z.enum(CLIENT_TYPES as [string, ...string[]], { message: "Please select a client type" }),
    source: z.enum(CLIENT_SOURCES as [string, ...string[]], { message: "Please select a source" }),
    name: z.string().trim().min(1, "Name is required"),
    email: z
      .string()
      .trim()
      .refine((v) => v === "" || EMAIL_REGEX.test(v), "Enter a valid email address"),
    phone: z.string().trim().max(30, "Phone is too long"),
    firstName: z.string().trim().max(120),
    lastName: z.string().trim().max(120),
    dateOfBirth: z.string(),
    abn: z.string().trim().max(20, "ABN is too long"),
    addressLine1: z.string().trim().max(200),
    addressTown: z.string().trim().max(120),
    addressPostcode: z.string().trim().max(10, "Postcode is too long"),
    state: z.string().trim().max(10),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "individual") return;
    if (!data.firstName) ctx.addIssue({ code: "custom", path: ["firstName"], message: "First name is required for individuals" });
    if (!data.lastName) ctx.addIssue({ code: "custom", path: ["lastName"], message: "Last name is required for individuals" });
  });

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const EMPTY_CLIENT_FORM: ClientFormValues = {
  type: "individual",
  source: "manual",
  name: "",
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  abn: "",
  addressLine1: "",
  addressTown: "",
  addressPostcode: "",
  state: "",
};
