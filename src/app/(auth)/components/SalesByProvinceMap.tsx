'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import { FeatureCollection } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface SalesDataItem {
    ciudad?: string;
    lat?: number;
    lng?: number;
    provincia?: string;
    ventas?: number;
    // Fallback para datos que vienen con estructura diferente
    province?: string;
    facturas?: number;
}

interface EcuadorMapChartProps {
    salesList?: SalesDataItem[];
}

// Coordenadas por defecto para provincias (fallback)
const DEFAULT_COORDINATES: Record<string, { lat: number; lng: number; ciudad: string }> = {
    'Guayas': { lat: -2.2, lng: -79.9, ciudad: 'Guayaquil' },
    'Pichincha': { lat: -0.2, lng: -78.5, ciudad: 'Quito' },
    'Manabí': { lat: -1.0, lng: -80.7, ciudad: 'Portoviejo' },
    'Azuay': { lat: -2.9, lng: -79.0, ciudad: 'Cuenca' },
    'Los Ríos': { lat: -1.8, lng: -79.5, ciudad: 'Babahoyo' },
    'El Oro': { lat: -3.6, lng: -79.9, ciudad: 'Machala' },
    'Esmeraldas': { lat: 0.9, lng: -79.7, ciudad: 'Esmeraldas' },
    'Santo Domingo': { lat: -0.2, lng: -79.2, ciudad: 'Santo Domingo' },
    'Loja': { lat: -4.0, lng: -79.2, ciudad: 'Loja' },
    'Imbabura': { lat: 0.4, lng: -78.1, ciudad: 'Ibarra' },
    'Tungurahua': { lat: -1.2, lng: -78.6, ciudad: 'Ambato' },
    'Chimborazo': { lat: -1.7, lng: -78.6, ciudad: 'Riobamba' },
    'Cotopaxi': { lat: -0.9, lng: -78.6, ciudad: 'Latacunga' },
    'Carchi': { lat: 0.8, lng: -77.8, ciudad: 'Tulcán' },
    'Bolívar': { lat: -1.6, lng: -79.0, ciudad: 'Guaranda' },
    'Cañar': { lat: -2.6, lng: -78.9, ciudad: 'Azogues' },
    'Sucumbíos': { lat: 0.1, lng: -76.9, ciudad: 'Nueva Loja' },
    'Orellana': { lat: -0.5, lng: -76.9, ciudad: 'Francisco de Orellana' },
    'Napo': { lat: -1.0, lng: -77.8, ciudad: 'Tena' },
    'Pastaza': { lat: -1.5, lng: -78.0, ciudad: 'Puyo' },
    'Morona Santiago': { lat: -2.3, lng: -78.1, ciudad: 'Macas' },
    'Zamora Chinchipe': { lat: -4.1, lng: -78.9, ciudad: 'Zamora' },
    'Galápagos': { lat: -0.4, lng: -90.3, ciudad: 'Puerto Ayora' },
    'Santa Elena': { lat: -2.2, lng: -80.9, ciudad: 'Santa Elena' }
};

// Mapeo para nombres alternativos en el GeoJSON
const PROVINCE_NAME_MAPPING: Record<string, string> = {
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
    // Fallbacks adicionales
    'SANTO DOMINGO': 'Santo Domingo',
    'LOS RÍOS': 'Los Ríos',
    'MANABÍ': 'Manabí',
    'SUCUMBÍOS': 'Sucumbíos'
};

export default function EcuadorMapChart({ salesList }: EcuadorMapChartProps) {
    const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapRef = useRef<L.Map | null>(null);

    // Coordenadas límite para Ecuador continental (sin Galápagos)
    const ecuadorContinentalBounds = L.latLngBounds(
        L.latLng(-5.015, -81.1), // Esquina sudoeste
        L.latLng(1.45, -75.2)    // Esquina noreste
    );

    // Normalizar y procesar datos de ventas
    const processedSalesData = useMemo(() => {
        if (!salesList || !Array.isArray(salesList)) return [];

        return salesList.map(item => {
            // Determinar el nombre de la provincia
            const provinceName = item.provincia || item.province || '';

            // Obtener coordenadas (usar las del item o fallback)
            const coords = DEFAULT_COORDINATES[provinceName] || { lat: 0, lng: 0, ciudad: provinceName };

            return {
                provincia: provinceName,
                ciudad: item.ciudad || coords.ciudad || provinceName,
                lat: typeof item.lat === 'number' ? item.lat : coords.lat,
                lng: typeof item.lng === 'number' ? item.lng : coords.lng,
                ventas: item.ventas || 0,
                facturas: item.facturas || 0
            };
        }).filter(item =>
            item.provincia &&
            item.ventas > 0 &&
            typeof item.lat === 'number' &&
            typeof item.lng === 'number' &&
            item.lat !== 0 &&
            item.lng !== 0
        );
    }, [salesList]);

    // Crear mapa de ventas por provincia para el styling del GeoJSON
    const salesByProvince = useMemo(() => {
        const map: Record<string, number> = {};
        processedSalesData.forEach(item => {
            map[item.provincia] = item.ventas;
        });
        console.log('Sales by province map:', map);
        return map;
    }, [processedSalesData]);

    // Función para normalizar nombres de provincia
    const normalizeProvinceName = (name: string): string => {
        if (!name) return '';

        // Primero intentar mapeo directo
        const upperName = name.toUpperCase().trim();
        if (PROVINCE_NAME_MAPPING[upperName]) {
            return PROVINCE_NAME_MAPPING[upperName];
        }

        // Buscar coincidencias parciales
        for (const [key, value] of Object.entries(PROVINCE_NAME_MAPPING)) {
            if (upperName.includes(key) || key.includes(upperName)) {
                return value;
            }
        }

        // Si no hay mapeo, devolver el nombre tal como está
        return name;
    };

    // Cargar datos GeoJSON
    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch('/data/ecuador.geojson')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load GeoJSON');
                return res.json();
            })
            .then(data => {
                setGeoData(data);
            })
            .catch(error => {
                console.error("Error loading GeoJSON:", error);
                setError("Error al cargar el mapa. Por favor verifica los datos.");
            })
            .finally(() => setLoading(false));
    }, []);

    // Configurar límites del mapa
    useEffect(() => {
        if (mapRef.current) {
            // mapRef.current.setMaxBounds(ecuadorContinentalBounds); // Comentar esta línea

            if (geoData) {
                const continentalFeatures = geoData.features.filter(
                    feature => {
                        const name = feature.properties?.nombre || feature.properties?.name || '';
                        return name && !['GALÁPAGOS', 'GALAPAGOS', 'ZONAS NO DELIMITADAS'].includes(name.toUpperCase());
                    }
                );
                const continentalLayer = L.geoJSON({
                    ...geoData,
                    features: continentalFeatures
                } as FeatureCollection);
                mapRef.current.fitBounds(continentalLayer.getBounds());
            }
            // else {
            //     mapRef.current.fitBounds(ecuadorContinentalBounds); // Comentar esta línea también
            // }
        }
    }, [geoData]);

    // Obtener el rango de ventas para la escala de colores
    const salesRange = useMemo(() => {
        const sales = Object.values(salesByProvince);
        if (sales.length === 0) return { min: 0, max: 0 };
        return {
            min: Math.min(...sales),
            max: Math.max(...sales)
        };
    }, [salesByProvince]);

    // Función para determinar el color de la provincia
    const getProvinceStyle = (feature: any) => {
        const rawProvinceName = feature.properties?.nombre || feature.properties?.name || '';
        const normalizedProvinceName = normalizeProvinceName(rawProvinceName);
        const sales = salesByProvince[normalizedProvinceName] || 0;

        console.log(`Province: ${rawProvinceName} -> ${normalizedProvinceName}, Sales: ${sales}`);

        let fillColor = '#f0f0f0'; // Color por defecto (sin ventas)

        if (sales > 0 && salesRange.max > 0) {
            const intensity = sales / salesRange.max;

            if (intensity > 0.8) fillColor = '#006837';      // Verde muy oscuro
            else if (intensity > 0.6) fillColor = '#31a354';  // Verde oscuro
            else if (intensity > 0.4) fillColor = '#78c679';  // Verde medio
            else if (intensity > 0.2) fillColor = '#addd8e';  // Verde claro
            else fillColor = '#d9f0a3';                       // Verde muy claro
        }

        return {
            fillColor,
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        };
    };

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            {loading && (
                <div style={{
                    position: 'absolute',
                    zIndex: 1000,
                    background: 'rgba(255,255,255,0.7)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p>Cargando mapa...</p>
                    </div>
                </div>
            )}

            {error && (
                <div style={{
                    position: 'absolute',
                    zIndex: 1000,
                    background: 'rgba(255,255,255,0.9)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'red'
                }}>
                    <div className="text-center">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                </div>
            )}

            <MapContainer
                center={[-1.8312, -78.1834]}
                zoom={7}
                minZoom={6}
                // maxBounds={ecuadorContinentalBounds}
                style={{ height: '90%', width: '100%' }}
                ref={(instance) => {
                    if (instance) {
                        mapRef.current = instance;
                    }
                }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    noWrap={true}
                />

                {/* Renderizar provincias con colores */}
                {geoData && (
                    <GeoJSON
                        data={{
                            ...geoData,
                            features: geoData.features.filter(
                                feature => {
                                    const name = feature.properties?.nombre || feature.properties?.name || '';
                                    return name && !['GALÁPAGOS', 'GALAPAGOS', 'ZONAS NO DELIMITADAS'].includes(name.toUpperCase());
                                }
                            )
                        } as FeatureCollection}
                        style={getProvinceStyle}
                    />
                )}

                {/* Renderizar marcadores circulares para ventas */}
                {processedSalesData.map((provincia, index) => (
                    // En el MapContainer, agregar:
                    <CircleMarker
                        key={`${provincia.provincia}-${index}`}
                        center={[provincia.lat, provincia.lng]}
                        radius={Math.max(5, Math.min(25, Math.sqrt(provincia.ventas / 100)))}
                        pathOptions={{
                            color: '#dc2626',
                            fillColor: '#f97316',
                            fillOpacity: 0.7,
                            weight: 2
                        }}
                        pane="markerPane" // Esto asegura que esté en el pane correcto
                    >
                        <Popup>
                            <div className="text-sm">
                                <h3 className="font-bold text-base mb-1">{provincia.provincia}</h3>
                                <p><span className="font-medium">Ciudad:</span> {provincia.ciudad}</p>
                                <p><span className="font-medium">Ventas:</span> ${provincia.ventas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                                {provincia.facturas > 0 && (
                                    <p><span className="font-medium">Facturas:</span> {provincia.facturas}</p>
                                )}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            {/* Leyenda de colores */}
            {salesRange.max > 0 && (
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(255,255,255,0.9)',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    zIndex: 1000
                }}>
                    <div className="font-medium mb-2">Ventas por Región</div>
                    <div className="space-y-1">
                        <div className="flex items-center">
                            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#006837' }}></div>
                            <span>Alta (&gt; ${(salesRange.max * 0.8).toLocaleString('es-ES')})</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#78c679' }}></div>
                            <span>Media</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#d9f0a3' }}></div>
                            <span>Baja</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#f0f0f0' }}></div>
                            <span>Sin ventas</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}