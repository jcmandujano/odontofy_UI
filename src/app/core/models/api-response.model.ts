export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    errors: ApiErrorDetail[] | null;
    requestId: string;
    meta?: ApiResponseMeta;
}

export interface ApiErrorDetail {
    code: string;
    message: string;
    path?: string;
}

export interface PaginationMeta {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ApiResponseMeta {
    pagination?: PaginationMeta;
}

export interface PaginatedResponse<T> {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    results: T[];
}

export const mapApiResponse = <T, U>(
    response: ApiResponse<T>,
    mapper: (value: T) => U
): ApiResponse<U> => ({
    ...response,
    data: response.data === null ? null : mapper(response.data)
});

export const mapPaginatedApiResponse = <T, U>(
    response: ApiResponse<T[]>,
    mapper: (value: T) => U
): ApiResponse<PaginatedResponse<U>> => {
    const pagination = response.meta?.pagination;
    const results = (response.data ?? []).map(mapper);

    return {
        ...response,
        data: {
            total: pagination?.total ?? results.length,
            page: pagination?.page ?? 1,
            perPage: pagination?.pageSize ?? results.length,
            totalPages: pagination?.totalPages ?? (results.length ? 1 : 0),
            results
        }
    };
};
