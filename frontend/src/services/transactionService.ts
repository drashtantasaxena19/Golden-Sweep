import type {
  Transaction,
  TransactionBreakdownResponse,
  TransactionDailyTrendResponse,
  TransactionFilters,
  TransactionListResponse,
  TransactionStatistics,
} from "../types/transaction";

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

async function request<T>(path: string): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
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
          detail?: string;
          message?: string;
        };
        message = payload.detail || payload.message || message;
      } else {
        message = (await response.text()) || message;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

function dateToIso(value: string, endOfDay = false): string {
  if (!value) return "";

  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
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

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.transactionType) {
      params.set("transaction_type", filters.transactionType);
    }

    if (filters.minimumAmount.trim()) {
      params.set("minimum_amount", filters.minimumAmount.trim());
    }

    if (filters.maximumAmount.trim()) {
      params.set("maximum_amount", filters.maximumAmount.trim());
    }

    if (filters.startDate) {
      params.set("start_date", dateToIso(filters.startDate));
    }

    if (filters.endDate) {
      params.set("end_date", dateToIso(filters.endDate, true));
    }

    return request<TransactionListResponse>(
      `/api/admin/transactions?${params.toString()}`,
    );
  },

  getTransaction(transactionId: string): Promise<Transaction> {
    return request<Transaction>(`/api/admin/transactions/${transactionId}`);
  },

  getStatistics(
    startDate?: string,
    endDate?: string,
  ): Promise<TransactionStatistics> {
    const params = new URLSearchParams();

    if (startDate) params.set("start_date", dateToIso(startDate));
    if (endDate) params.set("end_date", dateToIso(endDate, true));

    const query = params.toString();
    return request<TransactionStatistics>(
      `/api/admin/transactions/statistics${query ? `?${query}` : ""}`,
    );
  },

  getBreakdown(
    startDate?: string,
    endDate?: string,
  ): Promise<TransactionBreakdownResponse> {
    const params = new URLSearchParams();

    if (startDate) params.set("start_date", dateToIso(startDate));
    if (endDate) params.set("end_date", dateToIso(endDate, true));

    const query = params.toString();
    return request<TransactionBreakdownResponse>(
      `/api/admin/transactions/type-breakdown${query ? `?${query}` : ""}`,
    );
  },

  getDailyTrend(
    startDate?: string,
    endDate?: string,
  ): Promise<TransactionDailyTrendResponse> {
    const params = new URLSearchParams({ limit: "30" });

    if (startDate) params.set("start_date", dateToIso(startDate));
    if (endDate) params.set("end_date", dateToIso(endDate, true));

    return request<TransactionDailyTrendResponse>(
      `/api/admin/transactions/daily-trend?${params.toString()}`,
    );
  },
};

export default transactionService;
