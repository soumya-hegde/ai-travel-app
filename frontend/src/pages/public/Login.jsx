import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  return (
    <div>
      <button
        onClick={() => navigate("/dashboard")}
        className="bg-blue-600 text-white p-2 w-full"
      >
        Login
      </button>
      <div className="flex justify-between mt-4 text-sm">
        <Link to="/agent/Login">Are you an agent?</Link>
        <Link to="/Register">New User?</Link>
      </div>
    </div>
  );
}
