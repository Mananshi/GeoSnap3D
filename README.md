# GeoSnap3D

GeoSnap3D is a MERN stack application that allows users to select a location on a map, capture that region as an image, and apply it as a texture to a 3D cuboid using BabylonJS. This project demonstrates a blend of map interactivity, 3D rendering, and backend integration, providing a seamless user experience.

## Table of Contents

- [GeoSnap3D](#geosnap3d)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Installation](#installation)
    - [Image Schema](#image-schema)
    - [MapData Schema](#mapdata-schema)
  - [Caching Strategy](#caching-strategy)
  - [Conclusion](#conclusion)

## Features

- **Map Integration**: Users can choose locations using Google Maps or Mapbox.
- **Image Capture**: A button allows users to capture the visible map region as an image.
- **3D Rendering**: Captured images are applied as textures to a 3D cuboid using BabylonJS.
- **Responsive UI**: The application is designed to be responsive and user-friendly.
- **Data Storage**: Captured images and related map data are saved in a MongoDB database.
- **Top Regions Endpoint**: An API endpoint identifies and returns the top three most frequently captured regions.
- **User Authentication**: JWT-based user authentication for personalized experiences.

## Technologies Used

- **Frontend**: ReactJS, Google Maps API or Mapbox, BabylonJS, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Caching**: Redis (or another preferred caching mechanism)
- **Authentication**: JSON Web Tokens (JWT)

## Installation

To run this project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/GeoSnap3D.git
   cd GeoSnap3D

2. **Backend Setup**:
   1. Navigate to the server directory and install dependencies:
        ```bash
        cd server
        npm install
    2. Set up your MongoDB connection in the `config.js` file.
    3. Create a `.env` file in the server directory with necessary environment variables:
        ```bash
        MONGODB_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret
    4. Start the server:
        ```bash
        npm run start

3. **Frontend Setup**:
   1. Navigate to the client directory and install dependencies:
        ```bash
        cd client
        npm install
    2. Start the React application:
        ```bash
        npm run start

## Usage

1. Access the application at `https://geosnap3d.netlify.app`.
2. Choose a location on the map.
3. Click the capture button to save the visible region as an image.
4. The captured image will be applied as a texture to a 3D cuboid.
5. You can log in or signup to save your captured images and view previously saved captures and your topmost visited regions.

## API Endpoints

### User Authentication

- **POST** `/api/login` - Log in a user.
- **POST** `/api/signup` - Register a new user.

### Map Data

- **POST** `/api/maps/save` - Save the captured image and map data.
- **GET** `/api/maps` - Retrieve saved map data and images.
- - **GET** `/api/maps/:map_id` - Retrieve Individual saved map data and image by ID.
- **GET** `/api/maps/top-regions` - Get the top most frequently captured regions.

## Datbase Schema

### User Schema

```javascript
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
```

### Image Schema

```javascript
const ImageSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});
```


### MapData Schema

```javascript
const MapDataSchema = new mongoose.Schema({
    northBound: { type: Number, required: true },
    southBound: { type: Number, required: true },
    eastBound: { type: Number, required: true },
    westBound: { type: Number, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    region: { type: String, required: true },
    imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

```

## Caching Strategy

To improve performance and reduce database load, a caching mechanism has been implemented using Redis. This strategy allows frequently accessed map data to be stored in memory, providing faster retrieval times compared to querying the database. The caching logic includes:

- Set a cache expiration: Cached data is set to expire after a specific time to ensure freshness.
- Fallback to database: If the requested data is not found in the cache, the application queries the MongoDB database and populates the cache for future requests.
- Invalidate cache on updates: Whenever map data is added, updated, or deleted, the corresponding cache entries are invalidated to maintain data consistency.

## Conclusion

Thank you for exploring GeoSnap 3D! We hope this application enhances your mapping experience by allowing you to capture and visualize your favorite locations in a unique 3D format. Dive into the interactive features and discover the ease of managing your saved maps and regions. For a live experience, feel free to visit our application at [GeoSnap 3D](https://geosnap3d.netlify.app) and to view the APIs directly head to our [Postman Collection](https://singleowner.postman.co/workspace/My-Workspace~34285cc5-63c8-488d-8224-fcea0e825780/collection/24150770-7cc561b3-23ab-4924-959e-9735b7606061?action=share&creator=24150770&active-environment=24150770-e2b5d694-f0ec-4be3-82a2-d2dfcae359e7). You can also check out the demo of this application [here](https://geosnap3d.netlify.app/demo). We look forward to your feedback and hope you enjoy using GeoSnap 3D!
