import { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { FeatureCollection } from 'geojson';
import L from 'leaflet';

export default function EcuadorMapWithGeoJSON() {
    const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        fetch('/data/ecuador.geojson')
            .then((res) => res.json())
            .then(setGeoData)
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (geoData && mapRef.current) {
            const map = mapRef.current;
            const geojsonLayer = L.geoJSON(geoData);
            map.fitBounds(geojsonLayer.getBounds());
        }
    }, [geoData]);

    return (
        <div style={{ height: '500px', width: '100%', border: '1px solid #ccc' }}>
            <MapContainer
                center={[-1.8312, -78.1834]}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                whenReady={() => {
                    if (mapRef.current === null && typeof window !== 'undefined') {
                        // @ts-ignore
                        mapRef.current = window.L?.map?.instances?.[0] || null;
                    }
                }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                {geoData && <GeoJSON data={geoData} />}
            </MapContainer>
        </div>
    );
}
