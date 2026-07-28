export interface UserFilterValues {
    search: string;
    role: string;
    status: string;
    verified: string;
    country: string;
}

interface UserFiltersProps {
    value: UserFilterValues;
    roles: string[];
    countries: string[];
    loading?: boolean;
    onChange: (value: UserFilterValues) => void;
    onApply: () => void;
    onReset: () => void;
}

const inputClass =
    "h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-amber-400/50 disabled:cursor-not-allowed disabled:opacity-50";

export default function UserFilters({
    value,
    roles,
    countries,
    loading = false,
    onChange,
    onApply,
    onReset,
}: UserFiltersProps) {
    const updateField = <K extends keyof UserFilterValues>(
        field: K,
        fieldValue: UserFilterValues[K],
    ): void => {
        onChange({
            ...value,
            [field]: fieldValue,
        });
    };

    return (
        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <input
                    type="search"
                    value={value.search}
                    disabled={loading}
                    placeholder="Search users..."
                    aria-label="Search users"
                    onChange={(event) =>
                        updateField("search", event.target.value)
                    }
                    className={inputClass}
                />

                <select
                    value={value.role}
                    disabled={loading}
                    aria-label="Filter by role"
                    onChange={(event) =>
                        updateField("role", event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="">All roles</option>

                    {roles.map((role) => (
                        <option key={role} value={role}>
                            {role
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (character) =>
                                    character.toUpperCase(),
                                )}
                        </option>
                    ))}
                </select>

                <select
                    value={value.status}
                    disabled={loading}
                    aria-label="Filter by account status"
                    onChange={(event) =>
                        updateField("status", event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                </select>

                <select
                    value={value.verified}
                    disabled={loading}
                    aria-label="Filter by verification status"
                    onChange={(event) =>
                        updateField("verified", event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="">All verification</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                </select>

                <select
                    value={value.country}
                    disabled={loading}
                    aria-label="Filter by country"
                    onChange={(event) =>
                        updateField("country", event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="">All countries</option>

                    {countries.map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    disabled={loading}
                    onClick={onReset}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Reset
                </button>

                <button
                    type="button"
                    disabled={loading}
                    onClick={onApply}
                    className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Apply Filters
                </button>
            </div>
        </section>
    );
}