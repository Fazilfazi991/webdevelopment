"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearDemoState, createDemoUser, readDemoState, writeDemoState } from "@/lib/demo-store";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "@/lib/validators/auth";

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function registerAction(formData: FormData) {
  const input = registerSchema.safeParse({
    fullName: formString(formData, "fullName"),
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    countryCode: formString(formData, "countryCode"),
    preferredLanguage: formString(formData, "preferredLanguage")
  });

  if (!input.success) redirect(`/auth/register?error=${encodeURIComponent(input.error.errors[0].message)}`);

  writeDemoState(createDemoUser(input.data.email, input.data.fullName, input.data.countryCode, input.data.preferredLanguage));
  redirect("/onboarding");
}

export async function loginAction(formData: FormData) {
  const input = loginSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password")
  });

  if (!input.success) redirect(`/auth/login?error=${encodeURIComponent(input.error.errors[0].message)}`);

  const existing = readDemoState();
  if (existing.user?.email === input.data.email) {
    writeDemoState(existing);
  } else {
    writeDemoState(createDemoUser(input.data.email, "Demo User", "IN", "en"));
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  clearDemoState();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export async function forgotPasswordAction(formData: FormData) {
  const input = forgotPasswordSchema.safeParse({ email: formString(formData, "email") });
  if (!input.success) redirect(`/auth/forgot-password?error=${encodeURIComponent(input.error.errors[0].message)}`);

  redirect(`/auth/forgot-password?message=${encodeURIComponent(`Demo reset instructions prepared for ${input.data.email}.`)}`);
}

export async function resetPasswordAction(formData: FormData) {
  const input = resetPasswordSchema.safeParse({ password: formString(formData, "password") });
  if (!input.success) redirect(`/auth/reset-password?error=${encodeURIComponent(input.error.errors[0].message)}`);

  redirect("/dashboard?message=Demo password updated.");
}
