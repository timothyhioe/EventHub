import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box } from '@mantine/core';

interface LocationMapProps {
    latitude: number;
    longitude: number;
    address?: string;
    height?: number;
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
            <Marker position={[latitude, longitude]}>
            <Popup>{address}</Popup>
            </Marker>
        </MapContainer>
        </Box>
    );
}