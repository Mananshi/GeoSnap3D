import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import "leaflet/dist/leaflet.css";
import '../App.css';
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import osmProvider from "../utils/MapUtil";
import BabylonScene from './BabylonScene';

const MapViewer = ({ onLocationSaved }) => {
    const [center, setCenter] = useState({ lat: 23.0225, lng: 72.5714 });
    const ZOOM_LEVEL = 12;
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [bounds, setBounds] = useState(null);
    const [texture, setTexture] = useState(null);

    const token = localStorage.getItem("token");

    const MapBoundsTracker = () => {
        const map = useMap();

        useEffect(() => {
            const updateBounds = () => {
                const currentBounds = map.getBounds();
                setBounds({
                    north: currentBounds.getNorth(),
                    south: currentBounds.getSouth(),
                    east: currentBounds.getEast(),
                    west: currentBounds.getWest(),
                });
            };

            map.on("moveend", updateBounds);
            updateBounds();

            return () => {
                map.off("moveend", updateBounds);
            };
        }, [map]);

        return null;
    };

    const handleSaveLocation = () => {
        if (mapContainerRef.current && bounds) {
            html2canvas(mapContainerRef.current, { useCORS: true }).then((canvas) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const imageUrl = URL.createObjectURL(blob);
                        setTexture(imageUrl);

                        const formData = new FormData();
                        formData.append("northBound", bounds.north.toFixed(4));
                        formData.append("southBound", bounds.south.toFixed(4));
                        formData.append("eastBound", bounds.east.toFixed(4));
                        formData.append("westBound", bounds.west.toFixed(4));
                        formData.append("image", blob, "map-location.png");

                        fetch("http://localhost:4000/save", {
                            method: "POST",
                            body: formData,
                            headers: {
                                "Authorization": `Bearer ${token}`,
                            },
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                console.log("Response from server:", data);
                                if (onLocationSaved) onLocationSaved(); // Trigger re-fetch of saved maps
                            })
                            .catch((error) => {
                                console.error("Error:", error);
                            });
                    }
                }, "image/png");
            });
        }
    };

    return (
        <div>
            <div ref={mapContainerRef} style={{ height: "500px", width: "100%" }}>
                <MapContainer center={center} zoom={ZOOM_LEVEL} ref={mapRef} style={{ height: "500px", width: "100%" }} >
                    <TileLayer url={osmProvider.maptiler.url} attribution={osmProvider.maptiler.attribution} />
                    <MapBoundsTracker />
                </MapContainer>
            </div>
            {bounds && (
                <div style={{ marginTop: "10px" }}>
                    <h4>Coordinates</h4>
                    <table className="bounds-table">
                        <thead>
                            <tr>
                                <th>Boundary</th>
                                <th>Latitude / Longitude</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>North</td>
                                <td>{bounds.north.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td>South</td>
                                <td>{bounds.south.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td>East</td>
                                <td>{bounds.east.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td>West</td>
                                <td>{bounds.west.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            <button onClick={handleSaveLocation} style={{ marginTop: "10px", marginBottom: "10px" }}>Save Location</button>
            {texture && <BabylonScene textureUrl={texture} />}
        </div>
    );
};

export default MapViewer;