import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Box } from '@mantine/core';

interface LocationMapProps {
    latitude: number;
    longitude: number;
    address?: string;
    height?: number;
}

function ChangeView({center, zoom}: {center: [number, number], zoom: number}) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);

    return null;
}

export function LocationMap({ latitude, longitude, address, height = 200 }: LocationMapProps) {
    return (
        <Box style={{ height: `${height}px`, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer
                center={[latitude, longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={[latitude, longitude]} zoom={13} />
                <Marker position={[latitude, longitude]}>
                    <Popup>{address}</Popup>
                </Marker>
            </MapContainer>
        </Box>
    );
}