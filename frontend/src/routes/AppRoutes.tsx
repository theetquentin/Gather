import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Header } from "../components/Header";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Works } from "../pages/Works";
import { WorkDetail } from "../pages/WorkDetail";
import { Collections } from "../pages/Collections";
import { AllCollections } from "../pages/AllCollections";
import { MyCollections } from "../pages/MyCollections";
import { CollectionDetail } from "../pages/CollectionDetail";
import { Notifications } from "../pages/Notifications";
import { ProfileEdit } from "../pages/ProfileEdit";
import { RoleManagement } from "../pages/RoleManagement";

// Configuration des routes de l'application
export const AppRoutes = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Pendant le chargement, on affiche un message
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="text-slate-700 text-xl"
          role="status"
          aria-live="polite"
        >
          Chargement...
        </div>
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
        <Route path="/works/:id/:slug" element={<WorkDetail />} />
        <Route path="/collections" element={<Collections />} />

        {/* Pages privées - redirigent vers /login si non connecté */}
        {/* <Route
          path="/collections/:id"
          element={isAuthenticated ? <CollectionDetail /> : <Navigate to="/login" />}
        /> */}
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route
          path="/my-collections"
          element={
            isAuthenticated ? <MyCollections /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated ? <Notifications /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/all-collections"
          element={
            isAuthenticated && user && ["admin", "moderator"].includes(user.role) ? (
              <AllCollections />
            ) : (
              <Navigate to="/collections" />
            )
          }
        />
        <Route
          path="/profile/edit"
          element={
            isAuthenticated ? <ProfileEdit /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/admin/roles"
          element={
            isAuthenticated && user && user.role === "admin" ? (
              <RoleManagement />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </div>
  );
};
