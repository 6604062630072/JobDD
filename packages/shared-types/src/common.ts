export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
}

export interface SearchResponse<T> {
    hits: T[];
    totalHits: number;
    processingTimeMs: number;
    query: string;
    facets?: Record<string, Record<string, number>>;
}
