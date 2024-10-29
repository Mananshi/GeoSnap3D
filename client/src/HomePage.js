import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MapViewer from './components/MapViewer';
import './App.css';

const HomePage = ({ onLogout }) => {
    const [maps, setMaps] = useState([]);
    const [showViewMore, setShowViewMore] = useState(false);
    const [topRegions, setTopRegions] = useState([]);
    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            fetchTopRegions();
        } else {
            fetchMaps();
            fetchUserTopRegions();
        }
    }, [isLoggedIn]);

    const fetchMaps = () => {
        fetch(`http://localhost:4000/maps`, {
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

    const fetchTopRegions = () => {
        fetch('http://localhost:4000/maps/top-regions')
            .then(response => response.json())
            .then(data => setTopRegions(data))
            .catch(error => console.error("Error fetching top regions:", error));
    };

    const fetchUserTopRegions = () => {
        fetch('http://localhost:4000/maps/top-regions', {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
            .then(response => response.json())
            .then(data => setTopRegions(data))
            .catch(error => console.error("Error fetching user top regions:", error));
    };


    const handleLocationSaved = () => {
        fetchMaps(); // Re-fetch maps data after saving a new location
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="App">
            <header className="header">
                <h1>GeoSnap 3D</h1>
                {isLoggedIn ? (
                    <button onClick={onLogout} className="logout-button">
                        Logout
                    </button>
                ) : (<button onClick={handleLoginClick} className="logout-button">
                    Login
                </button>)}
            </header>
            <main>
                <MapViewer onLocationSaved={handleLocationSaved} topRegions={topRegions}
                    isLoggedIn={isLoggedIn}
                    onRedirectToLogin={() => navigate('/login')} />

                {isLoggedIn ? (
                    <>
                        <h2>My Saved Maps</h2>
                        <div className="saved-maps">
                            {maps.map((mapData, index) => (
                                <div key={index} className="map-item">
                                    <Link to={`/maps/${mapData._id}`}>
                                        <img src={`http://localhost:4000${mapData.imageId.imageUrl}`} alt="Saved map preview" className="map-thumbnail" />
                                        <p>Map {index + 1}</p>
                                    </Link>
                                </div>
                            ))}
                            {showViewMore && <Link to="/maps" className="view-more-button">View More</Link>}
                        </div>

                        <div style={{ marginTop: "10px" }}>
                            <h4>Your Top Most Visited Regions</h4>
                            <table className="bounds-table">
                                <thead>
                                    <tr>
                                        <th>Region</th>
                                        <th>Visits</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topRegions.map((region, index) => (
                                        <tr key={index}>
                                            <td>{region._id}</td>
                                            <td>{region.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </>
                ) : (
                    <>
                        <div style={{ marginTop: "10px" }}>
                            <h4>Top Most Visited Regions</h4>
                            <table className="bounds-table">
                                <thead>
                                    <tr>
                                        <th>Region</th>
                                        <th>Visits</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topRegions.map((region, index) => (
                                        <tr key={index}>
                                            <td>{region._id}</td>
                                            <td>{region.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </>
                )}
            </main>


        </div>
    );
};

export default HomePage;
