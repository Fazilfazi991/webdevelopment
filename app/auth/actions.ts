"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.data.email,
    password: input.data.password,
    options: {
      data: {
        full_name: input.data.fullName,
        country_code: input.data.countryCode,
        preferred_language: input.data.preferredLanguage
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  });

  if (error) redirect(`/auth/register?error=${encodeURIComponent(error.message)}`);

  if (data.session && data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: input.data.fullName,
      email: input.data.email,
      country_code: input.data.countryCode,
      preferred_language: input.data.preferredLanguage
    });
    redirect("/onboarding");
  }

  redirect("/auth/login?message=Check your email to confirm your account, then log in.");
}

export async function loginAction(formData: FormData) {
  const input = loginSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password")
  });

  if (!input.success) redirect(`/auth/login?error=${encodeURIComponent(input.error.errors[0].message)}`);

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(input.data);
  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export async function forgotPasswordAction(formData: FormData) {
  const input = forgotPasswordSchema.safeParse({ email: formString(formData, "email") });
  if (!input.success) redirect(`/auth/forgot-password?error=${encodeURIComponent(input.error.errors[0].message)}`);

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(input.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`
  });
  if (error) redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`);
  redirect("/auth/forgot-password?message=Password reset instructions sent.");
}

export async function resetPasswordAction(formData: FormData) {
  const input = resetPasswordSchema.safeParse({ password: formString(formData, "password") });
  if (!input.success) redirect(`/auth/reset-password?error=${encodeURIComponent(input.error.errors[0].message)}`);

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: input.data.password });
  if (error) redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard?message=Password updated.");
}
