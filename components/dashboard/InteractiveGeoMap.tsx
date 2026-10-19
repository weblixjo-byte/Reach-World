"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPinItem {
  id: string;
  name: string;
  jobTitle?: string;
  location: string;
  lat?: number;
  lng?: number;
  time?: string;
}

interface InteractiveGeoMapProps {
  items: MapPinItem[];
}

export default function InteractiveGeoMap({ items }: InteractiveGeoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Filter items with valid latitude and longitude
    const validItems = items.filter(
      (item) => typeof item.lat === "number" && typeof item.lng === "number" && !isNaN(item.lat) && !isNaN(item.lng)
    );

    // Initial center (Default: Amman, Jordan coordinates: 31.9522, 35.9284)
    const initialLat = validItems.length > 0 && validItems[0].lat ? validItems[0].lat : 31.9522;
    const initialLng = validItems.length > 0 && validItems[0].lng ? validItems[0].lng : 35.9284;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: validItems.length > 0 ? 11 : 6,
        zoomControl: true,
        attributionControl: false,
      });

      // Ultra-clean CartoDB Positron / Voyager light map tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([initialLat, initialLng]);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Custom pulse dot marker
    const createCustomIcon = (name: string) => {
      return L.divIcon({
        className: "custom-pin",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; background: rgba(16, 185, 129, 0.25); border-radius: 9999px; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; background: #10B981; border: 2.5px solid #FFFFFF; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    };

    const bounds = L.latLngBounds([]);

    validItems.forEach((item) => {
      if (item.lat && item.lng) {
        const marker = L.marker([item.lat, item.lng], {
          icon: createCustomIcon(item.name),
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px 2px; min-width: 160px;">
            <div style="font-weight: 700; font-size: 13px; color: #0F172A; margin-bottom: 2px;">
              ${item.name}
            </div>
            <div style="font-size: 11px; font-weight: 600; color: #10B981; margin-bottom: 4px;">
              ● ${item.location}
            </div>
            <div style="font-size: 10px; color: #64748B;">
              Last active: ${item.time || "Recently"}
            </div>
          </div>
        `);

        bounds.extend([item.lat, item.lng]);
      }
    });

    if (validItems.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => {
      // Keep map initialized across tab switches
    };
  }, [items]);

  return (
    <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-black/5 text-[11px] font-semibold text-[#0F172A] shadow-sm flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
        Live GPS & Field Presence
      </div>
    </div>
  );
}
