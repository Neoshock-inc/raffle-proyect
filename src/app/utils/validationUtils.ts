import { CheckoutFormData } from "../types/checkout";

export const validateCheckoutForm = (
    formData: CheckoutFormData,
    isOfLegalAge: boolean
): { isValid: boolean; error?: string } => {
    if (!formData.name || !formData.lastName || !formData.email || !formData.phone) {
        return {
            isValid: false,
            error: 'Por favor completa todos los campos obligatorios (*)'
        };
    }

    if (formData.email !== formData.confirmEmail) {
        return {
            isValid: false,
            error: 'Los correos electrónicos no coinciden'
        };
    }

    if (!isOfLegalAge) {
        return {
            isValid: false,
            error: 'Debes confirmar que eres mayor de 18 años para continuar.'
        };
    }

    return { isValid: true };
};