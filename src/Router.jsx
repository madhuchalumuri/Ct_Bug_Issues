import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import SignUp from './components/SignUp';

function Router() {
  const [user, setUser] = useState(null); // State to hold user information

 

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/signup"
          element={<SignUp  />}
        />
        <Route
          path="/login"
          element={<LoginPage  />}
        />
        <Route
          path="/admin"
          element={
             <AdminDashboard /> 
          }
        />
        <Route
          path="/user/:username"
          element={
            <UserDashboard /> 
          }
        />
        <Route path="/" element={ <SignUp /> } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
