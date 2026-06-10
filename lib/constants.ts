export const countries = [
  { label: "India", value: "IN" },
  { label: "United Arab Emirates", value: "AE" },
  { label: "Other", value: "XX" }
] as const;

export const currencies = [
  { label: "INR", value: "INR" },
  { label: "AED", value: "AED" },
  { label: "USD", value: "USD" }
] as const;

export const languages = [
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
  { label: "Hindi", value: "hi" },
  { label: "Malayalam", value: "ml" }
] as const;

export const timezones = [
  { label: "Asia/Kolkata", value: "Asia/Kolkata" },
  { label: "Asia/Dubai", value: "Asia/Dubai" },
  { label: "UTC", value: "UTC" }
] as const;

export const websiteTypes = [
  { label: "Business Website", value: "business_website", disabled: false },
  { label: "Landing Page", value: "landing_page", disabled: true },
  { label: "Portfolio Website", value: "portfolio_website", disabled: true },
  { label: "E-commerce Website", value: "ecommerce_website", disabled: true }
] as const;
