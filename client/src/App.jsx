import { useContext } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  ScrollRestoration,
} from "react-router-dom";

// Context
import { AuthContext } from "./context/AuthContext";

// Navbar & Footer
import Navbar from "./components/global/Navbar";
import Footer from "./components/global/Footer";

// Pages ((USER))
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/notFound/NotFound";
import User from "./pages/user/User";

// Pages ((ADMIN))
import Users from "./pages/admin/users/Users";
import ClassNames from "./pages/admin/classNames/ClassNames";
import Attendances from "./pages/admin/attendances/Attendances";

// Dashboard layout
const DashboardLayout = () => {
  return (
    <>
      <Navbar />
      <ScrollRestoration />
      <Outlet />
      <Footer />
    </>
  );
};

// Simple layout for auth pages
const SimpleLayout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

// Protected ((ADMIN))
const AdminRoute = ({ element }) => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser || currentUser?.role !== "ADMIN") {
    return <Navigate to="/" />;
  }

  return element;
};

// Protected ((USER))
const AuthenticatedRoute = ({ element }) => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return element;
};

function App() {
  const { currentUser } = useContext(AuthContext);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        // Authenticated ((USER))
        {
          path: "/",
          element: <AuthenticatedRoute element={<Home />} />,
        },
        {
          path: "/users/:userId",
          element: <AuthenticatedRoute element={<User />} />,
        },

        // Authenticated ((ADMIN ))
        {
          path: "/admin/users",
          element: <AdminRoute element={<Users />} />,
        },
        {
          path: "/admin/class-names",
          element: <AdminRoute element={<ClassNames />} />,
        },
        {
          path: "/admin/class/:className",
          element: <AdminRoute element={<Attendances />} />,
        },
      ],
    },

    {
      path: "/",
      element: <SimpleLayout />,
      children: [
        {
          path: "/login",
          element: !currentUser ? <Login /> : <Navigate to="/" />,
        },
        {
          path: "/register",
          element: !currentUser ? <Register /> : <Navigate to="/" />,
        },

        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
