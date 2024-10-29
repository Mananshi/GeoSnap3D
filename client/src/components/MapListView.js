import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const MapListView = () => {
    const [maps, setMaps] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`http://localhost:4000/maps`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => setMaps(data))
            .catch(error => console.error("Error fetching maps:", error));
    }, []);

    return (
        <div className="App">
            <h1>All Saved Maps</h1>
            <div className="map-list">
                {maps.map((mapData) => (
                    <div key={mapData._id} className="map-item">
                        <Link to={`/maps/${mapData._id}`}>
                            <img src={`http://localhost:4000${mapData.imageId.imageUrl}`} alt="Map preview" className="map-thumbnail" />
                            <p>Map ID: {mapData._id}</p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MapListView;
