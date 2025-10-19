import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';

// Placeholder components - will be implemented in user stories
const LoginPage = () => <div>Login Page (TODO)</div>;
const SignupPage = () => <div>Signup Page (TODO)</div>;
const Dashboard = () => <div>Dashboard (TODO)</div>;
const AlbumView = () => <div>Album View (TODO)</div>;
const ProfilePage = () => <div>Profile Page (TODO)</div>;
const GalleryPage = () => <div>Gallery Page (TODO)</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/gallery" element={<GalleryPage />} />

        {/* Protected routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/albums/:albumId" element={<AlbumView />} />
        <Route path="/profile/:username" element={<ProfilePage />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
