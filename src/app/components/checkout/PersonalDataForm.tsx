// src/app/components/checkout/PersonalDataForm.tsx

import { ECUADOR_PROVINCES } from '@/app/constants/ecuadorProvinces';
import { COUNTRIES_BY_REGION } from '@/app/constants/globalCountries';
import { CheckoutFormData } from '@/app/types/checkout';
import React from 'react';
import { User, Mail, Phone, MapPin, Home } from 'lucide-react';

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
        <div className="space-y-4">
            {/* Información Personal */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">Información Personal</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                            Nombre *
                        </label>
                        <input
                            placeholder='Juan'
                            name="name"
                            value={formData.name}
                            onChange={onInputChange}
                            disabled={isProcessing}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                            Apellido *
                        </label>
                        <input
                            placeholder='Pérez'
                            name="lastName"
                            value={formData.lastName}
                            onChange={onInputChange}
                            disabled={isProcessing}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Contacto */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">Contacto</h4>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                                Email *
                            </label>
                            <input
                                placeholder='correo@ejemplo.com'
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={onInputChange}
                                disabled={isProcessing}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                                Confirmar Email *
                            </label>
                            <input
                                placeholder='correo@ejemplo.com'
                                name="confirmEmail"
                                type="email"
                                value={formData.confirmEmail}
                                onChange={onInputChange}
                                disabled={isProcessing}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                            Teléfono *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                placeholder='0991234567'
                                name="phone"
                                value={formData.phone}
                                onChange={onInputChange}
                                disabled={isProcessing}
                                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Ubicación */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">Ubicación</h4>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                                País *
                            </label>
                            <select
                                title='Seleccione un país'
                                name="country"
                                value={formData.country}
                                onChange={onInputChange}
                                disabled={isProcessing}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all bg-white"
                            >
                                <option value="">Seleccione un país...</option>
                                {renderCountryOptions()}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                                {formData.country === 'Ecuador' ? 'Provincia' : 'Estado/Región'} *
                            </label>
                            {formData.country === 'Ecuador' ? (
                                <select
                                    title='Seleccione provincia'
                                    name="province"
                                    value={formData.province}
                                    onChange={onInputChange}
                                    disabled={isProcessing}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all bg-white"
                                >
                                    <option value="">Seleccione...</option>
                                    {ECUADOR_PROVINCES.map(province => (
                                        <option key={province} value={province}>{province}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    placeholder={
                                        formData.country === 'México' ? 'Ciudad de México' :
                                            formData.country === 'Argentina' ? 'Buenos Aires' :
                                                formData.country === 'Colombia' ? 'Bogotá D.C.' :
                                                    formData.country === 'Perú' ? 'Lima' :
                                                        'Estado o Región'
                                    }
                                    name="province"
                                    value={formData.province}
                                    onChange={onInputChange}
                                    disabled={isProcessing || !formData.country}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                            Ciudad *
                        </label>
                        <input
                            placeholder={
                                formData.country === 'Ecuador' ? 'Cuenca' :
                                    formData.country === 'México' ? 'Guadalajara' :
                                        formData.country === 'Argentina' ? 'Buenos Aires' :
                                            formData.country === 'Colombia' ? 'Medellín' :
                                                formData.country === 'Perú' ? 'Arequipa' :
                                                    'Ciudad'
                            }
                            name="city"
                            value={formData.city}
                            onChange={onInputChange}
                            disabled={isProcessing}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Dirección */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
                        <Home className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">Dirección</h4>
                </div>

                <div>
                    <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                        Dirección completa *
                    </label>
                    <input
                        placeholder={
                            formData.country === 'Ecuador' ? 'Av. Solano 1234' :
                                formData.country === 'México' ? 'Av. Reforma 1234' :
                                    formData.country === 'Argentina' ? 'Av. Corrientes 1234' :
                                        formData.country === 'Colombia' ? 'Calle 72 #10-34' :
                                            'Dirección completa'
                        }
                        name="address"
                        value={formData.address}
                        onChange={onInputChange}
                        disabled={isProcessing}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                    />
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-sky-50 border border-sky-100 rounded-lg p-3">
                <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <p className="text-xs font-semibold text-sky-800 mb-1">
                            Información importante
                        </p>
                        <p className="text-xs text-sky-700 leading-relaxed">
                            Tus datos personales se utilizarán para procesar tu pedido y mejorar tu experiencia en la plataforma.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};