'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface RaffleEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    createEntryFromOrder: (orderNumber: string, quantity: number) => Promise<any>;
}

export default function RaffleEntryModal({ isOpen, onClose, onSuccess, createEntryFromOrder }: RaffleEntryModalProps) {
    const [orderNumber, setOrderNumber] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!orderNumber.trim()) {
            toast.error('Debes ingresar un número de orden');
            return;
        }

        if (!quantity || quantity <= 0) {
            toast.error('La cantidad debe ser un número positivo');
            return;
        }

        setLoading(true);
        try {
            const result = await createEntryFromOrder(orderNumber, Number(quantity));
            console.log('Resultado de la operación:', result);

            if (result.success) {
                if (result.assigned) {
                    console.log(`Se asignaron ${result.total_assigned} números correctamente`);
                } else {
                    console.log(result.message);
                }
                onSuccess();
                resetForm();
            } else {
                console.error('Error detallado:', result.error);
            }
        } catch (error) {
            console.error('Error inesperado al procesar la solicitud:', error);
            toast.error(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setOrderNumber('');
        setQuantity('');
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={resetForm}
            title="Registrar Nuevos Números"
            footer={
                <>
                    <Button variant="secondary" onClick={resetForm} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} loading={loading}>
                        Registrar
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <Input
                    label="Número de Orden"
                    id="orderNumber"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ingrese el número de orden"
                    disabled={loading}
                />

                <Input
                    label="Cantidad de Números"
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : '')}
                    onKeyDown={handleKeyDown}
                    placeholder="Ingrese la cantidad"
                    disabled={loading}
                />
            </div>
        </Modal>
    );
}
