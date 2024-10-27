import React, { useState, useRef, useEffect } from "react";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import osmProvider from "./osm-provider";
import html2canvas from "html2canvas";
// import * as BABYLON from "@babylonjs/core";
// import "@babylonjs/loaders";
// import "@babylonjs/materials";

const LocationPicker = () => {
    const [center, setCenter] = useState({ lat: 23.0225, lng: 72.5714 });

    const ZOOM_LEVEL = 12;
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    // const babylonCanvasRef = useRef(null); // Reference to BabylonJS canvas
    const [bounds, setBounds] = useState(null);
    // const [texture, setTexture] = useState(null); // State for storing the texture

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
                // const imageUrl = canvas.toDataURL("image/png");
                // setTexture(imageUrl); // Set the captured image as the texture
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

    // useEffect(() => {
    //     // Initialize BabylonJS scene only after texture is set
    //     if (texture && babylonCanvasRef.current) {
    //         const engine = new BABYLON.Engine(babylonCanvasRef.current, true);
    //         const scene = new BABYLON.Scene(engine);
    //         const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 4, BABYLON.Vector3.Zero(), scene);
    //         camera.attachControl(babylonCanvasRef.current, true);
    //         const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

    //         // Create a box (cuboid)
    //         const box = BABYLON.MeshBuilder.CreateBox("box", { height: 2, width: 2, depth: 2 }, scene);
    //         const material = new BABYLON.StandardMaterial("textureMaterial", scene);

    //         // Apply the texture
    //         material.diffuseTexture = new BABYLON.Texture(texture, scene);
    //         box.material = material;

    //         engine.runRenderLoop(() => {
    //             scene.render();
    //         });

    //         return () => engine.dispose();
    //     }
    // }, [texture]);


    return (
        <div>
            <div ref={mapContainerRef} style={{ height: "500px", width: "100%" }}>
                <MapContainer center={center} zoom={ZOOM_LEVEL} ref={mapRef} style={{ height: "500px", width: "100%" }}>
                    <TileLayer url={osmProvider.maptiler.url} attribution={osmProvider.maptiler.attribution} />
                </MapContainer>
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
            {/* <canvas ref={babylonCanvasRef} style={{ width: "100%", height: "500px", marginTop: "20px" }} /> */}
        </div>
    );
};

export default LocationPicker;
