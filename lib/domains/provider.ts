import "server-only";

export type DomainVerificationStatus = "pending" | "waiting_dns" | "verifying" | "verified" | "failed";
export type DomainSslStatus = "pending" | "active" | "failed";

export type DnsRecord = {
  type: "A" | "CNAME" | "TXT";
  name: string;
  value: string;
};

export type DomainProviderState = {
  verificationStatus: DomainVerificationStatus;
  sslStatus: DomainSslStatus;
  dnsRecords: DnsRecord[];
  providerDomainId?: string;
};

export interface DomainProvider {
  addDomain(hostname: string): Promise<DomainProviderState>;
  checkDomainStatus(hostname: string): Promise<DomainProviderState>;
  removeDomain(hostname: string): Promise<void>;
  getRequiredDnsRecords(hostname: string): Promise<DnsRecord[]>;
  checkSslStatus(hostname: string): Promise<DomainSslStatus>;
}

function fallbackRecords(hostname: string): DnsRecord[] {
  const apex = hostname.split(".").length === 2;
  return apex
    ? [
        { type: "A", name: "@", value: process.env.DOMAIN_A_RECORD_VALUE || "76.76.21.21" },
        { type: "CNAME", name: "www", value: process.env.DOMAIN_CNAME_TARGET || "cname.vercel-dns.com" }
      ]
    : [{ type: "CNAME", name: hostname.startsWith("www.") ? "www" : hostname.split(".")[0] || "www", value: process.env.DOMAIN_CNAME_TARGET || "cname.vercel-dns.com" }];
}

class MockDomainProvider implements DomainProvider {
  async addDomain(hostname: string) {
    return { verificationStatus: "waiting_dns" as const, sslStatus: "pending" as const, dnsRecords: fallbackRecords(hostname), providerDomainId: `mock:${hostname}` };
  }

  async checkDomainStatus(hostname: string) {
    return { verificationStatus: "verifying" as const, sslStatus: "pending" as const, dnsRecords: fallbackRecords(hostname), providerDomainId: `mock:${hostname}` };
  }

  async removeDomain() {}

  async getRequiredDnsRecords(hostname: string) {
    return fallbackRecords(hostname);
  }

  async checkSslStatus() {
    return "pending" as const;
  }
}

class VercelDomainProvider implements DomainProvider {
  private token = process.env.VERCEL_API_TOKEN || "";
  private projectId = process.env.VERCEL_PROJECT_ID || "";
  private teamQuery = process.env.VERCEL_TEAM_ID ? `?teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}` : "";

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.token || !this.projectId) throw new Error("Domain provider is not configured.");
    const response = await fetch(`https://api.vercel.com${path}${this.teamQuery}`, {
      ...init,
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json", ...(init?.headers || {}) },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Domain provider request failed (${response.status})`);
    if (response.status === 204) return null as T;
    return response.json() as Promise<T>;
  }

  async addDomain(hostname: string) {
    const data = await this.request<{ uid?: string; id?: string }>(`/v10/projects/${this.projectId}/domains`, {
      method: "POST",
      body: JSON.stringify({ name: hostname })
    });
    const state = await this.checkDomainStatus(hostname);
    return { ...state, providerDomainId: data?.uid || data?.id || state.providerDomainId };
  }

  async checkDomainStatus(hostname: string) {
    const data = await this.request<{ verified?: boolean; name?: string }>(`/v9/projects/${this.projectId}/domains/${encodeURIComponent(hostname)}`);
    const records = await this.getRequiredDnsRecords(hostname);
    return {
      verificationStatus: data.verified ? "verified" as const : "verifying" as const,
      sslStatus: data.verified ? "active" as const : "pending" as const,
      dnsRecords: records,
      providerDomainId: data.name
    };
  }

  async removeDomain(hostname: string) {
    await this.request(`/v9/projects/${this.projectId}/domains/${encodeURIComponent(hostname)}`, { method: "DELETE" });
  }

  async getRequiredDnsRecords(hostname: string) {
    return fallbackRecords(hostname);
  }

  async checkSslStatus(hostname: string) {
    const state = await this.checkDomainStatus(hostname);
    return state.sslStatus;
  }
}

export function domainProviderMode() {
  return process.env.DOMAIN_PROVIDER === "vercel" && process.env.ENABLE_REMOTE_DOMAIN_PROVISIONING === "true" ? "vercel" : "mock";
}

export function domainProvider(): DomainProvider {
  return domainProviderMode() === "vercel" ? new VercelDomainProvider() : new MockDomainProvider();
}
