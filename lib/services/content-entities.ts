export const entityTables = {
  organization: "organizations",
  program: "programs",
  admission_round: "admission_rounds",
  tuition_policy: "tuition_policies",
  scholarship: "scholarships",
  document: "documents",
  article: "articles",
  page: "pages",
} as const;
export type EntityType = keyof typeof entityTables;
