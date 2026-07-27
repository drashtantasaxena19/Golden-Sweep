import gameApi from "../api/gameApi";

import type {
    GameCreate,
    GameCreateResult,
    GameFilter,
    GameImageFiles,
    GameImageType,
    GameUpdate,
    NewGameImageFiles,
    PublicGameFilter,
} from "../types/game";

class GameService {
    getStatistics() {
        return gameApi.getStatistics();
    }

    listAdminGames(filters: GameFilter = {}) {
        return gameApi.listAdminGames(filters);
    }

    getAdminGame(gameId: string) {
        return gameApi.getAdminGame(gameId);
    }

    createGame(payload: GameCreate) {
        return gameApi.createGame(payload);
    }

    async createGameWithImages(
        payload: GameCreate,
        files: NewGameImageFiles,
    ): Promise<GameCreateResult> {
        const draft = await gameApi.createGame(payload);
        const upload = await gameApi.uploadGameImages(draft.id, files);

        return {
            game: upload.game,
            upload,
        };
    }

    updateGame(gameId: string, payload: GameUpdate) {
        return gameApi.updateGame(gameId, payload);
    }

    deleteGame(gameId: string) {
        return gameApi.deleteGame(gameId);
    }

    setFeatured(gameId: string, isFeatured: boolean) {
        return isFeatured
            ? gameApi.featureGame(gameId)
            : gameApi.unfeatureGame(gameId);
    }

    setLandingPageVisibility(gameId: string, show: boolean) {
        return show
            ? gameApi.showOnLandingPage(gameId)
            : gameApi.hideFromLandingPage(gameId);
    }

    reorderGame(gameId: string, sortOrder: number) {
        return gameApi.reorderGame(gameId, sortOrder);
    }

    uploadGameImage(
        gameId: string,
        imageType: GameImageType,
        file: File,
    ) {
        return gameApi.uploadGameImage(gameId, imageType, file);
    }

    uploadGameImages(
        gameId: string,
        files: GameImageFiles,
    ) {
        return gameApi.uploadGameImages(gameId, files);
    }

    replaceGameImages(
        gameId: string,
        files: GameImageFiles,
    ) {
        return gameApi.uploadGameImages(gameId, files);
    }

    getGameImageMetadata(
        gameId: string,
        imageType: GameImageType,
    ) {
        return gameApi.getGameImageMetadata(gameId, imageType);
    }

    deleteGameImage(
        gameId: string,
        imageType: GameImageType,
    ) {
        return gameApi.deleteGameImage(gameId, imageType);
    }

    deleteAllGameImages(gameId: string) {
        return gameApi.deleteAllGameImages(gameId);
    }

    validateGameImages(gameId: string) {
        return gameApi.validateGameImages(gameId);
    }

    getImageUrl(fileId?: string | null) {
        return gameApi.getImageUrl(fileId);
    }

    bulkFeatureGames(
        gameIds: string[],
        isFeatured: boolean,
    ) {
        return gameApi.bulkFeatureGames(gameIds, isFeatured);
    }

    bulkLandingPageUpdate(
        gameIds: string[],
        showOnLandingPage: boolean,
    ) {
        return gameApi.bulkLandingPageUpdate(
            gameIds,
            showOnLandingPage,
        );
    }

    bulkDeleteGames(gameIds: string[]) {
        return gameApi.bulkDeleteGames(gameIds);
    }

    listPublicGames(params: PublicGameFilter = {}) {
        return gameApi.listPublicGames(params);
    }

    getPublicGame(slug: string) {
        return gameApi.getPublicGame(slug);
    }

    registerGamePlay(gameId: string) {
        return gameApi.registerGamePlay(gameId);
    }
    
}

export const gameService = new GameService();

export default gameService;