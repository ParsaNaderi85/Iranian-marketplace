"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.2)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export function OrderMapInner({
  vendor,
  delivery,
  vendorLabel,
  deliveryLabel,
}: {
  vendor: { lat: number; lng: number };
  delivery: { lat: number; lng: number } | null;
  vendorLabel: string;
  deliveryLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    L.marker([vendor.lat, vendor.lng], { icon: pinIcon("#0d9488") })
      .addTo(map)
      .bindPopup(vendorLabel);

    if (delivery) {
      L.marker([delivery.lat, delivery.lng], { icon: pinIcon("#e8a31c") })
        .addTo(map)
        .bindPopup(deliveryLabel);

      L.polyline(
        [
          [vendor.lat, vendor.lng],
          [delivery.lat, delivery.lng],
        ],
        { color: "#14b8ce", weight: 2, dashArray: "6 6" },
      ).addTo(map);

      map.fitBounds(
        [
          [vendor.lat, vendor.lng],
          [delivery.lat, delivery.lng],
        ],
        { padding: [30, 30] },
      );
    } else {
      map.setView([vendor.lat, vendor.lng], 13);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [vendor.lat, vendor.lng, delivery?.lat, delivery?.lng, vendorLabel, deliveryLabel]);

  return <div ref={containerRef} className="h-64 w-full rounded-lg" />;
}
