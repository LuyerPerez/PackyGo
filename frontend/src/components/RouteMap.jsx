import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faBullseye
} from "@fortawesome/free-solid-svg-icons";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function useDebouncedValue(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
export default function RouteMap({ 
  originAddress, 
  destinationAddress, 
  ratePerKm = 0, 
  onDistanceChange,
  onOriginChange,
  onDestinationChange 
}) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const animMarkerRef = useRef(null);
  const animFrameRef = useRef(null);

  const [info, setInfo] = useState({ distanceKm: 0, durationMin: 0 });
  const [clickMode, setClickMode] = useState(null);

  const dOrigin = useDebouncedValue(originAddress);
  const dDest = useDebouncedValue(destinationAddress);
  const clickModeRef = useRef(null);

  useEffect(() => {
    clickModeRef.current = clickMode;
  }, [clickMode]);

  useEffect(() => {
    if (mapRef.current || !mapEl.current) return;
    const bogota = [4.711, -74.072];
    const map = L.map(mapEl.current, {
      center: bogota,
      zoom: 12,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    map.on('click', async (e) => {
      const mode = clickModeRef.current;
      if (!mode) return;
      
      const { lat, lng } = e.latlng;
      
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.display_name) {
          const address = data.display_name;
          
          if (mode === 'origin') {
            onOriginChange && onOriginChange(address);
            setClickMode(null);
          } else if (mode === 'destination') {
            onDestinationChange && onDestinationChange(address);
            setClickMode(null);
          }
        }
      } catch (err) {
        console.error('Error en geocodificación inversa:', err);
      }
    });

    const InfoControl = L.Control.extend({
      onAdd() {
        const div = L.DomUtil.create("div", "route-info-control");
        div.style.background = "#ffffff";
        div.style.padding = "8px 10px";
        div.style.borderRadius = "8px";
        div.style.boxShadow = "0 2px 12px #0002";
        div.style.fontSize = "13px";
        div.style.minWidth = "220px";
        div.innerHTML = "<b>Ruta</b><br/><span>Haz clic en el mapa o escribe las direcciones…</span>";
        this._div = div;
        return div;
      },
      setContent(html) {
        if (this._div) this._div.innerHTML = html;
      },
    });
    const infoControl = new InfoControl({ position: "topright" });
    infoControl.addTo(map);
    mapRef.current.__infoControl = infoControl;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapRef, onOriginChange, onDestinationChange]);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.__infoControl) return;
    const { distanceKm, durationMin } = info;
    const price = ratePerKm > 0 ? distanceKm * ratePerKm : 0;
    const priceFmt = price > 0 ? price.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }) : "--";
    const distFmt = distanceKm > 0 ? `${distanceKm.toFixed(1)} km` : "--";
    const durFmt = durationMin > 0 ? `${Math.round(durationMin)} min` : "--";
    mapRef.current.__infoControl.setContent(
      `<b>Detalle de ruta</b><br/>
       Distancia: <b>${distFmt}</b><br/>
       Duración: <b>${durFmt}</b><br/>
       Tarifa x km: <b>${ratePerKm ? ratePerKm.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }) : "--"}</b><br/>
       Precio estimado: <b style="color:#1b883a">${priceFmt}</b>`
    );
  }, [info, ratePerKm]);

  const animateMarker = (latlngs) => {
    const map = mapRef.current;
    if (!map || !latlngs || latlngs.length < 2) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (animMarkerRef.current) {
      map.removeLayer(animMarkerRef.current);
      animMarkerRef.current = null;
    }

    const marker = L.marker(latlngs[0]).addTo(map);
    animMarkerRef.current = marker;
    const durationMs = Math.min(12000, Math.max(6000, latlngs.length * 20));

    const cum = [0];
    let total = 0;
    for (let i = 1; i < latlngs.length; i++) {
      total += latlngs[i - 1].distanceTo(latlngs[i]);
      cum.push(total);
    }
    if (total <= 0) return;

    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const dist = t * total;
      let idx = 0;
      while (idx < cum.length - 1 && cum[idx + 1] < dist) idx++;
      const segStart = latlngs[idx];
      const segEnd = latlngs[Math.min(idx + 1, latlngs.length - 1)];
      const segLen = segStart.distanceTo(segEnd) || 1;
      const segT = (dist - cum[idx]) / segLen;
      const lat = segStart.lat + (segEnd.lat - segStart.lat) * segT;
      const lng = segStart.lng + (segEnd.lng - segStart.lng) * segT;
      marker.setLatLng([lat, lng]);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  };

  const geocodeColombia = async (rawQuery) => {
    const q = (rawQuery || "").trim();
    if (q.length < 5) {
      throw new Error("La dirección es muy corta. Añade ciudad/municipio, p. ej.: 'Calle 26 # 13-19, Bogotá'.");
    }
    const tries = [
      q,
      `${q}, Colombia`,
      `${q}, Bogotá, Colombia`,
    ];
    const base = "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&accept-language=es&countrycodes=co";
    let lastErr = null;
    for (const t of tries) {
      try {
        const resp = await fetch(`${base}&q=${encodeURIComponent(t)}`);
        if (!resp.ok) {
          lastErr = new Error(`Nominatim ${resp.status}`);
          continue;
        }
        const j = await resp.json();
        if (j?.[0]) {
          return [parseFloat(j[0].lat), parseFloat(j[0].lon)];
        }
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("No se pudo geocodificar la dirección");
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!dOrigin || !dDest) {
      setInfo({ distanceKm: 0, durationMin: 0 });
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      if (startMarkerRef.current) { map.removeLayer(startMarkerRef.current); startMarkerRef.current = null; }
      if (endMarkerRef.current) { map.removeLayer(endMarkerRef.current); endMarkerRef.current = null; }
      if (animMarkerRef.current) { map.removeLayer(animMarkerRef.current); animMarkerRef.current = null; }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [o, d] = await Promise.all([
          geocodeColombia(dOrigin),
          geocodeColombia(dDest),
        ]);
        if (cancelled) return;

        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${o[1]},${o[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`;
        const r = await fetch(osrmUrl);
        const jr = await r.json();
        if (cancelled) return;
        if (!jr?.routes?.[0]) throw new Error("No se encontró una ruta entre los puntos");
        const route = jr.routes[0];
        const meters = route.distance || 0;
        const seconds = route.duration || 0;
        const distanceKm = meters / 1000;
        const durationMin = seconds / 60;

        setInfo({ distanceKm, durationMin });
        onDistanceChange && onDistanceChange(distanceKm);

        const coords = route.geometry.coordinates.map(([lng, lat]) => L.latLng(lat, lng));
        if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);
        if (startMarkerRef.current) map.removeLayer(startMarkerRef.current);
        if (endMarkerRef.current) map.removeLayer(endMarkerRef.current);
        if (animMarkerRef.current) { map.removeLayer(animMarkerRef.current); animMarkerRef.current = null; }

        const poly = L.polyline(coords, { color: "#2563eb", weight: 5, opacity: 0.9 }).addTo(map);
        routeLayerRef.current = poly;
        startMarkerRef.current = L.marker(coords[0]).addTo(map).bindTooltip("Inicio", { permanent: false });
        endMarkerRef.current = L.marker(coords[coords.length - 1]).addTo(map).bindTooltip("Destino", { permanent: false });

        map.fitBounds(poly.getBounds(), { padding: [20, 20] });
        animateMarker(coords);
      } catch (e) {
        console.error(e);
        setInfo({ distanceKm: 0, durationMin: 0 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dOrigin, dDest, onDistanceChange]);

  return (
    <div className="pgx-map-container" style={{ width: "100%" }}>
      <div className="pgx-map-controls map-controls">
        <button
          type="button"
          onClick={() => setClickMode(clickMode === 'origin' ? null : 'origin')}
          className={`pgx-map-btn map-control-btn ${clickMode === 'origin' ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faLocationDot} /> Seleccionar Origen
        </button>
        <button
          type="button"
          onClick={() => setClickMode(clickMode === 'destination' ? null : 'destination')}
          className={`pgx-map-btn map-control-btn ${clickMode === 'destination' ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faBullseye} /> Seleccionar Destino
        </button>
      </div>
      <div 
        ref={mapEl}
        className="pgx-map-canvas"
        style={{ height: 460, cursor: clickMode ? 'crosshair' : 'grab' }}
      />
    </div>
  );
}
