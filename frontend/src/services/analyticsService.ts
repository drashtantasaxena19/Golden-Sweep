import analyticsApi, {
    type AnalyticsExportDownload,
} from "../api/analyticsApi";

import type {
    AnalyticsExportRequest,
    AnalyticsGranularity,
    AnalyticsOverviewResponse,
    AnalyticsQueryParams,
    AnalyticsSection,
    FullAnalyticsResponse,
    GameAnalyticsQueryParams,
    GameAnalyticsResponse,
    RevenueAnalyticsResponse,
    TransactionAnalyticsResponse,
    UserAnalyticsResponse,
    WalletAnalyticsResponse,
} from "../types/analytics";

export interface AnalyticsDateRangeInput {
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    granularity?: AnalyticsGranularity;
}

export interface GameAnalyticsOptions extends AnalyticsDateRangeInput {
    topLimit?: number;
}

export interface AnalyticsDashboardData {
    overview: AnalyticsOverviewResponse;
    revenue: RevenueAnalyticsResponse;
    users: UserAnalyticsResponse;
    wallet: WalletAnalyticsResponse;
    transactions: TransactionAnalyticsResponse;
    games: GameAnalyticsResponse;
}

export interface AnalyticsExportOptions extends AnalyticsDateRangeInput {
    format: AnalyticsExportRequest["format"];
    section?: AnalyticsSection;
}

export type AnalyticsPreset =
    | "today"
    | "last_7_days"
    | "last_30_days"
    | "last_90_days"
    | "this_month"
    | "this_year";

const DEFAULT_GRANULARITY: AnalyticsGranularity = "day";
const DEFAULT_GAME_LIMIT = 10;
const MIN_GAME_LIMIT = 1;
const MAX_GAME_LIMIT = 100;

const isValidDate = (date: Date): boolean =>
    !Number.isNaN(date.getTime());

const toDate = (
    value: Date | string | null | undefined,
    fieldName: string,
): Date | undefined => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const date = value instanceof Date ? new Date(value) : new Date(value);

    if (!isValidDate(date)) {
        throw new Error(`${fieldName} must be a valid date.`);
    }

    return date;
};

const toIsoString = (
    value: Date | string | null | undefined,
    fieldName: string,
): string | undefined => {
    const date = toDate(value, fieldName);
    return date?.toISOString();
};

const validateDateRange = (
    startDate?: Date,
    endDate?: Date,
): void => {
    if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
        throw new Error(
            "Start date must be earlier than or equal to end date.",
        );
    }
};

const validateGranularity = (
    granularity: AnalyticsGranularity,
): AnalyticsGranularity => {
    const supported: AnalyticsGranularity[] = [
        "hour",
        "day",
        "week",
        "month",
    ];

    if (!supported.includes(granularity)) {
        throw new Error(`Unsupported analytics granularity: ${granularity}.`);
    }

    return granularity;
};

const normalizeQueryParams = (
    input: AnalyticsDateRangeInput = {},
): AnalyticsQueryParams => {
    const startDate = toDate(input.startDate, "startDate");
    const endDate = toDate(input.endDate, "endDate");

    validateDateRange(startDate, endDate);

    return {
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
        granularity: validateGranularity(
            input.granularity ?? DEFAULT_GRANULARITY,
        ),
    };
};

const normalizeGameOptions = (
    input: GameAnalyticsOptions = {},
): GameAnalyticsQueryParams => {
    const query = normalizeQueryParams(input);
    const topLimit = input.topLimit ?? DEFAULT_GAME_LIMIT;

    if (!Number.isInteger(topLimit)) {
        throw new Error("topLimit must be an integer.");
    }

    if (topLimit < MIN_GAME_LIMIT || topLimit > MAX_GAME_LIMIT) {
        throw new Error(
            `topLimit must be between ${MIN_GAME_LIMIT} and ${MAX_GAME_LIMIT}.`,
        );
    }

    return {
        ...query,
        top_limit: topLimit,
    };
};

const normalizeExportRequest = (
    input: AnalyticsExportOptions,
): AnalyticsExportRequest => {
    const query = normalizeQueryParams(input);

    return {
        format: input.format,
        section: input.section ?? "full",
        start_date: query.start_date ?? null,
        end_date: query.end_date ?? null,
        granularity: query.granularity ?? DEFAULT_GRANULARITY,
    };
};

const startOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

const endOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};

const startOfMonth = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);

const startOfYear = (date: Date): Date =>
    new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);

const subtractDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

export const getAnalyticsPresetRange = (
    preset: AnalyticsPreset,
    now: Date = new Date(),
): Required<Pick<AnalyticsDateRangeInput, "startDate" | "endDate">> & {
    granularity: AnalyticsGranularity;
} => {
    if (!isValidDate(now)) {
        throw new Error("now must be a valid date.");
    }

    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    switch (preset) {
        case "today":
            return {
                startDate: todayStart,
                endDate: todayEnd,
                granularity: "hour",
            };

        case "last_7_days":
            return {
                startDate: startOfDay(subtractDays(now, 6)),
                endDate: todayEnd,
                granularity: "day",
            };

        case "last_30_days":
            return {
                startDate: startOfDay(subtractDays(now, 29)),
                endDate: todayEnd,
                granularity: "day",
            };

        case "last_90_days":
            return {
                startDate: startOfDay(subtractDays(now, 89)),
                endDate: todayEnd,
                granularity: "week",
            };

        case "this_month":
            return {
                startDate: startOfMonth(now),
                endDate: todayEnd,
                granularity: "day",
            };

        case "this_year":
            return {
                startDate: startOfYear(now),
                endDate: todayEnd,
                granularity: "month",
            };

        default: {
            const exhaustiveCheck: never = preset;
            throw new Error(
                `Unsupported analytics preset: ${String(exhaustiveCheck)}.`,
            );
        }
    }
};

export const formatAnalyticsNumber = (
    value: number,
    options: Intl.NumberFormatOptions = {},
): string => {
    const safeValue = Number.isFinite(value) ? value : 0;

    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
        ...options,
    }).format(safeValue);
};

export const formatAnalyticsPercentage = (
    value: number,
    maximumFractionDigits = 2,
): string =>
    `${formatAnalyticsNumber(value, {
        minimumFractionDigits: 0,
        maximumFractionDigits,
    })}%`;

export const formatAnalyticsDate = (
    value: Date | string,
    options: Intl.DateTimeFormatOptions = {},
): string => {
    const date = toDate(value, "value");

    if (!date) {
        return "";
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        ...options,
    }).format(date);
};

export const formatAnalyticsDateTime = (
    value: Date | string,
): string =>
    formatAnalyticsDate(value, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });

export const analyticsService = {
    getOverview(
        input: AnalyticsDateRangeInput = {},
    ): Promise<AnalyticsOverviewResponse> {
        return analyticsApi.getOverview(normalizeQueryParams(input));
    },

    getRevenue(
        input: AnalyticsDateRangeInput = {},
    ): Promise<RevenueAnalyticsResponse> {
        return analyticsApi.getRevenue(normalizeQueryParams(input));
    },

    getUsers(
        input: AnalyticsDateRangeInput = {},
    ): Promise<UserAnalyticsResponse> {
        return analyticsApi.getUsers(normalizeQueryParams(input));
    },

    getWallet(
        input: AnalyticsDateRangeInput = {},
    ): Promise<WalletAnalyticsResponse> {
        return analyticsApi.getWallet(normalizeQueryParams(input));
    },

    getTransactions(
        input: AnalyticsDateRangeInput = {},
    ): Promise<TransactionAnalyticsResponse> {
        return analyticsApi.getTransactions(normalizeQueryParams(input));
    },

    getGames(
        input: GameAnalyticsOptions = {},
    ): Promise<GameAnalyticsResponse> {
        return analyticsApi.getGames(normalizeGameOptions(input));
    },

    async getDashboard(
        input: AnalyticsDateRangeInput = {},
        gameTopLimit = DEFAULT_GAME_LIMIT,
    ): Promise<AnalyticsDashboardData> {
        const query = normalizeQueryParams(input);
        const gamesQuery = normalizeGameOptions({
            ...input,
            topLimit: gameTopLimit,
        });

        const [
            overview,
            revenue,
            users,
            wallet,
            transactions,
            games,
        ] = await Promise.all([
            analyticsApi.getOverview(query),
            analyticsApi.getRevenue(query),
            analyticsApi.getUsers(query),
            analyticsApi.getWallet(query),
            analyticsApi.getTransactions(query),
            analyticsApi.getGames(gamesQuery),
        ]);

        return {
            overview,
            revenue,
            users,
            wallet,
            transactions,
            games,
        };
    },

    async getFullAnalytics(
        input: AnalyticsDateRangeInput = {},
        gameTopLimit = DEFAULT_GAME_LIMIT,
    ): Promise<FullAnalyticsResponse> {
        return this.getDashboard(input, gameTopLimit);
    },

    export(
        input: AnalyticsExportOptions,
    ): Promise<AnalyticsExportDownload> {
        return analyticsApi.export(normalizeExportRequest(input));
    },

    downloadExport(
        input: AnalyticsExportOptions,
    ): Promise<AnalyticsExportDownload> {
        return analyticsApi.downloadExport(normalizeExportRequest(input));
    },

    getPresetRange: getAnalyticsPresetRange,

    buildQueryParams: normalizeQueryParams,

    buildGameQueryParams: normalizeGameOptions,

    buildExportRequest: normalizeExportRequest,

    toIsoString,
};

export default analyticsService;