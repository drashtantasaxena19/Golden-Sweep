import {
    ExternalLink,
    Gamepad2,
    LoaderCircle,
    RefreshCw,
} from "lucide-react"
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"

import { useNavigate } from "react-router-dom"

import gameService from "../../services/gameService"
import { isAuthenticated } from "../../services/authStorage"
import type {
    GameListResponse,
    PublicGameFilter,
} from "../../types/game"

const TOTAL_ROWS = 5
const GAMES_VISIBLE_PER_ROW = 6
const SLIDER_START_COUNT =
    TOTAL_ROWS * GAMES_VISIBLE_PER_ROW
const AUTO_SCROLL_SPEED = 0.35

type NormalizedPublicGame = {
    id: string
    name: string
    shortName: string
    slug: string | null
    imageUrl: string | null
    launchUrl: string | null
    providerName: string | null
}

type UnknownRecord = Record<string, unknown>

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

const readBoolean = (
    source: UnknownRecord,
    keys: string[]
): boolean | null => {
    for (const key of keys) {
        const value = source[key]

        if (typeof value === "boolean") {
            return value
        }
    }

    return null
}

const createShortName = (name: string): string => {
    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)

    if (!parts.length) {
        return "GS"
    }

    return parts
        .slice(0, 2)
        .map(part =>
            part.charAt(0).toUpperCase()
        )
        .join("")
}

const extractGamesArray = (
    response: GameListResponse
): unknown[] => {
    const source = response as unknown

    if (Array.isArray(source)) {
        return source
    }

    if (!isRecord(source)) {
        return []
    }

    const directArrayKeys = [
        "games",
        "items",
        "results",
        "records",
    ]

    for (const key of directArrayKeys) {
        const value = source[key]

        if (Array.isArray(value)) {
            return value
        }
    }

    const data = source.data

    if (Array.isArray(data)) {
        return data
    }

    if (isRecord(data)) {
        for (const key of directArrayKeys) {
            const value = data[key]

            if (Array.isArray(value)) {
                return value
            }
        }
    }

    return []
}

const resolveImageUrl = (
    game: UnknownRecord
): string | null => {
    const directUrl =
        readString(game, [
            "thumbnail_url",
            "image_url",
            "cover_image_url",
            "logo_url",
            "banner_url",
            "image",
            "thumbnail",
        ]) ??
        readNestedString(game, [
            ["images", "thumbnail", "url"],
            ["images", "logo", "url"],
            ["images", "banner", "url"],
            ["thumbnail", "url"],
            ["logo", "url"],
            ["banner", "url"],
        ])

    if (directUrl) {
        return directUrl
    }

    const fileId =
        readString(game, [
            "thumbnail_file_id",
            "thumbnail_id",
            "image_file_id",
            "image_id",
            "logo_file_id",
            "logo_id",
            "banner_file_id",
            "banner_id",
        ]) ??
        readNestedString(game, [
            ["images", "thumbnail", "file_id"],
            ["images", "thumbnail", "id"],
            ["images", "logo", "file_id"],
            ["images", "logo", "id"],
            ["images", "banner", "file_id"],
            ["images", "banner", "id"],
            ["thumbnail", "file_id"],
            ["logo", "file_id"],
            ["banner", "file_id"],
        ])

    return gameService.getImageUrl(fileId)
}

const normalizePublicGame = (
    value: unknown,
    index: number
): NormalizedPublicGame | null => {
    if (!isRecord(value)) {
        return null
    }

    const isActive = readBoolean(value, [
        "is_active",
        "active",
    ])

    const isPublished = readBoolean(value, [
        "is_published",
        "published",
    ])

    const showOnLandingPage = readBoolean(
        value,
        [
            "show_on_landing_page",
            "landing_page_visible",
        ]
    )

    if (
        isActive === false ||
        isPublished === false ||
        showOnLandingPage === false
    ) {
        return null
    }

    const name =
        readString(value, [
            "display_name",
            "name",
            "title",
            "game_name",
        ]) ?? `Game ${index + 1}`

    const id =
        readString(value, [
            "id",
            "_id",
            "game_id",
            "uuid",
        ]) ??
        readString(value, ["slug"]) ??
        `${name}-${index}`

    const slug = readString(value, ["slug"])

    const launchUrl =
        readString(value, [
            "launch_url",
            "play_url",
            "game_url",
            "external_url",
            "url",
        ]) ??
        (slug
            ? `/games/${encodeURIComponent(slug)}`
            : null)

    const providerName =
        readString(value, [
            "provider_name",
            "provider",
            "studio_name",
        ]) ??
        readNestedString(value, [
            ["provider", "name"],
            ["studio", "name"],
        ])

    return {
        id,
        name,
        shortName: createShortName(name),
        slug,
        imageUrl: resolveImageUrl(value),
        launchUrl,
        providerName,
    }
}

const distributeGamesIntoRows = (
    games: NormalizedPublicGame[]
): NormalizedPublicGame[][] => {
    const rows = Array.from(
        { length: TOTAL_ROWS },
        () => [] as NormalizedPublicGame[]
    )

    const initialGames = games.slice(0, SLIDER_START_COUNT)

    initialGames.forEach((game, index) => {
        const rowIndex = Math.floor(
            index / GAMES_VISIBLE_PER_ROW
        )

        if (rowIndex < TOTAL_ROWS) {
            rows[rowIndex].push(game)
        }
    })

    const overflowGames = games.slice(
        SLIDER_START_COUNT
    )

    overflowGames.forEach((game, index) => {
        rows[index % TOTAL_ROWS].push(game)
    })

    return rows
}

const GamesSection = () => {
    const navigate = useNavigate()

    const [games, setGames] = useState<
        NormalizedPublicGame[]
    >([])
    const [loading, setLoading] =
        useState(true)
    const [error, setError] =
        useState<string | null>(null)
    const [failedImages, setFailedImages] =
        useState<Record<string, boolean>>({})

    const rowRefs = useRef<
        Array<HTMLDivElement | null>
    >([])
    const pausedRowsRef = useRef<
        Record<number, boolean>
    >({})
    const animationFrameRef =
        useRef<number | null>(null)

    const shouldSlide =
        games.length > SLIDER_START_COUNT

    const gameRows = useMemo(
        () => distributeGamesIntoRows(games),
        [games]
    )

    const loadGames = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const filters: PublicGameFilter = {
                page: 1,
                limit: 100,
                show_on_landing_page: true,
            }

            const response =
                await gameService.listPublicGames(filters)

            const normalizedGames =
                extractGamesArray(response)
                    .map(normalizePublicGame)
                    .filter(
                        (
                            game
                        ): game is NormalizedPublicGame =>
                            game !== null
                    )

            const uniqueGames = Array.from(
                new Map(
                    normalizedGames.map(game => [
                        game.id,
                        game,
                    ])
                ).values()
            )

            setGames(uniqueGames)
        } catch (requestError) {
            console.error(
                "Failed to load landing page games:",
                requestError
            )

            setError(
                "Games could not be loaded from the server."
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadGames()
    }, [loadGames])

    useEffect(() => {
        if (!shouldSlide) {
            return
        }

        /*
         * Odd visual rows:
         * Row 1, 3, 5 move left.
         *
         * Even visual rows:
         * Row 2, 4 move right.
         */
        rowRefs.current.forEach(
            (rowElement, rowIndex) => {
                if (!rowElement) {
                    return
                }

                const isEvenVisualRow =
                    (rowIndex + 1) % 2 === 0

                if (isEvenVisualRow) {
                    rowElement.scrollLeft =
                        rowElement.scrollWidth / 2
                } else {
                    rowElement.scrollLeft = 0
                }
            }
        )

        const animateRows = () => {
            rowRefs.current.forEach(
                (rowElement, rowIndex) => {
                    if (
                        !rowElement ||
                        pausedRowsRef.current[
                        rowIndex
                        ]
                    ) {
                        return
                    }

                    const duplicatedContentWidth =
                        rowElement.scrollWidth / 2

                    if (
                        duplicatedContentWidth <=
                        rowElement.clientWidth
                    ) {
                        return
                    }

                    const isOddVisualRow =
                        (rowIndex + 1) % 2 === 1

                    if (isOddVisualRow) {
                        /*
                         * Content visually moves left.
                         */
                        rowElement.scrollLeft +=
                            AUTO_SCROLL_SPEED

                        if (
                            rowElement.scrollLeft >=
                            duplicatedContentWidth
                        ) {
                            rowElement.scrollLeft -=
                                duplicatedContentWidth
                        }
                    } else {
                        /*
                         * Content visually moves right.
                         */
                        rowElement.scrollLeft -=
                            AUTO_SCROLL_SPEED

                        if (
                            rowElement.scrollLeft <= 0
                        ) {
                            rowElement.scrollLeft +=
                                duplicatedContentWidth
                        }
                    }
                }
            )

            animationFrameRef.current =
                window.requestAnimationFrame(
                    animateRows
                )
        }

        animationFrameRef.current =
            window.requestAnimationFrame(
                animateRows
            )

        return () => {
            if (
                animationFrameRef.current !== null
            ) {
                window.cancelAnimationFrame(
                    animationFrameRef.current
                )
            }
        }
    }, [gameRows, shouldSlide])

    const handleGameClick = (
        game: NormalizedPublicGame
    ) => {
        const gameIdentifier = game.slug ?? game.id
        const gameDestination = `/games/${encodeURIComponent(
            gameIdentifier
        )}`

        if (!isAuthenticated()) {
            navigate(
                `/login?redirect=${encodeURIComponent(
                    gameDestination
                )}`
            )
            return
        }

        void gameService
            .registerGamePlay(game.id)
            .catch(requestError => {
                console.warn(
                    "Game play registration failed:",
                    requestError
                )
            })

        navigate(gameDestination)
    }

    return (
        <section
            id="games"
            className="relative overflow-hidden bg-[#02030a] pb-10 pt-8"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_center_top,rgba(255,180,0,.09),transparent_70%)]" />

            <div className="relative mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-center gap-4">
                    <span className="h-px w-12 bg-gradient-to-r from-transparent via-[#8d651e] to-[#c6922b] sm:w-24" />

                    <h2 className="whitespace-nowrap text-center text-[11px] font-black uppercase tracking-[.22em] text-[#f2c143] sm:text-[13px]">
                        YOUR FAVORITE GAMING WORLDS
                    </h2>

                    <span className="h-px w-12 bg-gradient-to-l from-transparent via-[#8d651e] to-[#c6922b] sm:w-24" />
                </div>

                {loading && (
                    <div className="flex min-h-[650px] items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-[#f2c143]">
                            <LoaderCircle
                                size={38}
                                className="animate-spin"
                            />

                            <p className="text-xs font-black uppercase tracking-[.18em]">
                                Loading live games
                            </p>
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex min-h-[320px] items-center justify-center">
                        <div className="flex max-w-md flex-col items-center rounded-2xl border border-red-400/15 bg-red-500/[.04] px-8 py-7 text-center">
                            <p className="text-sm font-bold text-red-200">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    void loadGames()
                                }
                                className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dca832]/35 bg-[#dca832]/[.06] px-5 text-xs font-black uppercase tracking-wide text-[#f2c143] transition hover:border-[#f2c143]"
                            >
                                <RefreshCw size={15} />
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {!loading &&
                    !error &&
                    games.length === 0 && (
                        <div className="flex min-h-[320px] items-center justify-center">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e2aa30]/20 bg-[#e2aa30]/[.05] text-[#f2c143]">
                                    <Gamepad2 size={30} />
                                </div>

                                <p className="text-sm font-bold text-white/55">
                                    No landing-page games are
                                    currently available.
                                </p>
                            </div>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    games.length > 0 && (
                        <div className="space-y-3">
                            {gameRows.map(
                                (
                                    rowGames,
                                    rowIndex
                                ) => {
                                    if (
                                        rowGames.length ===
                                        0
                                    ) {
                                        return null
                                    }

                                    const displayGames =
                                        shouldSlide
                                            ? [
                                                ...rowGames,
                                                ...rowGames,
                                            ]
                                            : rowGames

                                    return (
                                        <div
                                            key={`games-row-${rowIndex}`}
                                            className="relative overflow-hidden"
                                        >
                                            {shouldSlide && (
                                                <>
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-[#02030a] to-transparent sm:w-14" />

                                                    <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-[#02030a] to-transparent sm:w-14" />
                                                </>
                                            )}

                                            <div
                                                ref={element => {
                                                    rowRefs.current[
                                                        rowIndex
                                                    ] = element
                                                }}
                                                onMouseEnter={() => {
                                                    pausedRowsRef.current[
                                                        rowIndex
                                                    ] = true
                                                }}
                                                onMouseLeave={() => {
                                                    pausedRowsRef.current[
                                                        rowIndex
                                                    ] = false
                                                }}
                                                className={`flex gap-3 py-1 ${shouldSlide
                                                    ? "justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                                    : "justify-center overflow-hidden"
                                                    }`}
                                            >
                                                {displayGames.map(
                                                    (
                                                        game,
                                                        displayIndex
                                                    ) => {
                                                        const imageKey =
                                                            `${game.id}-${displayIndex}`

                                                        const imageFailed =
                                                            failedImages[
                                                            imageKey
                                                            ]

                                                        return (
                                                            <button
                                                                key={
                                                                    imageKey
                                                                }
                                                                type="button"
                                                                aria-label={`Play ${game.name}`}
                                                                onClick={() =>
                                                                    handleGameClick(
                                                                        game
                                                                    )
                                                                }
                                                                className="group relative h-[148px] min-w-[calc((100%-12px)/2)] cursor-pointer overflow-hidden rounded-[15px] border border-[#a97619]/45 bg-[#060811] text-left shadow-[0_10px_26px_rgba(0,0,0,.3)] transition duration-300 hover:-translate-y-1 hover:border-[#efb72f] hover:shadow-[0_16px_35px_rgba(0,0,0,.45),0_0_24px_rgba(255,176,20,.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#efb72f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#02030a] sm:h-[158px] sm:min-w-[calc((100%-24px)/3)] md:min-w-[calc((100%-36px)/4)] lg:min-w-[calc((100%-48px)/5)] xl:min-w-[calc((100%-60px)/6)]"
                                                            >
                                                                <div className="absolute inset-x-0 bottom-[38px] top-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,184,0,.11),transparent_58%),linear-gradient(180deg,#0c0d16,#070810)] p-3">
                                                                    {game.imageUrl &&
                                                                        !imageFailed ? (
                                                                        <img
                                                                            src={
                                                                                game.imageUrl
                                                                            }
                                                                            alt={
                                                                                game.name
                                                                            }
                                                                            loading="lazy"
                                                                            className="h-full w-full object-contain object-center drop-shadow-[0_5px_15px_rgba(0,0,0,.38)] transition duration-500 group-hover:scale-[1.06]"
                                                                            onError={() =>
                                                                                setFailedImages(
                                                                                    previous => ({
                                                                                        ...previous,
                                                                                        [imageKey]:
                                                                                            true,
                                                                                    })
                                                                                )
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <div className="flex h-[78px] w-[78px] items-center justify-center rounded-2xl border border-[#e9b43b]/15 bg-[#e9b43b]/[.04] text-2xl font-black text-[#e9b43b]/55">
                                                                            {
                                                                                game.shortName
                                                                            }
                                                                        </div>
                                                                    )}

                                                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#02030a]/30 via-transparent to-white/[.015]" />

                                                                    {game.launchUrl && (
                                                                        <div className="absolute right-2.5 top-2.5 flex h-8 w-8 -translate-y-1 items-center justify-center rounded-full border border-[#efb72f]/30 bg-black/70 text-[#f2c143] opacity-0 backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                                                            <ExternalLink
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="absolute inset-x-0 bottom-0 flex h-[38px] items-center justify-center border-t border-white/[.05] bg-[#03040a]/95 px-2 backdrop-blur-md">
                                                                    <div className="min-w-0 text-center">
                                                                        <p className="truncate text-[10px] font-black uppercase tracking-[.03em] text-white sm:text-[11px]">
                                                                            {
                                                                                game.name
                                                                            }
                                                                        </p>

                                                                        {game.providerName && (
                                                                            <p className="mt-0.5 truncate text-[8px] font-semibold uppercase tracking-wider text-white/30">
                                                                                {
                                                                                    game.providerName
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="pointer-events-none absolute inset-[3px] rounded-[12px] border border-[#efb72f]/0 transition group-hover:border-[#efb72f]/20" />

                                                                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#ffd25d] to-transparent opacity-0 transition group-hover:opacity-100" />
                                                            </button>
                                                        )
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    )
                                }
                            )}

                            <div className="pt-2 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/25">
                                    {games.length} live games
                                    available
                                    {shouldSlide
                                        ? " • Auto sliding"
                                        : ""}
                                </p>
                            </div>
                        </div>
                    )}
            </div>
        </section>
    )
}

export default GamesSection