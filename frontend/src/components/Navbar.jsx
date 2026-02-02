import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex gap-4 p-4 shadow">
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
}
