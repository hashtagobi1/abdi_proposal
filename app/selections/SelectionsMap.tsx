"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Map, {
  GeolocateControl,
  Layer,
  MapLayerMouseEvent,
  MapRef,
  NavigationControl,
  Source,
} from "react-map-gl/maplibre";
import type { GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { SelectionEvent, colorFor, hasLocation } from "./data";

type Props = {
  events: SelectionEvent[];
  selected?: SelectionEvent;
  onSelect: (slug: string) => void;
  // Space covered by overlays (mobile bottom sheet), so the selected pin
  // is centred in the part of the map that is actually visible.
  bottomPadding: number;
  theme: "dark" | "light";
};

const MAP_STYLES = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  light: "https://tiles.openfreemap.org/styles/positron",
};
const LONDON_VIEW = { longitude: -0.1, latitude: 51.515, zoom: 10.6 };

export default function SelectionsMap({
  events,
  selected,
  onSelect,
  bottomPadding,
  theme,
}: Props) {
  const ink = theme === "dark" ? "#FFFFFF" : "#111111";
  const mapRef = useRef<MapRef>(null);
  const [cursor, setCursor] = React.useState<string>("");
  const [loaded, setLoaded] = React.useState(false);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: events.filter(hasLocation).map((e) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [e.lng!, e.lat!] },
        properties: { slug: e.slug, color: colorFor(e.category) },
      })),
    }),
    [events]
  );

  // When the filters change (and nothing is open), zoom to fit what's shown.
  useEffect(() => {
    const map = mapRef.current;
    if (!loaded || !map || selected) return;
    const placed = events.filter(hasLocation);
    if (!placed.length) return;
    const lngs = placed.map((e) => e.lng!);
    const lats = placed.map((e) => e.lat!);
    // flyTo's padding sticks to the map; clear it or fitBounds adds the two
    // together, runs out of room on a phone, and silently does nothing.
    map.getMap().setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      {
        padding: { top: 50, bottom: bottomPadding + 30, left: 40, right: 60 },
        maxZoom: 14,
        duration: 700,
      }
    );
    // Only re-fit when the set of events changes, not when the sheet moves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, loaded]);

  useEffect(() => {
    if (!loaded || !selected || !hasLocation(selected)) return;
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [selected.lng!, selected.lat!],
      zoom: Math.max(map.getZoom(), 14),
      padding: { top: 40, bottom: bottomPadding, left: 0, right: 0 },
      duration: 900,
    });
  }, [selected, bottomPadding, loaded]);

  const handleClick = async (e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature) return;
    if (feature.layer.id === "clusters") {
      const source = mapRef.current?.getSource("events") as
        | GeoJSONSource
        | undefined;
      if (!source) return;
      const zoom = await source.getClusterExpansionZoom(
        feature.properties.cluster_id
      );
      const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
      mapRef.current?.easeTo({ center: [lng, lat], zoom, duration: 500 });
    } else if (feature.properties?.slug) {
      onSelect(feature.properties.slug);
    }
  };

  return (
    <Map
      ref={mapRef}
      initialViewState={LONDON_VIEW}
      mapStyle={MAP_STYLES[theme]}
      style={{ width: "100%", height: "100%" }}
      interactiveLayerIds={["clusters", "points"]}
      onClick={handleClick}
      onLoad={() => setLoaded(true)}
      onMouseEnter={() => setCursor("pointer")}
      onMouseLeave={() => setCursor("")}
      cursor={cursor}
      attributionControl={true}
      dragRotate={false}
      touchPitch={false}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <GeolocateControl position="top-right" />
      <Source
        id="events"
        type="geojson"
        data={geojson}
        cluster
        clusterRadius={42}
        clusterMaxZoom={14}
      >
        <Layer
          id="clusters"
          type="circle"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": "#D8592C",
            "circle-opacity": 0.92,
            "circle-stroke-color": theme === "dark" ? "#EEE97E" : "#111111",
            "circle-stroke-width": 2,
            "circle-radius": ["step", ["get", "point_count"], 16, 5, 20, 12, 26],
          }}
        />
        <Layer
          id="cluster-count"
          type="symbol"
          filter={["has", "point_count"]}
          layout={{
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Noto Sans Regular"],
            "text-size": 14,
          }}
          paint={{ "text-color": "#000000" }}
        />
        <Layer
          id="points"
          type="circle"
          filter={["!", ["has", "point_count"]]}
          paint={{
            "circle-color": ["get", "color"],
            // Bigger than they look necessary: these are tap targets.
            "circle-radius": 9,
            "circle-stroke-color": "#000000",
            "circle-stroke-width": 2,
          }}
        />
        <Layer
          id="selected"
          type="circle"
          filter={["==", ["get", "slug"], selected?.slug ?? ""]}
          paint={{
            "circle-color": "rgba(0,0,0,0)",
            "circle-radius": 15,
            "circle-stroke-color": ink,
            "circle-stroke-width": 3,
          }}
        />
      </Source>
    </Map>
  );
}
