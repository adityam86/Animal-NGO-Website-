"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export type Facility = {
  id: string;
  name: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  icon?: string;
};

export const DEFAULT_FACILITIES: Facility[] = [
  {
    id: "main-shelter",
    name: "Ayudar Main Shelter & Clinic",
    type: "Dogs, Cats & Emergency Triage",
    address: "123, Civil Lines, Raniganj, WB — 713347",
    lat: 23.6255,
    lng: 87.1278,
    phone: "+91 98765 43210",
    icon: "🏠",
  },
  {
    id: "gaushala",
    name: "Ayudar Gaushala Sanctuary",
    type: "Cows & Large Animals",
    address: "Durgapur Expressway / Andal Road, WB",
    lat: 23.5930,
    lng: 87.1720,
    phone: "+91 98000 00000",
    icon: "🐄",
  },
  {
    id: "cat-wing",
    name: "Ayudar Cat Wing",
    type: "Feline Care & Rehabilitation",
    address: "Station Road, Asansol, WB",
    lat: 23.6888,
    lng: 86.9661,
    phone: "+91 98765 43210",
    icon: "🐱",
  },
];

type InteractiveMapProps = {
  mode: "picker" | "facilities";
  initialLat?: number;
  initialLng?: number;
  zoom?: number;
  height?: string | number;
  facilities?: Facility[];
  selectedLat?: number | null;
  selectedLng?: number | null;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
};

export default function InteractiveMap({
  mode = "picker",
  initialLat = 23.6215,
  initialLng = 87.1300,
  zoom = 13,
  height = 360,
  facilities = DEFAULT_FACILITIES,
  selectedLat,
  selectedLng,
  onLocationSelect,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(
    selectedLat && selectedLng ? { lat: selectedLat, lng: selectedLng } : null
  );

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: currentCoords ? [currentCoords.lat, currentCoords.lng] : [initialLat, initialLng],
        zoom: zoom,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // OpenStreetMap clean tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // SVG Pin for Emergency Picker
      const createEmergencyIcon = () =>
        L.divIcon({
          className: "custom-map-pin",
          html: `
            <div style="
              width: 38px;
              height: 38px;
              background: hsl(0, 80%, 50%);
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="transform: rotate(45deg); font-size: 16px;">🚨</span>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -36],
        });

      // SVG Pin for Facilities
      const createFacilityIcon = (emoji: string) =>
        L.divIcon({
          className: "facility-map-pin",
          html: `
            <div style="
              width: 40px;
              height: 40px;
              background: var(--saffron-500, #ea580c);
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 14px rgba(234, 88, 12, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            ">
              ${emoji}
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -22],
        });

      if (mode === "facilities") {
        facilities.forEach((fac) => {
          const m = L.marker([fac.lat, fac.lng], {
            icon: createFacilityIcon(fac.icon || "🏠"),
          }).addTo(map);

          m.bindPopup(`
            <div style="padding: 4px; font-family: sans-serif;">
              <strong style="font-size: 14px; color: #1e293b; display: block; margin-bottom: 4px;">${fac.name}</strong>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">${fac.type}</div>
              <div style="font-size: 12px; color: #334155; margin-bottom: 8px;">📍 ${fac.address}</div>
              ${fac.phone ? `<div style="font-size: 12px; margin-bottom: 8px;">📞 <a href="tel:${fac.phone}" style="color: #ea580c; text-decoration: none; font-weight: 600;">${fac.phone}</a></div>` : ""}
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}" 
                target="_blank" 
                rel="noopener noreferrer" 
                style="display: inline-block; background: #ea580c; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; text-decoration: none; font-weight: 600;"
              >
                Get Directions ↗
              </a>
            </div>
          `);
        });

        // Fit bounds to facilities
        if (facilities.length > 1) {
          const group = L.featureGroup(facilities.map((f) => L.marker([f.lat, f.lng])));
          map.fitBounds(group.getBounds().pad(0.2));
        }
      } else {
        // Picker mode
        const placeOrUpdateMarker = async (lat: number, lng: number) => {
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], {
              icon: createEmergencyIcon(),
              draggable: true,
            }).addTo(map);

            markerRef.current.on("dragend", async (e: any) => {
              const pos = e.target.getLatLng();
              setCurrentCoords({ lat: pos.lat, lng: pos.lng });
              const addr = await reverseGeocode(pos.lat, pos.lng);
              if (onLocationSelect) onLocationSelect(pos.lat, pos.lng, addr);
            });
          }

          setCurrentCoords({ lat, lng });
          map.panTo([lat, lng]);

          const addr = await reverseGeocode(lat, lng);
          if (onLocationSelect) onLocationSelect(lat, lng, addr);
        };

        if (currentCoords) {
          placeOrUpdateMarker(currentCoords.lat, currentCoords.lng);
        }

        map.on("click", (e: any) => {
          placeOrUpdateMarker(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle GPS button click
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLoadingLocation(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setCurrentCoords({ lat, lng });

        if (mapInstanceRef.current) {
          const L = (await import("leaflet")).default;
          mapInstanceRef.current.setView([lat, lng], 16);

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], {
              draggable: true,
            }).addTo(mapInstanceRef.current);
          }
        }

        const addr = await reverseGeocode(lat, lng);
        if (onLocationSelect) {
          onLocationSelect(lat, lng, addr);
        }
      },
      (err) => {
        setLoadingLocation(false);
        console.error("Geolocation error:", err);
        alert("Unable to retrieve your location. Please ensure location permissions are granted.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: "var(--radius-lg, 12px)", overflow: "hidden", border: "1px solid var(--cream-300, #e2e8f0)" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height }} />

      {mode === "picker" && (
        <div style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 1000,
          display: "flex",
          gap: "8px"
        }}>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={loadingLocation}
            style={{
              padding: "8px 14px",
              background: "white",
              color: "hsl(0, 75%, 45%)",
              border: "1.5px solid hsl(0, 75%, 45%)",
              borderRadius: "20px",
              fontWeight: 700,
              fontSize: "0.82rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {loadingLocation ? "📍 Locating..." : "📍 Locate Me"}
          </button>
        </div>
      )}

      {mode === "picker" && currentCoords && (
        <div style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          zIndex: 1000,
          background: "rgba(255,255,255,0.95)",
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--stone-700, #334155)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)"
        }}>
          📍 GPS: {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.display_name) {
        return data.display_name;
      }
    }
  } catch (e) {
    console.warn("Reverse geocode failed:", e);
  }
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
