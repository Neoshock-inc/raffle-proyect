'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface CrudOperationOptions {
    successMessage: string;
    errorMessage: string;
    onSuccess?: () => void;
    /** Si true, no muestra toast (para cuando el caller quiere controlar el toast) */
    silent?: boolean;
}

interface UseCrudOperationReturn<TInput, TOutput = void> {
    execute: (input: TInput) => Promise<TOutput | undefined>;
    loading: boolean;
}

/**
 * Hook genérico para operaciones CRUD con loading state y toast.
 * Reemplaza el patrón repetido de try/setLoading/toast en 10+ hooks.
 *
 * @example
 * const { execute: createNew, loading: creating } = useCrudOperation(
 *   (data: CreateParticipantData) => createParticipant(data),
 *   { successMessage: 'Participante creado', errorMessage: 'Error al crear' }
 * );
 */
export function useCrudOperation<TInput, TOutput = void>(
    operation: (input: TInput) => Promise<TOutput>,
    options: CrudOperationOptions
): UseCrudOperationReturn<TInput, TOutput> {
    const [loading, setLoading] = useState(false);
    const optionsRef = useRef(options);
    optionsRef.current = options;
    const operationRef = useRef(operation);
    operationRef.current = operation;

    const execute = useCallback(async (input: TInput): Promise<TOutput | undefined> => {
        const opts = optionsRef.current;
        try {
            setLoading(true);
            const result = await operationRef.current(input);
            if (!opts.silent) {
                toast.success(opts.successMessage);
            }
            opts.onSuccess?.();
            return result;
        } catch (err) {
            if (!opts.silent) {
                toast.error(opts.errorMessage);
            }
            console.error(opts.errorMessage, err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { execute, loading };
}
