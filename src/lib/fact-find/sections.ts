import {
  ADDITIONAL_DETAILS_ROOT_FIELDS,
  ASSET_FIELDS,
  ASSETS_LIABILITIES_TOTALS_FIELDS,
  ASSOCIATED_ENTITIES_FIELDS,
  BENEFICIARY_FIELDS,
  DEPENDANT_FIELDS,
  DISTRIBUTION_INCOME_FIELDS,
  EMPLOYMENT_FIELDS,
  ESTATE_PLANNING_FIELDS,
  EXISTING_INSURANCE_FIELDS,
  EXPENSES_SUMMARY_FIELDS,
  INCOME_FIELDS,
  LIABILITY_FIELDS,
  PENSION_INCOME_FIELDS,
  PERSONAL_DETAILS_FIELDS,
  PREFERENCES_FIELDS,
  SUPERANNUATION_FIELDS,
  type FactFindFieldDef,
} from "@/lib/fact-find/config";

/**
 * The 15 fact-find sections, in the web's order and shape
 * (CMS components/clients/ClientFactFindTab.tsx + lib/validations/ClientFactFindSchema.ts):
 *  - person: fields stored under `client1` / `client2`
 *  - root:   fields stored on the section itself
 *  - lists:  arrays of rows (`items`, or `assets` / `liabilities`)
 */
export type FactFindSectionDef = {
  key: string;
  label: string;
  person?: FactFindFieldDef[];
  root?: FactFindFieldDef[];
  lists?: { key: string; label: string; itemLabel: string; fields: FactFindFieldDef[] }[];
};

export const FACT_FIND_SECTIONS: FactFindSectionDef[] = [
  { key: "personalDetails", label: "Personal details", person: PERSONAL_DETAILS_FIELDS },
  { key: "dependants", label: "Children & dependants", lists: [{ key: "items", label: "Dependants", itemLabel: "Dependant", fields: DEPENDANT_FIELDS }] },
  { key: "associatedEntities", label: "Associated entities", root: ASSOCIATED_ENTITIES_FIELDS },
  { key: "employment", label: "Employment", person: EMPLOYMENT_FIELDS },
  { key: "income", label: "Income", person: INCOME_FIELDS, root: ADDITIONAL_DETAILS_ROOT_FIELDS },
  { key: "pensionIncome", label: "Pension income", person: PENSION_INCOME_FIELDS, root: ADDITIONAL_DETAILS_ROOT_FIELDS },
  { key: "companyDistributionIncome", label: "Company distribution income", root: DISTRIBUTION_INCOME_FIELDS },
  { key: "trustDistributionIncome", label: "Trust distribution income", root: DISTRIBUTION_INCOME_FIELDS },
  { key: "expensesSummary", label: "Expenses summary", root: EXPENSES_SUMMARY_FIELDS },
  {
    key: "assetsLiabilities",
    label: "Assets & liabilities",
    lists: [
      { key: "assets", label: "Assets", itemLabel: "Asset", fields: ASSET_FIELDS },
      { key: "liabilities", label: "Liabilities", itemLabel: "Liability", fields: LIABILITY_FIELDS },
    ],
    root: ASSETS_LIABILITIES_TOTALS_FIELDS,
  },
  {
    key: "superannuation",
    label: "Superannuation",
    lists: [{ key: "items", label: "Funds", itemLabel: "Fund", fields: SUPERANNUATION_FIELDS }],
    root: ADDITIONAL_DETAILS_ROOT_FIELDS,
  },
  { key: "beneficiaries", label: "Beneficiaries", lists: [{ key: "items", label: "Beneficiaries", itemLabel: "Beneficiary", fields: BENEFICIARY_FIELDS }] },
  { key: "estatePlanning", label: "Estate planning", person: ESTATE_PLANNING_FIELDS },
  {
    key: "existingInsurances",
    label: "Existing insurances",
    lists: [{ key: "items", label: "Insurances", itemLabel: "Insurance", fields: EXISTING_INSURANCE_FIELDS }],
  },
  { key: "preferences", label: "Insurance preferences", person: PREFERENCES_FIELDS, root: ADDITIONAL_DETAILS_ROOT_FIELDS },
];
