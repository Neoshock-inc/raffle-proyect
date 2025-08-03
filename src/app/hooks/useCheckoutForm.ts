import { useState } from 'react';
import { CheckoutFormData } from '../types/checkout';

const initialFormData: CheckoutFormData = {
    name: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    phone: '',
    country: 'Ecuador',
    province: '',
    city: '',
    address: '',
};

export const useCheckoutForm = () => {
    const [formData, setFormData] = useState<CheckoutFormData>(initialFormData);
    const [isOfLegalAge, setIsOfLegalAge] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setIsOfLegalAge(false);
    };

    return {
        formData,
        isOfLegalAge,
        setIsOfLegalAge,
        handleInputChange,
        resetForm
    };
};