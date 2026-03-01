import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ points }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !points || points.length === 0) return;

        // Convert to Leaflet heat points format: [lat, lng, intensity]
        // Value maps to intensity (0.0 to 1.0)
        const heatPoints = points.map(p => {
            // Scale vulnerability score (0-100) to intensity (0-1)
            const intensity = Math.min(Math.max((p.risk_score || 50) / 100, 0.1), 1.0);
            return [p.location_lat, p.location_lng, intensity];
        });

        const heatLayer = L.heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 13,
            max: 1.0,
            gradient: {
                0.1: '#10b981', // green (low risk)
                0.5: '#f59e0b', // orange (medium risk)
                0.8: '#ef4444'  // red (high risk)
            }
        }).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points]);

    return null;
}
