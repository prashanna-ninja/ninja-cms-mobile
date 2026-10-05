// ⚠️ Ported VERBATIM from the CMS: components/clients/fact-find/sectionConfig.ts (+ types.ts).
// Keep in sync with the web — labels/options/field names must match the stored JSON.

export type FactFindFieldType = "text" | "textarea" | "date" | "yesno" | "select" | "money";

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



const AU_STATE_OPTIONS = [
  { value: "nsw", label: "NSW" },
  { value: "vic", label: "VIC" },
  { value: "qld", label: "QLD" },
  { value: "wa", label: "WA" },
  { value: "sa", label: "SA" },
  { value: "tas", label: "TAS" },
  { value: "act", label: "ACT" },
  { value: "nt", label: "NT" },
];

const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "de_facto", label: "De facto" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
];

const OWNER_OPTIONS = [
  { value: "client1", label: "Client 1" },
  { value: "client2", label: "Client 2" },
  { value: "joint", label: "Joint" },
];

const INSURANCE_TYPE_OPTIONS = [
  { value: "life", label: "Life" },
  { value: "tpd", label: "TPD" },
  { value: "income_protection", label: "Income Protection" },
  { value: "trauma", label: "Trauma" },
  { value: "other", label: "Other" },
];

export const PERSONAL_DETAILS_FIELDS: FactFindFieldDef[] = [
  {
    name: "title",
    label: "Title",
    type: "select",
    options: [
      { value: "mr", label: "Mr" },
      { value: "mrs", label: "Mrs" },
      { value: "ms", label: "Ms" },
      { value: "miss", label: "Miss" },
      { value: "dr", label: "Dr" },
      { value: "prof", label: "Prof" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "surname", label: "Surname", type: "text", placeholder: "e.g. Smith" },
  { name: "givenNames", label: "Given name(s)", type: "text", placeholder: "e.g. John" },
  { name: "preferredName", label: "Preferred name", type: "text", placeholder: "e.g. Johnny" },
  { name: "dateOfBirth", label: "Date of birth", type: "date" },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
  },
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
    groupHeading: "Residential Address",
  },
  { name: "addressSuburb", label: "Suburb", type: "text", placeholder: "e.g. Brisbane" },
  {
    name: "addressState",
    label: "State",
    type: "select",
    options: AU_STATE_OPTIONS,
    dependsOn: { field: "australianResident", showWhen: "yes" },
  },
  {
    name: "addressState",
    label: "State",
    type: "text",
    placeholder: "e.g. state or province",
    dependsOn: { field: "australianResident", unless: "yes" },
  },
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

export const ASSOCIATED_ENTITIES_FIELDS: FactFindFieldDef[] = [
  { name: "hasBusinessEntity", label: "Do you have a business entity?", type: "yesno" },
  { name: "hasSMSF", label: "Do you have a Self Managed Superannuation Fund (SMSF)?", type: "yesno" },
  { name: "additionalDetails", label: "Additional details", type: "textarea", placeholder: "Any other relevant details" },
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
  { name: "additionalDetails", label: "Additional details", type: "textarea", placeholder: "Any other relevant details" },
];

export const INCOME_FIELDS: FactFindFieldDef[] = [
  { name: "grossSalary", label: "Gross salary excluding Superannuation Guarantee", type: "money" },
  { name: "bonuses", label: "Bonuses", type: "money" },
  { name: "bonusesIncludedForSG", label: "Are bonuses included for SG purposes?", type: "yesno" },
  { name: "motorVehiclePackaged", label: "Motor vehicle (packaged)", type: "money" },
  { name: "superGuarantee", label: "Superannuation Guarantee component", type: "money" },
  { name: "centrelinkDva", label: "Centrelink/DVA", type: "money" },
  { name: "familyAssistance", label: "Family Assistance", type: "money" },
  { name: "childSupport", label: "Child support/Maintenance", type: "money" },
  { name: "redundancyAmount", label: "Redundancy package (received/expected)", type: "money" },
  { name: "longServiceAmount", label: "Long service payments (received/expected)", type: "money" },
  { name: "otherIncome", label: "Others", type: "money" },
  { name: "subTotal", label: "Sub-total", type: "money" },
];

export const ADDITIONAL_DETAILS_ROOT_FIELDS: FactFindFieldDef[] = [
  { name: "additionalDetails", label: "Additional details", type: "textarea", placeholder: "Any other relevant details" },
];

export const PENSION_INCOME_FIELDS: FactFindFieldDef[] = [
  { name: "pensionIncome", label: "Pension income (incl. SMSF if relevant)", type: "money" },
  { name: "foreignPensions", label: "Foreign pensions (e.g. UK or NZ)", type: "money" },
  { name: "otherIncome", label: "Other", type: "money" },
  { name: "subTotal", label: "Sub-total", type: "money" },
];

export const DISTRIBUTION_INCOME_FIELDS: FactFindFieldDef[] = [
  { name: "distributionIncome", label: "Distribution income", type: "money" },
  { name: "otherIncome", label: "Other", type: "money" },
  { name: "subTotal", label: "Sub-total", type: "money" },
  { name: "additionalDetails", label: "Additional details", type: "textarea", placeholder: "Any other relevant details" },
];

export const EXPENSES_SUMMARY_FIELDS: FactFindFieldDef[] = [
  { name: "coreGeneral", label: "Core - General", type: "money" },
  { name: "total", label: "Total (transfer to 5.1)", type: "money" },
  { name: "additionalDetails", label: "Additional details", type: "textarea", placeholder: "Any other relevant details" },
];

export const ASSET_FIELDS: FactFindFieldDef[] = [
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
  { name: "owners", label: "Owner(s)", type: "select", options: OWNER_OPTIONS },
  { name: "dateAcquired", label: "Date acquired", type: "date" },
  { name: "purchasePrice", label: "Purchase price", type: "money" },
  { name: "currentValue", label: "Current value", type: "money" },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Any other relevant details" },
];

export const LIABILITY_FIELDS: FactFindFieldDef[] = [
  { name: "description", label: "Description/security", type: "text", placeholder: "e.g. Home Mortgage" },
  { name: "owners", label: "Owner(s)", type: "select", options: OWNER_OPTIONS },
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

export const ASSETS_LIABILITIES_TOTALS_FIELDS: FactFindFieldDef[] = [
  { name: "totalAssets", label: "Total assets", type: "money" },
  { name: "totalLiabilities", label: "Total liabilities", type: "money" },
  { name: "netWorth", label: "Net worth", type: "money" },
];

export const SUPERANNUATION_FIELDS: FactFindFieldDef[] = [
  { name: "fundName", label: "Fund name", type: "text", placeholder: "e.g. AustralianSuper" },
  { name: "owners", label: "Owner(s)", type: "select", options: OWNER_OPTIONS },
  { name: "value", label: "Value", type: "money" },
  { name: "pensionAmount", label: "Pension amount (if applic.)", type: "money" },
  { name: "insuranceType", label: "Insurance type", type: "select", options: INSURANCE_TYPE_OPTIONS },
  { name: "sumInsured", label: "Sum insured", type: "money" },
  { name: "premium", label: "Premium", type: "money" },
];

export const BENEFICIARY_FIELDS: FactFindFieldDef[] = [
  { name: "name", label: "Name", type: "text", placeholder: "e.g. Jane Smith" },
  { name: "type", label: "Type", type: "text", placeholder: "e.g. Spouse - binding nomination" },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Any other relevant details" },
];

export const ESTATE_PLANNING_FIELDS: FactFindFieldDef[] = [
  { name: "willInPlace", label: "Is there a Will in place?", type: "yesno" },
  { name: "powerOfAttorneyInPlace", label: "Is there a Power of Attorney (PoA) in place?", type: "yesno" },
];

export const EXISTING_INSURANCE_FIELDS: FactFindFieldDef[] = [
  { name: "type", label: "Type", type: "select", options: INSURANCE_TYPE_OPTIONS },
  { name: "owner", label: "Owner", type: "select", options: OWNER_OPTIONS },
  { name: "sumInsured", label: "Sum insured", type: "money" },
  { name: "keyFeatures", label: "Key features", type: "textarea", placeholder: "Key policy features" },
  { name: "premium", label: "Premium", type: "money" },
];

export const PREFERENCES_FIELDS: FactFindFieldDef[] = [
  {
    name: "insurersToExclude",
    label: "Insurers you would not consider for new insurance",
    type: "textarea",
    placeholder: "List any insurers to exclude",
  },
];
