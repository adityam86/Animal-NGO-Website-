"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, ShieldAlert } from "lucide-react";
import { AYUDAR_SHELTER_COORDS, type MapStyleMode } from "@/components/shared/InteractiveMap";

export type HotspotItem = {
  cellId: string;
  lat: number;
  lng: number;
  count: number;
  criticalCount: number;
  speciesSummary: Record<string, number>;
  latestReportedAt: string;
};

type HotspotMapProps = {
  hotspots: HotspotItem[];
  height?: number;
};

export default function HotspotMap({ hotspots, height = 460 }: HotspotMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const baseGroupRef = useRef<Leaflet.LayerGroup | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyleMode>("terrain");

  const applyTileLayer = (L: typeof Leaflet, group: Leaflet.LayerGroup, mode: MapStyleMode) => {
    group.clearLayers();
    if (mode === "terrain") {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles © Esri & Contributors", maxZoom: 19 }
      ).addTo(group);
    } else if (mode === "satellite") {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Imagery © Esri & Maxar", maxZoom: 19 }
      ).addTo(group);
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, opacity: 0.85 }
      ).addTo(group);
    } else {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(group);
    }
  };

  useEffect(() => {
    let active = true;
    async function init() {
      if (!containerRef.current || mapRef.current) return;
      const L = await import("leaflet");
      if (!active || !containerRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        center: [AYUDAR_SHELTER_COORDS.lat, AYUDAR_SHELTER_COORDS.lng],
        zoom: 12,
      });
      mapRef.current = map;

      const baseGroup = L.layerGroup().addTo(map);
      baseGroupRef.current = baseGroup;
      applyTileLayer(L, baseGroup, "terrain");

      // Shelter anchor pin
      L.marker([AYUDAR_SHELTER_COORDS.lat, AYUDAR_SHELTER_COORDS.lng], {
        icon: L.divIcon({
          className: "shelter-anchor",
          html: `<div style="width:36px;height:36px;background:#183627;border:2.5px solid #FAF7F2;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 4px 12px rgba(0,0,0,0.35);">🏥</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        }),
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;font-size:12px;"><strong>Ayudar Shelter (Animal Hospital)</strong><br/>Tilabad, Kumarpur, Asansol</div>`
        );

      hotspots.forEach((h) => {
        const radius = Math.min(34, 12 + h.count * 4);
        const color = h.criticalCount > 0 ? "#B83232" : "#D96B52";
        const speciesHtml = Object.entries(h.speciesSummary)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" · ");

        L.circleMarker([h.lat, h.lng], {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.35,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;font-size:12px;min-width:170px;">
              <strong>Zone Hotspot (~330m grid)</strong><br/>
              Total geo-tagged rescues: <strong>${h.count}</strong><br/>
              ${h.criticalCount > 0 ? `Critical calls: <strong>${h.criticalCount}</strong><br/>` : ""}
              <span>${speciesHtml}</span>
            </div>`
          );
      });

      if (hotspots.length > 0) {
        const pts: [number, number][] = [
          [AYUDAR_SHELTER_COORDS.lat, AYUDAR_SHELTER_COORDS.lng],
          ...hotspots.map((h): [number, number] => [h.lat, h.lng]),
        ];
        map.fitBounds(L.latLngBounds(pts).pad(0.25), { maxZoom: 13 });
      }
    }
    init();
    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [hotspots]);

  const handleStyleChange = (mode: MapStyleMode) => {
    setMapStyle(mode);
    if (leafletRef.current && baseGroupRef.current) {
      applyTileLayer(leafletRef.current, baseGroupRef.current, mode);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "0.85rem",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.84rem", color: "var(--stone-600)" }}>
          <ShieldAlert size={16} style={{ color: "var(--terracotta)" }} />
          Coordinates rounded to ~330m grid cells (reporter PII stripped)
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "var(--cream-100)", padding: "0.25rem", borderRadius: "var(--radius-full)", border: "1px solid var(--cream-200)" }}>
          <Layers size={13} style={{ marginLeft: "0.45rem", color: "var(--stone-500)" }} />
          {(["terrain", "satellite", "street"] as MapStyleMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleStyleChange(mode)}
              style={{
                border: "none",
                borderRadius: "var(--radius-full)",
                padding: "0.28rem 0.7rem",
                fontSize: "0.76rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
                background: mapStyle === mode ? "var(--green-700)" : "transparent",
                color: mapStyle === mode ? "#FFFFFF" : "var(--stone-700)",
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height,
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--cream-200)",
          background: "var(--cream-100)",
        }}
      />
    </div>
  );
}
