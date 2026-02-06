'use client';

import { useState, useEffect, useCallback, useRef, DependencyList } from 'react';

interface UseAsyncDataOptions {
    /** Si false, no ejecuta el fetch automáticamente */
    enabled?: boolean;
    /** Callback cuando hay error */
    onError?: (error: Error) => void;
}

interface UseAsyncDataReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: (forceRefresh?: boolean) => Promise<void>;
}

/**
 * Hook genérico para fetch async con loading/error states.
 * Reemplaza el patrón repetido de useState + useEffect + try/catch.
 *
 * @example
 * const { data: tenant, loading, error } = useAsyncData(
 *   () => TenantService.getTenantBySlug(slug),
 *   [slug],
 *   { enabled: !!slug }
 * );
 */
export function useAsyncData<T>(
    fetchFn: () => Promise<T>,
    deps: DependencyList,
    options: UseAsyncDataOptions = {}
): UseAsyncDataReturn<T> {
    const { enabled = true, onError } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Ref para evitar updates en componentes desmontados
    const mountedRef = useRef(true);
    // Ref estable para fetchFn
    const fetchFnRef = useRef(fetchFn);
    fetchFnRef.current = fetchFn;

    const execute = useCallback(async () => {
        if (!mountedRef.current) return;

        try {
            setLoading(true);
            setError(null);
            const result = await fetchFnRef.current();
            if (mountedRef.current) {
                setData(result);
            }
        } catch (err) {
            if (mountedRef.current) {
                const message = err instanceof Error ? err.message : 'Error desconocido';
                setError(message);
                onError?.(err instanceof Error ? err : new Error(message));
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        mountedRef.current = true;
        if (enabled) {
            execute();
        } else {
            setLoading(false);
        }
        return () => {
            mountedRef.current = false;
        };
    }, [execute, enabled]);

    const refetch = useCallback(async () => {
        await execute();
    }, [execute]);

    return { data, loading, error, refetch };
}
