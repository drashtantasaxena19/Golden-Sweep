import {
    ArrowLeft,
    Expand,
    Gamepad2,
    LoaderCircle,
    Minimize,
    RefreshCw,
    ShieldAlert,
    X,
} from "lucide-react"
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom"

import { isAuthenticated } from "../../services/authStorage"
import gameService from "../../services/gameService"

type UnknownRecord = Record<string, unknown>

type PlayableGame = {
    id: string
    name: string
    slug: string
    launchUrl: string | null
}

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)

const readString = (
    source: UnknownRecord,
    keys: string[]
): string | null => {
    for (const key of keys) {
        const value = source[key]

        if (
            typeof value === "string" &&
            value.trim()
        ) {
            return value.trim()
        }
    }

    return null
}

const readNestedString = (
    source: UnknownRecord,
    paths: string[][]
): string | null => {
    for (const path of paths) {
        let current: unknown = source

        for (const key of path) {
            if (!isRecord(current)) {
                current = null
                break
            }

            current = current[key]
        }

        if (
            typeof current === "string" &&
            current.trim()
        ) {
            return current.trim()
        }
    }

    return null
}

const normalizeGame = (
    response: unknown,
    routeSlug: string
): PlayableGame | null => {
    let source: unknown = response

    if (
        isRecord(source) &&
        isRecord(source.data)
    ) {
        source = source.data
    }

    if (
        isRecord(source) &&
        isRecord(source.game)
    ) {
        source = source.game
    }

    if (!isRecord(source)) {
        return null
    }

    const name =
        readString(source, [
            "display_name",
            "name",
            "title",
            "game_name",
        ]) ?? "GoldenSweep Game"

    const id =
        readString(source, [
            "id",
            "_id",
            "game_id",
            "uuid",
        ]) ?? routeSlug

    const slug =
        readString(source, ["slug"]) ??
        routeSlug

    const launchUrl =
        readString(source, [
            "launch_url",
            "play_url",
            "game_url",
            "external_url",
            "iframe_url",
            "embed_url",
            "url",
        ]) ??
        readNestedString(source, [
            ["launch", "url"],
            ["game", "url"],
            ["provider", "launch_url"],
        ])

    return {
        id,
        name,
        slug,
        launchUrl,
    }
}

const GamePlayerPage = () => {
    const { slug = "" } = useParams<{
        slug: string
    }>()

    const location = useLocation()
    const navigate = useNavigate()

    const playerRef =
        useRef<HTMLDivElement>(null)

    const [game, setGame] =
        useState<PlayableGame | null>(null)
    const [loading, setLoading] =
        useState(true)
    const [error, setError] =
        useState<string | null>(null)
    const [isFullscreen, setIsFullscreen] =
        useState(false)

    const returnPath = useMemo(
        () =>
            `${location.pathname}${location.search}`,
        [location.pathname, location.search]
    )

    const closePlayer = () => {
        if (window.history.length > 1) {
            navigate(-1)
            return
        }

        navigate("/#games", {
            replace: true,
        })
    }

    const loadGame = useCallback(async () => {
        if (!slug.trim()) {
            setError("Invalid game address.")
            setLoading(false)
            return
        }

        if (!isAuthenticated()) {
            navigate(
                `/login?redirect=${encodeURIComponent(
                    returnPath
                )}`,
                { replace: true }
            )
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response =
                await gameService.getPublicGame(slug)

            const normalized =
                normalizeGame(response, slug)

            if (!normalized) {
                throw new Error(
                    "Invalid game response."
                )
            }

            setGame(normalized)

            void gameService
                .registerGamePlay(normalized.id)
                .catch(requestError => {
                    console.warn(
                        "Game play registration failed:",
                        requestError
                    )
                })
        } catch (requestError) {
            console.error(
                "Failed to load game:",
                requestError
            )

            setError(
                "This game could not be loaded."
            )
        } finally {
            setLoading(false)
        }
    }, [navigate, returnPath, slug])

    useEffect(() => {
        void loadGame()
    }, [loadGame])

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(
                document.fullscreenElement ===
                    playerRef.current
            )
        }

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        )

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            )
        }
    }, [])

    useEffect(() => {
        const handleEscape = (
            event: KeyboardEvent
        ) => {
            if (
                event.key === "Escape" &&
                !document.fullscreenElement
            ) {
                closePlayer()
            }
        }

        document.addEventListener(
            "keydown",
            handleEscape
        )

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            )
        }
    })

    const toggleFullscreen = async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen()
                return
            }

            await playerRef.current?.requestFullscreen({
                navigationUI: "hide",
            })
        } catch (requestError) {
            console.error(
                "Fullscreen request failed:",
                requestError
            )
        }
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[2px] sm:px-6"
            role="dialog"
            aria-modal="true"
            aria-label="Game player"
        >
            <button
                type="button"
                aria-label="Close game player"
                onClick={closePlayer}
                className="absolute inset-0 cursor-default"
            />

            <div className="relative z-10 w-full max-w-[1450px]">
                <div className="mb-3 flex items-center justify-between px-1">
                    <button
                        type="button"
                        onClick={closePlayer}
                        className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-[#060812]/95 px-4 text-sm font-bold text-white/80 backdrop-blur-md transition hover:border-[#e6ad2b]/45 hover:text-[#f2c143]"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    <button
                        type="button"
                        onClick={closePlayer}
                        aria-label="Close"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#060812]/95 text-white/75 backdrop-blur-md transition hover:border-red-400/40 hover:text-red-200"
                    >
                        <X size={18} />
                    </button>
                </div>

                {loading && (
                    <div className="flex h-[72vh] min-h-[420px] w-full items-center justify-center rounded-2xl border border-white/[.06] bg-[#050710]/98">
                        <div className="flex flex-col items-center gap-4 text-[#f2c143]">
                            <LoaderCircle
                                size={42}
                                className="animate-spin"
                            />

                            <p className="text-xs font-black uppercase tracking-[.18em]">
                                Loading game
                            </p>
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex h-[60vh] min-h-[360px] w-full items-center justify-center rounded-2xl border border-red-400/15 bg-[#08050a]/98 px-5">
                        <div className="flex max-w-lg flex-col items-center text-center">
                            <ShieldAlert
                                size={42}
                                className="text-red-300"
                            />

                            <p className="mt-4 text-sm font-bold text-red-100">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    void loadGame()
                                }
                                className="mt-5 flex h-11 items-center gap-2 rounded-xl border border-[#dca832]/35 bg-[#dca832]/[.06] px-5 text-xs font-black uppercase tracking-wide text-[#f2c143]"
                            >
                                <RefreshCw size={15} />
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {!loading &&
                    !error &&
                    game && (
                        <div
                            ref={playerRef}
                            className={
                                isFullscreen
                                    ? "relative h-screen w-screen overflow-hidden bg-black"
                                    : "relative h-[72vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-[#c68e22]/45 bg-black shadow-[0_24px_90px_rgba(0,0,0,.65)]"
                            }
                        >
                            {game.launchUrl ? (
                                <iframe
                                    src={game.launchUrl}
                                    title={game.name}
                                    allow="autoplay; fullscreen; gamepad; payment"
                                    allowFullScreen
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    className="absolute inset-0 h-full w-full border-0 bg-black"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center px-6">
                                    <div className="flex max-w-md flex-col items-center text-center">
                                        <Gamepad2
                                            size={48}
                                            className="text-[#dca832]"
                                        />

                                        <p className="mt-4 text-sm font-bold text-white/60">
                                            This game does not have a valid launch URL.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                            <p className="pointer-events-none absolute bottom-4 left-5 z-30 max-w-[70%] truncate text-sm font-black uppercase tracking-[.08em] text-white sm:text-base">
                                {game.name}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    void toggleFullscreen()
                                }
                                aria-label={
                                    isFullscreen
                                        ? "Exit fullscreen"
                                        : "Enter fullscreen"
                                }
                                title={
                                    isFullscreen
                                        ? "Exit fullscreen"
                                        : "Play fullscreen"
                                }
                                className="absolute right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-black/70 text-white backdrop-blur-md transition hover:border-[#f2c143] hover:text-[#f2c143]"
                            >
                                {isFullscreen ? (
                                    <Minimize size={19} />
                                ) : (
                                    <Expand size={19} />
                                )}
                            </button>
                        </div>
                    )}
            </div>
        </div>
    )
}

export default GamePlayerPage