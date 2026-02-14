export type CountryCode = 'EC' | 'CO' | 'PE'

export interface CurrencyConfig {
  code: string
  symbol: string
  locale: string
}

export interface RegionInfo {
  name: string
  lat: number
  lng: number
  capital: string
}

export interface CountryConfig {
  code: CountryCode
  name: string
  currency: CurrencyConfig
  mapCenter: [number, number]
  mapZoom: number
  minZoom: number
  geojsonPath: string
  geojsonNameProperty: string
  geojsonNameMapping: Record<string, string>
  regionLabel: string
  regions: RegionInfo[]
  excludeFromMap?: string[]
}

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  EC: {
    code: 'EC',
    name: 'Ecuador',
    currency: { code: 'USD', symbol: '$', locale: 'es-EC' },
    mapCenter: [-1.8312, -78.1834],
    mapZoom: 7,
    minZoom: 6,
    geojsonPath: '/data/ecuador.geojson',
    geojsonNameProperty: 'nombre',
    regionLabel: 'Provincia',
    excludeFromMap: ['GALÁPAGOS', 'GALAPAGOS', 'ZONAS NO DELIMITADAS'],
    geojsonNameMapping: {
      'AZUAY': 'Azuay',
      'BOLIVAR': 'Bolívar',
      'CAÑAR': 'Cañar',
      'CARCHI': 'Carchi',
      'CHIMBORAZO': 'Chimborazo',
      'COTOPAXI': 'Cotopaxi',
      'EL ORO': 'El Oro',
      'ESMERALDAS': 'Esmeraldas',
      'GALAPAGOS': 'Galápagos',
      'GUAYAS': 'Guayas',
      'IMBABURA': 'Imbabura',
      'LOJA': 'Loja',
      'LOS RIOS': 'Los Ríos',
      'MANABI': 'Manabí',
      'MORONA SANTIAGO': 'Morona Santiago',
      'NAPO': 'Napo',
      'ORELLANA': 'Orellana',
      'PASTAZA': 'Pastaza',
      'PICHINCHA': 'Pichincha',
      'SANTA ELENA': 'Santa Elena',
      'SANTO DOMINGO DE LOS TSACHILAS': 'Santo Domingo',
      'SUCUMBIOS': 'Sucumbíos',
      'TUNGURAHUA': 'Tungurahua',
      'ZAMORA CHINCHIPE': 'Zamora Chinchipe',
      'SANTO DOMINGO': 'Santo Domingo',
      'LOS RÍOS': 'Los Ríos',
      'MANABÍ': 'Manabí',
      'SUCUMBÍOS': 'Sucumbíos',
    },
    regions: [
      { name: 'Guayas', lat: -2.2, lng: -79.9, capital: 'Guayaquil' },
      { name: 'Pichincha', lat: -0.2, lng: -78.5, capital: 'Quito' },
      { name: 'Manabí', lat: -1.0, lng: -80.7, capital: 'Portoviejo' },
      { name: 'Azuay', lat: -2.9, lng: -79.0, capital: 'Cuenca' },
      { name: 'Los Ríos', lat: -1.8, lng: -79.5, capital: 'Babahoyo' },
      { name: 'El Oro', lat: -3.6, lng: -79.9, capital: 'Machala' },
      { name: 'Esmeraldas', lat: 0.9, lng: -79.7, capital: 'Esmeraldas' },
      { name: 'Santo Domingo', lat: -0.2, lng: -79.2, capital: 'Santo Domingo' },
      { name: 'Loja', lat: -4.0, lng: -79.2, capital: 'Loja' },
      { name: 'Imbabura', lat: 0.4, lng: -78.1, capital: 'Ibarra' },
      { name: 'Tungurahua', lat: -1.2, lng: -78.6, capital: 'Ambato' },
      { name: 'Chimborazo', lat: -1.7, lng: -78.6, capital: 'Riobamba' },
      { name: 'Cotopaxi', lat: -0.9, lng: -78.6, capital: 'Latacunga' },
      { name: 'Carchi', lat: 0.8, lng: -77.8, capital: 'Tulcán' },
      { name: 'Bolívar', lat: -1.6, lng: -79.0, capital: 'Guaranda' },
      { name: 'Cañar', lat: -2.6, lng: -78.9, capital: 'Azogues' },
      { name: 'Sucumbíos', lat: 0.1, lng: -76.9, capital: 'Nueva Loja' },
      { name: 'Orellana', lat: -0.5, lng: -76.9, capital: 'Francisco de Orellana' },
      { name: 'Napo', lat: -1.0, lng: -77.8, capital: 'Tena' },
      { name: 'Pastaza', lat: -1.5, lng: -78.0, capital: 'Puyo' },
      { name: 'Morona Santiago', lat: -2.3, lng: -78.1, capital: 'Macas' },
      { name: 'Zamora Chinchipe', lat: -4.1, lng: -78.9, capital: 'Zamora' },
      { name: 'Galápagos', lat: -0.4, lng: -90.3, capital: 'Puerto Ayora' },
      { name: 'Santa Elena', lat: -2.2, lng: -80.9, capital: 'Santa Elena' },
    ],
  },

  CO: {
    code: 'CO',
    name: 'Colombia',
    currency: { code: 'COP', symbol: '$', locale: 'es-CO' },
    mapCenter: [4.5709, -74.2973],
    mapZoom: 6,
    minZoom: 5,
    geojsonPath: '/data/colombia.geojson',
    geojsonNameProperty: 'NOMBRE_DPT',
    regionLabel: 'Departamento',
    excludeFromMap: [],
    geojsonNameMapping: {
      'AMAZONAS': 'Amazonas',
      'ANTIOQUIA': 'Antioquia',
      'ARAUCA': 'Arauca',
      'ATLANTICO': 'Atlántico',
      'ATLÁNTICO': 'Atlántico',
      'BOGOTA': 'Bogotá D.C.',
      'BOGOTÁ': 'Bogotá D.C.',
      'BOGOTA D.C.': 'Bogotá D.C.',
      'BOGOTÁ D.C.': 'Bogotá D.C.',
      'SANTAFE DE BOGOTA D.C': 'Bogotá D.C.',
      'SANTAFE DE BOGOTA D.C.': 'Bogotá D.C.',
      'BOLIVAR': 'Bolívar',
      'BOLÍVAR': 'Bolívar',
      'BOYACA': 'Boyacá',
      'BOYACÁ': 'Boyacá',
      'CALDAS': 'Caldas',
      'CAQUETA': 'Caquetá',
      'CAQUETÁ': 'Caquetá',
      'CASANARE': 'Casanare',
      'CAUCA': 'Cauca',
      'CESAR': 'Cesar',
      'CHOCO': 'Chocó',
      'CHOCÓ': 'Chocó',
      'CORDOBA': 'Córdoba',
      'CÓRDOBA': 'Córdoba',
      'CUNDINAMARCA': 'Cundinamarca',
      'GUAINIA': 'Guainía',
      'GUAINÍA': 'Guainía',
      'GUAVIARE': 'Guaviare',
      'HUILA': 'Huila',
      'LA GUAJIRA': 'La Guajira',
      'MAGDALENA': 'Magdalena',
      'META': 'Meta',
      'NARIÑO': 'Nariño',
      'NARINO': 'Nariño',
      'NORTE DE SANTANDER': 'Norte de Santander',
      'PUTUMAYO': 'Putumayo',
      'QUINDIO': 'Quindío',
      'QUINDÍO': 'Quindío',
      'RISARALDA': 'Risaralda',
      'SAN ANDRES': 'San Andrés',
      'SAN ANDRÉS': 'San Andrés',
      'SAN ANDRES Y PROVIDENCIA': 'San Andrés',
      'SAN ANDRÉS Y PROVIDENCIA': 'San Andrés',
      'ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA': 'San Andrés',
      'SANTANDER': 'Santander',
      'SUCRE': 'Sucre',
      'TOLIMA': 'Tolima',
      'VALLE DEL CAUCA': 'Valle del Cauca',
      'VAUPES': 'Vaupés',
      'VAUPÉS': 'Vaupés',
      'VICHADA': 'Vichada',
    },
    regions: [
      { name: 'Bogotá D.C.', lat: 4.711, lng: -74.072, capital: 'Bogotá' },
      { name: 'Antioquia', lat: 7.199, lng: -75.341, capital: 'Medellín' },
      { name: 'Valle del Cauca', lat: 3.451, lng: -76.532, capital: 'Cali' },
      { name: 'Atlántico', lat: 10.968, lng: -74.781, capital: 'Barranquilla' },
      { name: 'Santander', lat: 7.130, lng: -73.126, capital: 'Bucaramanga' },
      { name: 'Bolívar', lat: 10.399, lng: -75.514, capital: 'Cartagena' },
      { name: 'Cundinamarca', lat: 5.026, lng: -74.030, capital: 'Bogotá' },
      { name: 'Nariño', lat: 1.289, lng: -77.357, capital: 'Pasto' },
      { name: 'Norte de Santander', lat: 7.947, lng: -72.502, capital: 'Cúcuta' },
      { name: 'Tolima', lat: 4.092, lng: -75.154, capital: 'Ibagué' },
      { name: 'Boyacá', lat: 5.454, lng: -73.362, capital: 'Tunja' },
      { name: 'Cauca', lat: 2.705, lng: -76.826, capital: 'Popayán' },
      { name: 'Huila', lat: 2.535, lng: -75.527, capital: 'Neiva' },
      { name: 'Risaralda', lat: 4.814, lng: -75.696, capital: 'Pereira' },
      { name: 'Caldas', lat: 5.066, lng: -75.517, capital: 'Manizales' },
      { name: 'Meta', lat: 3.987, lng: -73.637, capital: 'Villavicencio' },
      { name: 'Magdalena', lat: 11.241, lng: -74.199, capital: 'Santa Marta' },
      { name: 'Cesar', lat: 10.474, lng: -73.253, capital: 'Valledupar' },
      { name: 'Córdoba', lat: 8.748, lng: -75.881, capital: 'Montería' },
      { name: 'La Guajira', lat: 11.544, lng: -72.908, capital: 'Riohacha' },
      { name: 'Sucre', lat: 9.304, lng: -75.397, capital: 'Sincelejo' },
      { name: 'Quindío', lat: 4.461, lng: -75.667, capital: 'Armenia' },
      { name: 'Chocó', lat: 5.692, lng: -76.661, capital: 'Quibdó' },
      { name: 'Casanare', lat: 5.338, lng: -72.394, capital: 'Yopal' },
      { name: 'Caquetá', lat: 1.614, lng: -75.606, capital: 'Florencia' },
      { name: 'Putumayo', lat: 1.152, lng: -76.634, capital: 'Mocoa' },
      { name: 'Arauca', lat: 7.090, lng: -70.762, capital: 'Arauca' },
      { name: 'Guaviare', lat: 2.573, lng: -72.645, capital: 'San José del Guaviare' },
      { name: 'Amazonas', lat: -1.014, lng: -71.939, capital: 'Leticia' },
      { name: 'Vichada', lat: 4.423, lng: -69.287, capital: 'Puerto Carreño' },
      { name: 'Vaupés', lat: 1.196, lng: -70.234, capital: 'Mitú' },
      { name: 'Guainía', lat: 2.585, lng: -68.524, capital: 'Inírida' },
      { name: 'San Andrés', lat: 12.584, lng: -81.701, capital: 'San Andrés' },
    ],
  },

  PE: {
    code: 'PE',
    name: 'Perú',
    currency: { code: 'PEN', symbol: 'S/', locale: 'es-PE' },
    mapCenter: [-9.19, -75.0152],
    mapZoom: 6,
    minZoom: 5,
    geojsonPath: '/data/peru.geojson',
    geojsonNameProperty: 'NOMBDEP',
    regionLabel: 'Departamento',
    excludeFromMap: [],
    geojsonNameMapping: {
      'AMAZONAS': 'Amazonas',
      'ANCASH': 'Áncash',
      'ÁNCASH': 'Áncash',
      'APURIMAC': 'Apurímac',
      'APURÍMAC': 'Apurímac',
      'AREQUIPA': 'Arequipa',
      'AYACUCHO': 'Ayacucho',
      'CAJAMARCA': 'Cajamarca',
      'CALLAO': 'Callao',
      'CUSCO': 'Cusco',
      'HUANCAVELICA': 'Huancavelica',
      'HUANUCO': 'Huánuco',
      'HUÁNUCO': 'Huánuco',
      'ICA': 'Ica',
      'JUNIN': 'Junín',
      'JUNÍN': 'Junín',
      'LA LIBERTAD': 'La Libertad',
      'LAMBAYEQUE': 'Lambayeque',
      'LIMA': 'Lima',
      'LORETO': 'Loreto',
      'MADRE DE DIOS': 'Madre de Dios',
      'MOQUEGUA': 'Moquegua',
      'PASCO': 'Pasco',
      'PIURA': 'Piura',
      'PUNO': 'Puno',
      'SAN MARTIN': 'San Martín',
      'SAN MARTÍN': 'San Martín',
      'TACNA': 'Tacna',
      'TUMBES': 'Tumbes',
      'UCAYALI': 'Ucayali',
    },
    regions: [
      { name: 'Lima', lat: -12.046, lng: -77.043, capital: 'Lima' },
      { name: 'Arequipa', lat: -16.409, lng: -71.537, capital: 'Arequipa' },
      { name: 'La Libertad', lat: -8.115, lng: -79.029, capital: 'Trujillo' },
      { name: 'Piura', lat: -5.195, lng: -80.632, capital: 'Piura' },
      { name: 'Cajamarca', lat: -7.163, lng: -78.500, capital: 'Cajamarca' },
      { name: 'Junín', lat: -12.065, lng: -75.205, capital: 'Huancayo' },
      { name: 'Cusco', lat: -13.532, lng: -71.967, capital: 'Cusco' },
      { name: 'Lambayeque', lat: -6.770, lng: -79.841, capital: 'Chiclayo' },
      { name: 'Áncash', lat: -9.526, lng: -77.529, capital: 'Huaraz' },
      { name: 'Callao', lat: -12.056, lng: -77.118, capital: 'Callao' },
      { name: 'Puno', lat: -15.840, lng: -70.022, capital: 'Puno' },
      { name: 'Loreto', lat: -3.749, lng: -73.254, capital: 'Iquitos' },
      { name: 'Ica', lat: -14.068, lng: -75.725, capital: 'Ica' },
      { name: 'San Martín', lat: -6.485, lng: -76.366, capital: 'Moyobamba' },
      { name: 'Huánuco', lat: -9.930, lng: -76.242, capital: 'Huánuco' },
      { name: 'Ayacucho', lat: -13.159, lng: -74.224, capital: 'Ayacucho' },
      { name: 'Ucayali', lat: -8.379, lng: -74.554, capital: 'Pucallpa' },
      { name: 'Tacna', lat: -17.594, lng: -70.251, capital: 'Tacna' },
      { name: 'Apurímac', lat: -13.634, lng: -72.882, capital: 'Abancay' },
      { name: 'Amazonas', lat: -6.230, lng: -77.869, capital: 'Chachapoyas' },
      { name: 'Huancavelica', lat: -12.787, lng: -74.976, capital: 'Huancavelica' },
      { name: 'Tumbes', lat: -3.567, lng: -80.452, capital: 'Tumbes' },
      { name: 'Moquegua', lat: -17.194, lng: -70.935, capital: 'Moquegua' },
      { name: 'Pasco', lat: -10.688, lng: -76.259, capital: 'Cerro de Pasco' },
      { name: 'Madre de Dios', lat: -12.594, lng: -69.189, capital: 'Puerto Maldonado' },
    ],
  },
}

export const DEFAULT_COUNTRY: CountryCode = 'EC'

/** Resolve a country value (code or full name) to a CountryCode */
export function resolveCountryCode(value: string | null | undefined): CountryCode {
  if (!value) return DEFAULT_COUNTRY
  const upper = value.toUpperCase().trim()
  if (upper in COUNTRY_CONFIGS) return upper as CountryCode
  // Match by full name
  for (const config of Object.values(COUNTRY_CONFIGS)) {
    if (config.name.toUpperCase() === upper) return config.code
  }
  return DEFAULT_COUNTRY
}
