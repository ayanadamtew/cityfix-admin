'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { AnalyticsData, Department } from '@/types';
import L from 'leaflet';
import { Activity } from 'lucide-react';

// Fix Leaflet's default icon issue with webpack/nextjs
const DefaultIcon = L.icon({
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons based on category
const createCategoryIcon = (category: Department, color: string) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

const categoryColors: Record<Department, string> = {
    'Water': '#3b82f6', // blue-500
    'Road': '#f59e0b', // amber-500
    'Electricity': '#eab308', // yellow-500
    'Waste': '#22c55e', // green-500
};

// Component to recenter map when bounds or markers change
function MapController({ locations }: { locations: AnalyticsData['locations'] }) {
    const map = useMap();

    useEffect(() => {
        if (!locations || locations.length === 0) return;

        try {
            const bounds = L.latLngBounds(locations.map(loc => [loc.location.latitude!, loc.location.longitude!]));
            // Only fitBounds if bounds are valid to prevent errors
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        } catch (e) {
            console.error('Error fitting map bounds:', e);
        }
    }, [map, locations]);

    return null;
}

interface DashboardMapProps {
    locations: AnalyticsData['locations'];
}

export default function DashboardMap({ locations }: DashboardMapProps) {
    // Center map on Jimma, Ethiopia
    const jimmaCenter: [number, number] = [7.6751, 36.8351];

    // Safety check - filter out invalid locations
    const validLocations = locations?.filter(
        loc => loc.location && typeof loc.location.latitude === 'number' && typeof loc.location.longitude === 'number'
    ) || [];

    return (
        <div className="w-full h-[500px] relative rounded-xl overflow-hidden z-10 border border-white/10 shadow-xl">
            {/* Provide explicit dark mode tile layer */}
            <MapContainer
                center={jimmaCenter}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '500px', width: '100%', zIndex: 1 }}
                attributionControl={false}
            >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                />

                {validLocations.map((loc) => {
                    const statusColorMap = {
                        'Pending': 'warning',
                        'In Progress': 'info',
                        'Resolved': 'success'
                    } as const;

                    return (
                        <Marker
                            key={loc._id}
                            position={[loc.location.latitude!, loc.location.longitude!]}
                            icon={createCategoryIcon(loc.category, categoryColors[loc.category] || '#94a3b8')}
                        >
                            <Popup className="dark-popup">
                                <div className="p-1 min-w-[200px]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs px-2 py-0.5 rounded-full border border-surface-200 bg-surface-900/50 text-surface-900 font-medium">
                                            {loc.category}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${loc.status === 'Pending' ? 'bg-warning/10 text-warning border border-warning/20' :
                                            loc.status === 'In Progress' ? 'bg-info/10 text-info border border-info/20' :
                                                'bg-success/10 text-success border border-success/20'
                                            }`}>
                                            {loc.status}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-sm mb-1 text-surface-900 border-b border-surface-200 pb-2">
                                        Issue #{loc._id.substring(loc._id.length - 6).toUpperCase()}
                                    </h4>
                                    <div className="flex items-center text-xs text-surface-600 mt-2 gap-1 font-medium">
                                        <Activity className="w-3 h-3 text-danger" />
                                        {loc.urgencyCount} urgency votes
                                    </div>
                                    <div className="text-[10px] text-surface-400 mt-1">
                                        Reported: {new Date(loc.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <MapController locations={validLocations} />
            </MapContainer>

            {/* Custom overlay style for leaflet popups in dark mode */}
            <style jsx global>{`
                .leaflet-popup-content-wrapper, .leaflet-popup-tip {
                    background-color: #fafafa !important;
                    color: #171717 !important;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
                }
                .leaflet-popup-close-button {
                    color: #737373 !important;
                }
                .leaflet-popup-close-button:hover {
                    color: #171717 !important;
                }
                .leaflet-container {
                    background: #171717; /* Avoid white flash while loading tiles */
                }
                .leaflet-control-zoom a {
                    background-color: #262626 !important;
                    color: #e5e5e5 !important;
                    border-color: #404040 !important;
                }
                .leaflet-control-zoom a:hover {
                    background-color: #404040 !important;
                }
                .leaflet-bar {
                    border-color: #404040 !important;
                }
            `}</style>
        </div>
    );
}
