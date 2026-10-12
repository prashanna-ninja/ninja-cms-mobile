import {
  assetFields,
  DEPENDANT_FIELDS,
  EMPLOYMENT_FIELDS,
  ENTITY_FIELDS,
  ESTATE_PLANNING_FIELDS,
  EXPENSE_FIELDS,
  INCOME_FIELDS,
  insuranceFields,
  liabilityFields,
  SUPERANNUATION_FIELDS,
  type FactFindFieldDef,
} from "@/lib/fact-find/config";
import { isObj, str, type Obj } from "@/lib/fact-find/values";

/** What some field lists depend on: the client's name (owner labels) and the whole fact find (super funds). */
export type FieldContext = { clientName: string; factFind: Obj };

type Fields = FactFindFieldDef[] | ((ctx: FieldContext) => FactFindFieldDef[]);

/**
 * The 9 fact-find sections, in the web's order and shape (CMS components/clients/ClientFactFindTab.tsx +
 * lib/validations/ClientFactFindSchema.ts `factFindSectionSchemas`; since CMS 9bb57f1 personal details live on
 * the client record and there is one client per fact find):
 *  - person: fields stored under `client1`
 *  - lists:  arrays of rows (`items`, or `assets` / `liabilities`)
 * The GET still carries old keys (personalDetails, pensionIncome, …); they aren't shown or saved.
 */
export type FactFindSectionDef = {
  key: string;
  label: string;
  person?: FactFindFieldDef[];
  lists?: { key: string; label: string; itemLabel: string; fields: Fields }[];
};

/** Web ExistingInsuranceForm: the client, each named super fund ("fund:<id>"), and "Removed fund" for stale ids. */
function insuranceOwnerFields({ clientName, factFind }: FieldContext): FactFindFieldDef[] {
  const sup = factFind.superannuation;
  const funds = isObj(sup) && Array.isArray(sup.items) ? sup.items.filter(isObj) : [];
  const options = [
    { value: "self", label: clientName.trim() || "Client" },
    ...funds.flatMap((f) => (str(f.id) && str(f.fundName) ? [{ value: `fund:${str(f.id)}`, label: str(f.fundName) }] : [])),
  ];
  const ins = factFind.existingInsurances;
  for (const item of isObj(ins) && Array.isArray(ins.items) ? ins.items.filter(isObj) : []) {
    const owner = str(item.owner);
    if (owner.startsWith("fund:") && !options.some((o) => o.value === owner)) options.push({ value: owner, label: "Removed fund" });
  }
  return insuranceFields(options);
}

export const FACT_FIND_SECTIONS: FactFindSectionDef[] = [
  { key: "dependants", label: "Children & dependants", lists: [{ key: "items", label: "Dependants", itemLabel: "Dependant", fields: DEPENDANT_FIELDS }] },
  { key: "associatedEntities", label: "Associated entities", lists: [{ key: "items", label: "Entities", itemLabel: "Entity", fields: ENTITY_FIELDS }] },
  { key: "employment", label: "Employment", person: EMPLOYMENT_FIELDS },
  { key: "income", label: "Income", lists: [{ key: "items", label: "Income", itemLabel: "Income", fields: INCOME_FIELDS }] },
  { key: "expenses", label: "Expenses", lists: [{ key: "items", label: "Expenses", itemLabel: "Expense", fields: EXPENSE_FIELDS }] },
  {
    key: "assetsLiabilities",
    label: "Assets & liabilities",
    lists: [
      { key: "assets", label: "Assets", itemLabel: "Asset", fields: ({ clientName }) => assetFields(clientName) },
      { key: "liabilities", label: "Liabilities", itemLabel: "Liability", fields: ({ clientName }) => liabilityFields(clientName) },
    ],
  },
  { key: "superannuation", label: "Superannuation", lists: [{ key: "items", label: "Funds", itemLabel: "Fund", fields: SUPERANNUATION_FIELDS }] },
  { key: "estatePlanning", label: "Estate planning", person: ESTATE_PLANNING_FIELDS },
  { key: "existingInsurances", label: "Existing insurances", lists: [{ key: "items", label: "Insurances", itemLabel: "Insurance", fields: insuranceOwnerFields }] },
];

export const listFields = (fields: Fields, ctx: FieldContext) => (typeof fields === "function" ? fields(ctx) : fields);
