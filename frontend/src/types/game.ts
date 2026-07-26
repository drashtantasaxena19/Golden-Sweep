export type GameStatus =
    | "draft"
    | "published"
    | "maintenance"
    | "disabled";

export type GameCategory =
    | "arcade"
    | "card"
    | "casino"
    | "casual"
    | "puzzle"
    | "sports"
    | "strategy"
    | "other";

export type GameOrientation =
    | "portrait"
    | "landscape"
    | "responsive";

export type GameImageType = "logo" | "thumbnail" | "banner";
export type GameImageKind = GameImageType;

export const GAME_CATEGORY_OPTIONS: readonly GameCategory[] = [
    "arcade",
    "card",
    "casino",
    "casual",
    "puzzle",
    "sports",
    "strategy",
    "other",
];

export const GAME_ORIENTATION_OPTIONS: readonly GameOrientation[] = [
    "portrait",
    "landscape",
    "responsive",
];

export const GAME_IMAGE_KIND_OPTIONS: readonly GameImageKind[] = [
    "logo",
    "thumbnail",
    "banner",
];

export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
    draft: "Draft",
    published: "Published",
    maintenance: "Maintenance",
    disabled: "Disabled",
};

export const GAME_CATEGORY_LABELS: Record<GameCategory, string> = {
    arcade: "Arcade",
    card: "Card",
    casino: "Casino",
    casual: "Casual",
    puzzle: "Puzzle",
    sports: "Sports",
    strategy: "Strategy",
    other: "Other",
};

export const GAME_ORIENTATION_LABELS: Record<GameOrientation, string> = {
    portrait: "Portrait",
    landscape: "Landscape",
    responsive: "Responsive",
};

export const GAME_IMAGE_KIND_LABELS: Record<GameImageKind, string> = {
    logo: "Logo",
    thumbnail: "Thumbnail",
    banner: "Banner",
};

export interface GameCreate {
    name: string;
    slug: string;
    short_description: string;
    description: string;
    category: GameCategory;
    game_url: string;
    entry_fee_coins: number;
    minimum_age: number;
    provider_name?: string;
    provider_game_id?: string;
    orientation: GameOrientation;
    tags: string[];
    instructions?: string;
    terms_and_conditions?: string;
    is_featured: boolean;
    show_on_landing_page: boolean;
    sort_order: number;
    opens_in_new_tab: boolean;
    is_mobile_supported: boolean;
    is_desktop_supported: boolean;
}

/**
 * Fields that an administrator may edit directly.
 *
 * Status and GridFS file IDs are intentionally excluded because status is
 * managed by the backend and images are managed through multipart endpoints.
 */
export type GameUpdate = Partial<GameCreate>;

export interface GameResponse extends GameCreate {
    id: string;
    logo_file_id: string | null;
    thumbnail_file_id: string | null;
    banner_file_id: string | null;
    provider_name: string | null;
    provider_game_id: string | null;
    instructions: string | null;
    terms_and_conditions: string | null;
    status: GameStatus;
    play_count: number;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface GameListResponse {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    games: GameResponse[];
}

export interface GameStatisticsResponse {
    total_games: number;
    published_games: number;
    draft_games: number;
    maintenance_games: number;
    disabled_games: number;
    featured_games: number;
    landing_page_games: number;
    total_play_count: number;
}

export interface GameImageMetadata {
    file_id: string;
    filename: string;
    content_type: string;
    size_bytes: number;
    uploaded_at: string;
    image_type: GameImageType;
    image_url: string;
}

export interface GameImageUploadResponse {
    success: boolean;
    message: string | null;
    game: GameResponse;
    image: GameImageMetadata;
    replaced_file_id: string | null;
}

export interface GameMultiImageUploadResponse {
    success: boolean;
    message: string | null;
    game: GameResponse;
    images: Partial<Record<GameImageType, GameImageMetadata>>;
}

export interface GameImageDeleteResponse {
    success: boolean;
    image_type: GameImageType;
    file_id: string | null;
    storage_status: string;
    game: GameResponse;
}

export interface GameImageValidationItem {
    image_type?: GameImageType;
    field?: string;
    message?: string;
    [key: string]: string | GameImageType | undefined;
}

export interface GameImageValidationResponse {
    game_id: string;
    slug: string;
    is_valid: boolean;
    valid: GameImageValidationItem[];
    missing: GameImageValidationItem[];
}

export interface GameStatusResponse {
    success: boolean;
    message: string;
    game: GameResponse;
}

export interface GameDeleteResponse {
    success: boolean;
    game_id: string;
    slug: string | null;
    image_cleanup: {
        deleted: string[];
        missing: string[];
        failed: string[];
    };
}

export interface GameBulkBooleanResult {
    requested: number;
    matched_count: number;
    modified_count: number;
    invalid: string[];
    field: string;
    value: boolean;
}

export interface GameBulkDeleteResult {
    requested: number;
    deleted: string[];
    missing: string[];
    invalid: string[];
    failed: Array<Record<string, string>>;
}

export interface GameFilter {
    search?: string;
    status?: GameStatus;
    category?: GameCategory;
    provider_name?: string;
    is_featured?: boolean;
    show_on_landing_page?: boolean;
    page?: number;
    limit?: number;
}

export interface PublicGameFilter {
    page?: number;
    limit?: number;
    category?: GameCategory;
    featured_only?: boolean;
}

export type GameImageFiles = Partial<Record<GameImageType, File>>;

export interface NewGameImageFiles extends GameImageFiles {
    logo: File;
}

export interface GameCreateResult {
    game: GameResponse;
    upload: GameMultiImageUploadResponse;
}
