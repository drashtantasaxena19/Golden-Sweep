export interface RechargePackage {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    currency: string;
    coins: number;
    bonus_coins: number;
    total_coins: number;
    badge?: string | null;
    sort_order: number;
    is_active: boolean;
    created_by?: string | null;
    updated_by?: string | null;
    created_at: string;
    updated_at: string;
}

export interface RechargePackageListResponse {
    total: number;
    page: number;
    limit: number;
    packages: RechargePackage[];
}

export interface RechargePackageStatistics {
    total_packages: number;
    active_packages: number;
    inactive_packages: number;
    lowest_price: number;
    highest_price: number;
    total_base_coins: number;
    total_bonus_coins: number;
}

export interface RechargePackagePayload {
    name: string;
    description?: string | null;
    price: number;
    currency: string;
    coins: number;
    bonus_coins: number;
    badge?: string | null;
    sort_order: number;
    is_active: boolean;
}

export interface RechargeFilters {
    search: string;
    status: "" | "active" | "inactive";
    currency: string;
}
