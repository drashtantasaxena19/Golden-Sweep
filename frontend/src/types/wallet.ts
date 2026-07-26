export type WalletStatusFilter = "all" | "active" | "frozen";
export type WalletTransactionType =
  | "purchase"
  | "game_entry"
  | "admin_credit"
  | "admin_debit"
  | "refund";

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  is_frozen: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletStatistics {
  total_wallets: number;
  active_wallets: number;
  frozen_wallets: number;
  total_coins_in_circulation: number;
  zero_balance_wallets: number;
  positive_balance_wallets: number;
}

export interface WalletListResponse {
  total: number;
  page: number;
  limit: number;
  wallets: Wallet[];
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  transaction_type: WalletTransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  reason: string;
  reference_id?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface WalletTransactionListResponse {
  total: number;
  page: number;
  limit: number;
  transactions: WalletTransaction[];
}

export interface WalletAdjustmentPayload {
  amount: number;
  reason: string;
  reference_id?: string;
}

export interface WalletFilters {
  search: string;
  status: WalletStatusFilter;
  minimumBalance: string;
  maximumBalance: string;
}
