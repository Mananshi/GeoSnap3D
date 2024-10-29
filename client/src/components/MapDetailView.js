import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BabylonScene from './BabylonScene';
import '../App.css';

const MapDetailView = () => {
    const { id } = useParams();
    const [mapData, setMapData] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`https://geosnap3d.onrender.com/maps/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => setMapData(data))
            .catch(error => console.error("Error fetching map details:", error));
    }, [id]);

    if (!mapData) {
        return <p>Loading map details...</p>;
    }

    return (
        <div className="App">
            <h1>Map Details</h1>
            <div className="map-detail-view">
                <img src={`https://geosnap3d.onrender.com${mapData.imageId.imageUrl}`} alt="Map" className="map-full" />
                <h3>3D Preview</h3>
                <BabylonScene textureUrl={`https://geosnap3d.onrender.com${mapData.imageId.imageUrl}`} />
                <h4>Coordinates</h4>
                <table className="bounds-table">
                    <thead>
                        <tr>
                            <th>Property</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>North Bound</td>
                            <td>{mapData.northBound}</td>
                        </tr>
                        <tr>
                            <td>South Bound</td>
                            <td>{mapData.southBound}</td>
                        </tr>
                        <tr>
                            <td>East Bound</td>
                            <td>{mapData.eastBound}</td>
                        </tr>
                        <tr>
                            <td>West Bound</td>
                            <td>{mapData.westBound}</td>
                        </tr>
                        <tr>
                            <td>Center Latitude</td>
                            <td>{mapData.latitude}</td>
                        </tr>
                        <tr>
                            <td>Center Longitude</td>
                            <td>{mapData.longitude}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MapDetailView;
