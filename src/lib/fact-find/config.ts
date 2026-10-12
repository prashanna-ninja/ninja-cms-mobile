// ⚠️ Ported VERBATIM from the CMS: components/clients/fact-find/sectionConfig.ts (+ types.ts), re-synced 2026-10-12
// (CMS 9bb57f1: personal details moved to the client record, lists for income / expenses / entities, single client).
// Keep in sync with the web — labels/options/field names must match the stored JSON.

export type FactFindFieldType = "text" | "textarea" | "date" | "yesno" | "select" | "money" | "checkbox";

export type FactFindFieldDependency =
  | { field: string; showWhen: string | string[]; unless?: never }
  | { field: string; unless: string | string[]; showWhen?: never };

export type FactFindFieldDef = {
  name: string;
  label: string;
  type: FactFindFieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  /** Row is only rendered once the sibling field named here matches showWhen. */
  dependsOn?: FactFindFieldDependency;
  /** Renders a full-width divider row with this label immediately before the field. */
  groupHeading?: string;
};


export const AU_STATE_OPTIONS = [
  { value: "nsw", label: "NSW" },
  { value: "vic", label: "VIC" },
  { value: "qld", label: "QLD" },
  { value: "wa", label: "WA" },
  { value: "sa", label: "SA" },
  { value: "tas", label: "TAS" },
  { value: "act", label: "ACT" },
  { value: "nt", label: "NT" },
];

export const TITLE_OPTIONS = [
  { value: "mr", label: "Mr" },
  { value: "mrs", label: "Mrs" },
  { value: "ms", label: "Ms" },
  { value: "miss", label: "Miss" },
  { value: "dr", label: "Dr" },
  { value: "prof", label: "Prof" },
  { value: "other", label: "Other" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "de_facto", label: "De facto" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
];

export const FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
];

export const INCOME_TYPE_OPTIONS = [
  { value: "gross_salary", label: "Gross salary" },
  { value: "bonus", label: "Bonus" },
  { value: "centrelink", label: "Centrelink" },
  { value: "child_support", label: "Child support" },
  { value: "long_service_leave", label: "Long service leave" },
  { value: "redundancy", label: "Redundancy" },
  { value: "family_assistance", label: "Family assistance" },
  { value: "pension", label: "Pension" },
  { value: "company", label: "Company" },
  { value: "trust", label: "Trust" },
];

export const SUPER_TYPE_OPTIONS = [
  { value: "accumulation", label: "Accumulation" },
  { value: "pension", label: "Pension" },
  { value: "defined_benefit", label: "Defined benefit" },
  { value: "smsf", label: "SMSF" },
];

const INSURANCE_TYPE_OPTIONS = [
  { value: "life", label: "Life" },
  { value: "tpd", label: "TPD" },
  { value: "income_protection", label: "Income Protection" },
  { value: "trauma", label: "Trauma" },
  { value: "other", label: "Other" },
];

export function clientOwnerOptions(clientName: string) {
  const name = clientName.trim() || "Client";
  return [
    { value: "client", label: name },
    { value: "joint", label: "Joint" },
  ];
}

export const PERSONAL_DETAILS_FIELDS: FactFindFieldDef[] = [
  { name: "title", label: "Title", type: "select", options: TITLE_OPTIONS },
  { name: "surname", label: "Surname", type: "text", placeholder: "e.g. Smith" },
  { name: "givenNames", label: "Given name(s)", type: "text", placeholder: "e.g. John" },
  { name: "preferredName", label: "Preferred name", type: "text", placeholder: "e.g. Johnny" },
  { name: "dateOfBirth", label: "Date of birth", type: "date" },
  { name: "gender", label: "Gender", type: "select", options: GENDER_OPTIONS },
  { name: "maritalStatus", label: "Marital status", type: "select", options: MARITAL_STATUS_OPTIONS },
  { name: "australianResident", label: "Australian resident", type: "yesno" },
  {
    name: "countryOfResidence",
    label: "If no, country of residence",
    type: "text",
    placeholder: "e.g. New Zealand",
    dependsOn: { field: "australianResident", showWhen: "no" },
  },
  { name: "australianCitizen", label: "Australian citizen", type: "yesno" },
  {
    name: "citizenshipDetails",
    label: "If no, country & visa details",
    type: "textarea",
    placeholder: "Country of citizenship and visa details",
    dependsOn: { field: "australianCitizen", showWhen: "no" },
  },
  {
    name: "addressStreet",
    label: "Street",
    type: "text",
    placeholder: "e.g. 12 Example Street",
    groupHeading: "Residential address",
  },
  { name: "addressSuburb", label: "Suburb", type: "text", placeholder: "e.g. Brisbane" },
  { name: "addressState", label: "State", type: "text", placeholder: "e.g. QLD" },
  { name: "addressPostcode", label: "Postcode", type: "text", placeholder: "e.g. 4000" },
  { name: "mobile", label: "Mobile", type: "text", placeholder: "e.g. 0400 123 456" },
  { name: "email", label: "Email", type: "text", placeholder: "e.g. name@example.com" },
];

export const DEPENDANT_FIELDS: FactFindFieldDef[] = [
  { name: "fullName", label: "Full name", type: "text", placeholder: "e.g. Alex Smith" },
  { name: "dateOfBirth", label: "Date of birth", type: "date" },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
    ],
  },
  {
    name: "relationship",
    label: "Relationship",
    type: "select",
    options: [
      { value: "son", label: "Son" },
      { value: "daughter", label: "Daughter" },
      { value: "stepchild", label: "Stepchild" },
      { value: "grandchild", label: "Grandchild" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "dependant", label: "Dependant", type: "yesno" },
];

export const ENTITY_FIELDS: FactFindFieldDef[] = [
  { name: "name", label: "Name", type: "text", placeholder: "e.g. Smith Family Trust" },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: [
      { value: "company", label: "Company" },
      { value: "trust", label: "Trust" },
      { value: "smsf", label: "SMSF" },
    ],
  },
  {
    name: "trustee",
    label: "Trustee",
    type: "checkbox",
    dependsOn: { field: "type", showWhen: "company" },
  },
  {
    name: "trading",
    label: "Trading",
    type: "checkbox",
    dependsOn: { field: "type", showWhen: ["company", "trust"] },
  },
  {
    name: "smsf",
    label: "SMSF",
    type: "checkbox",
    dependsOn: { field: "type", showWhen: "trust" },
  },
  {
    name: "familyTrust",
    label: "Family trust",
    type: "checkbox",
    dependsOn: { field: "type", showWhen: "trust" },
  },
];

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "self_employed", label: "Self-employed" },
  { value: "casual", label: "Casual" },
  { value: "not_employed", label: "Not employed" },
  { value: "retired", label: "Retired" },
];

export const EMPLOYMENT_FIELDS: FactFindFieldDef[] = [
  { name: "occupationTitle", label: "Occupation/Title", type: "text", placeholder: "e.g. Software Engineer" },
  { name: "jobDescription", label: "Job description/duties", type: "textarea", placeholder: "Brief description of duties" },
  { name: "qualifications", label: "Qualifications", type: "textarea", placeholder: "e.g. Bachelor of Commerce" },
  { name: "employerName", label: "Employer name", type: "text", placeholder: "e.g. Acme Pty Ltd" },
  { name: "employmentStartDate", label: "Employment start date", type: "date" },
  { name: "worksOverseas", label: "Do you work overseas?", type: "yesno" },
  {
    name: "overseasCountries",
    label: "If yes, list relevant country(ies)",
    type: "text",
    placeholder: "e.g. New Zealand, United Kingdom",
    dependsOn: { field: "worksOverseas", showWhen: "yes" },
  },
  { name: "personalLeaveDays", label: "Available personal leave days", type: "text", placeholder: "e.g. 20" },
  { name: "taxFileNumber", label: "Tax File Number (TFN)", type: "text", placeholder: "e.g. 123 456 789" },
  { name: "employmentStatus", label: "Employment status", type: "select", options: EMPLOYMENT_STATUS_OPTIONS },
  {
    name: "partTimeHours",
    label: "If part-time, how many hours worked?",
    type: "text",
    placeholder: "e.g. 24",
    dependsOn: { field: "employmentStatus", showWhen: "part_time" },
  },
  {
    name: "selfEmployedStructure",
    label: "If self-employed, what structure?",
    type: "select",
    options: [
      { value: "trust", label: "Trust" },
      { value: "company", label: "Company" },
      { value: "sole_trader", label: "Sole Trader" },
      { value: "partnership", label: "Partnership" },
    ],
    dependsOn: { field: "employmentStatus", showWhen: "self_employed" },
  },
];

export const INCOME_FIELDS: FactFindFieldDef[] = [
  { name: "type", label: "Type", type: "select", options: INCOME_TYPE_OPTIONS },
  { name: "amount", label: "Amount", type: "money" },
  { name: "frequency", label: "Frequency", type: "select", options: FREQUENCY_OPTIONS },
  { name: "includesSuper", label: "Includes super", type: "yesno" },
];

export const EXPENSE_FIELDS: FactFindFieldDef[] = [
  { name: "category", label: "Category", type: "text", placeholder: "e.g. General living" },
  { name: "amount", label: "Amount", type: "money" },
  { name: "frequency", label: "Frequency", type: "select", options: FREQUENCY_OPTIONS },
];

export function assetFields(clientName: string): FactFindFieldDef[] {
  return [
    {
      name: "category",
      label: "Category",
      type: "select",
      options: [
        { value: "lifestyle", label: "Lifestyle" },
        { value: "financial", label: "Financial" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "description", label: "Description", type: "text", placeholder: "e.g. Family Home" },
    { name: "owners", label: "Owner", type: "select", options: clientOwnerOptions(clientName) },
    { name: "dateAcquired", label: "Date acquired", type: "date" },
    { name: "purchasePrice", label: "Purchase price", type: "money" },
    { name: "currentValue", label: "Current value", type: "money" },
    { name: "notes", label: "Notes", type: "textarea", placeholder: "Any other relevant details" },
  ];
}

export function liabilityFields(clientName: string): FactFindFieldDef[] {
  return [
    { name: "description", label: "Description/security", type: "text", placeholder: "e.g. Home Mortgage" },
    { name: "owners", label: "Owner", type: "select", options: clientOwnerOptions(clientName) },
    { name: "institution", label: "Institution", type: "text", placeholder: "e.g. Commonwealth Bank" },
    {
      name: "loanType",
      label: "Loan type",
      type: "select",
      options: [
        { value: "io", label: "Interest Only (IO)" },
        { value: "p_and_i", label: "Principal & Interest (P&I)" },
      ],
    },
    { name: "balance", label: "Balance", type: "money" },
    { name: "interestRate", label: "Interest rate", type: "text", placeholder: "e.g. 6.20%" },
    { name: "notes", label: "Notes", type: "textarea", placeholder: "Any other relevant details" },
  ];
}

export const SUPERANNUATION_FIELDS: FactFindFieldDef[] = [
  { name: "fundName", label: "Fund name", type: "text", placeholder: "e.g. AustralianSuper" },
  { name: "type", label: "Type", type: "select", options: SUPER_TYPE_OPTIONS },
  { name: "balance", label: "Balance", type: "money" },
];

export const ESTATE_PLANNING_FIELDS: FactFindFieldDef[] = [
  { name: "willInPlace", label: "Is there a Will in place?", type: "yesno" },
  { name: "powerOfAttorneyInPlace", label: "Is there a Power of Attorney (PoA) in place?", type: "yesno" },
];

export const INSURANCE_TYPE_FIELD_OPTIONS = INSURANCE_TYPE_OPTIONS;

export function insuranceFields(
  ownerOptions: { value: string; label: string }[],
): FactFindFieldDef[] {
  return [
    { name: "type", label: "Type", type: "select", options: INSURANCE_TYPE_OPTIONS },
    { name: "owner", label: "Owner", type: "select", options: ownerOptions },
    { name: "sumInsured", label: "Sum insured", type: "money" },
    { name: "keyFeatures", label: "Key features", type: "textarea", placeholder: "Key policy features" },
    { name: "premium", label: "Premium", type: "money" },
    { name: "premiumFrequency", label: "Premium frequency", type: "select", options: FREQUENCY_OPTIONS },
  ];
}
