import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import UserLayout from "../components/layout/UserLayout";
import SellerLayout from "../components/layout/SellerLayout";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";

import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";

import DashboardPage from "../features/dashboard/DashboardPage";
import UsersPage from "../features/users/UsersPage";
import LeadsPage from "../features/leads/LeadsPage";
import ProjectsPage from "../features/projects/ProjectsPage";
import PropertiesPage from "../features/properties/PropertiesPage";
import MediaPage from "../features/media/MediaPage";

import HomePage from "../pages/public/HomePage";
import PublicProjectsPage from "../pages/public/PublicProjectsPage";
import PublicProjectDetailPage from "../pages/public/PublicProjectDetailPage";
import NewsPage from "../pages/public/NewsPage";
import PublicNewsDetailPage from "../pages/public/PublicNewsDetailPage";

import UserHomePage from "../pages/user/UserHomePage";
import UserProfilePage from "../pages/user/UserProfilePage";
import UserBookmarksPage from "../pages/user/UserBookmarksPage";

import SellerDashboardPage from "../pages/seller/SellerDashboardPage";
import SellerLeadsPage from "../pages/seller/SellerLeadsPage";

import AdminNewsPage from "../features/news/AdminNewsPage";

import SellerProjectsPage from "../pages/seller/SellerProjectsPage";
import SellerPropertiesPage from "../pages/seller/SellerPropertiesPage";


import LeadDetailPage from "../features/leads/LeadDetailPage";
import PropertyDetailPage from "../features/properties/PropertyDetailPage";
import ProjectDetailPage from "../features/projects/ProjectDetailPage";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "projects", element: <PublicProjectsPage /> },
      { path: "projects/:slug", element: <PublicProjectDetailPage /> },
      { path: "news", element: <NewsPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "news/:slug", element: <PublicNewsDetailPage /> },
    ],
  },

  {
    path: "/user",
    element: (
      <ProtectedRoute>
        <RoleRoute allowRoles={["customer"]}>
          <UserLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <UserHomePage /> },
      { path: "profile", element: <UserProfilePage /> },
      { path: "bookmarks", element: <UserBookmarksPage /> },
    ],
  },

  {
  path: "/seller",
  element: (
    <ProtectedRoute>
      <RoleRoute allowRoles={["seller"]}>
        <SellerLayout />
      </RoleRoute>
    </ProtectedRoute>
  ),
  children: [
    { path: "dashboard", element: <SellerDashboardPage /> },
    { path: "leads", element: <SellerLeadsPage /> },
    { path: "projects", element: <SellerProjectsPage /> },
    { path: "properties", element: <SellerPropertiesPage /> },
   { path: "projects/:id", element: <ProjectDetailPage /> }, 
{ path: "leads/:id", element: <LeadDetailPage /> },
{ path: "properties/:id", element: <PropertyDetailPage /> },
  ],
},

  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <RoleRoute allowRoles={["admin"]}>
          <AdminLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "leads", element: <LeadsPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "properties", element: <PropertiesPage /> },
      { path: "media", element: <MediaPage /> },
      { path: "news", element: <AdminNewsPage /> },
    ],
  },
]);