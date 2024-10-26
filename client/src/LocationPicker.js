import React, { useState } from "react";

import { Map, TileLayer, withLeaflet } from "react-leaflet";
import { useRef } from "react";
import "leaflet/dist/leaflet.css";
import PrintControlDefault from "react-leaflet-easyprint";
import osmProvider from "./osm-provider";
import html2canvas from "html2canvas";
const PrintControl = withLeaflet(PrintControlDefault);

const LocationPicker = () => {
    const [center, setCenter] = useState({ lat: 23.0225, lng: 72.5714 });

    const ZOOM_LEVEL = 12;
    const mapRef = useRef();
    const mapContainerRef = useRef(null);
    const printControlRef = useRef();

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


    return (
        <div>
            <div ref={mapContainerRef} style={{ height: "500px", width: "100%" }}>
                <Map center={center} zoom={ZOOM_LEVEL} ref={mapRef} style={{ height: "500px", width: "100%" }}>
                    <TileLayer url={osmProvider.maptiler.url} attribution={osmProvider.maptiler.attribution} />
                </Map>
            </div>
            <button onClick={handleSaveLocation} >Save Location</button>
        </div>
    );
};

export default LocationPicker;
