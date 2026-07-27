import axios from "axios";

import type {
    GameBulkBooleanResult,
    GameBulkDeleteResult,
    GameCreate,
    GameDeleteResponse,
    GameFilter,
    GameImageDeleteResponse,
    GameImageFiles,
    GameImageMetadata,
    GameImageType,
    GameImageUploadResponse,
    GameImageValidationResponse,
    GameListResponse,
    GameMultiImageUploadResponse,
    GameResponse,
    GameStatisticsResponse,
    GameStatusResponse,
    GameUpdate,
    PublicGameFilter,
} from "../types/game";

const DEFAULT_API_BASE_URL = "http://localhost:8000/api";

function resolveApiBaseUrl(): string {
    const configuredUrl = String(
        import.meta.env.VITE_API_BASE_URL ??
            import.meta.env.VITE_API_URL ??
            DEFAULT_API_BASE_URL
    )
        .trim()
        .replace(/\/+$/, "");

    if (!configuredUrl) {
        return DEFAULT_API_BASE_URL;
    }

    return configuredUrl.endsWith("/api")
        ? configuredUrl
        : `${configuredUrl}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        Accept: "application/json",
    },
});

function encodePathSegment(value: string): string {
    return encodeURIComponent(value.trim());
}

function appendImageFiles(
    formData: FormData,
    files: GameImageFiles
): void {
    const imageTypes: readonly GameImageType[] = [
        "logo",
        "thumbnail",
        "banner",
    ];

    for (const imageType of imageTypes) {
        const file = files[imageType];
        if (file) {
            formData.append(imageType, file);
        }
    }
}

class GameApi {
    async getStatistics(): Promise<GameStatisticsResponse> {
        const { data } = await api.get<GameStatisticsResponse>(
            "/admin/games/statistics"
        );
        return data;
    }

    async listAdminGames(
        filters: GameFilter = {}
    ): Promise<GameListResponse> {
        const { data } = await api.get<GameListResponse>(
            "/admin/games",
            { params: filters }
        );
        return data;
    }

    async getAdminGame(gameId: string): Promise<GameResponse> {
        const { data } = await api.get<GameResponse>(
            `/admin/games/${encodePathSegment(gameId)}`
        );
        return data;
    }

    async createGame(payload: GameCreate): Promise<GameResponse> {
        const { data } = await api.post<GameResponse>(
            "/admin/games",
            payload
        );
        return data;
    }

    async updateGame(
        gameId: string,
        payload: GameUpdate
    ): Promise<GameResponse> {
        const { data } = await api.patch<GameResponse>(
            `/admin/games/${encodePathSegment(gameId)}`,
            payload
        );
        return data;
    }

    async deleteGame(gameId: string): Promise<GameDeleteResponse> {
        const { data } = await api.delete<GameDeleteResponse>(
            `/admin/games/${encodePathSegment(gameId)}`
        );
        return data;
    }

    async featureGame(gameId: string): Promise<GameResponse> {
        const { data } = await api.patch<GameResponse>(
            `/admin/games/${encodePathSegment(gameId)}/feature`
        );
        return data;
    }

    async unfeatureGame(gameId: string): Promise<GameResponse> {
        const { data } = await api.patch<GameResponse>(
            `/admin/games/${encodePathSegment(gameId)}/unfeature`
        );
        return data;
    }

    async showOnLandingPage(gameId: string): Promise<GameResponse> {
        const { data } = await api.patch<GameResponse>(
            `/admin/games/${encodePathSegment(gameId)}/show-on-landing-page`
        );
        return data;
    }

    async hideFromLandingPage(gameId: string): Promise<GameResponse> {
        const { data } = await api.patch<GameResponse>(
            `/admin/games/${encodePathSegment(gameId)}/hide-from-landing-page`
        );
        return data;
    }

    async reorderGame(
        gameId: string,
        sortOrder: number
    ): Promise<GameResponse> {
        const { data } = await api.patch<GameResponse>(
            `/admin/games/${encodePathSegment(gameId)}/reorder`,
            { sort_order: sortOrder }
        );
        return data;
    }

    async uploadGameImage(
        gameId: string,
        imageType: GameImageType,
        file: File
    ): Promise<GameImageUploadResponse> {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await api.post<GameImageUploadResponse>(
            `/admin/games/${encodePathSegment(gameId)}/images/${imageType}`,
            formData
        );
        return data;
    }

    async uploadGameImages(
        gameId: string,
        files: GameImageFiles
    ): Promise<GameMultiImageUploadResponse> {
        const formData = new FormData();
        appendImageFiles(formData, files);

        if (![...formData.keys()].length) {
            throw new Error("Select at least one image to upload.");
        }

        const { data } = await api.post<GameMultiImageUploadResponse>(
            `/admin/games/${encodePathSegment(gameId)}/images`,
            formData
        );
        return data;
    }

    async getGameImageMetadata(
        gameId: string,
        imageType: GameImageType
    ): Promise<GameImageMetadata> {
        const { data } = await api.get<GameImageMetadata>(
            `/admin/games/${encodePathSegment(gameId)}/images/${imageType}`
        );
        return data;
    }

    async deleteGameImage(
        gameId: string,
        imageType: GameImageType
    ): Promise<GameImageDeleteResponse> {
        const { data } = await api.delete<GameImageDeleteResponse>(
            `/admin/games/${encodePathSegment(gameId)}/images/${imageType}`
        );
        return data;
    }

    async deleteAllGameImages(
        gameId: string
    ): Promise<GameStatusResponse> {
        const { data } = await api.delete<GameStatusResponse>(
            `/admin/games/${encodePathSegment(gameId)}/images`
        );
        return data;
    }

    async validateGameImages(
        gameId: string
    ): Promise<GameImageValidationResponse> {
        const { data } = await api.get<GameImageValidationResponse>(
            `/admin/games/${encodePathSegment(gameId)}/images/validate`
        );
        return data;
    }

    getImageUrl(fileId?: string | null): string | null {
        if (!fileId?.trim()) {
            return null;
        }

        return `${API_BASE_URL}/games/image/${encodePathSegment(fileId)}`;
    }

    async bulkFeatureGames(
        gameIds: string[],
        isFeatured: boolean
    ): Promise<GameBulkBooleanResult> {
        const { data } = await api.post<GameBulkBooleanResult>(
            "/admin/games/bulk/feature",
            {
                game_ids: gameIds,
                is_featured: isFeatured,
            }
        );
        return data;
    }

    async bulkLandingPageUpdate(
        gameIds: string[],
        showOnLandingPage: boolean
    ): Promise<GameBulkBooleanResult> {
        const { data } = await api.post<GameBulkBooleanResult>(
            "/admin/games/bulk/landing-page",
            {
                game_ids: gameIds,
                show_on_landing_page: showOnLandingPage,
            }
        );
        return data;
    }

    async bulkDeleteGames(
        gameIds: string[]
    ): Promise<GameBulkDeleteResult> {
        const { data } = await api.post<GameBulkDeleteResult>(
            "/admin/games/bulk/delete",
            { game_ids: gameIds }
        );
        return data;
    }

    async listPublicGames(
        params: PublicGameFilter = {}
    ): Promise<GameListResponse> {
        const { data } = await api.get<GameListResponse>(
            "/games",
            { params }
        );
        return data;
    }

    async getPublicGame(slug: string): Promise<GameResponse> {
        const { data } = await api.get<GameResponse>(
            `/games/${encodePathSegment(slug)}`
        );
        return data;
    }

    async registerGamePlay(
        gameId: string
    ): Promise<GameStatusResponse> {
        const { data } = await api.post<GameStatusResponse>(
            `/games/${encodePathSegment(gameId)}/play`
        );
        return data;
    }
}

export const gameApi = new GameApi();

export default gameApi;
