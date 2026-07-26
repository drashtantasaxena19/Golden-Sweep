import { useMemo, useState } from "react";
import {
    ImageIcon,
    Loader2,
    Save,
    Upload,
} from "lucide-react";

import {
    GAME_CATEGORY_LABELS,
    GAME_CATEGORY_OPTIONS,
    GAME_ORIENTATION_LABELS,
    GAME_ORIENTATION_OPTIONS,
} from "../../../types/game";
import type {
    GameCreate,
    GameImageFiles,
    GameImageType,
    GameResponse,
    GameUpdate,
    NewGameImageFiles,
} from "../../../types/game";

type SubmitHandler = {
    (values: GameCreate, files: NewGameImageFiles): void;
    (values: GameUpdate, files: GameImageFiles): void;
};

interface GameFormProps {
    mode: "create" | "edit";
    loading: boolean;
    initialValues?: GameResponse;
    onSubmit: SubmitHandler;
    onCancel: () => void;
}

const ACCEPTED_IMAGE_TYPES =
    "image/jpeg,image/png,image/webp";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const buildInitialState = (
    initialValues?: GameResponse
): GameCreate => ({
    name: initialValues?.name ?? "",
    slug: initialValues?.slug ?? "",
    short_description:
        initialValues?.short_description ?? "",
    description: initialValues?.description ?? "",
    category: initialValues?.category ?? "other",
    game_url: initialValues?.game_url ?? "",
    entry_fee_coins: initialValues?.entry_fee_coins ?? 0,
    minimum_age: initialValues?.minimum_age ?? 18,
    provider_name: initialValues?.provider_name ?? "",
    provider_game_id:
        initialValues?.provider_game_id ?? "",
    orientation:
        initialValues?.orientation ?? "responsive",
    tags: initialValues?.tags ?? [],
    instructions: initialValues?.instructions ?? "",
    terms_and_conditions:
        initialValues?.terms_and_conditions ?? "",
    is_featured: initialValues?.is_featured ?? false,
    show_on_landing_page:
        initialValues?.show_on_landing_page ?? true,
    sort_order: initialValues?.sort_order ?? 0,
    opens_in_new_tab:
        initialValues?.opens_in_new_tab ?? true,
    is_mobile_supported:
        initialValues?.is_mobile_supported ?? true,
    is_desktop_supported:
        initialValues?.is_desktop_supported ?? true,
});

const slugify = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const GameForm = ({
    mode,
    loading,
    initialValues,
    onSubmit,
    onCancel,
}: GameFormProps) => {
    const [values, setValues] = useState<GameCreate>(
        buildInitialState(initialValues)
    );
    const [tagsInput, setTagsInput] = useState(
        (initialValues?.tags ?? []).join(", ")
    );
    const [slugTouched, setSlugTouched] =
        useState(mode === "edit");
    const [files, setFiles] = useState<GameImageFiles>({});
    const [fileError, setFileError] = useState<string>();

    const previews = useMemo(() => {
        const result: Partial<Record<GameImageType, string>> = {};
        for (const imageType of [
            "logo",
            "thumbnail",
            "banner",
        ] as const) {
            const file = files[imageType];
            if (file) {
                result[imageType] = URL.createObjectURL(file);
            }
        }
        return result;
    }, [files]);

    const update = <K extends keyof GameCreate>(
        key: K,
        value: GameCreate[K]
    ) => {
        setValues((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const handleNameChange = (name: string) => {
        update("name", name);
        if (!slugTouched) update("slug", slugify(name));
    };

    const selectFile = (
        imageType: GameImageType,
        file?: File
    ) => {
        setFileError(undefined);
        if (!file) return;

        if (
            ![
                "image/jpeg",
                "image/png",
                "image/webp",
            ].includes(file.type)
        ) {
            setFileError(
                "Only JPG, PNG, and WEBP files are allowed."
            );
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setFileError("Each image must be 5 MB or smaller.");
            return;
        }

        setFiles((previous) => ({
            ...previous,
            [imageType]: file,
        }));
    };

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (mode === "create" && !files.logo) {
            setFileError(
                "Logo is required before the game can be created."
            );
            return;
        }

        const payload: GameCreate = {
            ...values,
            slug: slugify(values.slug),
            tags: tagsInput
                .split(",")
                .map((tag) => tag.trim().toLowerCase())
                .filter(Boolean),
            provider_name:
                values.provider_name?.trim() || undefined,
            provider_game_id:
                values.provider_game_id?.trim() || undefined,
            instructions:
                values.instructions?.trim() || undefined,
            terms_and_conditions:
                values.terms_and_conditions?.trim() ||
                undefined,
        };

        if (mode === "create") {
            onSubmit(
                payload,
                files as NewGameImageFiles
            );
        } else {
            onSubmit(payload, files);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 text-slate-200"
        >
            <section className="grid gap-5 rounded-2xl border border-yellow-500/15 bg-[#0A0C12] p-6 md:grid-cols-2">
                <Field label="Game Name">
                    <input
                        required
                        minLength={2}
                        maxLength={120}
                        value={values.name}
                        onChange={(event) =>
                            handleNameChange(event.target.value)
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Slug">
                    <input
                        required
                        minLength={2}
                        maxLength={140}
                        value={values.slug}
                        onChange={(event) => {
                            setSlugTouched(true);
                            update("slug", event.target.value);
                        }}
                        className={inputClass}
                    />
                </Field>

                <Field label="Category">
                    <select
                        value={values.category}
                        onChange={(event) =>
                            update(
                                "category",
                                event.target
                                    .value as GameCreate["category"]
                            )
                        }
                        className={inputClass}
                    >
                        {GAME_CATEGORY_OPTIONS.map((item) => (
                            <option key={item} value={item}>
                                {GAME_CATEGORY_LABELS[item]}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Orientation">
                    <select
                        value={values.orientation}
                        onChange={(event) =>
                            update(
                                "orientation",
                                event.target
                                    .value as GameCreate["orientation"]
                            )
                        }
                        className={inputClass}
                    >
                        {GAME_ORIENTATION_OPTIONS.map(
                            (item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {
                                        GAME_ORIENTATION_LABELS[
                                            item
                                        ]
                                    }
                                </option>
                            )
                        )}
                    </select>
                </Field>

                <Field
                    label="Short Description"
                    wide
                >
                    <input
                        required
                        minLength={10}
                        maxLength={240}
                        value={values.short_description}
                        onChange={(event) =>
                            update(
                                "short_description",
                                event.target.value
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Description" wide>
                    <textarea
                        required
                        minLength={20}
                        maxLength={5000}
                        rows={5}
                        value={values.description}
                        onChange={(event) =>
                            update(
                                "description",
                                event.target.value
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Game URL" wide>
                    <input
                        required
                        type="url"
                        value={values.game_url}
                        onChange={(event) =>
                            update(
                                "game_url",
                                event.target.value
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Provider Name">
                    <input
                        maxLength={120}
                        value={values.provider_name ?? ""}
                        onChange={(event) =>
                            update(
                                "provider_name",
                                event.target.value
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Provider Game ID">
                    <input
                        maxLength={160}
                        value={values.provider_game_id ?? ""}
                        onChange={(event) =>
                            update(
                                "provider_game_id",
                                event.target.value
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Entry Fee (coins)">
                    <input
                        required
                        type="number"
                        min={0}
                        value={values.entry_fee_coins}
                        onChange={(event) =>
                            update(
                                "entry_fee_coins",
                                Number(event.target.value)
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Minimum Age">
                    <input
                        required
                        type="number"
                        min={0}
                        max={100}
                        value={values.minimum_age}
                        onChange={(event) =>
                            update(
                                "minimum_age",
                                Number(event.target.value)
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Sort Order">
                    <input
                        type="number"
                        min={0}
                        value={values.sort_order}
                        onChange={(event) =>
                            update(
                                "sort_order",
                                Number(event.target.value)
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Tags (comma separated)">
                    <input
                        value={tagsInput}
                        onChange={(event) =>
                            setTagsInput(event.target.value)
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Instructions" wide>
                    <textarea
                        rows={3}
                        maxLength={5000}
                        value={values.instructions ?? ""}
                        onChange={(event) =>
                            update(
                                "instructions",
                                event.target.value
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <Field
                    label="Terms & Conditions"
                    wide
                >
                    <textarea
                        rows={3}
                        maxLength={5000}
                        value={
                            values.terms_and_conditions ?? ""
                        }
                        onChange={(event) =>
                            update(
                                "terms_and_conditions",
                                event.target.value
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <div className="flex flex-wrap gap-5 md:col-span-2">
                    <Check
                        label="Featured"
                        checked={values.is_featured}
                        onChange={(checked) =>
                            update("is_featured", checked)
                        }
                    />
                    <Check
                        label="Show on landing page"
                        checked={
                            values.show_on_landing_page
                        }
                        onChange={(checked) =>
                            update(
                                "show_on_landing_page",
                                checked
                            )
                        }
                    />
                    <Check
                        label="Open in new tab"
                        checked={values.opens_in_new_tab}
                        onChange={(checked) =>
                            update(
                                "opens_in_new_tab",
                                checked
                            )
                        }
                    />
                    <Check
                        label="Mobile supported"
                        checked={
                            values.is_mobile_supported
                        }
                        onChange={(checked) =>
                            update(
                                "is_mobile_supported",
                                checked
                            )
                        }
                    />
                    <Check
                        label="Desktop supported"
                        checked={
                            values.is_desktop_supported
                        }
                        onChange={(checked) =>
                            update(
                                "is_desktop_supported",
                                checked
                            )
                        }
                    />
                </div>
            </section>

            <section className="rounded-2xl border border-yellow-500/15 bg-[#0A0C12] p-6">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-white">
                        Game Images
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Logo is required. Thumbnail and banner
                        are optional. Uploading a logo publishes
                        a valid game automatically.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {(
                        [
                            ["logo", "Logo", true],
                            [
                                "thumbnail",
                                "Thumbnail",
                                false,
                            ],
                            ["banner", "Banner", false],
                        ] as const
                    ).map(([type, label, required]) => (
                        <label
                            key={type}
                            className="cursor-pointer rounded-xl border border-dashed border-yellow-500/25 bg-[#11141C] p-4 transition hover:border-yellow-400/50"
                        >
                            <span className="mb-3 block font-medium text-white">
                                {label}
                                {required && (
                                    <span className="text-yellow-400">
                                        {" "}
                                        *
                                    </span>
                                )}
                            </span>

                            <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg bg-black/20">
                                {previews[type] ? (
                                    <img
                                        src={previews[type]}
                                        alt={`${label} preview`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon
                                        size={36}
                                        className="text-slate-600"
                                    />
                                )}
                            </div>

                            <span className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300">
                                <Upload size={15} />
                                {files[type]
                                    ? "Replace"
                                    : "Select file"}
                            </span>

                            <input
                                type="file"
                                accept={ACCEPTED_IMAGE_TYPES}
                                className="hidden"
                                onChange={(event) =>
                                    selectFile(
                                        type,
                                        event.target.files?.[0]
                                    )
                                }
                            />
                        </label>
                    ))}
                </div>

                {fileError && (
                    <p className="mt-4 text-sm text-red-400">
                        {fileError}
                    </p>
                )}
            </section>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded-xl border border-white/10 px-5 py-3 text-slate-300 hover:bg-white/5 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black hover:bg-yellow-400 disabled:opacity-60"
                >
                    {loading ? (
                        <Loader2
                            size={18}
                            className="animate-spin"
                        />
                    ) : (
                        <Save size={18} />
                    )}
                    {mode === "create"
                        ? "Create & Upload"
                        : "Save Changes"}
                </button>
            </div>
        </form>
    );
};

const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#11141C] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/10";

const Field = ({
    label,
    wide = false,
    children,
}: {
    label: string;
    wide?: boolean;
    children: React.ReactNode;
}) => (
    <label className={wide ? "md:col-span-2" : ""}>
        <span className="mb-2 block text-sm font-medium text-slate-300">
            {label}
        </span>
        {children}
    </label>
);

const Check = ({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) => (
    <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
            type="checkbox"
            checked={checked}
            onChange={(event) =>
                onChange(event.target.checked)
            }
            className="h-4 w-4 accent-yellow-400"
        />
        {label}
    </label>
);

export default GameForm;
