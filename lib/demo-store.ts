import { cookies } from "next/headers";
import type { Organization, Profile, Site } from "@/lib/types";

const cookieName = "studio_os_demo";

export type DemoState = {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  organization: Organization | null;
  membershipRole: "owner" | "admin" | "editor" | "viewer" | null;
  platformAdmin: boolean;
  sites: Site[];
};

function now() {
  return new Date().toISOString();
}

export function emptyDemoState(): DemoState {
  return {
    user: null,
    profile: null,
    organization: null,
    membershipRole: null,
    platformAdmin: false,
    sites: []
  };
}

export function readDemoState(): DemoState {
  const raw = cookies().get(cookieName)?.value;
  if (!raw) return emptyDemoState();

  try {
    return { ...emptyDemoState(), ...JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) };
  } catch {
    return emptyDemoState();
  }
}

export function writeDemoState(state: DemoState) {
  cookies().set(cookieName, Buffer.from(JSON.stringify(state), "utf8").toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export function clearDemoState() {
  cookies().delete(cookieName);
}

export function createDemoUser(email: string, fullName: string, countryCode: string, preferredLanguage: string): DemoState {
  const createdAt = now();
  const userId = crypto.randomUUID();
  return {
    ...emptyDemoState(),
    user: { id: userId, email },
    profile: {
      id: userId,
      full_name: fullName,
      email,
      phone: null,
      country_code: countryCode,
      preferred_language: preferredLanguage,
      avatar_url: null,
      created_at: createdAt,
      updated_at: createdAt
    },
    platformAdmin: true
  };
}

export function timestamp() {
  return now();
}
