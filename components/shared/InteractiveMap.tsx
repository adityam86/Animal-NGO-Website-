"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search, Layers, ExternalLink, Compass } from "lucide-react";

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

export type MapStyleMode = "terrain" | "satellite" | "street";

// Official coordinates decoded from Plus Code PW3Q+5F, Tilabad, Kumarpur, Asansol, WB 713304
export const AYUDAR_SHELTER_COORDS = {
  lat: 23.703819,
  lng: 86.938713,
};

export const DEFAULT_FACILITIES: Facility[] = [
  {
    id: "main-shelter",
    name: "Ayudar Shelter (Animal Hospital)",
    type: "Shelter, Veterinary Triage & Gaushala Care",
    address: "PW3Q+5F, Tilabad, Kumarpur, Asansol, West Bengal 713304",
    lat: AYUDAR_SHELTER_COORDS.lat,
    lng: AYUDAR_SHELTER_COORDS.lng,
    phone: "+91 73840 20901",
    icon: "🏥",
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
  initialLat = AYUDAR_SHELTER_COORDS.lat,
  initialLng = AYUDAR_SHELTER_COORDS.lng,
  zoom = 15,
  height = 340,
  facilities = DEFAULT_FACILITIES,
  selectedLat,
  selectedLng,
  onLocationSelect,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Leaflet.Map | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const baseLayerGroupRef = useRef<Leaflet.LayerGroup | null>(null);
  const markerRef = useRef<Leaflet.Marker | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyleMode>("terrain");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(
    selectedLat && selectedLng ? { lat: selectedLat, lng: selectedLng } : null
  );

  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  const initConfigRef = useRef({
    mode,
    initialLat,
    initialLng,
    zoom,
    facilities,
    initialCoords: selectedLat && selectedLng ? { lat: selectedLat, lng: selectedLng } : null,
  });

  const buildEmergencyIcon = (L: typeof Leaflet) =>
    L.divIcon({
      className: "custom-map-pin",
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: #B83232;
          border: 3px solid #FFFFFF;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #FAF7F2; transform: rotate(45deg);"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -34],
    });

  const applyTileLayers = (L: typeof Leaflet, layerGroup: Leaflet.LayerGroup, style: MapStyleMode) => {
    layerGroup.clearLayers();

    if (style === "terrain") {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri — Topo Terrain, Roads &amp; Landmarks",
          maxZoom: 19,
        }
      ).addTo(layerGroup);
      return;
    }

    if (style === "satellite") {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Imagery &copy; Esri &amp; Contributors",
          maxZoom: 19,
        }
      ).addTo(layerGroup);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          opacity: 0.9,
        }
      ).addTo(layerGroup);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
        }
      ).addTo(layerGroup);
      return;
    }

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(layerGroup);
  };

  useEffect(() => {
    let isMounted = true;
    const cfg = initConfigRef.current;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      leafletRef.current = L;

      const map = L.map(mapContainerRef.current, {
        center: cfg.initialCoords
          ? [cfg.initialCoords.lat, cfg.initialCoords.lng]
          : [cfg.initialLat, cfg.initialLng],
        zoom: cfg.zoom,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      const baseGroup = L.layerGroup().addTo(map);
      baseLayerGroupRef.current = baseGroup;
      applyTileLayers(L, baseGroup, "terrain");

      const createFacilityIcon = (label: string) =>
        L.divIcon({
          className: "facility-map-pin",
          html: `
            <div style="
              width: 38px;
              height: 38px;
              background: #183627;
              border: 2.5px solid #FAF7F2;
              border-radius: 50%;
              box-shadow: 0 4px 14px rgba(24, 54, 39, 0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 17px;
            ">
              ${label}
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [0, -22],
        });

      if (cfg.mode === "facilities") {
        cfg.facilities.forEach((fac) => {
          const m = L.marker([fac.lat, fac.lng], {
            icon: createFacilityIcon(fac.icon || "🏥"),
          }).addTo(map);

          m.bindPopup(`
            <div style="padding: 4px; font-family: sans-serif; min-width: 210px;">
              <strong style="font-size: 13.5px; color: #183627; display: block; margin-bottom: 3px;">${fac.name}</strong>
              <div style="font-size: 11.5px; color: #495A51; margin-bottom: 5px;">${fac.type}</div>
              <div style="font-size: 11.5px; color: #1A2820; margin-bottom: 8px; line-height: 1.4;">${fac.address}</div>
              ${fac.phone ? `<div style="font-size: 11.5px; margin-bottom: 8px;">Emergency: <a href="tel:${fac.phone.replace(/\s+/g, "")}" style="color: #BF5740; text-decoration: none; font-weight: 600;">${fac.phone}</a></div>` : ""}
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}"
                target="_blank"
                rel="noopener noreferrer"
                style="display: inline-block; background: #D96B52; color: white; padding: 5px 10px; border-radius: 4px; font-size: 11px; text-decoration: none; font-weight: 600;"
              >
                Open Directions in Google Maps ↗
              </a>
            </div>
          `, { autoPanPaddingTopLeft: L.point(20, 56), autoPanPaddingBottomRight: L.point(20, 40) });
        });

        if (cfg.facilities.length > 1) {
          const group = L.featureGroup(cfg.facilities.map((f) => L.marker([f.lat, f.lng])));
          map.fitBounds(group.getBounds().pad(0.25));
        }
      } else {
        const placeOrUpdateMarker = async (lat: number, lng: number, shouldReverseGeocode = true) => {
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], {
              icon: buildEmergencyIcon(L),
              draggable: true,
            }).addTo(map);

            markerRef.current.on("dragend", async (e: Leaflet.LeafletEvent) => {
              const target = e.target as Leaflet.Marker;
              const pos = target.getLatLng();
              setCurrentCoords({ lat: pos.lat, lng: pos.lng });
              const addr = await reverseGeocode(pos.lat, pos.lng);
              onLocationSelectRef.current?.(pos.lat, pos.lng, addr);
            });
          }

          setCurrentCoords({ lat, lng });
          map.panTo([lat, lng]);

          if (shouldReverseGeocode) {
            const addr = await reverseGeocode(lat, lng);
            onLocationSelectRef.current?.(lat, lng, addr);
          }
        };

        if (cfg.initialCoords) {
          placeOrUpdateMarker(cfg.initialCoords.lat, cfg.initialCoords.lng, false);
        }

        map.on("click", (e: Leaflet.LeafletMouseEvent) => {
          placeOrUpdateMarker(e.latlng.lat, e.latlng.lng, true);
        });
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        baseLayerGroupRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Switch map tile layer dynamically when user changes Terrain / Satellite / Street
  useEffect(() => {
    const L = leafletRef.current;
    const layerGroup = baseLayerGroupRef.current;
    if (!L || !layerGroup) return;
    applyTileLayers(L, layerGroup, mapStyle);
  }, [mapStyle]);

  // Sync map center & draggable pin when parent selectedLat/selectedLng updates (e.g. external GPS button)
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (mode !== "picker" || !L || !map || !selectedLat || !selectedLng) return;

    map.setView([selectedLat, selectedLng], Math.max(map.getZoom(), 16));
    if (markerRef.current) {
      markerRef.current.setLatLng([selectedLat, selectedLng]);
    } else {
      markerRef.current = L.marker([selectedLat, selectedLng], {
        icon: buildEmergencyIcon(L),
        draggable: true,
      }).addTo(map);
      markerRef.current.on("dragend", async (e: Leaflet.LeafletEvent) => {
        const pos = (e.target as Leaflet.Marker).getLatLng();
        setCurrentCoords({ lat: pos.lat, lng: pos.lng });
        const addr = await reverseGeocode(pos.lat, pos.lng);
        onLocationSelectRef.current?.(pos.lat, pos.lng, addr);
      });
    }
    setCurrentCoords({ lat: selectedLat, lng: selectedLng });
  }, [mode, selectedLat, selectedLng]);

  const handleUseCurrentLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser. Search the landmark or tap the terrain map.");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLoadingLocation(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentCoords({ lat, lng });

        const L = leafletRef.current;
        const map = mapInstanceRef.current;
        if (L && map) {
          map.setView([lat, lng], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], {
              icon: buildEmergencyIcon(L),
              draggable: true,
            }).addTo(map);
            markerRef.current.on("dragend", async (e: Leaflet.LeafletEvent) => {
              const dragPos = (e.target as Leaflet.Marker).getLatLng();
              setCurrentCoords({ lat: dragPos.lat, lng: dragPos.lng });
              const dragAddr = await reverseGeocode(dragPos.lat, dragPos.lng);
              onLocationSelectRef.current?.(dragPos.lat, dragPos.lng, dragAddr);
            });
          }
        }

        const addr = await reverseGeocode(lat, lng);
        onLocationSelectRef.current?.(lat, lng, addr);
      },
      () => {
        setLoadingLocation(false);
        setGeoError("Location permission denied or unavailable. Search a nearby road/area below or click the map.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchArea = async () => {
    const query = searchQuery.trim();
    if (query.length < 2) return;
    setSearching(true);
    setGeoError(null);

    try {
      const q = encodeURIComponent(
        query.toLowerCase().includes("asansol") ||
          query.toLowerCase().includes("raniganj") ||
          query.toLowerCase().includes("durgapur") ||
          query.toLowerCase().includes("west bengal")
          ? query
          : `${query}, Asansol, West Bengal`
      );
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const results = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
        if (results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          const map = mapInstanceRef.current;
          const L = leafletRef.current;
          if (L && map) {
            map.setView([lat, lng], 16);
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else {
              markerRef.current = L.marker([lat, lng], {
                icon: buildEmergencyIcon(L),
                draggable: true,
              }).addTo(map);
              markerRef.current.on("dragend", async (e: Leaflet.LeafletEvent) => {
                const pos = (e.target as Leaflet.Marker).getLatLng();
                setCurrentCoords({ lat: pos.lat, lng: pos.lng });
                const addr = await reverseGeocode(pos.lat, pos.lng);
                onLocationSelectRef.current?.(pos.lat, pos.lng, addr);
              });
            }
          }
          setCurrentCoords({ lat, lng });
          onLocationSelectRef.current?.(lat, lng, results[0].display_name);
        } else {
          setGeoError(`Could not find "${query}". Try searching Kumarpur, Asansol, Raniganj, or tap the map directly.`);
        }
      }
    } catch {
      setGeoError("Area lookup failed temporarily. Tap directly on the map to drop a pin.");
    } finally {
      setSearching(false);
    }
  };

  const handleRecenterShelter = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([AYUDAR_SHELTER_COORDS.lat, AYUDAR_SHELTER_COORDS.lng], 15);
    }
  };

  const googleMapsTerrainHref = currentCoords
    ? `https://www.google.com/maps/@?api=1&map_action=map&center=${currentCoords.lat},${currentCoords.lng}&zoom=17&basemap=terrain`
    : `https://www.google.com/maps/search/?api=1&query=${AYUDAR_SHELTER_COORDS.lat},${AYUDAR_SHELTER_COORDS.lng}`;

  return (
    <div style={{ width: "100%" }}>
      {/* Picker Area Search Bar */}
      {mode === "picker" && (
        <div
          style={{
            display: "flex",
            gap: "0.45rem",
            marginBottom: "0.55rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <input
              type="text"
              className="form-input"
              aria-label="Search landmark or locality on rescue map"
              placeholder="Jump map to area (e.g., Kumarpur, GT Road, Raniganj)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchArea();
                }
              }}
              style={{ fontSize: "0.85rem", paddingRight: "2.25rem", height: "38px" }}
            />
            <Search
              size={14}
              aria-hidden="true"
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--stone-400)",
                pointerEvents: "none",
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleSearchArea}
            disabled={searching}
            className="btn btn-outline btn-sm"
            style={{ height: "38px", borderRadius: "var(--radius-sm)" }}
          >
            {searching ? "Finding..." : "Find on Map"}
          </button>
          <button
            type="button"
            onClick={handleRecenterShelter}
            title="Center map near Ayudar Shelter, Tilabad Kumarpur Asansol"
            className="btn btn-outline btn-sm"
            style={{ height: "38px", borderRadius: "var(--radius-sm)", gap: "0.3rem" }}
          >
            <Compass size={14} aria-hidden="true" /> Shelter Area
          </button>
        </div>
      )}

      {/* Interactive Map Canvas */}
      <div
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          border: "1px solid var(--cream-300, #CEC3AF)",
          background: "#E8E4DB",
        }}
      >
        <div ref={mapContainerRef} style={{ width: "100%", height }} />

        {/* Map View Switcher (Terrain / Satellite / Street) + Locate Action */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            maxWidth: "calc(100% - 54px)",
            zIndex: 450,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "6px",
          }}
        >
          <div
            role="group"
            aria-label="Map terrain and layer selector"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.96)",
              borderRadius: "4px",
              padding: "2px",
              border: "1px solid rgba(26, 40, 32, 0.16)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
            }}
          >
            <Layers size={13} style={{ color: "#495A51", margin: "0 5px 0 6px" }} aria-hidden="true" />
            {(
              [
                { id: "terrain", label: "Terrain" },
                { id: "satellite", label: "Satellite" },
                { id: "street", label: "Street" },
              ] as const
            ).map((layer) => {
              const active = mapStyle === layer.id;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setMapStyle(layer.id)}
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.73rem",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    background: active ? "#183627" : "transparent",
                    color: active ? "#FAF7F2" : "#2C3D34",
                  }}
                >
                  {layer.label}
                </button>
              );
            })}
          </div>

          {mode === "picker" && (
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={loadingLocation}
              style={{
                padding: "6px 11px",
                background: "#FAF7F2",
                color: "#B83232",
                border: "1.5px solid #B83232",
                borderRadius: "4px",
                fontWeight: 700,
                fontSize: "0.76rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <MapPin size={13} aria-hidden="true" />
              <span>{loadingLocation ? "Locating..." : "Locate Me"}</span>
            </button>
          )}
        </div>

        {/* Bottom GPS Coordinates + Direct Google Maps Link */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            zIndex: 450,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {mode === "picker" && currentCoords ? (
            <div
              style={{
                background: "rgba(250, 247, 242, 0.96)",
                padding: "4px 9px",
                borderRadius: "4px",
                fontSize: "0.74rem",
                fontWeight: 600,
                color: "#1A2820",
                border: "1px solid rgba(26, 40, 32, 0.14)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.14)",
              }}
            >
              Pin: {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
            </div>
          ) : (
            <div
              style={{
                background: "rgba(250, 247, 242, 0.95)",
                padding: "4px 9px",
                borderRadius: "4px",
                fontSize: "0.73rem",
                fontWeight: 500,
                color: "#2C3D34",
                border: "1px solid rgba(26, 40, 32, 0.14)",
              }}
            >
              {mode === "picker"
                ? "Tap terrain or drag marker to mark injured animal"
                : "Ayudar Shelter · Tilabad, Kumarpur, Asansol 713304"}
            </div>
          )}

          <a
            href={googleMapsTerrainHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "rgba(24, 54, 39, 0.92)",
              color: "#FAF7F2",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "0.72rem",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>Google Maps</span>
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        </div>
      </div>

      {geoError && (
        <div
          role="alert"
          style={{
            marginTop: "8px",
            padding: "8px 12px",
            borderRadius: "4px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#B91C1C",
            fontSize: "12px",
            fontWeight: 500,
          }}
        >
          {geoError}
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
