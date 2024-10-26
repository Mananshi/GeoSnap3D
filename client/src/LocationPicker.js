import React, { useState, useRef, useEffect } from "react";

import { Map, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import osmProvider from "./osm-provider";
import html2canvas from "html2canvas";

const LocationPicker = () => {
    const [center, setCenter] = useState({ lat: 23.0225, lng: 72.5714 });

    const ZOOM_LEVEL = 12;
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [bounds, setBounds] = useState(null);

    // Update bounds whenever the map's view changes
    const handleMoveEnd = () => {
        const map = mapRef.current;
        if (map) {
            const currentBounds = map.leafletElement.getBounds();
            setBounds({
                north: currentBounds.getNorth(),
                south: currentBounds.getSouth(),
                east: currentBounds.getEast(),
                west: currentBounds.getWest(),
            });
        }
    };

    const handleSaveLocation = () => {
        if (mapContainerRef.current) {
            html2canvas(mapContainerRef.current, { useCORS: true }).then((canvas) => {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "map-location.png";
                link.click();
            });
        }
    };

    useEffect(() => {
        const map = mapRef.current;
        if (map) {
            map.leafletElement.on("moveend", handleMoveEnd);
            handleMoveEnd(); // Set initial bounds
        }
        return () => {
            if (map) {
                map.leafletElement.off("moveend", handleMoveEnd);
            }
        };
    }, []);


    return (
        <div>
            <div ref={mapContainerRef} style={{ height: "500px", width: "100%" }}>
                <Map center={center} zoom={ZOOM_LEVEL} ref={mapRef} style={{ height: "500px", width: "100%" }}>
                    <TileLayer url={osmProvider.maptiler.url} attribution={osmProvider.maptiler.attribution} />
                </Map>
            </div>
            {bounds && (
                <div style={{ marginTop: "10px" }}>
                    <h4>Visible Region:</h4>
                    <p>North: {bounds.north.toFixed(4)}</p>
                    <p>South: {bounds.south.toFixed(4)}</p>
                    <p>East: {bounds.east.toFixed(4)}</p>
                    <p>West: {bounds.west.toFixed(4)}</p>
                </div>
            )}
            <button onClick={handleSaveLocation} >Save Location</button>
        </div>
    );
};

export default LocationPicker;
