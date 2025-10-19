import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Works } from '../pages/Works';
import { Collections } from '../pages/Collections';
import { MyCollections } from '../pages/MyCollections';

// Configuration des routes de l'application
export const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Pendant le chargement, on affiche un message
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-background">
      <Header />
      <Routes>
        {/* Pages d'authentification (sans Header) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Pages publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/works" element={<Works />} />
        <Route path="/collections" element={<Collections />} />
        
        {/* Page privée - redirige vers /login si non connecté */}
        <Route
          path="/my-collections"
          element={isAuthenticated ? <MyCollections /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
};

