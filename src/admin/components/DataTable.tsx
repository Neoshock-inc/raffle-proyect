import { SetStateAction, useEffect, useRef, useState } from 'react';

import { Pencil, Trash, Eye, Plus, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { cn } from './ui/cn';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useTenantContext } from '../contexts/TenantContext';
import { formatTenantCurrency } from '../utils/currency';

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };
    return new Intl.DateTimeFormat('es-ES', options).format(date);
}

// formatCurrency is now handled inside the component via formatTenantCurrency

export interface Column<T = any> {
    key: string;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
    isStatus?: boolean;
    isBoolean?: boolean;
    isDate?: boolean;
    isCurrency?: boolean;
    align?: 'left' | 'center' | 'right';
    className?: string;
    minWidth?: string;
    maxWidth?: string;
}

interface TableAction {
    read?: boolean;
    edit?: boolean;
    delete?: boolean;
    create?: boolean;
}

export interface CustomAction {
    label: string;
    onClick: (item: any) => void;
    confirm?: boolean;
}

interface DataTableProps<T = any> {
    title?: string;
    data: T[];
    columns: Column<T>[];
    actions?: TableAction;
    customActions?: (row: T) => CustomAction[];
    onAction?: {
        onRead?: (item: any) => void;
        onEdit?: (item: any) => void;
        onDelete?: (item: any) => void;
        onCreate?: () => void;
    };
    filterable?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    rowsPerPage?: number;
    loading?: boolean;
    loadingRows?: number;
    emptyMessage?: string;
    emptyAction?: React.ReactNode;
    headerRight?: React.ReactNode;
    height?: string | 'auto';
    maxHeight?: string;
    getRowKey?: (row: T, i: number) => string | number;
}

interface MenuProps {
    row: any;
    customActions?: (row: any) => CustomAction[];
}

function Menu({ row, customActions }: MenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const items = customActions?.(row) ?? [];

    return (
        <div className="relative overflow-visible" ref={ref}>
            <button onClick={() => setOpen((prev) => !prev)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <MoreVertical className="w-4 h-4" />
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border dark:border-gray-600 shadow-lg rounded-md z-50">
                    {items.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setOpen(false);
                                if (!action.confirm || confirm(`¿${action.label}?`)) {
                                    action.onClick(row);
                                }
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function statusVariant(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status?.toLowerCase()) {
        case 'completed':
        case 'completado':
            return 'success';
        case 'pending':
        case 'pendiente':
            return 'warning';
        case 'failed':
        case 'fallido':
            return 'danger';
        default:
            return 'neutral';
    }
}

export default function DataTable<T = any>({
    title,
    data,
    columns,
    actions = {},
    customActions,
    onAction,
    filterable = false,
    searchable = false,
    searchPlaceholder = 'Buscar...',
    rowsPerPage = 10,
    loading = false,
    loadingRows = 5,
    emptyMessage = 'No se han encontrado registros.',
    emptyAction,
    headerRight,
    height = 'auto',
    maxHeight,
    getRowKey,
}: DataTableProps<T>) {
    const { tenantCountry } = useTenantContext();
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredData = searchable
        ? data.filter((row) =>
            columns.some((col) =>
                String((row as any)[col.key] ?? '')
                    .toLowerCase()
                    .includes(query.toLowerCase())
            )
        )
        : data;

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

    const hasActions = actions.read || actions.edit || actions.delete || customActions;

    const renderCell = (col: Column<T>, row: T) => {
        const value = (row as any)[col.key];

        // Custom render takes priority
        if (col.render) {
            return col.render(value, row);
        }

        // isStatus
        if (col.isStatus) {
            return (
                <Badge variant={statusVariant(value)}>
                    {value}
                </Badge>
            );
        }

        // isBoolean
        if (col.isBoolean || typeof value === 'boolean') {
            return (
                <Badge variant={value ? 'success' : 'danger'}>
                    {value ? 'Sí' : 'No'}
                </Badge>
            );
        }

        // isDate
        if (col.isDate && value) {
            return formatDate(value);
        }

        // isCurrency
        if (col.isCurrency && typeof value === 'number') {
            return formatTenantCurrency(value, tenantCountry);
        }

        return value;
    };

    const alignClass = (align?: string) => {
        switch (align) {
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            default: return 'text-left';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
                {title && <h2 className="font-semibold text-lg dark:text-gray-100">{title}</h2>}
                <div className="flex gap-2 items-center ml-auto">
                    {searchable && (
                        <Input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="max-w-xs"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    )}
                    {actions.create && (
                        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => onAction?.onCreate?.()}>
                            Crear
                        </Button>
                    )}
                    {headerRight}
                </div>
            </div>

            <div
                className="overflow-y-auto"
                style={{
                    height: height === 'auto' ? undefined : height,
                    maxHeight: maxHeight || undefined,
                }}
            >
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        "py-2 px-3 capitalize text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis",
                                        alignClass(col.align),
                                        col.className
                                    )}
                                    style={{
                                        minWidth: col.minWidth || undefined,
                                        maxWidth: col.maxWidth || undefined,
                                    }}
                                    title={col.label}
                                >
                                    {col.label}
                                </th>
                            ))}
                            {hasActions && (
                                <th className="py-2 px-3 text-left capitalize text-sm font-semibold whitespace-nowrap">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(loadingRows)].map((_, i) => (
                                <tr key={`skeleton-${i}`} className="border-b dark:border-gray-700">
                                    {columns.map((col) => (
                                        <td key={col.key} className="py-2 px-3">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                                        </td>
                                    ))}
                                    {hasActions && (
                                        <td className="py-2 px-3">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-6" />
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : currentData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (hasActions ? 1 : 0)}
                                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                                >
                                    <div>{emptyMessage}</div>
                                    {emptyAction && <div className="mt-2">{emptyAction}</div>}
                                </td>
                            </tr>
                        ) : (
                            currentData.map((row, i) => (
                                <tr
                                    key={getRowKey ? getRowKey(row, i) : i}
                                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={cn(
                                                "py-2 px-3 text-sm whitespace-nowrap",
                                                alignClass(col.align),
                                                col.className
                                            )}
                                            style={{
                                                minWidth: col.minWidth || undefined,
                                                maxWidth: col.maxWidth || undefined,
                                            }}
                                        >
                                            {renderCell(col, row)}
                                        </td>
                                    ))}
                                    {hasActions ? (
                                        <td className="py-2 px-3">
                                            <div className="relative">
                                                <Menu row={row} customActions={customActions} />
                                            </div>
                                        </td>
                                    ) : null}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-end gap-2 mt-4 text-sm items-center dark:text-gray-300">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4 text-indigo-500" />
                    </Button>
                    <span className="px-2 py-1">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="w-4 h-4 text-indigo-500" />
                    </Button>
                </div>
            )}
        </div>
    );
}
