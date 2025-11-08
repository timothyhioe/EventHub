import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
        }),
    });
}

// Polyfills required by react-router / testing environment
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;
(global as any).ResizeObserver =
    (global as any).ResizeObserver ||
    class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };

jest.mock('react-leaflet', () => {
    const React = require('react');

    const MapContainer = ({ children }: { children: any }) =>
        React.createElement('div', { 'data-testid': 'leaflet-map' }, children);

    const Popup = ({ children }: { children: any }) =>
        React.createElement('div', null, children);

    return {
        MapContainer,
        TileLayer: () => null,
        Marker: () => null,
        Popup,
        useMap: () => ({
        setView: jest.fn(),
        }),
    };
});

