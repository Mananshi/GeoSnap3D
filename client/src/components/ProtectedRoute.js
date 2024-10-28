import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated }) => {
    if (isAuthenticated) {
        return <Outlet />;
    }

    return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
