import type {
  Transaction,
  TransactionBreakdownResponse,
  TransactionDailyTrendResponse,
  TransactionFilters,
  TransactionListResponse,
  TransactionStatistics,
} from "../types/transaction";

const RAW_API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  "http://127.0.0.1:8000";

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

async function request<T>(path: string): Promise<T> {
  const token = getAuthToken();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const contentType = response.headers.get("content-type") || "";

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
        message =
          (await response.text()) ||
          response.statusText ||
          message;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";

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

function dateToIso(value: string, endOfDay = false): string {
  if (!value) {
    return "";
  }

  const date = new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`,
  );

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return date.toISOString();
}

const transactionService = {
  getTransactions(
    filters: TransactionFilters,
    page = 1,
    limit = 20,
  ): Promise<TransactionListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    const search = filters.search?.trim();

    if (search) {
      params.set("search", search);
    }

    if (filters.transactionType) {
      params.set("transaction_type", filters.transactionType);
    }

    const minimumAmount = filters.minimumAmount?.trim();

    if (minimumAmount) {
      params.set("minimum_amount", minimumAmount);
    }

    const maximumAmount = filters.maximumAmount?.trim();

    if (maximumAmount) {
      params.set("maximum_amount", maximumAmount);
    }

    if (filters.startDate) {
      params.set("start_date", dateToIso(filters.startDate));
    }

    if (filters.endDate) {
      params.set("end_date", dateToIso(filters.endDate, true));
    }

    return request<TransactionListResponse>(
      `/admin/transactions?${params.toString()}`,
    );
  },

  getTransaction(transactionId: string): Promise<Transaction> {
    return request<Transaction>(
      `/admin/transactions/${encodeURIComponent(transactionId)}`,
    );
  },

  getStatistics(
    startDate?: string,
    endDate?: string,
  ): Promise<TransactionStatistics> {
    const params = new URLSearchParams();

    if (startDate) {
      params.set("start_date", dateToIso(startDate));
    }

    if (endDate) {
      params.set("end_date", dateToIso(endDate, true));
    }

    const query = params.toString();

    return request<TransactionStatistics>(
      `/admin/transactions/statistics${query ? `?${query}` : ""}`,
    );
  },

  getBreakdown(
    startDate?: string,
    endDate?: string,
  ): Promise<TransactionBreakdownResponse> {
    const params = new URLSearchParams();

    if (startDate) {
      params.set("start_date", dateToIso(startDate));
    }

    if (endDate) {
      params.set("end_date", dateToIso(endDate, true));
    }

    const query = params.toString();

    return request<TransactionBreakdownResponse>(
      `/admin/transactions/type-breakdown${query ? `?${query}` : ""}`,
    );
  },

  getDailyTrend(
    startDate?: string,
    endDate?: string,
  ): Promise<TransactionDailyTrendResponse> {
    const params = new URLSearchParams({
      limit: "30",
    });

    if (startDate) {
      params.set("start_date", dateToIso(startDate));
    }

    if (endDate) {
      params.set("end_date", dateToIso(endDate, true));
    }

    return request<TransactionDailyTrendResponse>(
      `/admin/transactions/daily-trend?${params.toString()}`,
    );
  },
};

export default transactionService;