export type TransactionType =
  | "purchase"
  | "game_entry"
  | "admin_credit"
  | "admin_debit"
  | "refund";

export interface Transaction {
  id: string;
  wallet_id: string;
  user_id: string;
  transaction_type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  reason: string;
  reference_id?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface TransactionListResponse {
  total: number;
  page: number;
  limit: number;
  transactions: Transaction[];
}

export interface TransactionStatistics {
  total_transactions: number;
  total_purchase_transactions: number;
  total_game_entry_transactions: number;
  total_admin_credit_transactions: number;
  total_admin_debit_transactions: number;
  total_refund_transactions: number;
  total_credited_coins: number;
  total_debited_coins: number;
  net_coin_change: number;
}

export interface TransactionBreakdownItem {
  transaction_type: TransactionType;
  count: number;
  total_amount: number;
}

export interface TransactionBreakdownResponse {
  items: TransactionBreakdownItem[];
}

export interface TransactionDailyTrendItem {
  date: string;
  transaction_count: number;
  credited_coins: number;
  debited_coins: number;
  net_change: number;
}

export interface TransactionDailyTrendResponse {
  items: TransactionDailyTrendItem[];
}

export interface TransactionFilters {
  search: string;
  transactionType: "" | TransactionType;
  minimumAmount: string;
  maximumAmount: string;
  startDate: string;
  endDate: string;
}
