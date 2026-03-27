import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { logout } from "../slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // FIX: Added 'role' to the destructuring here
  const { token, user, role } = useSelector((state) => state.auth);

  const isHomePage = location.pathname === "/";
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password";

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // This function now has access to 'role'
  const handleLogoClick = () => {
    if (token) {
      if (role === "agent") navigate("/agent-dashboard/home");
      else navigate("/dashboard/home");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const username = user?.username || "";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/60 border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <h1
          onClick={handleLogoClick}
          className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent cursor-pointer tracking-wide hover:scale-105 transition"
        >
          AI Travel Planner
        </h1>

        {/* NAV ITEMS */}
        <div className="flex items-center gap-6 text-sm font-medium">
          {/* Dashboard Link - Updated logic to handle different roles */}
          {token && !isAuthPage && (
            <button
              onClick={handleLogoClick}
              className="relative text-gray-700 hover:text-blue-600 transition after:block after:h-[2px] after:bg-blue-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              Dashboard
            </button>
          )}

          {/* About + Contact (only on landing page) */}
          {isHomePage && !isAuthPage && (
            <>
              <button
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-gray-700 hover:text-blue-600 transition"
              >
                About
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Contact
              </button>
            </>
          )}

          {/* LOGIN BUTTON */}
          {!token && !isAuthPage && (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md hover:scale-105 hover:shadow-lg transition"
            >
              Login
            </button>
          )}

          {/* PROFILE DROPDOWN */}
          {token && !isAuthPage && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md hover:scale-110 transition"
              >
                <span className="font-semibold">
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </span>
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-44 rounded-xl bg-white shadow-xl border overflow-hidden animate-fadeIn">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-sm font-semibold text-gray-800">
                      {username || "User"}
                    </p>
                    <p className="text-[10px] uppercase text-blue-600 font-bold">
                      {role}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setOpen(false);
                      const profilePath =
                        role === "agent"
                          ? "/agent-dashboard/profile"
                          : "/dashboard/profile";
                      navigate(profilePath);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                  >
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
