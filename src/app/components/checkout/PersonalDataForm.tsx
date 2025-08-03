import { ECUADOR_PROVINCES } from '@/app/constants/ecuadorProvinces';
import { CheckoutFormData } from '@/app/types/checkout';
import React from 'react';

interface PersonalDataFormProps {
    formData: CheckoutFormData;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    isProcessing: boolean;
}

export const PersonalDataForm: React.FC<PersonalDataFormProps> = ({
    formData,
    onInputChange,
    isProcessing
}) => {
    return (
        <div className="bg-white p-6 rounded-md shadow space-y-4 border">
            <h3 className="text-xl font-semibold mb-4">Datos Personales</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 mb-1">Nombre *</label>
                    <input
                        placeholder='Ej. Juan'
                        name="name"
                        value={formData.name}
                        onChange={onInputChange}
                        disabled={isProcessing}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">Apellido *</label>
                    <input
                        placeholder='Ej. Pérez'
                        name="lastName"
                        value={formData.lastName}
                        onChange={onInputChange}
                        disabled={isProcessing}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    />
                </div>
            </div>

            <div>
                <label className="block text-gray-700 mb-1">Email *</label>
                <input
                    placeholder='Ej. correo@correo.com'
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={onInputChange}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
            </div>

            <div>
                <label className="block text-gray-700 mb-1">Confirmar Email *</label>
                <input
                    placeholder='Ej. correo@correo.com'
                    name="confirmEmail"
                    type="email"
                    value={formData.confirmEmail}
                    onChange={onInputChange}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
            </div>

            <div>
                <label className="block text-gray-700 mb-1">Teléfono *</label>
                <input
                    placeholder='Ej. 0991234567'
                    name="phone"
                    value={formData.phone}
                    onChange={onInputChange}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 mb-1">País *</label>
                    <input
                        placeholder='Ej. Ecuador'
                        name="country"
                        value={formData.country}
                        readOnly
                        className="w-full px-4 py-2 border rounded-md bg-gray-100"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">Provincia *</label>
                    <select
                        title='Seleccione...'
                        name="province"
                        value={formData.province}
                        onChange={onInputChange}
                        disabled={isProcessing}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                        <option value="">Seleccione...</option>
                        {ECUADOR_PROVINCES.map(province => (
                            <option key={province} value={province}>{province}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-gray-700 mb-1">Ciudad *</label>
                <input
                    placeholder='Ej. Cuenca'
                    name="city"
                    value={formData.city}
                    onChange={onInputChange}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
            </div>

            <div>
                <label className="block text-gray-700 mb-1">Dirección *</label>
                <input
                    placeholder='Ej. Av. Solano 1234'
                    name="address"
                    value={formData.address}
                    onChange={onInputChange}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
            </div>
        </div>
    );
};