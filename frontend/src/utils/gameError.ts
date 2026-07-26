export function getApiErrorMessage(
    error: unknown,
    fallback: string
): string {
    const apiError = error as {
        response?: {
            data?: {
                detail?: string | Array<{
                    loc?: Array<string | number>;
                    msg?: string;
                }>;
                message?: string;
            };
        };
        message?: string;
    };

    const detail = apiError.response?.data?.detail;

    if (typeof detail === "string") {
        return detail;
    }

    if (Array.isArray(detail)) {
        return detail
            .map((item) => {
                const field =
                    item.loc?.slice(1).join(".") || "field";
                return `${field}: ${item.msg || "Invalid value"}`;
            })
            .join("\n");
    }

    return (
        apiError.response?.data?.message ||
        apiError.message ||
        fallback
    );
}
