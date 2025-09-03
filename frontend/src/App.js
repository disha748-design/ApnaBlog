import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import EditorAll from "./Components/EditorAll";
import LandingPage from "./LandingPage";
import HomePage from "./HomePage";
import CreatePost from "./Components/CreatePost";
import SinglePost from "./Components/SinglePost";
import EditPost from "./Components/EditPost";
import UserProfile from "./Components/UserProfile";
import AboutPage from "./Components/AboutPage";
import HelpPage from "./Components/HelpPage";
import TermsPage from "./Components/TermsPage";
import ReaderCommunity from "./Components/ReaderCommunity";
import ContactPage from "./Components/ContactPage";
import AdminDashboard from "./Components/AdminDashboard";
import AdminLogin from "./Components/AdminLogin";
import EditorDashboard from "./Components/EditorDashboard";
import EditorEditPost from "./Components/EditorEditPost";

// Protected route for logged-in users
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/" replace />; // not logged in

  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase())) {
    // logged in but role not allowed
    return <Navigate to="/home" replace />;
  }

  return children;
};


// Role-based route


function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/posts/:id" element={<SinglePost />} />
        
        <Route
  path="/home"
  element={
    <ProtectedRoute allowedRoles={["User", "Editor"]}>
      <HomePage />
    </ProtectedRoute>
  }
/>
        <Route
  path="/editor-dashboard"
  element={
    <ProtectedRoute allowedRoles={["Editor"]}>
      <EditorDashboard />
    </ProtectedRoute>
  }
/>



        {/* Create Post */}
        <Route
          path="/create-post"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />

        {/* Single Post */}
        <Route path="/post/:id" element={<SinglePost />} />

        
        <Route path="/edit-post/:id" element={<EditPost />} />


        {/* User Profile */}
        <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  }
/>


        {/* Static Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/reader-community" element={<ReaderCommunity />} />

        {/* Admin Login */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/editor-edit/:id" element={<EditorEditPost />} />


        {/* Admin Dashboard */}
  <Route
    path="/admin-dashboard"
    element={
      <ProtectedRoute allowedRoles={["Admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />
       {/* Editor All Posts */}
<Route path="/editor-all" element={<EditorAll />} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
