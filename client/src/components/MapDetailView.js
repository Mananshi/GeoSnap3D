import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BabylonScene from './BabylonScene';
import '../App.css';

const MapDetailView = () => {
    const { id } = useParams();
    const [mapData, setMapData] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:4000/maps/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MWU1ZGE0ZmFjNTM4MTVkODVhZTIwYyIsImlhdCI6MTczMDExNjYyMSwiZXhwIjoxNzMwMjAzMDIxfQ.gNgHYVsKTNx1FtTBRBPBZ7KqHDaJCg0QJNoB1aUsIIk`,
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
                <img src={`http://localhost:4000${mapData.imageId.imageUrl}`} alt="Map" className="map-full" />
                <h3>3D Preview</h3>
                <BabylonScene textureUrl={`http://localhost:4000${mapData.imageId.imageUrl}`} />
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
                            <td>{mapData.northBound}</td>
                        </tr>
                        <tr>
                            <td>South</td>
                            <td>{mapData.southBound}</td>
                        </tr>
                        <tr>
                            <td>East</td>
                            <td>{mapData.eastBound}</td>
                        </tr>
                        <tr>
                            <td>West</td>
                            <td>{mapData.westBound}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MapDetailView;
