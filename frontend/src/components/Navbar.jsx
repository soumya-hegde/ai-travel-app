import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between">
      <h1 className="text-xl font-bold text-blue-600">AI Travel Planner</h1>

      <div className="space-x-4">
        <Link to="/" className="text-gray-600 hover:text-blue-600">
          Home
        </Link>

        {token ? (
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-blue-600"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-blue-600">
              Login
            </Link>

            <Link to="/register" className="text-gray-600 hover:text-blue-600">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
