'use client';

import { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip, CircleMarker, Popup } from 'react-leaflet';
import { FeatureCollection } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ProvinceSalesData {
    [province: string]: {
        ciudad: string;
        lat: number;
        lng: number;
        provincia: string;
        ventas: number;
    };
}

interface EcuadorMapChartProps {
    salesList?: {
        ciudad: string;
        lat: number;
        lng: number;
        provincia: string;
        ventas: number;
    }[];
}



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

    useEffect(() => {
        if (mapRef.current) {
            // Establecer los límites máximos para Ecuador continental
            mapRef.current.setMaxBounds(ecuadorContinentalBounds);

            // Si hay datos geoJSON, ajustar la vista
            if (geoData) {
                const geojsonLayer = L.geoJSON(geoData);
                // Crear bounds solo para las provincias continentales
                const continentalFeatures = geoData.features.filter(
                    feature => feature.properties && !['Galápagos'].includes(feature.properties.name)
                );
                const continentalLayer = L.geoJSON({
                    ...geoData,
                    features: continentalFeatures
                } as FeatureCollection);
                mapRef.current.fitBounds(continentalLayer.getBounds());
            } else {
                // Vista por defecto centrada en Ecuador continental
                mapRef.current.fitBounds(ecuadorContinentalBounds);
            }
        }
    }, [geoData]);

    const getProvinceStyle = (feature: any) => {
        if (!salesList) return {};

        const provinceName = feature.properties.name;
        const provinceData = salesList.find(p => p.provincia === provinceName);
        const sales = provinceData?.ventas || 0;

        // Escala de colores
        let fillColor = '#f0f0f0';

        if (sales > 0) {
            if (sales > 800) fillColor = '#006837';
            else if (sales > 500) fillColor = '#31a354';
            else if (sales > 200) fillColor = '#78c679';
            else fillColor = '#c2e699';
        }

        return {
            fillColor,
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        };
    };

    const onEachFeature = (feature: any, layer: L.Layer) => {
        if (!salesList) return;

        const provinceName = feature.properties.name;
        const provinceData = salesList.find(p => p.provincia === provinceName);

        if (provinceData) {
            layer.bindTooltip(
                `<b>${provinceName}</b><br/>Ventas: $${provinceData.ventas}`,
                { sticky: true }
            );
        }
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
                    Cargando mapa...
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
                    {error}
                </div>
            )}

            <MapContainer
                center={[-1.8312, -78.1834]}
                zoom={7}
                minZoom={6}
                maxBounds={ecuadorContinentalBounds}
                style={{ height: '90%', width: '100%' }}
                ref={(instance) => {
                    if (instance) {
                        mapRef.current = instance;
                    }
                }}
                whenReady={() => { }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    noWrap={true} // Evita que el mapa se repita
                />

                {geoData && (
                    <GeoJSON
                        data={{
                            ...geoData,
                            features: geoData.features.filter(
                                feature => feature.properties && !['Galápagos'].includes(feature.properties.name)
                            )
                        } as FeatureCollection}
                        style={getProvinceStyle}
                        onEachFeature={onEachFeature}
                    />
                )}

                {salesList &&
                    Object.values(salesList)
                        .filter(p =>
                            p &&
                            typeof p.lat === 'number' &&
                            typeof p.lng === 'number' &&
                            p.provincia &&
                            p.ventas > 0
                        )
                        .map((provincia, index) => (
                            <CircleMarker
                                key={index}
                                center={[provincia.lat, provincia.lng]}
                                radius={Math.max(5, Math.sqrt(provincia.ventas))} // tamaño relativo
                                pathOptions={{
                                    color: 'red',
                                    fillColor: 'orange',
                                    fillOpacity: 0.7,
                                }}
                            >
                                <Popup>
                                    <b>{provincia.provincia}</b><br />
                                    Ciudad: {provincia.ciudad}<br />
                                    Ventas: ${provincia.ventas}
                                </Popup>
                            </CircleMarker>
                        ))}

            </MapContainer>
        </div>
    );
}