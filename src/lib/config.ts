export const siteConfig = {
  contactEmail: "contacto@samiraurzua.dev",
};

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];