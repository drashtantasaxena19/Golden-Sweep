import type {
  Wallet,
  WalletAdjustmentPayload,
  WalletFilters,
  WalletListResponse,
  WalletStatistics,
  WalletTransactionListResponse,
} from "../types/wallet";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

function getAuthToken(): string | null {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token")
  );
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const payload = (await response.json()) as {
          detail?: string;
          message?: string;
        };
        message = payload.detail || payload.message || message;
      } else {
        const text = await response.text();
        message = text || message;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

const walletService = {
  getStatistics(): Promise<WalletStatistics> {
    return request<WalletStatistics>("/api/admin/wallet/statistics");
  },

  getWallets(
    filters: WalletFilters,
    page = 1,
    limit = 20,
  ): Promise<WalletListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.status !== "all") {
      params.set("is_frozen", filters.status === "frozen" ? "true" : "false");
    }

    if (filters.minimumBalance.trim()) {
      params.set("minimum_balance", filters.minimumBalance.trim());
    }

    if (filters.maximumBalance.trim()) {
      params.set("maximum_balance", filters.maximumBalance.trim());
    }

    return request<WalletListResponse>(
      `/api/admin/wallet?${params.toString()}`,
    );
  },

  getWallet(walletId: string): Promise<Wallet> {
    return request<Wallet>(`/api/admin/wallet/${walletId}`);
  },

  getTransactions(
    walletId?: string,
    page = 1,
    limit = 20,
  ): Promise<WalletTransactionListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (walletId) params.set("wallet_id", walletId);

    return request<WalletTransactionListResponse>(
      `/api/admin/wallet/transactions?${params.toString()}`,
    );
  },

  creditWallet(
    walletId: string,
    payload: WalletAdjustmentPayload,
  ): Promise<{ success: boolean; message: string; wallet: Wallet }> {
    return request(`/api/admin/wallet/${walletId}/credit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  debitWallet(
    walletId: string,
    payload: WalletAdjustmentPayload,
  ): Promise<{ success: boolean; message: string; wallet: Wallet }> {
    return request(`/api/admin/wallet/${walletId}/debit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  freezeWallet(
    walletId: string,
  ): Promise<{ success: boolean; message: string; wallet: Wallet }> {
    return request(`/api/admin/wallet/${walletId}/freeze`, {
      method: "PATCH",
    });
  },

  unfreezeWallet(
    walletId: string,
  ): Promise<{ success: boolean; message: string; wallet: Wallet }> {
    return request(`/api/admin/wallet/${walletId}/unfreeze`, {
      method: "PATCH",
    });
  },
};

export default walletService;
