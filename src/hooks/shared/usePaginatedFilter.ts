'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface PaginationInfo {
    page: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
}

interface UsePaginatedFilterReturn<T> {
    /** Datos filtrados (sin paginar) */
    filtered: T[];
    /** Datos filtrados y paginados (para mostrar en la tabla) */
    paginated: T[];
    /** Información de paginación */
    pagination: PaginationInfo;
    /** Cambiar de página */
    setPage: (page: number) => void;
    /** Página actual */
    currentPage: number;
}

const DEFAULT_ITEMS_PER_PAGE = 10;

/**
 * Hook genérico para filtrado + paginación client-side.
 * Reemplaza el patrón repetido de useMemo filter + pagination + page reset.
 *
 * @example
 * const { paginated, filtered, pagination, setPage } = usePaginatedFilter(
 *   participants,
 *   searchTerm,
 *   (item, term) => item.name.toLowerCase().includes(term) || item.email.toLowerCase().includes(term)
 * );
 */
export function usePaginatedFilter<T>(
    data: T[],
    searchTerm: string,
    filterFn: (item: T, term: string) => boolean,
    itemsPerPage: number = DEFAULT_ITEMS_PER_PAGE
): UsePaginatedFilterReturn<T> {
    const [currentPage, setCurrentPage] = useState(1);

    // Filtrar datos
    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return data;
        return data.filter(item => filterFn(item, term));
    }, [data, searchTerm, filterFn]);

    // Reset page cuando cambia el search o los datos
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Calcular paginación
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const validPage = Math.min(currentPage, totalPages);

    const pagination = useMemo(() => ({
        page: validPage,
        totalPages,
        itemsPerPage,
        totalItems: filtered.length,
    }), [validPage, totalPages, itemsPerPage, filtered.length]);

    // Datos paginados
    const paginated = useMemo(() => {
        const start = (validPage - 1) * itemsPerPage;
        return filtered.slice(start, start + itemsPerPage);
    }, [filtered, validPage, itemsPerPage]);

    const setPage = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    return { filtered, paginated, pagination, setPage, currentPage };
}
