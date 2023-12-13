"use client";
import { useCallback, useRef, useState } from "react";
import { Map, Source, Layer } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl";

export default function MapComponent() {
  // initial coordinates and zoom
  const lon = -94.54098998290928;
  const lat = 15.475171581011853;
  const initialZoom = 8;
  const sourceId = "places";
  const circleLayerId = "circles";
  const symbolLayerId = "symbols";
  const visibility = "visibility";
  const circleRadius = "circle-radius";
  // I suspect that this is where I am presumably wrong.
  // I assume that 'maplibregl' type Map is the same as 'react-map-gl/maplibre' Map component ref={mapRef}
  // This is where I try to declare my mapRef following answer
  // from here https://stackoverflow.com/questions/68368898/typescript-type-for-mapboxgljs-react-ref-hook
  // const mapRef = useRef<maplibregl.Map | null>(null);
  //
  // trying other approach, still same error, but now it is clear that those methods do not exist from intellisense
  const mapRef = useRef<MapRef>(null);

  const [viewport, setViewport] = useState({
    latitude: lat,
    longitude: lon,
    zoom: initialZoom,
    bearing: 0,
    pitch: 0,
  });

  const onMapLoad = useCallback(() => {
    // make our map draggable
    if (mapRef && mapRef.current) {
      mapRef.current.on("move", (evt) => {
        setViewport({ ...evt.viewState });
      });
    }
  }, []);

  const flyToCoordinates = useCallback(
    (longitude: number, latitude: number) => {
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        duration: 2000,
        zoom: initialZoom,
      });
    },
    []
  );

  const handleVisibility = (layer_id: string, checked: boolean) => {
    console.log(
      'Trying to read layout visibility with getLayoutProperty("' +
        layer_id +
        '", "visibility"):',
      mapRef.current?.getLayoutProperty(layer_id, visibility)
    );

    // fails with method not defined
    // mapRef.current?.setPaintProperty(layer_id, "circle-radius", 0);
    //fails with method not defined
    mapRef.current?.setLayoutProperty(
      layer_id,
      visibility,
      checked ? "visible" : "none"
    );
  };

  const handleRadius = (layer_id: string, radius: number) => {
    console.log(
      'Trying to read "circle-radius" with getLayoutProperty("' +
        layer_id +
        '", "circle-radius"):',
      mapRef.current?.getPaintProperty(layer_id, circleRadius)
    );

    // fails with method not defined
    mapRef.current?.setPaintProperty(layer_id, circleRadius, radius);
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          display: "flex",
          zIndex: 100,
          width: "90%",
          justifyContent: "space-between",
          padding: 10,
        }}
      >
        <ul>
          <li>
            <span>
              <button onClick={(e) => flyToCoordinates(lon, lat)}>
                Fly to Initial Coordinates
              </button>
            </span>
          </li>
          <li>
            <span>
              <button
                onClick={(e) => {
                  console.log(mapRef.current);
                }}
              >
                log mapRef.current
              </button>
            </span>
          </li>
          <li>
            <span>
              <button
                onClick={(e) => {
                  console.log(
                    "SO FAR, mapRef.current.getStyle():",
                    mapRef.current?.getStyle()
                  );
                }}
              >
                log map style
              </button>
            </span>
          </li>
          <li>
            <span>
              <button
                onClick={(e) => {
                  console.log(
                    'SO FAR, mapRef.current.getLayer("' + circleLayerId + '"):',
                    mapRef.current?.getLayer(circleLayerId)
                  );
                }}
              >
                log map layer
              </button>
            </span>
          </li>
          <br />
          <li>
            <span>
              <button
                onClick={(e) => {
                  handleVisibility(symbolLayerId, false);
                }}
              >
                Hide "Symbols" using visibility
              </button>
            </span>
          </li>
          <li>
            <span>
              <button
                onClick={(e) => {
                  handleVisibility(circleLayerId, false);
                }}
              >
                Hide "Circles" using visibility
              </button>
            </span>
          </li>
          <li>
            <span>
              <button onClick={(e) => handleRadius(circleLayerId, 0)}>
                Scale "Circles" radius to 0
              </button>
            </span>
          </li>
        </ul>
      </div>

      <Map
        reuseMaps
        {...viewport}
        ref={mapRef}
        style={{ width: "100vw", height: "100vh", display: "flex" }}
        mapStyle={
          "https://api.maptiler.com/maps/basic-v2/style.json?key=zUpp6oZWatSi4rP4q5Cs"
          // for some reason, the same layers that shows normaly with the above style, do not show up with demotiles
          // "https://demotiles.maplibre.org/style.json"
        }
        // disable map rotation using right click + drag
        dragRotate={false}
        // disable map rotation using touch rotation gesture
        touchZoomRotate={false}
        // initialize callbacks
        onLoad={onMapLoad}
      >
        <Source
          id={sourceId}
          type="geojson"
          maxzoom={15}
          data="https://maplibre.org/maplibre-gl-js/docs/assets/earthquakes.geojson"
        >
          <Layer
            {...{
              source: sourceId,
              id: circleLayerId,
              type: "circle",
              paint: {
                "circle-color": "#ff0000",
                "circle-radius": 12,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#000",
              },
              layout: {
                visibility: "visible",
              },
            }}
          />
          <Layer
            {...{
              id: symbolLayerId,
              type: "symbol",
              source: sourceId,
              layout: {
                visibility: "visible",
                "text-allow-overlap": true,
                "text-font": ["Arial Italic"],
                "text-field": ["get", "mag"],
                "text-size": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  // zoom is 5 (or less)
                  5,
                  12,
                  // zoom is 10 (or greater)
                  10,
                  11,
                ],
                "text-anchor": "center",
                // "text-offset": [0, -2],
              },
            }}
          />
        </Source>
      </Map>
    </>
  );
}
