import React, { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, StandardMaterial, Texture, Vector3 } from '@babylonjs/core';
import '../App.css';

const BabylonScene = ({ textureUrl }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const engine = new Engine(canvasRef.current, true);
        const scene = new Scene(engine);

        // Create a camera
        const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 5, Vector3.Zero(), scene);
        camera.attachControl(canvasRef.current, true);

        // Create a light
        new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        // Create a box (cuboid)
        const box = MeshBuilder.CreateBox("box", { height: 2, width: 2, depth: 2 }, scene);

        // Create a texture and apply it to the box
        if (textureUrl) {
            const material = new StandardMaterial("material", scene);
            material.diffuseTexture = new Texture(textureUrl, scene);
            box.material = material;
        }

        engine.runRenderLoop(() => {
            scene.render();
        });

        return () => {
            engine.dispose();
        };
    }, [textureUrl]);

    return <canvas ref={canvasRef} style={{ width: "100%", height: "500px" }} />;
};

export default BabylonScene;
