import { ECUADOR_PROVINCES } from '@/app/constants/ecuadorProvinces';
import { COUNTRIES_BY_REGION } from '@/app/constants/globalCountries';
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
    // Función para renderizar las opciones de países agrupadas por región
    const renderCountryOptions = () => {
        return Object.entries(COUNTRIES_BY_REGION).map(([region, countries]) => (
            <optgroup key={region} label={region}>
                {countries.map(country => (
                    <option key={country} value={country}>
                        {country}
                    </option>
                ))}
            </optgroup>
        ));
    };

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
                    <select
                        title='Seleccione un país...'
                        name="country"
                        value={formData.country}
                        onChange={onInputChange}
                        disabled={isProcessing}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                        <option value="">Seleccione un país...</option>
                        {renderCountryOptions()}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">
                        {formData.country === 'Ecuador' ? 'Provincia' : 'Estado/Región'} *
                    </label>
                    {formData.country === 'Ecuador' ? (
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
                    ) : (
                        <input
                            placeholder={
                                formData.country === 'México' ? 'Ej. Ciudad de México' :
                                    formData.country === 'Argentina' ? 'Ej. Buenos Aires' :
                                        formData.country === 'Colombia' ? 'Ej. Bogotá D.C.' :
                                            formData.country === 'Perú' ? 'Ej. Lima' :
                                                'Ej. Estado o Región'
                            }
                            name="province"
                            value={formData.province}
                            onChange={onInputChange}
                            disabled={isProcessing || !formData.country}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                        />
                    )}
                </div>
            </div>

            <div>
                <label className="block text-gray-700 mb-1">Ciudad *</label>
                <input
                    placeholder={
                        formData.country === 'Ecuador' ? 'Ej. Cuenca' :
                            formData.country === 'México' ? 'Ej. Guadalajara' :
                                formData.country === 'Argentina' ? 'Ej. Buenos Aires' :
                                    formData.country === 'Colombia' ? 'Ej. Medellín' :
                                        formData.country === 'Perú' ? 'Ej. Arequipa' :
                                            'Ej. Ciudad'
                    }
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
                    placeholder={
                        formData.country === 'Ecuador' ? 'Ej. Av. Solano 1234' :
                            formData.country === 'México' ? 'Ej. Av. Reforma 1234' :
                                formData.country === 'Argentina' ? 'Ej. Av. Corrientes 1234' :
                                    formData.country === 'Colombia' ? 'Ej. Calle 72 #10-34' :
                                        'Ej. Dirección completa'
                    }
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