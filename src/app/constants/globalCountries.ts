// globalCountries.ts
export const LATIN_AMERICAN_COUNTRIES = [
    'Argentina',
    'Bolivia',
    'Brasil',
    'Chile',
    'Colombia',
    'Costa Rica',
    'Cuba',
    'Ecuador',
    'El Salvador',
    'Guatemala',
    'Honduras',
    'México',
    'Nicaragua',
    'Panamá',
    'Paraguay',
    'Perú',
    'República Dominicana',
    'Uruguay',
    'Venezuela'
] as const;

export const NORTH_AMERICAN_COUNTRIES = [
    'Canadá',
    'Estados Unidos',
    'México'
] as const;

export const EUROPEAN_COUNTRIES = [
    'Alemania',
    'Austria',
    'Bélgica',
    'Bulgaria',
    'Chipre',
    'Croacia',
    'Dinamarca',
    'Eslovaquia',
    'Eslovenia',
    'España',
    'Estonia',
    'Finlandia',
    'Francia',
    'Grecia',
    'Hungría',
    'Irlanda',
    'Italia',
    'Letonia',
    'Lituania',
    'Luxemburgo',
    'Malta',
    'Países Bajos',
    'Polonia',
    'Portugal',
    'Reino Unido',
    'República Checa',
    'Rumania',
    'Suecia'
] as const;

export const ASIAN_COUNTRIES = [
    'China',
    'Corea del Sur',
    'Filipinas',
    'India',
    'Indonesia',
    'Japón',
    'Malasia',
    'Singapur',
    'Tailandia',
    'Vietnam'
] as const;

export const OTHER_COUNTRIES = [
    'Australia',
    'Nueva Zelanda',
    'Sudáfrica'
] as const;

// Combinamos todos los países en un solo array, priorizando Latinoamérica
export const GLOBAL_COUNTRIES = [
    ...LATIN_AMERICAN_COUNTRIES,
    ...NORTH_AMERICAN_COUNTRIES.filter(country => !LATIN_AMERICAN_COUNTRIES.includes(country as any)),
    ...EUROPEAN_COUNTRIES,
    ...ASIAN_COUNTRIES,
    ...OTHER_COUNTRIES
] as const;

// Países organizados por regiones para mostrar en el selector
export const COUNTRIES_BY_REGION = {
    'Latinoamérica': LATIN_AMERICAN_COUNTRIES,
    'Norteamérica': NORTH_AMERICAN_COUNTRIES,
    'Europa': EUROPEAN_COUNTRIES,
    'Asia': ASIAN_COUNTRIES,
    'Otros': OTHER_COUNTRIES
} as const;

export type GlobalCountry = typeof GLOBAL_COUNTRIES[number];
export type CountryRegion = keyof typeof COUNTRIES_BY_REGION;

// Función helper para obtener países por región
export const getCountriesByRegion = (region: CountryRegion) => {
    return COUNTRIES_BY_REGION[region];
};

// Función para verificar si un país es latinoamericano
export const isLatinAmericanCountry = (country: string): boolean => {
    return LATIN_AMERICAN_COUNTRIES.includes(country as any);
};