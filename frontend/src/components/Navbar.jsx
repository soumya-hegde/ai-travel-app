import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { logout } from "../slices/authSlice";
import API from "../api/axios";

export default function Navbar() {
  const [username, setUsername] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((state) => state.auth.token);

  const isHomePage = location.pathname === "/";

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/account");
        setUsername(res.data.username || "");
      } catch {
        setUsername("");
      }
    };

    if (token) fetchUser();
  }, [token]);

  const handleLogoClick = () => {
    if (token) navigate("/dashboard/home");
    else navigate("/");
  };

  return (
    <nav className="bg-white/70 backdrop-blur-md shadow-md border-b sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <h1
          onClick={handleLogoClick}
          className="text-xl font-bold text-blue-600 cursor-pointer hover:scale-105 transition"
        >
          AI Travel Planner
        </h1>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          {token && (
            <button
              onClick={() => navigate("/dashboard/home")}
              className="hover:text-blue-600 transition"
            >
              Dashboard
            </button>
          )}

          {isHomePage && (
            <>
              <button
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="hover:text-blue-600 transition"
              >
                About
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="hover:text-blue-600 transition"
              >
                Contact
              </button>
            </>
          )}

          {token && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:scale-105 transition"
              >
                <span className="text-sm font-semibold">
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white shadow-lg">
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/dashboard/profile");
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
