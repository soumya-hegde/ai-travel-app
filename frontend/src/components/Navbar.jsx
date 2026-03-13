import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between">
      <h1 className="text-xl font-bold text-blue-600">AI Travel Planner</h1>

      <div className="space-x-4">
        <Link to="/" className="text-gray-600 hover:text-blue-600">
          Home
        </Link>

        <Link to="/login" className="text-gray-600 hover:text-blue-600">
          Login
        </Link>

        <Link to="/register" className="text-gray-600 hover:text-blue-600">
          Register
        </Link>
      </div>
    </nav>
  );
}
