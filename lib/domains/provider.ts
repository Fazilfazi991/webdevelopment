export type DomainProviderState = {
  verificationStatus: "pending" | "verifying" | "verified" | "failed";
  sslStatus: "pending" | "active" | "failed";
  instructions?: Record<string, string>;
};

export interface DomainProvider {
  addDomain(hostname: string): Promise<DomainProviderState>;
  checkDomain(hostname: string): Promise<DomainProviderState>;
  removeDomain(hostname: string): Promise<void>;
}

class MockDomainProvider implements DomainProvider {
  async addDomain(hostname: string) { return { verificationStatus: "pending" as const, sslStatus: "pending" as const, instructions: { type: "CNAME", name: hostname.startsWith("www.") ? "www" : "@", value: process.env.DOMAIN_CNAME_TARGET || "cname.vercel-dns.com" } }; }
  async checkDomain() { return { verificationStatus: "verifying" as const, sslStatus: "pending" as const }; }
  async removeDomain() {}
}

class VercelDomainProvider implements DomainProvider {
  private token = process.env.VERCEL_API_TOKEN || "";
  private projectId = process.env.VERCEL_PROJECT_ID || "";
  private teamQuery = process.env.VERCEL_TEAM_ID ? `?teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}` : "";

  private async request(path: string, init?: RequestInit) {
    const response = await fetch(`https://api.vercel.com${path}${this.teamQuery}`, { ...init, headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json", ...(init?.headers || {}) }, cache: "no-store" });
    if (!response.ok) throw new Error(`Vercel domain request failed (${response.status})`);
    return response.status === 204 ? null : response.json();
  }

  async addDomain(hostname: string) {
    await this.request(`/v10/projects/${this.projectId}/domains`, { method: "POST", body: JSON.stringify({ name: hostname }) });
    return this.checkDomain(hostname);
  }
  async checkDomain(hostname: string) {
    const data = await this.request(`/v9/projects/${this.projectId}/domains/${encodeURIComponent(hostname)}`) as { verified?: boolean; verification?: unknown[] };
    return { verificationStatus: data.verified ? "verified" as const : "verifying" as const, sslStatus: data.verified ? "active" as const : "pending" as const };
  }
  async removeDomain(hostname: string) { await this.request(`/v9/projects/${this.projectId}/domains/${encodeURIComponent(hostname)}`, { method: "DELETE" }); }
}

export function domainProvider(): DomainProvider {
  const live = process.env.ENABLE_REMOTE_DOMAIN_PROVISIONING === "true" && process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID;
  return live ? new VercelDomainProvider() : new MockDomainProvider();
}
