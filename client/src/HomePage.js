import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MapViewer from './components/MapViewer';
import './App.css';

const HomePage = () => {
    const [maps, setMaps] = useState([]);
    const [showViewMore, setShowViewMore] = useState(false);
    const token = localStorage.getItem("token");

    const history = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            history.push("/login");
        }
    }, [history]);

    const fetchMaps = () => {
        fetch(`https://geosnap3d.onrender.com/maps`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                setMaps(data.slice(0, 3));
                setShowViewMore(data.length > 3);
            })
            .catch(error => console.error("Error fetching maps:", error));
    };

    useEffect(() => {
        fetchMaps();
    }, []);

    const handleLocationSaved = () => {
        fetchMaps(); // Re-fetch maps data after saving a new location
    };

    return (
        <div className="App">
            <h1>Location Selector</h1>
            <MapViewer onLocationSaved={handleLocationSaved} />

            <h2>My Saved Maps</h2>
            <div className="saved-maps">
                {maps.map((mapData, index) => (
                    <div key={index} className="map-item">
                        <Link to={`/maps/${mapData._id}`}>
                            <img src={`https://geosnap3d.onrender.com${mapData.imageId.imageUrl}`} alt="Saved map preview" className="map-thumbnail" />
                            <p>Map {index + 1}</p>
                        </Link>
                    </div>
                ))}
                {showViewMore && <Link to="/maps" className="view-more-button">View More</Link>}
            </div>

        </div>
    );
};

export default HomePage;
