import type {
  Wallet,
  WalletAdjustmentPayload,
  WalletFilters,
  WalletListResponse,
  WalletStatistics,
  WalletTransactionListResponse,
} from "../types/wallet";

const RAW_API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  "https://golden-sweep.onrender.com/api";

const NORMALIZED_API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

const API_BASE_URL = NORMALIZED_API_BASE_URL.endsWith("/api")
  ? NORMALIZED_API_BASE_URL
  : `${NORMALIZED_API_BASE_URL}/api`;

function getAuthToken(): string | null {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token")
  );
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${API_BASE_URL}${normalizedPath}`,
    {
      ...options,
      headers,
    },
  );

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const contentType =
        response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const payload = (await response.json()) as {
          detail?:
            | string
            | Array<{
                loc?: Array<string | number>;
                msg?: string;
                type?: string;
              }>;
          message?: string;
        };

        if (typeof payload.detail === "string") {
          message = payload.detail;
        } else if (Array.isArray(payload.detail)) {
          message = payload.detail
            .map((error) => {
              const location = error.loc?.join(".") || "request";
              return `${location}: ${error.msg || "Invalid value"}`;
            })
            .join(", ");
        } else if (payload.message) {
          message = payload.message;
        }
      } else {
        const text = await response.text();
        message = text || response.statusText || message;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();

    throw new Error(
      `Expected JSON response but received ${
        contentType || "unknown content type"
      }. Response: ${text.slice(0, 120)}`,
    );
  }

  return (await response.json()) as T;
}

type WalletActionResponse = {
  success: boolean;
  message: string;
  wallet: Wallet;
};

const walletService = {
  getStatistics(): Promise<WalletStatistics> {
    return request<WalletStatistics>(
      "/admin/wallet/statistics",
    );
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

    const search = filters.search?.trim();

    if (search) {
      params.set("search", search);
    }

    if (filters.status && filters.status !== "all") {
      params.set(
        "is_frozen",
        filters.status === "frozen" ? "true" : "false",
      );
    }

    const minimumBalance = filters.minimumBalance?.trim();

    if (minimumBalance) {
      params.set("minimum_balance", minimumBalance);
    }

    const maximumBalance = filters.maximumBalance?.trim();

    if (maximumBalance) {
      params.set("maximum_balance", maximumBalance);
    }

    return request<WalletListResponse>(
      `/admin/wallet?${params.toString()}`,
    );
  },

  getWallet(walletId: string): Promise<Wallet> {
    return request<Wallet>(
      `/admin/wallet/${encodeURIComponent(walletId)}`,
    );
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

    if (walletId) {
      params.set("wallet_id", walletId);
    }

    return request<WalletTransactionListResponse>(
      `/admin/wallet/transactions?${params.toString()}`,
    );
  },

  creditWallet(
    walletId: string,
    payload: WalletAdjustmentPayload,
  ): Promise<WalletActionResponse> {
    return request<WalletActionResponse>(
      `/admin/wallet/${encodeURIComponent(walletId)}/credit`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  debitWallet(
    walletId: string,
    payload: WalletAdjustmentPayload,
  ): Promise<WalletActionResponse> {
    return request<WalletActionResponse>(
      `/admin/wallet/${encodeURIComponent(walletId)}/debit`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  freezeWallet(
    walletId: string,
  ): Promise<WalletActionResponse> {
    return request<WalletActionResponse>(
      `/admin/wallet/${encodeURIComponent(walletId)}/freeze`,
      {
        method: "PATCH",
      },
    );
  },

  unfreezeWallet(
    walletId: string,
  ): Promise<WalletActionResponse> {
    return request<WalletActionResponse>(
      `/admin/wallet/${encodeURIComponent(walletId)}/unfreeze`,
      {
        method: "PATCH",
      },
    );
  },
};

export default walletService;