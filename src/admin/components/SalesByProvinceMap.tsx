'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { MapContainer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import { FeatureCollection } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { COUNTRY_CONFIGS, DEFAULT_COUNTRY } from '@/constants/countries';
import type { CountryCode } from '@/constants/countries';
import { formatTenantCurrency } from '@/admin/utils/currency';

interface SalesDataItem {
    ciudad?: string;
    lat?: number;
    lng?: number;
    provincia?: string;
    ventas?: number;
    province?: string;
    facturas?: number;
}

interface SalesMapChartProps {
    salesList?: SalesDataItem[];
    countryCode?: CountryCode;
}

export default function SalesMapChart({ salesList, countryCode = DEFAULT_COUNTRY }: SalesMapChartProps) {
    const config = COUNTRY_CONFIGS[countryCode];
    const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapRef = useRef<L.Map | null>(null);

    // Build region coordinate lookup from config
    const regionCoordinates = useMemo(() => {
        const coords: Record<string, { lat: number; lng: number; ciudad: string }> = {};
        for (const region of config.regions) {
            coords[region.name] = { lat: region.lat, lng: region.lng, ciudad: region.capital };
        }
        return coords;
    }, [config]);

    const nameMapping = config.geojsonNameMapping;
    const excludeFromMap = config.excludeFromMap || [];

    // Normalize and process sales data
    const processedSalesData = useMemo(() => {
        if (!salesList || !Array.isArray(salesList)) return [];

        return salesList.map(item => {
            const provinceName = item.provincia || item.province || '';
            const coords = regionCoordinates[provinceName] || { lat: 0, lng: 0, ciudad: provinceName };

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
    }, [salesList, regionCoordinates]);

    // Sales by province map for GeoJSON styling
    const salesByProvince = useMemo(() => {
        const map: Record<string, number> = {};
        processedSalesData.forEach(item => {
            map[item.provincia] = item.ventas;
        });
        return map;
    }, [processedSalesData]);

    // Normalize region names using country config mapping
    const normalizeRegionName = (name: string): string => {
        if (!name) return '';
        const upperName = name.toUpperCase().trim();
        if (nameMapping[upperName]) return nameMapping[upperName];
        for (const [key, value] of Object.entries(nameMapping)) {
            if (upperName.includes(key) || key.includes(upperName)) return value;
        }
        return name;
    };

    // Load GeoJSON data (re-fetch when country changes)
    useEffect(() => {
        setLoading(true);
        setError(null);
        setGeoData(null);

        fetch(config.geojsonPath)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load GeoJSON');
                return res.json();
            })
            .then(data => setGeoData(data))
            .catch(err => {
                console.error("Error loading GeoJSON:", err);
                setError("Error al cargar el mapa. Por favor verifica los datos.");
            })
            .finally(() => setLoading(false));
    }, [config.geojsonPath]);

    // Fit map bounds when geoData loads or country changes
    useEffect(() => {
        if (mapRef.current && geoData) {
            const nameProp = config.geojsonNameProperty;
            const filteredFeatures = geoData.features.filter(feature => {
                const name = feature.properties?.[nameProp] || feature.properties?.nombre || feature.properties?.name || '';
                return name && !excludeFromMap.includes(name.toUpperCase());
            });
            if (filteredFeatures.length > 0) {
                const layer = L.geoJSON({ ...geoData, features: filteredFeatures } as FeatureCollection);
                mapRef.current.fitBounds(layer.getBounds());
            }
        }
    }, [geoData, config, excludeFromMap]);

    // Sales range for color scale
    const salesRange = useMemo(() => {
        const sales = Object.values(salesByProvince);
        if (sales.length === 0) return { min: 0, max: 0 };
        return { min: Math.min(...sales), max: Math.max(...sales) };
    }, [salesByProvince]);

    // Province color style
    const getProvinceStyle = (feature: any) => {
        const rawName = feature.properties?.[config.geojsonNameProperty]
            || feature.properties?.nombre
            || feature.properties?.name
            || '';
        const normalizedName = normalizeRegionName(rawName);
        const sales = salesByProvince[normalizedName] || 0;

        let fillColor = '#f0f0f0';
        if (sales > 0 && salesRange.max > 0) {
            const intensity = sales / salesRange.max;
            if (intensity > 0.8) fillColor = '#006837';
            else if (intensity > 0.6) fillColor = '#31a354';
            else if (intensity > 0.4) fillColor = '#78c679';
            else if (intensity > 0.2) fillColor = '#addd8e';
            else fillColor = '#d9f0a3';
        }

        return {
            fillColor,
            weight: 1,
            opacity: 1,
            color: '#cbd5e1',
            fillOpacity: 0.85
        };
    };

    // Filter features for rendering
    const filteredGeoData = useMemo(() => {
        if (!geoData) return null;
        const nameProp = config.geojsonNameProperty;
        return {
            ...geoData,
            features: geoData.features.filter(feature => {
                const name = feature.properties?.[nameProp] || feature.properties?.nombre || feature.properties?.name || '';
                return name && !excludeFromMap.includes(name.toUpperCase());
            })
        } as FeatureCollection;
    }, [geoData, config, excludeFromMap]);

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}>
            {loading && (
                <div style={{
                    position: 'absolute',
                    zIndex: 10,
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
                    zIndex: 10,
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
                key={countryCode}
                center={config.mapCenter}
                zoom={config.mapZoom}
                minZoom={config.minZoom}
                zoomControl={false}
                style={{ height: '90%', width: '100%' }}
                ref={(instance) => {
                    if (instance) mapRef.current = instance;
                }}
            >
                {filteredGeoData && (
                    <GeoJSON
                        key={`geojson-${countryCode}`}
                        data={filteredGeoData}
                        style={getProvinceStyle}
                    />
                )}

                {processedSalesData.map((provincia, index) => (
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
                        pane="markerPane"
                    >
                        <Popup>
                            <div className="text-sm">
                                <h3 className="font-bold text-base mb-1">{provincia.provincia}</h3>
                                <p><span className="font-medium">Ciudad:</span> {provincia.ciudad}</p>
                                <p><span className="font-medium">Ventas:</span> {formatTenantCurrency(provincia.ventas, countryCode)}</p>
                                {provincia.facturas > 0 && (
                                    <p><span className="font-medium">Facturas:</span> {provincia.facturas}</p>
                                )}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            {salesRange.max > 0 && (
                <div style={{
                    position: 'absolute',
                    bottom: '50px',
                    right: '10px',
                    background: 'rgba(255,255,255,0.9)',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    zIndex: 10
                }}>
                    <div className="font-medium mb-2">Ventas por {config.regionLabel}</div>
                    <div className="space-y-1">
                        <div className="flex items-center">
                            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#006837' }}></div>
                            <span>Alta (&gt; {formatTenantCurrency(salesRange.max * 0.8, countryCode)})</span>
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
