import { useRef, useEffect, useContext, useState, useCallback } from "react";
import {
  Home,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

// Context
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const navRef = useRef(null);

  // User Menu
  const baseMenuItems = [
    {
      icon: <Home />,
      label: "Home",
      path: "/",
    },
    // {
    //   icon: <User />,
    //   label: "User",
    //   requiresAuth: true,
    //   submenu: [{ label: "Hotels", path: "/hotels" }],
    // },
  ];

  // Admin menu
  const adminMenuItem = {
    icon: <ShieldCheck />,
    label: "Admin",
    requiresAuth: true,
    requiresRole: "ADMIN",
    submenu: [
      { label: "All Users", path: "/admin/users" },
      { label: "All ClassNames", path: "/admin/class-names" },
    ],
  };

  const handleProtectedRoute = useCallback(
    (path) => {
      if (!currentUser) {
        toast.error("Please login to access this feature");
        navigate("/login");
        return;
      }
      navigate(path);
    },
    [currentUser, navigate]
  );

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setOpenSubmenu(null);
  };

  const toggleSubmenu = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const handleMenuItemClick = (item) => {
    if (item.submenu) {
      toggleSubmenu(item.label);
    } else {
      if (item.requiresAuth && !currentUser) {
        handleProtectedRoute(item.path);
      } else if (item.onClick) {
        item.onClick();
      } else {
        navigate(item.path);
      }
      setIsMobileMenuOpen(false);
      setOpenSubmenu(null);
    }
  };

  const handleSubmenuClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setOpenSubmenu(null);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
        setOpenSubmenu(null);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Filter menu items based on user role
  const getMenuItems = () => {
    const items = [...baseMenuItems];

    if (currentUser?.role === "ADMIN") {
      items.push(adminMenuItem);
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <nav ref={navRef} className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <NavLink to="/" className="text-2xl font-bold text-blue-600">
              Elbasha
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {menuItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.submenu ? (
                  <div>
                    <button
                      className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                      onClick={() => toggleSubmenu(item.label)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openSubmenu === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {/* Desktop Submenu */}
                    <div
                      className={`absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ${
                        openSubmenu === item.label ? "block" : "hidden"
                      } group-hover:block`}
                    >
                      {item.submenu.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                          onClick={() => setOpenSubmenu(null)}
                        >
                          {subItem.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                      }`
                    }
                    onClick={(e) => {
                      if (item.requiresAuth && !currentUser) {
                        e.preventDefault();
                        handleProtectedRoute(item.path);
                      }
                    }}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </NavLink>
                )}
              </div>
            ))}

            {/* Auth Buttons */}
            <div className="ml-4 flex items-center space-x-2">
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <NavLink to={`/users/${currentUser._id}`}>
                    <span className="text-sm text-gray-700">
                      Welcome, {currentUser.firstName || currentUser.lastName}
                    </span>
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="flex items-center space-x-1 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white border-t ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <div>
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    onClick={() => toggleSubmenu(item.label)}
                  >
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openSubmenu === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {/* Mobile Submenu */}
                  {openSubmenu === item.label && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <button
                          key={subItem.path}
                          onClick={() => handleSubmenuClick(subItem.path)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-md"
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md ${
                      isActive
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`
                  }
                  onClick={(e) => {
                    if (item.requiresAuth && !currentUser) {
                      e.preventDefault();
                      handleProtectedRoute(item.path);
                    } else {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              )}
            </div>
          ))}

          {/* Mobile Auth Section */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            {currentUser ? (
              <div className="space-y-2">
                <NavLink to={`/users/${currentUser._id}`}>
                  <div className="px-3 py-2 text-sm text-gray-700">
                    Welcome, {currentUser.firstName || currentUser.lastName}
                  </div>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <NavLink
                  to="/login"
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </NavLink>
                <NavLink
                  to="/register"
                  className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
